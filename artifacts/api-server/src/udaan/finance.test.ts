import { describe, expect, it } from "vitest";
import { assertTransition, calculate, learningFacts } from "./finance";
const input = { sellingPrice: 99, makingCost: 45, promotionBudget: 1500, expectedUnits: 100 };

describe("exact paise financial engine", () => {
  it("matches every expected competition figure", () => {
    expect(calculate(input)).toEqual({
      units: 100, unitContribution: 54, revenue: 9900, variableCosts: 4500, promotionCost: 1500,
      contributionBeforePromotion: 5400, contributionAfterPromotion: 3900, breakEvenUnits: 28, overheadExcluded: true,
    });
  });
  it("calculates 70 units from the same pipeline", () => {
    const f = learningFacts(input, 70, 1500);
    expect(f.actual).toMatchObject({ revenue: 6930, variableCosts: 3150, contributionBeforePromotion: 3780, contributionAfterPromotion: 2280 });
    expect(f).toMatchObject({ outcome: "below", achievement: 70, nextOpportunityId: "visibility", nextBudget: 600, unitVariance: -30, contributionVariance: -1620 });
  });
  it("calculates 130 units and changes next recommendation", () => {
    const f = learningFacts(input, 130, 1500);
    expect(f.actual).toMatchObject({ revenue: 12870, variableCosts: 5850, contributionBeforePromotion: 7020, contributionAfterPromotion: 5520 });
    expect(f).toMatchObject({ outcome: "above", achievement: 130, nextOpportunityId: "expansion", nextBudget: 900 });
  });
  it("uses actual promotion spend, not budget", () => {
    expect(calculate(input, 70, 600).contributionAfterPromotion).toBe(3180);
  });
  it("retains fractional paise accuracy", () => {
    expect(calculate({ sellingPrice: 0.3, makingCost: 0.1, promotionBudget: 0.1, expectedUnits: 3 }))
      .toMatchObject({ revenue: 0.9, variableCosts: 0.3, contributionAfterPromotion: 0.5, breakEvenUnits: 1 });
  });
  it.each([45, 40])("cannot break even with nonpositive margin at price %i", (price) => {
    expect(calculate({ ...input, sellingPrice: price }).breakEvenUnits).toBeNull();
    expect(learningFacts({ ...input, sellingPrice: price }, 100, 1500).outcome).toBe("loss");
  });
  it("prioritizes loss over exceeding sales target", () => {
    expect(learningFacts(input, 130, 10000)).toMatchObject({ outcome: "loss", nextBudget: 0 });
  });
  it("does not call zero activity a failure", () => {
    expect(learningFacts(input, 0, 0)).toMatchObject({ outcome: "insufficient", achievement: 0 });
  });
  it("handles on-target without assuming causality", () => {
    expect(learningFacts(input, 100, 1500).outcome).toBe("on_target");
  });
  it.each([
    { ...input, expectedUnits: 0 }, { ...input, expectedUnits: 1.5 }, { ...input, sellingPrice: -1 },
    { ...input, makingCost: NaN }, { ...input, promotionBudget: Infinity }, { ...input, sellingPrice: 1.001 },
    { ...input, expectedUnits: 100001 },
  ])("rejects invalid finance input %j", (data) => expect(() => calculate(data)).toThrow());
  it("rejects fractional or negative actual sales", () => {
    expect(() => calculate(input, -1)).toThrow();
    expect(() => calculate(input, 0.5)).toThrow();
    expect(() => calculate(input, 70, -1)).toThrow();
  });
});
describe("owner-confirmed lifecycle", () => {
  it.each([["Draft", "Approved"], ["Approved", "Running"], ["Running", "Completed"], ["Running", "Cancelled"], ["Draft", "Cancelled"]])("allows %s to %s", (from, to) => expect(() => assertTransition(from, to)).not.toThrow());
  it.each([["Draft", "Running"], ["Draft", "Completed"], ["Completed", "Running"], ["Cancelled", "Approved"], ["Completed", "Completed"]])("rejects %s to %s", (from, to) => expect(() => assertTransition(from, to)).toThrow());
});
