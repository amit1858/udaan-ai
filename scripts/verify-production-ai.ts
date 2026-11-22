/**
 * Owner-approved, ONE-SHOT production verification. Never run in CI/startup.
 * Uses the presenter's server-side environment password; prints metadata only.
 */
import { mkdir, open } from "node:fs/promises";
import { GetLiveAccessResponse, TestProviderResponse } from "@workspace/api-zod";

async function main() {
  if (process.env.CONFIRM_PAID_PRODUCTION_TESTS !== "two-approved-checks") throw new Error("Explicit two-call approval required");
  const password = process.env.PRODUCTION_AI_ACCESS_PASSWORD || process.env.VOICE_LAB_ADMIN_PASSWORD;
  if (!password) throw new Error("Missing presenter credential");
  // Verified deployment URL, intentionally not an arbitrary secret-receiving URL.
  const base = "https://udaan-ai-builder.replit.app/api/udaan";
  const cookies = new Map<string, string>();
  async function request(path: string, data?: unknown) {
    const response = await fetch(`${base}${path}`, {
      method: data === undefined ? "GET" : "POST", redirect: "error",
      signal: AbortSignal.timeout(45000),
      headers: { "Content-Type": "application/json", Cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join("; ") },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0]!; const i = pair.indexOf("=");
      cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    return { status: response.status, body: await response.json() };
  }
  await request("/state");
  const gate = await request("/live-access");
  if (gate.status !== 200 || !GetLiveAccessResponse.parse(gate.body).enabled) throw new Error("New controlled version is not live and enabled; no paid request sent");
  const login = await request("/live-access/login", { password });
  const access = GetLiveAccessResponse.parse(login.body);
  if (login.status !== 200 || !access.unlocked || access.dailyRemaining < 2 || access.sessionRemaining < 2) {
    throw new Error("Presenter access/budget not ready; no paid request sent");
  }
  await mkdir("generated-artifacts/paid-tests", { recursive: true, mode: 0o700 });
  // Create before any billable request. A crash/timeout must never auto-repeat.
  const marker = await open("generated-artifacts/paid-tests/controlled-production-ai-2026-11-22.jsonl", "wx", 0o600);
  try {
    for (const provider of ["openai", "anthropic"] as const) {
      const startedAt = new Date().toISOString();
      await marker.write(`${JSON.stringify({ provider, startedAt, state: "attempting" })}\n`);
      const response = await request("/providers/test", { provider, confirmed: true });
      const verified = response.status === 200 ? TestProviderResponse.parse(response.body) : null;
      const evidence = { provider, endpoint: "/api/udaan/providers/test", startedAt,
        completedAt: new Date().toISOString(), httpStatus: response.status,
        model: verified?.model ?? null, status: verified?.status ?? "failed", lastTest: verified?.lastTest ?? null };
      await marker.write(`${JSON.stringify(evidence)}\n`);
      console.log(JSON.stringify(evidence));
    }
  } finally {
    await marker.close();
    await request("/live-access/logout", {});
  }
}
main().catch((error: unknown) => {
  // Do not print provider bodies, request headers, cookies or credential values.
  console.error("Production verification stopped safely:", error instanceof Error ? error.message : "unexpected error");
  process.exitCode = 1;
});
