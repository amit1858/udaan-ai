import { describe, expect, it } from "vitest";
import { aiOutput, demoResponse, matchIntent } from "./demo";
import { defaultProfile, opportunities, type Language } from "./content";

describe("shared multilingual intent engine", () => {
  it.each([
    ["Weekday customers are down", "weekday"],
    ["Mere restaurant mein weekdays par customers kam aa rahe hain", "weekday"],
    ["रवि, weekdays पर customers कम आ रहे हैं", "weekday"],
    ["weekdays ನಲ್ಲಿ customers ಕಡಿಮೆ ಬರುತ್ತಿದ್ದಾರೆ", "weekday"],
    ["Explain the breakfast combo", "explain"], ["kitna bach sakta hai", "earnings"],
    ["खर्च कितना होगा", "earnings"], ["ವೆಚ್ಚ ಎಷ್ಟು", "earnings"],
    ["Similar business story", "story"], ["WhatsApp preorders", "technology"],
    ["What next after 70 sales?", "learning"], ["आगे क्या करें", "learning"],
    ["ಮುಂದೆ ಏನು", "learning"], ["weather on Mars?", "clarify"],
  ])("matches %s", (message, expected) => expect(matchIntent(message, false)).toBe(expected));
  it.each(["en", "hinglish", "hi", "kn"] as Language[])("produces validated %s contextual output", (language) => {
    const r = demoResponse("weekday customers", { profile: defaultProfile, language, experiments: [], history: [] });
    expect(aiOutput.safeParse(r).success).toBe(true);
    expect(r.content).toContain(defaultProfile.shopName);
    expect(r.opportunityId).toBe("combo");
    expect(r.followUp).toContain("1,500");
    expect(opportunities(language, defaultProfile)).toHaveLength(8);
  });
  it("does not invent structured recommendations", () => {
    expect(aiOutput.safeParse({ content: "Hello", opportunityId: "invest-in-crypto", followUp: "Why?", intent: "weekday" }).success).toBe(false);
    expect(aiOutput.safeParse({ content: "", followUp: "", opportunityId: "combo", intent: "weekday" }).success).toBe(false);
  });
  it("does not treat every question as a supported demo intent", () => {
    const r = demoResponse("weather on Mars?", { profile: defaultProfile, language: "en", experiments: [], history: [] });
    expect(r.intent).toBe("clarify");
    expect(r.content).toContain("limited");
  });
  it("honors a changed business profile", () => {
    const r = demoResponse("weekday customers", { profile: { ...defaultProfile, shopName: "Edited café" }, language: "en", experiments: [], history: [] });
    expect(r.content).toContain("Edited café");
  });
});
