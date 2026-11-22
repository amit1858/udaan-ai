import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import {
  GetProvidersResponse, GetUdaanStateResponse, GetConversationResponse,
  CreateExperimentResponse, RecordResultsResponse,
} from "@workspace/api-zod";

let server: Server;
let base: string;
let db: typeof import("./db");
const fixture = `Production QA ${randomUUID()}`;
let cookieA = "";
let cookieB = "";
async function request(path: string, method = "GET", body?: unknown, cookie = cookieA) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { "Content-Type": "application/json", Cookie: cookie, "X-Forwarded-Proto": "https" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}
beforeAll(async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SESSION_SECRET", "production-test-fixture-not-an-actual-credential");
  // Prove that environment misconfiguration cannot enable initial production spending/Lab.
  vi.stubEnv("ALLOW_PAID_API_CALLS", "true");
  vi.stubEnv("MAX_PAID_API_CALLS", "6");
  vi.stubEnv("ENABLE_SARVAM_LAB", "true");
  const { default: app } = await import("../app");
  db = await import("./db");
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test listener");
  base = `http://127.0.0.1:${address.port}/api/udaan`;
  for (const name of ["A", "B"]) {
    const state = await request("/state", "GET", undefined, "");
    const cookie = state.headers.get("set-cookie")!.split(";")[0]!;
    if (name === "A") cookieA = cookie; else cookieB = cookie;
    await request("/profile", "PATCH", { shopName: `${fixture} ${name}` }, cookie);
  }
});
afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  if (db) {
    await db.prisma.demoSession.deleteMany({ where: { profile: { contains: fixture } } });
    await db.prisma.$disconnect();
  }
  vi.unstubAllEnvs();
});
describe("initial production safety and PostgreSQL journey", () => {
  it("keeps paid reasoning disabled even when the environment says true", async () => {
    const { paidAllowed } = await import("./providers");
    expect(paidAllowed()).toBe(false);
    const providers = await request("/providers");
    expect(providers.status).toBe(200);
    for (const provider of GetProvidersResponse.parse(providers.body)) expect(provider.paidCallsAllowed).toBe(false);
  });
  it("rejects every direct Voice Lab endpoint, including status and login", async () => {
    for (const [path, method] of [
      ["/voice-lab/status", "GET"], ["/voice-lab/login", "POST"],
      ["/voice-lab/authorize", "POST"], ["/voice-lab/test", "POST"],
      ["/voice-lab/tts", "POST"], ["/voice-lab/stt", "POST"],
    ]) expect((await request(path!, method!, method === "POST" ? {} : undefined)).status).toBe(404);
  });
  it("uses private-response and HTTPS-cookie protections", async () => {
    const state = await request("/state", "GET", undefined, "");
    expect(state.headers.get("cache-control")).toBe("no-store");
    const cookie = state.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/api/udaan");
  });
  it("retains isolated multilingual profiles in PostgreSQL", async () => {
    await request("/preferences", "PATCH", { provider: "demo", language: "kn" });
    const a = await request("/state"); const b = await request("/state", "GET", undefined, cookieB);
    const stateA = GetUdaanStateResponse.parse(a.body); const stateB = GetUdaanStateResponse.parse(b.body);
    expect(stateA.profile.shopName).toBe(`${fixture} A`);
    expect(stateA.preferences.language).toBe("kn");
    expect(stateB.profile.shopName).toBe(`${fixture} B`);
    expect(stateB.preferences.language).toBe("en");
  });
  it("completes Demo conversations and distinct 70/130-unit outcomes without inference", async () => {
    const callsBefore = await db.prisma.providerCall.count();
    const speechBefore = await db.prisma.voiceRequest.count();
    expect((await request("/chat", "POST", { message: "Weekday customers are low. Suggest a small test." })).status).toBe(200);
    const conversation = await request("/conversation");
    expect(GetConversationResponse.parse(conversation.body).at(-1)!.provider).toBe("demo");
    const next: string[] = [];
    for (const [units, amount] of [[70, 2280], [130, 5520]]) {
      const draft = await request("/experiments", "POST", {
        opportunityId: "combo", sellingPrice: 99, makingCost: 45,
        promotionBudget: 1500, expectedUnits: 100, durationDays: 7,
      });
      expect(draft.status).toBe(201);
      const path = `/experiments/${CreateExperimentResponse.parse(draft.body).id}`;
      expect((await request(`${path}/transition`, "POST", { status: "Approved", confirmed: true }, cookieB)).status).toBe(404);
      for (const status of ["Approved", "Running"]) {
        expect((await request(`${path}/transition`, "POST", { status, confirmed: true })).status).toBe(200);
      }
      const result = await request(`${path}/results`, "POST", {
        actualUnits: units, actualPromotionSpend: 1500, feedback: "Synthetic verification",
        observations: "Not real business outcomes", synthetic: true, confirmed: true,
      });
      expect(result.status).toBe(200);
      const completed = RecordResultsResponse.parse(result.body);
      expect(completed.actual!.contributionAfterPromotion).toBe(amount);
      next.push(completed.learning!.nextOpportunityId);
      expect((await request(`${path}/results`, "POST", {
        actualUnits: 1, actualPromotionSpend: 0, feedback: "", observations: "",
        synthetic: true, confirmed: true,
      })).status).toBe(409);
    }
    expect(next[0]).not.toBe(next[1]);
    expect(await db.prisma.providerCall.count()).toBe(callsBefore);
    expect(await db.prisma.voiceRequest.count()).toBe(speechBefore);
  });
});
