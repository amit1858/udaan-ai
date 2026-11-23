# Gnani.ai narration research and approval gates

Official public sources checked **23 November 2026**. No Gnani account login,
key provisioning, API request, voice generation or charge occurred.

## Confirmed official transport

| Requirement | Finding / selected proposal |
| --- | --- |
| API | `POST https://api.vachana.ai/api/v1/tts/inference` |
| Authentication | `X-API-Key-ID` header; JSON request `Content-Type: application/json` |
| Required fields | `text`, `voice`, `model`, `language`; use documented exact model/voice pairing |
| Proposed candidate | `timbre-v2.5`, `Shlok`, `en-IN`, `speed:1.0`; warm conversational English catalog entry, not a listening-quality claim |
| Other v2.5 English choices | Kaveri, Trupti, Devika, Pranav, Girish; no speculative voice names |
| v3 alternative, not selected | `timbre-v3.0`; English recommendations Arko, Mahendra, Priyasharm, Sohini, Sunaina; not interchangeable with v2.5 voices |
| Selected audio config | `sample_rate:48000, num_channels:1, sample_width:2, encoding:"linear_pcm", container:"wav"` |
| Success | HTTP 200 **binary audio**, not JSON/base64; WAV `audio/wav` |
| Other formats | MP3 `audio/mpeg`, OGG Opus `audio/ogg`, raw PCM; mu-law/A-law force 8kHz and are unsuitable for this narration |
| MP3 options | 32k/64k/96k/128k/192k bitrate; WAV preferred as edit master |
| Sample rates | 8000, 16000, 22050, 24000, 44100, 48000 |
| Speed | v2.5 0.85-1.15; v3 discrete 0.8/1.0/1.2. Start at 1.0; do not assume arbitrary v3 speeds |
| Limits | Account-dependent active-request limit; official 429 example allows only one active request. No universal TTS RPM, maximum text length or per-request duration established |
| Errors | 400 invalid model/voice/parameters, 401 missing/invalid key, 403 scope, 429 rate limit; 402 insufficient-credit shape explicitly unverified in docs; unexpected 500 possible |

Use the REST guide and model-specific catalog, not marketing-page snippets
alone. Marketing pages also show `vachana-voice-v3`, a different voice shortlist
and SSE examples, while current REST docs say `timbre-v2.5`/`timbre-v3.0`.
Normalization guide says numerals are automatically handled and shows short
locale codes, while REST still advises spoken numbers and uses `en-IN`.
For this project use **REST-documented en-IN plus spoken-number words** and
sample first; do not silently substitute models, locale codes or voice names.
Do not use SSML/phonemes based only on the broad introduction.

## Official citations

