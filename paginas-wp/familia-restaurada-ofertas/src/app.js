var ORDER = ["casamento", "filhos", "oracao", "financeiro"];
var PATH = {
  check: "<path d='M5 12.5 9.5 17 19 7'/>",
  mail: "<rect x='3' y='5' width='18' height='14' rx='2'/><path d='M4 7l8 6 8-6'/>",
  phone: "<rect x='7' y='3' width='10' height='18' rx='2'/><path d='M11 18h2'/>",
  books: "<path d='M4 19V6.5A1.5 1.5 0 0 1 5.5 5H11v14H5.5A1.5 1.5 0 0 1 4 17.5'/><path d='M11 19V5h5.5A1.5 1.5 0 0 1 18 6.5V19'/><path d='M18 8h2.2A1 1 0 0 1 21 9v8a1 1 0 0 1-1 1h-2'/>",
  card: "<rect x='3' y='6' width='18' height='12' rx='2'/><path d='M3 10h18'/>",
  lock: "<rect x='5' y='11' width='14' height='9' rx='2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/>",
  hand: "<path d='M8 11V6.2a1.3 1.3 0 0 1 2.6 0V11'/><path d='M10.6 10V5a1.3 1.3 0 0 1 2.6 0v6'/><path d='M13.2 10.5V7.2a1.3 1.3 0 0 1 2.6 0V14c0 3.2-1.7 5.5-5 5.5H9A3.5 3.5 0 0 1 5.5 16v-3.2a1.3 1.3 0 0 1 2.6 0'/>",
  book: "<path d='M12 6c-2-1.2-4.5-1.5-7-1v12c2.5-.4 5 .1 7 1 2-.9 4.5-1.4 7-1V5c-2.5-.5-5-.2-7 1z'/><path d='M12 6v12'/>",
  down: "<path d='M12 5v14'/><path d='M7 14l5 5 5-5'/>",
  doorShut: "<path d='M6 21V4h12v17'/><path d='M4 21h16'/><circle cx='15' cy='12' r='.8' fill='currentColor' stroke='none'/>",
  doorOpen: "<path d='M8 21V4l8-2v19'/><path d='M4 21h16'/><path d='M16 21V5'/><circle cx='13' cy='12' r='.8' fill='currentColor' stroke='none'/>"
};
function ico(name, px){
  var s = px || 22;
  var p = PATH[name] || PATH.check;
  return '<svg class="fr-ico" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" style="width:'+s+'px;height:'+s+'px;min-width:'+s+'px;min-height:'+s+'px" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
}
function circ(name, px){ return '<span class="fr-icirc">'+ico(name, px || 20)+'</span>'; }
function esc(s){
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function asset(file){ return CFG.assetBase + file; }
function areaOf(id){
  var i = 0;
  while (i !== COPY.areas.length) {
    if (COPY.areas[i].id === id) return COPY.areas[i];
    i = i + 1;
  }
  return null;
}
function normM(v){
  v = String(v || "").toLowerCase().replace(/^\s+|\s+$/g, "");
  try { v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
  if (ORDER.indexOf(v) === -1) return "";
  return v;
}
function paramM(){
  try { return new URLSearchParams(location.search).get("m"); } catch (e) { return ""; }
}
function qaOn(){
  try { if (location.search.indexOf("qa=1") !== -1) return true; } catch (e) {}
  return false;
}
function img(file, alt, drop, eager){
  var load = eager ? "eager" : "lazy";
  return '<img alt="'+esc(alt)+'" data-drop="'+drop+'" src="'+esc(asset(file))+'" loading="'+load+'" decoding="async">';
}
function bindImgs(root){
  var imgs = root.querySelectorAll("img");
  Array.prototype.forEach.call(imgs, function(im){
    im.addEventListener("error", function(){
      var drop = im.getAttribute("data-drop") || "self";
      if (drop === "self") {
        if (im.parentNode) im.parentNode.removeChild(im);
        return;
      }
      var n = im;
      while (n) {
        if (n.classList) {
          if (n.classList.contains(drop)) {
            if (n.parentNode) n.parentNode.removeChild(n);
            return;
          }
        }
        n = n.parentNode;
      }
    });
  });
}
function track(ev){
  var root = document.getElementById("fr-oferta");
  var m = root ? root.getAttribute("data-m") : "";
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: ev, page: CFG.page, m: m });
  } catch (e) {}
  try {
    if (typeof window.fbq === "function") window.fbq("trackCustom", ev, { page: CFG.page, m: m });
  } catch (e2) {}
}
function neutralizarWpEmoji(){
  try {
    var t = window.twemoji;
    if (t) {
      if (typeof t.parse === "function") {
        if (!t.__frOff) { t.__frOff = 1; t.parse = function(n){ return n; }; }
      }
    }
  } catch (e) {}
}
function restaurarEmojiNativo(node){
  if (!node) return;
  try {
    var imgs = node.querySelectorAll("img.emoji, img.wp-smiley, img[src*='s.w.org/images/core/emoji']");
    var i = imgs.length;
    while (i !== 0) {
      i = i - 1;
      var im = imgs[i];
      var t = im.getAttribute("alt");
      if (t) { if (im.parentNode) im.parentNode.replaceChild(document.createTextNode(t), im); }
    }
  } catch (e) {}
}
function armEmoji(root){
  neutralizarWpEmoji();
  restaurarEmojiNativo(root);
  setTimeout(function(){ neutralizarWpEmoji(); restaurarEmojiNativo(root); }, 400);
  setTimeout(function(){ neutralizarWpEmoji(); restaurarEmojiNativo(root); }, 1400);
}
function stepsHtml(){
  var labels = COPY.shared.steps;
  var cls = ["done", "now", "wait"];
  var i = 0;
  var out = '<ol class="fr-steps">';
  while (i !== labels.length) {
    var dot = "";
    if (i === 0) dot = ico("check", 16);
    out = out + '<li class="'+cls[i]+'"><span class="ln"></span><span class="fr-dot">'+dot+'</span><span class="lb">'+esc(labels[i])+'</span></li>';
    i = i + 1;
  }
  return out + '</ol>';
}
function coverFig(area, cls, eager, badge){
  var b = "";
  if (badge) b = '<span class="fr-badge">'+esc(COPY.shared.yours)+'</span>';
  return '<figure class="cov '+cls+'"><span class="shot fr-media">'+img(area.capa, area.nome, "fr-media", eager)+'</span>'+b+'</figure>';
}
function fanHtml(frontId, small){
  var sm = small ? " sm" : "";
  var front = areaOf(frontId);
  if (!front) {
    var bits = "";
    var i = 0;
    while (i !== COPY.areas.length) {
      bits = bits + coverFig(COPY.areas[i], "e"+i, true, false);
      i = i + 1;
    }
    return '<div class="fr-fan even'+sm+'">'+bits+'</div>';
  }
  var back = [];
  var j = 0;
  while (j !== COPY.areas.length) {
    if (COPY.areas[j].id !== front.id) back.push(COPY.areas[j]);
    j = j + 1;
  }
  return '<div class="fr-fan'+sm+'">'+coverFig(back[0], "f0", true, false)+coverFig(back[1], "f1", true, false)+coverFig(back[2], "f2", true, false)+coverFig(front, "front", true, true)+'</div>';
}
function doorHtml(area, mode, withCap){
  var cls = "open";
  var icon = "doorOpen";
  var state = esc(COPY.shared.ajar);
  if (mode === "shut") { cls = "shut"; icon = "doorShut"; state = ico("check", 14) + " " + esc(COPY.shared.caring); }
  if (mode === "plus") { cls = "open"; state = "+"; }
  if (mode === "mine") { cls = "shut"; icon = "doorShut"; state = ico("check", 16); }
  if (mode === "plain") { cls = "open"; state = ""; }
  var cap = "";
  if (withCap) cap = '<p class="cap fr-t sm">'+esc(area.door)+'</p>';
  var st = "";
  if (state) st = '<p class="st">'+state+'</p>';
  return '<div class="fr-door '+cls+'">'+circ(icon, 22)+'<img class="sym" alt="" data-drop="self" src="'+esc(asset(area.sym))+'" width="36" height="36">'+cap+st+'</div>';
}
function doorsHtml(m, kind){
  var bits = "";
  var i = 0;
  while (i !== COPY.areas.length) {
    var a = COPY.areas[i];
    var mode = "open";
    var cap = true;
    if (kind === "down") { cap = false; mode = "plus"; if (m) { if (a.id === m) mode = "mine"; } else mode = "plain"; }
    if (kind === "up") { if (m) { if (a.id === m) mode = "shut"; } }
    bits = bits + doorHtml(a, mode, cap);
    i = i + 1;
  }
  var sm = "";
  if (kind === "down") sm = " sm";
  return '<div class="fr-doors'+sm+'">'+bits+'</div>';
}
function minisHtml(){
  var out = "";
  var i = 0;
  while (i !== COPY.shared.minis.length) {
    var item = COPY.shared.minis[i];
    var area = areaOf(item.sym);
    if (i !== 0) out = out + '<div class="fr-join" aria-hidden="true">'+ico("down", 18)+'</div>';
    out = out + '<article class="fr-mini"><span class="fr-icirc"><img class="sym" alt="" data-drop="self" src="'+esc(asset(area.sym))+'" width="22" height="22" style="width:22px;height:22px"></span><p class="fr-t sm">'+esc(item.t)+'</p></article>';
    i = i + 1;
  }
  return out;
}
function cardsHtml(m){
  var bits = "";
  var i = 0;
  while (i !== COPY.areas.length) {
    var a = COPY.areas[i];
    var mine = "";
    var cls = "";
    if (m) {
      if (a.id === m) { cls = " mine"; mine = '<span class="fr-own">'+esc(COPY.shared.owned)+'</span>'; }
    }
    bits = bits + '<article class="fr-man'+cls+'">'+mine+'<div class="ph fr-media">'+img(a.capa, a.nome, "fr-media", false)+'</div><h3>'+esc(a.nome)+'</h3><p class="fr-t sm">'+esc(a.fraseA)+'</p><p class="fr-t sm">'+esc(a.fraseB)+'</p></article>';
    i = i + 1;
  }
  return '<div class="fr-cards">'+bits+'</div>';
}
function interiorHtml(m){
  var a = areaOf(m);
  if (!a) a = COPY.areas[0];
  return '<div class="fr-frame fr-media">'+img(a.prev, "", "fr-media", false)+'<span class="fade"></span></div>';
}
function pillsHtml(){
  var names = COPY.shared.chipsLine;
  return '<div class="fr-pills"><span class="fr-pill">'+esc(names[0])+'</span><span class="sep">·</span><span class="fr-pill">'+esc(names[1])+'</span><span class="sep">·</span><span class="fr-pill">'+esc(names[2])+'</span></div>';
}
function miniFan(){
  var bits = "";
  var i = 0;
  while (i !== COPY.areas.length) {
    bits = bits + img(COPY.areas[i].capa, "", "self", false);
    i = i + 1;
  }
  return '<div class="fr-minifan">'+bits+'</div>';
}
function sealsHtml(){
  var icons = ["mail", "phone", "books"];
  var labels = COPY.shared.seals;
  var i = 0;
  var out = '<ul class="fr-seals">';
  while (i !== labels.length) {
    out = out + '<li><span class="fr-round">'+ico(icons[i], 22)+'</span><span>'+esc(labels[i])+'</span></li>';
    i = i + 1;
  }
  return out + '</ul>';
}
function acceptLink(id, label){
  return '<a class="fr-cta" id="'+id+'" data-fr-link="accept" href="'+esc(CFG.accept)+'?u=1">'+esc(label)+'</a>';
}
function declineLink(label){
  var href = CFG.decline;
  var m = normM(paramM());
  if (CFG.page === "upsell") { if (m) href = CFG.decline + "?m=" + m; }
  return '<p class="fr-bye"><a class="fr-no" id="fr-decline" data-fr-link="decline" href="'+esc(href)+'">'+esc(label)+'</a></p>';
}
function bandHtml(bold, sub){
  var second = "";
  if (sub) second = '<p class="fr-t sub">'+esc(sub)+'</p>';
  return '<div class="fr-band"><div class="fr-bandin"><span class="fr-ok">'+ico("check", 16)+'</span><div><p class="fr-t b">'+esc(bold)+'</p>'+second+'</div></div></div>';
}
function videoHtml(){
  if (!CFG.videoUrl) return "";
  var poster = asset("fr-ezenete-autora.webp");
  return '<section class="fr-sec"><div class="fr-v16"><img class="fr-vface" alt="" data-drop="self" src="'+esc(poster)+'"><video controls playsinline src="'+esc(CFG.videoUrl)+'" poster="'+esc(poster)+'"></video></div></section>';
}
function restHtml(rest){
  var cut = rest.indexOf(", ");
  if (cut === -1) return '<p class="fr-t fr-mt14">'+esc(rest)+'</p>';
  var head = rest.slice(0, cut + 1);
  var tail = rest.slice(cut + 2);
  return '<p class="fr-t fr-mt14">'+esc(head)+'</p><p class="fr-t fr-mt14">'+esc(tail)+'</p>';
}
function b6Html(m){
  var a = areaOf(m);
  var lead = CFG.copyDefault.b6a;
  var rest = CFG.copyDefault.b6b;
  var chips = "";
  if (a) {
    lead = a.b6a;
    rest = a.b6b;
    var i = 0;
    var row = "";
    while (i !== a.chips.length) {
      row = row + '<span class="fr-chip">'+esc(a.chips[i])+'</span>';
      i = i + 1;
    }
    chips = '<div class="fr-chips fr-mt28">'+row+'</div>';
  }
  return '<section class="fr-sec"><div class="fr-sum"><p class="fr-lead"><span class="mk">'+ico("check", 18)+'</span><span class="fr-t b">'+esc(lead)+'</span></p>'+restHtml(rest)+chips+'</div></section>';
}
function renderUpsell(root, m){
  var S = COPY.shared;
  var area = areaOf(m);
  var l1 = CFG.copyDefault.b3l1;
  var l2 = CFG.copyDefault.b3l2;
  if (area) { l1 = area.b3a; l2 = area.b3b; }
  var fixed = "";
  if (CFG.page === "upsell") {
    fixed = '<div class="fr-fixed" id="fr-fixed"><div class="fr-wrap">'+acceptLink("fr-buy-fixed", S.btn)+'</div></div>';
  }
  root.innerHTML = bandHtml(S.band1, S.band2)
    + '<div class="fr-wrap">'
    + '<section class="fr-sec">'+stepsHtml()+'</section>'
    + videoHtml()
    + '<section class="fr-sec"><h1 class="fr-h1"><span class="l1 fr-t">'+esc(l1)+'</span><span class="l2 fr-t">'+esc(l2)+'</span></h1><p class="fr-t fr-center fr-mt14">'+esc(S.sub)+'</p><div class="fr-mt28">'+fanHtml(m, false)+'</div></section>'
    + '<section class="fr-sec"><p class="fr-t fr-center">'+esc(S.b4a)+'</p><p class="fr-t fr-center fr-mt28">'+esc(S.b4b)+'</p><div class="fr-mt28">'+doorsHtml(m, "up")+'</div><p class="fr-t fr-center fr-mt28">'+esc(S.know)+' </p><p class="fr-hl fr-mt14">'+esc(S.hl)+'</p><div class="fr-mt28">'+minisHtml()+'</div><p class="fr-t fr-center fr-mt28">'+esc(S.close1)+'</p><p class="fr-t fr-center fr-mt14">'+esc(S.close2)+'<em>"'+esc(S.closeI)+'"</em>'+esc(S.close3)+'</p></section>'
    + '<section class="fr-sec" id="fr-b5"><h2 class="fr-h2">'+esc(S.h2)+'</h2><div class="fr-mt14">'+cardsHtml(m)+'</div><div class="fr-mt28">'+interiorHtml(m)+'</div><div class="fr-mt28">'+pillsHtml()+'</div><p class="fr-t fr-center fr-mt14">'+esc(S.each1)+'</p><div class="fr-word fr-mt14">'+circ("book", 20)+'<p class="fr-t sm">'+esc(S.each2)+'</p></div></section>'
    + b6Html(m)
    + '<section class="fr-sec"><div class="fr-price">'+miniFan()+'<p class="fr-t fr-center fr-mt14">'+esc(S.priceLead)+'</p><p class="fr-big fr-mt14">'+esc(S.price)+'<span class="per">.</span></p><p class="fr-cmpline fr-mt14">'+esc(S.cmp)+'</p><div class="fr-mt28">'+sealsHtml()+'</div><p class="fr-pay fr-mt28"><span class="mk">'+ico("card", 18)+'</span><span class="fr-t sm">'+esc(S.mail)+'</span></p><div class="fr-mt28">'+acceptLink("fr-buy-card", S.btn)+'</div><p class="fr-micro fr-mt14"><span class="mk">'+ico("lock", 16)+'</span><span>'+esc(S.micro)+'</span></p></div></section>'
    + '<section class="fr-sec"><div class="fr-care"><span class="fr-icirc">'+ico("hand", 22)+'</span><div><p class="fr-t sm">'+esc(S.red1)+'</p><p class="fr-t sm gap">'+esc(S.red2)+'</p><p class="fr-t sm gap">'+esc(S.red3a)+'</p><p class="fr-t sm gap">'+esc(S.red3b)+'</p></div></div></section>'
    + '<section class="fr-sec">'+declineLink(S.no)+'</section>'
    + '</div>'
    + fixed;
}
function renderDown(root, m){
  var S = COPY.shared;
  var area = areaOf(m);
  var d4 = '<p class="fr-t fr-center">'+esc(CFG.copyDefault.d4)+'</p>';
  if (area) d4 = '<p class="fr-t fr-center">'+esc(area.d4a)+'</p><p class="fr-t fr-center fr-mt14">'+esc(area.d4b)+'</p>';
  root.innerHTML = bandHtml(S.downBand, "")
    + '<div class="fr-wrap">'
    + '<section class="fr-sec">'+stepsHtml()+'<h1 class="fr-h1 sm fr-mt28"><span class="l1">'+esc(S.downTitle)+'</span></h1></section>'
    + '<section class="fr-sec"><p class="fr-t fr-center">'+esc(S.downOpen)+'</p><div class="fr-mt28">'+fanHtml("", true)+'</div><p class="fr-big fr-mt14">'+esc(S.downPrice)+'<span class="per">.</span></p></section>'
    + '<section class="fr-sec"><p class="fr-t fr-center">'+esc(S.downNot)+'</p><p class="fr-hl fr-mt28">'+esc(S.downSame)+'</p><div class="fr-cols fr-mt28"><div class="col antes">'+circ("books", 20)+'<p class="fr-t sm">'+esc(S.downBefore)+'</p></div><div class="col agora">'+circ("books", 20)+'<p class="fr-t sm">'+esc(S.downNow)+'</p></div></div><p class="fr-t fr-center fr-mt28">'+esc(S.downWhy1)+'</p><p class="fr-t fr-center fr-mt14">'+esc(S.downWhy2)+'</p></section>'
    + '<section class="fr-sec">'+d4+'<div class="fr-mt28">'+doorsHtml(m, "down")+'</div></section>'
    + '<section class="fr-sec">'+acceptLink("fr-buy-card", S.downBtn)+'<p class="fr-micro fr-mt14"><span class="mk">'+ico("lock", 16)+'</span><span>'+esc(S.downMicro)+'</span></p><div class="fr-care fr-mt28"><span class="fr-icirc">'+ico("hand", 22)+'</span><div><p class="fr-t sm">'+esc(S.downRed1)+'</p><p class="fr-t sm gap">'+esc(S.downRed2)+'</p></div></div></section>'
    + '<section class="fr-sec">'+declineLink(S.downNo)+'</section>'
    + '</div>';
}
function fadeIn(root){
  if (qaOn()) {
    document.documentElement.classList.add("fr-qa");
    return;
  }
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (reduce) return;
  if (!("IntersectionObserver" in window)) return;
  var secs = root.querySelectorAll(".fr-sec");
  root.classList.add("fr-anim");
  var io = new IntersectionObserver(function(ents){
    ents.forEach(function(en){
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  Array.prototype.forEach.call(secs, function(x, i){
    if (i === 0) x.classList.add("in");
    else io.observe(x);
  });
}
function bindFixed(){
  if (CFG.page !== "upsell") return;
  var bar = document.getElementById("fr-fixed");
  var b5 = document.getElementById("fr-b5");
  var buy = document.getElementById("fr-buy-card");
  if (!bar) return;
  if (!b5) return;
  if (!buy) return;
  if (!("IntersectionObserver" in window)) { bar.classList.add("show"); return; }
  var seen = false;
  var onBuy = false;
  function sync(){
    if (!seen) return;
    if (onBuy) bar.classList.remove("show");
    else bar.classList.add("show");
  }
  var o1 = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if (en.isIntersecting) seen = true; });
    sync();
  }, { threshold: 0.01 });
  o1.observe(b5);
  var o2 = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ onBuy = en.isIntersecting; });
    sync();
  }, { threshold: 0.35 });
  o2.observe(buy);
}
function armClicks(root){
  var els = root.querySelectorAll("a[data-fr-link]");
  Array.prototype.forEach.call(els, function(el){
    el.addEventListener("click", function(){
      var kind = el.getAttribute("data-fr-link");
      if (kind === "accept") track("fr_oferta_accept");
      else track("fr_oferta_decline");
    });
  });
}
function render(){
  var root = document.getElementById("fr-oferta");
  if (!root) return;
  var m = normM(paramM());
  var tag = m;
  if (!tag) tag = "default";
  root.setAttribute("data-m", tag);
  root.setAttribute("data-page", CFG.page);
  if (CFG.page === "downsell") renderDown(root, m);
  else renderUpsell(root, m);
  bindImgs(root);
  armClicks(root);
  fadeIn(root);
  bindFixed();
  armEmoji(root);
  track("fr_oferta_view");
}
window.FR_OF = { page: CFG.page, accept: CFG.accept, decline: CFG.decline };
render();
