/* Cópia de fc-tracking/test/fc-harness.js + checagem do S.res (patch do quiz pro upsell A/B). Uso: node teste-res-quiz.js <dir> --expect-fc
   Teste local do tracking Funnel Control (sem rede real).
   Uso: node fc-harness.js <dir-com-os-3-arquivos> [--expect-fc]
   Serve cada arquivo dentro de uma página mínima numa origem falsa, bloqueia TODA requisição externa
   (webhook do Apps Script e funnel-control respondem com stub local, nunca saem da máquina). */
const { chromium } = require('/workspace/tools/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const DIR = process.argv[2]; const EXPECT = process.argv.includes('--expect-fc');
const ORIGIN = 'https://www.ezeneterodrigues.com.br';
const FILES = { quiz: 'quiz-familia-codigo-para-colar.txt', up: 'familia-oferta-codigo-para-colar.txt', down: 'familia-oferta-2-codigo-para-colar.txt' };
const P = JSON.parse(fs.readFileSync('/workspace/familia-restaurada/quiz/test/paths.json', 'utf8'));
const SPEC_KEYS_QUIZ = ['funnel','visitor_id','event','step','prev_step','step_index','area','situacao','utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'];
const SPEC_KEYS_OF = ['funnel','visitor_id','event','page','area'];
const ALLOWED = /^(view|start|step_t\d\d[-a-z]*|lead|resultado_visto|pitch_visto|checkout_click|fr_oferta_view|fr_oferta_accept|fr_oferta_decline)$/;
const AREA = { C: 'casamento', F: 'filhos', O: 'oracao', D: 'financeiro' };
const PII = ['Teste', 'teste@exemplo.com', '31999990000', 'Mulher', 'Homem', 'sexo', 'nome', 'email', 'whatsapp', 'telefone', 'phone', 'zap'];
const out = { dir: DIR, quiz: [], offers: [], crash: null };
const INIT = () => {
  window.__fc = []; window.__fcRaw = [];
  const push = (via, url, txt) => { window.__fcRaw.push({ via, url, txt }); if (String(url).indexOf('funnel-control') !== -1) { try { window.__fc.push(JSON.parse(txt)); } catch (e) { window.__fc.push({ __bad: txt }); } } };
  navigator.sendBeacon = function (url, data) { if (data instanceof Blob) { data.text().then(t => push('beacon', url, t)); } else push('beacon', url, String(data)); return true; };
  const of = window.fetch;
  window.fetch = function (url, opt) { const u = String(url && url.url || url); if (u.indexOf('funnel-control') !== -1 || u.indexOf('script.google.com') !== -1) { push('fetch', u, opt && opt.body); return Promise.resolve(new Response('{"ok":true}', { status: 200 })); } return of.apply(this, arguments); };
};
async function mkPage(ctx, key, net) {
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
  return { page, errs };
}
function html(file) { return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>fc-test</title></head><body>' + fs.readFileSync(path.join(DIR, file), 'utf8') + '</body></html>'; }
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const net = [];
  async function newCtx() {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(INIT);
    await ctx.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith(ORIGIN + '/fc-test/')) { const k = u.split('/fc-test/')[1].split('?')[0]; return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html(FILES[k]) }); }
      if (/funnel-control|script\.google\.com/.test(u)) { net.push({ blocked_stub: u, method: route.request().method() }); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); }
      return route.abort();
    });
    return ctx;
  }
  /* ---------- quiz ---------- */
  for (const p of P) {
    const ctx = await newCtx();
    const { page, errs } = await mkPage(ctx);
    const q = 'utm_source=quiz&utm_content=FR%20-%20AD02%7C120249352071220585' + (p.utm ? '&' + p.utm : '');
    await page.goto(ORIGIN + '/fc-test/quiz?' + q, { waitUntil: 'load' });
    await page.waitForSelector('#fr-quiz[data-step]');
    const visited = [];
    for (let g = 0; g < 80; g++) {
      const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
      if (visited[visited.length - 1] !== step) visited.push(step);
      await page.waitForTimeout(100);
      if (step === 't41-pitch') break;
      const ans = p.a[step];
      if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${p.sexo}"]`);
      else if (step.includes('loading')) {}
      else if (step === 't35-resultado') { await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } }); await page.click('#fr-next').catch(() => {}); }
      else if (step === 't34-captura') { await page.fill('#fr-nome', 'Teste'); await page.fill('#fr-zap', '31999990000'); await page.fill('#fr-email', 'teste@exemplo.com'); await page.click('#fr-next'); }
      else if (Array.isArray(ans)) { for (const id of ans) await page.click(`.fr-opt[data-id="${id}"]`); await page.click('#fr-next'); }
      else if (ans) await page.click(`.fr-opt[data-id="${ans}"]`);
      else if ((await page.$$('.fr-opt')).length) await page.click('.fr-opt');
      else await page.click('#fr-next');
      await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, step, { timeout: 9000 }).catch(() => errs.push('stuck at ' + step));
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({ fc: window.__fc, raw: window.__fcRaw, score: window.__FR.computeScore(), vid: (JSON.parse(localStorage.getItem('fr_state')) || {}).vid, hist: window.__FR.S.history, res: (JSON.parse(localStorage.getItem('fr_state')) || {}).res, ex: (JSON.parse(localStorage.getItem('fr_state')) || {}).answers.civil }));
    const fail = [], fc = st.fc;
    if (EXPECT) {
      if (!fc.length) fail.push('nenhum payload FC');
      const vids = [...new Set(fc.map(x => x.visitor_id))];
      if (vids.length !== 1 || vids[0] !== st.vid) fail.push('visitor_id instável: ' + JSON.stringify(vids) + ' vs S.vid ' + st.vid);
      for (const x of fc) {
        if (x.funnel !== 'familia') fail.push('funnel ' + x.funnel);
        const ks = Object.keys(x); if (JSON.stringify(ks) !== JSON.stringify(SPEC_KEYS_QUIZ)) fail.push('keys ' + ks.join(','));
        const js = JSON.stringify(x); for (const w of PII) if (js.indexOf(w) !== -1) fail.push('PII "' + w + '" em ' + x.event);
        if (x.step !== null && x.event !== 'step_' + x.step) fail.push('step mismatch ' + x.event);
        if (x.utm_source !== 'quiz' || x.utm_content !== 'FR - AD02|120249352071220585') fail.push('utm ' + x.event);
      }
      const evs = fc.map(x => x.event);
      for (const need of ['view', 'start', 'step_t01-abertura', 'step_t34-captura', 'lead', 'step_t35-resultado', 'resultado_visto', 'step_t41-pitch', 'pitch_visto']) if (!evs.includes(need)) fail.push('faltou ' + need);
      for (const s of visited) if (!evs.includes('step_' + s)) fail.push('faltou step_' + s);
      for (const x of fc.filter(x => x.step)) { const i = visited.indexOf(x.step); const prev = i > 0 ? visited[i - 1] : null; if (x.prev_step !== prev) fail.push(`prev_step ${x.step}: ${x.prev_step} != ${prev}`); if (x.step_index !== i) fail.push(`step_index ${x.step}: ${x.step_index} != ${i}`); }
      const exA = AREA[st.score.main];
      for (const e of ['lead', 'resultado_visto', 'pitch_visto']) { const x = fc.find(y => y.event === e); if (x && x.area !== exA) fail.push(e + ' area ' + x.area + ' != ' + exA); }
      /* Decisão do dono da spec: adaptação B rejeitada, situacao vai crua do r.sit (C1, D1, D16, D11...) */
      for (const e of ['lead', 'resultado_visto']) { const x = fc.find(y => y.event === e); if (x && x.situacao !== st.score.sit) fail.push(e + ' situacao ' + x.situacao + ' != r.sit ' + st.score.sit); }
      for (const x of fc) if (typeof x.situacao === 'string' && x.situacao.charAt(0) === '$') fail.push('situacao convertida ' + x.situacao + ' em ' + x.event);
    } else if (fc.length) fail.push('payload FC inesperado na base: ' + fc.length);
    if (visited[visited.length - 1] !== 't41-pitch') fail.push('não chegou ao pitch');
    const leadPost = st.raw.find(r => /script\.google/.test(r.url));
    if (!leadPost) fail.push('POST do webhook de lead não foi disparado (esperado, mas interceptado)');
    { const exp = { m: AREA[st.score.main] || '', m2: st.score.second ? AREA[st.score.second] : '' }; const r0 = st.res || {}; if (r0.m !== exp.m || r0.m2 !== exp.m2 || r0.cx !== (st.ex === 'ex' ? 1 : 0)) fail.push('S.res errado: ' + JSON.stringify(r0) + ' esperado ' + JSON.stringify(exp)); console.log('   S.res =', JSON.stringify(st.res), 'second=', st.score.second, 'civil=', st.ex); }
    fail.push(...errs);
    const r = { id: p.id, screens: visited.length, area: st.score.main, sit: st.score.sit, events: fc.map(x => x.event + (x.area ? '[' + x.area + (x.situacao ? '/' + x.situacao : '') + ']' : '')), rejected_by_api: fc.map(x => x.event).filter(e => !ALLOWED.test(e)), samples: { step: fc.find(x => x.event === 'step_t34-captura') || null, lead: fc.find(x => x.event === 'lead') || null, pitch: fc.find(x => x.event === 'pitch_visto') || null }, all: fc, vid: st.vid, fail };
    out.quiz.push(r);
    console.log(`${fail.length ? 'FAIL' : 'PASS'} quiz ${p.id} telas=${visited.length} area=${st.score.main} sit=${st.score.sit} fc=${fc.length}` + (fail.length ? '\n   ' + fail.join(' | ') : ''));
    if (p.id === 'P1-casamento') out.quizP1 = fc;
    await ctx.close();
  }
  /* ---------- ofertas ---------- */
  for (const [k, pg] of [['up', 'upsell'], ['down', 'downsell']]) {
    for (const seeded of [true, false]) {
      const ctx = await newCtx();
      const { page, errs } = await mkPage(ctx);
      if (seeded) { await page.goto(ORIGIN + '/fc-test/none-blank'.replace('none-blank', k) + '?m=zzz'); await page.evaluate(() => localStorage.setItem('fr_state', JSON.stringify({ answers: { sexo: 'Mulher' }, history: ['t01-abertura'], lead: {}, vid: 'vid-do-quiz-123', utms: { utm_source: 'quiz' } }))); await page.evaluate(() => { window.__fc = []; }); }
      await page.goto(ORIGIN + '/fc-test/' + k + '?m=casamento', { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const view = await page.evaluate(() => ({ fc: window.__fc.slice(), st: JSON.parse(localStorage.getItem('fr_state') || 'null'), m: document.getElementById('fr-oferta').getAttribute('data-m') }));
      await page.evaluate(() => document.querySelectorAll('a[data-fr-link]').forEach(a => a.addEventListener('click', e => e.preventDefault())));
      await page.click('a[data-fr-link="accept"]'); await page.click('a[data-fr-link="decline"]'); await page.waitForTimeout(300);
      const all = await page.evaluate(() => window.__fc.slice());
      const fail = [];
      if (EXPECT) {
        const v = view.fc.filter(x => x.event === 'fr_oferta_view');
        if (v.length !== 1) fail.push('fr_oferta_view x' + v.length);
        for (const x of all) { if (JSON.stringify(Object.keys(x)) !== JSON.stringify(SPEC_KEYS_OF)) fail.push('keys ' + Object.keys(x)); if (x.funnel !== 'familia' || x.page !== pg || x.area !== 'casamento') fail.push('payload ' + JSON.stringify(x)); }
        if (seeded && all.some(x => x.visitor_id !== 'vid-do-quiz-123')) fail.push('não reaproveitou vid do quiz');
        if (seeded && !(view.st && view.st.answers && view.st.answers.sexo === 'Mulher' && view.st.utms)) fail.push('apagou o resto do fr_state');
        if (!seeded && !(view.st && view.st.vid)) fail.push('não gravou vid');
        for (const e of ['fr_oferta_accept', 'fr_oferta_decline']) if (!all.some(x => x.event === e)) fail.push('faltou ' + e);
      } else if (all.length) fail.push('payload FC inesperado na base');
      fail.push(...errs);
      out.offers.push({ page: pg, seeded, events: all, fr_state_after: view.st, fail });
      console.log(`${fail.length ? 'FAIL' : 'PASS'} ${pg} ${seeded ? 'com fr_state do quiz' : 'navegador limpo'} fc=${all.length} ${all[0] ? JSON.stringify(all[0]) : ''}` + (fail.length ? '\n   ' + fail.join(' | ') : ''));
      if (!seeded && pg === 'upsell') out.freshState = view.st;
      await ctx.close();
    }
  }
  /* ---------- quiz aberto depois de uma oferta num navegador limpo ---------- */
  {
    const ctx = await newCtx(); const { page, errs } = await mkPage(ctx);
    await page.goto(ORIGIN + '/fc-test/up?m=casamento', { waitUntil: 'load' }); await page.waitForTimeout(300);
    const stBefore = await page.evaluate(() => localStorage.getItem('fr_state'));
    await page.goto(ORIGIN + '/fc-test/quiz', { waitUntil: 'load' }); await page.waitForTimeout(300);
    let ok = true; try { await page.click('.fr-gcard[data-v="Mulher"]', { timeout: 3000 }); await page.waitForFunction(() => document.getElementById('fr-quiz').getAttribute('data-step') !== 't01-abertura', null, { timeout: 4000 }); await page.click('.fr-opt', { timeout: 3000 }); } catch (e) { ok = false; errs.push('não avançou: ' + e.message.split('\n')[0]); }
    out.crash = { fr_state_from_offer: stBefore, ok, errs };
    console.log(`${ok && !errs.length ? 'PASS' : 'FAIL'} quiz depois da oferta (fr_state=${stBefore})` + (errs.length ? '\n   ' + errs.join(' | ') : ''));
    await ctx.close();
  }
  out.network_stubbed = net.length; out.network_sample = net.slice(0, 3);
  fs.writeFileSync(path.join(__dirname, 'result-' + path.basename(DIR) + '.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();
