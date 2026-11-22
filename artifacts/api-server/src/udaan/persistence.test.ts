import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma, ensureSession, getState, seedSales } from "./db";
import { defaultProfile } from "./content";
const a = randomUUID();
const b = randomUUID();
afterAll(async () => {
  await prisma.demoSession.deleteMany({ where: { id: { in: [a, b] } } });
  await prisma.$disconnect();
});
describe("persistent business foundation", () => {
  it("seeds idempotently with exactly 90 synthetic dates", async () => {
    await seedSales();
    const before = await prisma.sale.count();
    await seedSales();
    expect(await prisma.sale.count()).toBe(before);
    expect(before).toBe(90);
  });
  it("reconciles the last seven days to the stated baseline", async () => {
    const rows = await prisma.sale.findMany({ orderBy: { date: "desc" }, take: 7 });
    expect(rows.reduce((n, r) => n + r.orders, 0)).toBe(1095);
    expect(rows.reduce((n, r) => n + r.revenue, 0) / 100).toBe(87600);
    expect(rows.reduce((n, r) => n + r.variableCosts, 0) / 100).toBe(38325);
  });
  it("retains profile and preferences without leaking between sessions", async () => {
    await ensureSession(a); await ensureSession(b);
    await prisma.demoSession.update({ where: { id: a }, data: {
      profile: JSON.stringify({ ...defaultProfile, shopName: "Only session A" }), language: "kn", provider: "demo",
    } });
    const stateA = await getState(a); const stateB = await getState(b);
    expect(stateA.profile.shopName).toBe("Only session A");
    expect(stateA.preferences.language).toBe("kn");
    expect(stateB.profile.shopName).toBe(defaultProfile.shopName);
    expect(stateB.preferences.language).toBe("en");
  });
});
