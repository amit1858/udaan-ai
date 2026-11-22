/* Run in the local preview, not shipped as application code or a public asset. */
window.checkUdaanShowcase = async function () {
  const failures = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  const images = [...document.querySelectorAll('img')];
  const before = document.getElementById('contribution').textContent;
  for (const [units, amount, title] of [[70, '₹2,280', 'Below target'], [100, '₹3,900', 'On target'], [130, '₹5,520', 'Above target']]) {
    document.querySelector(`[data-units="${units}"]`).click();
    assert(document.getElementById('contribution').textContent === amount, `${units}: contribution`);
    assert(document.getElementById('outcomeTitle').textContent.startsWith(title), `${units}: recommendation`);
    assert(document.querySelectorAll('[data-units][aria-pressed="true"]').length === 1, `${units}: exclusive selection`);
  }
  document.querySelector('[data-units="100"]').click();
  assert(document.getElementById('contribution').textContent === before, 'Default financial state restored');
  for (const language of ['hinglish', 'hi', 'kn', 'en']) {
    document.querySelector(`[data-lang="${language}"]`).click();
    const image = document.getElementById('langShot');
    assert(image.src.endsWith(`home-${language}-390.webp`), `${language}: real screenshot source`);
    assert(document.querySelectorAll('[data-lang][aria-pressed="true"]').length === 1, `${language}: exclusive selection`);
  }
  const journey = ['Discover', 'Explore', 'Evaluate', 'Try', 'Measure', 'Learn'];
  for (const [index, button] of [...document.querySelectorAll('.lnode')].entries()) {
    button.click();
    assert(document.getElementById('stepT').textContent === journey[index], `${journey[index]}: content`);
    assert(document.querySelectorAll('.lnode[aria-pressed="true"]').length === 1, `${journey[index]}: selection`);
  }
  document.querySelector('.lnode').click();
  const menu = document.querySelector('.menu-toggle');
  if (getComputedStyle(menu).display !== 'none') {
    menu.click();
    assert(menu.getAttribute('aria-expanded') === 'true', 'Mobile menu opens');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert(menu.getAttribute('aria-expanded') === 'false', 'Escape closes menu');
    menu.click();
    document.querySelector('#sectionNav a').click();
    assert(menu.getAttribute('aria-expanded') === 'false', 'Anchor closes menu');
  }
  assert(document.querySelector('[aria-describedby="appStatus"]').href === 'https://udaan-ai-builder.replit.app/', 'Verified live CTA');
  assert(document.documentElement.scrollWidth <= window.innerWidth, 'No page-wide horizontal overflow');
  const decoded = [];
  for (const image of images) {
    const response = await fetch(image.src);
    assert(response.ok, `Image HTTP success: ${image.src}`);
    const source = URL.createObjectURL(await response.blob());
    const probe = new Image();
    probe.src = source;
    await probe.decode();
    const width = probe.naturalWidth;
    URL.revokeObjectURL(source);
    decoded.push(width > 0);
  }
  assert(decoded.every(Boolean), 'All image bytes decoded');
  window.scrollTo(0, 0);
  const result = { width: window.innerWidth, checks: '3 outcomes / 4 languages / 6 journey steps / menu / CTA / overflow / images', failures };
  if (failures.length) throw new Error(JSON.stringify(result));
  return result;
};
