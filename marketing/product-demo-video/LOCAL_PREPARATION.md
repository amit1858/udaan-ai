# Option B - local preparation and verified recording

## Actual status

The actual-source local prototype now builds and runs against isolated
PostgreSQL 18.6. Two genuine complete takes are preserved; the refined take
includes the visible native Rs3,900/Rs2,280 contribution tooltip. See
PRODUCTION_STATUS.md for actual paths and proof. This is not deployed evidence.
The dependency recovery and pending-decision statements below are historical;
the later autonomous user direction permitted the documented external runtime
adaptation while keeping tagged application files unchanged.

The complete source at handoff commit
`de9283e1c8a1d08cf62fd9832e0d14df84749d43` was extracted outside this worktree.
All **388 archived files** were compared byte-for-byte with the preserved Git
archive: zero changed or missing files. Archive SHA-256:
`f764c50784b8dcaa47f58ad8703ace29524acafa9941241c62a8598ea838cc2d`.
No application manifest, source, schema or configuration was edited.

Private session artifacts, relative to the session's `files` directory:

- `local-tag-source.zip`: preserved full tagged source.
- `local-runtime\source`: unchanged source with external runtime module junctions.
- `local-runtime\dependencies`: private compatibility manifest/lockfile and 625 installed packages.
- `local-demo-02`: refined native raw recording, 24 screenshots and sanitized evidence.
- `MASTER_BRIEF.txt`: unchanged complete original brief.

Runtime/source/database are not committed. Only preparation tooling and this
handoff are under `marketing/product-demo-video`.

## Historical exact-version blocker and attempts

Node 24.16.0 x64 and isolated pnpm 10.26.1 were used. Every application installation
attempt preserved the lockfile with `install --frozen-lockfile --ignore-scripts`.
The isolated marketing tooling installation succeeded; application installation
did not:

| Attempt | Observed failure |
| --- | --- |
| Configured public package proxy | HTTP 404 for `minimatch/-/minimatch-11.0.9.tgz` |
| Direct `registry.npmjs.org` | TLS `EPROTO` handshake failure; no TLS checks were disabled |
| Public `1es-public` npm feed | HTTP 404 for the same exact minimatch tarball |

822 of the 858 resolved application packages were available at the last attempt;
this is **not a usable installation**. API-relative module resolution still
reports `MODULE_NOT_FOUND` for Prisma, Anthropic SDK and OpenAI. Other unavailable
pinned requests in the direct-registry attempt included SDKs and Babel packages,
not merely optional lint tooling. No full build, migration or app startup was
attempted against this incomplete tree.

Resume only with an accessible registry/cache serving the exact pinned versions
and integrity-checked tarballs. If this instead requires dependency substitutions
or build/source changes, report the proposed deviations before doing them.
Do not downgrade dependencies silently, disable TLS validation, mock provider
modules/responses, enable paid providers, or use the deployed app as a fallback.

Windows native-package preparation and Prisma engine generation may present
additional issues after restoration; they have not been tested and are not
claimed to work.

### Narrow trusted-HTTPS recovery

Official `https://registry.npmjs.org/minimatch/11.0.9` metadata and
`https://registry.npmjs.org/minimatch/-/minimatch-11.0.9.tgz` were tested without
requesting any provider or production endpoint:

| Trusted HTTPS route | Exact observed result |
| --- | --- |
| Windows `Invoke-WebRequest` to metadata and tarball | Could not create SSL/TLS secure channel; no HTTP response |
| Native `curl.exe` 8.22.0 / Schannel to both URLs | Exit 35; `SEC_E_ILLEGAL_MESSAGE (0x80090326)` during handshake |
| Explicit TLS 1.2 with both Windows clients, metadata only | Same secure-channel/Schannel handshake failure |
| Node 24 `--use-system-ca`, metadata only | `EPROTO`, TLS alert 40, handshake failure |

Therefore **official upstream existence of minimatch 11.0.9 remains unknown**.
A mirror 404 is not proof of upstream absence. No official metadata or tarball
was recovered, and no tarball was substituted or accepted without verification.
No TLS verification bypass, certificate installation, broad reinstall, package
version change or production/provider request followed these checks.

Existing private package contents were compared by their actual package
name/version with the lockfile, accounting for hashed Windows store paths and
broken links. The following **37 non-platform-specific pinned entries** still
lack readable matching package metadata. This is an incomplete-install
inventory, not a claim that each package returned an upstream HTTP 404:

