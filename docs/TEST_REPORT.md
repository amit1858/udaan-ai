# Udaan AI — Test report

## Executed checks so far
- Unit tests: **56 passed** before the additional persistence suite; covers exact financials, invalid inputs, loss/insufficient cases, state transitions, representative four-language intents, structured AI validation, translation key parity and precision formatting.
- TypeScript: **passed** across all workspace packages.
- ESLint: **passed** after fixing one scaffold unused-variable warning.
- API server production bundle/start: **passed**.
- SQLite initialization and 90-day seed: **passed**, rerun idempotently.
- Live OpenAI: **three genuine calls passed**, including both stored outcome scenarios. See `PROVIDER_VERIFICATION.md`.

## Actual browser tests
At 390×844:
1. Complete credential-free multilingual discovery → chat → draft → approve → start → confirm results → learning → linked follow-up: **passed**.
2. Separate 70-unit and 130-unit experiments generate ₹2,280/₹5,520 and different recommendations: **passed**.
3. Four languages preserve business/experiment state, with no document overflow at 390×844 and 360×800: **passed in isolated rerun**.
4. Reset restores only the current fictional session; a second browser retains its edited profile: **passed**.

Browser setup first failed because downloaded Chromium lacked a Nix shared library. System Chromium fixed it. The multilingual test then encountered an overly aggressive read-request limit, which was corrected; its combined eight-language/width screenshot run needed a longer test timeout. It passed with 120 seconds allowed (actual about 50 seconds). No passing result is claimed for those earlier failing runs.

Actual screenshots and browser videos are in ignored `generated-artifacts/`. Videos are interaction captures without microphone audio.

## Final verification pending
Additional persistence suite, final combined browser suite, production frontend bundle, thesis website and review archive checks are recorded here when executed.
