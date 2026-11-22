import { execFileSync } from "node:child_process";

// Production schema changes belong to Replit Publish, never build/startup.
if (process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1") {
  throw new Error("db:init is development-only. Use Replit Publish for managed production schema changes.");
}
if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
  throw new Error("Configure the development PostgreSQL DATABASE_URL before db:init.");
}
for (const args of [["generate"], ["migrate", "deploy"]]) {
  try {
    // Capture CLI output: never echo connection strings or credential-bearing errors.
    execFileSync("pnpm", ["exec", "prisma", ...args], { stdio: "pipe" });
  } catch {
    throw new Error(`Development Prisma ${args[0]} failed. Check database configuration privately.`);
  }
}
process.stdout.write("Development PostgreSQL schema and Prisma client are ready.\n");
