import { prisma } from "./db";

export const isProduction = () => process.env.NODE_ENV === "production";
export const productionLiveEnabled = () => process.env.PRODUCTION_AI_ENABLED === "true"
  && process.env.ALLOW_PAID_API_CALLS === "true";
export const presenterPassword = () => process.env.PRODUCTION_AI_ACCESS_PASSWORD || process.env.VOICE_LAB_ADMIN_PASSWORD || "";
const bounded = (value: string | undefined, ceiling: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(ceiling, parsed) : 0;
};
export function productionLimits(now = new Date()) {
  const epoch = new Date(process.env.PRODUCTION_AI_BUDGET_START ?? "");
  const maximumEnd = new Date(epoch.getTime() + 2 * 60 * 60000);
  const requestedEnd = process.env.PRODUCTION_AI_BUDGET_END ? new Date(process.env.PRODUCTION_AI_BUDGET_END) : maximumEnd;
  const endsAt = new Date(Math.min(maximumEnd.getTime(), requestedEnd.getTime()));
  const valid = Number.isFinite(epoch.getTime()) && Number.isFinite(endsAt.getTime()) && epoch <= now && now < endsAt;
  return {
    valid,
    // Preserve a single allowance even if the approved two-hour window crosses midnight.
    since: valid ? epoch : now,
    endsAt,
    daily: bounded(process.env.PRODUCTION_AI_DAILY_CAP, 20),
    session: bounded(process.env.PRODUCTION_AI_SESSION_CAP, 6),
  };
}
export async function productionUsage(sessionId: string) {
  const limits = productionLimits();
  const [dailyUsed, sessionUsed] = await Promise.all([
    prisma.providerCall.count({ where: { provider: { not: "demo" }, createdAt: { gte: limits.since } } }),
    prisma.providerCall.count({ where: { provider: { not: "demo" }, sessionId, createdAt: { gte: limits.since } } }),
  ]);
  return { limits, dailyRemaining: Math.max(0, limits.daily - dailyUsed), sessionRemaining: Math.max(0, limits.session - sessionUsed) };
}
export async function reserveProviderCall(provider: "openai" | "anthropic", sessionId: string) {
  // The advisory lock makes count+reservation atomic across every API process.
  // Failed/time-out attempts remain charged to the cap; never delete audit history.
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(1742211261)::text AS locked`;
    const now = new Date();
    const production = isProduction();
    const limits = productionLimits(now);
    if (production && (!productionLiveEnabled() || !limits.valid || !limits.daily || !limits.session)) {
      throw Object.assign(new Error("Production AI is not activated with an approved budget window. Choose Demo Mode."), { status: 403 });
    }
    const since = production ? limits.since : undefined;
    const where = { provider: { not: "demo" }, ...(since ? { createdAt: { gte: since } } : {}) };
    const used = await tx.providerCall.count({ where });
    const total = production ? limits.daily : Math.min(6, bounded(process.env.MAX_PAID_API_CALLS, 6));
    if (used >= total) throw Object.assign(new Error("The approved AI allowance is exhausted. Choose Demo Mode; no provider request was sent."), { status: 429 });
    if (production) {
      const personal = await tx.providerCall.count({ where: { ...where, sessionId } });
      if (personal >= limits.session) throw Object.assign(new Error("Your presenter session has reached its approved daily allowance. Demo Mode remains available."), { status: 429 });
      const recent = await tx.providerCall.count({ where: { sessionId, provider: { not: "demo" }, createdAt: { gte: new Date(now.getTime() - 60000) } } });
      if (recent >= 3) throw Object.assign(new Error("Wait a minute before another live AI request."), { status: 429 });
    }
    const pending = await tx.providerCall.count({ where: {
      sessionId, status: "processing", createdAt: { gte: new Date(now.getTime() - 90000) },
    } });
    if (pending) throw Object.assign(new Error("An AI request for this session is already running."), { status: 429 });
    return tx.providerCall.create({ data: { provider, sessionId, status: "processing" } });
  });
}
