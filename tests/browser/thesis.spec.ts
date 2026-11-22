import { test, expect } from "@playwright/test";
test("thesis website uses actual assets, valid links and responsive interactions", async ({ page }) => {
  test.setTimeout(60000);
  const broken: string[] = [];
  page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith("http://localhost")) broken.push(r.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/thesis/");
  await expect(page).toHaveURL(/\/thesis\/index.html$/);
  await expect(page.locator("h1")).toContainText("Every small business");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  const images = page.locator("img");
  for (let i = 0; i < await images.count(); i++) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
    await expect.poll(async () => image.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  const invalidAnchors = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    .map((a) => a.getAttribute("href")!).filter((id) => id.length > 1 && !document.querySelector(id)));
  expect(invalidAnchors).toEqual([]);
  expect((await page.request.get("/thesis/assets/product-thesis.md")).ok()).toBeTruthy();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/thesis/index.html");
  await page.screenshot({ path: "generated-artifacts/screenshots/thesis-mobile.png" });
  expect(broken).toEqual([]);
});
