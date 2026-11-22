// Explicitly invoked only after presenter authorization. No automatic CI execution.
// Makes at most two live calls, using the same server-side spending gate and stored business context as the app.
import fs from "node:fs/promises";
const root = "http://localhost:80";
let cookie = "";
async function call(path, method = "GET", body) {
  const response = await fetch(root + "/api/udaan" + path, {
    method,
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const data = await response.json();
  if (!response.ok) throw new Error(`Verification ${path} failed (${response.status}): ${data.error}`);
  return data;
}
await call("/state");
await call("/preferences", "PATCH", { language: "hinglish", provider: "openai", onboarded: true });
const evidence = [];
for (const units of [70, 130]) {
  const e = await call("/experiments", "POST", {
    opportunityId: "combo", sellingPrice: 99, makingCost: 45, promotionBudget: 1500, expectedUnits: 100, durationDays: 7,
  });
  await call(`/experiments/${e.id}/transition`, "POST", { status: "Approved", confirmed: true });
  await call(`/experiments/${e.id}/transition`, "POST", { status: "Running", confirmed: true });
  const saved = await call(`/experiments/${e.id}/results`, "POST", {
    actualUnits: units, actualPromotionSpend: 1500, feedback: "Synthetic competition scenario", confirmed: true, synthetic: true,
  });
  const answer = await call("/chat", "POST", { message: `Mere latest saved experiment ke actual ${units} units ke result se kya seekha? Ab agla chhota experiment kya hona chahiye aur kyun? Pichle experiments se compare karo.` });
  if (answer.provider !== "openai" || !answer.tokens || !answer.followUp) throw new Error("Missing real provider metadata");
  evidence.push({
    scenario: units, expected: saved.expected, actual: saved.actual, learning: saved.learning,
    live: { provider: answer.provider, model: answer.model, content: answer.content, followUp: answer.followUp,
      opportunityId: answer.opportunityId, tokens: answer.tokens, createdAt: answer.createdAt },
  });
}
await fs.mkdir("generated-artifacts", { recursive: true });
await fs.writeFile("generated-artifacts/live-verification.json", JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
