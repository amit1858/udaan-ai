# Architecture

## Approved stack
- React 19 + Vite, TypeScript, Tailwind 4, shadcn/ui, Lucide, Recharts.
- Shared Express API; OpenAPI-first contracts, generated React Query hooks and Zod schemas.
- Prisma 6 and managed PostgreSQL, with committed development migrations. The original SQLite release/data are preserved for rollback; see `PRODUCTION_READINESS.md`.
- Official OpenAI and Anthropic SDKs. OpenAI can use either a direct server secret or Replit AI Integrations; Anthropic adapter supports both routes when configured.
- Vitest and Playwright, plus ESLint.

The user explicitly approved React/Vite with a server API rather than the specification's Next.js App Router, then separately approved SQLite-to-PostgreSQL migration for production durability. Product behavior and API contracts remain unchanged.

## Request path
Mobile UI → generated typed API client → validation and signed-cookie scope → domain services → Prisma/PostgreSQL.

AI requests additionally prepare saved business profile, recent conversation, experiment records, deterministic financials and learning. Validated structured model output chooses only a known opportunity ID. AI has no mutation tools.

## Persistence
PostgreSQL stores isolated fictional-shop profiles, independent language/provider preferences, conversations, lifecycle events, experiment inputs, outcomes, linked learning facts and a global paid-call audit. Ninety shared sales records are explicitly synthetic. Existing development records were imported transactionally and verified field-by-field.

All money stored for experiments and sales is integer paise. Public API amounts are INR rupees with at most two decimal places.

Completed results are immutable. Transitions use server-side validation and compare-and-set updates. A follow-up experiment can retain the completed parent's ID. Learning is persisted as language-neutral facts, localized at read time, and used in the next Home discovery.

## Isolation and trust
A random opaque visitor ID is signed, HTTP-only, SameSite=Lax, Secure on HTTPS, and scoped to `/api/udaan`. Every record lookup and mutation is scoped to that session. No account login is implemented or implied. This is an isolated fictional demonstration, not production multi-tenant authentication.

Mutations reject mismatched browser origins. Request logs exclude query strings, cookies, bodies, profile content and provider errors. Provider responses are normalized, output lengths bounded, calls timed out, and automatic retries disabled for the bounded test budget.

Live requests require configured credentials and `ALLOW_PAID_API_CALLS=true`. The entire workspace has a durable maximum of six paid attempts. Credentials and usage values never enter browser code. Public hosting would require presenter access control before enabling paid calls.

## Financial and learning boundary
The deterministic service calculates unit contribution, total revenue, variable costs, promotion spend, modeled contribution and cumulative promotion break-even. Rent, salaries and taxes are excluded. AI explains these figures; it does not approve, execute, or authoritatively calculate transactions.

Learning branches: insufficient activity, loss/nonpositive margin, below target, above target, on target. Below-target positive contribution suggests a ₹600 visibility test as a hypothesis; above-target positive contribution suggests repeat-customer testing or controlled expansion. Loss/insufficient evidence suggests no-spend validation.

## Hosting boundary
The PostgreSQL-backed development preview was verified across the migration/restart with identical saved HTTP responses. Managed production schema is applied by Replit Publish, never startup DDL. Initial production is restricted-access Demo Mode: inference and every Lab endpoint are blocked in production. Actual hosting, HTTPS and physical-device checks await the user's approved publish.

The separate `website/` is static and GitHub Pages-compatible. It does not host the full application or its database.

## PWA and voice boundaries
- Official `vite-plugin-pwa` 2 / Workbox 7.4 on Vite 7; standalone manifest, branded 192/512 PNGs, maskable icon and Apple touch icon.
- Only public build assets are precached. No API runtime-cache routes, credentials, business responses, restaurant responses or speech recordings are cached. Cached shell launch does not imply offline business operations.
- Updates wait for confirmation. Open forms remain mounted during connectivity loss; saved experiments remain on the server. No offline write queue or automatic synchronization exists.
- The service worker is production-build-only. The embedded development preview is not a claimed installed PWA.
- The development-only Voice Lab uses a separate secret password, signed HttpOnly visitor-bound sessions, expiration/revocation, explicit spending authorization and persistent attempt accounting.
- Sarvam STT/TTS feeds the existing contextual conversation route; main-chat browser voice remains unchanged. Audit records contain metadata, not audio/transcripts.
- The six-attempt ceiling above refers to reasoning. All six were used. Sarvam's separate four-call verification finished and its paid switch was disabled.
