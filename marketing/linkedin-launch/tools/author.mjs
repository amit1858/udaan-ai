import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showcase = path.resolve(root, '..', '..', 'website', 'assets');
const C = { navy: '#080D18', panel: '#111C2D', cyan: '#55C8FF', lime: '#BDF52F', white: '#F2F5FA', muted: '#B0BCD0', line: '#2A3B52' };
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const data = async file => `data:image/${path.extname(file).slice(1).replace('jpg', 'jpeg')};base64,${(await fs.readFile(file)).toString('base64')}`;
const photoData = async file => `data:image/jpeg;base64,${(await sharp(file).jpeg({ quality: 95 }).toBuffer()).toString('base64')}`;
for (const folder of ['source', 'assets', 'screenshots/release-candidate', 'screenshots/crops', 'slides', 'previews']) await fs.mkdir(path.join(root, folder), { recursive: true });
for (const name of ['dosa-vendor.webp', 'breakfast.webp', 'ooty-stall.webp']) await fs.copyFile(path.join(showcase, name), path.join(root, 'assets', name));
for (const name of ['home-en-390.png', '07-demo-conversation.png', '10-learning-low.png', '11-learning-high.png']) await fs.copyFile(path.join(showcase, name), path.join(root, 'screenshots', 'release-candidate', name));
const crop = async (source, name, region, directory = showcase) => {
  const destination = path.join(root, 'screenshots', 'crops', name);
  await sharp(path.join(directory, source)).extract(region).png().toFile(destination);
  return data(destination);
};
const images = {
  vendor: await photoData(path.join(root, 'assets', 'dosa-vendor.webp')),
  stall: await photoData(path.join(root, 'assets', 'ooty-stall.webp')),
  breakfast: await photoData(path.join(root, 'assets', 'breakfast.webp')),
  live: await data(path.join(root, 'screenshots', 'live', 'onboarding-mobile.png')),
  home: await crop('home-en-390.png', 'home-top.png', { left: 0, top: 0, width: 390, height: 650 }),
  pulse: await crop('home-en-390.png', 'business-insights.png', { left: 16, top: 1130, width: 358, height: 330 }),
  ask: await crop('07-demo-conversation.png', 'ask-udaan.png', { left: 16, top: 425, width: 358, height: 380 }),
  finance: await crop('07-demo-conversation.png', 'experiment-evaluation.png', { left: 16, top: 958, width: 358, height: 471 }),
  low: await crop('10-learning-low.png', 'learning-70.png', { left: 16, top: 224, width: 358, height: 390 }),
  high: await crop('11-learning-high.png', 'learning-130.png', { left: 16, top: 224, width: 358, height: 390 }),
  reasoning: await crop('07-demo-conversation.png', 'reasoning-excerpt.png', { left: 32, top: 443, width: 326, height: 165 }),
  combo: await crop('home-en-390.png', 'combo-discovery.png', { left: 16, top: 214, width: 358, height: 435 }),
  financeTable: await crop('07-demo-conversation.png', 'finance-table.png', { left: 32, top: 1112, width: 326, height: 205 }),
  liveHero: await crop('onboarding-mobile.png', 'live-onboarding-hero.png', { left: 40, top: 40, width: 700, height: 762 }, path.join(root, 'screenshots', 'live')),
};
let parts = [];
const rect = (x, y, w, h, fill = C.panel, radius = 24, extra = '') => parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`);
const text = (s, x, y, size = 32, color = C.white, weight = 400, extra = '') =>
  parts.push(`<text x="${x}" y="${y}" font-family="Segoe UI, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(s)}</text>`);
