import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { inr, pct } from "../artifacts/udaan-ai/src/lib/format";
const locales = ["en", "hinglish", "hi", "kn"];
describe("primary language dictionaries", () => {
  const en = JSON.parse(readFileSync("artifacts/udaan-ai/src/locales/en.json", "utf8"));
  for (const lang of locales) {
    it(`${lang} has every key and no empty translations`, () => {
      const dictionary = JSON.parse(readFileSync(`artifacts/udaan-ai/src/locales/${lang}.json`, "utf8"));
      expect(Object.keys(dictionary).sort()).toEqual(Object.keys(en).sort());
      for (const value of Object.values(dictionary)) expect(String(value).trim().length).toBeGreaterThan(0);
    });
  }
  it("keeps Hindi distinct from Roman Hinglish", () => {
    const hi = readFileSync("artifacts/udaan-ai/src/locales/hi.json", "utf8");
    const kn = readFileSync("artifacts/udaan-ai/src/locales/kn.json", "utf8");
    expect(hi).toMatch(/[\u0900-\u097f]/);
    expect(kn).toMatch(/[\u0c80-\u0cff]/);
  });
  it("does not turn 1% target achievement into 100%", () => {
    expect(pct(1)).toBe(1); expect(pct(0)).toBe(0); expect(pct(130)).toBe(130);
  });
  it("shows monetary paise rather than rounding away real costs", () => {
    expect(inr(99.5)).toBe("₹99.5");
    expect(inr(3900)).toBe("₹3,900");
  });
});
