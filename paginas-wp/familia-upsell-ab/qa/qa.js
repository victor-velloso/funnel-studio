const { chromium } = require('/workspace/tools/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const { open, B } = require('./harness');
const OUT = __dirname;
const blk = n => fs.readFileSync(path.join(B, n + '-codigo-para-colar.txt'), 'utf8');
const P = { a: ['familia-upsell-a', blk('familia-upsell-a')], b: ['familia-upsell-b', blk('familia-upsell-b')], down: ['familia-upsell-a-2', blk('familia-upsell-a-2')] };
const results = []; let fails = 0;
function check(name, ok, info) { results.push({ name, ok: !!ok, info }); if (!ok) { fails++; console.log('FALHA', name, JSON.stringify(info || '')); } }
async function state(page) {
  return page.evaluate(() => {
    const R = document.getElementById('fr-up'); const q = s => R.querySelector(s);
    const txt = s => (q(s) ? q(s).innerText.replace(/\s+/g, ' ').trim() : null);
    const sec5 = [...R.querySelectorAll('section')].find(s => s.querySelector('[data-slot="portas"]'));
    return {
      cls: R.className, m: R.dataset.m, area: R.dataset.area, fonte: R.dataset.areaFonte,
      links: [...R.querySelectorAll('a[data-link]')].map(a => ({ k: a.dataset.link, href: a.getAttribute('href'), fixo: !!a.closest('.cta-fixo') })),
      chips: [...R.querySelectorAll('.chip-pesa')].map(c => c.innerText.trim()),
      gancho: txt('[data-slot="gancho4"]'), item8: txt('[data-slot="item8"]'), linha14: txt('[data-slot="linha14"]'), downEntra: txt('[data-slot="down-entra"]'),
      manuais: [...R.querySelectorAll('.manual h3')].map(h => h.innerText),
      portas: [...R.querySelectorAll('.porta h3')].map(h => h.innerText),
      celebrar: txt('[data-slot="celebrar"]'),
      bloco5Botoes: sec5 ? sec5.querySelectorAll('a,button').length : null,
      sw: document.documentElement.scrollWidth, iw: window.innerWidth, bw: document.body.scrollWidth,
      beacons: window.__beacons, ls: localStorage.getItem('fr_state'), utm: localStorage.getItem('utm_data'),
      imgsQuebradas: [...R.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
      fixoOn: q('.cta-fixo') ? q('.cta-fixo').classList.contains('on') : null,
      fonts: getComputedStyle(q('h1') || q('h2')).fontFamily + ' | ' + getComputedStyle(q('p')).fontFamily
    };
  });
}
async function loadAll(page) {
  await page.evaluate(async () => { document.querySelectorAll('#fr-up img').forEach(i => i.loading = 'eager'); for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(300);
}
const FC_KEYS = ['funnel', 'visitor_id', 'event', 'page', 'area', 'variant']; // variant desde 10/10 (FC PR #33)
const AREAS = ['casamento', 'filhos', 'oracao', 'financeiro'];
function fcValid(b, page) {
  const keys = Object.keys(b).sort().join(',');
  return keys === [...FC_KEYS].sort().join(',') && b.funnel === 'familia' && /^[A-Za-z0-9_-]{8,64}$/.test(b.visitor_id) && b.page === page && (b.area === null || AREAS.includes(b.area)) && (b.variant === 'a' || b.variant === 'b');
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const cases = [
    // [id, pag, qs, esperado: area ou '' , ls]
    ['a-com-area-casamento', 'a', 'm=casamento&area=filhos', 'filhos'],
    ['a-sem-area-casamento', 'a', 'm=casamento', ''],
    ['b-com-area-casamento', 'b', 'm=casamento&area=financeiro', 'financeiro'],
    ['b-sem-area-casamento', 'b', 'm=casamento', ''],
    ['down-com-area-casamento', 'down', 'm=casamento&area=filhos', 'filhos'],
    ['down-sem-area-casamento', 'down', 'm=casamento', ''],
    ['a-com-area-oracao', 'a', 'm=oracao&area=casamento', 'casamento'],
    ['a-sem-area-oracao', 'a', 'm=oracao', ''],
    ['b-com-area-oracao', 'b', 'm=oracao&area=casamento', 'casamento'],
    ['b-sem-area-oracao', 'b', 'm=oracao', ''],
    ['down-com-area-oracao', 'down', 'm=oracao&area=casamento', 'casamento'],
    ['down-sem-area-oracao', 'down', 'm=oracao', ''],
    ['a-area-invalida', 'a', 'm=filhos&area=xyz', ''],
    ['a-area-igual', 'a', 'm=filhos&area=filhos', ''],
    ['b-area-invalida', 'b', 'm=financeiro&area=dinheiro', ''],
    ['b-area-igual', 'b', 'm=financeiro&area=financeiro', ''],
    ['down-area-igual', 'down', 'm=filhos&area=filhos', ''],
    ['a-sem-m', 'a', '', ''],
    ['a-m-maiusculo-acento', 'a', 'm=Ora%C3%A7%C3%A3o&area=Casamento', 'casamento'],
  ];
  for (const [id, pg, qs, exp] of cases) {
    for (const w of [390, 1440]) {
      const [slug, block] = P[pg];
      const { ctx, page, errors, blocked } = await open(browser, { slug, block, qs: qs ? qs + '&qa=1' : 'qa=1', width: w });
      await loadAll(page);
      const s = await state(page);
      const tag = id + '-' + w;
      check(tag + ': sem erro de JS', errors.length === 0, errors);
      check(tag + ': sem rolagem horizontal', s.sw <= s.iw && s.bw <= s.iw, { sw: s.sw, bw: s.bw, iw: s.iw });
      check(tag + ': 2ª área = "' + exp + '"', s.area === exp, { area: s.area, cls: s.cls });
      check(tag + ': classe com/sem área', s.cls.includes(exp ? 'com-area' : 'sem-area'), s.cls);
      check(tag + ': nenhuma imagem quebrada', s.imgsQuebradas.length === 0, s.imgsQuebradas);
      check(tag + ': fontes Raleway/Open Sans', /Raleway/.test(s.fonts) && /Open Sans/.test(s.fonts), s.fonts);
      if (pg !== 'down') check(tag + ': bloco 5 sem botão', s.bloco5Botoes === 0, s.bloco5Botoes);
      const mq = (new URLSearchParams(qs)).get('m'); const m = s.m;
      // links
      const rec = s.links.filter(l => !/^aceite/.test(l.k));
      const acc = s.links.filter(l => /^aceite/.test(l.k));
      check(tag + ': aceite = "#" (placeholder)', acc.length && acc.every(l => l.href === '#'), acc);
      if (pg === 'a') {
        const want = '/familia-upsell-a-2/?' + (m !== 'default' ? 'm=' + m + '&' : '') + (exp ? 'area=' + exp + '&' : '') + 'utm_source=quiz&utm_medium=funnel&utm_campaign=familia-restaurada';
        check(tag + ': recusa A -> downsell com m e area', rec.length === 2 && rec.every(l => l.href === want), { want, rec });
      } else {
        const want = '/parabens-familia/?utm_source=quiz&utm_medium=funnel&utm_campaign=familia-restaurada';
        check(tag + ': recusa -> /parabens-familia/', rec.length && rec.every(l => l.href === want), { want, rec });
      }
      // tracking
      const views = (s.beacons || []).filter(b => b.body && b.body.event === 'fr_oferta_view');
      check(tag + ': 1 fr_oferta_view válido p/ API', views.length === 1 && views[0].url === 'https://funnel-control.vercel.app/api/track/quiz' && fcValid(views[0].body, pg === 'down' ? 'downsell' : 'upsell') && views[0].body.area === (m === 'default' ? null : m), s.beacons);
      const st = JSON.parse(s.ls || '{}');
      check(tag + ': fr_state semeado sem estado parcial', st.vid && st.answers && st.history && st.lead && Object.keys(st).sort().join(',') === 'answers,history,lead,vid', s.ls);
      // prints
      const want = ['a-com-area-casamento', 'a-sem-area-casamento', 'b-com-area-casamento', 'b-sem-area-casamento', 'down-com-area-casamento', 'down-sem-area-casamento', 'a-com-area-oracao', 'b-com-area-oracao', 'a-area-invalida', 'b-area-igual', 'a-sem-m', 'down-com-area-oracao'];
      if (want.includes(id)) { await page.addStyleTag({ content: '.cta-fixo{display:none!important}' }); await page.screenshot({ path: path.join(OUT, tag + '.png'), fullPage: true }); }
      if (id === 'a-com-area-casamento' || id === 'b-sem-area-oracao' || id === 'down-area-igual' || id === 'a-area-invalida') results.push({ name: tag + ' :: textos', ok: true, info: { gancho: (s.gancho || '').slice(0, 120), item8: s.item8, linha14: s.linha14, chips: s.chips, manuais: s.manuais, portas: s.portas, downEntra: s.downEntra } });
      await ctx.close();
    }
  }
  // ---- botão fixo: só a partir do preço (sem qa=1, com animação normal) ----
  for (const pg of ['a', 'b']) for (const w of [390, 1440]) {
    const [slug, block] = P[pg];
    const { ctx, page, errors } = await open(browser, { slug, block, qs: 'm=casamento&area=filhos', width: w, reduced: false });
    const at = async (sel, off) => { await page.evaluate(([sel, off]) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + off); }, [sel, off]); await page.waitForTimeout(500); return page.evaluate(() => { const f = document.querySelector('#fr-up .cta-fixo'); const r = f.getBoundingClientRect(); const cta = [...document.querySelectorAll('#fr-up .cta-aceite')].some(c => { const b = c.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; }); return { on: f.classList.contains('on'), visivel: r.top < innerHeight - 5, ctaNaTela: cta }; }); };
    const tag = 'fixo-' + pg + '-' + w;
    const top = await at('#fr-up .faixa', 0);
    const b5 = await at('[data-slot="portas"]', 0);
    const b8 = await at('#fr-up .sec-creme', 0);
    const b9 = await at('#fr-up .recebe', 0);
    const precoTopo = await page.evaluate(() => { const p = document.getElementById('preco'); window.scrollTo(0, p.getBoundingClientRect().top + scrollY - innerHeight * 0.5); }).then(() => page.waitForTimeout(500)).then(() => page.evaluate(() => { const f = document.querySelector('#fr-up .cta-fixo'); const b = document.querySelector('#preco .cta-aceite').getBoundingClientRect(); return { on: f.classList.contains('on'), botaoPrecoNaTela: b.top < innerHeight }; }));
    const garantia = await at('#fr-up .garantia', -100);
    const faq = await at('#fr-up .faq', 0);
    const fim = await at('#fr-up .fecho14 .cta-aceite', -200);
    check(tag + ': escondido no topo e nos blocos 5, 8 e 9', !top.on && !b5.on && !b8.on && !b9.on && !top.visivel && !b5.visivel, { top, b5, b8, b9 });
    check(tag + ': escondido enquanto o botão do preço está na tela', !precoTopo.on || !precoTopo.botaoPrecoNaTela, precoTopo);
    check(tag + ': aparece depois do preço (garantia e FAQ), salvo com botão de aceite na tela', (garantia.on || garantia.ctaNaTela) && (faq.on || faq.ctaNaTela) && (garantia.on || faq.on), { garantia, faq });
    check(tag + ': some quando o botão do fechamento está na tela', !fim.on, fim);
    check(tag + ': sem erro de JS', errors.length === 0, errors);
    if (w === 390) { await at('#fr-up .faq', -200); await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, 'botao-fixo-' + pg + '-390.png') }); }
    await ctx.close();
  }
  // ---- fallback da 2ª área pelo fr_state.res do quiz (só leitura) ----
  const base = { answers: { civil: 'casada' }, history: ['t01-abertura'], lead: {}, vid: 'qa-vid-12345678', utms: { utm_source: 'fb', utm_campaign: 'cmp1', utm_content: 'ad|123456789' } };
  const fb = [
    ['res-igual-m', 'a', 'm=oracao', { ...base, res: { m: 'oracao', m2: 'casamento', cx: 0 } }, 'casamento', 'quiz'],
    ['res-m-diferente', 'a', 'm=filhos', { ...base, res: { m: 'oracao', m2: 'casamento', cx: 0 } }, '', ''],
    ['res-sem-m2', 'b', 'm=oracao', { ...base, res: { m: 'oracao', m2: '', cx: 0 } }, '', ''],
    ['res-m2-igual-m', 'b', 'm=oracao', { ...base, res: { m: 'oracao', m2: 'oracao' } }, '', ''],
    ['url-vence-res', 'a', 'm=oracao&area=financeiro', { ...base, res: { m: 'oracao', m2: 'casamento' } }, 'financeiro', 'url'],
    ['url-invalida-nao-cai-no-res', 'a', 'm=oracao&area=xyz', { ...base, res: { m: 'oracao', m2: 'casamento' } }, '', ''],
    ['res-down', 'down', 'm=financeiro', { ...base, res: { m: 'financeiro', m2: 'filhos' } }, 'filhos', 'quiz'],
    ['res-casamento-acabou', 'a', 'm=oracao', { ...base, res: { m: 'oracao', m2: 'casamento', cx: 1 } }, '', ''], // casamentoAcabou "padrao" (Alan, 09/10): texto sem 2ª área
  ];
  for (const [id, pg, qs, st, exp, fonte] of fb) {
    const [slug, block] = P[pg];
    const raw = JSON.stringify(st);
    const { ctx, page, errors } = await open(browser, { slug, block, qs, width: 390, ls: { fr_state: raw, utm_data: JSON.stringify({ utm_source: 'fb', m: 'oracao', area: 'casamento', timestamp: 1 }) } });
    const s = await state(page);
    check('fallback ' + id + ': área "' + exp + '" (' + (fonte || 'padrão') + ')', s.area === exp && s.fonte === fonte, { area: s.area, fonte: s.fonte });
    check('fallback ' + id + ': fr_state intacto (só leitura)', s.ls === raw, { antes: raw, depois: s.ls });
    const u = JSON.parse(s.utm || '{}');
    check('fallback ' + id + ': utm_data sem m e sem area', !('m' in u) && !('area' in u) && u.utm_source === 'fb', s.utm);
    const v = (s.beacons || []).find(b => b.body && b.body.event === 'fr_oferta_view');
    check('fallback ' + id + ': vid do quiz reaproveitado', v && v.body.visitor_id === 'qa-vid-12345678', v);
    if (pg === 'a') { const r = s.links.find(l => l.k === 'recusaA'); check('fallback ' + id + ': recusa leva a área resolvida + UTMs do quiz', r.href === '/familia-upsell-a-2/?m=' + qs.match(/m=(\w+)/)[1] + (exp ? '&area=' + exp : '') + '&utm_source=fb&utm_campaign=cmp1&utm_content=ad%7C123456789', r); }
    check('fallback ' + id + ': sem erro de JS', errors.length === 0, errors);
    await ctx.close();
  }
  // ---- aceite com link real (simulado): tira m/area, mantém sck/UTMs, põe u=1; clique gera accept/decline ----
  {
    const [slug, block0] = P.a;
    const block = block0.replace('aceiteA: "#",', 'aceiteA: "https://chk.eduzz.com/TESTE?m=oracao&area=casamento",');
    const { ctx, page, errors } = await open(browser, { slug, block, qs: 'm=oracao&area=casamento&utm_source=fb&utm_campaign=c9&sck=abc', width: 390 });
    await page.evaluate(() => { const a = document.querySelector('#preco a.cta-aceite'); a.setAttribute('href', a.getAttribute('href') + '&sck=th123&utm_source=organic'); });
    await page.waitForTimeout(100);
    const h = await page.evaluate(() => document.querySelector('#preco a.cta-aceite').getAttribute('href'));
    const u = new URL(h);
    check('aceite: sem m/area no link da Eduzz', !u.searchParams.has('m') && !u.searchParams.has('area'), h);
    check('aceite: UTMs da URL + u=1', u.searchParams.get('utm_source') === 'fb' && u.searchParams.get('utm_campaign') === 'c9' && u.searchParams.get('u') === '1', h);
    check('aceite: UTMify reescreveu e o link voltou limpo (sem organic)', !/organic/.test(h), h);
    await page.evaluate(() => { document.querySelectorAll('#fr-up a[data-link]').forEach(a => a.addEventListener('click', e => e.preventDefault())); document.querySelector('#preco a.cta-aceite').click(); document.querySelector('#preco a.recusa').click(); });
    await page.waitForTimeout(200);
    const evs = await page.evaluate(() => window.__beacons.map(b => b.body ? b.body.event : b.err));
    check('cliques: fr_oferta_accept e fr_oferta_decline enviados', evs.includes('fr_oferta_accept') && evs.includes('fr_oferta_decline'), evs);
    check('aceite real: sem erro de JS', errors.length === 0, errors);
    await ctx.close();
  }
  // ---- prints nos mesmos parâmetros dos prints do mockup (m=oracao, com area=casamento), pra comparação ----
  const cmp = [['a', 'pagina-a'], ['b', 'pagina-b'], ['down', 'downsell-a']];
  for (const [pg, nm] of cmp) for (const [v, qs] of [['com-area', 'm=oracao&area=casamento'], ['sem-area', 'm=oracao']]) for (const [w, t] of [[390, 'mobile-390'], [1280, 'desktop-1280']]) {
    const [slug, block] = P[pg];
    const { ctx, page } = await open(browser, { slug, block, qs: qs + '&qa=1', width: w });
    await loadAll(page);
    await page.addStyleTag({ content: '.cta-fixo{display:none!important}' });
    const el = await page.$('#fr-up');
    fs.mkdirSync(path.join(OUT, 'comparacao'), { recursive: true });
    await el.screenshot({ path: path.join(OUT, 'comparacao', nm + '-' + v + '-' + t + '.png') });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ total: results.length, falhas: fails, results }, null, 1));
  console.log('checks:', results.length, 'falhas:', fails);
})();
