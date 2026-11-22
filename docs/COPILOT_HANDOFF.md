# Udaan AI release-candidate handoff

**Status: READY WITH LIMITATIONS for the demonstrated development experience.**
**Release tag/checkpoint:** `udaan-rc-2026-11-22` (resolve with `git rev-parse udaan-rc-2026-11-22`).
No feature development, paid retesting, architecture migration, public visibility change or publication is authorized.

## Architecture
React 19 / Vite 7 / TypeScript mobile web app; Express/TypeScript API; contract-first OpenAPI with generated React Query/Zod clients; Prisma 6 / SQLite with committed migrations. Official OpenAI/Anthropic SDKs; server-only Sarvam REST; keyless IndiaRestros REST. The approved React/Vite + server architecture remains unchanged.

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
Final regression: **71 unit/persistence tests passed; 7 browser journeys passed; lint/typecheck and frontend/API production builds passed.** Frozen-lockfile offline install passed. PWA production-build verification passed separately. See `TEST_REPORT.md`.

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

On Replit start the existing managed API Server and Udaan AI workflows. Outside Replit supply frontend `PORT`/`BASE_PATH`, API `PORT`, and a reverse proxy routing `/api` to Express. Serve the built frontend `dist/public/` over HTTPS with SPA fallback, correct JS/manifest MIME types and service-worker scope; never route `/api` failures to index.html.

Browser tests require the running application. On Nix use `CHROMIUM_PATH=$(command -v chromium) pnpm test:browser`; conventional CI installs Playwright Chromium. `scripts/verify-pwa.mjs` uses a temporary production-test server and the running API. Do not run `verify-voice.ts` as part of CI/startup: it is explicitly paid and one-shot guarded.

## Environment names, never values
- Required service configuration: `PORT`, frontend `BASE_PATH`; production `NODE_ENV=production`.
- Stable signed-session secret: `SESSION_SECRET` through Replit Secrets.
- OpenAI: direct `OPENAI_API_KEY`, or provisioned `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`; optional `OPENAI_MODEL`.
- Anthropic: `ANTHROPIC_API_KEY`, or provisioned `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`; optional `ANTHROPIC_MODEL`.
- Reasoning controls: `ALLOW_PAID_API_CALLS`, `MAX_PAID_API_CALLS`. Default off; hard ceiling six. Do not enable/increase without approval.
- Lab: `SARVAM_API_KEY`, `VOICE_LAB_ADMIN_PASSWORD` (12+ characters), optional `ENABLE_SARVAM_LAB`. Production Lab remains disabled.
- `DATABASE_URL` in the template/example is not Udaan's SQLite configuration.

## Honest limitations and next priorities
1. Physical iPhone/Android QA and human microphone/listening review; do not promote Lab speech to main chat yet.
2. Validate durable production storage, backups and appropriate customer/presenter access controls before publishing. Development SQLite durability does not establish production safety.
3. Native-speaker review and additional live-model language coverage require separate scope/budget approval.
4. Discovery remains curated/context-ranked; deterministic learning is not autonomous continuous model training. No real-world impact is established.
5. No offline private-business cache, synchronization or queued mutations. Saved server records survive updates; explicit reloads can discard unsaved inputs.

## Demo, review and mobile access
Use `DEMO_SCRIPT.md` for the exact iPhone checklist, temporary preview URL, three-minute fallback-first path and QR regeneration. `PRODUCT_THESIS.md` contains the candid companion review. `KNOWN_LIMITATIONS.md` is authoritative for unverified claims.

## GitHub and deployment
User approved pushing only reviewed RC source to **private** `amit1858/udaan-ai`; verify GitHub connection, ownership, visibility and existing history first. Do not force-push or replace existing repository contents blindly. If public, stop rather than changing visibility silently. No public app or Pages publishing is authorized.

Exclude credentials, real `.env` files, SQLite databases/journals, logs, caches, dependency/build directories and generated QA artifacts. Include `.env.example`, lockfile, migrations, tests, PWA source/icons, documentation and the existing static thesis.

The existing thesis is built and browser-verified at `/thesis/index.html`; GitHub Pages workflow is manual. It has **not** been published or represented as a new landing page. Repository push approval does not authorize Pages deployment.
