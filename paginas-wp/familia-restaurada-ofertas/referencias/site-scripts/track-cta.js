/**
 * InitiateCheckout no clique do CTA — Reset / Funnel Control
 *
 * Por que existe: o InitiateCheckout só disparava dentro do checkout da Eduzz
 * (outro domínio). Entre 03 e 05/09 a Meta registrou ~4x menos checkouts do que
 * os cliques no botão medidos pela VTurb, porque perdia (a) quem não carregava o
 * checkout e (b) quem ela não conseguia atribuir ao anúncio sem o fbclid.
 * Disparar no clique, no nosso domínio, mede o passo real do funil e devolve à
 * Meta um sinal de otimização muito mais completo.
 *
 * Como usar: incluir nas páginas de VSL, DEPOIS do snippet base do Pixel.
 *   <script src="https://funnel-control.vercel.app/track-cta.js" defer></script>
 *
 * Marcação: por padrão pega links para checkout (Eduzz/Sun) e qualquer elemento
 * com [data-cta] ou .cta. Para forçar, adicione data-cta no elemento.
 *
 * Seguro por construção: não dispara sem fbq, deduplica por clique, propaga o
 * fbclid para o checkout e nunca bloqueia a navegação do usuário.
 */
(function () {
  "use strict";

  var CHECKOUT_HOSTS = /(?:sun\.eduzz\.com|chk\.eduzz\.com|pay\.eduzz\.com|eduzz\.com\/checkout)/i;
  var CTA_SELECTOR = "[data-cta], .cta, a[href*='eduzz'], a[href*='checkout']";
  // Janela curta para não contar duplo o clique repetido no mesmo botão.
  var DEDUPE_MS = 1500;
  var lastFired = 0;

  function isCheckoutTarget(el) {
    if (el.hasAttribute("data-cta")) return true;
    var href = el.getAttribute("href") || "";
    return CHECKOUT_HOSTS.test(href) || /checkout/i.test(href);
  }

  /** Repassa o fbclid ao checkout para a Meta conseguir casar o evento com o anúncio. */
  function propagateClickId(el) {
    try {
      var fbclid = new URLSearchParams(window.location.search).get("fbclid");
      var href = el.getAttribute("href");
      if (!fbclid || !href || href.indexOf("fbclid=") !== -1) return;
      if (href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return;
      var url = new URL(href, window.location.href);
      if (!CHECKOUT_HOSTS.test(url.href) && !/checkout/i.test(url.href)) return;
      url.searchParams.set("fbclid", fbclid);
      el.setAttribute("href", url.toString());
    } catch (error) {
      // Nunca impedir o clique por causa de tracking.
    }
  }

  function onClick(event) {
    var el = event.target && event.target.closest ? event.target.closest(CTA_SELECTOR) : null;
    if (!el || !isCheckoutTarget(el)) return;

    propagateClickId(el);

    var now = Date.now();
    if (now - lastFired < DEDUPE_MS) return;
    lastFired = now;

    if (typeof window.fbq !== "function") return;
    // eventID permite deduplicar contra o InitiateCheckout do próprio checkout,
    // caso a Eduzz também dispare o evento para a mesma sessão.
    window.fbq("track", "InitiateCheckout", {}, {
      eventID: "ic-" + now + "-" + Math.random().toString(36).slice(2, 10),
    });
  }

  document.addEventListener("click", onClick, true);
})();