1. [Speech API introduction / base URL / key guidance](https://docs.gnani.ai/api/introduction/introduction)
2. [TTS REST endpoint, schema, audio, response and errors](https://docs.gnani.ai/api/TTS/tts-inference)
3. [Model-specific voice catalogs and English recommendations](https://docs.gnani.ai/api/TTS/available-voices)
4. [Speech API authentication and rate-limit errors](https://docs.gnani.ai/api/introduction/errors)
5. [Normalization and input formatting](https://docs.gnani.ai/api/TTS/tts-input-formating)
6. [Official TTS page: advertised 500 free minutes](https://www.gnani.ai/text-to-speech)
7. [English product page / voice descriptions](https://www.gnani.ai/text-to-speech/english)
8. [Other official marketing API example](https://www.gnani.ai/text-to-speech-api)
9. [Public pricing URL](https://www.gnani.ai/pricing) redirected to
   [book-demo](https://www.gnani.ai/book-demo), not a public numeric TTS tariff.
10. [Public EULA](https://www.gnani.ai/legal/eula), particularly grant,
    payment, restrictions and intellectual-property sections.
11. [Official documentation index](https://docs.gnani.ai/llms.txt)

## Pricing and usage: no invented rupee cap

The public TTS page advertises **500 free TTS minutes, no card needed**.
This does not prove this account has credits, that API/model usage qualifies,
how duration is rounded, when credits expire, or that commercial export is
included. No publicly verified paid TTS unit price, minimum charge, tax,
credit conversion or automatic-overage policy was found in the cited pages.

Planned minimum: **two requests total**, never concurrent:

| Gate | Text | Expected audio / request count |
| --- | --- | --- |
| Voice sample | `sample.txt`: 109 characters, 18 words | One 5-10 second sample; then stop for listening approval |
| Full narration | `narration-draft.txt`: 1,024 characters, 142 words | One approximately 59-63 second spoken master; must fit 60-75 second final edit with pauses/CTA |

For approval planning, bound the intended output to at most **10 + 75 = 85
audio seconds**, about **1.42 unrounded minutes**, and two requests. That is a
usage proposal, **not billable minutes or an enforceable financial ceiling**:
per-request minute rounding could change billing, and actual audio duration is
known only after generation. Input totals here exclude any future script edits.

Before any synthesis the operator must confirm privately from the actual
account or provider: eligible free credits, currency and paid rate, billing
unit/rounding/minimums, taxes, auto-top-up/overage and available quota. Then
approve a **numeric monetary cap** and maximum attempts for the sample.
If confirmed eligible free credit is used, propose zero paid spend only after
the account is demonstrably prevented from billing overage; do not presume it.
If rate/overage cannot be bounded, do not call. Request-count limits alone
cannot guarantee a money cap.

A failed or timed-out request may still consume credit. Zero automatic retries,
no background jobs and no surprise extra pronunciation takes. Reconcile usage
privately before any retry; a new request needs remaining authorized budget
and explicit approval if outside the agreed attempts. Full narration requires
separate approval after the sample, even if its cost fits the earlier estimate.

## Commercial use and distribution uncertainty

API/marketing docs advertise ads, brand, narration and similar use cases, but
do not establish generated-audio ownership, perpetual commercial publication
rights, attribution duties, free-tier restrictions or redistribution in a public
source repository. Do not equate marketing use cases with a legal grant.

The public EULA grants a conditional nonexclusive/nontransferable product
license. It reserves product IP and includes third-party demonstration and
performance/quality-disclosure restrictions (4.2(f)/(g)). Its applicability to
current hosted Speech API/output is unclear. **Do not conclude it definitively
prohibits generated narration, or that narration is unrestricted.**

Obtain applicable API/account terms or written provider confirmation for:
commercial LinkedIn video, public MP4/download redistribution, voice-sample
sharing, inclusion of approved WAV in the source delivery, required credits,
rights after account expiry and any restrictions relevant to a CC BY-SA
photographic video composition. Do not place the Gnani logo in the video as
an endorsement. Stop before sample generation/sharing if rights remain unclear.

## Safe integration prepared now

`scripts/prepare-voiceover.py` builds an offline review JSON using only the
confirmed endpoint/fields. It validates a documented English model/voice pair,
requires nonempty narration and exclusively creates the requested output.
It intentionally has **no HTTP transport, execute flag, credential loading or
audio-generation claim**, so Stage 1 cannot accidentally spend.

Three focused offline tests cover the selected payload, mismatched model/voice
and empty text. This is safe preparation, not the completed reusable generator
required in Stage 3.

After cost/rights approval, extend or add a generator under this marketing
folder only:

- Securely read a TTS-scoped key from a verified operator terminal or approved
  secret store; never accept it as a CLI argument or read a committed `.env`.
- Use one REST request, TLS validation, explicit timeout and **no retry**.
  Fail closed on redirects rather than forward the key to another host.
- Validate HTTP success, allowed binary content type, WAV signature/nonempty
  frames; save via a local temporary audio file and atomic rename, preserving
  approved outputs instead of overwriting them.
- Do not print request headers, key, provider error bodies or raw exceptions
  that could contain secrets. Report sanitized HTTP status/category and
  output duration/bytes/latency; errors are failures, never placeholder audio.
- Record attempt count before dispatch, narration hash/model/voice/format,
  approved budget reference and reported usage where available. Do not
  invent actual costs if billing data is absent.
- Verify a 5-10-second playable sample, share only after rights clearance,
  report actual elapsed latency (not streaming marketing claims), then stop.
- After voice approval, generate once from the approved script, then clean
  credentials and reconcile sample + final usage.

## Secure provisioning feasibility, not provisioning

A native terminal canvas is available and supports operator interaction; its
schema was inspected, but no key prompt was opened. **A masked field alone does
not prove host transcript/input privacy.** Before requesting a real key:

1. Verify a real interactive TTY using a dummy, nonsecret input. Python
   `getpass.getpass` is suitable only when non-echoing input works; make
   `GetPassWarning` fatal and refuse noninteractive/fallback echo.
2. Prefer direct user entry into that trusted terminal, never agent
   `send_terminal_input`, a shell command, chat or copied command argument.
   The captured PowerShell execution tool is not a secure input interface.
3. Keep the key in the generator process memory, or inject `GNANI_API_KEY`
   for that process only from an already approved secret store. Do not use
   `setx`, persist it in a profile, ask for a secret-store export, or put it in
   browser code. Do not create a credential file for convenience.
4. No terminal recording, shell transcript, verbose HTTP/debugging, crash dump
   or screen recording during provisioning. Start product recording separately.
5. In `finally`, remove any process environment value and references; process
   exit ends temporary state. Python cannot guarantee cryptographic erasure of
   immutable strings, so do not promise it. Revoke a temporary scoped key via
   the operator's provider account when appropriate.

If terminal input/privacy cannot be verified, stop: the operator can run the
reviewed generator privately in their own trusted terminal or inject the key
via an approved secret manager. Do not request it in chat as a fallback.
No actual terminal/secret-store privacy or key injection was tested in Stage 1.

No automatic switch to Sarvam/browser TTS. Provider unavailability or unsuitable
sample must be reported for a new decision.
