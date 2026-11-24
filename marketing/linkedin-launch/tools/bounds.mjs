import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  headless: true,
});
const results = [];
try {
  const page = await browser.newPage();
  const files = (await fs.readdir(path.join(root, 'source'))).filter(name => /^\d{2}-.+\.svg$/.test(name)).sort();
  for (const file of files) {
    await page.goto(pathToFileURL(path.join(root, 'source', file)).href);
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.evaluate(() => [...document.querySelectorAll('text')].flatMap(element => {
      const box = element.getBBox();
      return box.x < 60 || box.y < 60 || box.x + box.width > 1020 || box.y + box.height > 1290
        ? [{ text: element.textContent, x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height }] : [];
    }));
    results.push({ file, issues });
  }
  await fs.writeFile(path.join(root, 'source', 'bounds-check.json'), JSON.stringify(results, null, 2) + '\n');
  if (results.some(result => result.issues.length)) throw new Error(`Text outside the 60px safe area:\n${JSON.stringify(results.filter(result => result.issues.length), null, 2)}`);
  console.log('PASS: all seven SVGs retain 60px text safe areas.');
} finally {
  await browser.close();
}
