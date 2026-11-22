/**
 * Explicitly paid, creator-invoked verification only; never a startup task.
 * Credentials are consumed in this server-side process, never printed or written.
 * Uses an isolated fictional visitor and real HTTP routes, not a separate AI brain.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import assert from "node:assert/strict";
import { prisma } from "./db";
import { z } from "zod";
import { GetUdaanStateResponse, GetVoiceLabStatusResponse, TestVoiceLabConnectionResponse,
  SynthesizeVoiceResponse, TranscribeVoiceResponse, SendChatResponse, GetConversationResponse } from "@workspace/api-zod";
const base = "http://localhost:80/api/udaan";
const jar = new Map<string, string>();
const out = path.resolve("../../generated-artifacts/voice-verification");
const evidence: Record<string, unknown> = { startedAt: new Date().toISOString(), sourceAudio: "Sarvam-generated Hinglish test phrase, NOT a human microphone recording", preGstCeilingInr: 10, actualInvoiceCost: "Not available; estimates only" };
async function request(route: string, body?: unknown, method = "POST", binary = false) {
  const response = await fetch(base + route, { method, headers: {
    Cookie: [...jar.values()].join("; "), ...(body !== undefined ? { "Content-Type": binary ? "application/octet-stream" : "application/json" } : {}),
  }, ...(body !== undefined ? { body: binary ? new Uint8Array(body as Buffer) : JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000) });
  for (const cookie of response.headers.getSetCookie()) {
    const first = cookie.split(";")[0]; jar.set(first.split("=")[0], first);
  }
  const result: unknown = await response.json();
  if (!response.ok) {
    const safe = z.object({ error: z.string().optional() }).safeParse(result);
    throw Object.assign(new Error(safe.data?.error ?? "Verification request failed"), { route, status: response.status });
  }
  return result;
}
const wait = () => new Promise((r) => setTimeout(r, 2100));
const safeOperation = (op: Record<string, unknown>) => Object.fromEntries(Object.entries(op).filter(([key]) => !["audioBase64", "audioMime"].includes(key)));
try {
  if (process.argv[2] !== "--approved-10-inr") throw new Error("Explicit paid-test approval flag is required.");
  if (!process.env.SARVAM_API_KEY || !process.env.VOICE_LAB_ADMIN_PASSWORD || !process.env.ANTHROPIC_API_KEY) throw new Error("Required Replit Secrets are not configured.");
  // One-shot test budget: never reset earlier usage or silently expand an existing test batch.
  assert.equal(await prisma.voiceRequest.count(), 0, "Prior speech attempts exist; review them before authorizing another paid batch.");
  await mkdir(out, { recursive: true });
  GetUdaanStateResponse.parse(await request("/state", undefined, "GET"));
  evidence.visitorId = "Isolated cookie-scoped test visitor";
  await request("/voice-lab/login", { password: process.env.VOICE_LAB_ADMIN_PASSWORD });
  const status = GetVoiceLabStatusResponse.parse(await request("/voice-lab/status", undefined, "GET"));
  assert.equal(status.access, "admin");
  assert.equal(status.configured, true);
  evidence.adminAuthentication = "Real HTTP login; signed HttpOnly cookie; no credential in evidence";
  await request("/preferences", { provider: "anthropic", language: "hinglish", onboarded: true }, "PATCH");
  const authorization = GetVoiceLabStatusResponse.parse(await request("/voice-lab/authorization", { enabled: true, maxRequests: 4, confirmed: true, creditCoverageConfirmed: true }, "PATCH"));
  assert.equal(authorization.usedRequests, 0);
  evidence.authorization = { maxAttempts: 4, maximumPossiblePreGstInr: 8, approval: "User approved paid testing in chat" };
  const connection = TestVoiceLabConnectionResponse.parse(await request("/voice-lab/test", { confirmed: true }));
  evidence.connection = safeOperation(connection);
  assert.equal(connection.status, "connected");
  await wait();
  const phrase = "मेरे restaurant में weekdays पर customers कम आ रहे हैं। मैं क्या कर सकता हूँ?";
  const inputSpeech = SynthesizeVoiceResponse.parse(await request("/voice-lab/synthesize", { text: phrase, language: "hinglish", confirmed: true }));
  evidence.inputSpeech = safeOperation(inputSpeech);
  const source = path.join(out, "hinglish-generated-input.wav");
  const recording = path.join(out, "hinglish-16khz-test.wav");
  assert.ok(inputSpeech.audioBase64);
  await writeFile(source, Buffer.from(inputSpeech.audioBase64, "base64"));
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", source, "-t", "10", "-ac", "1", "-ar", "16000",
    "-c:a", "pcm_s16le", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-map_metadata", "-1", recording], { timeout: 10000, stdio: "ignore" });
  await wait();
  const transcript = TranscribeVoiceResponse.parse(await request("/voice-lab/transcribe?language=hinglish&confirmed=true", await readFile(recording), "POST", true));
  evidence.transcription = safeOperation(transcript);
  assert.ok(transcript.transcript && transcript.transcript.length > 5);
  const reply = SendChatResponse.parse(await request("/chat", { message: transcript.transcript, voice: true }));
  evidence.reasoning = { provider: reply.provider, content: reply.content, speechText: reply.speechText, source: "Existing authenticated Udaan chat route and persistent business context" };
  assert.equal(reply.provider, "anthropic");
  const speechText = String(reply.speechText ?? reply.content);
  assert.ok([...speechText].length <= 1000, "Reasoning speech text must fit the approved speech request.");
  await wait();
  const outputSpeech = SynthesizeVoiceResponse.parse(await request("/voice-lab/synthesize", { text: speechText, language: "hinglish", confirmed: true }));
  evidence.outputSpeech = safeOperation(outputSpeech);
  assert.ok(outputSpeech.audioBase64);
  await writeFile(path.join(out, "udaan-hinglish-response.wav"), Buffer.from(outputSpeech.audioBase64, "base64"));
  const conversation = GetConversationResponse.parse(await request("/conversation", undefined, "GET"));
  evidence.persistedConversation = conversation.length;
  const final = GetVoiceLabStatusResponse.parse(await request("/voice-lab/status", undefined, "GET"));
  assert.equal(final.usedRequests, 4);
  evidence.usage = { attempts: final.usedRequests, conservativeEstimatedPreGstInr: final.estimatedCostInr, requests: final.requests };
  assert.ok(final.estimatedCostInr <= 10);
  evidence.completed = true;
} catch (error) {
  const safe = error as { message?: string; route?: string; status?: number };
  evidence.completed = false; evidence.failure = { message: safe.message, route: safe.route, httpStatus: safe.status };
  process.exitCode = 1;
} finally {
  // Disarm after this bounded batch, even after failure. Do not erase attempt records.
  await prisma.voiceLabConfig.updateMany({ data: { paidEnabled: false } });
  try { await request("/voice-lab/logout", {}); } catch { /* cookie only lived in this process */ }
  evidence.endedAt = new Date().toISOString();
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, "verification.json"), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
  await prisma.$disconnect();
}
