const { chromium } = require('/workspace/tools/pw/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const { open, B } = require('./harness');
const blk = n => fs.readFileSync(path.join(B, n + '-codigo-para-colar.txt'), 'utf8');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const out = {};
  for (const [pg, slug] of [['a','familia-upsell-a'],['b','familia-upsell-b'],['down','familia-upsell-a-2']]) {
    let all = '';
    const qss = [''];
    for (const m of ['casamento','filhos','oracao','financeiro']) { qss.push('m='+m); for (const a of ['casamento','filhos','oracao','financeiro']) if (a!==m) qss.push('m='+m+'&area='+a); }
    for (const qs of qss) {
      const { ctx, page } = await open(browser, { slug, block: blk(slug), qs: qs ? qs+'&qa=1' : 'qa=1', width: 390 });
      all += '\n=== ' + qs + '\n' + await page.evaluate(() => { document.querySelectorAll('#fr-up details').forEach(d => d.open = true); return document.getElementById('fr-up').innerText; });
      await ctx.close();
    }
    out[pg] = all;
  }
  fs.writeFileSync('/tmp/textos-render.json', JSON.stringify(out));
  await browser.close();
})();
