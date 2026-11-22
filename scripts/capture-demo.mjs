// Explicit authorized competition capture, not part of CI. One bounded live request.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || execFileSync("which", ["chromium"], { encoding: "utf8" }).trim(),
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: "generated-artifacts/walkthrough", size: { width: 390, height: 844 } },
});
const page = await context.newPage();
page.setDefaultTimeout(45000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = "http://localhost:80";
const shot = async (name, fullPage = false) => page.screenshot({ path: `generated-artifacts/screenshots/${name}.png`, fullPage });
try {
  await page.goto(base);
  await shot("01-language-390");
  await page.getByTestId("button-onboard-hinglish").click();
  await page.getByTestId("button-start-demo").click();
  await page.getByTestId("button-explore-featured").waitFor();
  await shot("02-featured-home");
  await page.goto(base + "/discover");
  await page.locator('a[href="/opportunity/subscription"]').first().click();
  await page.getByTestId("text-opportunity-title").waitFor();
  await shot("03-office-discovery", true);
  await page.goto(base + "/settings");
  await page.getByTestId("button-use-openai").click();
  await page.waitForFunction(async () => (await (await fetch("/api/udaan/state")).json()).preferences.provider === "openai", undefined, { polling: 1000 });
  await shot("04-provider-settings", true);
  await page.goto(base + "/ask");
  await page.locator("textarea").fill("Mere restaurant mein weekdays par customers kam aa rahe hain. Kya karun?");
  await page.getByTestId("button-send").click();
  await page.waitForFunction(async () => (await (await fetch("/api/udaan/conversation")).json()).some((m) => m.role === "assistant" && m.provider === "openai"), undefined, { polling: 1000 });
  await page.locator('[data-testid^="message-assistant-"]').first().waitFor();
  await shot("05-live-openai-response", true);
  const conversation = await page.evaluate(async () => (await fetch("/api/udaan/conversation")).json());
  const live = conversation.find((m) => m.role === "assistant" && m.provider === "openai");
  if (!live?.tokens || !live?.followUp) throw new Error("Live response did not include provider evidence");
  await fs.writeFile("generated-artifacts/live-ui-verification.json", JSON.stringify({ provider: live.provider, model: live.model, content: live.content, followUp: live.followUp, tokens: live.tokens, createdAt: live.createdAt }, null, 2));
  // Explicit return to Demo Mode through real settings, preserving the live conversation.
  await page.goto(base + "/settings");
  await page.getByTestId("button-use-demo").click();
  await page.goto(base + "/opportunity/combo");
  await page.getByTestId("button-create-draft").waitFor({ state: "visible" });
  await page.waitForFunction(() => !document.querySelector('[data-testid="button-create-draft"]')?.disabled);
  await page.getByTestId("input-sellingPrice").scrollIntoViewIfNeeded();
  await shot("06-financial-evaluation");
  await page.getByTestId("button-create-draft").click();
  await page.getByTestId("button-approve").click();
  await page.getByTestId("button-dialog-confirm").click();
  await page.getByTestId("button-start").click();
  await page.getByTestId("button-dialog-confirm").click();
  await page.getByTestId("button-sample-low").click();
  await shot("07-results-form", true);
  await page.getByTestId("checkbox-confirm").click();
  await page.getByTestId("button-save-results").click();
  await page.getByTestId("section-learning").waitFor();
  await page.getByTestId("text-achievement").scrollIntoViewIfNeeded();
  await shot("08-outcome-comparison");
  await page.getByTestId("section-learning").scrollIntoViewIfNeeded();
  await shot("09-learning-and-next");
  await page.getByTestId("button-language-menu").click();
  await page.getByTestId("option-language-kn").click();
  await page.waitForFunction(async () => (await (await fetch("/api/udaan/state")).json()).preferences.language === "kn", undefined, { polling: 1000 });
  await page.waitForTimeout(500);
  await page.getByTestId("section-learning").scrollIntoViewIfNeeded();
  await shot("10-kannada-learning");
  if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
  console.log("Actual 390×844 walkthrough and live UI response captured; no page errors. One paid call used.");
} finally {
  await context.close();
  await browser.close();
}
