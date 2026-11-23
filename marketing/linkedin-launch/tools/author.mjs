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
const crop = async (source, name, region) => {
  const destination = path.join(root, 'screenshots', 'crops', name);
  await sharp(path.join(showcase, source)).extract(region).png().toFile(destination);
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
const footer = (s = 'Illustrative story. Synthetic data. No proven business impact.') => {
  text(s, 72, 1278, 22, C.muted);
};
const save = async name => fs.writeFile(path.join(root, 'source', name + '.svg'), parts.join('\n') + '\n</svg>\n');

start(1, 'Everyday ambition');
lines(['Every small business', 'deserves a', 'big possibility.'], 72, 276, 84, C.white, 96);
text('Small steps. Clearer decisions. New possibilities.', 72, 531, 30, C.muted);
image(images.vendor, 72, 610, 936, 564);
rect(72, 860, 936, 314, 'url(#shade)', 0);
text('A companion for what comes next.', 108, 1080, 46, C.white, 600);
text('Built for Indian small-business owners.', 108, 1128, 30, C.cyan);
text('Context photograph: Adib95 / CC BY-SA 4.0. Not a Udaan customer.', 72, 1214, 20, C.muted);
footer('A product possibility — not a promise of business results.');
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

start(3, 'The real problem');
lines(['Less dashboard.', 'More direction.'], 72, 270, 92, C.white, 107);
text('Owners need actionable intelligence.', 72, 454, 36, C.cyan, 600);
text('BUSINESS INSIGHTS', 72, 528, 23, C.muted, 600, 'letter-spacing="2"');
text('ASK UDAAN / DEMO RESPONSE', 570, 528, 21, C.muted, 600, 'letter-spacing="1"');
image(images.pulse, 72, 556, 438, 404, 20, 'xMidYMid meet');
image(images.ask, 570, 556, 438, 465, 20, 'xMidYMid meet');
lines(['A small test.', 'Not a permanent', 'price cut.'], 570, 1070, 35, C.cyan, 51, 600);
lines(['Not just:', '"What happened?"'], 72, 1030, 42, C.muted, 54, 500);
lines(['But:', '"What next?"'], 72, 1167, 46, C.lime, 55, 600);
footer('Genuine release-candidate screen crops — not fresh production captures.');
await save('03-more-direction');

start(4, 'A connected experience');
lines(['From possibility', 'to the next decision.'], 72, 260, 75, C.white, 88);
const steps = [
  ['Discover', 'One idea for your shop.'],
  ['Explore', 'Ask in your language.'],
  ['Evaluate', 'See costs and trade-offs.'],
  ['Try', 'Approve a small test.'],
  ['Measure', 'Record what happened.'],
  ['Learn', 'Choose the next step.'],
];
steps.forEach(([title, copy], i) => {
  const y = 480 + i * 125;
  rect(72, y - 39, 52, 52, i === 5 ? C.lime : C.panel, 26);
  text(String(i + 1), 98, y - 3, 26, i === 5 ? C.navy : C.cyan, 700, 'text-anchor="middle"');
  text(title, 146, y, 43, C.white, 600);
  text(copy, 146, y + 42, 27, C.muted);
});
image(images.home, 600, 435, 408, 680, 24, 'xMidYMid meet');
lines(['A possibility first.', 'Not another dashboard.'], 600, 1167, 30, C.cyan, 43, 600);
footer('Synthetic demo. Genuine release-candidate Home detail crop.');
await save('04-discover-to-learn');

start(5, 'An affordable experiment');
text('The ₹99 breakfast combo.', 72, 255, 69, C.white, 700);
text('Seven days. Explicit assumptions. A bounded test.', 72, 320, 32, C.muted);
image(images.breakfast, 72, 366, 416, 272, 24);
rect(72, 548, 416, 90, 'url(#shade)', 0);
text('Illustrative serving', 94, 610, 22, C.white, 600);
rect(528, 366, 480, 272);
text('₹99 − ₹45', 562, 441, 59, C.white, 700);
text('Price minus making cost', 562, 481, 25, C.muted);
text('₹54', 562, 563, 66, C.lime, 700);
text('Contribution per combo', 562, 605, 27, C.white);
rect(72, 680, 416, 542);
text('100 combos', 108, 749, 44, C.white, 700);
text('₹1,500 promotion', 108, 799, 29, C.muted);
text('₹3,900', 108, 912, 65, C.lime, 700);
lines(['Modeled contribution', 'after promotion'], 108, 957, 26, C.white, 37, 500);
text('28 units total', 108, 1096, 39, C.cyan, 700);
lines(['Promotion break-even', 'across all seven days.'], 108, 1138, 26, C.muted, 35, 400);
image(images.finance, 528, 680, 480, 542, 20, 'xMidYMid meet');
text('Saind147 / CC BY-SA 4.0. Screen: genuine release-candidate crop.', 72, 1247, 20, C.muted);
footer('Illustrative. Not net profit; rent, salaries, taxes & overhead excluded.');
await save('05-combo-evaluation');

start(6, 'Results change the next step');
lines(['Same experiment.', 'Different next decisions.'], 72, 259, 75, C.white, 88);
text('Modeled contribution after ₹1,500 promotion', 72, 421, 32, C.cyan, 500);
const outcomes = [
  { units: 70, amount: '₹2,280', label: 'BELOW TARGET', action: ['Test local', 'visibility.'], detail: 'Next test: ₹600 visibility', color: C.cyan },
  { units: 100, amount: '₹3,900', label: 'ON TARGET', action: ['Repeat cautiously.', 'Validate demand.'], detail: 'Editorial next-test advice', color: C.white },
  { units: 130, amount: '₹5,520', label: 'ABOVE TARGET', action: ['Test repeat', 'customers.'], detail: 'Or controlled expansion', color: C.lime },
];
outcomes.forEach((o, i) => {
  const x = 72 + i * 322;
  rect(x, 481, 292, 461);
  text(String(o.units), x + 24, 563, 82, o.color, 700);
  text('combos sold', x + 24, 607, 28, C.muted);
  text(o.amount, x + 24, 685, 52, C.white, 700);
  text(o.label, x + 24, 731, 18, o.color, 600, 'letter-spacing="1"');
  lines(o.action, x + 24, 805, 29, C.white, 40, 600);
  text(o.detail, x + 24, 905, 19, C.muted);
});
rect(72, 981, 936, 218, C.panel);
text('Learning is the next action.', 108, 1038, 37, C.white, 600);
text('(₹99 − ₹45) × units − ₹1,500', 108, 1090, 34, C.cyan, 500);
text('28-unit promotion break-even total. Not a daily target.', 108, 1147, 28, C.muted);
text('70 / 130: recorded demo branches. 100: cautious editorial next-test advice.', 72, 1242, 21, C.muted);
footer('Illustrative outcomes. Not net profit or evidence of customer impact.');
await save('06-outcomes-and-learning');

start(7, 'Come explore');
lines(['A working companion.', 'A bigger possibility.'], 72, 254, 74, C.white, 89);
lines(['Built during Product (Un)Conference', "2026 Builders' Day."], 72, 427, 33, C.muted, 48, 400);
image(images.live, 660, 560, 348, 650, 24, 'xMidYMid meet');
text('NEW LIVE CAPTURE', 660, 525, 22, C.cyan, 600, 'letter-spacing="1"');
text('Start with one', 72, 656, 52, C.white, 600);
text('small possibility.', 72, 723, 52, C.white, 600);
rect(72, 790, 500, 80, C.lime, 40);
text('Explore the live product →', 108, 844, 32, C.navy, 700);
lines(['udaan-ai-builder', '.replit.app'], 72, 940, 39, C.cyan, 49, 600);
lines(['Fictional café. Synthetic data.', 'A real product to explore.'], 72, 1115, 28, C.muted, 42, 400);
footer('Live onboarding captured 23 Nov 2026. Deeper screens use RC evidence.');
await save('07-explore-udaan');

parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="627" viewBox="0 0 1200 627"><title>Udaan AI LinkedIn launch cover</title><defs><linearGradient id="coverShade"><stop stop-color="${C.navy}"/><stop offset=".68" stop-color="${C.navy}" stop-opacity=".96"/><stop offset="1" stop-color="${C.navy}" stop-opacity=".25"/></linearGradient></defs>`];
rect(0, 0, 1200, 627, C.navy, 0);
image(images.vendor, 500, 0, 700, 627, 0);
rect(0, 0, 1200, 627, 'url(#coverShade)', 0);
brand(64, 82);
lines(['Every small business', 'deserves a', 'big possibility.'], 64, 226, 65, C.white, 77);
text('A working AI companion for the next decision.', 64, 477, 28, C.cyan);
text('udaan-ai-builder.replit.app', 64, 523, 29, C.lime, 600);
text('Context photo: Adib95 / CC BY-SA 4.0. Not a Udaan customer.', 64, 564, 17, C.muted);
await save('linkedin-cover');

const manifest = {
  layout: { width: 1080, height: 1350, exportScale: 2 },
  fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', portability: 'Segoe UI installed on Windows; install a compatible font or change source SVGs on other systems. No font files redistributed.' },
  colors: C,
  model: { price: 99, variableCost: 45, promotion: 1500, days: 7, target: 100, breakEvenTotalUnits: 28, outcomes: outcomes.map(o => ({ units: o.units, revenue: 99 * o.units, variableCosts: 45 * o.units, contributionAfterPromotion: 54 * o.units - 1500 })) },
  crops: [
    ['home-top.png', 'home-en-390.png', 0, 0, 390, 650],
    ['business-insights.png', 'home-en-390.png', 16, 1130, 358, 330],
    ['ask-udaan.png', '07-demo-conversation.png', 16, 425, 358, 380],
    ['experiment-evaluation.png', '07-demo-conversation.png', 16, 958, 358, 471],
    ['learning-70.png', '10-learning-low.png', 16, 224, 358, 390],
    ['learning-130.png', '11-learning-high.png', 16, 224, 358, 390],
  ].map(([file, source, x, y, width, height]) => ({ file: `screenshots/crops/${file}`, source: `screenshots/release-candidate/${source}`, x, y, width, height, transformation: 'Unaltered pixel crop; no UI recreation' })),
};
await fs.writeFile(path.join(root, 'source', 'design.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Authored seven SVG carousel slides and an editable LinkedIn cover.');
