import { z } from "zod";
const base = "https://indiarestros.com/api/v1";
const sourceUrl = z.string().url().refine((s) => {
  const u = new URL(s); return u.protocol === "https:" && u.hostname === "indiarestros.com";
});
const hit = z.object({ id: z.string().regex(/^IRR-[A-Z0-9]{10}$/), name: z.string().max(200),
  url: sourceUrl, locality: z.string(), city: z.string() });
const menuSchema = z.object({ source: z.string().nullish(), updated: z.string().nullish(),
  sections: z.array(z.object({ name: z.string(), items: z.array(z.object({
    name: z.string(), price: z.number().nonnegative().nullish(), veg: z.boolean().nullish(),
  })) })) });
export type Market = {
  status: "retrieved" | "unavailable"; retrievedAt: string;
  provenance?: "live_provider" | "cached_provider" | "unavailable";
  servedAt?: string; cacheTtlSeconds?: number;
  providerRestaurantCount?: number; providerMenuItemCount?: number;
  requests?: { endpoint: string; requestedAt: string; httpStatus: number }[];
  facts: { name: string; url: string; locality: string; source: string; updated?: string;
    menu: { name: string; section: string; price?: number }[] }[];
};
export const isMarketQuestion = (s: string) => /aas.?paas|nearby|around me|competitor|market inspiration|आस.?पास|नज़दीक|ಸುತ್ತ.?ಮುತ್ತ|ಹತ್ತಿರ|ಬೇರೆ ರೆಸ್ಟೋರೆಂಟ್/i.test(s);
let cached: { until: number; value: Market } | undefined;
let pending: Promise<Market> | undefined;
async function json(path: string, requests: NonNullable<Market["requests"]>) {
  const requestedAt = new Date().toISOString();
  const r = await fetch(base + path, { headers: { "User-Agent": "UdaanAI/1.0 (read-only restaurant inspiration)", Accept: "application/json" },
    signal: AbortSignal.timeout(4500) });
  requests.push({ endpoint: base + path, requestedAt, httpStatus: r.status });
  if (!r.ok) throw new Error("Restaurant data unavailable");
  return r.json();
}
export async function retrieveMarket(): Promise<Market> {
  if (cached && cached.until > Date.now()) return { ...cached.value, provenance: "cached_provider", servedAt: new Date().toISOString() };
  if (pending) return pending.then((value) => ({ ...value, provenance: value.status === "retrieved" ? "cached_provider" : "unavailable", servedAt: new Date().toISOString() }));
  pending = (async (): Promise<Market> => {
    const retrievedAt = new Date().toISOString();
    const requests: NonNullable<Market["requests"]> = [];
    let providerMenuItemCount = 0;
    try {
      const search = z.object({ results: z.array(hit), warning: z.string().optional() }).parse(
        await json("/restaurants?city=bengaluru&locality=whitefield&cuisine=south-indian&limit=2", requests));
      if (search.warning) throw new Error("Unverified locality");
      const rows = search.results.filter((r) => r.city.toLowerCase() === "bengaluru" && r.locality.toLowerCase() === "whitefield");
      const facts = await Promise.all(rows.slice(0, 2).map(async (r) => {
        const menu = menuSchema.parse(await json(`/restaurants/${encodeURIComponent(r.id)}/menu`, requests));
        providerMenuItemCount += menu.sections.reduce((sum, section) => sum + section.items.length, 0);
        return { name: r.name, url: r.url, locality: r.locality, source: menu.source || "Source not supplied",
          ...(menu.updated ? { updated: menu.updated } : {}),
          // Menu names/prices only; never republish descriptions, photographs, contacts or ratings.
          menu: menu.sections.flatMap((s) => s.items.filter((i) => i.veg === true)
            .map((i) => ({ name: i.name, section: s.name, ...(i.price != null ? { price: i.price } : {}) }))).slice(0, 3) };
      }));
      if (!facts.some((f) => f.menu.length)) throw new Error("Insufficient relevant menu data");
      const value: Market = { status: "retrieved", retrievedAt, provenance: "live_provider", servedAt: new Date().toISOString(),
        cacheTtlSeconds: 300, requests, providerRestaurantCount: search.results.length, providerMenuItemCount,
        facts: facts.filter((f) => f.menu.length) };
      cached = { until: Date.now() + 300000, value };
      return value;
    } catch {
      // Never mislabel an old snapshot or invented example as a successful live retrieval.
      return { status: "unavailable", provenance: "unavailable", retrievedAt, servedAt: new Date().toISOString(), cacheTtlSeconds: 300, requests, facts: [] };
    } finally { pending = undefined; }
  })();
  return pending;
}
