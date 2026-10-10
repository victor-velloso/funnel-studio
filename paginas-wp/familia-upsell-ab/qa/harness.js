// QA local: cada bloco colado no "casco" real da /familia-oferta/ (tema Astra + Elementor 3.4.6 do site),
// servido como https://www.ezeneterodrigues.com.br/<slug>/. Só GET pro próprio site e Google Fonts passa.
// Funnel Control, pixel, UTMify, Eduzz etc. ficam bloqueados; o sendBeacon é gravado, não enviado.
const { chromium } = require('/workspace/tools/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const B = path.resolve(__dirname, '..');
const SHELL = fs.readFileSync(path.join(__dirname, 'shell-familia-oferta-ao-vivo.html'), 'utf8');
const s0 = SHELL.lastIndexOf('<', SHELL.indexOf('https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Open+Sans'));
const e0 = SHELL.indexOf('thankyou.js"></script>') + 'thankyou.js"></script>'.length;
const ORIGIN = 'https://www.ezeneterodrigues.com.br';
function pageHtml(block) { return SHELL.slice(0, s0) + block + SHELL.slice(e0); }
async function open(browser, opts) {
  const { slug, block, qs = '', width = 390, height, ls = null, reduced = true, scale } = opts;
  const ctx = await browser.newContext({ viewport: { width, height: height || (width < 500 ? 844 : 900) }, deviceScaleFactor: scale || (width < 500 ? 2 : 1), reducedMotion: reduced ? 'reduce' : 'no-preference', isMobile: width < 500, hasTouch: width < 500 });
  const blocked = new Set();
  await ctx.route('**/*', async (route) => {
    const req = route.request(), u = new URL(req.url());
    if (req.isNavigationRequest() && u.origin === ORIGIN && u.pathname === '/' + slug + '/') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: pageHtml(block) });
    const okHost = (u.origin === ORIGIN && /^\/wp-(content|includes)\//.test(u.pathname)) || u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com';
    if (req.method() === 'GET' && okHost) return route.continue();
    blocked.add(req.method() + ' ' + u.origin + u.pathname);
    return route.abort();
  });
  await ctx.addInitScript((ls) => {
    window.__beacons = [];
    navigator.sendBeacon = function (url, data) { try { data.text().then(t => window.__beacons.push({ url, body: JSON.parse(t) })); } catch (e) { window.__beacons.push({ url, err: String(e) }); } return true; };
    if (ls && !sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); localStorage.clear(); for (const k in ls) localStorage.setItem(k, ls[k]); }
  }, ls);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') { const t = m.text(); if (!/Failed to load resource|net::ERR_FAILED|ERR_BLOCKED/.test(t)) errors.push('console: ' + t); } });
  await page.goto(ORIGIN + '/' + slug + '/' + (qs ? '?' + qs : ''), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return { ctx, page, errors, blocked };
}
module.exports = { open, B };
