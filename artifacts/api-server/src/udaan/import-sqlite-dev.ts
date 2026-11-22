import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

// One-time, explicitly approved development data import, NOT a backup service
// or production migration runner. The SQLite source is opened read-only.
if (process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1"
  || !process.argv.includes("--development-only")) {
  throw new Error("SQLite import requires --development-only and cannot run in production.");
}
const source = process.argv.find((arg) => arg.startsWith("--source="))?.slice(9);
if (!source) throw new Error("Supply --source=<verified SQLite backup>.");
const sqlite = new DatabaseSync(source, { readOnly: true });
const target = new PrismaClient();
const reports: { table: string; rows: number; sha256: string }[] = [];
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
type RecordValue = Record<string, unknown>;
try {
  await target.$transaction(async (tx) => {
    // DMMF identifiers are from our committed schema, never request/source input.
    for (const model of Prisma.dmmf.datamodel.models) {
      const fields = model.fields.filter((field) => field.kind === "scalar");
      const primary = fields.find((field) => field.isId)!;
      const columns = fields.map((field) => quote(field.name)).join(", ");
      const raw = sqlite.prepare(`SELECT ${columns} FROM ${quote(model.name)}`).all();
      const rows = raw.map((row) => Object.fromEntries(fields.map((field) => {
        const value = row[field.name];
        return [field.name, value == null ? null : field.type === "Boolean"
          ? Boolean(value) : field.type === "DateTime"
            ? new Date(typeof value === "bigint" ? Number(value) : value as string | number) : value];
      })));
      if (rows.length) {
        let parameter = 0;
        const values = rows.map(() => `(${fields.map(() => `$${++parameter}`).join(", ")})`).join(", ");
        await tx.$executeRawUnsafe(
          `INSERT INTO ${quote(model.name)} (${columns}) VALUES ${values} ON CONFLICT (${quote(primary.name)}) DO NOTHING`,
          ...rows.flatMap((row) => fields.map((field) => row[field.name])),
        );
      }
      const persisted = await tx.$queryRawUnsafe<RecordValue[]>(`SELECT ${columns} FROM ${quote(model.name)}`);
      const fingerprint = (records: RecordValue[]) => createHash("sha256").update(JSON.stringify(
        [...records].sort((a, b) => String(a[primary.name]).localeCompare(String(b[primary.name])))
          .map((row) => fields.map((field) => row[field.name])),
      )).digest("hex");
      const checksum = fingerprint(rows);
      if (persisted.length !== rows.length || fingerprint(persisted) !== checksum) {
        throw new Error(`Data verification failed for ${model.name}; entire import rolled back without overwriting existing rows.`);
      }
      reports.push({ table: model.name, rows: rows.length, sha256: checksum });
    }
  }, { timeout: 120000 });
  process.stdout.write(`${JSON.stringify({ imported: true, verifiedEveryField: true, tables: reports }, null, 2)}\n`);
} catch {
  // Never print a driver error containing private rows or connection strings.
  process.stderr.write("Import failed; PostgreSQL data transaction was rolled back. SQLite was not changed.\n");
  process.exitCode = 1;
} finally {
  sqlite.close();
  await target.$disconnect();
}
