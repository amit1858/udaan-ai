# Production readiness and publishing handoff

**Historical preparation report from 22 November.** Publication subsequently
succeeded and source visibility was explicitly changed to public by the owner.
Read `FINAL_HANDOFF.md` for current deployment, expired AI access, private data
export and cost-control instructions; earlier pending-publication statements
below are retained as historical evidence.

## Status
Ready for **owner-approved, restricted-access Demo Mode publishing**, not a public customer launch. Nothing has been published by the agent. No additional paid database service was provisioned: only the included development PostgreSQL was used.

The immutable original release is `udaan-rc-2026-11-22`, commit `ebe3c64ba7db318749e4839478a5074d59f7a886`. Before changing storage, GitHub's private repository was verified against all 373 original source blobs: no missing or changed files, no truncated response, and the remote tag resolved to that exact commit.

Separate post-migration checkpoint: `udaan-production-ready-2026-11-22` (resolve its commit with `git rev-parse udaan-production-ready-2026-11-22^{}`). The original tag is not moved.

## Storage preservation and rollback
- Original SQLite database remains untouched at `artifacts/api-server/prisma/udaan.db`.
- Consistent online backups, integrity-checked, excluded from Git/deployment, and permission-restricted:
  - `generated-artifacts/pre-postgres-backup/udaan-rc-2026-11-22.sqlite`
  - `generated-artifacts/pre-postgres-backup/udaan-final-cutover.sqlite`
- Final cutover backup SHA-256: `93abb9fd1a1b32a19b354fb19973dff427385e2e590fb847b4e3f22a46271610`.
- Stopped the API before the final backup so writes could not be lost during cutover. Imported in one transaction, preserving primary IDs, profiles, language/provider preferences, timestamps, conversations, experiment states/timelines/results/learning and audit records.
- Field-by-field canonical checksums matched for all seven tables: **59 sessions, 90 synthetic sales days, 43 experiments, 40 messages, six reasoning audit records, one Lab configuration and four speech audit records**. Counts include an explicitly synthetic migration fixture.
- PostgreSQL holds those existing development records; publishing does **not** authorize copying private development data into production. Production starts with the same schema and only the deliberately synthetic baseline, seeded idempotently by the API.
- The managed PostgreSQL database measured about 8 MiB after migration.

### Rollback procedure
1. Stop the API and record the current post-migration commit. Do not delete PostgreSQL records.
2. Check out the original tag on a separate rollback branch, leaving the new production-ready tag intact.
3. Use the retained original SQLite file. If recovery from the backup is required, restore it with SQLite's backup API while the API is stopped; do not overwrite a running database.
4. Run the original tag's frozen-lockfile install and `pnpm db:init` to regenerate the SQLite Prisma client; restart the existing managed API workflow.
5. Verify the saved migration fixture's profile, messages and 70/130-unit completed results.

**Important:** new records written after cutover exist in PostgreSQL, not in the old SQLite snapshot. A rollback must preserve/reconcile those records before returning to SQLite. It is not an automatic bidirectional synchronization. Local backup files are private workspace files, not a separately hosted disaster-recovery service; do not commit or publish them.

## What was verified after migration
- PostgreSQL schema exactly matches the committed Prisma model: no schema difference.
- **31 financial/persistence tests and five production-mode API tests passed**, with API TypeScript and repository lint passing.
- Existing profile, preferences, conversation and full experiment/result HTTP responses were identical before and after the real API process restart and database cutover.
- Fresh production-mode Demo chat, both owner-confirmed experiment journeys, ₹2,280/₹5,520 results, different next ideas, cross-visitor isolation and rejection of completed-result overwrites passed.
- All tested direct production Lab routes—including status and login—return **404**, even with the development Lab flag set true.
- Paid reasoning stays disabled in production even if an environment variable mistakenly enables it. No paid provider/speech calls occurred.
- Actual production application configuration loaded with the existing server-side Secrets. Missing/short production signing secrets fail explicitly.
- `/api/healthz` returned 200; unknown `/api` requests returned 404 rather than the SPA.
- Existing production manifest, service worker, standalone display and 192/512/maskable assets are present. No PWA logic was changed. Earlier controlling-worker/offline/reconnection evidence remains valid; the 390 px preview screenshot was healthy.

Historical evidence: original 71 tests, seven browser journeys and full frontend/PWA verification are described in `TEST_REPORT.md`. The full browser suite was deliberately not repeated for this infrastructure-only change.

