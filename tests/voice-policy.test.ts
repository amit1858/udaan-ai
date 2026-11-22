import { describe, expect, it } from "vitest";
import { passwordMatches, voiceLanguages, voiceModel, waveDuration, estimateVoicePaise, providerFailure } from "../artifacts/api-server/src/udaan/voice-policy";
import { samplesToWav } from "../artifacts/udaan-ai/src/lib/voice-audio";
describe("Sarvam safety and exact client/server audio contract", () => {
  it("uses only the requested documented model versions", () => {
    expect(voiceModel).toEqual({ stt: "saaras:v4", tts: "bulbul:v4-flash" });
  });
  it("preserves code-mixed English via the documented mode", () => {
    expect(voiceLanguages.hinglish).toMatchObject({ code: "hi-IN", mode: "codemix", speaker: "ishita_enhi_companion" });
    expect(voiceLanguages.kn).toMatchObject({ code: "kn-IN", speaker: "chaitra_kn_conversation" });
    expect(voiceLanguages.en.code).toBe("en-IN");
    expect(voiceLanguages.hi.code).toBe("hi-IN");
  });
  it("creates a valid ten-second mono 16kHz PCM WAV and validates it server-side", () => {
    const buffer = Buffer.from(samplesToWav(new Float32Array(160000)));
    expect(buffer.length).toBe(320044);
    expect(waveDuration(buffer)).toBe(10);
  });
  it("caps recording data at ten seconds even if stop scheduling is delayed", () => {
    expect(waveDuration(Buffer.from(samplesToWav(new Float32Array(320000))))).toBe(10);
  });
  it("rejects empty, malformed and unbounded audio", () => {
    expect(() => samplesToWav(new Float32Array(0))).toThrow();
    expect(() => waveDuration(Buffer.alloc(100))).toThrow();
    expect(() => waveDuration(Buffer.alloc(320046))).toThrow();
    const stereo = Buffer.from(samplesToWav(new Float32Array(16000)));
    stereo.writeUInt16LE(2, 22);
    expect(() => waveDuration(stereo)).toThrow();
  });
  it("checks admin passwords without accepting short or incorrect values", () => {
    expect(passwordMatches("fixture-password-only", "fixture-password-only")).toBe(true);
    expect(passwordMatches("wrong", "fixture-password-only")).toBe(false);
    expect(passwordMatches("short", "short")).toBe(false);
  });
  it("estimates conservatively, separately from actual billing", () => {
    expect(estimateVoicePaise("stt", 10)).toBe(9);
    expect(estimateVoicePaise("tts", 1000)).toBe(200);
    expect(estimateVoicePaise("tts", 6)).toBe(2);
  });
  it("distinguishes exhausted credits, throttling and auth errors", () => {
    expect(providerFailure(402)).toContain("credits exhausted");
    expect(providerFailure(429)).toContain("rate limit");
    expect(providerFailure(403)).toContain("authentication");
    expect(providerFailure(400)).toContain("model/voice");
  });
});
