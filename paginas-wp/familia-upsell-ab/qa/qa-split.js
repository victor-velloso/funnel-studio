// QA local da /familia-upsell/ (divisão 50/50). Bloco dentro do casco real da /familia-oferta/, servido local.
// A navegação pra /familia-upsell-a/ e -b/ é interceptada (página stub local): nenhuma requisição real sai.
const { chromium } = require('/workspace/tools/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const B = path.resolve(__dirname, '..');
const BLOCK = fs.readFileSync(path.join(B, 'familia-upsell-split-codigo-para-colar.txt'), 'utf8');
const SHELL = fs.readFileSync(path.join(__dirname, 'shell-familia-oferta-ao-vivo.html'), 'utf8');
const s0 = SHELL.lastIndexOf('<', SHELL.indexOf('https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Open+Sans'));
const e0 = SHELL.indexOf('thankyou.js"></script>') + 'thankyou.js"></script>'.length;
const ORIGIN = 'https://www.ezeneterodrigues.com.br';
const HTML = SHELL.slice(0, s0) + BLOCK + SHELL.slice(e0);
const out = { checks: [], fails: 0 };
function ok(name, cond, info) { out.checks.push({ name, ok: !!cond, info }); if (!cond) { out.fails++; console.log('FALHA', name, JSON.stringify(info)); } }
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'], headless: true });
  async function mk(opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const st = { nav: [], dl: [], meta: [], errors: [], external: new Set() };
    await ctx.exposeBinding('__rec', (src, kind, val) => { st[kind].push(val); });
    await ctx.route('**/*', async (route) => {
      const req = route.request(), u = new URL(req.url());
      if (req.isNavigationRequest() && u.origin === ORIGIN && u.pathname === '/familia-upsell/') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: opts.html || HTML });
      if (req.isNavigationRequest() && u.origin === ORIGIN && /^\/familia-upsell-[ab]\/$/.test(u.pathname)) { st.nav.push(req.url()); return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><title>stub</title><p>stub</p>' }); }
      st.external.add(req.method() + ' ' + u.origin + u.pathname);
      return route.abort();
    });
    await ctx.addInitScript((noLS) => {
      if (noLS) { Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: storage bloqueado'); } }); }
      if (location.pathname !== '/familia-upsell/') return;
      const dl = []; dl.push = function (o) { try { if (o.event === 'fr_ab_upsell') window.__rec('dl', JSON.parse(JSON.stringify(o))); } catch (e) {} return Array.prototype.push.call(this, o); };
      window.dataLayer = dl;
      new MutationObserver((ms) => { ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeName === 'META' && n.name === 'robots') window.__rec('meta', n.content); })); }).observe(document, { childList: true, subtree: true });
    }, !!opts.noLS);
    const page = await ctx.newPage();
    page.on('pageerror', e => st.errors.push('pageerror: ' + e.message + ' @' + page.url()));
    page.on('console', m => { if (m.type() === 'error') { const t = m.text(); if (!/Failed to load resource|net::ERR_FAILED|ERR_BLOCKED/.test(t)) st.errors.push('console: ' + t); } });
    return { ctx, page, st };
  }
  async function go(page, st, qs) {
    const n = st.nav.length;
    await page.goto(ORIGIN + '/familia-upsell/' + qs, { waitUntil: 'commit' });
    await page.waitForURL(/familia-upsell-[ab]\//, { timeout: 10000 });
    await page.waitForLoadState('load');
    return st.nav[n];
  }
  const qs = '?m=casamento&area=filhos&sck=abc_123&fbclid=IwAR0xYz&utm_source=FB&utm_medium=paid&utm_campaign=Fam%C3%ADlia%20Restaurada%20%7C%20CBO&utm_content=Ora%C3%A7%C3%A3o+m%C3%A3e&utm_term=%F0%9F%99%8F&transactionkey=T1&foo=bar&vazio=&semvalor#frag';
  // 1) forçado a / b, params preservados, ab tirado (no meio da query)
  for (const v of ['a', 'b']) {
    const { ctx, page, st } = await mk();
    const q = qs.replace('&foo=bar', '&ab=' + v + '&foo=bar');
    const u = await go(page, st, q);
    const exp = ORIGIN + '/familia-upsell-' + v + '/' + qs.replace('#frag', '');
    ok('forcado ' + v + ': destino', u === exp, { u, exp });
    ok('forcado ' + v + ': hash mantido', page.url().endsWith('#frag'), page.url());
    const parsed = new URL(u).searchParams;
    ok('forcado ' + v + ': UTF-8 ok', parsed.get('utm_campaign') === 'Família Restaurada | CBO' && parsed.get('utm_content') === 'Oração mãe' && parsed.get('utm_term') === '🙏', Object.fromEntries(parsed));
    ok('forcado ' + v + ': sem ab', !parsed.has('ab'), u);
    ok('forcado ' + v + ': dataLayer', st.dl.length === 1 && st.dl[0].event === 'fr_ab_upsell' && st.dl[0].variante === v && st.dl[0].fonte === 'forcado', st.dl);
    ok('forcado ' + v + ': noindex', st.meta.includes('noindex, nofollow'), st.meta);
    ok('forcado ' + v + ': não grava', (await page.evaluate(() => localStorage.getItem('fr_ab_upsell'))) === null, null);
    ok('forcado ' + v + ': sem erros JS', st.errors.length === 0, st.errors);
    await ctx.close();
  }
  // variações do ab: AB=B maiúsculo, ab no começo, ab inválido, ab sem valor, sem query
  {
    const { ctx, page, st } = await mk();
    let u = await go(page, st, '?AB=B&m=filhos');
    ok('AB=B maiúsculo força b', u === ORIGIN + '/familia-upsell-b/?m=filhos', u);
    u = await go(page, st, '?ab=a');
    ok('só ab=a: destino sem ?', u === ORIGIN + '/familia-upsell-a/', u);
    u = await go(page, st, '');
    ok('sem query: destino sem ?', /\/familia-upsell-[ab]\/$/.test(u), u);
    const salvo = await page.evaluate(() => localStorage.getItem('fr_ab_upsell'));
    u = await go(page, st, '?ab=x&m=oracao');
    ok('ab inválido: tirado e usa o salvo', u === ORIGIN + '/familia-upsell-' + salvo + '/?m=oracao', { u, salvo });
    u = await go(page, st, '?m=oracao&ab');
    ok('ab sem valor: tirado', u === ORIGIN + '/familia-upsell-' + salvo + '/?m=oracao', u);
    u = await go(page, st, '?m=oracao&abc=1&tab=2');
    ok('abc/tab mantidos', u === ORIGIN + '/familia-upsell-' + salvo + '/?m=oracao&abc=1&tab=2', u);
    ok('variações: sem erros JS', st.errors.length === 0, st.errors);
    await ctx.close();
  }
  // 2) fixo no reload
  {
    const { ctx, page, st } = await mk();
    const first = await go(page, st, '?m=financeiro');
    const v = await page.evaluate(() => localStorage.getItem('fr_ab_upsell'));
    ok('sorteio grava a/b', v === 'a' || v === 'b', v);
    ok('1º acesso: dataLayer sorteio', st.dl[0].fonte === 'sorteio' && st.dl[0].variante === v, st.dl);
    let same = true;
    for (let i = 0; i < 10; i++) { const u = await go(page, st, '?m=financeiro&i=' + i); if (u !== ORIGIN + '/familia-upsell-' + v + '/?m=financeiro&i=' + i) same = false; }
    ok('fixo em 10 recargas', same && first === ORIGIN + '/familia-upsell-' + v + '/?m=financeiro', { v, nav: st.nav });
    ok('recargas: dataLayer salvo', st.dl.slice(1).every(d => d.fonte === 'salvo' && d.variante === v), st.dl.slice(1, 3));
    await page.evaluate(() => localStorage.setItem('fr_ab_upsell', 'zzz'));
    await go(page, st, '?m=filhos');
    const v2 = await page.evaluate(() => localStorage.getItem('fr_ab_upsell'));
    ok('valor salvo inválido: sorteia de novo', v2 === 'a' || v2 === 'b', v2);
    ok('fixo: sem erros JS', st.errors.length === 0, st.errors);
    ok('nenhuma requisição externa saiu (tudo abortado/local)', true, [...st.external].slice(0, 20));
    await ctx.close();
  }
  // 3) localStorage lança erro
  {
    const { ctx, page, st } = await mk({ noLS: true, html: '<!doctype html><html><head><meta charset="utf-8"></head><body>' + BLOCK + '</body></html>' });
    const u = await go(page, st, '?m=casamento&utm_source=FB');
    ok('sem storage: redireciona', /\/familia-upsell-[ab]\/\?m=casamento&utm_source=FB$/.test(u), u);
    ok('sem storage: fonte', st.dl[0].fonte === 'sorteio_sem_storage', st.dl);
    ok('sem storage: sem erros JS (só o bloco, sem o tema)', st.errors.length === 0, st.errors);
    await ctx.close();
  }
  // 4) 200 acessos com storage limpo
  {
    const { ctx, page, st } = await mk();
    const cnt = { a: 0, b: 0 };
    for (let i = 0; i < 200; i++) {
      await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} }).catch(() => {});
      const u = await go(page, st, '?m=oracao&n=' + i);
      cnt[/familia-upsell-a\//.test(u) ? 'a' : 'b']++;
    }
    // binomial(200, .5): dp ~7,07; 3 dp = 79..121
    ok('200 acessos ~50/50 (79..121)', cnt.a >= 79 && cnt.a <= 121, cnt);
    ok('200 acessos: fonte sempre sorteio', st.dl.every(d => d.fonte === 'sorteio'), st.dl.filter(d => d.fonte !== 'sorteio').slice(0, 3));
    ok('200 acessos: sem erros JS', st.errors.length === 0, st.errors.slice(0, 5));
    out.split200 = cnt;
    out.external = [...st.external];
    await ctx.close();
  }
  // 5) tela de carregamento (sem JS: noscript; com JS segurando o redirect)
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, javaScriptEnabled: false });
    await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.pathname === '/familia-upsell/') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML }); return r.abort(); });
    const page = await ctx.newPage();
    await page.goto(ORIGIN + '/familia-upsell/?m=oracao');
    const info = await page.evaluate(() => { const el = document.getElementById('fr-split'); const r = el.getBoundingClientRect(); const a = el.querySelector('a'); return { w: r.width, h: r.height, z: getComputedStyle(el).zIndex, bg: getComputedStyle(el).backgroundColor, href: a ? a.href : null, aVisivel: a ? a.getBoundingClientRect().height : 0 }; });
    ok('sem JS: overlay cobre a tela', info.w === 390 && info.h === 844 && info.bg === 'rgb(47, 33, 24)', info);
    ok('sem JS: link noscript pra A', info.href === ORIGIN + '/familia-upsell-a/' && info.aVisivel, info);
    await page.screenshot({ path: path.join(__dirname, 'split-sem-js-390.png') });
    await ctx.close();
    // com JS: mesmo bloco sem o <script> do redirect (o que aparece até a próxima página abrir), tema do site rodando
    const semRedir = SHELL.slice(0, s0) + BLOCK.replace(/<script>[\s\S]*?<\/script>/, '') + SHELL.slice(e0);
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
    await ctx2.route('**/*', r => { const u = new URL(r.request().url()); if (u.pathname === '/familia-upsell/') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: semRedir }); return r.abort(); });
    const p2 = await ctx2.newPage();
    await p2.goto(ORIGIN + '/familia-upsell/?m=oracao');
    await p2.waitForTimeout(500);
    const cobre = await p2.evaluate(() => { const r = document.getElementById('fr-split').getBoundingClientRect(); const top = document.elementFromPoint(195, 30); return { w: r.width, h: r.height, topo: top ? top.closest('#fr-split') !== null : false }; });
    ok('com JS: overlay cobre a tela e fica por cima do tema', cobre.w === 390 && cobre.h === 844 && cobre.topo, cobre);
    await p2.screenshot({ path: path.join(__dirname, 'split-carregando-390.png') });
    await ctx2.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'resultado-split.json'), JSON.stringify(out, null, 1));
  console.log('checagens', out.checks.length, 'falhas', out.fails, 'split200', JSON.stringify(out.split200), 'externas bloqueadas', out.external.length);
})().catch(e => { console.error(e); process.exit(1); });
