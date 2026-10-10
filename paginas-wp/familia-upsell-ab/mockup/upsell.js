/* Lógica das páginas de upsell. Não tem texto de copy aqui: a copy fixa está no HTML,
   a variável por área em textos.js e os valores provisórios em config.js. */
(function () {
  var C = window.UPSELL_CONFIG, T = window.UPSELL_TEXTOS;
  var body = document.body, PAG = body.getAttribute("data-pagina"); /* a | b | down */
  var q = new URLSearchParams(location.search);
  var m = (q.get("m") || "").toLowerCase();
  if (!T.areas[m]) m = "";
  var area = (q.get(C.paramArea) || "").toLowerCase();
  if (!m || !T.areas[area] || area === m) area = ""; /* sem ?m ou área inválida/igual = padrão */
  var A = m ? T.areas[m] : null, A2 = area ? T.areas[area] : null;
  body.classList.add(area ? "com-area" : "sem-area");
  if (!m) body.classList.add("sem-m");

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
  function ic(n, s) { s = s || 20; return '<svg class="ic ic-' + n + '" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>"; }
  window.UPSELL_ICON = ic;
  document.querySelectorAll("[data-ic]").forEach(function (el) { el.innerHTML = ic(el.getAttribute("data-ic"), +el.getAttribute("data-size") || 20); });

  /* ---------- variáveis do config.js ---------- */
  document.querySelectorAll("[data-var]").forEach(function (el) {
    var k = el.getAttribute("data-var"); if (C[k] != null) el.textContent = C[k];
  });
  /* [MANUAL COMPRADO]: data-mc="o" vira "o Casamento Restaurado" ou "o seu manual" */
  document.querySelectorAll("[data-mc]").forEach(function (el) {
    var art = el.getAttribute("data-mc");
    var nome = A ? A.manual : null, txt;
    if (nome) txt = (art ? art + " " : "") + nome;
    else txt = art === "O" ? "O seu manual" : "o seu manual";
    el.textContent = txt;
  });

  /* ---------- links (levam ?m e ?area adiante) ---------- */
  var keep = new URLSearchParams(); if (m) keep.set("m", m); if (area) keep.set(C.paramArea, area);
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var href = C.links[el.getAttribute("data-link")] || "#";
    if (href !== "#" && keep.toString()) href += (href.indexOf("?") < 0 ? "?" : "&") + keep.toString();
    el.setAttribute("href", href);
  });

  /* ---------- helpers ---------- */
  var outros = T.ordem.filter(function (k) { return k !== m; });
  if (area) outros = [area].concat(outros.filter(function (k) { return k !== area; }));
  function chip(k) {
    var a = T.areas[k];
    return '<span class="chip-pesa"><img src="' + a.simbolo + '" width="22" height="22" alt="">Também pesa aí: ' + a.segunda + "</span>";
  }
  function capa(k, cls) { return '<span class="capa ' + (cls || "") + '"><img src="' + T.areas[k].capa + '" alt="Capa do ' + T.areas[k].manual + '" width="800" height="800" loading="lazy"></span>'; }
  function fill(slot, html) { document.querySelectorAll('[data-slot="' + slot + '"]').forEach(function (el) { el.innerHTML = html; }); }

  /* Leque de capas: lista de áreas; a dela (m) vai na frente com o selo */
  function leque(keys, size) {
    var n = keys.length, mid = (n - 1) / 2, step = size * 0.44, h = "";
    keys.forEach(function (k, i) {
      var d = i - mid, front = k === m;
      var z = front ? 20 : 10 - Math.abs(Math.round(d * 2));
      h += '<span class="leque-item' + (front ? " is-dela" : "") + '" style="z-index:' + z + ";transform:translateX(" + (d * step).toFixed(1) + "px) rotate(" + (d * 6).toFixed(1) + "deg)" + (front ? " translateY(-6px)" : "") + '">' + capa(k) + (front ? '<span class="selo-seu">' + ic("check", 13) + " já é seu</span>" : "") + "</span>";
    });
    return '<div class="leque" style="--cs:' + size + "px;height:" + Math.round(size * 1.18) + 'px">' + h + "</div>";
  }
  function lequeKit(size) { /* os 4, com o dela no meio */
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
  fill("gancho4", abre + "<p>" + g.meio + "</p>" +
    '<div class="card-ok"><span class="ok-ic">' + ic("check", 18) + '</span><p>O manual que você levou <strong class="verde">continua sendo o seu começo</strong> e dá conta da área que mais dói. ' + g.fecho + "</p></div>");

  /* ---------- Bloco 5: as 4 portas ---------- */
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
  fill("preview", '<figure class="preview"><img src="' + T.areas[lista6[0]].preview + '" alt="Página interna do ' + T.areas[lista6[0]].manual + '" width="579" height="819" loading="lazy"></figure>');

  /* ---------- Blocos 8 e 14 ---------- */
  fill("item8", A2 ? A2.item8 : T.padrao.item8);
  fill("linha14", A2 ? '<p class="linha14">' + A2.linha14 + "</p>" + '<p class="chip-linha">' + chip(area) + "</p>" : '<p class="linha14">' + T.padrao.linha14 + "</p>");

  /* ---------- Leques ---------- */
  document.querySelectorAll("[data-leque]").forEach(function (el) {
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

  /* ---------- Fade ao rolar ---------- */
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var secs = document.querySelectorAll(".reveal");
  if (reduz || !("IntersectionObserver" in window)) secs.forEach(function (s) { s.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Botão fixo (a partir do bloco 10) ---------- */
  var fixo = document.querySelector(".cta-fixo"), preco = document.getElementById("preco");
  if (fixo && preco) {
    var ctas = document.querySelectorAll(".cta-aceite");
    var vis = new Set();
    var o2 = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); }); upd(); });
    ctas.forEach(function (c) { o2.observe(c); });
    function upd() {
      var passou = preco.getBoundingClientRect().top < window.innerHeight * 0.6;
      fixo.classList.toggle("on", passou && vis.size === 0);
    }
    window.addEventListener("scroll", upd, { passive: true }); upd();
  }
})();
