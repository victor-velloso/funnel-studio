import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AREAS, SHARED, copyDefault } from "./src/copy.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const ASSET = "https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/";

const EDUZZ_GUARD = `<script>
(function(){
  var key = "";
  try {
    var q = new URLSearchParams(location.search);
    key = q.get("transactionkey");
    if (!key) key = q.get("transactionKey");
  } catch (e) {}
  if (!key) {
    try { if (window.Eduzz) { if (window.Eduzz.transactionKey) key = window.Eduzz.transactionKey; } } catch (e2) {}
  }
  if (key) return;
  document.documentElement.classList.add("fr-no-eduzz");
})();
</script>`;
const EDUZZ_TAG = `<script src="https://cdn.eduzzcdn.com/sun/thankyou/thankyou.js"></script>`;

const FONT = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap">`;

function stripBlank(s) {
  return s.replace(/\r\n/g, "\n").split("\n").filter((line) => line.trim() !== "").join("\n");
}

function cfgFor(page) {
  const up = page === "upsell";
  return `var CFG = {
page:${JSON.stringify(page)},
assetBase:${JSON.stringify(ASSET)},
videoUrl:"",
productId:${JSON.stringify(up ? "3116281" : "3116282")},
accept:${JSON.stringify(up ? "https://chk.eduzz.com/crl53eyv" : "https://chk.eduzz.com/liawsws4")},
decline:${JSON.stringify(up ? "/familia-oferta-2/" : "/parabens-familia/")},
destinations:{
upsellAccept:"https://chk.eduzz.com/crl53eyv",
upsellAccept1c:"https://chk.eduzz.com/crl53eyv?u=1",
downsellAccept:"https://chk.eduzz.com/liawsws4",
downsellAccept1c:"https://chk.eduzz.com/liawsws4?u=1",
upsellDecline:"/familia-oferta-2/",
downsellDecline:"/parabens-familia/"
},
products:{kit97:"3116281",kit67:"3116282"},
utmDefaults:{utm_source:"quiz",utm_medium:"funnel",utm_campaign:"familia-restaurada"},
/* PROPOSTA — aguardando aprovação do Steve */
copyDefault:${JSON.stringify(copyDefault)}
};`;
}

function widget(page) {
  const css = stripBlank(readFileSync(join(root, "src/styles.css"), "utf8"));
  const app = stripBlank(readFileSync(join(root, "src/app.js"), "utf8"));
  const links = stripBlank(readFileSync(join(root, "src/links.js"), "utf8"));
  const copy = `var COPY = ${JSON.stringify({ areas: AREAS, shared: SHARED })};`;
  const script = [cfgFor(page), copy, app, links].join("\n");
  const bad = script.match(/&&|>=|<=|=>/g);
  if (bad) throw new Error("JS do widget tem token proibido: " + bad.join(", "));
  if (script.includes("</script>")) throw new Error("script contém </script>");
  const html = [
    FONT,
    `<div id="fr-oferta" data-page="${page}"></div>`,
    "<style>",
    css,
    "</style>",
    "<script>",
    script,
    "</script>",
    EDUZZ_GUARD,
    EDUZZ_TAG
  ].join("\n");
  const out = stripBlank(html) + "\n";
  const tags = out.split(EDUZZ_TAG).length - 1;
  if (tags !== 1) throw new Error("thankyou.js deve aparecer uma vez, apareceu " + tags);
  return out;
}

function shell(title, body) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<style>html,body{margin:0;padding:0;background:#fff}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function harness(up, down) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Harness Familia Restaurada</title>
<script src="../referencias/th-stub.js"></script>
<script src="../referencias/site-scripts/utmify-latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids defer></script>
<script src="../referencias/site-scripts/track-cta.js" defer></script>
<script src="../referencias/site-scripts/legacy-utm_data.js"></script>
<style>html,body{margin:0;padding:0;background:#fff}</style>
</head>
<body>
<template id="tpl-upsell">${up}</template>
<template id="tpl-downsell">${down}</template>
<script>
(function(){
  var page = "upsell";
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("page") === "downsell") page = "downsell";
  } catch (e) {}
  var tpl = document.getElementById("tpl-" + page);
  if (!tpl) return;
  var frag = tpl.content.cloneNode(true);
  var scripts = frag.querySelectorAll("script");
  var jobs = [];
  Array.prototype.forEach.call(scripts, function(sc){
    jobs.push({ src: sc.getAttribute("src") || "", code: sc.textContent || "" });
    if (sc.parentNode) sc.parentNode.removeChild(sc);
  });
  document.body.appendChild(frag);
  jobs.forEach(function(job){
    var s = document.createElement("script");
    if (job.src) s.src = job.src;
    else s.textContent = job.code;
    document.body.appendChild(s);
  });
})();
</script>
</body>
</html>
`;
}

mkdirSync(join(root, "dist"), { recursive: true });
mkdirSync(join(root, "preview/familia-oferta"), { recursive: true });
mkdirSync(join(root, "preview/familia-oferta-2"), { recursive: true });

const up = widget("upsell");
const down = widget("downsell");

const files = [
  ["dist/upsell-widget.html", up],
  ["dist/downsell-widget.html", down],
  ["dist/familia-oferta-codigo-para-colar.txt", up],
  ["dist/familia-oferta-2-codigo-para-colar.txt", down],
  ["preview/familia-oferta/index.html", shell("Previa upsell Familia Restaurada", up)],
  ["preview/familia-oferta-2/index.html", shell("Previa downsell Familia Restaurada", down)],
  ["preview/harness.html", harness(up, down)]
];

const manifest = {};
for (const [rel, body] of files) {
  const abs = join(root, rel);
  writeFileSync(abs, body);
  if (rel.startsWith("dist/")) {
    manifest[rel] = {
      bytes: Buffer.byteLength(body),
      sha256: createHash("sha256").update(body).digest("hex")
    };
  }
}
writeFileSync(join(root, "dist/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
