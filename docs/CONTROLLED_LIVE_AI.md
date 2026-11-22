# Controlled production AI — approved activation candidate

## What was disabled, and why
- The first published release deliberately had an unconditional production inference block.
- `ALLOW_PAID_API_CALLS=false` and `MAX_PAID_API_CALLS=0` also disabled inference. The six historical reasoning attempts were exhausted.
- Production OpenAI, Anthropic, Sarvam and session credentials were present. They were not deleted.
- Historical provider success could incorrectly override the current “spending disabled” badge. That precedence is corrected.
- Sarvam is implemented in the development-only internal Lab, **not the main app**. All direct Lab API routes remain 404 in production.

## Approved production configuration
The owner approved activation after receiving cost estimates on 2026-11-22. The validated API service production environment enables:

| Setting | Value |
|---|---|
| `ALLOW_PAID_API_CALLS` / `PRODUCTION_AI_ENABLED` | `true` / `true`, production service only |
| `PRODUCTION_AI_DAILY_CAP` | 10 combined attempts |
| `PRODUCTION_AI_SESSION_CAP` | 5 attempts per signed visitor session |
| `PRODUCTION_AI_BUDGET_START` | `2026-11-22T11:20:00Z` / 4:50 PM IST |
| `PRODUCTION_AI_BUDGET_END` | `2026-11-22T13:20:00Z` / 6:50 PM IST |

The window has a hard two-hour maximum and never automatically renews. The single allowance is preserved across midnight. Every reserved attempt counts, including failures and timeouts. Old audits are retained; this explicitly approved new window does not erase or reset the six original tests.

**Preparing configuration does not change an already-published application. Replit Republish is required.**

## Access, security and spending controls
- Settings → Controlled live demonstration → presenter password → “Unlock and use OpenAI.”
- Prefer optional `PRODUCTION_AI_ACCESS_PASSWORD` in production Secrets; otherwise the existing `VOICE_LAB_ADMIN_PASSWORD` is used. Minimum 12 characters. No additional provider credentials are currently missing.
- This is a bounded presenter gate, not enterprise user authentication. Password throttling is per process/IP; signed browser sessions remain the existing business-data isolation mechanism.
- Grants are signed, visitor-bound, HttpOnly, Secure, SameSite Strict and expire after 30 minutes. Paid chat and provider-test endpoints both require the grant. Demo needs no password.
- Logout clears the grant and selects Demo without deleting profiles, messages or experiments. A stolen grant cannot be individually revoked server-side before expiration; the production spending switch/caps stop inference globally.
- PostgreSQL advisory transaction lock makes the combined counter/reservation atomic across instances. Per-session in-flight blocking, three attempts/minute and 30-second identical-question replay reduce accidental duplicates.
- At most 30,000 UTF-8 input bytes plus protocol framing; recent history/facts bounded. At most 2,048 generated tokens, including OpenAI reasoning. Provider timeout 35 seconds; SDK retries zero.
- Audit stores provider, visitor ID, status, token total and time. No keys, passwords, raw audio or sensitive provider errors are logged.
- API responses stay `no-store`; no private AI or business content is added to the service worker cache.
- `MAX_PAID_API_CALLS` remains the exhausted development-only test allowance. Production uses the separately approved counters above.

## Models and fallback
- Primary: existing verified `gpt-5-mini`, JSON output, minimal reasoning effort, server-side OpenAI integration/direct credential. Official model page currently marks it deprecated: preserve the reviewed model for this short demo rather than silently migrate.
- Explicit alternative: existing verified `claude-haiku-5-5`, selected in Settings. It is not automatically called after an OpenAI failure.
- Deterministic Demo remains explicit, available and clearly identified. No failed paid answer is silently relabelled as Demo.
- Genuine verification of the newly bounded request settings is still required after publishing. Mocked checks are not proof of current provider availability.

## Current price estimates, excluding tax/hosting/Agent work
Official sources checked 2026-11-22:
- OpenAI `gpt-5-mini`: $0.25 / million input, $2 / million output: https://developers.openai.com/api/docs/models/gpt-5-mini
- Anthropic Haiku 5.5, prompts ≤100k tokens: $0.10 / million input, $0.50 / million output: https://platform.claude.com/docs/en/models/haiku-5-5/overview
- Sarvam v4 Flash: ₹2 / 1,000 text characters: https://docs.sarvam.ai/api/getting-started/pricing
- Replit AI Integrations uses the provider public API rate deducted from Replit credits, without markup: https://docs.replit.com/features/integrations/replit-ai-integrations

“10 conversations” here means **10 single-turn exchanges**, each estimated at 4,000 input + 1,000 output tokens:
- OpenAI: approximately **$0.03**; Anthropic alternative: **$0.009**. Do not add both unless both are deliberately used.
- Conservative full configured envelope for 10 attempts: approximately **$0.12 OpenAI**, or **$0.042 Anthropic**, allowing ~31k input tokens including framing and 2,048 output tokens each. This is a token-based estimate, not a provider/account invoice guarantee.
- 10 × 500-character Sarvam readouts: **₹10 before GST**. Transliteration, if used, is additional at ₹2/1,000 characters. Cached audio replay adds no synthesis request.
- Three-minute example: three AI exchanges ≈**$0.009 OpenAI**; three future 500-character Sarvam readouts **₹3**, not currently available in the main app.
- One tiny real check per reasoning provider should stay below **$0.02 combined** at the configured envelope. No automatic repeat after failure/timeout.
- OpenAI proxy usage consumes Replit credits; direct Anthropic and Sarvam usage depends on their own accounts. Hosting/database/Agent usage is additional. Live account balances cannot be monitored here.

## Sarvam boundary
Existing Lab synthesis/STT and persona mappings were previously verified. Main-app Listen buttons still use browser speech. Merely setting a key/flag cannot connect Sarvam there.

The separately proposed **Give Udaan natural Sarvam readouts** remains the implementation path: shared secure main-app TTS, native-script preparation, audio lifecycle/replay, limits, fake-transport checks and separately approved live verification. Planning estimate: **60–90 minutes**, not a promise or credit quote. STT is not included. Do not expose the Lab to avoid doing this integration.

## Verification / release
- Targeted zero-paid verification covers access, cookie scope/expiration, limits/concurrency/failures, duplicate replay, explicit fallback, UTF-8 bounds, password throttling and production Lab blocking. See `IMPLEMENTATION_STATUS.md` for final counts.
- Original immutable release tag: `udaan-rc-2026-11-22`.
- Published baseline preserved: `udaan-live-before-ai-restore-2026-11-22`.
- Candidate branch: `fix/controlled-production-ai`; candidate checkpoint: `udaan-controlled-ai-2026-11-22`.
- GitHub unexpectedly reported `private:false` during the final check. The candidate remains local until the owner approves restoring privacy or explicitly authorizes a different push scope. Do not claim a private push occurred.
- No schema migration, database replacement, redesign or public GitHub change.
- Republish; verify `/api/udaan/live-access`; unlock on iPhone; make one approved request per reasoning provider. Genuine paid verification is pending until that new version is published.
- One-shot verification: `CONFIRM_PAID_PRODUCTION_TESTS=two-approved-checks pnpm exec tsx scripts/verify-production-ai.ts`. Never run in CI/startup. It uses a fresh fictional session, checks the deployed gate before any billable request, prints metadata only and creates an ignored private marker before the first attempt. Never delete that marker just to retry after an ambiguous timeout.
- After 6:50 PM IST the switch fails closed. Any extension/new allowance needs explicit approval and a revised window; do not silently reset it.
