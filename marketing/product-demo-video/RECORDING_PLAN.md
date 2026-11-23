# Recording plan and exact approval boundary

**Status: awaiting approval. No live application API was called in Stage 1.**
Source below is pinned to handoff commit
`de9283e1c8a1d08cf62fd9832e0d14df84749d43`.

## What is actually available

Static deployed root returned HTTP 200, title `Udaan AI`, loading
`/assets/index-CrvmBxbn.js` and `/assets/index--0EGNGxO.css`.
The deployed JS contains onboarding, draft creation, result saving and learning
selectors and state/preferences URLs. This corroborates frontend capability;
it does **not** attest a serving Git SHA or prove backend execution.

Normal root navigation triggers `GET /api/udaan/state`. Server middleware invokes
`ensureSession` for **every** `/api/udaan/*` route before its handler:
[`routes/udaan.ts:31-56`](https://github.com/amit1858/udaan-ai/blob/de9283e1c8a1d08cf62fd9832e0d14df84749d43/artifacts/api-server/src/routes/udaan.ts#L31-L56).
[`db.ts:30-31`](https://github.com/amit1858/udaan-ai/blob/de9283e1c8a1d08cf62fd9832e0d14df84749d43/artifacts/api-server/src/udaan/db.ts#L30-L31)
uses `DemoSession.upsert`, creating a default fictional profile for a new signed
visitor. **GET is not a no-write guarantee**, even for providers/live-access or
an eventual 404 below that middleware.

Stage 1 allowed only static asset GETs; state requests were aborted, not mocked.
The rendered screen remained loading with an "Offline setup unavailable" warning
because service workers were blocked. No onboarding or downstream current
production screen was freshly verified. Historical carousel onboarding and
release-candidate workflow images are not upgraded into new live evidence.

| Screen | Source-supported route / behavior | Current live evidence |
| --- | --- | --- |
| Onboarding | `/`; language choice and Start Demo persist preferences | Deployed JS markers; prior carousel capture only |
| Home / profile | `/`, `/shop`; default Ravi profile, retained context | Tagged source; not entered |
| Discovery | `/discover`, `/opportunity/combo` | Tagged source; not entered |
| Guided discussion | `/ask`; explicit Demo Engine badge | Tagged source; not submitted |
| Evaluation | `/opportunity/combo#evaluate`; debounced deterministic POST | Tagged source; not executed |
| Lifecycle / results | `/plans/{id}`; Draft -> Approved -> Running -> Completed | Tagged source; not created |
| Learning | Same completed plan; stored facts and linked next hypothesis | Tagged source; not recorded |

## Proposed single-take journey after approval

Use one clean, isolated nonpersistent browser context; no personal cookies,
accounts, storage-state export, microphone, presenter login or provider key.
Keep the existing production worker enabled in the later authentic capture;
the Stage 1 API-blocked probe settings are not the production-recording harness.
Whitelist approved app routes/methods and payloads; do not capture raw
cookies/headers or bodies in public network logs.

1. Open the live URL once. Accept one synthetic visitor creation. The seeded
   profile is already Ravi / Udaan Breakfast House / Whitefield, Bengaluru.
   Actual onboarding is a language/start screen, **not a profile-entry wizard**.
2. Leave default English selected; click `button-start-demo` once. Do not
   separately click the language tile, which would add a preferences PATCH.
3. Hold Home's `text-greeting` and `card-featured`; open `/shop` to show the
   existing synthetic context without pressing Save. Return to `/discover`.
4. Open `/ask`, fill `input-chat` with
   **"Could a 99 rupee breakfast combo help weekday customers?"** and click
   `button-send` once. Verify the selected provider is `demo` before submission
   and preserve the rendered Demo Mode badge. This phrase triggers the combo
   explanation without the nearby/competitor market-data branch.
5. Open `/opportunity/combo`, scroll smoothly to `#evaluate`, verify inputs
   `input-sellingPrice=99`, `input-makingCost=45`,
   `input-promotionBudget=1500`, `input-expectedUnits=100`.
   Wait for `text-forecast` containing 3,900. Hold financial panel and 28 units.
6. Click `button-create-draft` once. Save returned plan ID privately in memory
   for assertions, not a public account/session identifier.
7. Click `button-approve`, then `button-dialog-confirm`; wait for Approved.
   Click `button-start`, then confirmation; wait for `form-results`.
8. Click `button-sample-low` (fills only local form fields), verify 70 units,
   1,500 spend, synthetic switch on and confirmation unchecked. Show this is an
   **illustrative result**, not seven actual days elapsed. Check
   `checkbox-confirm`, then `button-save-results` once.
9. Verify `section-outcome`, `text-achievement=70%`, `section-learning` and
   `card-next-recommendation` with the 600-rupee visibility hypothesis. Hold
   each long enough for an edit. Do not confuse the lower **expected** 3,900
   panel with the actual 2,280 result.
10. Reload the same plan once to demonstrate persistence, if still inside the
    approved take. Optionally open `link-explore-next` to show the recommendation
    only; **do not create a follow-up experiment**. Stop and close the context.

Existing browser journey tests provide selectors and lifecycle precedent, but
were not run against production: `tests/browser/journey.spec.ts:3-31`.

## Exact potential mutation map

All paths include the deployed `/api` prefix. Counts below are for one successful
journey with no extra language/provider changes, saves, retries or second take.
Middleware may run an empty-update session upsert repeatedly; this is a logical
application-effect map, not a promised exact SQL statement count.

| Action / HTTP request | Payload / effect | Tables and approval scope |
| --- | --- | --- |
| API process startup / Autoscale cold start | `index.ts` calls `seedSales()` before listening; 90 date-keyed upserts, empty update for existing rows | **Sale**: existing dates unchanged, missing synthetic dates inserted; shared rather than visitor-local; startup is not directly controlled by this recording |
| First `/api/udaan/*` GET, usually `/state` | New signed visitor cookie; default profile, English, Demo, onboarded false | **Create one DemoSession**; approval required before ordinary page load |
| `PATCH /udaan/preferences` | `{"language":"en","onboarded":true}` | Update that DemoSession |
| `GET /udaan/state`, `/opportunities`, `/experiments`, `/conversation`, `/providers`, `/live-access` | Read handlers; session middleware still applies | No additional business-record writes for an existing visitor expected; GET upsert boundary remains |
| `POST /udaan/chat` | `{"message":"Could a 99 rupee breakfast combo help weekday customers?"}` | Create **two ChatMessage** rows (user and assistant) atomically; bounded deterministic Demo response |
| `POST /udaan/evaluate` | `{"sellingPrice":99,"makingCost":45,"promotionBudget":1500,"expectedUnits":100}` | Deterministic calculation only after session middleware; automatic on evaluation view/input changes; no saved experiment |
| `POST /udaan/experiments` | Same four inputs plus `opportunityId:"combo", durationDays:7` | Create **one Experiment**, Draft timeline; no parent; stored money is integer paise |
| `POST /udaan/experiments/{id}/transition` | `{"status":"Approved","confirmed":true}` | Update that Experiment status and timeline |
| Same transition endpoint | `{"status":"Running","confirmed":true}` | Update same Experiment status and timeline |
| `POST /udaan/experiments/{id}/results` | `actualUnits:70, actualPromotionSpend:1500, synthetic:true, confirmed:true`; feedback from sample button; observations empty/omitted | Update same Experiment to Completed, actualUnits, actualPromotionSpend, feedback, observations, synthetic flag, timeline and serialized deterministic learning |
| Profile Save (not proposed) | `PATCH /udaan/profile`, owner/menu/context edits | DemoSession.profile update; **excluded** |
| Any language/provider choice (not proposed) | Additional `PATCH /udaan/preferences` | Additional DemoSession update; **excluded** |
| Reset (not proposed) | `POST /udaan/demo/reset`, `{"confirmed":true}` | Deletes this session's Experiment and ChatMessage records; resets profile/provider, does not delete session or reset language/onboarded; **separate destructive approval** |

Six deliberate business-mutation requests: preferences, chat, draft, two
transitions, result. Plus initial visitor creation and session middleware on all
app API requests. Expected final new rows: **one DemoSession, two ChatMessage,
one Experiment**; one preferences update and three Experiment updates.
`ProviderCall`, `VoiceLabConfig`, `VoiceRequest` have no writes in this proposed
Demo path. **Sale startup seeding is a separate possible effect**, not one of
the four visitor-owned new rows. Tagged `index.ts` calls `seedSales()`; `db.ts:10-24`
upserts 90 synthetic dates ending 22 November 2026. A cold start can therefore
insert missing global Sale rows. Existing-row presence and whether browsing
started a backend instance were not inspected; do not promise exactly zero
server writes from static browsing or exactly four total database inserts.
Source: `routes/udaan.ts:64-210`, `providers.ts:60-61`, `finance.ts:53-70`,
`pages/plan-detail.tsx` ResultsForm.

The sample button's English feedback is:
"Regulars liked it, but few new office customers noticed the offer."
It is supplied fictional feedback, **not measured customer research**.
Show the synthetic disclosure and avoid narrating that feedback as fact.

No automatic retry after uncertain network results. Re-read same-session state
after an approved ambiguous request before deciding whether another write would
duplicate a chat/draft. A second session, second take or changed result needs a
revised approval. Completed outcomes are immutable; do not overwrite them.

## Paid/disabled dependencies and prohibited side paths

- `provider:"demo"` returns deterministic local reasoning before paid reservation.
  Learning uses `learningFacts` / `learningCopy`, not model retraining.
- Final handoff reports OpenAI/Anthropic configured but spending disabled, and
  live-access disabled. Approved window ended **22 November, 18:50 IST**.
  Current status was **not re-queried**, because its GET can create a visitor.
  Recheck only after visitor approval. Do not renew flags/window or unlock.
- No OpenAI/Anthropic calls, provider tests, Sarvam Lab, Listen, microphone,
  speech recognition or paid Gnani during recording. Gnani is offline narration
  production only. Main-app voice remains browser-native.
- Avoid nearby/competitor/market-inspiration questions: even Demo can retrieve
  IndiaRestros upstream data. No external market request is needed here.
- Never run existing capture/demo/browser-test scripts against production:
  some create multiple experiments, reset state or select providers.

## Explicit decisions required before Stage 2

**A - Recommended live option:** authorize one fresh synthetic visitor, the six
requests above and associated GET/evaluation calls, within one supervised take
of approximately 15-20 minutes. Confirm these fictional records may remain;
no cleanup or reset is assumed. Existing hosting/database requests can incur
ordinary usage charges; no reliable incremental hosting invoice cap is known.
Also acknowledge the existing cold-start Sale seeding behavior (90 upserts;
possible missing-date inserts), rather than treating all effects as visitor-local.
If shared-table startup effects are unacceptable, choose the local alternative.
Keep paid inference and all configuration changes prohibited.

**B - Alternative if live writes are declined:** approve an isolated local
demonstration using the exact handoff tree and an **empty local PostgreSQL**
database with no production credentials/data. Label every shot "Local prototype
demonstration - synthetic data." No response mocking or static reconstructed UI.
This is not yet runnable/proven: Docker/psql were not found on PATH; no database
was created. Tagged API requires PostgreSQL and startup `seedSales()` upserts 90
synthetic Sale dates. Migration creates the local schema; normal journey writes
the four rows described above locally.

The tagged Vite config lacks an API proxy and Express serves `/api` only.
A loopback-only same-origin static/proxy wrapper under this marketing folder
would be needed, without editing app source. Bind all listeners to loopback
(Vite's existing host default is 0.0.0.0), use separate safe runtime variables,
`ALLOW_PAID_API_CALLS=false`, no provider keys, and no Replit proxy credentials.
Do not install/provision a database or start the backend until this alternative
is approved. Do not import the private production export for a fictional demo.

**C - Creative/rights:** approve storyboard/narration and licensed-photo reuse
with CC BY-SA attribution/share-alike treatment. Voice sample cost/rights
approval and full-narration voice approval remain separate later gates.
