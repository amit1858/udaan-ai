import { z } from "zod";
import { calculate } from "./finance";
import { local, opportunities, type Language, type Profile } from "./content";
import type { serializeExperiment } from "./db";

export const aiOutput = z.object({
  content: z.string().min(1).max(4500),
  followUp: z.string().min(1).max(500),
  opportunityId: z.enum(["combo", "subscription", "loyalty", "preorder", "qr", "bakery", "visibility", "expansion"]),
  intent: z.enum(["weekday", "explain", "earnings", "story", "technology", "learning", "clarify"]),
  speechText: z.string().max(4500).optional(),
});
export type AIOutput = z.infer<typeof aiOutput>;
export type Context = {
  profile: Profile; language: Language;
  experiments: ReturnType<typeof serializeExperiment>[];
  history: { role: string; content: string }[];
};

export function matchIntent(text: string, hasPrevious: boolean): AIOutput["intent"] {
  const s = text.toLowerCase().normalize("NFKC");
  if (/result|outcome|learn|next|70|130|सीख|नतीज|परिणाम|आगे|ಮುಂದೆ|ಫಲಿತಾಂಶ|ಕಲಿತ|kya seekh|seekha|agla/.test(s)) return "learning";
  if (/profit|earn|cost|calcul|money|kitna|kama|bach|कमाई|खर्च|कितन|बच|ಲೆಕ್ಕ|ವೆಚ್ಚ|ಉಳಿಯ|ಆದಾಯ/.test(s)) return "earnings";
  if (/tech|whatsapp|qr|digital|technology|तकनीक|ಟೆಕ್|ತಂತ್ರಜ್ಞಾನ/.test(s)) return "technology";
  if (/office|subscription|similar|other business|bakery|story|dusre|दूसर|कहानी|ಬೇರೆ|ಕಥೆ|ಆಫೀಸ್/.test(s)) return "story";
  if (/combo|explain|how|samjha|kaise|कॉम्बो|समझा|कैसे|ಹೇಗೆ|ಕಾಂಬೊ/.test(s)) return "explain";
  if (/weekday|customer|kam |kya kar|sales|slow|grow|कम |ग्राहक|बढ़|क्या कर|ಕಡಿಮೆ|ಗ್ರಾಹಕ|ಮಾರಾಟ/.test(s)) return "weekday";
  if (hasPrevious && /^(yes|haan|ha|han|हाँ|ಹೌದು|ok|okay|sure|tell me|continue|aur batao)[.! ]*$/.test(s)) return "explain";
  return "clarify";
}

