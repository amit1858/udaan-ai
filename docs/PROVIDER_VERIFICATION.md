# Provider verification

## Authorization
The user explicitly approved bounded paid testing up to ₹100. OpenAI access uses Replit AI Integrations, billed to Replit credits without a user-supplied API key. Direct-key adapters remain supported. No secret values were printed or committed.

## Executed OpenAI calls
| Call | Model | Grounding | Verified result |
|---|---|---|---|
| Initial contextual question | gpt-5-mini | Persisted Udaan Breakfast House profile | Genuine Hinglish answer, known combo ID and clarifying follow-up; 2,660 tokens |
| Stored 70-unit outcome | gpt-5-mini | Actual saved completed experiment, exact financials, linked learning | Cited 70 units, ₹2,280 contribution and cumulative 28-unit break-even; recommended ₹600 visibility; 3,814 tokens |
| Stored 130-unit outcome | gpt-5-mini | Both saved completed experiments and learning | Compared 130 and 70 units, cited ₹5,520 versus ₹2,280, recommended a different repeat-customer loyalty pilot; 4,852 tokens |

Initial response used an incorrect daily interpretation of break-even. This was identified, the grounding was strengthened and both subsequent calls correctly said total break-even. The UI never used model arithmetic for authoritative figures.

The two outcome calls were made through the same `/api/udaan/chat` path as the application. A safe structured parser validated content, follow-up, intent and opportunity IDs. Neither deterministic responses nor unrelated model output were substituted.

Sanitized full output is saved in ignored `generated-artifacts/live-verification.json`. It contains fictional business context/results and provider metadata, not credentials or session cookies.

## Call controls
`ALLOW_PAID_API_CALLS` defaults false in the example configuration. It was enabled only after authorization. Maximum six attempts total are stored in SQLite; there are no automatic SDK retries. Timeouts and global single-flight protect against accidental concurrent costs.

Three live calls were used for the evidence above. Subsequent authorized UI capture, if performed, is documented in the final test report. The allowance must not be increased without permission.

Final update: two additional genuine UI calls used 2,907 and 3,074 tokens. The second capture completed the actual mobile walkthrough. Total five OpenAI attempts. The remaining sixth reasoning attempt was subsequently used for the verified Anthropic voice round trip. **No reasoning allowance remains.** Full sanitized UI output is in ignored local artifacts, not release source.

## Anthropic
The direct-key official SDK authenticated successfully and listed available models. A genuine `claude-haiku-5-5` call then ran through the existing `/api/udaan/chat` route with saved fictional restaurant context and transcribed Hinglish input. It returned a contextual combo hypothesis, explicit financial caveats and native-script speech text. Both conversation messages persisted. Sarvam synthesized that actual response; no separate reasoning system or Demo substitution was used. See `SARVAM_VOICE_STATUS.md`.

## IndiaRestros — fresh provider versus cache execution
Actual application request: `POST /api/udaan/chat` with a nearby-restaurants question, using the credential-free Demo Engine for interpretation. Application HTTP status 200.

Fresh upstream search at **2026-11-22 09:55:02.321 UTC / 15:25:02.321 IST**:
`GET https://indiarestros.com/api/v1/restaurants?city=bengaluru&locality=whitefield&cuisine=south-indian&limit=2`

Then actual server-side menu calls:
- `GET https://indiarestros.com/api/v1/restaurants/IRR-YS9NDQYYKC/menu`
- `GET https://indiarestros.com/api/v1/restaurants/IRR-V1WEQM26XV/menu`

All three upstream responses were **HTTP 200**. Search returned **two restaurants**; their menus contained **90 raw items**. The vegetarian relevance filter and maximum-three-item excerpt retained **one restaurant / three items**: Dhatu Restaurant & Organic Store, with source `zomato`, menu update `2026-10-09T20:43:50Z`, and original prices ₹450, ₹399, ₹399. No premium pricing was copied into Ravi's recommendation.

The first response reported `live_provider`; an immediate second application request at 09:55:02.523 UTC reported `cached_provider`, with the identical original retrieval timestamp and facts. That repeat made no new upstream calls. Cache TTL is **300 seconds**, in memory and shared across visitors; simultaneous requests share a pending fetch. Stored conversation replay is explicitly marked cached snapshot.

The UI distinguishes **Live Provider Data**, **Cached Provider Data** and **Synthetic Demo Data**. Real restaurant facts do not become synthetic because the interpreter is Demo Engine. Ravi's profile, sales and sample outcomes are fictional. A failed/invalid/timed-out provider call yields `unavailable` and no invented competitor facts; it does not silently serve an expired snapshot. Each upstream fetch has a 4.5-second timeout.

Live-model instructions receive these same facts alongside the business profile, saved outcomes and deterministic financials. This particular confirmation used **Demo reasoning**, recommending a no-spend opt-in seven-day preorder test. Market-specific paid-model interpretation was not separately executed.

## Unverified aspects
No claim of provider billing reconciliation, Hindi/Kannada live-model validation, voice pronunciation testing or real-world business improvement.
