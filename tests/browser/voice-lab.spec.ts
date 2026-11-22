import { test, expect } from "@playwright/test";
test("internal Voice Lab keeps configuration and paid controls behind admin access", async ({ page }) => {
  const speechPosts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && /voice-lab\/(test|transcribe|synthesize)/.test(r.url())) speechPosts.push(r.url());
  });
  await page.goto("/");
  await page.getByTestId("button-start-demo").click();
  await page.getByTestId("button-explore-featured").waitFor();
  await page.goto("/settings");
  await page.getByRole("link", { name: /Sarvam Voice Lab/i }).click();
  await expect(page.getByRole("heading", { name: "Sarvam Voice Lab", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid="panel-setup"], [data-testid="panel-locked"]')).toBeVisible();
  await expect(page.getByTestId("input-tts-text")).toHaveCount(0);
  await expect(page.getByTestId("input-max-requests")).toHaveCount(0);
  expect(speechPosts).toEqual([]);
  const state = await page.evaluate(async () => (await fetch("/api/udaan/voice-lab/status")).json());
  // Configured secrets must remain redacted even after the creator has added real keys.
  expect(state).toMatchObject({ access: "locked", configured: false, paidEnabled: false, requests: [] });
  const denied = await page.request.post("/api/udaan/voice-lab/test", { data: { confirmed: true } });
  expect(denied.status()).toBe(401);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: "generated-artifacts/screenshots/voice-lab-locked.png", fullPage: true });
});
