# Udaan AI release-candidate handoff

## Current status — 23 November 2026
**Final documentation/source handoff; no new Replit development cycle.**
Read `FINAL_HANDOFF.md` first for current evidence, costs, export and shutdown;
use `RESTORE_OUTSIDE_REPLIT.md` for operator restoration.

The app is published publicly on Replit Autoscale. Source is public by explicit
owner approval. The latest local publish checkpoint is `d2e7c6a`; its source
tree equals pushed application commit `be6198a`. Final handoff tag:
`udaan-final-handoff-2026-11-23`. Preserve the original `udaan-rc-2026-11-22`.

The approved reasoning window **expired at 6:50 PM IST on 22 November**;
live OpenAI/Anthropic currently report spending disabled. Do not renew it.
Main-app Sarvam is not integrated; keep all Lab routes 404 in production.
No feature development, new paid infrastructure, shutdown or paid testing is
approved by this documentation handoff.

## Architecture
React 19 / Vite 7 / TypeScript mobile web app; Express/TypeScript API; contract-first OpenAPI with generated React Query/Zod clients; Prisma 6 / managed PostgreSQL with committed development migrations. Official OpenAI/Anthropic SDKs; server-only Sarvam REST; keyless IndiaRestros REST. React/Vite + server architecture and all API contracts remain unchanged.

Paths: frontend `artifacts/udaan-ai`, API `artifacts/api-server`, contract `lib/api-spec/openapi.yaml`, static thesis `website/` and frontend `public/thesis/`. See `ARCHITECTURE.md`.

## Verified by execution
- Complete discovery → discussion → financial evaluation → owner-approved experiment → confirmed result → different outcome-sensitive next recommendations.
- ₹99/₹45/₹1,500 combo: 70 units → ₹2,280; 130 → ₹5,520. Money stored/calculated in integer paise; contribution is not net profit.
- Persistent isolated fictional business context, immutable completed outcomes, linked follow-up, session-scoped reset.
- Four-language state persistence and 360/390 px layouts.
- Five genuine OpenAI calls and one genuine Anthropic call; six-attempt reasoning allowance exhausted.
- Four genuine Sarvam requests in the protected Lab; **generated-audio verification only**, estimated ₹1.27 pre-GST. Human capture/pronunciation unverified; paid speech disarmed.
- Real IndiaRestros fresh request plus cached repeat: three upstream HTTP 200s, two search results/90 raw menu items, one restaurant/three relevant vegetarian items shown. See `PROVIDER_VERIFICATION.md`.
- Official PWA manifest, controlling service worker, no private API caching, offline shell, reconnection, waiting-update confirmation and zero Chromium installability errors. **Not physically installed on Android/iPhone.**

## Tests and reproducibility
Historical results: **71 unit/persistence tests passed; 7 browser journeys passed; lint/typecheck and frontend/API production builds passed.** After PostgreSQL migration: **36 targeted financial/persistence/production checks passed**. The later controlled-AI candidate covered **49 unique targeted checks**, with API/frontend builds, typechecks and lint passing. No suites or paid API checks were repeated for the final handoff. See `TEST_REPORT.md` and `CONTROLLED_LIVE_AI.md`.

```sh
pnpm install --frozen-lockfile
pnpm db:init
pnpm seed
pnpm test
pnpm lint
pnpm run typecheck
pnpm --filter @workspace/api-server run build
PORT=25711 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/udaan-ai run build
```

Before the commands above, configure a development PostgreSQL `DATABASE_URL` through Secrets or the included managed database. `db:init` rejects production. On Replit start the existing managed API Server and Udaan AI workflows. Production schema changes use Replit Publish, not those development commands. Outside Replit supply frontend `PORT`/`BASE_PATH`, API `PORT`, and a reverse proxy routing `/api` to Express. Serve the built frontend `dist/public/` over HTTPS with SPA fallback, correct JS/manifest MIME types and service-worker scope; never route `/api` failures to index.html.

Browser tests require the running application. On Nix use `CHROMIUM_PATH=$(command -v chromium) pnpm test:browser`; conventional CI installs Playwright Chromium. `scripts/verify-pwa.mjs` uses a temporary production-test server and the running API. Do not run `verify-voice.ts` as part of CI/startup: it is explicitly paid and one-shot guarded.

## Environment names, never values
- Required service configuration: `PORT`, frontend `BASE_PATH`; production `NODE_ENV=production`.
- Stable signed-session secret: `SESSION_SECRET` through Replit Secrets.
- OpenAI: direct `OPENAI_API_KEY`, or provisioned `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`; optional `OPENAI_MODEL`.
- Anthropic: `ANTHROPIC_API_KEY`, or provisioned `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`; optional `ANTHROPIC_MODEL`.
- Reasoning controls: development uses `ALLOW_PAID_API_CALLS` and `MAX_PAID_API_CALLS`; production has separate presenter/window/quota controls listed in `FINAL_HANDOFF.md`. The window is expired. Do not enable/increase without approval.
- Lab: `SARVAM_API_KEY`, `VOICE_LAB_ADMIN_PASSWORD` (12+ characters), optional `ENABLE_SARVAM_LAB`. Production Lab remains disabled.
- Required `DATABASE_URL` now points to managed PostgreSQL; never hardcode or expose it. The old SQLite source/file remain available at the original release tag.

## Honest limitations and next priorities
1. Physical iPhone/Android QA and human microphone/listening review; do not promote Lab speech to main chat yet.
2. PostgreSQL migration and production publication are complete. A private one-time production row export is prepared; it is not a full backup or a verified external restore. Physical-device checks remain unverified.
3. Native-speaker review and additional live-model language coverage require separate scope/budget approval.
4. Discovery remains curated/context-ranked; deterministic learning is not autonomous continuous model training. No real-world impact is established.
5. No offline private-business cache, synchronization or queued mutations. Saved server records survive updates; explicit reloads can discard unsaved inputs.

## Demo, review and mobile access
Use `DEMO_SCRIPT.md` for the exact iPhone checklist, temporary preview URL, three-minute fallback-first path and QR regeneration. `PRODUCT_THESIS.md` contains the candid companion review. `KNOWN_LIMITATIONS.md` is authoritative for unverified claims.

## GitHub and deployment
User explicitly approved keeping `amit1858/udaan-ai` **public** and pushing reviewed source. Use `fix/controlled-production-ai`; do not overwrite `main`, unrelated branches or existing tags. The separate Pages showcase PR #1 is merged on `main`; preserve it. No force-push, new publication or resource deletion is approved by this handoff.

Exclude credentials, real `.env` files, SQLite databases/journals, logs, caches, dependency/build directories and generated QA artifacts. Include `.env.example`, lockfile, migrations, tests, PWA source/icons, documentation and the existing static thesis.

The original thesis remains at `/thesis/index.html`. The later GitHub Pages showcase is separate work on `main`, with its merged PR preserved. This handoff does not rebuild, redeploy or replace either website.