## Chosen configuration and spending safeguards
- Existing target: **Autoscale**, not an always-on VM.
- Frontend: static `artifacts/udaan-ai/dist/public`, root SPA routing.
- API: Node production entrypoint `artifacts/api-server/dist/index.mjs`, port 8080, health `/api/healthz`, `NODE_ENV=production`; `/api` is routed before `/`.
- Prisma client generation is part of build; schema mutation is **not** part of build/startup. `db:init` and the one-time SQLite import explicitly reject production.
- Development schema uses committed PostgreSQL migrations. Replit Publish is responsible for the managed production schema diff.
- Required runtime Secrets: managed `DATABASE_URL`, stable `SESSION_SECRET` of at least 32 characters. Keep values out of source/chat/screenshots.
- Paid environment switches are `ALLOW_PAID_API_CALLS=false`, `MAX_PAID_API_CALLS=0`. Production code independently blocks inference; production Lab is blocked at router level.
- In Publishing, choose the **smallest offered capacity and maximum one instance** initially. Those capacity controls are selected in the Publishing UI, not claimed as already saved by the agent. Do not add uptime monitors that keep compute/database awake.
- Choose **Private** access for owner QA; use Replit sign-in on iPhone. Private GitHub source does not itself make the hosted app private. Do not make the application public without approval.

## Expected recurring charges — confirm before clicking Publish
Current official pricing checked on 2026-11-22:
- Included development PostgreSQL: free; base allowance 20 GB.
- Autoscale: $1/month base + $3.20/million compute units + $1.20/million requests.
- Production PostgreSQL: $0.16/compute-hour + $1.50/GiB-month storage; compute suspends after five idle minutes, storage remains billed.
- Static hosting itself is free; data transfer $0.05/GiB.

An **illustrative low-use month**, not a measured forecast: 100,000 app compute units, 10,000 requests, 30 database compute-hours and 10 MiB database storage is approximately **$6.15 plus transfer**. Actual active compute and usage determine cost. A database active 24 hours/day can exceed $115/month; do not assume a free production tier or guaranteed monthly ceiling.

Check the actual machine-price estimate, included credits, current balance and budget controls in Publishing/Billing. The agent cannot see the live balance or guarantee a below-$5 alert. Set a spending alert and budget limit that protect the user's $5 reserve before enabling hosting. No additional paid AI/speech allowance is authorized.

Sources: https://docs.replit.com/billing/aug-cloud-billing-updates and https://docs.replit.com/billing/about-usage-based-billing .

## Exact publishing and iPhone steps
1. Review this report and the new GitHub checkpoint. Open Replit **Publishing → Adjust settings**.
2. Keep Autoscale, minimum offered capacity and maximum one instance. Confirm the displayed price and choose **Private** access for initial QA.
3. Confirm production Secrets include managed `DATABASE_URL` and the stable `SESSION_SECRET`. Keep paid calls off; the Lab remains code-blocked.
4. Review the production database schema diff for the seven Udaan tables/indexes/foreign keys. Do not select overwrite/copy development data; stop on unexpected destructive changes. Do not add production migration commands.
5. Review geography **before first publish**, because it is fixed afterward. Confirm the available region and quoted costs in the UI.
6. Only after explicit approval, the user clicks **Publish**. Replit builds the static frontend/API, applies the managed schema diff and provides HTTPS. No production URL exists until that succeeds.
7. Retrieve the actual published URL; open `/api/healthz` and the app in iPhone **Safari**, outside the embedded preview. Sign into the authorized Replit account if prompted.
8. Complete Demo discovery → chat → evaluate → experiment → synthetic result → learning; reload and verify the saved record. Recheck the saved record after an approved process/release restart.
9. Safari **Share → Add to Home Screen → Add**. Launch the icon online once, then check the offline shell in airplane mode and reconnect. Private business data is not offline-cached.
10. Initial production voice uses the existing browser capabilities only. Real iPhone microphone/permissions and pronunciation remain manually unverified; the internal paid Sarvam Lab is intentionally inaccessible. Do not rerun paid tests.

## Remaining risks
First hosted build/managed schema application, actual production HTTPS/routing, physical iPhone installation/microphone and real hosting bills can only be confirmed after the approved publish. Visitor cookies isolate fictional demonstration records, but are not customer-account authentication. Keep initial access restricted and real customer/private business data out of the demo.
