import { PrismaClient, type Experiment as Row } from "@prisma/client";
import { baseline, defaultProfile, learningCopy, opportunities, type Language, type Profile } from "./content";
import { calculate, learningFacts, toRupees } from "./finance";

if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
  throw new Error("Udaan requires the managed PostgreSQL DATABASE_URL. SQLite is retained only for rollback.");
}
export const prisma = new PrismaClient();

export async function seedSales() {
  const pattern = [230, 125, 120, 130, 135, 145, 210];
  const anchor = new Date("2026-11-22T00:00:00Z");
  await prisma.$transaction(Array.from({ length: 90 }, (_, i) => {
    const date = new Date(anchor);
    date.setUTCDate(date.getUTCDate() - 89 + i);
    const variation = i >= 83 ? 0 : (i % 5) - 2;
    const orders = pattern[date.getUTCDay()]! + variation;
    return prisma.sale.upsert({
      where: { date: date.toISOString().slice(0, 10) },
      create: { date: date.toISOString().slice(0, 10), orders, revenue: orders * 8000, variableCosts: orders * 3500 },
      update: {},
    });
  }));
}

export const preferences = (s: { language: string; provider: string; onboarded: boolean }) => ({
  language: s.language as Language, provider: s.provider as "demo" | "openai" | "anthropic", onboarded: s.onboarded,
});
export const profileOf = (s: { profile: string }): Profile => JSON.parse(s.profile);
export async function ensureSession(id: string) {
  return prisma.demoSession.upsert({ where: { id }, update: {}, create: { id, profile: JSON.stringify(defaultProfile) } });
}
export function financeOf(e: Row) {
  return { sellingPrice: toRupees(e.sellingPrice), makingCost: toRupees(e.makingCost),
    promotionBudget: toRupees(e.promotionBudget), expectedUnits: e.expectedUnits };
}
export function serializeExperiment(e: Row, lang: Language, profile: Profile) {
  const input = financeOf(e);
  const idea = opportunities(lang, profile).find((i) => i.id === e.opportunityId)!;
  const facts = e.actualUnits !== null && e.actualPromotionSpend !== null
    ? learningFacts(input, e.actualUnits, toRupees(e.actualPromotionSpend)) : null;
  const text = facts ? learningCopy(lang, facts.outcome) : null;
  return {
    id: e.id, opportunityId: e.opportunityId, parentExperimentId: e.parentExperimentId,
    title: idea?.title ?? e.opportunityId, status: e.status, ...input, durationDays: e.durationDays,
    expected: calculate(input), createdAt: e.createdAt.toISOString(), timeline: JSON.parse(e.timeline),
    ...(facts && text ? {
      actual: facts.actual, actualUnits: e.actualUnits!, actualPromotionSpend: toRupees(e.actualPromotionSpend!),
      feedback: e.feedback ?? "", observations: e.observations ?? "", synthetic: e.synthetic,
      learning: { experimentId: e.id, outcome: facts.outcome,
        whatHappened: text[0], whatWeLearned: text[1], nextAction: text[2],
        achievement: facts.achievement, unitVariance: facts.unitVariance, contributionVariance: facts.contributionVariance,
        nextOpportunityId: facts.nextOpportunityId, nextBudget: facts.nextBudget,
      },
    } : {}),
  };
}
export async function getState(id: string) {
  const s = await ensureSession(id);
  const profile = profileOf(s);
  const experiments = await prisma.experiment.findMany({ where: { sessionId: id }, orderBy: { createdAt: "desc" } });
  const sales = await prisma.sale.findMany({ orderBy: { date: "asc" }, take: 90 });
  return {
    profile, preferences: preferences(s), baseline,
    sales: sales.map((sale) => ({ ...sale, revenue: toRupees(sale.revenue), variableCosts: toRupees(sale.variableCosts), synthetic: true })),
    experimentCount: experiments.length,
    completedCount: experiments.filter((e) => e.status === "Completed").length,
    recentLearning: experiments.map((e) => serializeExperiment(e, s.language as Language, profile).learning)
      .filter((l) => l !== undefined).slice(0, 3),
  };
}
