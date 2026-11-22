# Final release-candidate test report

## Latest executed regression
- `pnpm test`: **71 passed, 6 files**.
- `CHROMIUM_PATH=$(command -v chromium) pnpm test:browser`: **7 passed**, latest complete pass approximately 2.4 minutes.
- `pnpm lint`: **passed**.
- `pnpm run typecheck`: **passed across the workspace**.
- `pnpm install --frozen-lockfile --offline`: **passed**; lockfile and cached dependencies reproduced the install.
- API production build: **passed**.
- Frontend production build: **passed**; generated manifest, `sw.js`, Workbox runtime and public-asset precache. Nonblocking bundle-size and scaffold sourcemap notices remain.
- Database migrations and idempotent 90-day synthetic seed were executed earlier. Runtime SQLite files are excluded from Git.

## Seven browser journeys
1. Credential-free discovery → contextual discussion → evaluation → draft → approval → running → confirmed outcome → learning → linked next experiment.
2. The same pipeline yields ₹2,280 at 70 units versus ₹5,520 at 130 units and different recommendations. Selling price ₹99, making cost ₹45, promotion ₹1,500; break-even 28 units total.
3. English, Hinglish, Hindi and Kannada retain profile/experiment state at 390×844 and 360×800 without horizontal overflow; Home primary action remains usable.
4. Reset affects only the current fictional visitor; another visitor's data remains.
5. Actual attributed IndiaRestros menu facts, dates and affordable-experiment navigation.
6. Existing thesis website: mobile/desktop behavior, actual assets, links and downloadable thesis.
7. Voice Lab public/locked state: no spending controls or private usage data; unauthenticated test request rejected; no speech request on page load.

## Production PWA verification
`CHROMIUM_PATH=$(command -v chromium) node scripts/verify-pwa.mjs` **passed** against a short-lived production-build test server.
- Manifest, 192/512 icons and maskable purpose validated.
- Service worker registered and controlled the page in a secure localhost context.
- Persistent Chromium context returned **zero installability errors**. Incognito inspection was not used for the final eligibility result.
- A new worker waited; update confirmation could be cancelled without losing an edited financial input.
- Offline launch succeeded; open inputs survived connectivity loss.
- Cache enumeration contained only static public assets, no API/private/restaurant/speech responses.
- Offline API fetch failed rather than returning cached private data.
- Reconnection restored the current route; a previously saved draft was unchanged.
- Safari installation guidance rendered. **Physical iOS/Android installation was not performed.**

## Genuine external execution
- OpenAI: five genuine reasoning calls, including stored 70/130-unit outcome interpretation and an actual UI walkthrough.
- Anthropic: authenticated model metadata check and one genuine reasoning call through `/api/udaan/chat`, with persisted two-message conversation.
- Sarvam: four actual calls, all HTTP 200; generated-audio round trip described in `SARVAM_VOICE_STATUS.md`. Conservative combined speech estimate ₹1.27 before GST, not invoice reconciliation. No paid repeat after the user prohibited it.
- IndiaRestros: fresh request at **2026-11-22 09:55:02 UTC / 15:25:02 IST**, then cached repeat. Three upstream HTTP 200s, two search results, 90 raw menu items; relevant vegetarian excerpt retained one restaurant and three items. This check used Demo reasoning, **not synthetic provider data** and not paid AI.

## Resolved verification issues
- Nix browser libraries: system Chromium used.
- PWA installability requires a persistent context; incognito itself reports an installation restriction.
- Reconnection test initially expected Home while the current URL remained the opportunity route; the assertion was corrected. The application reconnection behavior passed.
- Workbox introduced an optional Terser peer distinction across Vite plugin instances; matching the sandbox's Terser peer restored full-workspace type consistency.
- Market cache tests now assert equal facts/original retrieval time and different live/cached provenance, rather than whole-object identity.

## Not verified
Physical-device Safari/Android behavior, human microphone/pronunciation quality, native-speaker review, production durability, public deployment and billing invoices. Market-specific paid-model inference is wired but not separately executed.

Local screenshots, recordings and sanitized execution evidence remain in ignored `generated-artifacts/`; raw logs, cookies and runtime databases are not release source.