export function demoResponse(message: string, context: Context): AIOutput {
  const { profile: p, language: l } = context;
  const intent = matchIntent(message, context.history.length > 0);
  const latest = context.experiments.find((e) => e.learning);
  let opportunityId: AIOutput["opportunityId"] = intent === "story" ? "subscription" : intent === "technology" ? "preorder" : "combo";
  let content = "";
  const name = p.ownerName;
  if (intent === "learning" && latest?.learning && latest.actual) {
    opportunityId = latest.learning.nextOpportunityId as AIOutput["opportunityId"];
    const info = `${latest.actualUnits}/${latest.expectedUnits} · ₹${latest.actual.contributionAfterPromotion.toLocaleString("en-IN")}`;
    content = local(l,
      `${name}, your stored "${latest.title}" result is ${info} contribution after promotion. ${latest.learning.whatHappened} ${latest.learning.whatWeLearned} ${latest.synthetic ? "These are sample demo outcomes, not real business improvement." : "These outcomes were entered by the owner, not independently verified."}`,
      `${name}, aapke saved "${latest.title}" result: ${info} promotion ke baad contribution. ${latest.learning.whatHappened} ${latest.learning.whatWeLearned} ${latest.synthetic ? "Yeh sample demo outcomes hain, real business improvement nahi." : "Yeh owner-entered outcomes hain, independently verified nahi."}`,
      `${name}, आपके saved "${latest.title}" result: ${info} promotion के बाद contribution। ${latest.learning.whatHappened} ${latest.learning.whatWeLearned} ${latest.synthetic ? "ये sample demo outcomes हैं, real business improvement नहीं।" : "ये owner-entered outcomes हैं, independently verified नहीं।"}`,
      `${name}, ನಿಮ್ಮ saved "${latest.title}" result: ${info} promotion ನಂತರ contribution. ${latest.learning.whatHappened} ${latest.learning.whatWeLearned} ${latest.synthetic ? "ಇವು sample demo outcomes, real business improvement ಅಲ್ಲ." : "ಇವು owner-entered outcomes, independently verified ಅಲ್ಲ."}`);
  } else if (intent === "learning") {
    content = local(l, `${name}, there are no completed experiments yet. Let's try one small idea and record what actually happened before judging the outcome.`,
      `${name}, abhi completed experiment nahi hai. Pehle ek chhota idea try karein aur actual result record karein.`,
      `${name}, अभी completed experiment नहीं है। पहले एक छोटा idea try करें और actual result record करें।`,
      `${name}, ಇನ್ನೂ completed experiment ಇಲ್ಲ. ಮೊದಲು ಸಣ್ಣ idea try ಮಾಡಿ actual result record ಮಾಡೋಣ.`);
  } else if (intent === "earnings") {
    const f = calculate({ sellingPrice: 99, makingCost: 45, promotionBudget: 1500, expectedUnits: 100 });
    content = local(l,
      `${name}, at ₹99 price and ₹45 making cost, each combo contributes ₹54 before promotion. For 100 sales: ₹${f.revenue.toLocaleString("en-IN")} sales − ₹${f.variableCosts.toLocaleString("en-IN")} making costs − ₹1,500 promotion = ₹3,900 contribution. Promotion breaks even at 28 units. This is not net profit: rent, salaries and taxes are excluded. These inputs are assumptions you can edit.`,
      `${name}, ₹99 price aur ₹45 making cost par har combo se ₹54 promotion se pehle bachte hain. 100 sales: ₹9,900 sales − ₹4,500 making costs − ₹1,500 promotion = ₹3,900 contribution. Promotion break-even 28 units par. Yeh net profit nahi: rent, salaries aur taxes shamil nahi. Inputs edit kar sakte hain.`,
      `${name}, ₹99 price और ₹45 making cost पर हर combo से ₹54 promotion से पहले बचते हैं। 100 sales: ₹9,900 sales − ₹4,500 making costs − ₹1,500 promotion = ₹3,900 contribution। Promotion break-even 28 units पर। यह net profit नहीं: rent, salaries और taxes शामिल नहीं। Inputs edit कर सकते हैं।`,
      `${name}, ₹99 price ಮತ್ತು ₹45 making cost ಇದ್ದರೆ ಪ್ರತಿ combo ಗೆ promotion ಮೊದಲು ₹54 ಉಳಿಯುತ್ತದೆ. 100 sales: ₹9,900 sales − ₹4,500 making costs − ₹1,500 promotion = ₹3,900 contribution. Promotion break-even 28 units. ಇದು net profit ಅಲ್ಲ: rent, salaries ಮತ್ತು taxes ಸೇರಿಲ್ಲ. Inputs ಬದಲಾಯಿಸಬಹುದು.`);
  } else if (intent === "clarify") {
    content = local(l,
      "I'm the credential-free Demo Engine, with a limited set of supported topics—not a live LLM. Try asking about weekday customers, breakfast combos, earnings, similar-business ideas, useful technology or saved experiment outcomes.",
      "Main credential-free Demo Engine hoon, live LLM nahi. Weekday customers, breakfast combo, earnings, similar businesses, technology ya saved experiment outcomes ke baare mein poochhein.",
      "मैं credential-free Demo Engine हूँ, live LLM नहीं। Weekday customers, breakfast combo, earnings, similar businesses, technology या saved experiment outcomes के बारे में पूछें।",
      "ನಾನು credential-free Demo Engine, live LLM ಅಲ್ಲ. Weekday customers, breakfast combo, earnings, similar businesses, technology ಅಥವಾ saved experiment outcomes ಬಗ್ಗೆ ಕೇಳಿ.");
  } else {
    const idea = opportunities(l, p).find((i) => i.id === opportunityId)!;
    content = local(l,
      `${name}, ${p.shopName} already has a breakfast menu in ${p.location}. Your challenge is "${p.challenge}". ${idea.description} ${idea.story} ${idea.whyItFits} ${idea.firstStep}`,
      `${name}, ${p.location} mein ${p.shopName} ka breakfast menu ready hai. Aapka challenge: "${p.challenge}". ${idea.description} ${idea.story} ${idea.whyItFits} ${idea.firstStep}`,
      `${name}, ${p.location} में ${p.shopName} का breakfast menu ready है। आपका challenge: "${p.challenge}"। ${idea.description} ${idea.story} ${idea.whyItFits} ${idea.firstStep}`,
      `${name}, ${p.location} ನಲ್ಲಿ ${p.shopName} breakfast menu ಸಿದ್ಧವಿದೆ. ನಿಮ್ಮ challenge: "${p.challenge}". ${idea.description} ${idea.story} ${idea.whyItFits} ${idea.firstStep}`);
  }
  const followUp = local(l,
    `Would a seven-day test within your ₹${p.budget.toLocaleString("en-IN")} promotion budget work, or is there another constraint?`,
    `₹${p.budget.toLocaleString("en-IN")} promotion budget mein seven-day test theek rahega, ya koi aur constraint hai?`,
    `₹${p.budget.toLocaleString("en-IN")} promotion budget में seven-day test ठीक रहेगा, या कोई और constraint है?`,
    `₹${p.budget.toLocaleString("en-IN")} promotion budget ನಲ್ಲಿ seven-day test ಸರಿಯೇ, ಅಥವಾ ಬೇರೆ constraint ಇದೆಯೇ?`);
  return aiOutput.parse({ content, followUp, opportunityId, intent,
    speechText: l === "hinglish" ? `रवि, weekdays पर customers कम आ रहे हैं। ₹99 breakfast combo try करें। पहले अपना budget और making cost confirm करें।` : content });
}
