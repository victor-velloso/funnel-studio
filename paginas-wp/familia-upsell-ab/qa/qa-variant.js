// QA da marcação de variante no Funnel Control (10/10). Bloco no casco real da /familia-oferta/, servido local.
// sendBeacon NÃO é simulado: o pedido real pro Funnel Control é interceptado na rede (route) e respondido 204 aqui, sem sair.
// Aceite e recusa clicam em link real (navegação de verdade, destino interceptado) pra provar que o evento sai antes de trocar de página.
const { chromium } = require('/workspace/tools/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const B = path.resolve(__dirname, '..');
const BLK_DIR = process.env.BLK_DIR || B;
const SHELL = fs.readFileSync(path.join(__dirname, 'shell-familia-oferta-ao-vivo.html'), 'utf8');
const s0 = SHELL.lastIndexOf('<', SHELL.indexOf('https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Open+Sans'));
const e0 = SHELL.indexOf('thankyou.js"></script>') + 'thankyou.js"></script>'.length;
const ORIGIN = 'https://www.ezeneterodrigues.com.br', FC = 'https://funnel-control.vercel.app/api/track/quiz';
const pageHtml = block => SHELL.slice(0, s0) + block + SHELL.slice(e0);
const blk = n => fs.readFileSync(path.join(BLK_DIR, n + '-codigo-para-colar.txt'), 'utf8');
const PAGES = {
  a: { slug: 'familia-upsell-a', key: 'aceiteA', recusa: '/familia-upsell-a-2/', page: 'upsell', variant: 'a' },
  b: { slug: 'familia-upsell-b', key: 'aceiteB', recusa: '/parabens-familia/', page: 'upsell', variant: 'b' },
  down: { slug: 'familia-upsell-a-2', key: 'aceiteDown', recusa: '/parabens-familia/', page: 'downsell', variant: 'a' } };
const results = []; let fails = 0;
function check(name, ok, info) { results.push({ name, ok: !!ok, info }); if (!ok) { fails++; console.log('FALHA', name, JSON.stringify(info || '')); } }
async function run(browser, pg, qs, ls, action) {
  const P = PAGES[pg];
  let block = blk(P.slug).replace(P.key + ': "#",', P.key + ': "https://chk.eduzz.com/QATESTE",');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const fc = [], navs = [];
  await ctx.route('**/*', async (route) => {
    const req = route.request(), u = new URL(req.url());
    if (u.origin + u.pathname === FC) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' } });
      fc.push({ t: Date.now(), type: req.resourceType(), method: req.method(), ct: req.headers()['content-type'], body: JSON.parse(req.postData() || 'null') });
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    }
    if (req.isNavigationRequest()) {
      if (u.origin === ORIGIN && u.pathname === '/' + P.slug + '/') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: pageHtml(block) });
      navs.push({ t: Date.now(), url: req.url() });
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>destino</body></html>' });
    }
    const okHost = (u.origin === ORIGIN && /^\/wp-(content|includes)\//.test(u.pathname)) || u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com';
    if (req.method() === 'GET' && okHost) return route.continue();
    return route.abort();
  });
  if (ls) await ctx.addInitScript(ls => { if (!sessionStorage.getItem('__s')) { sessionStorage.setItem('__s', '1'); localStorage.clear(); for (const k in ls) localStorage.setItem(k, ls[k]); } }, ls);
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(ORIGIN + '/' + P.slug + '/?' + qs, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const vid = await page.evaluate(() => JSON.parse(localStorage.getItem('fr_state') || '{}').vid);
  if (action) {
    const sel = action === 'accept' ? '#fr-up a.cta-aceite' : '#fr-up a.recusa';
    const href = await page.locator(sel).first().getAttribute('href'); await page.locator(sel).first().scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(u => !u.pathname.startsWith('/' + P.slug + '/'), { timeout: 8000 }).catch(() => {}), page.locator(sel).first().click()]);
    await page.waitForTimeout(800);
    await ctx.close();
    return { fc, navs, vid, errors, href };
  }
  await ctx.close();
  return { fc, navs, vid, errors };
}
const exact = (b, want) => JSON.stringify(b) === JSON.stringify(want);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const pg of ['a', 'b', 'down']) {
    const P = PAGES[pg];
    for (const [qs, area, ls] of [['m=casamento&area=filhos', 'casamento', null], ['m=oracao', 'oracao', { fr_state: JSON.stringify({ vid: 'qa-vid-quiz-1234', answers: {}, history: [], lead: {}, res: { m: 'oracao', m2: 'casamento', cx: false } }) }], ['x=1', null, null]]) {
      for (const action of [null, 'accept', 'decline']) {
        const tag = pg + ' ' + qs + ' ' + (action || 'view');
        const r = await run(browser, pg, qs, ls, action);
        const want = ev => ({ funnel: 'familia', visitor_id: r.vid, event: ev, page: P.page, area, variant: P.variant });
        const views = r.fc.filter(x => x.body.event === 'fr_oferta_view');
        check(tag + ': 1 view com payload exato', views.length === 1 && exact(views[0].body, want('fr_oferta_view')), r.fc.map(x => x.body));
        check(tag + ': POST text/plain via sendBeacon (ping)', r.fc.every(x => x.method === 'POST' && /^text\/plain/.test(x.ct) && x.type === 'ping'), r.fc.map(x => [x.type, x.method, x.ct]));
        check(tag + ': sem area2 nem campo extra', r.fc.every(x => !('area2' in x.body) && Object.keys(x.body).join(',') === 'funnel,visitor_id,event,page,area,variant'), r.fc.map(x => Object.keys(x.body)));
        if (ls) check(tag + ': vid do quiz', r.vid === 'qa-vid-quiz-1234', r.vid);
        if (action) {
          const ev = action === 'accept' ? 'fr_oferta_accept' : 'fr_oferta_decline';
          const hits = r.fc.filter(x => x.body.event === ev);
          check(tag + ': 1 ' + ev + ' com payload exato', hits.length === 1 && exact(hits[0].body, want(ev)), r.fc.map(x => x.body));
          const nav = r.navs[0];
          const destOk = action === 'accept' ? nav && nav.url.startsWith('https://chk.eduzz.com/QATESTE') : nav && new URL(nav.url).pathname === P.recusa;
          check(tag + ': navegou pro destino certo', destOk, { navs: r.navs, href: r.href });
          check(tag + ': evento saiu antes/junto da navegação', hits.length === 1 && nav && hits[0].t <= nav.t + 50, { ev: hits[0] && hits[0].t, nav: nav && nav.t });
          check(tag + ': total de eventos FC = 2 (view + ' + action + ')', r.fc.length === 2, r.fc.map(x => x.body.event));
        } else check(tag + ': só 1 evento FC', r.fc.length === 1, r.fc.map(x => x.body.event));
        check(tag + ': sem erro de JS', r.errors.length === 0, r.errors);
        if (pg === 'a' && qs === 'm=casamento&area=filhos') results.push({ name: tag + ' :: payloads', ok: true, info: r.fc.map(x => x.body) });
      }
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'resultado-variant.json'), JSON.stringify({ blocos: BLK_DIR, total: results.length, falhas: fails, results }, null, 1));
  console.log('checks:', results.length, 'falhas:', fails);
})();
