# Restore Udaan outside Replit

Operator instructions only. **Not executed or verified on an external host.**
Do not run the migration/import commands against Replit-managed production:
its schema is owned by `neondb_owner` and managed through Replit Publish.
No new service, resource, recurring backup job or credentials are created here.

## 1. Retrieve the exact source
```sh
git clone --branch udaan-final-handoff-2026-11-23 https://github.com/amit1858/udaan-ai.git
cd udaan-ai
git rev-parse HEAD
pnpm install --frozen-lockfile
```
The tag contains the app and current handoff. Showcase work remains separately
preserved on `main` and its merged PR; do not replace that branch.
The inspected toolchain was Node 24.22.3 and pnpm 10.26.1.
Use compatible Node 24/pnpm 10 versions with the existing lockfile.

## 2. Secure the data export
In the private workspace Files panel download:
- `generated-artifacts/private-handoff/udaan-production-2026-11-23.rows.json`
- its `.sha256` companion.

Keep them **outside the public repository** and outside web-served directories.
Verify the checksum locally, then encrypt a separate local copy with your
preferred password-prompting encryption tool. Never put the password in a
shell command, GitHub issue or this document. Retain the encryption key separately.

```sh
cd /your/private/export-directory
sha256sum -c udaan-production-2026-11-23.rows.json.sha256
```
The leading directory is chosen by the operator, not a pre-existing path.
On macOS use `shasum -a 256` and compare the recorded digest.

This is a row archive from a production read replica, not a PostgreSQL custom
dump and not a verified restore point. `pg_restore` cannot consume this JSON.
Schema is reconstructed from the committed migrations below. `_prisma_migrations`,
ownership and grants are deliberately excluded.

For recovery **inside Replit**, first check Database → Production → Settings →
Advanced → Point-in-time recovery. Default retention is seven days, but this
project's active setting was not visible to the agent. Scheduled backups are
normally off and were not enabled. Code tags do not restore production rows.

## 3. Prepare an empty external PostgreSQL database
Use an existing operator-approved external PostgreSQL 16+ database, with TLS.
Do not provision a paid plan without explicit cost approval. Set `DATABASE_URL`
using the host's secret manager or your private shell environment; do not
paste connection strings into source, command history or reports.

Confirm independently that it is the **empty external target**, not Replit.
With your operator environment set:
```sh
pnpm --filter @workspace/api-server exec prisma migrate deploy --schema prisma/schema.prisma
```
This external-only step creates the application schema and migration metadata.
Do not run `db:init`, the SQLite importer, seed commands or the app against the
destination before importing existing data.

## 4. Convert and import the row archive locally
Do this on your own trusted machine, not inside the deployed app. The example
uses only Python's standard library. Substitute private paths; do not create
the input/output inside the public Git checkout.

```sh
python3 - /private/udaan-production-2026-11-23.rows.json /private/restore-rows.sql <<'PY'
import csv, json, os, pathlib, sys
source, destination = map(pathlib.Path, sys.argv[1:])
if source.suffix.lower() == ".csv":
    with source.open(encoding="utf-8", newline="") as handle:
        archive = json.loads(next(csv.DictReader(handle))["export_json"])
else:
    archive = json.loads(source.read_text(encoding="utf-8"))
tables = ["DemoSession", "Sale", "Experiment", "ChatMessage",
          "ProviderCall", "VoiceLabConfig", "VoiceRequest"]
if archive.get("format") != "udaan-row-export-v1":
    raise SystemExit("Wrong archive format")
if set(archive.get("tables", {})) != set(tables):
    raise SystemExit("Wrong application table set")
if not all(isinstance(archive["tables"][name], list) for name in tables):
    raise SystemExit("Invalid table data")
parts = ["SET standard_conforming_strings = on;"]
# Refuse to merge into or overwrite a populated destination.
checks = " OR ".join('EXISTS (SELECT 1 FROM public."%s")' % t for t in tables)
parts.append("DO $$ BEGIN IF " + checks +
             " THEN RAISE EXCEPTION 'Destination must be empty'; END IF; END $$;")
for name in tables:
    payload = json.dumps(archive["tables"][name], ensure_ascii=False).replace("'", "''")
    parts.append('INSERT INTO public."%s" SELECT * FROM '
                 'json_populate_recordset(NULL::public."%s", \'%s\'::json);'
                 % (name, name, payload))
fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, "w", encoding="utf-8") as handle:
    handle.write("\n".join(parts) + "\n")
print("Prepared private SQL; no import has run.")
PY
```

Using the same operator-approved **external** target, import atomically:
```sh
psql "$DATABASE_URL" -X --set=ON_ERROR_STOP=1 --single-transaction --file=/private/restore-rows.sql
```
The file must remain private. Never commit it. Compare per-table row counts
against the JSON archive using your own trusted machine before starting the app.
Inspect profile/experiment relationships and deterministic finance examples.
No restore test was run during the Replit handoff.

Preserving database rows is not automatic browser-identity migration.
Existing signed visitor cookies are tied to the original hostname; a new
hostname creates fresh visitors. Preserve the stable signing secret privately
if continuity is needed, but it alone does not transfer cookies. Do not expose
raw session IDs or promise old profiles will automatically appear on a new host.

## 5. Build and serve the application
Use a secret manager for the variable names listed in `FINAL_HANDOFF.md`.
Demo needs no provider key. Keep paid inference off; do not renew the expired
window without approval. Replit proxy credentials are not portable.

From the repository root:
```sh
pnpm --filter @workspace/api-server run build
PORT=3000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/udaan-ai run build
```
The frontend output is `artifacts/udaan-ai/dist/public`.
Start the API with the runtime's configured `PORT`, production environment,
external database and stable signing secret:
```sh
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

**Hosting adaptation still required:** the existing Express app serves `/api`
only. On another platform, serve the frontend output and proxy `/api` to
Express on the **same HTTPS origin**, or add a small static/SPA serving adapter
to Express outside this Replit handoff. Preserve `/api` 404s; never return
`index.html` for missing API endpoints. Keep correct manifest/worker MIME types,
worker scope, secure cookies and forwarded host/protocol headers.

Do not use Vite's development server as public production hosting. Do not split
the frontend/API across origins without explicitly handling the existing
same-origin cookies, Origin checks and disabled CORS policy.

## 6. Small operator verification after restoration
- HTTPS root page and `/api/healthz`; API failures remain JSON/404, not SPA HTML.
- Demo discovery → one experiment → saved result → learning; reload persists it.
- Known finance: 70 units → ₹2,280; 130 → ₹5,520 for the documented combo.
- New production visitor isolation and blocked direct internal Lab routes.
- No paid calls when flags/window are disabled.
- Safari Add to Home Screen, launch/reload and offline shell. Existing records
  stay server-side; private AI/business content is not indiscriminately cached.

These are future operator checks, not an instruction to rerun paid tests now.
