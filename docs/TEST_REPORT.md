# Udaan AI — Final test report

Executed 2026-11-22; final combined regression completed at about 14:33 IST.

## Passing checks
- **63 unit, persistence and adapter tests passed** across five files.
- **6 browser scenarios passed together** in about 2.1 minutes.
- ESLint: passed.
- Full-workspace TypeScript: passed.
- API production build/start: passed.
- Frontend production build: passed. Nonblocking warnings: large JS bundle and two scaffold sourcemap-location notices.
- SQLite initialization and 90-day synthetic sales seed: passed; verified idempotent.

## Browser scenarios
1. Complete credential-free Hinglish discovery → conversation → evaluation → draft → approval → running → owner-confirmed results → learning → linked next experiment.
2. Separate 70-unit and 130-unit experiments yield exact ₹2,280/₹5,520 contribution and different next recommendations.
3. English/Hinglish/Hindi/Kannada preserve profile and experiment state, with no document overflow at 390×844 and 360×800. Primary Home action is above bottom navigation.
4. Reset affects only the current fictional session; another browser retains its edited profile.
5. Actual IndiaRestros Whitefield facts, source links and menu update date appear in Market Inspiration; saved facts survive reload and lead to the ₹0-promotion pre-order evaluation.
6. Separate thesis website: mobile/desktop layout, actual image assets, valid anchors and thesis download.

## Genuine provider evidence
Five paid OpenAI calls used under the persistent six-attempt cap:
- Initial retained-business-context Hinglish answer, 2,660 tokens.
- Stored 70-unit result interpretation, 3,814 tokens.
- Stored 130-unit result interpretation, 4,852 tokens.
- Actual UI question, 2,907 tokens; capture script's independent request context did not retain browser session, so that capture assertion failed after the provider succeeded.
- Repeated UI capture using browser-context fetch and waiting for visible response, 3,074 tokens; complete actual walkthrough succeeded without page errors.

One authorized live call remains reserved for deliberate presenter use. Costs were not independently reconciled to a provider invoice.

Market-specific live-model inference is implemented through the same provider pipeline but not separately paid-tested. Actual source retrieval and deterministic interpretation were browser-tested; these are not mislabeled live AI.

## Earlier failures, resolved
- Downloaded Chromium lacked a Nix shared library; system Chromium works.
- Read throttling was too aggressive during the language test; reads now have lower request weight.
- Eight mobile language/width captures exceeded the default timeout; their test has a bounded 120-second limit.
- Animated thesis phone prevented Playwright's element stability check; reduced-motion testing resolved it.
- Initial live prose described total break-even as daily; stronger grounding fixed subsequent checked outputs. Financial UI always used the deterministic service.

## Not tested or claimed
- Anthropic live inference.
- Sarvam integration or actual audio pronunciation, credit balance, speech latency or full voice loop.
- Production multi-instance SQLite durability.
- Native-speaker linguistic review, real restaurant impact, payments/ads/orders/messages.
- GitHub push, public app deployment or Pages activation.

Actual screenshots, recordings, sanitized live output and combined browser JSON report are in ignored `generated-artifacts/`. Videos are actual silent browser recordings, not narrated or synthetic demonstrations.
