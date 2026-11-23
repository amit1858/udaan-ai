# Gnani.ai narration research and approval gates

Official public sources checked **23 November 2026**. The original Stage 1
no-call research and approval proposal below are historical. Later the user
authorized account-credit use, commercial sharing and autonomous narration.
One sample synthesis attempt stopped without a saved WAV; its original
HTTP/billing outcome was not retained. No retry or successful audio generation
is claimed. Current operational evidence is in PRODUCTION_STATUS.md.

`generate-narration-workflow.py` supports that task-specific authorization,
defaults to no-call, and reads only the scoped temporary Windows credential.
Its `--previous-attempt` continuation accepts the exact single failed sample
ledger and permits only the remaining full-text attempt, within two cumulative
synthesis attempts. Eight labeled offline tests cover no-call defaults, text
gates, two-call completion, safe failure/cleanup, pacing, preserved returned WAV
and the one-remaining-attempt continuation, including distinct safe HTTP/TLS/
format and missing-credential diagnostics. No test fixture is narration.

`gnani-credential.py --dialog` opens a separate masked Windows input dialog
supporting paste into Password. It does not ask for a Windows login password
or make an API call. The task-specific credential is encrypted by Windows for
the logon session and deleted after execution. No terminal canvas is advertised
as a certified private input channel; Python string erasure is not guaranteed.
The corrected password buffer respects the native credential-dialog limit.

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

## Offline preparation and gated reusable generator

`scripts/prepare-voiceover.py` builds an offline review JSON using only the
confirmed endpoint/fields. It validates a documented English model/voice pair,
requires nonempty narration and exclusively creates the requested output.
It intentionally has **no HTTP transport, execute flag, credential loading or
audio-generation claim**, so Stage 1 cannot accidentally spend.

Three focused offline tests cover the selected payload, mismatched model/voice
and empty text. This remains the no-transport Stage 1 preparer.

The independent local-preparation follow-up added
`scripts/generate-voiceover.py`, reusing that documented payload builder.
It implements the actual REST integration, but **no API request or credential
collection has occurred**. Twelve labeled offline-fixture tests cover no-call
defaults, approval gates, non-TTY/fallback rejection, strict binary WAV parsing,
official request/auth fields, redirection refusal, sanitized HTTP failures,
one-attempt behavior and output preservation. Test silence is generated only
in memory/temporary test files, not used as narration or product evidence.

The generator defaults to JSON preparation on stdout. It does not read an
approval file, prompt for a key, call a provider, or create audio in that mode:

```powershell
python marketing\product-demo-video\scripts\generate-voiceover.py --input marketing\product-demo-video\sample.txt --output C:\private\udaan-audio\sample.wav --dry-run
python marketing\product-demo-video\scripts\test-generate-voiceover.py
```

Execution requires `--execute` and a separately reviewed **nonsecret approval
JSON** matching stage, SHA-256 of the trimmed UTF-8 text, exact model and voice.
Rights, voice selection and verified/bounded account billing must be explicitly
true; a finite nonnegative decimal monetary cap, currency and review reference
are mandatory. Exactly one request is authorized per invocation; full narration
also requires `sample_approved:true`.

This disabled example is **not approval** and must not be used to invent a cap:

```json
{
  "stage": "sample",
  "text_sha256": "2b866ace96edf4a7d6ba21164f0221da60c55963654408f02be44d8c694c6196",
  "model": "timbre-v2.5",
  "voice": "Shlok",
  "rights_confirmed": false,
  "voice_selection_approved": false,
  "billing_verified_and_bounded": false,
  "max_requests": 1,
  "max_cost": "REPLACE_ONLY_AFTER_BILLING_VERIFICATION",
  "currency": "INR",
  "approval_reference": "PENDING - NOT APPROVED"
}
```

**The script cannot impose a monetary cap on the provider account.** Those
fields attest to independently reviewed account rates/credits/overage and an
effective provider-side billing bound. Do not set them true without that
verification. Audio-duration checks occur after the request and cannot prevent
a charge. Changing output paths does not authorize more requests; reconcile
remaining budget and obtain any required new approval first.

Only after those gates, the operator can run the reviewed script in their own
**private native Windows console**, outside app tools/input history, with no
terminal transcript or screen recording. Create the private audio directory
first. The conditional invocation is:

```powershell
python marketing\product-demo-video\scripts\generate-voiceover.py --input marketing\product-demo-video\sample.txt --output C:\private\udaan-audio\sample.wav --stage sample --voice Shlok --approval C:\private\udaan-approvals\sample.json --execute
```

No key appears in that command. The script accepts a key only through interactive
`getpass`; it requires stdin/stderr TTYs and treats `GetPassWarning` as fatal.
It does not accept a key flag, read a key file, or use an environment key.
An inherited `GNANI_API_KEY` is removed from this process on execution.
No `.env` or credential file is written. The operator must independently review
console privacy; fixture tests and TTY checks do not certify it.

The transport uses the fixed official HTTPS endpoint, JSON and `X-API-Key-ID`,
normal certificate validation, a 30-second timeout and **no retry**. It disables
inherited proxy routing and rejects redirects. Errors expose only sanitized
categories/status, never headers, keys or provider bodies. HTTP 200 must contain
`audio/wav`, consistent RIFF/header/frame lengths, nonempty mono 48kHz 16-bit PCM
and <=10 seconds for the sample or <=75 seconds for full narration.
Eight MiB bounds response reading. Unsuitable duration/audio is a failure, not
a reason for automatic synthesis.

The new WAV path and `<output>.attempt.json` must not exist. The latter is
exclusively created before dispatch with text/model/voice/approval metadata and
`actual_cost:"unknown"`. It remains after failure to prevent accidental retries
to the same path. Existence does not prove the request reached the provider.
Validated audio is atomically published without replacing an existing file;
successful metadata adds audio SHA-256, duration, bytes, frames and elapsed
request latency. It contains no key. A timeout, failed validation or output error
may still have incurred a charge; stop and reconcile privately.

The request headers and key references are cleared in `finally`. Python cannot
guarantee erasure of immutable strings, so process exit and appropriate scoped
key revocation remain important. After an approved sample is generated, verify
playability/5-10-second pacing, share only under cleared rights, and **stop for
listening approval**. Full narration needs a separate matching approval JSON,
`stage:"full"`, `sample_approved:true`, and a distinct output path.

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
3. The current generator keeps the privately entered key in process memory
   only; it deliberately does not accept environment injection or key files.
   Do not use `setx`, persist it in a profile, ask for a secret-store export, or
   put it in browser code. Do not create a credential file for convenience.
4. No terminal recording, shell transcript, verbose HTTP/debugging, crash dump
   or screen recording during provisioning. Start product recording separately.
5. In `finally`, remove any process environment value and references; process
   exit ends temporary state. Python cannot guarantee cryptographic erasure of
   immutable strings, so do not promise it. Revoke a temporary scoped key via
   the operator's provider account when appropriate.

If terminal input/privacy cannot be verified, stop: the operator can run the
reviewed generator privately in their own trusted native console. An approved
secret-manager integration would require separate review; it is not implemented
here. Do not request a key in chat as a fallback. Neither Stage 1 nor the later
offline fixture tests verified a real console's input/transcript privacy.

No automatic switch to Sarvam/browser TTS. Provider unavailability or unsuitable
sample must be reported for a new decision.
