import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

export const ORIGIN = 'http://127.0.0.1:4317';
export const QUESTION = 'Could a 99 rupee breakfast combo help weekday customers?';
export const INPUTS = { sellingPrice: 99, makingCost: 45, promotionBudget: 1500, expectedUnits: 100 };
const FEEDBACK = 'Regulars liked it, but few new office customers noticed the offer.';
const equal = (actual, expected) => actual !== null && typeof actual === 'object'
  && Object.keys(actual).length === Object.keys(expected).length
  && Object.entries(expected).every(([key, value]) => actual[key] === value);

export function createPolicy(origin = ORIGIN) {
  const state = { demoVerified: false, planId: null, counts: {}, blocked: [] };
  const reads = new Set(['state', 'opportunities', 'experiments', 'conversation', 'providers', 'live-access']);
  const allow = (method, url, body = null) => {
    const target = new URL(url);
    if (['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].includes(target.origin)) {
      return method === 'GET' ? 'font' : null;
    }
    if (target.origin !== origin) return null;
    if (method === 'GET') {
      if (target.pathname.startsWith('/api/udaan/')) {
        return reads.has(target.pathname.slice('/api/udaan/'.length)) ? 'read' : null;
      }
      return target.pathname.startsWith('/api/') ? null : 'static';
    }
    const route = target.pathname;
    let action;
    if (method === 'PATCH' && route === '/api/udaan/preferences'
      && equal(body, { language: 'en', onboarded: true })) action = 'preferences';
    if (method === 'POST' && route === '/api/udaan/chat' && state.demoVerified
      && equal(body, { message: QUESTION })) action = 'chat';
    if (method === 'POST' && route === '/api/udaan/evaluate' && equal(body, INPUTS)) {
      return 'evaluate';
    }
    if (method === 'POST' && route === '/api/udaan/experiments' && state.demoVerified
      && equal(body, { ...INPUTS, opportunityId: 'combo', durationDays: 7 })) action = 'draft';
    if (state.planId && method === 'POST'
      && route === `/api/udaan/experiments/${state.planId}/transition`) {
      if (equal(body, { status: 'Approved', confirmed: true })) action = 'approve';
      if (equal(body, { status: 'Running', confirmed: true })
        && state.counts.approve === 1) action = 'start';
    }
    if (state.planId && method === 'POST'
      && route === `/api/udaan/experiments/${state.planId}/results`
      && state.counts.start === 1 && equal(body, {
        actualUnits: 70, actualPromotionSpend: 1500, feedback: FEEDBACK,
        confirmed: true, synthetic: true,
      })) action = 'results';
    if (!action || state.counts[action]) return null;
    state.counts[action] = 1;
    return action;
  };
  return { state, allow };
}

export async function record() {
  const output = process.env.RECORD_OUTPUT;
  const executablePath = process.env.CHROMIUM_PATH;
  const origin = process.env.RECORD_ORIGIN ?? ORIGIN;
  const local = origin === ORIGIN;
  if (!local) throw new Error('Only the isolated loopback recording origin is permitted.');
  if (!output || !path.isAbsolute(output) || !executablePath
    || process.env.RECORD_AUTHORIZATION !== 'isolated-local-demo-one-take') {
    throw new Error('Explicit one-take authorization and absolute recording paths are required.');
  }
  // An existing output directory must never trigger an accidental second production take.
  await mkdir(output);
  await mkdir(path.join(output, 'screenshots'));
  const policy = createPolicy(origin);
  const evidence = {
    environment: local ? 'isolated-local-prototype' : 'production-hosted-demo',
    data: 'fictional business and illustrative synthetic results',
    authorization: 'Direct user recording/autonomous production instruction, 23 November 2026',
    productionApplicationUsed: false,
    referenceSourceCommit: 'de9283e1c8a1d08cf62fd9832e0d14df84749d43',
    startedAt: new Date().toISOString(), viewport: { width: 432, height: 768 },
    scenes: [], requests: [], blocked: [], pageErrorCount: 0, status: 'started',
  };
  const browser = await chromium.launch({ executablePath, headless: true });
  let context;
  let page;
  let video;
  let start;
  let failure;
  const redact = (pathname) => pathname.replace(/\/experiments\/[^/]+/, '/experiments/:recorded-plan')
    .replace(/\/plans\/[^/]+/, '/plans/:recorded-plan');
  try {
    context = await browser.newContext({
      viewport: evidence.viewport, deviceScaleFactor: 2,
      recordVideo: { dir: output, size: evidence.viewport },
      serviceWorkers: local ? 'allow' : 'block',
    });
    evidence.serviceWorkers = local ? 'actual tagged app worker enabled on isolated loopback origin'
      : 'blocked to keep the approved network boundary interceptable; not an offline/PWA test';
    await context.route('**/*', async (route) => {
      const request = route.request();
      let body = null;
      if (!['GET', 'HEAD'].includes(request.method())) {
        try { body = request.postDataJSON(); } catch { body = null; }
      }
      const target = new URL(request.url());
      const decision = policy.allow(request.method(), request.url(), body);
      const entry = { method: request.method(), origin: target.origin, path: redact(target.pathname) };
      if (!decision) {
        evidence.blocked.push(entry);
        return route.abort('blockedbyclient');
      }
      if (decision !== 'static' && decision !== 'font') evidence.requests.push({ ...entry, action: decision });
      await route.continue();
    });
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', () => { evidence.pageErrorCount++; });
    page.on('response', async (response) => {
      const target = new URL(response.url());
      if (/^\/assets\/[^/]+\.js$/.test(target.pathname)) {
        try {
          const bytes = await response.body();
          evidence.bundles ??= [];
          evidence.bundles.push({ path: target.pathname,
            sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
          evidence.bundle = { path: target.pathname, sha256: createHash('sha256').update(bytes).digest('hex') };
        } catch { evidence.bundleReadFailed = true; }
      }
    });
    video = page.video();
    start = performance.now();
    const elapsed = () => Number(((performance.now() - start) / 1000).toFixed(3));
    const hold = (milliseconds = 2500) => page.waitForTimeout(milliseconds);
    const scene = async (label, milliseconds = 2500) => {
      const at = elapsed();
      await hold(milliseconds);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      const file = `${String(evidence.scenes.length + 1).padStart(2, '0')}-${label}.png`;
      await page.screenshot({ path: path.join(output, 'screenshots', file) });
      evidence.scenes.push({ label, startSeconds: at, endSeconds: elapsed(), screenshot: file,
        path: redact(new URL(page.url()).pathname) });
    };
    const read = async (endpoint) => {
      const response = await page.request.get(`${origin}/api/udaan/${endpoint}`);
      assert.equal(response.ok(), true, `Read ${endpoint} failed.`);
      evidence.requests.push({ method: 'GET', origin, path: `/api/udaan/${endpoint}`, action: 'verification-read' });
      return response.json();
    };
    const clickResponse = async (selector, endpoint) => {
      const [response] = await Promise.all([
        page.waitForResponse((response) => new URL(response.url()).pathname === endpoint
          && response.request().method() !== 'GET', { timeout: 30000 }),
        page.getByTestId(selector).click(),
      ]);
      assert.equal(response.ok(), true, `Approved ${selector} request failed with HTTP ${response.status()}.`);
      return response.json();
    };
    const navigate = async (route) => {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
    };
    await navigate('/');
    await page.getByTestId('button-start-demo').waitFor({ state: 'visible' });
    const initial = await read('state');
    assert.equal(initial.preferences.provider, 'demo');
    assert.equal(initial.preferences.language, 'en');
    assert.equal(initial.preferences.onboarded, false);
    assert.equal((await read('experiments')).length, 0);
    assert.equal((await read('conversation')).length, 0);
    policy.state.demoVerified = true;
    evidence.initial = { provider: 'demo', onboarded: false, experimentCount: 0, chatCount: 0 };
    await scene('onboarding', 3500);
    await clickResponse('button-start-demo', '/api/udaan/preferences');
    await page.getByTestId('text-greeting').waitFor({ state: 'visible' });
    await scene('home', 4500);
    await navigate('/shop');
    await scene('fictional-shop-context', 4000);
    await navigate('/discover');
    await page.locator('a[href="/opportunity/combo"]').first().waitFor({ state: 'visible' });
    await scene('discover', 4000);
    await navigate('/ask');
    await page.getByTestId('input-chat').fill(QUESTION);
    await scene('owner-question', 2500);
    const answer = await clickResponse('button-send', '/api/udaan/chat');
    assert.equal(answer.provider, 'demo');
    assert.equal(answer.tokens, 0);
    assert.equal(answer.opportunityId, 'combo');
    await page.locator('[data-testid^="message-assistant-"]').last().waitFor({ state: 'visible' });
    const badge = page.locator('[data-testid^="status-message-provider-"]').last();
    assert.match(await badge.innerText(), /demo/i);
    await badge.scrollIntoViewIfNeeded();
    evidence.chat = { provider: answer.provider, model: answer.model, tokens: answer.tokens, opportunityId: answer.opportunityId };
    await scene('demo-response', 5500);
    await page.getByTestId('card-chat-opportunity-combo').scrollIntoViewIfNeeded();
    await scene('guided-opportunity', 3500);
    await page.getByTestId('card-chat-opportunity-combo').click();
    await page.getByTestId('text-opportunity-title').waitFor({ state: 'visible' });
    await scene('explore-combo', 3500);
    for (const [key, value] of Object.entries(INPUTS)) {
      await page.getByTestId(`input-${key}`).waitFor({ state: 'attached' });
      assert.equal(await page.getByTestId(`input-${key}`).inputValue(), String(value));
    }
    await page.locator('#evaluate').scrollIntoViewIfNeeded();
    await page.getByTestId('text-forecast').waitFor({ state: 'visible' });
    assert.match(await page.getByTestId('text-forecast').innerText(), /3,900/);
    await scene('evaluate-inputs', 4500);
    await page.getByTestId('input-promotionBudget').scrollIntoViewIfNeeded();
    await scene('budget-and-seven-days', 3500);
    await page.getByTestId('text-forecast').scrollIntoViewIfNeeded();
    await scene('contribution-and-break-even', 5000);
    const created = await clickResponse('button-create-draft', '/api/udaan/experiments');
    assert.equal(created.status, 'Draft');
    assert.equal(created.durationDays, 7);
    assert.equal(created.expected.contributionAfterPromotion, 3900);
    assert.equal(created.expected.breakEvenUnits, 28);
    policy.state.planId = created.id;
    await page.getByTestId('button-approve').waitFor({ state: 'visible' });
    await scene('draft', 3000);
    await page.getByTestId('button-approve').click();
    await scene('approval-confirmation', 2000);
    const approved = await clickResponse('button-dialog-confirm', `/api/udaan/experiments/${created.id}/transition`);
    assert.equal(approved.status, 'Approved');
    await page.getByTestId('button-start').waitFor({ state: 'visible' });
    await scene('approved', 2500);
    await page.getByTestId('button-start').click();
    await scene('start-confirmation', 2000);
    const running = await clickResponse('button-dialog-confirm', `/api/udaan/experiments/${created.id}/transition`);
    assert.equal(running.status, 'Running');
    await page.getByTestId('form-results').waitFor({ state: 'visible' });
    await scene('running-experiment', 3000);
    await page.getByTestId('button-sample-low').click();
    assert.equal(await page.getByTestId('input-actual-units').inputValue(), '70');
    assert.equal(await page.getByTestId('input-actual-spend').inputValue(), '1500');
    assert.equal(await page.getByTestId('input-feedback').inputValue(), FEEDBACK);
    assert.equal(await page.getByTestId('switch-synthetic').getAttribute('aria-checked'), 'true');
    assert.equal(await page.getByTestId('checkbox-confirm').getAttribute('aria-checked'), 'false');
    await scene('illustrative-seventy-units', 4000);
    await page.getByTestId('switch-synthetic').scrollIntoViewIfNeeded();
    await scene('synthetic-disclosure', 3500);
    await page.getByTestId('checkbox-confirm').click();
    await scene('result-confirmation', 2500);
    const completed = await clickResponse('button-save-results', `/api/udaan/experiments/${created.id}/results`);
    assert.equal(completed.status, 'Completed');
    assert.equal(completed.synthetic, true);
    assert.equal(completed.actual.units, 70);
    assert.equal(completed.actual.contributionAfterPromotion, 2280);
    assert.equal(completed.learning.nextBudget, 600);
    await page.getByTestId('section-outcome').waitFor({ state: 'visible' });
    assert.equal(await page.getByTestId('text-achievement').innerText(), '70%');
    await page.getByTestId('text-achievement').scrollIntoViewIfNeeded();
    const chart = page.getByTestId('chart-expected-actual');
    await chart.scrollIntoViewIfNeeded();
    const chartBox = await chart.boundingBox();
    assert.ok(chartBox);
    await page.mouse.wheel(0, chartBox.y - 280);
    await scene('actual-versus-expected', 5000);
    await chart.locator('path.recharts-rectangle[fill="#BDF52F"]').last().hover();
    const tooltip = chart.locator('.recharts-tooltip-wrapper');
    await tooltip.waitFor({ state: 'visible' });
    assert.match(await tooltip.innerText(), /2,280/);
    assert.match(await tooltip.innerText(), /3,900/);
    await scene('modeled-contribution-tooltip', 5000);
    await page.mouse.move(5, 5);
    await page.getByTestId('section-learning').scrollIntoViewIfNeeded();
    await scene('learning-from-illustrative-result', 6000);
    await page.getByTestId('card-next-recommendation').scrollIntoViewIfNeeded();
    assert.match(await page.getByTestId('card-next-recommendation').innerText(), /600/);
    await scene('next-six-hundred-rupee-hypothesis', 6000);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('section-outcome').waitFor({ state: 'visible' });
    const persisted = (await read('experiments')).find((experiment) => experiment.id === created.id);
    assert.equal(persisted.status, 'Completed');
    assert.equal(persisted.actual.contributionAfterPromotion, 2280);
    await page.getByTestId('section-learning').scrollIntoViewIfNeeded();
    await scene('persisted-learning', 3500);
    const conversation = await read('conversation');
    assert.equal(conversation.length, 2);
    assert.equal(conversation.every((message) => message.provider === 'demo'), true);
    assert.equal((await read('experiments')).length, 1);
    assert.deepEqual(policy.state.counts, { preferences: 1, chat: 1, draft: 1, approve: 1, start: 1, results: 1 });
    evidence.outcome = {
      lifecycle: ['Draft', 'Approved', 'Running', 'Completed'], expectedContribution: 3900,
      actualContribution: 2280, actualUnits: 70, synthetic: true, durationDays: 7,
      promotionBreakEvenTotalUnits: 28, nextBudget: 600, nextOpportunityId: completed.learning.nextOpportunityId,
      persistedAfterReload: true, chatMessages: 2, experiments: 1, provider: 'demo',
      financialMeaning: 'contribution after promotion before overhead; not net profit',
      nativeContributionTooltipVerified: true,
    };
    evidence.status = 'complete';
  } catch (error) {
    failure = error;
    evidence.status = 'stopped-without-retry';
    evidence.failure = { category: error.name, lastCompletedScene: evidence.scenes.at(-1)?.label ?? 'none' };
    if (page) {
      await page.screenshot({ path: path.join(output, 'failure-screen.png') }).catch(() => { evidence.failureScreenshotFailed = true; });
    }
  } finally {
    if (context) await context.close();
    if (video) {
      const original = await video.path();
      const named = path.join(output, local ? 'raw-local-demo.webm' : 'raw-production-demo.webm');
      await video.saveAs(named);
      const bytes = await readFile(named);
      evidence.video = { file: path.basename(named), originalFile: path.basename(original),
        bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    }
    evidence.mutationRequests = policy.state.counts;
    evidence.finishedAt = new Date().toISOString();
    await writeFile(path.join(output, 'recording-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
    await browser.close();
  }
  console.log(JSON.stringify({ status: evidence.status, scenes: evidence.scenes.length, outcome: evidence.outcome,
    mutations: evidence.mutationRequests, video: evidence.video, output }, null, 2));
  if (failure) throw new Error('Recording stopped without retry. Inspect the preserved private evidence.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await record();
}
