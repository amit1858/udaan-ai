# Sarvam voice — Voice Lab implemented, live verification pending

## Updated scope and authorization
The user extended feature work to 15:30 IST and requested a protected internal Voice Lab before completing main-chat voice integration. That Lab and dormant server adapters are now implemented. The earlier freeze decision below records history, not the current work window.

The user has now authorized paid testing; the agent selected an initial ₹10 pre-GST ceiling. Secure credentials remain absent at this checkpoint, and no Sarvam provider call has been made.

Use Settings → Integrations → Sarvam Voice Lab. Configure `SARVAM_API_KEY` and a separate `VOICE_LAB_ADMIN_PASSWORD` (at least 12 characters) through Replit Secrets. Never paste keys in chat. The application never saves API keys in browser storage or the database.

Current server-controlled documented speakers: English `simran_en_customer`, Hinglish `ishita_enhi_companion`, Hindi `aayan_hi_conversational`, Kannada `chaitra_kn_conversation`.

The full main Ask screen remains unchanged until speech quality is verified. The Lab reuses the existing conversation service, profile, market context and financial rules.

## Decision at the competition feature freeze
The voice addendum arrived at approximately 14:33 IST on 2026-11-22. The agreed feature freeze is 14:35 IST, protecting the final 25 minutes before 15:00 submission.

Core text chat, existing browser speech controls, restaurant intelligence, experiments and learning remain functional. No untested Sarvam route, placeholder voice button, separate agent or secret-handling shortcut was added.

## Verified official documentation
Read on 2026-11-22:
- https://docs.sarvam.ai/
- https://docs.sarvam.ai/api/api-guides-tutorials/models/saaras
- https://docs.sarvam.ai/api/api-guides-tutorials/models/bulbul
- https://docs.sarvam.ai/api/getting-started/pricing

Verified:
- Official SDK `sarvamai` and documented REST endpoints are available.
- `POST https://api.sarvam.ai/speech-to-text`, header `api-subscription-key`, multipart file, `model=saaras:v4`.
- `codemix` keeps English terms in English and Indic words in native script. It is not Romanized Hinglish (`translit`). Domain keyterms can bias restaurant/customer/sales/combo recognition.
- English `en-IN`, Hindi `hi-IN` and Kannada `kn-IN` are documented. Hinglish is a code-mixing choice, not an invented BCP-47 language code.
- REST STT limit: 30 seconds per request. Planned product cap should be lower, such as 20 seconds.
- `POST https://api.sarvam.ai/text-to-speech`, `model=bulbul:v4-flash`, documented v4 persona required. V3 short speaker names are incompatible with v4.
- V4 example persona `simran_en_customer`; documented default `shubh_enhi_ads`. Language-specific Hindi/Kannada persona selection still requires catalog review and listening.
- REST TTS limit: 2,500 characters. Romanized Indic input degrades quality; preserve English business terms but use native script for Hindi/Kannada speech text.
- Response includes base64-encoded audio in `audios`, normally WAV, plus `request_id`.
- Public pay-as-you-go pricing: STT ₹0.49/minute, billed per second; Bulbul v4 Flash ₹2/1,000 characters, excluding GST.
- Public docs say credits are universal across APIs. The specific account balance and entitlement have **not** been inspected or verified.
- Exhausted credits return 402; rate limits 429. Do not retry a quota error as though it were rate limiting.

## Blockers
- Secure existence check found `SARVAM_API_KEY` absent. No key was requested in ordinary chat or read from the environment.
- No bounded speech-test spending authorization has been confirmed.
- No actual Hinglish audio input is available for the required listening/pronunciation test.
- Insufficient time remains before the agreed feature freeze for implementation plus credible real-audio validation.

## Required integration when resumed
Microphone push-to-talk → bounded server-side Saaras request → editable transcript → explicit Send → existing Udaan conversation route and stored business context → bounded server-side Bulbul request → Play/Stop/Replay.

Reuse OpenAI/Anthropic reasoning and IndiaRestros grounding. Do not introduce Samvaad or another business brain.

Require secure credentials, explicit credit-use authorization, persistent usage limits, short recordings, capped speech output, per-session throttling, microphone/processing/playback states and clear text/browser-voice fallback before any billable call.

The acceptance recording must use the user's actual phrase:
“Mere restaurant mein weekdays par customers kam aa rahe hain. Main kya kar sakta hoon?”

## Actual test evidence
Sarvam calls: **0**. Sarvam cost: **0**. Latency: **not measured**.
Actual microphone → Saaras → contextual Udaan → Bulbul playback: **not implemented or tested**.
Natural Hinglish pronunciation, Kannada pronunciation and persona compatibility: **not tested**.
