# Udaan AI — final handoff, 23 November 2026

This is a documentation/source handoff, not a new development cycle. No application code, live configuration, paid-AI allowance, database schema or hosting resources were changed.

## Source and deployment
- Public repository: https://github.com/amit1858/udaan-ai
- Application branch: `fix/controlled-production-ai`.
- Last recorded application publish: `d2e7c6ab7367806296752a21e60417580d56c109`. Its tracked source tree equals previously pushed `be6198a26178179dbcc1911a17b67cff34cb3d8b`; the extra commit records publishing, not missing application changes.
- Final documentation is committed after that checkpoint. Final tag: **`udaan-final-handoff-2026-11-23`**. Resolve its exact handoff commit with `git rev-parse udaan-final-handoff-2026-11-23^{}`.
- Replit's metadata confirms a successful public Autoscale build but does not expose its serving Git SHA. The publish-to-commit mapping is the last local publishing record, corroborated by the live API—not independent live-build SHA attestation.
- Live URL: https://udaan-ai-builder.replit.app/
- GitHub `main` is separately at `a477deec7ffa85474365b36a05ddc65369e1e8da`. Showcase PR [#1](https://github.com/amit1858/udaan-ai/pull/1), from `amit1858-github-pages-showcase`, was merged. Neither branch nor PR is changed by this handoff. Do not replace `main` with the application branch or force-push it.
- This handoff tag is not a new app deployment. Existing release tags remain unchanged.

## Current functional and AI status
- Architecture: React 19/Vite 7/TypeScript frontend; Express/TypeScript API; generated OpenAPI/React Query/Zod contracts; Prisma 6/PostgreSQL. PWA assets and the discovery → experiment → outcome → learning journey remain intact.
- Current live `/api/udaan/live-access`: HTTP 200, `enabled: false`.
- Current live `/api/udaan/providers`: OpenAI and Anthropic configured, both `spending_disabled`; deterministic Demo ready.
- The approved reasoning window ended **22 November 2026, 6:50 PM IST**. Do not silently renew it. Configuration may contain true switches, but the expired hard window blocks calls.
- `/api/udaan/voice-lab/status`: HTTP 404 in production. Sarvam TTS/STT exists only in the protected development Lab; **main-app Sarvam is not integrated**. Main-app speech remains browser-native, not Sarvam.
- No paid provider calls or full test suites were run for this handoff.
- Earlier verification: original 71 tests/seven browser journeys; later 49 unique targeted financial/production/live-control checks and production builds. These are historical results, not tests rerun today. Physical iPhone installation/microphone/native-speaker checks remain unverified.

## Database and private export
Production metadata was read through the production read-only tool:
- Managed PostgreSQL **16.16**, database `neondb`, owner `neondb_owner`; approximately **7.84 MiB** at inspection.
- Seven application tables plus `_prisma_migrations`. Application persistence depends on `DATABASE_URL`, the Prisma schema, committed migrations and the stable session-signing secret.
- A one-time, single-statement row export was created from the production **read replica** at **2026-11-23 06:31:38 UTC**. It is a consistent query snapshot but may lag the primary.
- Private workspace file: `generated-artifacts/private-handoff/udaan-production-2026-11-23.rows.json`.
- SHA-256 companion: the same filename plus `.sha256`. Export checksum: `efe740c13c881641bf8e53c9aa1bc878e67d18395bbe1dcdaf62c48f44071b5c`.
- The archive covers all seven application tables, **not** roles, grants, extensions, sequences, schema or `_prisma_migrations`. It is a portable row export, **not a full PostgreSQL backup**.
- Its directory is permission-restricted and files are mode 0600. Both Git and deployment ignore it. **Download it privately from the workspace Files panel; it is not in GitHub or the public app.** Also download the checksum, verify it, then encrypt the local copy.
- Original private SQLite migration snapshots remain preserved. They are old development data, not a current production backup.
- Replit PITR is normally enabled with a seven-day window, but its actual setting and restore points were **not verified**. Check Database → Production → Settings → Advanced → Point-in-time recovery. Scheduled backups are normally off; none were enabled here.
- No production restore or external import was performed. See [external restoration](RESTORE_OUTSIDE_REPLIT.md) and the reusable [read-only export query](PRODUCTION_EXPORT.sql).

## Public-source safety
Fetched public branches/tags and scanned their reachable history plus the local publish checkpoint: **16 commits, 520 unique blobs, 10,062,878 bytes**.

No matches were found for the checked provider/GitHub/cloud key patterns, private-key blocks, non-placeholder credential URLs, or historical real `.env`/database/log paths. This is a focused pattern-based check, **not a guarantee that every possible secret format or sensitive string is absent**.

No private row export, database dump, customer records, credentials or sensitive logs are included in this handoff commit. `.env.example` contains placeholders/defaults only. If a credential is later discovered in history, revoke/rotate it first; review history cleanup separately. Do not automatically rewrite shared history.

## Environment variable names
Values belong only in an operator's secret manager, never GitHub issues, documentation, logs or browser code.

Required service/runtime names:
`DATABASE_URL`, `SESSION_SECRET`, `PORT`, `NODE_ENV`, `BASE_PATH`.

Optional direct reasoning-provider names:
`OPENAI_API_KEY`, `OPENAI_MODEL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`.

Reasoning authorization and spending names:
`ALLOW_PAID_API_CALLS`, `MAX_PAID_API_CALLS`, `PRODUCTION_AI_ENABLED`, `PRODUCTION_AI_ACCESS_PASSWORD`, `PRODUCTION_AI_DAILY_CAP`, `PRODUCTION_AI_SESSION_CAP`, `PRODUCTION_AI_BUDGET_START`, `PRODUCTION_AI_BUDGET_END`.

Internal development-Lab names:
`SARVAM_API_KEY`, `VOICE_LAB_ADMIN_PASSWORD`, `ENABLE_SARVAM_LAB`.

Replit-managed proxy names, **not portable outside Replit**:
`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`.

Use your own direct provider credentials if deliberately enabling providers elsewhere. None are necessary for Demo Mode. Do not copy platform proxy credentials to another host.

## Costs and lowest-cost external option
Official published Replit rates checked 23 November:
- Autoscale: **$0.60/million compute units + $0.40/million requests**.
- Production database: **$0.16/compute-hour + $0.35/GiB/month retained storage**; compute suspends after five idle minutes. At roughly 7.84 MiB, nominal storage is approximately $0.003/month before rounding/other charges.
- Example only: 720 active database compute-hours would cost $115.20, not an estimate of this small demo's usage. Idle suspension matters. Data transfer, other resources and account allowances affect the bill.
- Actual accrued charges, current balance, configured account limits and automatic-reload settings were not available to this inspection. No top-up was purchased, no new service provisioned and no auto-reload setting changed.
- Existing hosting/database usage continues during documentation and idle browsing can wake the database. Agent work is effort-billed; no reliable exact cost or enforceable Agent balance cap can be quoted here.

**Lowest recurring cash-cost demo option:** Render Free Node service + Neon Free PostgreSQL, within their limits, with paid AI disabled. Render sleeps after 15 idle minutes and provides 750 free instance-hours/workspace/month. Neon currently includes 100 CU-hours/project/month, 1 GB storage/project and 5 GB egress/project. Free tiers have quotas and no production availability guarantee.

This is **not a verified one-click migration**: add a small same-origin hosting adapter outside Replit to serve the built frontend with Express, or provide an HTTPS gateway routing `/api` to it. The API currently serves only API routes; a static frontend on another origin will not work unchanged with its cookies/CORS. Render's own free Postgres expires after 30 days, so it is not the recommended durable store.

Sources: [Replit rates](https://docs.replit.com/billing/aug-cloud-billing-updates), [billing](https://docs.replit.com/billing/about-usage-based-billing), [Render Free](https://render.com/docs/free), [Neon plans](https://neon.com/docs/introduction/plans).

## Sarvam work to finish elsewhere
This is development, not a one-flag fix; prior planning estimate **60–90 minutes** for readouts alone, not a credit/cost guarantee.
1. Reuse the low-level Sarvam transport, keeping internal Lab administration inaccessible in production.
2. Add a presenter-authorized main-app synthesis endpoint with atomic global/session quotas, input bounds, timeout and no automatic retries.
3. Prepare speech text: remove Markdown/URLs, expand rupee amounts naturally, preserve native Indic script and natural English business terms.
4. Verify the current Bulbul v4 Flash persona catalog for English/Hinglish/Hindi/Kannada; do not use v3 short speaker names with v4.
5. Connect shared Listen controls to real audio playback, cancel/stop/loading, no overlapping clips and short-lived private replay caching.
6. Test with fake transports first. Obtain new explicit approval before one bounded paid verification per necessary path.
STT and human/native-speaker QA are separate. Do not relabel browser TTS or Lab-only tests as main-app Sarvam integration.

## Shutdown after the showcase — not performed
1. Privately download/verify/encrypt the export first. Check real PITR/retention settings and decide how long data must remain.
2. In Replit Publishing, select **Shut down/Unpublish** for the existing deployment. Confirm the scope before accepting. Do not delete the project.
3. Confirm the public URL no longer serves the app and inspect Usage for subsequent charges.
4. Retained production database storage can still bill. Database queries can wake compute; App Storage/custom domains/other deployments or third-party subscriptions can also have independent charges if present. No object-storage integration was identified in this app's persistence path.
5. Idle API keys alone do not generate model usage, but calls from other applications and provider subscriptions can still bill. Check each provider separately.
6. Keep the database unless explicitly authorizing its deletion after verifying the downloaded export. Never equate unpublishing with database deletion or zero total account charges.

No shutdown, resource deletion, new deployment, external-hosting setup or AI reactivation is included in this handoff.
