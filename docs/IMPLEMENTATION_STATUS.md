# Udaan AI — Implementation status

Authority: complete UDAAN_MASTER_SPEC.md Version 5.0, read before implementation.

## Execution order
1. Foundation, API contract, persistence and safe provider adapters.
2. Complete discovery → evaluation → experiment → results → learning journey.
3. Multilingual visual experience and validation.
4. Competition documentation, evidence and stable checkpoint.
5. Separate static product thesis website only after the application is validated.

## Milestone 1 — Foundation and early live AI
- Implemented shared OpenAPI contract and generated client.
- React/Vite plus server API explicitly approved by user instead of Next.js.
- Prisma 6 + SQLite initialized with reproducible migration.
- Idempotent seed verified: 90 fictional daily sales records; exact weekly ₹87,600 / 1,095 order baseline.
- Signed HTTP-only cookie isolates each visitor's profile, conversations and experiments.
- Demo, OpenAI and Anthropic share validated output contract and persistent context.
- Genuine OpenAI `gpt-5-mini` call succeeded through Replit AI Integrations with persisted shop context, Hinglish output, follow-up and structured combo recommendation (2,660 tokens).
- Financial wording issue spotted in initial live output: cumulative break-even described as daily. Tightened grounding; both subsequent stored-outcome calls correctly used 28 units total.
- API TypeScript validation passed after fixing one duplicated response property.
- Server build/start passed after externalizing official AI SDK packages (optional telemetry import bundling issue resolved).
- Four-language frontend and ten original local illustrations implemented; integration validation next.

## Authorization and schedule
- User approved paid testing up to ₹100; conservative global persistent maximum six live attempts, no automatic retries.
- OpenAI credentials provisioned securely by Replit; Anthropic credentials unavailable.
- User deadline: 2026-11-22 15:00 IST. Feature freeze 14:35 IST; final 25 minutes reserved.

## Milestone 2 — Complete application, validated
- Discovery → contextual chat → evaluation → draft → approval → running → confirmed results → learning → linked next experiment implemented.
- Persisted menu/profile, language, provider, conversation, experiments and original result facts survive reload.
- Exact 70-unit ₹2,280 and 130-unit ₹5,520 contribution verified through the same pipeline.
- Both outcomes genuinely interpreted by OpenAI with different next recommendations.
- Four core browser scenarios passed together, including all four languages at both 390×844 and 360×800; primary Home action now verified above the bottom navigation.
- 59 unit/persistence tests passed before the market addition; lint, TypeScript and both production builds passed.
- Actual mobile walkthrough recorded, including a genuine OpenAI UI response; no browser page errors. Videos are silent interaction recordings.
- Five authorized paid OpenAI calls total used; one remains under the six-call ceiling. No further paid calls will be made without a deliberate presenter action.
- Source checkpoints saved locally; no GitHub remote/push.

## Milestone 3 — Thesis and submission preparation
- Separate 12-section premium static thesis website built only after core validation.
- `website/` contains GitHub Pages-compatible source; `/thesis/` redirects to its development preview.
- Desktop/mobile layout, actual image assets, internal anchors, download and source links tested. Animation-aware test uses reduced-motion mode; the earlier animated-element stability timeout was a test issue, not an image failure.
- Manual-only Pages workflow prepared, not executed. No fabricated repository, deployment or recording URL.
- README, architecture, financial/provider evidence, demo script, test report, known limitations and thesis documents prepared.

## High-priority addition — verified Live Market Intelligence
- Read the user's addition and bounded investigation before integration.
- Verified public REST base `https://indiarestros.com/api/v1`, OpenAPI 3.1 schema and public MCP `https://indiarestros.com/mcp` via successful tools/list.
- No key/account required. Terms permit personal/commercial reads, 120 requests/minute/IP, no SLA; data periodically refreshed, not real time.
- Search with city=bengaluru/locality=whitefield/cuisine=south-indian returned local records. Dhatu Restaurant & Organic Store menu returned source=zomato, updated=2026-10-09T20:43:50Z; actual priced vegetarian breakfast items verified.
- One server-side read-only adapter uses documented GET requests only, validates schema/URLs/locality, filters relevant vegetarian menu facts and caches for the observed public max-age=300 seconds.
- No contact harvesting, third-party imagery, ratings or review text. Attribution links to each restaurant and IndiaRestros; underlying source/date are visible.
- Market question available in four languages. Card presents source facts, retrieval time, periodic freshness warning, separately labeled AI/Demo interpretation and an affordable direct experiment action.
- Market snapshots are saved with the conversation so provenance survives reload. No cross-session sharing of business context.
- Network/schema/insufficient-data failures return an explicit unavailable state with no invented competitor facts.
- Four new adapter tests passed; total now **63 unit/persistence tests**, lint and TypeScript passed.
- Live-model market grounding is implemented but not separately paid-tested; final authorized live call reserved for the stage.

## Governance
No public deployment, GitHub push or external business action performed. Paid calls explicitly authorized within the cap.

## Sarvam voice addendum — pending at feature freeze
- Read the complete addendum and current official model/pricing documentation.
- Confirmed requested `saaras:v4`, `codemix` and `bulbul:v4-flash` exist; documented native-script speech text and v4-specific speaker compatibility.
- Secure existence check: `SARVAM_API_KEY` is absent. No Sarvam integration connector was returned by the catalog search.
- Public docs describe universal API credits, but this account's balance/entitlement and bounded test authorization are unverified.
- No Sarvam code or billable calls were introduced at the 14:35 IST freeze. Actual speech transcription, pronunciation, latency and full voice loop remain untested.
- Followed the addendum's explicit fallback: preserve working text-based Udaan and mark Sarvam pending.
- See `SARVAM_VOICE_STATUS.md` for exact verified endpoints, limits, model requirements, blockers and acceptance test.

## Final regression after the market addition
- **63 unit/persistence/adapter tests passed.**
- **All 6 browser scenarios passed together**, including actual Whitefield source retrieval, persisted Market Inspiration, ₹0 promotion follow-up, the four original application scenarios and the separate thesis website.
- ESLint and full-workspace TypeScript passed.
- API and frontend production bundles built successfully. Vite reports a nonblocking large-bundle warning and two scaffold sourcemap-location notices; no build failure.
- Sarvam remains pending and is not counted as implemented or verified.
