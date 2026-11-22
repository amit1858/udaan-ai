import { test, expect } from "@playwright/test";
test("retrieved Whitefield menu facts remain attributed and lead to an affordable experiment", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("button-onboard-hinglish").click();
  await page.getByTestId("button-start-demo").click();
  await page.getByTestId("button-explore-featured").waitFor();
  await page.goto("/ask");
  await page.getByTestId("button-market-question").click();
  const card = page.getByTestId("card-market-inspiration");
  await expect(card).toBeVisible({ timeout: 30000 });
  await expect(card).toContainText("IndiaRestros");
  await expect(card).toContainText("Demo hypothesis, live AI nahi");
  const fact = await page.evaluate(async () => {
    const messages = await (await fetch("/api/udaan/conversation")).json();
    return messages.find((m: { market?: unknown }) => m.market)?.market;
  });
  expect(fact.status).toBe("retrieved");
  expect(fact.facts.length).toBeGreaterThan(0);
  expect(fact.facts[0].url).toMatch(/^https:\/\/indiarestros.com\/r\//);
  expect(fact.facts[0].menu.length).toBeGreaterThan(0);
  expect(fact.facts[0].updated).toBeTruthy();
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: "generated-artifacts/screenshots/market-inspiration.png" });
  await page.reload();
  await expect(card).toContainText(fact.facts[0].name);
  await card.locator('a[href="/opportunity/preorder"]').click();
  await expect(page.getByTestId("text-opportunity-title")).toBeVisible();
  await expect(page.getByTestId("input-promotionBudget")).toHaveValue("0");
});