const lines = (content, x, y, size = 80, color = C.white, step = size * 1.1, weight = 700) => content.forEach((s, i) => text(s, x, y + i * step, size, color, weight));
const image = (uri, x, y, w, h, radius = 24, fit = 'xMidYMid slice') => {
  const id = `clip-${parts.length}`;
  parts.push(`<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><image href="${uri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}" clip-path="url(#${id})"/>`);
};
const brand = (x = 72, y = 104) => {
  parts.push(`<g id="udaan-mark" transform="translate(${x} ${y - 32})"><path d="M0 30L21 21L34 11L26 29L12 40Z" fill="${C.cyan}"/><path d="M26 20Q31 0 46 0L40 8L40 24L33 21L37 5Q29 11 29 21Z" fill="${C.lime}"/></g>`);
  text('Udaan', x + 60, y + 4, 38, C.white, 700);
  text('AI', x + 185, y + 4, 38, C.cyan, 700);
};
const start = (number, chapter) => {
  parts = [`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1350" viewBox="0 0 1080 1350"><title>Udaan AI — ${esc(chapter)}</title><desc>LinkedIn launch carousel, slide ${number} of 7. Editable text and vector elements with genuine embedded photographs and screenshots.</desc><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.navy}" stop-opacity="0"/><stop offset="1" stop-color="${C.navy}" stop-opacity=".98"/></linearGradient><radialGradient id="glow"><stop stop-color="${C.cyan}" stop-opacity=".10"/><stop offset="1" stop-color="${C.navy}" stop-opacity="0"/></radialGradient></defs>`];
  rect(0, 0, 1080, 1350, C.navy, 0);
  parts.push('<ellipse cx="1000" cy="150" rx="650" ry="600" fill="url(#glow)"/>');
  brand();
  text(`${String(number).padStart(2, '0')} / 07`, 1008, 108, 26, C.muted, 500, 'text-anchor="end"');
  text(chapter.toUpperCase(), 72, 154, 24, C.cyan, 600, 'letter-spacing="3"');
};
const footer = (s = 'Illustrative story · synthetic data · no proven impact.') => {
  text(s, 72, 1278, 26, C.muted);
};
const save = async name => fs.writeFile(path.join(root, 'source', name + '.svg'), parts.join('\n') + '\n</svg>\n');

start(1, 'A builder’s product thesis');
lines(['I built an AI companion', 'to help small businesses', 'decide what to try next.'], 72, 274, 72, C.white, 88);
lines(['Every small business deserves', 'a big possibility.'], 72, 545, 45, C.cyan, 58, 600);
image(images.vendor, 72, 660, 936, 510);
rect(72, 920, 936, 250, 'url(#shade)', 0);
text('One idea. One small test. One next step.', 108, 1114, 38, C.white, 600);
text('Context photo: Adib95 / CC BY-SA 4.0.', 72, 1215, 25, C.muted);
footer('Context photo, not the builder or a Udaan customer.');
await save('01-big-possibility');

start(2, 'The owner behind the business');
text('Meet Ravi.', 72, 280, 102, C.white, 700);
lines(['One small restaurant.', 'No strategy team.'], 72, 382, 67, C.white, 82);
text('Customers. Preparation. Staff. Suppliers.', 72, 510, 32, C.muted);
image(images.stall, 72, 570, 936, 548, 24);
rect(72, 870, 936, 248, 'url(#shade)', 0);
lines(['Fewer weekday customers.', 'What should he try next?'], 108, 998, 47, C.white, 62);
text('Ravi and his Whitefield breakfast café are fictional.', 72, 1173, 26, C.cyan, 500);
text('Context photo: Siyaulhaque / CC BY-SA 4.0. Pictured people are not Ravi.', 72, 1212, 20, C.muted);
footer();
await save('02-meet-ravi');

start(3, 'What makes Udaan different');
text('Context to action.', 72, 270, 88, C.white, 700);
const differentiators = [
  ['Business context', ['Your shop, budget', 'and weekday challenge.'], 40],
  ['AI reasoning', ['Explore a relevant', 'business possibility.'], 40],
  ['Deterministic finances', ['Exact-money evaluation.', 'AI explains; code calculates.'], 35],
  ['Outcome-driven learning', ['The recorded result', 'shapes the next test.'], 34],
];
differentiators.forEach(([title, copy, size], i) => {
  const x = 72 + (i % 2) * 484;
  const y = 330 + Math.floor(i / 2) * 190;
  rect(x, y, 452, 168);
  text(title, x + 24, y + 52, size, i === 3 ? C.lime : C.cyan, 600);
  lines(copy, x + 24, y + 103, 30, C.white, 39, 400);
});
text('ASK UDAAN / DEMO MODE · RESPONSE EXCERPT', 72, 743, 27, C.muted, 600);
image(images.reasoning, 72, 780, 936, 432, 0, 'xMidYMid meet');
footer('Release-candidate crop · fictional café · synthetic data.');
await save('03-more-direction');

