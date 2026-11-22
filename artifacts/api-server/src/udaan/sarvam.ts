import { z } from "zod";
import type { VoiceRequest } from "@prisma/client";
import { prisma } from "./db";
import { voiceLanguages, voiceModel, estimateVoicePaise, providerFailure, waveDuration } from "./voice-policy";
import type { Language } from "./content";

export function voiceOperation(row: VoiceRequest) {
  return { id: row.id, operation: row.operation, model: row.model, status: row.status,
    latencyMs: row.latencyMs, estimatedCostInr: row.estimatedCostPaise / 100, createdAt: row.createdAt.toISOString(),
    ...(row.speaker ? { speaker: row.speaker } : {}),
    ...(row.inputCharacters != null ? { inputCharacters: row.inputCharacters } : {}),
    ...(row.inputSeconds != null ? { inputSeconds: row.inputSeconds } : {}),
    ...(row.requestId ? { requestId: row.requestId } : {}),
    ...(row.error ? { error: row.error } : {}),
    ...(row.httpStatus != null ? { httpStatus: row.httpStatus } : {}) };
}
let busy = false;
let lastStarted = 0;
export function voiceBusy() { return busy; }
export async function sarvamRequest(operation: "stt" | "tts", language: Language, payload: Buffer | string) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw Object.assign(new Error("SARVAM_API_KEY is not configured. Add it in Replit Secrets, then refresh status."), { status: 503 });
  if (busy) throw Object.assign(new Error("A speech request is already processing."), { status: 429 });
  if (Date.now() - lastStarted < 2000) throw Object.assign(new Error("Please wait two seconds between speech requests."), { status: 429 });
  const selected = voiceLanguages[language];
  const quantity = operation === "stt" ? waveDuration(payload as Buffer) : [...payload as string].length;
  if (operation === "tts" && (quantity < 1 || quantity > 1000)) throw Object.assign(new Error("Use 1–1,000 characters for this bounded speech test."), { status: 400 });
  busy = true;
  let row: VoiceRequest | undefined;
  let started = 0;
  try {
    const config = await prisma.voiceLabConfig.upsert({ where: { id: "singleton" }, create: {}, update: {} });
    const used = await prisma.voiceRequest.count();
    if (!config.paidEnabled) throw Object.assign(new Error("Speech spending is disabled. Explicit admin credit authorization is required."), { status: 403 });
    if (used >= config.maxRequests) throw Object.assign(new Error("The authorized speech-attempt cap is exhausted. No provider request was made."), { status: 429 });
    row = await prisma.voiceRequest.create({ data: {
      operation, model: voiceModel[operation], ...(operation === "tts" ? { speaker: selected.speaker, inputCharacters: quantity } : { inputSeconds: quantity }),
      estimatedCostPaise: estimateVoicePaise(operation, quantity),
    } });
    let body: FormData | string;
    const headers: Record<string, string> = { "api-subscription-key": key, Accept: "application/json" };
    if (operation === "stt") {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(payload as Buffer)], { type: "audio/wav" }), "udaan-voice.wav");
      form.append("model", voiceModel.stt);
      form.append("language_code", selected.code);
      form.append("mode", selected.mode);
      form.append("keyterms", JSON.stringify(["restaurant", "customers", "sales", "combo", "Udaan", "Whitefield"]));
      body = form;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ text: payload, language_code: selected.code, model: voiceModel.tts, speaker: selected.speaker,
        speech_sample_rate: 22050, output_audio_codec: "wav", pace: 0.95 });
    }
    started = performance.now(); lastStarted = Date.now();
    const response = await fetch(`https://api.sarvam.ai/${operation === "stt" ? "speech-to-text" : "text-to-speech"}`,
      { method: "POST", headers, body, signal: AbortSignal.timeout(25000) });
    const latencyMs = Math.round(performance.now() - started);
    if (!response.ok) {
      const safe = providerFailure(response.status);
      await prisma.voiceRequest.update({ where: { id: row.id }, data: { status: "error", latencyMs, error: safe, httpStatus: response.status } });
      // Do not expose raw provider bodies; they can include request content or credential diagnostics.
      throw Object.assign(new Error(safe), { status: [400, 401, 403, 422].includes(response.status) ? 502 : response.status, alreadyRecorded: true });
    }
    const result: unknown = await response.json();
    let output: { transcript?: string; audioBase64?: string; audioMime?: string };
    let requestId: string | undefined;
    if (operation === "stt") {
      const parsed = z.object({ transcript: z.string().min(1).max(4000), request_id: z.string().max(200).nullish() }).parse(result);
      output = { transcript: parsed.transcript }; requestId = parsed.request_id ?? undefined;
    } else {
      const parsed = z.object({ audios: z.array(z.string().min(20).max(6000000)).length(1), request_id: z.string().max(200).nullish() }).parse(result);
      const audio = Buffer.from(parsed.audios[0], "base64");
      if (audio.length < 44 || audio.toString("ascii", 0, 4) !== "RIFF" || audio.toString("ascii", 8, 12) !== "WAVE") throw new Error("Invalid audio response");
      output = { audioBase64: parsed.audios[0], audioMime: "audio/wav" }; requestId = parsed.request_id ?? undefined;
    }
    const saved = await prisma.voiceRequest.update({ where: { id: row.id }, data: { status: "connected", latencyMs, requestId, httpStatus: response.status } });
    // Audio and transcript are returned transiently. Neither is stored in this audit table.
    return { ...voiceOperation(saved), ...output };
  } catch (error) {
    const e = error as { status?: number; alreadyRecorded?: boolean; name?: string; message?: string };
    if (row && !e.alreadyRecorded) {
      const message = e.name === "TimeoutError" || e.name === "AbortError" ? "Sarvam timed out. No automatic retry." : "Sarvam returned an invalid response or a network error. No synthetic transcript/audio was substituted.";
      await prisma.voiceRequest.update({ where: { id: row.id }, data: { status: "error", latencyMs: started ? Math.round(performance.now() - started) : 0, error: message } });
      throw Object.assign(new Error(message), { status: 502 });
    }
    throw error;
  } finally { busy = false; }
}
