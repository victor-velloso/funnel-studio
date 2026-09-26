import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { upsellExpected, upsellForbidden, downsellExpected, downsellForbidden, copyDefault, AREAS } from "../src/copy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const SCK = "11111111-2222-3333-4444-555555555555";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json"
};

function normText(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function serve() {
  const server = createServer((req, res) => {
    const u = new URL(req.url, "http://127.0.0.1");
    let p = decodeURIComponent(u.pathname);
    if (p === "/favicon.ico") {
      res.statusCode = 204;
      res.end();
      return;
    }
    if (p.endsWith("/")) p += "index.html";
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end("no");
      return;
    }
    try {
      const buf = readFileSync(file);
      res.setHeader("content-type", TYPES[extname(file)] || "application/octet-stream");
      res.end(buf);
    } catch (e) {
      res.statusCode = 404;
      res.end("no");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

function paramsOf(raw) {
  const u = new URL(raw, "http://127.0.0.1");
  const o = {};
  for (const [k, v] of u.searchParams.entries()) o[k] = v;
  const once = (raw.split("u=1").length - 1);
  return { host: u.host, path: u.pathname, o, once, raw };
}

function sameParams(got, expect) {
  const gk = Object.keys(got).sort();
  const ek = Object.keys(expect).sort();
  if (gk.join("|") !== ek.join("|")) return false;
  return ek.every((k) => got[k] === expect[k]);
}

const iphone = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
};

async function bootPage(page) {
  await page.waitForSelector("#fr-oferta[data-m]", { timeout: 15000 });
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
    const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    let y = 0;
    while (y < h) {
      window.scrollTo(0, y);
      y += 450;
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll(".fr-sec").forEach((s) => s.classList.add("in"));
    const root = document.getElementById("fr-oferta");
    if (root) root.classList.remove("fr-anim");
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map((img) => img.complete ? null : new Promise((res) => { img.addEventListener("load", res, { once: true }); img.addEventListener("error", res, { once: true }); })));
  });
}

async function readState(page) {
  return page.evaluate(() => {
    const root = document.getElementById("fr-oferta");
    const text = root ? root.innerText : "";
    const broken = Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute("src"));
    const lines = [];
    document.querySelectorAll("#fr-oferta .fr-t").forEach((el) => {
      const cs = getComputedStyle(el);
      let lh = parseFloat(cs.lineHeight);
      if (!lh || cs.lineHeight === "normal") lh = parseFloat(cs.fontSize) * 1.6;
      const h = el.getBoundingClientRect().height;
      if (h > lh * 3 + 2) lines.push({ t: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 160), h: Math.round(h), lh: Math.round(lh * 10) / 10, fs: cs.fontSize });
    });
    const sw = document.documentElement.scrollWidth;
    const cw = document.documentElement.clientWidth;
    const struck = !!document.querySelector("#fr-oferta s, #fr-oferta del");
    let deco = false;
    document.querySelectorAll("#fr-oferta *").forEach((el) => {
      const d = getComputedStyle(el).textDecorationLine || "";
      if (d.indexOf("line-through") !== -1) deco = true;
    });
    return { m: root ? root.getAttribute("data-m") : "", text, broken, lines, sw, cw, struck, deco };
  });
}

function assertCopy(pageName, variation, state, misses, leaks) {
  const m = variation === "default" ? "" : variation;
  const text = normText(state.text);
  const expected = pageName === "upsell" ? upsellExpected(m) : downsellExpected(m);
  const forbidden = pageName === "upsell" ? upsellForbidden(m) : downsellForbidden(m);
  for (const line of expected) {
    if (text.indexOf(normText(line)) === -1) misses.push(`${pageName}/${variation}: falta «${line}»`);
  }
  for (const line of forbidden) {
    if (text.indexOf(normText(line)) !== -1) leaks.push(`${pageName}/${variation}: vazou «${line}»`);
  }
}

