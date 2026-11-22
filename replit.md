# Udaan AI
An AI companion helping Indian restaurant owners discover possibilities, test small ideas and learn from outcomes.

## Authoritative scope
Follow the complete Version 5.0 specification in `attached_assets/UDAAN_MASTER_SPEC_1795335173739.md`.
The user explicitly approved React/Vite with a server API instead of Next.js; all other architecture and product requirements remain governed by the specification.

## Run and verify
- Managed workflows: `artifacts/api-server: API Server`, `artifacts/udaan-ai: web`.
- `pnpm db:init` — generate Prisma client and deploy committed SQLite migrations.
- `pnpm seed` — idempotent synthetic sales seed.
- `pnpm test`, `pnpm lint`, `pnpm run typecheck`.
- `CHROMIUM_PATH=$(command -v chromium) pnpm test:browser` — actual mobile browser scenarios.
- `pnpm --filter @workspace/api-spec run codegen` after every API contract change.

## Product boundaries
Discovery-first, not restaurant management. Four languages remain distinct: English, Hinglish, Hindi, Kannada.
Money uses integer paise. Contribution must never be called net profit. AI cannot approve experiments or execute payments, advertisements or messages.
Keep Demo Mode credential-free, isolate visitor records, and never silently replace failed live inference with demo responses.
Sarvam is the requested preferred speech provider but remains pending at the competition freeze. Reuse the existing reasoning and business memory; never introduce a separate Samvaad agent. Require secure credentials and explicit bounded speech-test approval.

## Permission boundaries
No public deployment, GitHub push or public publication without explicit authorization.
Paid testing was approved up to ₹100. Live attempts are persistently capped at six; never increase this without authorization.

## Documentation
Maintain `docs/IMPLEMENTATION_STATUS.md` and `docs/JUDGING_ALIGNMENT.md`.
Report actual tests and provider evidence, never inferred passes or fictional business impact.
The separate static `website/` is prepared only after the core application is validated.