start(4, 'From question to experiment');
text('RAVI’S QUESTION · ILLUSTRATIVE', 72, 230, 27, C.cyan, 600);
lines(['“Could a ₹99 breakfast combo', 'bring more weekday customers?”'], 72, 312, 56, C.white, 76);
const steps = [
  ['Discover', 'Spot an idea.'],
  ['Explore', 'Ask what fits.'],
  ['Evaluate', 'See the numbers.'],
  ['Try', 'Approve a test.'],
  ['Measure', 'Record the result.'],
  ['Learn', 'Decide what next.'],
];
steps.forEach(([title, copy], i) => {
  const y = 525 + i * 110;
  rect(72, y - 39, 52, 52, i === 5 ? C.lime : C.panel, 26);
  text(String(i + 1), 98, y - 3, 26, i === 5 ? C.navy : C.cyan, 700, 'text-anchor="middle"');
  text(title, 146, y, 43, C.white, 600);
  text(copy, 146, y + 42, 30, C.muted);
  if (i < steps.length - 1) text('↓', 98, y + 58, 28, C.cyan, 400, 'text-anchor="middle"');
});
image(images.combo, 488, 470, 520, 632, 24, 'xMidYMid meet');
text('Small test. Explicit approval. A next step.', 72, 1196, 39, C.cyan, 600);
footer('Release-candidate crop · fictional café · synthetic data.');
await save('04-discover-to-learn');

start(5, 'An affordable experiment');
text('The ₹99 breakfast combo.', 72, 255, 69, C.white, 700);
text('₹99 price. ₹45 making cost. ₹54 per combo.', 72, 320, 36, C.cyan, 500);
text('₹3,900', 72, 440, 88, C.lime, 700);
lines(['Modeled contribution', 'after promotion'], 360, 393, 32, C.white, 44, 500);
image(images.breakfast, 790, 354, 218, 150, 16);
text('Illustrative serving', 790, 526, 20, C.muted);
text('100 combos · ₹1,500 promotion · 7 days', 72, 504, 32, C.white);
text('₹9,900 sales − ₹4,500 making − ₹1,500 promotion', 72, 557, 34, C.white, 500);
image(images.financeTable, 72, 590, 936, 588, 0, 'xMidYMid meet');
text('28 units total to cover promotion. Overhead excluded.', 72, 1230, 29, C.cyan, 500);
footer('RC crop · synthetic model · not net profit. Photo: Saind147 / CC BY-SA 4.0.');
await save('05-combo-evaluation');

start(6, 'Results change the next step');
lines(['Same experiment.', 'Different next decisions.'], 72, 259, 75, C.white, 88);
text('Modeled contribution after ₹1,500 promotion', 72, 421, 32, C.cyan, 500);
const outcomes = [
  { units: 70, amount: '₹2,280', label: 'BELOW TARGET', action: ['₹600 visibility', 'test hypothesis'], detail: 'Next small experiment', color: C.cyan },
  { units: 100, amount: '₹3,900', label: 'ON TARGET', action: ['Editorial suggestion:', 'repeat to test demand.'], detail: 'Validate repeatability', color: C.white },
  { units: 130, amount: '₹5,520', label: 'ABOVE TARGET', action: ['Test repeat', 'customers.'], detail: 'Or controlled expansion', color: C.lime },
];
outcomes.forEach((o, i) => {
  const y = 474 + i * 230;
  rect(72, y, 936, 202);
  text(String(o.units), 100, y + 88, 82, o.color, 700);
  text('combos sold', 100, y + 137, 27, C.muted);
  text(o.amount, 302, y + 86, 59, C.white, 700);
  text(o.label, 302, y + 136, 25, o.color, 600);
  lines(o.action, 638, y + 60, 34, C.white, 45, 600);
  text(o.detail, 638, y + 162, 28, C.muted);
});
text('(₹99 − ₹45) × units − ₹1,500', 72, 1190, 34, C.cyan, 500);
text('28-unit promotion break-even total. Not a daily target.', 72, 1236, 28, C.muted);
footer('Illustrative outcomes · not net profit or proven impact.');
await save('06-outcomes-and-learning');

