/* Família Restaurada · upsell A/B · lógica (WordPress-safe: sem linha em branco, sem dois "e comercial" seguidos e sem comparação de maior/menor) */
(function () {
  var ROOT = document.getElementById("fr-up");
  if (!ROOT) return;
  var C = window.UPSELL_CONFIG, T = window.UPSELL_TEXTOS;
  var PAG = ROOT.getAttribute("data-pagina"); /* a | b | down */
  var FC_PAGE = PAG === "down" ? "downsell" : "upsell";
  function lt(a, b) { var d = b - a; if (d === 0) return false; return d === Math.abs(d); }
  function norm(v) {
    v = String(v || "").toLowerCase().replace(/^\s+|\s+$/g, "");
    try { v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
    return v;
  }
  function valida(v) { return T.ordem.indexOf(v) !== -1; }
  function qp(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  function lerEstado() { try { return JSON.parse(localStorage.getItem("fr_state") || "{}") || {}; } catch (e) { return {}; } }
  if (qp("qa") === "1") document.documentElement.classList.add("fr-qa");
  /* ---------- ?m e 2ª área ---------- */
  var m = norm(qp("m"));
  if (!valida(m)) m = "";
  var area = "", areaFonte = "";
  var areaBruta = qp(C.paramArea);
  if (areaBruta) {
    /* veio na URL: vale só se for válida e diferente do ?m. Inválida ou igual = padrão (não cai no quiz). */
    var a0 = norm(areaBruta);
    if (valida(a0)) { if (a0 !== m) { area = a0; areaFonte = "url"; } }
  } else if (m) {
    /* sem ?area na URL: lê o resultado salvo pelo quiz (só leitura), só se o manual do quiz for o mesmo do ?m */
    var st = lerEstado(), res = st.res;
    if (res) {
      if (norm(res.m) === m) {
        var a1 = norm(res.m2);
        if (valida(a1)) {
          if (a1 !== m) {
            area = a1; areaFonte = "quiz";
            if (a1 === "casamento") { if (res.cx) { if (C.casamentoAcabou === "padrao") { area = ""; areaFonte = ""; } } }
          }
        }
      }
    }
  }
  if (!m) { area = ""; areaFonte = ""; }
  var A = m ? T.areas[m] : null, A2 = area ? T.areas[area] : null;
  ROOT.classList.add(area ? "com-area" : "sem-area");
  if (!m) ROOT.classList.add("sem-m");
  ROOT.setAttribute("data-m", m || "default");
  ROOT.setAttribute("data-area", area || "");
  ROOT.setAttribute("data-area-fonte", areaFonte);
  /* ---------- ícones (SVG de linha, traço 1.5) ---------- */
  var P = {
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
    lockOpen: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 7.6-1.7"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r=".9"/><circle cx="4.8" cy="12" r=".9"/><circle cx="4.8" cy="17.5" r=".9"/>',
    hands: '<path d="M12 21V11.5L9.6 4.2c-.4-1.1-1.9-1-2.1.1L6 12.5l-2 3.6V21"/><path d="M12 21V11.5l2.4-7.3c.4-1.1 1.9-1 2.1.1l1.5 8.2 2 3.6V21"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    pix: '<path d="M12 3.2l3.6 3.6-3.6 3.6-3.6-3.6zM12 13.6l3.6 3.6L12 20.8l-3.6-3.6zM6.8 8.4l3.6 3.6-3.6 3.6L3.2 12zM17.2 8.4l3.6 3.6-3.6 3.6-3.6-3.6z"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowD: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    books: '<rect x="3.5" y="4" width="4" height="16" rx="1"/><rect x="8.5" y="4" width="4" height="16" rx="1"/><path d="M14 5.2l3.8-1 4 15.3-3.8 1z"/>'
  };
  function ic(n, s) { s = s || 20; return '<svg class="ic ic-' + n + '" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" style="width:' + s + 'px;height:' + s + 'px" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>"; }
  function each(sel, fn) { Array.prototype.forEach.call(ROOT.querySelectorAll(sel), fn); }
  each("[data-ic]", function (el) { el.innerHTML = ic(el.getAttribute("data-ic"), +el.getAttribute("data-size") || 20); });
  /* ---------- variáveis do config ---------- */
  each("[data-var]", function (el) { var k = el.getAttribute("data-var"); if (C[k] != null) el.textContent = C[k]; });
  /* [MANUAL COMPRADO]: data-mc="o" vira "o Casamento Restaurado" ou "o seu manual" */
  each("[data-mc]", function (el) {
    var art = el.getAttribute("data-mc"), nome = A ? A.manual : null, txt;
    if (nome) txt = (art ? art + " " : "") + nome;
    else txt = art === "O" ? "O seu manual" : "o seu manual";
    el.textContent = txt;
  });
  /* ---------- helpers de montagem ---------- */
  var outros = T.ordem.filter(function (k) { return k !== m; });
  if (area) outros = [area].concat(outros.filter(function (k) { return k !== area; }));
  function chip(k) { var a = T.areas[k]; return '<span class="chip-pesa"><img src="' + a.simbolo + '" width="22" height="22" alt="">Também pesa aí: ' + a.segunda + "</span>"; }
  function capa(k, cls) { return '<span class="capa ' + (cls || "") + '"><img src="' + T.areas[k].capa + '" alt="Capa do ' + T.areas[k].manual + '" width="800" height="800" loading="lazy" decoding="async"></span>'; }
  function fill(slot, html) { each('[data-slot="' + slot + '"]', function (el) { el.innerHTML = html; }); }
  function leque(keys, size) {
    var n = keys.length, mid = (n - 1) / 2, step = size * 0.44, h = "";
    keys.forEach(function (k, i) {
      var d = i - mid, front = k === m;
      var z = front ? 20 : 10 - Math.abs(Math.round(d * 2));
      h += '<span class="leque-item' + (front ? " is-dela" : "") + '" style="z-index:' + z + ";transform:translateX(" + (d * step).toFixed(1) + "px) rotate(" + (d * 6).toFixed(1) + "deg)" + (front ? " translateY(-6px)" : "") + '">' + capa(k) + (front ? '<span class="selo-seu">' + ic("check", 13) + " já é seu</span>" : "") + "</span>";
    });
    return '<div class="leque" style="--cs:' + size + "px;height:" + Math.round(size * 1.18) + 'px">' + h + "</div>";
  }
  function lequeKit(size) {
    if (!m) return leque(T.ordem, size);
    var o = T.ordem.filter(function (k) { return k !== m; });
    return leque([o[0], m, o[1], o[2]], size);
  }
  /* ---------- Bloco 2: celebrar ---------- */
  var cel = A ? A.celebrar : T.semParametro.celebrar;
  fill("celebrar", cel.map(function (p) { return "<p>" + p + "</p>"; }).join(""));
  fill("capa-dela", A ? '<div class="capa-dela">' + capa(m) + '<span class="selo-seu">' + ic("check", 13) + " já é seu</span></div>" : "");
  /* ---------- Bloco 4: o problema que continua ---------- */
  var g = A2 ? A2.gancho4 : T.padrao.gancho4;
  var abre = A2 ? "<p>" + g.abre + "</p>" + '<p class="chip-linha">' + chip(area) + "</p>" : '<p class="destaque">' + g.abre + "</p>";
  fill("gancho4", abre + "<p>" + g.meio + "</p>" + '<div class="card-ok"><span class="ok-ic">' + ic("check", 18) + '</span><p>O manual que você levou <strong class="verde">continua sendo o seu começo</strong> e dá conta da área que mais dói. ' + g.fecho + "</p></div>");
  /* ---------- Bloco 5: as 4 portas (sem botão) ---------- */
  function porta(num, k, kicker, texto, tag, extra) {
    var dela = tag === "dela";
    return '<li class="porta' + (dela ? " porta-dela" : "") + '">' +
      '<span class="porta-no">' + (dela ? ic("check", 18) : ic("lockOpen", 18)) + "</span>" +
      '<div class="porta-card">' + (k ? capa(k, "capa-p") : "") +
      '<div class="porta-txt"><span class="kicker">' + num + (kicker ? " · " + kicker : "") + "</span>" +
      "<h3>" + (k ? T.areas[k].manual : "O seu manual") + "</h3>" + (extra || "") + (texto ? "<p>" + texto + "</p>" : "") +
      '<span class="tag ' + (dela ? "tag-verde" : "tag-terra") + '">' + (dela ? "JÁ É SEU" : "DESTRAVA HOJE") + "</span></div></div></li>";
  }
  function grupo(t, s) { return '<li class="porta-grupo"><span class="kicker">' + t + "</span>" + (s ? "<p>" + s + "</p>" : "") + "</li>"; }
  var portas = porta("01", m || null, "A PORTA QUE MAIS DÓI HOJE", "A área que você escolheu no teste. Aqui você aprende o método.", "dela");
  if (A2) {
    portas += porta("02", area, "A PORTA QUE TAMBÉM PESA", A2.porta02, "", chip(area));
    portas += grupo("03 e 04 · AS PORTAS QUE HOJE ESTÃO QUIETAS", "Pra quando essas áreas apertarem, você já ter a direção na mão.");
    portas += porta("03", outros[1], "", "", "") + porta("04", outros[2], "", "", "");
  } else if (m) {
    portas += grupo("02, 03 e 04 · AS OUTRAS PORTAS DA CASA", "Os 3 manuais que você ainda não tem.");
    portas += porta("02", outros[0], "", "", "") + porta("03", outros[1], "", "", "") + porta("04", outros[2], "", "", "");
  } else {
    portas += grupo("02, 03 e 04 · AS OUTRAS PORTAS DA CASA", "Os 3 manuais que você ainda não tem.");
  }
  fill("portas", '<ol class="portas">' + portas + "</ol>");
  /* ---------- Bloco 6: cards dos manuais novos ---------- */
  var chipIc = ["shield", "list", "hands"];
  var lista6 = m ? outros : T.ordem;
  fill("manuais", lista6.map(function (k) {
    var a = T.areas[k];
    return '<article class="manual">' + (k === area ? chip(k) : "") +
      '<div class="manual-top">' + capa(k, "capa-m") + '<div class="manual-head"><span class="kicker terra">Destrava hoje</span><h3>' + a.manual + "</h3></div></div>" +
      "<p>" + a.card + "</p>" +
      '<ul class="chips">' + a.chips.map(function (c, i) { return "<li>" + ic(chipIc[i], 16) + c + "</li>"; }).join("") + "</ul></article>";
  }).join(""));
  fill("preview", '<figure class="preview"><img src="' + T.areas[lista6[0]].preview + '" alt="Página interna do ' + T.areas[lista6[0]].manual + '" width="579" height="819" loading="lazy" decoding="async"></figure>');
  /* ---------- Blocos 8 e 14 ---------- */
  fill("item8", A2 ? A2.item8 : T.padrao.item8);
  fill("linha14", A2 ? '<p class="linha14">' + A2.linha14 + "</p>" + '<p class="chip-linha">' + chip(area) + "</p>" : '<p class="linha14">' + T.padrao.linha14 + "</p>");
  /* ---------- Leques ---------- */
  each("[data-leque]", function (el) {
    var tipo = el.getAttribute("data-leque"), s = +el.getAttribute("data-size") || 110;
    el.innerHTML = tipo === "kit" ? lequeKit(s) : leque(m ? T.ordem.filter(function (k) { return k !== m; }) : T.ordem.slice(0, 3), s);
  });
  fill("capa-mini", A ? capa(m, "capa-xs") : "");
  /* ---------- Downsell: o que entra ---------- */
  fill("down-entra", "<p>" + (A ? A.downEntra : T.semParametro.downEntra) + "</p>" + (A2 ? '<p class="linha-down">' + A2.linhaDown4 + "</p>" : ""));
  if (PAG === "down") {
    var dp = porta("", m || null, "", "", "dela").replace('<span class="kicker"></span>', "");
    (m ? outros : []).forEach(function (k) {
      dp += '<li class="porta porta-mini"><span class="porta-no">' + ic("plus", 16) + '</span><div class="porta-card">' + capa(k, "capa-p") + '<div class="porta-txt"><h3>' + T.areas[k].manual + "</h3>" + (k === area ? chip(k) : "") + "</div></div></li>";
    });
    fill("down-portas", '<ol class="portas portas-mini">' + dp + "</ol>");
  }
  /* ---------- Funnel Control + pixel (mesmo formato das ofertas no ar) ---------- */
  var FC_TRACK = "https://funnel-control.vercel.app/api/track/quiz";
  function fcVid() {
    var s = lerEstado();
    if (!s.vid) {
      var c = window.crypto; var id = ("fc" + Math.random().toString(36).slice(2) + Date.now().toString(36)); if (c) { if (c.randomUUID) id = c.randomUUID(); } s.vid = id;
      if (!s.answers) s.answers = {}; if (!s.history) s.history = []; if (!s.lead) s.lead = {};
      try { localStorage.setItem("fr_state", JSON.stringify(s)); } catch (e) {}
    }
    return s.vid;
  }
  function fcSend(body) {
    var payload = JSON.stringify(body);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon(FC_TRACK, blob)) return;
      }
    } catch (e) {}
    try { fetch(FC_TRACK, { method: "POST", mode: "cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: payload, keepalive: true }).catch(function () {}); } catch (e2) {}
  }
  function track(ev) {
    var info = { page: FC_PAGE, m: m || "default", variante: C.variante, area2: area || "", area2_fonte: areaFonte };
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: ev, page: info.page, m: info.m, variante: info.variante, area2: info.area2, area2_fonte: info.area2_fonte }); } catch (e) {}
    try { if (typeof window.fbq === "function") window.fbq("trackCustom", ev, info); } catch (e2) {}
    /* A API do Funnel Control recusa campo fora da lista e page fora de upsell/downsell.
       variant e area2 só entram quando o Funnel Control aceitar (config.fcEnviarVariante). */
    var body = { funnel: "familia", visitor_id: "", event: ev, page: FC_PAGE, area: m || null };
    if (C.fcEnviarVariante) { body.variant = C.variante; body.area2 = area || null; }
    try { body.visitor_id = fcVid(); fcSend(body); } catch (e3) {}
  }
  window.FR_UP = { m: m, area: area, areaFonte: areaFonte, page: FC_PAGE, variante: C.variante, track: track };
  /* ---------- Links: aceite (1 clique Eduzz) e recusa ---------- */
  var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
  var KEEP_IDS = ["sck", "utm_sck", "fbclid", "gclid"];
  var DEFAULTS = { utm_source: "quiz", utm_medium: "funnel", utm_campaign: "familia-restaurada" };
  function hasUtm(o) { return !!(o.utm_source || o.utm_campaign); }
  function only(o) { var r = {}; UTM.forEach(function (k) { if (o[k]) { r[k] = String(o[k]); } }); return r; }
  function fromUrl() { var r = {}; try { var p = new URLSearchParams(location.search); UTM.forEach(function (k) { var v = p.get(k); if (v) { r[k] = v; } }); } catch (e) {} return r; }
  function fromQuiz() { try { var s = JSON.parse(localStorage.getItem("fr_state") || "{}"); return only(s.utms || {}); } catch (e) { return {}; } }
  function fromUtmify() {
    var r = {};
    try { UTM.forEach(function (k) { var v = localStorage.getItem(k); var ex = localStorage.getItem(k + "_exp"); if (v) { if (ex) { var left = new Date(ex).getTime() - Date.now(); if (left === Math.abs(left)) { r[k] = v; } } } }); } catch (e) {}
    return r;
  }
  function fromLegacy() { try { return only(JSON.parse(localStorage.getItem("utm_data") || "{}")); } catch (e) { return {}; } }
  function pickUtms(noDefaults) {
    var srcs = [fromUrl(), fromQuiz(), fromUtmify(), fromLegacy()];
    for (var i = 0; i !== srcs.length; i++) { if (hasUtm(srcs[i])) { return srcs[i]; } }
    return noDefaults ? {} : DEFAULTS;
  }
  function isAceite(key) { return String(key).indexOf("aceite") === 0; }
  function build(key, currentHref) {
    var dest = C.links[key] || "#", utms = pickUtms(false), u, k;
    if (dest === "#") return "#"; /* link de 1 clique ainda não definido */
    if (isAceite(key)) {
      u = new URL(dest);
      var cur = null; try { cur = new URL(currentHref, location.href); } catch (e) {}
      /* só os ids que o Track Hunter/track-cta põem no link; m, area, xcod e o resto ficam de fora */
      if (cur) { KEEP_IDS.forEach(function (id) { var v = cur.searchParams.get(id); if (v) { u.searchParams.set(id, v); } }); }
      u.searchParams.delete("m"); u.searchParams.delete(C.paramArea);
      for (k in utms) { u.searchParams.set(k, utms[k]); }
      if (C.umClique) u.searchParams.set("u", "1");
      return u.toString();
    }
    u = new URL(dest, location.origin);
    if (key === "recusaA") { if (m) { u.searchParams.set("m", m); } if (area) { u.searchParams.set(C.paramArea, area); } }
    for (k in utms) { u.searchParams.set(k, utms[k]); }
    if (u.origin === location.origin) return u.pathname + u.search;
    return u.toString();
  }
  function absHref(v) { try { return new URL(v, location.href).toString(); } catch (e) { return String(v || ""); } }
  /* O UTMify reescreve todo <a> (2s, 3s, 5s, 9s). Depois de cada reescrita, volta o link limpo (no máximo 3 vezes seguidas). */
  function writeHref(el) {
    var next = build(el.getAttribute("data-link"), el.href);
    if (absHref(el.href) === absHref(next)) { el.__frN = 0; return; }
    if (el.__frLast === next) { el.__frN = (el.__frN || 0) + 1; } else { el.__frLast = next; el.__frN = 1; }
    if ([0, 1, 2, 3].indexOf(el.__frN) === -1) return;
    el.setAttribute("href", next);
  }
  function watchHref(el) {
    if (typeof MutationObserver !== "function") return;
    var obs = new MutationObserver(function () { writeHref(el); });
    obs.observe(el, { attributes: true, attributeFilter: ["href"] });
  }
  function onActivate(e) {
    var el = e.currentTarget;
    writeHref(el);
    if (e.type === "click") track(isAceite(el.getAttribute("data-link")) ? "fr_oferta_accept" : "fr_oferta_decline");
    if (el.getAttribute("href") === "#") { e.preventDefault(); }
    e.stopPropagation();
  }
  /* Tira o "m" e a 2ª área que o script global grava no utm_data (senão vazam pra todo link da Eduzz do site por 90 dias). */
  function repairStorage() {
    try {
      var raw = localStorage.getItem("utm_data"); if (!raw) { return; }
      var d = JSON.parse(raw), mexeu = false;
      ["m", C.paramArea].forEach(function (k) { if (d.hasOwnProperty(k)) { delete d[k]; mexeu = true; } });
      if (!mexeu) { return; }
      if (!hasUtm(only(d))) { var best = pickUtms(true); for (var k in best) { d[k] = best[k]; } }
      var keys = Object.keys(d).filter(function (x) { return x !== "timestamp"; });
      if (keys.length === 0) { localStorage.removeItem("utm_data"); } else { localStorage.setItem("utm_data", JSON.stringify(d)); }
    } catch (e) {}
  }
  repairStorage();
  each("a[data-link]", function (el) {
    writeHref(el); watchHref(el);
    el.addEventListener("click", onActivate);
    el.addEventListener("auxclick", onActivate);
  });
  /* ---------- Fade ao rolar ---------- */
  var reduz = false; try { reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var secs = ROOT.querySelectorAll(".reveal");
  if (reduz || !("IntersectionObserver" in window)) Array.prototype.forEach.call(secs, function (s) { s.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(secs, function (s) { io.observe(s); });
  }
  /* ---------- Botão fixo: só a partir do preço (bloco 10); some com um botão de aceite na tela ---------- */
  var fixo = ROOT.querySelector(".cta-fixo"), preco = document.getElementById("preco");
  if (fixo) { if (preco) {
    var ctas = ROOT.querySelectorAll(".cta-aceite"), visiveis = [];
    var upd = function () {
      var passou = lt(preco.getBoundingClientRect().top, window.innerHeight * 0.6);
      if (passou) { if (visiveis.length === 0) { fixo.classList.add("on"); return; } }
      fixo.classList.remove("on");
    };
    if ("IntersectionObserver" in window) {
      var o2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) { var i = visiveis.indexOf(e.target); if (e.isIntersecting) { if (i === -1) visiveis.push(e.target); } else if (i !== -1) { visiveis.splice(i, 1); } });
        upd();
      });
      Array.prototype.forEach.call(ctas, function (c) { o2.observe(c); });
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  } }
  track("fr_oferta_view");
})();
