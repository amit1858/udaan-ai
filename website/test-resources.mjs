/* Tests only the loopback static site; never opens the live application. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.dirname(fileURLToPath(import.meta.url));
const origin = process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:8765';
assert.equal(new URL(origin).hostname, '127.0.0.1', 'Static validation must stay on loopback');
const output = process.argv[2];
assert(output, 'Provide an outside-repository evidence directory');
await mkdir(output, { recursive: true });
const check = await readFile(path.join(root, 'browser-check.js'), 'utf8');
const manifest = JSON.parse(await readFile(path.join(root, 'assets', 'resources', 'manifest.json'), 'utf8'));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH, headless: true,
});
const results = [];
try {
  for (const width of [1280, 956, 768, 390, 360, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 }, deviceScaleFactor: 1,
      reducedMotion: 'reduce', acceptDownloads: true,
    });
    const errors = [];
    await context.route('**/*', async route => {
      const request = route.request();
      if (new URL(request.url()).origin !== origin || !['GET', 'HEAD'].includes(request.method())) {
        errors.push(`Out-of-scope request: ${request.method()} ${request.url()}`);
        await route.abort();
      } else {
        await route.continue();
      }
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/udaan-ai/`, { waitUntil: 'networkidle' });
    const initial = await page.evaluate(() => ({
      mp4Requests: performance.getEntriesByType('resource').filter(item => item.name.endsWith('.mp4')).length,
      pdfRequests: performance.getEntriesByType('resource').filter(item => item.name.endsWith('.pdf')).length,
      paused: document.getElementById('productDemo').paused,
    }));
    assert.equal(initial.mp4Requests, 0, `${width}: no eager video transfer`);
    assert.equal(initial.pdfRequests, 0, `${width}: no eager PDF transfer`);
    assert(initial.paused, `${width}: no automatic audio playback`);
    await page.addScriptTag({ content: check });
    results.push({ ...await page.evaluate(() => window.checkUdaanShowcase()), initial });
    await page.locator('#demo-video').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById('demo-video').scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(output, `demo-${width}.png`) });
    await page.locator('#carouselTrack').scrollIntoViewIfNeeded();
    await page.locator('#carouselTrack img').first().evaluate(image => image.decode());
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(output, `carousel-${width}.png`) });
    const track = page.locator('#carouselTrack');
    await track.evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await page.waitForTimeout(200);
    assert(await page.locator('#carouselNext').isDisabled(), `${width}: last carousel boundary`);
    await track.evaluate(element => { element.scrollLeft = 0; });
    await page.waitForTimeout(200);
    assert(await page.locator('#carouselPrev').isDisabled(), `${width}: first carousel boundary`);
    if (width === 1280) {
      for (const filename of ['udaan-demo.mp4', 'udaan-carousel.pdf', 'udaan-cover.png', 'udaan-promotional-cover.png', 'udaan-captions.srt', 'udaan-captions.vtt']) {
        const event = page.waitForEvent('download');
        const scope = filename === 'udaan-cover.png' ? '#videoCaption' : '.download-grid';
        await page.locator(`${scope} a[download][href$="${filename}"]`).click();
        const download = await event;
        assert.equal(await download.failure(), null, `Browser download: ${filename}`);
        const data = await readFile(await download.path());
        const expected = manifest.files.find(item => item.file === filename);
        assert.equal(createHash('sha256').update(data).digest('hex'), expected.sha256, `Downloaded master integrity: ${filename}`);
      }
      await page.locator('#demo-video').scrollIntoViewIfNeeded();
      const playback = await page.evaluate(async () => {
        const video = document.getElementById('productDemo');
        await video.play();
        await new Promise(resolve => setTimeout(resolve, 500));
        video.pause();
        const played = video.currentTime;
        video.currentTime = 72;
        await new Promise((resolve, reject) => {
          video.addEventListener('seeked', resolve, { once: true });
          video.addEventListener('error', reject, { once: true });
        });
        const captions = video.textTracks[0];
        captions.mode = 'hidden';
        await new Promise(resolve => setTimeout(resolve, 300));
        return { duration: video.duration, played, seek: video.currentTime, captions: captions.cues?.length, error: video.error };
      });
      assert.equal(playback.duration, 73, 'Actual browser video duration');
      assert(playback.played > 0, 'Actual decoded playback');
      assert(Math.abs(playback.seek - 72) < 0.05, `Seek to final second: ${JSON.stringify(playback)}`);
      assert.equal(playback.captions, 28, 'All approved caption cues loaded');
      assert.equal(playback.error, null, 'No browser media decoder error');
      results.at(-1).playback = playback;
      await page.goto(`${origin}/udaan-ai/credits.html#demo-media`);
      assert(await page.locator('#demo-media').isVisible(), 'Published media credit anchor');
      assert(await page.locator('#carousel-media').count(), 'Published carousel credit anchor');
    }
    assert.deepEqual(errors, [], `${width}: no script errors or external/application requests`);
    await context.close();
  }
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/udaan-ai/#resources`);
  assert.equal(await page.locator('#carouselTrack figure').count(), 7, 'All slides available without JS');
  assert.equal(await page.locator('.download-grid a[download]').count(), 5, 'All downloads available without JS');
  assert.equal(await page.locator('video[controls]').count(), 1, 'Native playback available without JS');
  await context.close();
  await writeFile(path.join(output, 'browser-validation.json'), JSON.stringify({ result: 'PASS', noJavaScript: 'PASS', widths: results }, null, 2));
  console.log(JSON.stringify({ result: 'PASS', widths: results.map(item => item.width), noJavaScript: true, playback: results[0].playback }, null, 2));
} finally {
  await browser.close();
}
