# Option B - local preparation, blocked before recording

## Actual status

The selected path is an actual-source local prototype with illustrative data,
not deployed evidence. **No local application has started, no database cluster
has been initialized, and no product journey or product footage has been
captured.** The earlier neutral recorder probe is still not product evidence.

The complete source at handoff commit
`de9283e1c8a1d08cf62fd9832e0d14df84749d43` was extracted outside this worktree.
All **388 archived files** were compared byte-for-byte with the preserved Git
archive: zero changed or missing files. Archive SHA-256:
`f764c50784b8dcaa47f58ad8703ace29524acafa9941241c62a8598ea838cc2d`.
No application manifest, source, schema or configuration was edited.

Private session artifacts, relative to the session's `files` directory:

- `local-tag-source.zip`: preserved full tagged source.
- `local-runtime\source`: identical source plus incomplete dependency restoration.
- `MASTER_BRIEF.txt`: unchanged complete original brief.

Runtime/source/database are not committed. Only preparation tooling and this
handoff are under `marketing/product-demo-video`.

## Exact blocker and attempts

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
requests and service workers; the backend fetch guard alone is not a
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
