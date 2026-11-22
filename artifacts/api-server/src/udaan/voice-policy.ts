import { createHash, timingSafeEqual } from "node:crypto";
export const voiceModel = { stt: "saaras:v4", tts: "bulbul:v4-flash" } as const;
// Verified in Sarvam's current official v4 voice catalog, not v3 speaker names.
export const voiceLanguages = {
  en: { code: "en-IN", mode: "transcribe", speaker: "simran_en_customer" },
  hinglish: { code: "hi-IN", mode: "codemix", speaker: "ishita_enhi_companion" },
  hi: { code: "hi-IN", mode: "transcribe", speaker: "aayan_hi_conversational" },
  kn: { code: "kn-IN", mode: "transcribe", speaker: "chaitra_kn_conversation" },
} as const;
export function passwordMatches(candidate: string, expected: string) {
  if (expected.length < 12) return false;
  return timingSafeEqual(createHash("sha256").update(candidate).digest(), createHash("sha256").update(expected).digest());
}
export function waveDuration(wav: Buffer) {
  const valid = wav.length >= 364 && wav.length <= 320044
    && wav.toString("ascii", 0, 4) === "RIFF" && wav.toString("ascii", 8, 12) === "WAVE"
    && wav.toString("ascii", 12, 16) === "fmt " && wav.readUInt32LE(16) === 16
    && wav.readUInt16LE(20) === 1 && wav.readUInt16LE(22) === 1
    && wav.readUInt32LE(24) === 16000 && wav.readUInt32LE(28) === 32000
    && wav.readUInt16LE(32) === 2 && wav.readUInt16LE(34) === 16
    && wav.toString("ascii", 36, 40) === "data" && wav.readUInt32LE(40) === wav.length - 44;
  if (!valid) throw Object.assign(new Error("Record a 0.01–10 second, mono 16 kHz PCM WAV in the Voice Lab."), { status: 400 });
  return (wav.length - 44) / 32000;
}
export function estimateVoicePaise(operation: "stt" | "tts", quantity: number) {
  // Public PAYG prices, conservative round-up, excluding GST; not an invoice reconciliation.
  return Math.ceil(operation === "stt" ? quantity * 49 / 60 : quantity * 200 / 1000);
}
export function providerFailure(status: number) {
  if (status === 402) return "Sarvam credits exhausted (402). No automatic retry. Text chat remains available.";
  if (status === 429) return "Sarvam rate limit reached (429). Wait before explicitly retrying.";
  if (status === 401 || status === 403) return "Sarvam rejected authentication or access. Check Replit Secrets and account entitlement.";
  if (status === 400 || status === 422) return "Sarvam rejected the request format or model/voice selection. No fallback model was substituted.";
  return "Sarvam provider request failed. No automatic retry; text chat and browser voice remain available.";
}
