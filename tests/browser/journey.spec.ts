import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

async function start(page: Page, language = "en") {
  await page.goto("/");
  await page.getByTestId("button-onboard-" + language).click();
  await expect(page.getByTestId("button-start-demo")).toBeEnabled();
  await page.getByTestId("button-start-demo").click();
  await expect(page.getByTestId("button-language-menu")).toBeVisible();
}
async function draftAndRun(page: Page) {
  await page.goto("/opportunity/combo");
  await expect(page.getByTestId("text-forecast")).toContainText("3,900");
  await expect(page.getByTestId("button-create-draft")).toBeEnabled();
  await page.getByTestId("button-create-draft").click();
  await expect(page).toHaveURL(/\/plans\/[^/]+$/);
  await page.getByTestId("button-approve").click();
  await page.getByTestId("button-dialog-confirm").click();
  await expect(page.getByTestId("button-start")).toBeVisible();
  await page.getByTestId("button-start").click();
  await page.getByTestId("button-dialog-confirm").click();
  await expect(page.getByTestId("form-results")).toBeVisible();
  return page.url().split("/").pop()!;
}
async function results(page: Page, scenario: "low" | "high") {
  await page.getByTestId("button-sample-" + scenario).click();
  await expect(page.getByTestId("button-save-results")).toBeDisabled();
  await page.getByTestId("checkbox-confirm").click();
  await page.getByTestId("button-save-results").click();
  await expect(page.getByTestId("section-learning")).toBeVisible();
}
async function state(request: APIRequestContext) {
  const r = await request.get("/api/udaan/state");
  expect(r.ok()).toBeTruthy();
  return r.json();
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
}

test("complete credential-free mobile discovery-to-learning journey", async ({ page }) => {
  await start(page, "hinglish");
  await page.screenshot({ path: "generated-artifacts/screenshots/03-home-hinglish.png", fullPage: true });
  await page.goto("/discover");
  await expect(page.locator('a[href="/opportunity/subscription"]').first()).toBeVisible();
  await page.locator('a[href="/opportunity/subscription"]').first().click();
  await expect(page.getByTestId("text-opportunity-title")).toContainText("Office");
  await page.screenshot({ path: "generated-artifacts/screenshots/06-subscription.png", fullPage: true });
  await page.goto("/ask");
  const composer = page.locator("textarea");
  await composer.fill("Mere restaurant mein weekdays par customers kam aa rahe hain. Kya karun?");
  await page.getByTestId("button-send").click();
  await expect(page.getByText("Udaan Breakfast House", { exact: false }).last()).toBeVisible();
  await page.screenshot({ path: "generated-artifacts/screenshots/07-demo-conversation.png", fullPage: true });
  await draftAndRun(page);
  await results(page, "low");
  await expect(page.getByTestId("text-achievement")).toHaveText("70%");
  await expect(page.getByTestId("card-next-recommendation")).toContainText("600");
  await page.screenshot({ path: "generated-artifacts/screenshots/10-learning-low.png", fullPage: true });
  await page.reload();
  await expect(page.getByTestId("text-achievement")).toHaveText("70%");
  await noOverflow(page);
  await page.getByTestId("link-explore-next").click();
  await expect(page.getByTestId("input-promotionBudget")).toHaveValue("600");
  await page.getByTestId("button-create-draft").click();
  await expect(page.getByTestId("button-approve")).toBeVisible();
  const list = await (await page.request.get("/api/udaan/experiments")).json();
  expect(list[0].parentExperimentId).toBeTruthy();
});

test("same pipeline changes recommendations for 70 versus 130 units", async ({ page }) => {
  await start(page);
  const low = await draftAndRun(page);
  await results(page, "low");
  await expect(page.getByTestId("card-next-recommendation")).toContainText("600");
  const high = await draftAndRun(page);
  await results(page, "high");
  await expect(page.getByTestId("text-achievement")).toHaveText("130%");
  await expect(page.getByTestId("card-next-recommendation")).toContainText("900");
  const rows = await (await page.request.get("/api/udaan/experiments")).json();
  const a = rows.find((e: { id: string }) => e.id === low);
  const b = rows.find((e: { id: string }) => e.id === high);
  expect(a.actual.contributionAfterPromotion).toBe(2280);
  expect(b.actual.contributionAfterPromotion).toBe(5520);
  expect(a.learning.nextOpportunityId).not.toBe(b.learning.nextOpportunityId);
  await page.screenshot({ path: "generated-artifacts/screenshots/11-learning-high.png", fullPage: true });
});

test("four languages preserve state without mobile overflow at both widths", async ({ page }) => {
  test.setTimeout(120000);
  await start(page);
  await draftAndRun(page);
  const before = await state(page.request);
  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
    for (const lang of ["en", "hinglish", "hi", "kn"]) {
      await page.getByTestId("button-language-menu").click();
      await page.getByTestId("option-language-" + lang).click();
      await expect.poll(async () => (await state(page.request)).preferences.language).toBe(lang);
      await page.goto("/");
      await expect(page.getByTestId("button-explore-featured")).toBeVisible();
      const cta = await page.getByTestId("button-explore-featured").boundingBox();
      expect(cta!.y + cta!.height).toBeLessThan((page.viewportSize()?.height ?? 844) - 80);
      await noOverflow(page);
      await page.screenshot({ path: `generated-artifacts/screenshots/home-${lang}-${width}.png`, fullPage: true });
      await page.goto("/discover"); await noOverflow(page);
      await page.goto("/plans"); await noOverflow(page);
      const after = await state(page.request);
      expect(after.experimentCount).toBe(before.experimentCount);
      expect(after.profile.shopName).toBe(before.profile.shopName);
    }
  }
});

test("demo reset restores only this browser's fictional state", async ({ page, playwright }) => {
  await start(page);
  await draftAndRun(page);
  const other = await playwright.request.newContext({ baseURL: "http://localhost:80" });
  await other.get("/api/udaan/state");
  await other.patch("/api/udaan/profile", { data: { shopName: "Isolated test café" } });
  await page.goto("/settings");
  await page.getByTestId("button-reset-demo").click();
  await page.getByTestId("button-dialog-confirm").click();
  await expect.poll(async () => (await state(page.request)).experimentCount).toBe(0);
  const current = await state(page.request);
  expect(current.profile.shopName).toBe("Udaan Breakfast House");
  expect(current.preferences.provider).toBe("demo");
  expect((await state(other)).profile.shopName).toBe("Isolated test café");
  await other.dispose();
});
