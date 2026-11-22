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

Final update: two additional genuine UI calls used 2,907 and 3,074 tokens. The second capture completed the whole actual mobile walkthrough. Total five attempts; one remains for deliberate presenter use. Full sanitized UI output is in `generated-artifacts/live-ui-verification.json`.

## Anthropic
Official SDK adapter implemented under the shared contract. No Anthropic credentials are configured; live verification not performed. The UI labels it unconfigured.

## Unverified aspects
No claim of provider billing reconciliation, Hindi/Kannada live-model validation, voice pronunciation testing or real-world business improvement.
