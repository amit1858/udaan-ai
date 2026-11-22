// Isolated, short-lived production-build verification server, not an app workflow.
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, devices } from '@playwright/test';
const root = path.resolve('artifacts/udaan-ai/dist/public');
const output = path.resolve('generated-artifacts/pwa-verification');
await mkdir(output, { recursive: true });
let swVersion = 0;
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const headers = { ...req.headers, host: 'localhost', 'x-forwarded-host': req.headers.host };
      delete headers['content-length']; delete headers.connection;
      const response = await fetch('http://localhost:80' + req.url, { method: req.method, headers,
        ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) });
      res.statusCode = response.status;
      for (const [key, value] of response.headers) if (!['content-encoding', 'content-length', 'transfer-encoding', 'set-cookie'].includes(key)) res.setHeader(key, value);
      res.setHeader('set-cookie', response.headers.getSetCookie());
      res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    let target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!target.startsWith(root + path.sep) && target !== root) { res.writeHead(403).end(); return; }
    let exists = await stat(target).catch(() => null);
    if (exists?.isDirectory()) target = path.join(target, 'index.html');
    else if (!exists) target = path.join(root, 'index.html');
    exists = await stat(target);
    let bytes = await readFile(target);
    if (url.pathname === '/sw.js') bytes = Buffer.concat([bytes, Buffer.from(`\n// verification-update-${swVersion}\n`)]);
    res.setHeader('Content-Type', mime[path.extname(target)] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(bytes);
  } catch { res.writeHead(500).end('Production verification server error'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(path.join(tmpdir(), 'udaan-pwa-'));
const context = await chromium.launchPersistentContext(profile, { ...devices['Pixel 5'], executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox'] });
const page = await context.newPage();
const evidence = { testedAt: new Date().toISOString(), environment: 'Built production assets in system Chromium with Pixel 5 emulation; NOT a physical device', publicDeployment: false };
try {
  const manifest = await (await fetch(base + '/manifest.webmanifest')).json();
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.short_name, 'Udaan');
  assert.deepEqual(manifest.icons.map(i => i.sizes), ['192x192', '512x512', '512x512']);
  assert.ok(manifest.icons.some(i => i.purpose === 'maskable'));
  evidence.manifest = manifest;
  await page.goto(base);
  await page.getByTestId('button-start-demo').click();
  await page.getByTestId('button-explore-featured').waitFor();
  await page.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true), new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker did not become ready')), 20000))]));
  await page.reload(); await page.getByTestId('button-explore-featured').waitFor();
  assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true);
  evidence.serviceWorker = { registered: true, controlling: true, secureContext: await page.evaluate(() => isSecureContext) };
  const cdp = await context.newCDPSession(page);
  try { evidence.installability = await cdp.send('Page.getInstallabilityErrors'); } catch { evidence.installability = 'CDP installability inspection unsupported; manifest and worker independently verified'; }
  const before = await page.evaluate(async () => (await fetch('/api/udaan/experiments')).json());
  await page.goto(base + '/opportunity/combo');
  const input = page.getByTestId('input-sellingPrice');
  await input.fill('109');
  swVersion++;
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
  await page.getByTestId('pwa-update').waitFor({ timeout: 20000 });
  assert.equal(await input.inputValue(), '109');
  await page.getByTestId('pwa-update').click();
  await page.getByTestId('button-dialog-cancel').click();
  assert.equal(await input.inputValue(), '109');
  evidence.nonDestructiveUpdate = 'New worker waited; explicit confirmation appeared; cancelling retained the edited financial input';
  await context.setOffline(true);
  await page.getByTestId('pwa-status').waitFor();
  assert.equal(await input.inputValue(), '109');
  evidence.openInputsPreservedWhileOffline = true;
  const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async name => ({ name, urls: (await (await caches.open(name)).keys()).map(r => r.url) })))));
  assert.equal(cached.flatMap(c => c.urls).filter(url => /\/api\/|sarvam|indiarestros|openai\.com|anthropic\.com/.test(url)).length, 0);
  evidence.cacheEntries = cached;
  await page.reload();
  await page.getByTestId('offline-launch').waitFor();
  await page.screenshot({ path: path.join(output, 'offline-mobile.png'), fullPage: true });
  evidence.offlineShellLaunch = true;
  const apiUnavailable = await page.evaluate(async () => { try { await fetch('/api/udaan/state'); return false; } catch { return true; } });
  assert.equal(apiUnavailable, true);
  evidence.privateApiNotServedFromCache = true;
  await context.setOffline(false);
  await page.reload(); await page.getByTestId('button-explore-featured').waitFor();
  const after = await page.evaluate(async () => (await fetch('/api/udaan/experiments')).json());
  assert.deepEqual(after, before);
  evidence.savedExperimentsUnchanged = true;
  await page.goto(base + '/settings'); await page.getByTestId('pwa-install').waitFor();
  await page.screenshot({ path: path.join(output, 'installation-settings-mobile.png'), fullPage: true });
  evidence.iosAddToHomeScreenGuidance = 'Rendered; physical iPhone Safari not available';
  evidence.osInstallation = 'Not performed; real Android/iOS installation still needs a device and standalone HTTPS production deployment';
  evidence.passed = true;
} catch (error) { evidence.passed = false; evidence.error = error.message; process.exitCode = 1; }
finally {
  await writeFile(path.join(output, 'verification.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
  await context.close(); await rm(profile, { recursive: true, force: true });
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
