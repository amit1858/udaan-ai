import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
const search = { results: [{ id: "IRR-YS9NDQYYKC", name: "Provider fixture", locality: "Whitefield", city: "Bengaluru", url: "https://indiarestros.com/r/fixture" }] };
const menu = { source: "fixture, not live", updated: "2026-10-09T20:43:50Z", sections: [{ name: "Breakfast", items: [{ name: "Toast", veg: true, price: 450 }, { name: "Non-veg", veg: false, price: 123 }] }] };
describe("read-only restaurant adapter", () => {
  it("recognizes the market question across four languages", async () => {
    const { isMarketQuestion } = await import("./market");
    for (const q of ["restaurants around me", "Mere aas-paas ke restaurants", "मेरे आस-पास के रेस्तराँ", "ನನ್ನ ಸುತ್ತಮುತ್ತಲಿನ ರೆಸ್ಟೋರೆಂಟ್"]) expect(isMarketQuestion(q)).toBe(true);
    expect(isMarketQuestion("explain the combo")).toBe(false);
  });
  it("validates attributed facts, retains original prices and caches at the published 300 seconds", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, status: 200, json: async () => search }).mockResolvedValueOnce({ ok: true, status: 200, json: async () => menu });
    vi.stubGlobal("fetch", fetcher);
    const { retrieveMarket } = await import("./market");
    const result = await retrieveMarket();
    expect(result.status).toBe("retrieved");
    expect(result.facts[0].menu).toEqual([{ name: "Toast", section: "Breakfast", price: 450 }]);
    expect(result.facts[0].source).toBe("fixture, not live");
    expect(result.facts[0].updated).toBe(menu.updated);
    expect(result.provenance).toBe("live_provider");
    expect(result.requests?.every((request) => request.httpStatus === 200)).toBe(true);
    const next = await retrieveMarket();
    expect(next.provenance).toBe("cached_provider");
    expect(next.facts).toEqual(result.facts);
    expect(next.retrievedAt).toBe(result.retrievedAt);
    expect(next.cacheTtlSeconds).toBe(300);
    expect(fetcher).toHaveBeenCalledTimes(2);
    for (const [url, init] of fetcher.mock.calls) { expect(url).toMatch(/^https:\/\/indiarestros.com\/api\/v1\//); expect(init.method).toBeUndefined(); }
  });
  it("never substitutes invented facts after a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { retrieveMarket } = await import("./market");
    expect(await retrieveMarket()).toMatchObject({ status: "unavailable", facts: [] });
  });
  it("rejects unsafe source URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [{ ...search.results[0], url: "https://example.com/wrong" }] }) }));
    const { retrieveMarket } = await import("./market");
    expect(await retrieveMarket()).toMatchObject({ status: "unavailable", facts: [] });
  });
});
