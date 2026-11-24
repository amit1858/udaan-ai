import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = 'https://udaan-ai-builder.replit.app/';
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  headless: true,
});
const evidence = { url, capturedAt: new Date().toISOString(), policy: 'GET/HEAD only; no clicks, no form submissions, no provider calls, no state injection', captures: [], blockedRequests: [] };
await fs.mkdir(path.join(root, 'screenshots', 'live'), { recursive: true });
try {
  for (const [name, viewport] of [
    ['onboarding-mobile', { width: 390, height: 844 }],
    ['onboarding-desktop', { width: 1440, height: 1000 }],
  ]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    await context.route('**/*', async route => {
      const request = route.request();
      if (!['GET', 'HEAD'].includes(request.method())) {
        evidence.blockedRequests.push({ method: request.method(), url: request.url() });
        await route.abort('blockedbyclient');
        return;
      }
      await route.continue();
    });
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response?.ok()) throw new Error(`Live entry failed: ${response?.status()}`);
    await page.getByRole('button', { name: 'Start the demo', exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const text = await page.locator('body').innerText();
    if (!text.includes('Fictional business, synthetic data')) throw new Error('Expected disclosure not rendered');
    const relative = `screenshots/live/${name}.png`;
    await page.screenshot({ path: path.join(root, relative), fullPage: true });
    const bytes = await fs.readFile(path.join(root, relative));
    evidence.captures.push({ file: relative, viewport, deviceScaleFactor: 2, status: response.status(), sha256: crypto.createHash('sha256').update(bytes).digest('hex'), renderedText: text });
    await context.close();
  }
  evidence.limitations = 'Only deployed onboarding is verified. Entering Demo changes visitor preferences; this capture intentionally stops before it. Downstream workflow screenshots are inherited release-candidate evidence, not fresh production captures.';
  await fs.writeFile(path.join(root, 'screenshots', 'live', 'capture.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(`Captured ${evidence.captures.length} genuine live entry screens, without interaction.`);
} finally {
  await browser.close();
}