```text
@anthropic-ai/sdk@1.12.0
@babel/generator@7.29.15
@babel/helper-string-parser@7.29.15
@babel/helper-wrap-function@7.29.15
@babel/parser@7.29.15
@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression@7.29.7
@babel/plugin-transform-block-scoping@7.29.15
@babel/plugin-transform-computed-properties@7.29.15
@babel/plugin-transform-duplicate-keys@7.29.15
@babel/plugin-transform-explicit-resource-management@7.29.15
@babel/plugin-transform-export-namespace-from@7.29.15
@babel/plugin-transform-for-of@7.29.15
@babel/plugin-transform-modules-systemjs@7.29.15
@babel/plugin-transform-regenerator@7.29.15
@babel/plugin-transform-spread@7.29.15
@babel/traverse@7.29.15
@babel/types@7.29.15
@typescript-eslint/eslint-plugin@8.73.0
@typescript-eslint/parser@8.73.0
@typescript-eslint/project-service@8.73.0
@typescript-eslint/scope-manager@8.73.0
@typescript-eslint/tsconfig-utils@8.73.0
@typescript-eslint/type-utils@8.73.0
@typescript-eslint/types@8.73.0
@typescript-eslint/typescript-estree@8.73.0
@typescript-eslint/utils@8.73.0
@typescript-eslint/visitor-keys@8.73.0
@vitest/mocker@5.1.1
@vitest/spy@5.1.1
ignore@7.0.16
minimatch@11.0.9
openai@7.62.0
standardwebhooks@1.3.0
terser@5.51.4
tinybench@6.2.4
typescript-eslint@8.73.0
vitest@5.1.1
```

Seven absent platform entries are classified separately rather than attributed
to the HTTPS failure: esbuild linux-x64 0.28.2, napi-rs lzma linux-x64-gnu
1.5.1, Rollup linux-x64-gnu 4.64.5, Tailwind oxide linux-x64-gnu and
wasm32-wasi 4.3.3, fsevents 2.3.3, and lightningcss linux-x64-gnu 1.32.0.
The earlier 822 figure is the installer's cache counter, not a finished or
integrity-verified application installation.

### Final mirror check and concrete compatibility decision

Verified-TLS Windows requests to `registry.npmmirror.com` and the established
Yarn mirror `registry.yarnpkg.com` failed secure-channel negotiation for all
five exact metadata targets: minimatch 11.0.9, Prisma 6.19.3, Prisma client
6.19.3, Anthropic SDK 1.12.0 and OpenAI 7.62.0. Neither mirror supplied an HTTP
response. This concludes exact-version mirror recovery; it does not prove
upstream versions absent.

A **not-yet-approved, local-only compatibility option** is now concrete:
retain the complete tagged application source byte-for-byte and construct a
separate runtime-only dependency manifest/lockfile outside this repository.
Do not restore the entire lint/test workspace just to run the app. Original
lockfile references show minimatch 11.0.9 is used by ESLint/typescript-eslint;
ignore 7.0.16 is lint-only, and tinybench/Vitest mocker/spy are test-only.
Exclude those tools rather than changing application behavior to bypass them.
Use the marketing Playwright recorder for the actual journey.

Available replacements were inspected through the already functioning public
package feed. The following candidate tarballs returned HTTP 200 and matched
their public-feed metadata digest. SDKs and the newer Babel patch candidates
had SHA-512 SRI; older Babel plugins, Terser and standardwebhooks had legacy
SHA-1 metadata. They were inspected in memory, **not installed, extracted,
executed, or used as replacements**. Candidate metadata is not a substitute
for the original frozen integrity and does not establish exact-tag equivalence.

| Dependency | Frozen version | Available candidate for the proposed runtime |
| --- | --- | --- |
| `@anthropic-ai/sdk` | 1.12.0 | 1.9.0 |
| `openai` | 7.62.0 | 7.57.0 |
| `standardwebhooks` (Anthropic dependency) | 1.3.0 | 1.1.1 |
| `terser` (Vite/PWA build dependency) | 5.51.4 | 5.51.2 |
| `@babel/generator` | 7.29.15 | 7.29.14 |
| `@babel/helper-string-parser` | 7.29.15 | 7.29.14 |
| `@babel/helper-wrap-function` | 7.29.15 | 7.29.14 |
| `@babel/parser` | 7.29.15 | 7.29.14 |
| `@babel/plugin-transform-block-scoping` | 7.29.15 | 7.29.13 |
| `@babel/plugin-transform-computed-properties` | 7.29.15 | 7.29.7 |
| `@babel/plugin-transform-duplicate-keys` | 7.29.15 | 7.29.7 |
| `@babel/plugin-transform-explicit-resource-management` | 7.29.15 | 7.29.7 |
| `@babel/plugin-transform-export-namespace-from` | 7.29.15 | 7.29.7 |
| `@babel/plugin-transform-for-of` | 7.29.15 | 7.29.13 |
| `@babel/plugin-transform-modules-systemjs` | 7.29.15 | 7.29.8 |
| `@babel/plugin-transform-regenerator` | 7.29.15 | 7.29.8 |
| `@babel/plugin-transform-spread` | 7.29.15 | 7.29.11 |
| `@babel/traverse` | 7.29.15 | 7.29.14 |
| `@babel/types` | 7.29.15 | 7.29.14 |

Keep Prisma and Prisma client **6.19.3**, not the advertised Prisma 7 latest.
Their inspected tarballs matched the **original frozen lockfile integrity**.
The unchanged Safari ID-destructuring Babel plugin 7.29.7 also matched its
original frozen integrity. These packages need proper local installation and
module linking, not version changes.

