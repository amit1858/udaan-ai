# Sarvam narration: successful authorized provider switch

The user explicitly switched from Gnani to Sarvam and approved **one full
Bulbul v3 / Shubh / en-IN request, capped at Rs5 of existing credits**, with no
retry, top-up or upgrade. That request succeeded on 24 November 2026.
It does not authorize another request. Gnani's two exhausted attempts remain
separate and unchanged; neither produced narration.

## Official documentation

Verified sources:

- [REST text-to-speech](https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/rest-api):
  `POST https://api.sarvam.ai/text-to-speech`, `api-subscription-key` header,
  single `text` field, JSON `audios` containing base64 audio. This is not the
  older `inputs` array or Gnani's binary response format.
- [Pricing](https://docs.sarvam.ai/api/getting-started/pricing) and
  [current pricing page](https://www.sarvam.ai/api-pricing):
  Bulbul v3 is Rs3 per 1,000 characters, excluding GST.
- [Commercial licensing](https://docs.sarvam.ai/api/getting-started/commercial-licensing):
  commercial use of output generated on one's own credit-consuming account,
  including eligible free credits, is permitted without a separate production
  tier, subject to the applicable terms. This is post-production narration,
  **not a Sarvam integration in the Udaan application**.

The approved 1,024-character script has a published-rate estimate of
**Rs3.072 excluding GST**. Actual account debit/invoice was not returned or
independently verified. No purchase, recharge or infrastructure provisioning
occurred. The approval's Rs5 credit ceiling must not be described as an invoice.

## Actual request and preserved output

Model `bulbul:v3`, speaker `shubh`, language `en-IN`, pace 1, pitch 0,
loudness 1, sample rate 48,000, WAV codec, preprocessing disabled.
The genuine response passed base64, RIFF, PCM, duration and signal validation:

- Mono 48 kHz, 16-bit PCM; **59.232 seconds**, 5,686,316 bytes.
- WAV SHA-256:
  `0cb92cb6af5732292be91b7cf15b5063f2eecb5257c0937f95e01017f144c7e7`.
- Private original: `sarvam-voice-01\narration.wav`.
- Receipt: `sarvam-voice-01\voice-usage.json`, one validated request, zero retries,
  credential deleted. Original WAV remains unchanged by editing.

The separate provider-qualified Windows credential was removed after execution.
No key was printed, put in chat/arguments, written to `.env`, or bundled.

## Reusable integration and private console

`scripts\generate-sarvam-narration.py` is an actual official-REST adapter.
Default/dry-run mode never reads a key or calls the provider. Execution requires
an exact-text/model/voice/cost approval and a new external output directory.
It rejects redirects, validates TLS, makes one request without retries, checks
the exact response shape and WAV, preserves valid audio before quality checks,
and records sanitized HTTP/transport/format failures and credential cleanup.
Seven labeled offline fixture tests make no real API requests.

Safe, no-call inspection:

```powershell
python marketing\product-demo-video\scripts\generate-sarvam-narration.py `
  --input marketing\product-demo-video\narration-draft.txt `
  --output 'C:\private\new-sarvam-output' --dry-run
```

For a **future separately authorized request only**, the operator can run this
reviewed helper in a private native console outside app tool/input history:

```powershell
python marketing\product-demo-video\scripts\gnani-credential.py `
  --provider sarvam --target 'udaan-product-demo-video:YOUR-SESSION-ID:sarvam'
```

The legacy filename is shared; `--provider sarvam` is mandatory for that target.
Console input uses non-echoing `getpass` and fatally rejects fallback. The
optional `--dialog` opens a separate masked Windows dialog supporting paste;
it is not an app terminal canvas. An app terminal is not represented as a
verified private raw-input channel. No real key is needed again for this video.
Native buffers are cleared and temporary credentials deleted; immutable Python
strings cannot be guaranteed securely erased in place.
