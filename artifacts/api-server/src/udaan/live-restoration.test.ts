import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { GetLiveAccessResponse, SendChatResponse } from "@workspace/api-zod";

// Strict network boundary: enabled-path tests use fake SDK transports only.
const sdk = vi.hoisted(() => ({ openai: vi.fn(), anthropic: vi.fn() }));
vi.mock("openai", () => ({ default: class { chat = { completions: { create: sdk.openai } }; } }));
vi.mock("@anthropic-ai/sdk", () => ({ default: class { messages = { create: sdk.anthropic }; } }));
const secret = "fixture-presenter-password-not-a-real-secret";
const fixture = `Live restore QA ${randomUUID()}`;
let server: Server;
let base: string;
let db: typeof import("./db");
let policy: typeof import("./live-policy");
const sessions = new Set<string>();
type Browser = { cookies: Map<string, string>; id?: string };
const browser = (): Browser => ({ cookies: new Map() });
const answer = JSON.stringify({
  content: "For your fictional restaurant, test an opt-in breakfast combo for seven days. This is a hypothesis, not guaranteed profit.",
  followUp: "What budget are you comfortable testing?", opportunityId: "combo", intent: "weekday",
});
async function request(agent: Browser, path: string, method = "GET", data?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method, headers: {
      "Content-Type": "application/json", "X-Forwarded-Proto": "https",
      Cookie: [...agent.cookies].map(([key, value]) => `${key}=${value}`).join("; "),
    }, ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0]!; const index = pair.indexOf("=");
    const key = pair.slice(0, index); const value = pair.slice(index + 1);
    if (value) agent.cookies.set(key, value); else agent.cookies.delete(key);
  }
  if (!agent.id && agent.cookies.has("udaan_session")) {
    agent.id = decodeURIComponent(agent.cookies.get("udaan_session")!).split(".")[0]!.slice(2);
    sessions.add(agent.id);
  }
  return { status: response.status, headers: response.headers, body: await response.json() };
}
async function owner() {
  const agent = browser();
  await request(agent, "/state");
  await request(agent, "/profile", "PATCH", { shopName: fixture });
  const unlock = await request(agent, "/live-access/login", "POST", { password: secret });
  expect(unlock.status).toBe(200);
  expect(unlock.headers.get("set-cookie")).toMatch(/HttpOnly/);
  expect(unlock.headers.get("set-cookie")).toMatch(/Secure/);
  expect(unlock.headers.get("set-cookie")).toMatch(/SameSite=Strict/);
  return agent;
}
beforeAll(async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SESSION_SECRET", "fixture-cookie-signing-secret-at-least-32-characters");
  vi.stubEnv("PRODUCTION_AI_ACCESS_PASSWORD", secret);
  vi.stubEnv("OPENAI_API_KEY", "fixture-not-a-real-openai-key");
  vi.stubEnv("ANTHROPIC_API_KEY", "fixture-not-a-real-anthropic-key");
  const { default: app } = await import("../app");
  db = await import("./db");
  policy = await import("./live-policy");
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test listener");
  base = `http://127.0.0.1:${address.port}/api/udaan`;
});
beforeEach(() => {
  vi.stubEnv("ALLOW_PAID_API_CALLS", "true");
  vi.stubEnv("PRODUCTION_AI_ENABLED", "true");
  vi.stubEnv("PRODUCTION_AI_BUDGET_START", new Date(Date.now() - 500).toISOString());
  vi.stubEnv("PRODUCTION_AI_BUDGET_END", "");
  vi.stubEnv("PRODUCTION_AI_DAILY_CAP", "10");
  vi.stubEnv("PRODUCTION_AI_SESSION_CAP", "5");
  sdk.openai.mockReset(); sdk.anthropic.mockReset();
  sdk.openai.mockResolvedValue({ choices: [{ message: { content: answer } }], usage: { total_tokens: 500 } });
  sdk.anthropic.mockResolvedValue({ content: [{ type: "text", text: answer }], usage: { input_tokens: 400, output_tokens: 100 } });
});
afterEach(async () => {
  await db.prisma.providerCall.deleteMany({ where: { sessionId: { in: [...sessions] } } });
  await db.prisma.demoSession.deleteMany({ where: { id: { in: [...sessions] } } });
  sessions.clear();
});
afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (db) await db.prisma.$disconnect();
  vi.unstubAllEnvs();
});
describe("controlled production reasoning (zero paid calls)", () => {
  it("keeps future and expired budget windows disabled", () => {
    vi.stubEnv("PRODUCTION_AI_BUDGET_START", new Date(Date.now() + 60000).toISOString());
    expect(policy.productionLimits().valid).toBe(false);
    vi.stubEnv("PRODUCTION_AI_BUDGET_START", new Date(Date.now() - 3 * 60 * 60000).toISOString());
    expect(policy.productionLimits().valid).toBe(false);
  });
  it("does not let an end-date extension exceed the hard two-hour window", () => {
    const start = new Date(Date.now() - 60000);
    vi.stubEnv("PRODUCTION_AI_BUDGET_START", start.toISOString());
    vi.stubEnv("PRODUCTION_AI_BUDGET_END", new Date(Date.now() + 24 * 60 * 60000).toISOString());
    expect(policy.productionLimits().endsAt.getTime() - start.getTime()).toBe(2 * 60 * 60000);
  });
  it("rejects anonymous paid chat and provider tests before any SDK call", async () => {
    const guest = browser();
    await request(guest, "/state");
    await request(guest, "/preferences", "PATCH", { provider: "openai" });
    expect((await request(guest, "/chat", "POST", { message: "Help my weekday sales" })).status).toBe(401);
    expect((await request(guest, "/providers/test", "POST", { provider: "anthropic", confirmed: true })).status).toBe(401);
    expect(sdk.openai).not.toHaveBeenCalled(); expect(sdk.anthropic).not.toHaveBeenCalled();
  });
  it("unlocks a scoped HttpOnly cookie without invoking any provider", async () => {
    const agent = await owner();
    const status = GetLiveAccessResponse.parse((await request(agent, "/live-access")).body);
    expect(status.unlocked).toBe(true); expect(status.enabled).toBe(true);
    expect(status.dailyRemaining).toBe(10);
    const other = browser(); await request(other, "/state");
    other.cookies.set("udaan_presenter", agent.cookies.get("udaan_presenter")!);
    expect(GetLiveAccessResponse.parse((await request(other, "/live-access")).body).unlocked).toBe(false);
    expect(sdk.openai).not.toHaveBeenCalled();
  });
  it("runs exactly the selected adapter, with bounded output and no dual-provider call", async () => {
    const agent = await owner();
    expect((await request(agent, "/providers/test", "POST", { provider: "openai", confirmed: true })).status).toBe(200);
    expect(sdk.openai).toHaveBeenCalledTimes(1); expect(sdk.anthropic).not.toHaveBeenCalled();
    expect(sdk.openai.mock.calls[0]![0]).toMatchObject({ max_completion_tokens: 2048, reasoning_effort: "minimal" });
    expect((await request(agent, "/providers/test", "POST", { provider: "anthropic", confirmed: true })).status).toBe(200);
    expect(sdk.anthropic).toHaveBeenCalledTimes(1);
    expect(sdk.anthropic.mock.calls[0]![0]).toMatchObject({ max_tokens: 2048 });
  });
  it("serves identical recent Ask retries from only that visitor's saved answer", async () => {
    const agent = await owner();
    await request(agent, "/preferences", "PATCH", { provider: "openai" });
    const first = await request(agent, "/chat", "POST", { message: "Suggest one weekday breakfast test" });
    const replay = await request(agent, "/chat", "POST", { message: "Suggest one weekday breakfast test" });
    expect(first.status).toBe(200); expect(replay.status).toBe(200);
    expect(SendChatResponse.parse(first.body).provider).toBe("openai");
    expect(SendChatResponse.parse(first.body).id).toBe(SendChatResponse.parse(replay.body).id);
    expect(replay.headers.get("x-udaan-replayed")).toBe("true");
    expect(sdk.openai).toHaveBeenCalledTimes(1);
  });
  it("does not silently call Anthropic after an OpenAI failure; Demo still works", async () => {
    const agent = await owner(); await request(agent, "/preferences", "PATCH", { provider: "openai" });
    sdk.openai.mockRejectedValueOnce(Object.assign(new Error("fixture transport failure"), { status: 503 }));
    expect((await request(agent, "/chat", "POST", { message: "Suggest one weekday test" })).status).toBe(502);
    expect(sdk.anthropic).not.toHaveBeenCalled();
    await request(agent, "/preferences", "PATCH", { provider: "demo" });
    const demo = await request(agent, "/chat", "POST", { message: "Suggest one weekday test" });
    expect(demo.status).toBe(200); expect(SendChatResponse.parse(demo.body).provider).toBe("demo");
  });
  it("enforces the combined global cap atomically across concurrent sessions", async () => {
    vi.stubEnv("PRODUCTION_AI_DAILY_CAP", "2");
    const ids = Array.from({ length: 5 }, () => randomUUID()); ids.forEach((id) => sessions.add(id));
    const results = await Promise.allSettled(ids.map((id) => policy.reserveProviderCall("openai", id)));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(2);
    expect(await db.prisma.providerCall.count({ where: { sessionId: { in: ids } } })).toBe(2);
    expect(sdk.openai).not.toHaveBeenCalled();
  });
  it("counts failed attempts against the per-session allowance", async () => {
    vi.stubEnv("PRODUCTION_AI_SESSION_CAP", "2");
    const id = randomUUID(); sessions.add(id);
    for (let i = 0; i < 2; i++) {
      const row = await policy.reserveProviderCall("openai", id);
      await db.prisma.providerCall.update({ where: { id: row.id }, data: { status: "failed" } });
    }
    await expect(policy.reserveProviderCall("anthropic", id)).rejects.toMatchObject({ status: 429 });
  });
  it("limits each session to three attempts per minute", async () => {
    vi.stubEnv("PRODUCTION_AI_SESSION_CAP", "6");
    const id = randomUUID(); sessions.add(id);
    for (let i = 0; i < 3; i++) {
      const row = await policy.reserveProviderCall("openai", id);
      await db.prisma.providerCall.update({ where: { id: row.id }, data: { status: "failed" } });
    }
    await expect(policy.reserveProviderCall("openai", id)).rejects.toMatchObject({ status: 429 });
  });
  it("honors the kill switch even for an unlocked presenter", async () => {
    const agent = await owner(); await request(agent, "/preferences", "PATCH", { provider: "openai" });
    vi.stubEnv("PRODUCTION_AI_ENABLED", "false");
    expect((await request(agent, "/chat", "POST", { message: "Suggest one weekday test" })).status).toBe(403);
    expect(sdk.openai).not.toHaveBeenCalled();
  });
  it("rejects oversized UTF-8 input before booking or contacting a model", async () => {
    const { generate } = await import("./providers");
    const { defaultProfile } = await import("./content");
    const id = randomUUID(); sessions.add(id);
    await expect(generate("openai", "अ".repeat(15000), {
      profile: defaultProfile, language: "hi", history: [], experiments: [],
    }, id)).rejects.toMatchObject({ status: 413 });
    expect(await db.prisma.providerCall.count({ where: { sessionId: id } })).toBe(0);
    expect(sdk.openai).not.toHaveBeenCalled();
  });
  it("refuses an incorrect password and non-HTTPS production unlock", async () => {
    const guest = browser(); await request(guest, "/state");
    expect((await request(guest, "/live-access/login", "POST", { password: "incorrect-fixture-password" })).status).toBe(401);
    expect((await fetch(`${base}/live-access/login`, {
      method: "POST", headers: { "Content-Type": "application/json",
        Cookie: [...guest.cookies].map(([key, value]) => `${key}=${value}`).join("; ") },
      body: JSON.stringify({ password: secret }),
    })).status).toBe(403);
    expect(sdk.openai).not.toHaveBeenCalled();
  });
  it("logs out to Demo and rejects the expired grant without model access", async () => {
    const agent = await owner(); await request(agent, "/preferences", "PATCH", { provider: "openai" });
    const clock = vi.spyOn(Date, "now").mockReturnValue(Date.now() + 31 * 60000);
    expect((await request(agent, "/chat", "POST", { message: "Help my weekday sales" })).status).toBe(401);
    clock.mockRestore();
    expect((await request(agent, "/live-access/logout", "POST")).status).toBe(200);
    expect(GetLiveAccessResponse.parse((await request(agent, "/live-access")).body).unlocked).toBe(false);
    expect(sdk.openai).not.toHaveBeenCalled();
  });
  it("keeps all direct internal Lab endpoints inaccessible after presenter unlock", async () => {
    const agent = await owner();
    for (const [path, method] of [["/voice-lab/status", "GET"], ["/voice-lab/login", "POST"], ["/voice-lab/synthesize", "POST"]]) {
      expect((await request(agent, path!, method!, method === "POST" ? {} : undefined)).status).toBe(404);
    }
  });
  it("throttles repeated password guessing without making model requests", async () => {
    const guest = browser(); await request(guest, "/state");
    for (let index = 0; index < 5; index++) await request(guest, "/live-access/login", "POST", { password: "wrong-fixture-password" });
    expect((await request(guest, "/live-access/login", "POST", { password: "wrong-fixture-password" })).status).toBe(429);
    expect(sdk.openai).not.toHaveBeenCalled(); expect(sdk.anthropic).not.toHaveBeenCalled();
  });
});
