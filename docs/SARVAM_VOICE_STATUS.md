# Sarvam Voice Lab — verified API integration, bounded scope

## Actual execution
On 2026-11-22, an isolated fictional visitor completed real HTTP admin authentication, then:

| Operation | Model / persona | HTTP | Provider-request latency |
|---|---|---|---|
| Minimal English connection synthesis | `bulbul:v4-flash` / `simran_en_customer` | 200 | 511 ms |
| Generated Hinglish test phrase | `bulbul:v4-flash` / `ishita_enhi_companion` | 200 | 1,133 ms |
| Transcribe generated 5.458-second PCM WAV | `saaras:v4`, `codemix` | 200 | 419 ms |
| Speak actual Udaan/Anthropic reply | `bulbul:v4-flash` / `ishita_enhi_companion` | 200 | 4,018 ms |

The existing `/api/udaan/chat` route supplied saved restaurant context and returned an actual Anthropic reply. Two conversation messages persisted. STT preserved English `restaurant`, `week days` and `customers` alongside Devanagari Hindi. No separate speech brain was added.

**Input was generated speech, not a human microphone recording.** Request latency is not microphone-to-playback latency or a pronunciation-quality score.

Conservative speech estimate: **₹1.27 before GST**, calculated from published PAYG rates. This is not reconciled account billing or proof that a specific credit balance was consumed. Four attempts were recorded; the paid switch was disarmed after the run, including failure cleanup. No paid retest is authorized.

## Access and configuration
Settings → Integrations → Sarvam Voice Lab exists only as a development tool. A separate `VOICE_LAB_ADMIN_PASSWORD` of at least 12 characters and `SESSION_SECRET` protect signed HttpOnly, visitor-bound, expiring/revocable admin sessions.

Configure `SARVAM_API_KEY` only in Replit Secrets. No key entry or key-saving endpoint exists in the app. Public visitors cannot access speech-spending controls, credential status or request history. Production API refuses Lab access.

Recording is bounded to ten seconds; transcripts are editable and never automatically submitted. TTS has a 1,000-character cap. Playback/replay uses returned audio without another call. Each provider operation needs confirmation, a configured key and an authorized remaining attempt. API bodies are not cached; the audit table contains no audio/transcript.

## Scope and unverified items
- Main-chat voice is deliberately unchanged and remains browser-based.
- Human microphone capture, real listening/pronunciation review, physical iPhone/Android behavior and Hindi/Kannada live speech have not been verified.
- The Lab offers all four language mappings; UI availability is not evidence of four-language live speech validation.
- Normal Demo Mode and text journeys remain independent of Sarvam availability.

Official references: [STT](https://docs.sarvam.ai/api-reference/speech-to-text/transcribe), [TTS](https://docs.sarvam.ai/api-reference/text-to-speech/convert), [v4 voices](https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/voices), [pricing](https://docs.sarvam.ai/api/getting-started/pricing).
