import { z } from "zod";

const money = z.number().finite().min(0).max(1_000_000).refine(
  (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001,
  "Use at most two decimal places",
);
export const financeInput = z.object({
  sellingPrice: money.max(100_000),
  makingCost: money.max(100_000),
  promotionBudget: money,
  expectedUnits: z.number().int().min(1).max(100_000),
});
export type FinanceInput = z.infer<typeof financeInput>;
export const toPaise = (n: number) => Math.round(n * 100);
export const toRupees = (n: number) => n / 100;

export function calculate(input: FinanceInput, actualUnits?: number, actualSpend?: number) {
  const valid = financeInput.parse(input);
  const units = actualUnits === undefined ? valid.expectedUnits : z.number().int().min(0).max(100_000).parse(actualUnits);
  const selling = toPaise(valid.sellingPrice);
  const cost = toPaise(valid.makingCost);
  const promotion = toPaise(money.parse(actualSpend ?? valid.promotionBudget));
  const unit = selling - cost;
  return {
    units,
    unitContribution: toRupees(unit),
    revenue: toRupees(selling * units),
    variableCosts: toRupees(cost * units),
    promotionCost: toRupees(promotion),
    contributionBeforePromotion: toRupees(unit * units),
    contributionAfterPromotion: toRupees(unit * units - promotion),
    breakEvenUnits: unit > 0 ? Math.ceil(promotion / unit) : null,
    overheadExcluded: true,
  };
}

export const transitions: Record<string, readonly string[]> = {
  Draft: ["Approved", "Cancelled"],
  Approved: ["Running", "Cancelled"],
  Running: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};
export function assertTransition(from: string, to: string) {
  if (!transitions[from]?.includes(to)) throw Object.assign(new Error(`Cannot change ${from} to ${to}`), { status: 409 });
}

export function learningFacts(input: FinanceInput, units: number, spend: number) {
  const expected = calculate(input);
  const actual = calculate(input, units, spend);
  const outcome = units === 0 && spend === 0 ? "insufficient"
    : actual.contributionAfterPromotion < 0 || actual.unitContribution <= 0 ? "loss"
    : units < input.expectedUnits ? "below" : units > input.expectedUnits ? "above" : "on_target";
  return {
    outcome,
    achievement: Math.round(units * 10000 / input.expectedUnits) / 100,
    unitVariance: units - input.expectedUnits,
    contributionVariance: toRupees(toPaise(actual.contributionAfterPromotion) - toPaise(expected.contributionAfterPromotion)),
    nextOpportunityId: outcome === "above" || outcome === "on_target" ? "expansion" : outcome === "below" ? "visibility" : "preorder",
    nextBudget: outcome === "above" || outcome === "on_target" ? 900 : outcome === "below" ? 600 : 0,
    actual, expected,
  };
}
