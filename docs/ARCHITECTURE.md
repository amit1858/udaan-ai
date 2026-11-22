# Architecture

## Approved stack
- React 19 + Vite, TypeScript, Tailwind 4, shadcn/ui, Lucide, Recharts.
- Shared Express API; OpenAPI-first contracts, generated React Query hooks and Zod schemas.
- Prisma 6 and SQLite, with committed reproducible migrations. The template's unused PostgreSQL library is not used for Udaan records.
- Official OpenAI and Anthropic SDKs. OpenAI can use either a direct server secret or Replit AI Integrations; Anthropic adapter supports both routes when configured.
- Vitest and Playwright, plus ESLint.

The user explicitly approved React/Vite with a server API rather than the specification's Next.js App Router. This is the only material architecture deviation.

## Request path
Mobile UI → generated typed API client → validation and signed-cookie scope → domain services → Prisma/SQLite.

AI requests additionally prepare saved business profile, recent conversation, experiment records, deterministic financials and learning. Validated structured model output chooses only a known opportunity ID. AI has no mutation tools.

## Persistence
SQLite stores isolated fictional-shop profiles, independent language/provider preferences, conversations, lifecycle events, experiment inputs, outcomes, linked learning facts and a global paid-call audit. Ninety shared sales records are explicitly synthetic.

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
The working development preview persists across server restarts. SQLite durability on a public production host has not been validated; do not claim Autoscale or multi-instance production readiness. No public deployment was authorized.

The separate `website/` is static and GitHub Pages-compatible. It does not host the full application or its database.