start(7, 'Built to explore');
text('Explore Udaan AI.', 72, 265, 88, C.white, 700);
text('One question. A small test. A next step.', 72, 334, 39, C.cyan, 500);
text('Built during', 72, 472, 34, C.muted);
lines(['Product', '(Un)Conference', "Builders’ Day."], 72, 542, 39, C.white, 55, 600);
text('2026', 72, 738, 34, C.cyan, 600);
lines(['I built it to turn', 'possibilities into', 'better next tests.'], 72, 860, 34, C.white, 48, 400);
image(images.liveHero, 464, 390, 544, 606, 24, 'xMidYMid meet');
text('GENUINE LIVE ONBOARDING · DETAIL', 464, 1024, 23, C.cyan, 600);
rect(72, 1076, 936, 100, C.lime, 50);
text('Explore the live product →', 540, 1141, 45, C.navy, 700, 'text-anchor="middle"');
text('https://udaan-ai-builder.replit.app/', 540, 1240, 44, C.white, 600, 'text-anchor="middle"');
footer('Live capture: 23 Nov 2026 · fictional café · synthetic data.');
await save('07-explore-udaan');

parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="627" viewBox="0 0 1200 627"><title>Udaan AI LinkedIn launch cover</title><defs><linearGradient id="coverShade"><stop stop-color="${C.navy}"/><stop offset=".68" stop-color="${C.navy}" stop-opacity=".96"/><stop offset="1" stop-color="${C.navy}" stop-opacity=".25"/></linearGradient></defs>`];
rect(0, 0, 1200, 627, C.navy, 0);
image(images.vendor, 500, 0, 700, 627, 0);
rect(0, 0, 1200, 627, 'url(#coverShade)', 0);
brand(64, 82);
lines(['Every small business', 'deserves a', 'big possibility.'], 64, 226, 65, C.white, 77);
text('I built an AI companion for the next decision.', 64, 477, 28, C.cyan);
text('udaan-ai-builder.replit.app', 64, 523, 29, C.lime, 600);
text('Context photo: Adib95 / CC BY-SA 4.0. Not the builder or a customer.', 64, 564, 17, C.muted);
await save('linkedin-cover');

const manifest = {
  layout: { width: 1080, height: 1350, exportScale: 2 },
  fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', portability: 'Segoe UI installed on Windows; install a compatible font or change source SVGs on other systems. No font files redistributed.' },
  colors: C,
  revision: 'Publication revision: builder hook, decision-loop differentiation, experiential question and larger authentic crops. No new application interaction.',
  mobileReview: { widths: [390, 320], note: 'Inspect the exported mobile previews at native size. Critical editorial story, numbers and URL must not require zoom; dense historical UI is supporting evidence.' },
  model: { price: 99, variableCost: 45, promotion: 1500, days: 7, target: 100, breakEvenTotalUnits: 28, outcomes: outcomes.map(o => ({ units: o.units, revenue: 99 * o.units, variableCosts: 45 * o.units, contributionAfterPromotion: 54 * o.units - 1500 })) },
  crops: [
    ['home-top.png', 'home-en-390.png', 0, 0, 390, 650],
    ['business-insights.png', 'home-en-390.png', 16, 1130, 358, 330],
    ['ask-udaan.png', '07-demo-conversation.png', 16, 425, 358, 380],
    ['experiment-evaluation.png', '07-demo-conversation.png', 16, 958, 358, 471],
    ['learning-70.png', '10-learning-low.png', 16, 224, 358, 390],
    ['learning-130.png', '11-learning-high.png', 16, 224, 358, 390],
    ['reasoning-excerpt.png', '07-demo-conversation.png', 32, 443, 326, 165],
    ['combo-discovery.png', 'home-en-390.png', 16, 214, 358, 435],
    ['finance-table.png', '07-demo-conversation.png', 32, 1112, 326, 205],
  ].map(([file, source, x, y, width, height]) => ({ file: `screenshots/crops/${file}`, source: `screenshots/release-candidate/${source}`, x, y, width, height, transformation: 'Unaltered pixel crop; no UI recreation' })).concat([
    { file: 'screenshots/crops/live-onboarding-hero.png', source: 'screenshots/live/onboarding-mobile.png', x: 40, y: 40, width: 700, height: 762, transformation: 'Unaltered pixel crop; no UI recreation' },
  ]),
};
await fs.writeFile(path.join(root, 'source', 'design.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Authored seven SVG carousel slides and an editable LinkedIn cover.');
