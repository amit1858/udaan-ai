import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = process.env.PROBE_OUTPUT;
const executablePath = process.env.CHROMIUM_PATH;
if (!output || !path.isAbsolute(output) || !executablePath) {
  throw new Error('Set absolute PROBE_OUTPUT and CHROMIUM_PATH. This probe records no product journey.');
}
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const evidence = { checkedAt: new Date().toISOString(), blocked: [], allowed: [], markers: {} };
try {
  const context = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2,
    serviceWorkers: 'block',
  });
  // GETs to the application API can create a persistent visitor session.
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const allowed = request.method() === 'GET'
      && url.origin === 'https://udaan-ai-builder.replit.app'
      && (url.pathname === '/' || url.pathname.startsWith('/assets/')
        || url.pathname.startsWith('/icons/') || url.pathname === '/favicon.svg'
        || url.pathname === '/manifest.webmanifest');
    const entry = { method: request.method(), url: url.href };
    if (!allowed) {
      evidence.blocked.push(entry);
      return route.abort('blockedbyclient');
    }
    evidence.allowed.push(entry);
    await route.continue();
  });
  const page = await context.newPage();
  const bundles = [];
  page.on('response', (response) => {
    if (new URL(response.url()).pathname.match(/^\/assets\/.*\.js$/)) {
      bundles.push(response.text());
    }
  });
  const response = await page.goto('https://udaan-ai-builder.replit.app/', { waitUntil: 'networkidle' });
  evidence.rootStatus = response.status();
  evidence.title = await page.title();
  const text = (await Promise.all(bundles)).join('\n');
  for (const marker of ['button-start-demo', 'button-create-draft', 'button-save-results',
    '/api/udaan/state', '/api/udaan/preferences', 'section-learning', 'spending_disabled']) {
    evidence.markers[marker] = text.includes(marker);
  }
  evidence.bundleSha256 = createHash('sha256').update(text).digest('hex');
  evidence.visibleText = await page.locator('body').innerText();
  await page.screenshot({ path: path.join(output, 'api-blocked-entry.png'), fullPage: true });
  await context.close();

  const probeContext = await browser.newContext({
    viewport: { width: 432, height: 768 },
    recordVideo: { dir: output, size: { width: 432, height: 768 } },
    serviceWorkers: 'block',
  });
  await probeContext.route('**/*', (route) => route.abort('blockedbyclient'));
  const probe = await probeContext.newPage();
  await probe.setContent('<title>Recorder capability probe</title><body style="background:#0a0d16;color:#bdf52f;font:28px sans-serif;padding:32px"><h1>RECORDER PROBE</h1><p>Not Udaan application footage.</p><p>No product outcomes.</p><output>Starting</output></body>');
  const video = probe.video();
  for (let second = 1; second <= 3; second++) {
    await probe.locator('output').evaluate((element, value) => { element.textContent = `Probe second ${value}`; }, second);
    await probe.waitForTimeout(1000);
  }
  await probeContext.close();
  const videoPath = path.join(output, 'recorder-probe.webm');
  await video.saveAs(videoPath);
  const original = await video.path();
  if (original !== videoPath) await video.delete();
  const bytes = await readFile(videoPath);
  evidence.probe = {
    file: 'recorder-probe.webm',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    viewport: { width: 432, height: 768 },
    recording: { width: 432, height: 768 },
    productFootage: false,
  };
  await writeFile(path.join(output, 'probe-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
