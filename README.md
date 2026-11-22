# Udaan AI
**Your business. New possibilities. Every day.**

A multilingual discovery-to-learning companion for Indian restaurant owners. Built in response to RFS 76 at Product (Un)Conference 2026 Builders' Day.

## What works
Image-led discovery, contextual conversation, editable persistent business profile, exact-money evaluation, owner-approved seven-day experiments, recorded results and outcome-sensitive next recommendations.

English, Hinglish, हिन्दी and ಕನ್ನಡ are independent output preferences. Switching language or provider retains business records.

The credential-free **Demo Engine** works without an API key. OpenAI has been genuinely verified with saved business context and both stored result scenarios. Anthropic is implemented but unverified without credentials.

**Market Inspiration** retrieves attributed Whitefield menu facts from the documented IndiaRestros API. It separates source facts, periodic freshness and AI/Demo hypotheses, and connects to an affordable experiment.

**Sarvam voice is pending**, not implemented: official models were researched, but credentials and bounded speech-test authorization were unavailable at the feature freeze. See `docs/SARVAM_VOICE_STATUS.md`.

## Quick start on Replit
```sh
pnpm install --frozen-lockfile
pnpm db:init
pnpm seed
```
Start the managed **API Server** and **Udaan AI** workflows. The web application is at `/`, the API at `/api`, and the separate static product-thesis preview at `/thesis/`.

Replit's managed services supply `PORT` and `BASE_PATH`. Do not start a duplicate root development server. Outside Replit, provide equivalent reverse-proxy routing to the separate frontend and API services.

## Stack and approved architecture
React 19/Vite, Express, TypeScript, Tailwind, shadcn/ui, Lucide, Recharts, Prisma 6/SQLite, Zod/OpenAPI code generation, official OpenAI/Anthropic SDKs, Vitest and Playwright.

The user explicitly approved React/Vite with a server API instead of the master specification's Next.js. No change to the specified persistence or core behavior was needed.

## AI configuration and spending
Add direct-provider credentials only through Replit Secrets, or use Replit AI Integrations. Never put keys in chat or source.

`.env.example` documents names, not real values. Without credentials the app still launches in Demo Mode.

Paid requests require `ALLOW_PAID_API_CALLS=true` and a positive `MAX_PAID_API_CALLS`. This competition build hard-caps the total persistent allowance at **six live attempts**, with no automatic retries. The user authorized testing up to ₹100. Check remaining allowance before a live stage demonstration.

Providers never silently substitute deterministic answers for failed live inference.

## Verification
```sh
pnpm test
pnpm lint
pnpm run typecheck
pnpm --filter @workspace/api-server run build
# With the two managed workflows running:
CHROMIUM_PATH=$(command -v chromium) pnpm test:browser
```
On conventional Linux CI, `pnpm exec playwright install --with-deps chromium` supplies a browser; `CHROMIUM_PATH` is only needed for the Nix browser wrapper.

After an OpenAPI change: `pnpm --filter @workspace/api-spec run codegen`.

## Key files
- `attached_assets/UDAAN_MASTER_SPEC_1795335173739.md` — authoritative Version 5.0 specification.
- `artifacts/udaan-ai/` — mobile-first application.
- `artifacts/api-server/src/udaan/` — finance, learning, AI and persistence.
- `artifacts/api-server/prisma/` — SQLite schema and migrations.
- `lib/api-spec/openapi.yaml` — API contract.
- `website/` — separate static product thesis for GitHub Pages.
- `docs/` — architecture, implementation status, judging evidence, tests, demo and limitations.
- `generated-artifacts/` — ignored screenshots, actual videos, live-test evidence and review archive.

## Trust and publication
Ravi, his business and 90-day sales data are fictional. Sample results do not prove real business improvement. Contribution is not net profit.

Browser sessions are isolated. Reset affects only the current demonstration. No actual payments, ads, WhatsApp messages or orders are executed.

No public application deployment, repository push or GitHub Pages publication is authorized by this source preparation. The proposed repository name is not a verified live link.

Photo credit: Saind147, South Indian breakfast, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [source](https://commons.wikimedia.org/wiki/File:South_Indian_Breakast_Idli_Vada_Sambar_Chutney.JPG). All other illustrations are original concept artwork. Full credits are available in the application's `/credits.html`.