async function main() {
  const { server, port } = await serve();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const shots = [];
  const misses = [];
  const leaks = [];
  const overflows = [];
  const lineFails = [];
  const brokenAll = [];
  const consoleErrors = [];
  const eduzzHttp = [];
  const eduzzNotes = [];
  const variations = ["casamento", "filhos", "oracao", "financeiro", "default"];
  const pages = [
    { name: "upsell", path: "/preview/familia-oferta/index.html" },
    { name: "downsell", path: "/preview/familia-oferta-2/index.html" }
  ];

  mkdirSync(join(ROOT, "qa/screens/upsell"), { recursive: true });
  mkdirSync(join(ROOT, "qa/screens/downsell"), { recursive: true });

  async function openVisual(width, extra) {
    const mobile = width === 390 || width === 320;
    const ctx = await browser.newContext(mobile ? { ...iphone, viewport: { width, height: width === 320 ? 700 : 844 } } : { viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("pageerror", (err) => consoleErrors.push(String(err)));
    page.on("response", (res) => {
      const url = res.url();
      if (res.status() >= 400 && url.indexOf("elements-api.eduzz.com/thankyou/") !== -1) eduzzHttp.push(res.status() + " " + url);
    });
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    return { ctx, page };
  }

  for (const pg of pages) {
    for (const variation of variations) {
      const q = variation === "default" ? "qa=1" : `m=${variation}&qa=1`;
      for (const width of [390, 1440]) {
        const { ctx, page } = await openVisual(width);
        await page.goto(`${origin}${pg.path}?${q}`, { waitUntil: "networkidle", timeout: 45000 });
        await bootPage(page);
        if (width === 390 && variation === "default") {
          const eduzz = await page.evaluate(() => {
            function vis(el) {
              if (!el) return false;
              const cs = getComputedStyle(el);
              if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            }
            const tags = Array.from(document.scripts).filter((s) => (s.getAttribute("src") || "").indexOf("cdn.eduzzcdn.com/sun/thankyou/thankyou.js") !== -1);
            const offer = document.getElementById("fr-oferta");
            return {
              tags: tags.length,
              noEduzz: document.documentElement.classList.contains("fr-no-eduzz"),
              sunVisible: vis(document.getElementById("sun-root")),
              loadVisible: vis(document.getElementById("sun-loading")),
              offer: !!(offer && offer.innerText && offer.innerText.length > 40)
            };
          });
          eduzzNotes.push(`${pg.name}/default sem chave: tags=${eduzz.tags} fr-no-eduzz=${eduzz.noEduzz} sunVisivel=${eduzz.sunVisible} spinnerVisivel=${eduzz.loadVisible} oferta=${eduzz.offer}`);
          if (eduzz.tags !== 1) misses.push(`${pg.name}: thankyou.js ${eduzz.tags} vez(es)`);
          if (!eduzz.noEduzz || eduzz.sunVisible || eduzz.loadVisible || !eduzz.offer) misses.push(`${pg.name}: bloco Eduzz visível sem transactionkey`);
        }
        const state = await readState(page);
        if (state.m !== (variation === "default" ? "default" : variation)) misses.push(`${pg.name}/${variation}@${width}: data-m=${state.m}`);
        if (state.sw > state.cw + 1) overflows.push(`${pg.name}/${variation}@${width}: scroll ${state.sw} > ${state.cw}`);
        if (state.broken.length) brokenAll.push(`${pg.name}/${variation}@${width}: ${state.broken.join(", ")}`);
        if (state.struck || state.deco) leaks.push(`${pg.name}/${variation}: preço riscado`);
        if (width === 390) {
          assertCopy(pg.name, variation, state, misses, leaks);
          for (const row of state.lines) lineFails.push(`${pg.name}/${variation}: ${row.h}px lh ${row.lh} «${row.t}»`);
          if (pg.name === "upsell") {
            const hasCare = state.text.indexOf("cuidando") !== -1;
            const hasYours = state.text.indexOf("✓ o seu") !== -1;
            const hasOwned = state.text.indexOf("✓ já é seu") !== -1;
            if (variation === "default") {
              if (hasCare) leaks.push("upsell/default mostrou cuidando");
              if (hasYours) leaks.push("upsell/default mostrou selo o seu");
              if (hasOwned) leaks.push("upsell/default mostrou já é seu");
              if (state.text.indexOf("aberta") === -1) misses.push("upsell/default sem a palavra aberta");
            } else {
              if (!hasCare) misses.push(`upsell/${variation} sem cuidando`);
              if (!hasYours) misses.push(`upsell/${variation} sem selo o seu`);
              if (!hasOwned) misses.push(`upsell/${variation} sem já é seu`);
            }
          }
        }
        await page.evaluate(() => {
          const bar = document.getElementById("fr-fixed");
          if (bar) bar.style.display = "none";
        });
        const file = join(ROOT, "qa/screens", pg.name, `${variation}-${width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        shots.push(file);
        await ctx.close();
      }
    }
  }

  for (const pg of pages) {
    for (const variation of variations) {
      const q = variation === "default" ? "qa=1" : `m=${variation}&qa=1`;
      const { ctx, page } = await openVisual(320);
      await page.goto(`${origin}${pg.path}?${q}`, { waitUntil: "networkidle", timeout: 45000 });
      await bootPage(page);
      const state = await readState(page);
      if (state.sw > state.cw + 1) overflows.push(`${pg.name}/${variation}@320: scroll ${state.sw} > ${state.cw}`);
      await ctx.close();
    }
  }

  const xyz = await (async () => {
    const { ctx, page } = await openVisual(390);
    await page.goto(`${origin}/preview/familia-oferta/index.html?m=xyz&qa=1`, { waitUntil: "networkidle", timeout: 45000 });
    await bootPage(page);
    const a = await readState(page);
    await page.goto(`${origin}/preview/familia-oferta/index.html?qa=1`, { waitUntil: "networkidle", timeout: 45000 });
    await bootPage(page);
    const b = await readState(page);
    await ctx.close();
    return { am: a.m, bm: b.m, same: normText(a.text) === normText(b.text) };
  })();

  const { ctx: fx, page: fp } = await openVisual(390);
  await fp.goto(`${origin}/preview/familia-oferta/index.html?m=casamento&qa=1`, { waitUntil: "networkidle", timeout: 45000 });
  await bootPage(fp);
  await fp.evaluate(() => {
    const el = document.getElementById("fr-b5");
    if (el) el.scrollIntoView({ block: "start" });
  });
  await fp.waitForSelector("#fr-fixed.show", { timeout: 4000 });
  const fixedFile = join(ROOT, "qa/screens/upsell/fixed-button-390.png");
  await fp.screenshot({ path: fixedFile, fullPage: false });
  shots.push(fixedFile);
  await fx.close();

  const linkRows = [];
  async function linkCase(row) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => {
      window.fbqCalls = [];
      window.fbq = function () { window.fbqCalls.push(Array.prototype.slice.call(arguments)); };
    });
    if (row.seed) {
      await ctx.addInitScript((ls) => {
        for (const k in ls) localStorage.setItem(k, ls[k]);
      }, row.seed);
    }
    const page = await ctx.newPage();
    let nav = null;
    await ctx.route("https://chk.eduzz.com/**", (route) => {
      nav = route.request().url();
      return route.fulfill({ status: 200, contentType: "text/html", body: "ok" });
    });
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.goto(`${origin}/preview/harness.html?${row.query}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("#fr-oferta[data-m]", { timeout: 15000 });
    await page.waitForTimeout(3600);
    const pre = await page.evaluate(() => ({
      m: document.getElementById("fr-oferta").getAttribute("data-m"),
      utm: localStorage.getItem("utm_data"),
      text: document.getElementById("fr-oferta").innerText
    }));
    const decline = await page.evaluate(() => {
      const a = document.querySelector('a[data-fr-link="decline"]');
      a.addEventListener("click", function (e) { e.preventDefault(); }, { once: true });
      a.click();
      return a.getAttribute("href");
    });
    let accept = null;
    let acceptFixed = null;
    let stayed = true;
    if (row.ctrl) {
      const before = page.url();
      const popupP = page.waitForEvent("popup", { timeout: 2500 }).catch(() => null);
      await page.click("#fr-buy-card", { modifiers: ["Control"] });
      await page.waitForTimeout(400);
      const popup = await popupP;
      stayed = page.url() === before;
      accept = await page.getAttribute("#fr-buy-card", "href");
      if (popup) accept = popup.url();
      nav = null;
    } else if (row.both) {
      nav = null;
      await page.click("#fr-buy-card");
      await page.waitForTimeout(500);
      accept = nav;
      await page.goto(`${origin}/preview/harness.html?${row.query}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#fr-fixed", { timeout: 15000 });
      await page.waitForTimeout(3600);
      await page.evaluate(() => document.getElementById("fr-b5").scrollIntoView({ block: "start" }));
      await page.waitForSelector("#fr-fixed.show", { timeout: 4000 });
      nav = null;
      await page.click("#fr-buy-fixed");
      await page.waitForTimeout(500);
      acceptFixed = nav;
    } else if (row.skipAccept) {
      accept = null;
    } else if (row.hold) {
      await page.evaluate(() => {
        document.getElementById("fr-buy-card").addEventListener("click", function (e) { e.preventDefault(); });
      });
      await page.click("#fr-buy-card");
      await page.waitForTimeout(300);
      accept = await page.getAttribute("#fr-buy-card", "href");
    } else {
      const sel = row.fixed ? "#fr-buy-fixed" : "#fr-buy-card";
      if (row.fixed) {
        await page.evaluate(() => document.getElementById("fr-b5").scrollIntoView({ block: "start" }));
        await page.waitForSelector("#fr-fixed.show", { timeout: 4000 });
      }
      nav = null;
      await page.click(sel);
      await page.waitForTimeout(600);
      accept = nav;
    }
    const fbq = await page.evaluate(() => (window.fbqCalls || []).map((c) => c[0] + ":" + c[1]));
    await ctx.close();
    const result = { pre, decline, accept, acceptFixed, stayed, fbq, errors };
    const problems = row.check(result);
    if (errors.length) problems.push("pageerror " + errors.join(" | "));
    linkRows.push({ n: row.n, expect: row.expect, got: row.got(result), pass: problems.length === 0, problems });
  }

  const expFuture = new Date(Date.now() + 86400000).toISOString();
  const cases = [
    {
      n: "1 upsell ?m=casamento sem UTM",
      query: "page=upsell&m=casamento",
      expect: "accept quiz/funnel/familia-restaurada + sck + u=1, sem m; decline /familia-oferta-2/?m=casamento + defaults",
      got: (r) => `accept ${r.accept}\ndecline ${r.decline}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (a.host !== "chk.eduzz.com" || a.path !== "/crl53eyv") bad.push("host/path accept");
        if (a.once !== 1) bad.push("u=1 x" + a.once);
        if (!sameParams(a.o, { u: "1", sck: SCK, utm_source: "quiz", utm_medium: "funnel", utm_campaign: "familia-restaurada" })) bad.push("params accept " + JSON.stringify(a.o));
        if (d.path !== "/familia-oferta-2/") bad.push("decline path");
        if (!sameParams(d.o, { m: "casamento", utm_source: "quiz", utm_medium: "funnel", utm_campaign: "familia-restaurada" })) bad.push("params decline " + JSON.stringify(d.o));
        return bad;
      }
    },
    {
      n: "2 upsell ?m=filhos + utm + fbclid",
      query: "page=upsell&m=filhos&utm_source=fb&utm_medium=cpc&utm_campaign=c1&utm_content=a1&fbclid=FBX",
      expect: "accept utm fb/cpc/c1/a1 + fbclid + sck + u=1, sem m/organic; decline m=filhos + os mesmos utm",
      got: (r) => `accept ${r.accept}\ndecline ${r.decline}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (!sameParams(a.o, { u: "1", sck: SCK, fbclid: "FBX", utm_source: "fb", utm_medium: "cpc", utm_campaign: "c1", utm_content: "a1" })) bad.push("accept " + JSON.stringify(a.o));
        if (a.once !== 1) bad.push("u count");
        if (!sameParams(d.o, { m: "filhos", utm_source: "fb", utm_medium: "cpc", utm_campaign: "c1", utm_content: "a1" })) bad.push("decline " + JSON.stringify(d.o));
        return bad;
      }
    },
    {
      n: "3 upsell ?m=oracao UTMs só no fr_state",
      query: "page=upsell&m=oracao",
      seed: {
        fr_state: JSON.stringify({ utms: { utm_source: "fb", utm_medium: "paid", utm_campaign: "fr-camp", utm_content: "ad1" } }),
        utm_data: JSON.stringify({ utm_source: "old", utm_campaign: "oldc", timestamp: Date.now() })
      },
      expect: "accept/decline usam o conjunto do fr_state; utm_data depois do load não tem m",
      got: (r) => `accept ${r.accept}\ndecline ${r.decline}\nutm_data ${r.pre.utm}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (!sameParams(a.o, { u: "1", sck: SCK, utm_source: "fb", utm_medium: "paid", utm_campaign: "fr-camp", utm_content: "ad1" })) bad.push("accept " + JSON.stringify(a.o));
        if (!sameParams(d.o, { m: "oracao", utm_source: "fb", utm_medium: "paid", utm_campaign: "fr-camp", utm_content: "ad1" })) bad.push("decline " + JSON.stringify(d.o));
        const data = r.pre.utm ? JSON.parse(r.pre.utm) : {};
        if (Object.prototype.hasOwnProperty.call(data, "m")) bad.push("utm_data ainda tem m");
        return bad;
      }
    },
    {
      n: "4 upsell ?m=financeiro UTMs só no UTMify",
      query: "page=upsell&m=financeiro",
      seed: {
        utm_source: "ig", utm_source_exp: expFuture,
        utm_medium: "cpc", utm_medium_exp: expFuture,
        utm_campaign: "c9", utm_campaign_exp: expFuture
      },
      expect: "accept usa utm_source=ig, utm_medium=cpc, utm_campaign=c9",
      got: (r) => `accept ${r.accept}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        if (!sameParams(a.o, { u: "1", sck: SCK, utm_source: "ig", utm_medium: "cpc", utm_campaign: "c9" })) return ["accept " + JSON.stringify(a.o)];
        return [];
      }
    },
    {
      n: "5a upsell ?m=xyz default, decline sem m",
      query: "page=upsell&m=xyz",
      expect: "data-m=default; decline /familia-oferta-2/ sem m; copy default",
      got: (r) => `m=${r.pre.m} decline ${r.decline}`,
      check(r) {
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (r.pre.m !== "default") bad.push("data-m " + r.pre.m);
        if (d.path !== "/familia-oferta-2/") bad.push(d.path);
        if (d.o.m) bad.push("decline tem m");
        if (normText(r.pre.text).indexOf(copyDefault.b3l1) === -1) bad.push("sem copy default");
        if (normText(r.pre.text).indexOf("Você já vai orar pelo seu casamento.") !== -1) bad.push("vazou casamento");
        return bad;
      }
    },
    {
      n: "5b upsell sem m",
      query: "page=upsell",
      expect: "data-m=default; decline sem m",
      got: (r) => `m=${r.pre.m} decline ${r.decline}`,
      check(r) {
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (r.pre.m !== "default") bad.push("data-m");
        if (d.o.m) bad.push("tem m");
        if (d.path !== "/familia-oferta-2/") bad.push(d.path);
        return bad;
      }
    },
    {
      n: "6 upsell ?m=Oração",
      query: "page=upsell&m=Ora%C3%A7%C3%A3o",
      expect: "variação oracao",
      got: (r) => `m=${r.pre.m} decline ${r.decline}`,
      check(r) {
        const bad = [];
        if (r.pre.m !== "oracao") bad.push("data-m " + r.pre.m);
        if (normText(r.pre.text).indexOf("Você já vai voltar a orar.") === -1) bad.push("sem título oracao");
        const d = paramsOf(r.decline || "");
        if (d.o.m !== "oracao") bad.push("decline m " + d.o.m);
        return bad;
      }
    },
    {
      n: "7 dois botões de aceite do upsell",
      query: "page=upsell&m=casamento",
      both: true,
      expect: "card e fixo navegam para a mesma URL limpa",
      got: (r) => `card ${r.accept}\nfixo ${r.acceptFixed}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const b = paramsOf(r.acceptFixed || "");
        const bad = [];
        if (!sameParams(a.o, b.o)) bad.push("diferem " + JSON.stringify(a.o) + " vs " + JSON.stringify(b.o));
        if (a.path !== "/crl53eyv" || b.path !== "/crl53eyv") bad.push("path");
        if (a.o.m || b.o.m) bad.push("tem m");
        return bad;
      }
    },
    {
      n: "8 downsell ?m=casamento&utm_source=fb&utm_campaign=k",
      query: "page=downsell&m=casamento&utm_source=fb&utm_campaign=k",
      expect: "accept liawsws4 utm fb/k + u=1 sem m; decline /parabens-familia/ sem m",
      got: (r) => `accept ${r.accept}\ndecline ${r.decline}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (a.host !== "chk.eduzz.com" || a.path !== "/liawsws4") bad.push("path " + a.path);
        if (!sameParams(a.o, { u: "1", sck: SCK, utm_source: "fb", utm_campaign: "k" })) bad.push("accept " + JSON.stringify(a.o));
        if (a.once !== 1) bad.push("u");
        if (d.path !== "/parabens-familia/") bad.push("decline path " + d.path);
        if (!sameParams(d.o, { utm_source: "fb", utm_campaign: "k" })) bad.push("decline " + JSON.stringify(d.o));
        return bad;
      }
    },
    {
      n: "9 downsell sem parâmetros",
      query: "page=downsell",
      expect: "accept defaults + u=1; decline /parabens-familia/ com defaults, sem m",
      got: (r) => `accept ${r.accept}\ndecline ${r.decline}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const d = paramsOf(r.decline || "");
        const bad = [];
        if (!sameParams(a.o, { u: "1", sck: SCK, utm_source: "quiz", utm_medium: "funnel", utm_campaign: "familia-restaurada" })) bad.push("accept " + JSON.stringify(a.o));
        if (d.path !== "/parabens-familia/") bad.push(d.path);
        if (!sameParams(d.o, { utm_source: "quiz", utm_medium: "funnel", utm_campaign: "familia-restaurada" })) bad.push("decline " + JSON.stringify(d.o));
        return bad;
      }
    },
    {
      n: "10 ctrl-click no aceite",
      query: "page=upsell&m=casamento",
      ctrl: true,
      expect: "href limpo e a aba atual não navega (utm_data inline não assume)",
      got: (r) => `href ${r.accept} stayed ${r.stayed}`,
      check(r) {
        const a = paramsOf(r.accept || "");
        const bad = [];
        if (!r.stayed) bad.push("a aba navegou");
        if (a.host !== "chk.eduzz.com") bad.push("host " + a.host);
        if (a.o.m) bad.push("tem m");
        if (a.o.utm_source === "organic") bad.push("organic");
        if (a.once !== 1) bad.push("u=" + a.once);
        if (a.o.sck !== SCK) bad.push("sck");
        return bad;
      }
    },
    {
      n: "11 InitiateCheckout no aceite",
      query: "page=upsell&m=filhos&utm_source=fb&utm_campaign=c1",
      hold: true,
      expect: "fbq track InitiateCheckout disparado pelo track-cta",
      got: (r) => r.fbq.join(" | "),
      check(r) {
        const hit = r.fbq.filter((x) => x.indexOf("track:InitiateCheckout") === 0);
        if (hit.length === 0) return ["sem InitiateCheckout: " + r.fbq.join(",")];
        const purchase = r.fbq.filter((x) => x.indexOf("Purchase") !== -1);
        if (purchase.length) return ["Purchase indevido"];
        return [];
      }
    }
  ];

  for (const row of cases) {
    try {
      await linkCase(row);
    } catch (err) {
      linkRows.push({ n: row.n, expect: row.expect, got: String(err && err.stack || err), pass: false, problems: ["exceção"] });
    }
  }

  await browser.close();
  server.close();

  const linkFail = linkRows.filter((r) => !r.pass).length;
  let md = "# Matriz de links\n\n";
  md += "| Caso | Esperado | Obtido | Resultado |\n|---|---|---|---|\n";
  for (const r of linkRows) {
    const got = String(r.got || "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
    const exp = String(r.expect).replace(/\|/g, "\\|");
    md += `| ${r.n} | ${exp} | ${got} | ${r.pass ? "PASS" : "FAIL: " + r.problems.join("; ")} |\n`;
  }
  md += `\nFalhas: ${linkFail} de ${linkRows.length}.\n`;
  writeFileSync(join(ROOT, "qa/links-report.md"), md);

  const weights = ["fr-capa-casamento.webp", "fr-capa-filhos.webp", "fr-capa-oracao.webp", "fr-capa-financeiro.webp", "fr-preview-casamento.webp", "fr-preview-filhos.webp", "fr-preview-oracao.webp", "fr-preview-financeiro.webp", "fr-simbolo-casamento.svg", "fr-simbolo-filhos.svg", "fr-simbolo-oracao.svg", "fr-simbolo-financeiro.svg", "fr-ezenete-autora.webp"]
    .map((f) => `- ${f}: ${statSync(join(ROOT, "assets", f)).size} bytes`).join("\n");

  let vis = "# QA visual\n\n";
  vis += `## xyz vs default\n\ndata-m xyz=${xyz.am} default=${xyz.bm} texto igual=${xyz.same}\n\n`;
  vis += `## Overflow\n\n${overflows.length ? overflows.map((x) => "- " + x).join("\n") : "Nenhum."}\n\n`;
  vis += `## Copy ausente\n\n${misses.length ? misses.map((x) => "- " + x).join("\n") : "Nenhuma."}\n\n`;
  vis += `## Vazamentos\n\n${leaks.length ? leaks.map((x) => "- " + x).join("\n") : "Nenhum."}\n\n`;
  vis += `## Mais de 3 linhas (390)\n\n${lineFails.length ? lineFails.map((x) => "- " + x).join("\n") : "Nenhum."}\n\n`;
  vis += `## Imagens quebradas\n\n${brokenAll.length ? brokenAll.map((x) => "- " + x).join("\n") : "Nenhuma."}\n\n`;
  const resourceNoise = consoleErrors.filter((x) => x.indexOf("Failed to load resource") === 0);
  const realConsole = consoleErrors.filter((x) => x.indexOf("Failed to load resource") !== 0);
  const eduzzOnly = realConsole.length === 0 && eduzzHttp.length > 0 && resourceNoise.length > 0;
  vis += `## Eduzz thankyou.js sem transactionkey\n\n${eduzzNotes.length ? eduzzNotes.map((x) => "- " + x).join("\n") : "Sem leitura."}\n\n`;
  vis += `O script carrega nas duas páginas. Sem transactionkey ele pede GET https://elements-api.eduzz.com/thankyou/ com a query da página e recebe 404. O bloco (#sun-root / #sun-loading) fica oculto (html.fr-no-eduzz). Chamadas vistas: ${eduzzHttp.length}.\n\n`;
  vis += `## Erros de console / pageerror\n\n${eduzzOnly ? "Nenhum erro nosso. O 404 do lookup da Eduzz sem transactionkey não quebra a página.\n" : ""}${realConsole.length ? realConsole.slice(0, 30).map((x) => "- " + x).join("\n") : (eduzzOnly ? "" : "Nenhum.")}\n\n`;
  vis += `## Pesos locais (cópias da biblioteca)\n\n${weights}\n\n`;
  vis += `## Prints\n\n${shots.length} arquivos.\n`;
  writeFileSync(join(ROOT, "qa/visual-report.md"), vis);

  const summary = {
    shots: shots.length,
    misses: misses.length,
    leaks: leaks.length,
    overflows: overflows.length,
    lineFails: lineFails.length,
    broken: brokenAll.length,
    consoleErrors: realConsole.length,
    eduzzThankyouHttp: eduzzHttp.length,
    linkFail,
    linkTotal: linkRows.length,
    xyz
  };
  writeFileSync(join(ROOT, "qa/summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  if (misses.length || leaks.length || overflows.length || lineFails.length || linkFail || brokenAll.length) {
    console.log("\nMISSES\n" + misses.slice(0, 40).join("\n"));
    console.log("\nLEAKS\n" + leaks.slice(0, 20).join("\n"));
    console.log("\nOVERFLOW\n" + overflows.join("\n"));
    console.log("\nLINES\n" + lineFails.slice(0, 30).join("\n"));
    console.log("\nBROKEN\n" + brokenAll.slice(0, 10).join("\n"));
    console.log("\nLINKS\n" + linkRows.filter((r) => !r.pass).map((r) => r.n + " " + r.problems.join("; ") + "\n" + r.got).join("\n---\n"));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
