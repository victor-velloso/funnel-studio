/* fr-links-referencia.js -- REFERENCE (tested in referencias/harness-links/) for the upsell/downsell link control.
   WordPress-safe: no blank lines, no double-ampersand and no greater-than/less-than comparisons. Adapt it, but keep the behaviour.
   Usage: window.FR_OF = { page:"upsell"|"downsell", accept:"https://chk.eduzz.com/crl53eyv", decline:"/familia-oferta-2/" };
   Links on the page: anchors with data-fr-link="accept" or data-fr-link="decline" (real href as fallback).  */
(function(){
  var CFG = window.FR_OF || {};
  var VALID = ["casamento","filhos","oracao","financeiro"];
  var UTM = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_id"];
  /* IDs added at click time by the site's tracking (Track Hunter sck, track-cta fbclid). Keep only on the checkout. */
  var KEEP_IDS = ["sck","utm_sck","fbclid","gclid"];
  var DEFAULTS = { utm_source:"quiz", utm_medium:"funnel", utm_campaign:"familia-restaurada" };
  function normM(v){
    v = String(v || "").toLowerCase().replace(/^\s+|\s+$/g, "");
    try { v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch(e) {}
    return VALID.indexOf(v) === -1 ? "" : v;
  }
  function getM(){ try { return normM(new URLSearchParams(location.search).get("m")); } catch(e) { return ""; } }
  function hasUtm(o){ return !!(o.utm_source || o.utm_campaign); }
  function only(o){ var r = {}; UTM.forEach(function(k){ if (o[k]) { r[k] = String(o[k]); } }); return r; }
  function fromUrl(){ var r = {}; try { var p = new URLSearchParams(location.search); UTM.forEach(function(k){ var v = p.get(k); if (v) { r[k] = v; } }); } catch(e) {} return r; }
  function fromQuiz(){ try { var s = JSON.parse(localStorage.getItem("fr_state") || "{}"); return only(s.utms || {}); } catch(e) { return {}; } }
  function fromUtmify(){
    var r = {};
    try { UTM.forEach(function(k){ var v = localStorage.getItem(k); var ex = localStorage.getItem(k + "_exp"); if (v) { if (ex) { var left = new Date(ex).getTime() - Date.now(); if (left === Math.abs(left)) { r[k] = v; } } } }); } catch(e) {}
    return r;
  }
  function fromLegacy(){ try { return only(JSON.parse(localStorage.getItem("utm_data") || "{}")); } catch(e) { return {}; } }
  /* First source that has utm_source or utm_campaign wins, AS A SET (no mixing between sources). */
  function pickUtms(noDefaults){
    var srcs = [fromUrl(), fromQuiz(), fromUtmify(), fromLegacy()];
    for (var i = 0; i !== srcs.length; i++) { if (hasUtm(srcs[i])) { return srcs[i]; } }
    return noDefaults ? {} : DEFAULTS;
  }
  function build(kind, currentHref){
    var utms = pickUtms(false), u, k;
    if (kind === "accept") {
      u = new URL(CFG.accept);
      var cur = null; try { cur = new URL(currentHref, location.href); } catch(e) {}
      /* keep only the IDs that Track Hunter/track-cta put in the link; everything else (m, xcod, src, Eduzz junk) is dropped */
      if (cur) { KEEP_IDS.forEach(function(id){ var v = cur.searchParams.get(id); if (v) { u.searchParams.set(id, v); } }); }
      for (k in utms) { u.searchParams.set(k, utms[k]); }
      u.searchParams.set("u", "1");
      return u.toString();
    }
    u = new URL(CFG.decline, location.origin);
    var m = getM();
    if (CFG.page === "upsell") { if (m) { u.searchParams.set("m", m); } }
    for (k in utms) { u.searchParams.set(k, utms[k]); }
    return u.pathname + u.search;
  }
  function absHref(value){
    try { return new URL(value, location.href).toString(); } catch (e) { return String(value || ""); }
  }
  /* UTMify rewrites every <a> on a timer (2s, 3s, 5s, 9s) and would put utm_source=organic back.
     After each rewrite, put the clean URL back. The click still does not call preventDefault. */
  function writeHref(el){
    var next = build(el.getAttribute("data-fr-link"), el.href);
    if (absHref(el.href) === absHref(next)) { el.__frN = 0; return; }
    if (el.__frLast === next) { el.__frN = (el.__frN || 0) + 1; }
    else { el.__frLast = next; el.__frN = 1; }
    if (el.__frN > 3) return;
    el.setAttribute("href", next);
  }
  function watchHref(el){
    if (el.getAttribute("data-fr-watch")) return;
    el.setAttribute("data-fr-watch", "1");
    if (typeof MutationObserver !== "function") return;
    var obs = new MutationObserver(function(){ writeHref(el); });
    obs.observe(el, { attributes: true, attributeFilter: ["href"] });
  }
  function onActivate(e){
    var el = e.currentTarget;
    writeHref(el);
    /* Blocks ONLY the bubble to the document (inline utm_data script). Track Hunter and track-cta have
       already run in the capture phase. No preventDefault: the browser follows the href we just wrote (ctrl-click still works). */
    e.stopPropagation();
  }
  /* Remove the "m" that the global script wrote into utm_data (otherwise it leaks into every Eduzz link on the site for 90 days). */
  function repairStorage(){
    try {
      var raw = localStorage.getItem("utm_data"); if (!raw) { return; }
      var d = JSON.parse(raw); if (!d.hasOwnProperty("m")) { return; }
      delete d.m;
      if (!hasUtm(only(d))) { var best = pickUtms(true); for (var k in best) { d[k] = best[k]; } }
      var keys = Object.keys(d).filter(function(x){ return x !== "timestamp"; });
      if (keys.length === 0) { localStorage.removeItem("utm_data"); } else { localStorage.setItem("utm_data", JSON.stringify(d)); }
    } catch(e) {}
  }
  function bindAll(root){
    var els = (root || document).querySelectorAll("a[data-fr-link]");
    Array.prototype.forEach.call(els, function(el){
      writeHref(el);
      watchHref(el);
      if (el.getAttribute("data-fr-bound")) { return; }
      el.setAttribute("data-fr-bound", "1");
      el.addEventListener("click", onActivate);
      el.addEventListener("auxclick", onActivate);
    });
  }
  window.FR_OF_LINKS = { build: build, pickUtms: pickUtms, getM: getM, bindAll: bindAll, repairStorage: repairStorage };
  repairStorage();
  bindAll(document);
})();