The original workspace suppresses Windows optional binaries. The external
runtime would explicitly provide matching x64 binaries, without changing
application configuration: `@esbuild/win32-x64@0.28.2`,
`@rollup/rollup-win32-x64-msvc@4.64.5`,
`lightningcss-win32-x64-msvc@1.32.0` and
`@tailwindcss/oxide-win32-x64-msvc@4.3.3`. All four inspected tarballs returned
200 and matched their candidate metadata digest. They are not present in the
original frozen lockfile, so adding them is an explicit runtime adaptation,
not a claim of frozen dependency restoration.

**Required decision:** approve that private runtime dependency/lockfile
adaptation while keeping every tagged application file unchanged, or supply
an accessible exact-version cache instead. Do not apply it without a decision.
No migration/schema changes, mock SDKs, provider activation or production
interaction are part of this option.

Expected impact is dependency/module-resolution and build-output differences,
not intentional UI/business-logic changes. `providers.ts` uses conventional
default SDK imports, `chat.completions.create` and `messages.create`; its
deterministic Demo branch returns before either client is constructed. Thus
no application source change is presently identified for this local Demo path.
Older SDK live-provider behavior is **not verified and must remain disabled**.
Babel stays on major 7; using the feed's Babel 8 latest would be an unnecessary
breaking change. Regenerated artifacts cannot be represented as lockfile-exact
handoff builds or deployed evidence.

The new dependency graph, Prisma native-engine availability, build and UI
conformance remain untested. After approval, stop again if additional source
changes are required; otherwise verify unchanged source, genuine local
interactions, persistence, arithmetic and recommendation before recording.
No running app or product recording can honestly be opened or claimed yet.

## Prepared runtime wrapper - not end-to-end verified

`scripts/local-runtime.mjs` is an **unexecuted application-runtime draft**.
Its syntax check passed, and its outside-repository guard was exercised:
the worktree root was rejected before database initialization.
It resolves required application tools before any database initialization.
This evidence is not proof of a running or fully isolated application.

The wrapper is designed to use:

- PostgreSQL on `127.0.0.1:55432`, database `udaan_demo_local`;
  fresh local cluster only, no host-user creation.
- Actual tagged Express app and seeding, loopback API on port 4318.
- Actual tagged frontend build, loopback static/API serving on port 4317.
- Allowlisted runtime environment, generated local-only password/session secret,
  disabled paid flags, and rejected non-loopback backend fetches.
- A `STOP` file in the private runtime root for controlled shutdown.

It refuses an existing database instead of overwriting it. A failed preparation
after initialization requires deliberate recovery of that specific private
cluster; do not blindly rerun or delete broad directories.

After a successful exact dependency installation, use an existing Node 24
runtime and put its directory on PATH:

```powershell
$env:LOCAL_RUNTIME_ROOT = 'C:\absolute\private-session-files\local-runtime'
node marketing\product-demo-video\scripts\local-runtime.mjs
```

Do not declare readiness until real loopback listeners, database address/name,
provider-disable behavior, unchanged tracked source and application responses
have been verified. Browser recording must additionally reject external
provider requests. The refined recorder allows the actual tagged service worker,
which precaches only bundled public files and has no API runtime caching; blocking
it previously caused an offline-setup warning over the draft CTA. The backend fetch guard alone is not a
system-wide network sandbox.

## Remaining local recording and voice gates

Once the runtime is verified, record the genuine planned journey in
RECORDING_PLAN.md: Discover, Explore, Evaluate, Try, Measure, Learn.
Use price 99, making cost 45, promotion 1500, target 100 units, seven days;
save the app's synthetic 70-unit result and observe its actual recommendation.
Expected modeled contribution is 3900 at target and 2280 at 70 units,
after promotion and before overhead. Promotion break-even is 28 total units.
Verify, rather than manufacture, the resulting 600-budget visibility hypothesis,
70% achievement, persisted experiment and zero paid-provider/voice rows.

Preserve original native Playwright WebM with screenshots, action evidence,
hashes, and a clear local prototype/illustrative-data label. No such files exist
yet; no footage path or outcome evidence can honestly be supplied now.

Gnani remains separately blocked on the account-specific tariff/rounding,
credits/overage and commercial-output rights documented in GNANI_RESEARCH.md.
The advertised free allocation does not establish a numeric spending ceiling.
The proposed <=85 unrounded seconds is a usage estimate, not a currency cap.
No credential has been requested or provisioned and no synthesis has occurred.
Use a verified secure operator channel later, never a key in chat. Authorize
the capped sample only after billing/rights are established; approval of that
sample is required before full narration. No final video or delivery PR yet.

Independent implementation progressed without lifting those gates:
`scripts/generate-voiceover.py` now implements the official REST transport with
a no-call default, private-console key entry and labeled offline fixture tests.
See GNANI_RESEARCH.md for the exact conditional operator invocation. No real
provider request or credential collection was used to implement or test it.
