(function (window, document, navigator) {
  'use strict';

  // Snippet instalado 2x (tema + plugin é erro comum de WordPress/GTM) rodaria
  // este arquivo inteiro de novo: dois listeners de clique, cada evento em
  // dobro. `window.th` não serve de guarda — o loader já o define como stub
  // antes deste script carregar.
  if (window.__thPixel) return;
  window.__thPixel = 1;

  var DEFAULT_ENDPOINT = 'https://pixel.trackhunter.com.br/collect';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return (
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 11) +
      Math.random().toString(36).slice(2, 11)
    );
  }

  function getBrowserId() {
    try {
      var id = localStorage.getItem('th_bid');
      if (!id) {
        id = uuid();
        localStorage.setItem('th_bid', id);
      }
      return id;
    } catch (e) {
      return '';
    }
  }

  function getSessionId() {
    try {
      var id = sessionStorage.getItem('th_sid');
      if (!id) {
        id = uuid();
        sessionStorage.setItem('th_sid', id);
      }
      return id;
    } catch (e) {
      return '';
    }
  }

  function getDeviceType() {
    var ua = navigator.userAgent.toLowerCase();
    if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowserFamily() {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\/|Opera/.test(ua)) return 'Opera';
    if (/Chrome\//.test(ua)) return 'Chrome';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Unknown';
  }

  function getBrowserVersion() {
    var ua = navigator.userAgent;
    var match =
      ua.match(/(?:Edg|OPR|Firefox|Chrome|Version)\/([\d.]+)/) ||
      ua.match(/Safari\/([\d.]+)/);
    return match ? match[1] : '';
  }

  function getConnectionType() {
    var c =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    return c && c.effectiveType ? c.effectiveType : '';
  }

  function hasTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 1 : 0;
  }

  // Parâmetros de tracking (UTMs + click IDs) que devem sobreviver a uma
  // troca de URL. fbp/fbc vêm de cookie, então não entram aqui.
  var TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'utm_src', 'utm_sck', 'src', 'sck',
    'fbclid', 'gclid', 'gbraid'
  ];
  // Params que podem ser ESCRITOS de volta na barra de endereços. É um
  // subconjunto de TRACKING_PARAMS: o `sck` fica de fora de propósito.
  //
  // O `sck` é a chave do sck-store (identidade de browser: fbp/fbc/ip/UA que o
  // capi-sender reidrata na compra). Refletido na URL, ele vazava por link
  // compartilhado, print e Referer — e quem tem o sck de alguém consegue
  // sobrescrever a identidade daquela compra. Continua sendo LIDO da URL
  // (persistTracking, só no formato do nosso token — ver SCK_TOKEN_RE) e
  // PROPAGADO para os links de checkout (decorateUrl): só deixa de ser exibido.
  var URL_REFLECT_PARAMS = TRACKING_PARAMS.filter(function (p) {
    return p !== 'sck' && p !== 'utm_sck';
  });
  var SS_TRACKING = 'th_track';

  function setCookie(name, value, days) {
    try {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      document.cookie =
        name +
        '=' +
        encodeURIComponent(value) +
        ';expires=' +
        d.toUTCString() +
        ';path=/;SameSite=Lax';
    } catch (e) {}
  }

  // _fbp: id de browser do Facebook. Normalmente criado pelo fbevents.js; se a
  // página não tem o Meta Pixel, geramos e persistimos um (formato fb.1.<ts>.<rand>)
  // pra CAPI ter o sinal. Consistente por browser via cookie.
  function ensureFbp() {
    var v = getCookie('_fbp');
    if (v) return v;
    v = 'fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1e16);
    setCookie('_fbp', v, 90);
    return v;
  }

  // _fbc: derivado do fbclid (fb.1.<ts>.<fbclid>). Se o cookie já existe (fbevents),
  // usa; senão, monta a partir do fbclid da URL. Sem fbclid, retorna vazio.
  function ensureFbc(fbclid) {
    var v = getCookie('_fbc');
    if (v) return v;
    if (!fbclid) return '';
    v = 'fb.1.' + Date.now() + '.' + fbclid;
    setCookie('_fbc', v, 90);
    return v;
  }

  // Captura os params de tracking da URL atual e mescla com os já guardados
  // na sessão (URL atual tem prioridade). Retorna o conjunto acumulado.
  function persistTracking() {
    var params = new URLSearchParams(window.location.search);
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(SS_TRACKING) || '{}') || {};
    } catch (e) {}
    var changed = false;
    for (var i = 0; i < TRACKING_PARAMS.length; i++) {
      var k = TRACKING_PARAMS[i];
      var v = params.get(k);
      if (!v) continue;
      // sck/utm_sck da URL só entram no formato do nosso token — valor legível
      // é rótulo de campanha do cliente e não pode virar chave de sessão
      // (ver SCK_TOKEN_RE).
      if ((k === 'sck' || k === 'utm_sck') && !isSckToken(v)) continue;
      stored[k] = v;
      changed = true;
    }
    if (changed) {
      try {
        sessionStorage.setItem(SS_TRACKING, JSON.stringify(stored));
      } catch (e) {}
    }
    return stored;
  }

  var SCK_STORAGE = 'th_sck';

  // Só aceitamos como `sck` o formato que nós mesmos geramos (uuid hex
  // agrupado). O sck é chave de sessão ÚNICA por browser: é por ele que o
  // sck-store guarda fbp/fbc/ip e que a venda do webhook casa com a sessão do
  // pixel. Valor legível (?sck=perpetuo_quente) é rótulo de campanha do
  // cliente, compartilhado por milhares de visitantes — aceito como chave,
  // todos os cliques sobrescreveriam o MESMO doc do sck-store e a compra
  // reidrataria a identidade de outra pessoa. Rótulo de cliente pertence ao
  // xcod/UTMs, nunca ao sck.
  var SCK_TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  function isSckToken(v) {
    return !!v && SCK_TOKEN_RE.test(v);
  }

  // Gera um sck novo SEMPRE no formato do token: o uuid() genérico tem um
  // fallback base36 que não passa no SCK_TOKEN_RE e faria o sck ser rejeitado
  // e regenerado a cada pageload em browsers sem crypto.randomUUID.
  function sckToken() {
    var v = uuid();
    if (isSckToken(v)) return v;
    var hex = '';
    for (var i = 0; i < 32; i++) {
      hex += Math.floor(Math.random() * 16).toString(16);
    }
    return (
      hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) +
      '-' + hex.slice(16, 20) + '-' + hex.slice(20)
    );
  }

  // Garante um `sck` permanente: se a URL/sessão já trouxe um NO NOSSO FORMATO,
  // ele vence e é persistido (continuidade entre páginas); senão reaproveita o
  // já gerado (localStorage/cookie); senão gera um novo. Fica disponível em
  // `stored` p/ decorar links e no payload, e num cookie p/ o backend ler
  // server-side. Valores fora do formato são descartados em TODAS as fontes —
  // inclusive localStorage/cookie, onde um rótulo de cliente pode ter ficado
  // persistido por até 365 dias antes deste filtro existir.
  function ensureSck(stored) {
    if (stored.utm_sck && !isSckToken(stored.utm_sck)) delete stored.utm_sck;
    // Escolha token-a-token, nunca `sck || utm_sck` cru: um rótulo legado
    // persistido em stored.sck (bundle antigo) sombrearia um token válido
    // vindo em utm_sck e descartaria a continuidade da sessão.
    var sck = '';
    if (isSckToken(stored.sck)) sck = stored.sck;
    else if (isSckToken(stored.utm_sck)) sck = stored.utm_sck;
    if (!sck) {
      try {
        sck = localStorage.getItem(SCK_STORAGE) || '';
      } catch (e) {}
      if (!isSckToken(sck)) sck = getCookie(SCK_STORAGE);
      if (!isSckToken(sck)) sck = sckToken();
    }
    stored.sck = sck;
    try {
      localStorage.setItem(SCK_STORAGE, sck);
    } catch (e) {}
    setCookie(SCK_STORAGE, sck, 365);
    try {
      sessionStorage.setItem(SS_TRACKING, JSON.stringify(stored));
    } catch (e) {}
    return stored;
  }

  // Refs nativas guardadas antes do hook, p/ reescrever a URL sem recursão.
  var nativePushState = window.history && window.history.pushState;
  var nativeReplaceState = window.history && window.history.replaceState;

  // Reescreve a URL atual (replaceState) p/ que os UTMs guardados fiquem
  // visíveis na barra e sobrevivam a refresh/compartilhamento da URL.
  // ⛔ O `sck` NÃO entra aqui — ver URL_REFLECT_PARAMS.
  function applyTrackingToUrl(stored) {
    if (!nativeReplaceState) return;
    var u;
    try {
      u = new URL(window.location.href);
    } catch (e) {
      return;
    }
    var changed = false;
    for (var i = 0; i < URL_REFLECT_PARAMS.length; i++) {
      var k = URL_REFLECT_PARAMS[i];
      if (stored[k] && !u.searchParams.get(k)) {
        u.searchParams.set(k, stored[k]);
        changed = true;
      }
    }
    if (!changed) return;
    try {
      nativeReplaceState.call(window.history, window.history.state, '', u.toString());
    } catch (e) {}
  }

  function onUrlChange() {
    applyTrackingToUrl(ensureSck(persistTracking()));
  }

  // Intercepta navegação SPA (push/replaceState) + voltar/avançar p/ reaplicar
  // os params de tracking a cada troca de URL.
  function hookHistory() {
    if (!nativePushState || !nativeReplaceState) return;
    window.history.pushState = function () {
      var ret = nativePushState.apply(window.history, arguments);
      onUrlChange();
      return ret;
    };
    window.history.replaceState = function () {
      var ret = nativeReplaceState.apply(window.history, arguments);
      onUrlChange();
      return ret;
    };
    window.addEventListener('popstate', onUrlChange);
    window.addEventListener('hashchange', onUrlChange);
  }

  // Hosts de checkout das plataformas suportadas. Match por substring no
  // hostname (cobre subdomínios: pay., checkout., go., app., seguro. etc.).
  // Clique num link pra um desses dispara InitiateCheckout e o sck é propagado.
  var CHECKOUT_HOSTS = [
    'hub.la',          // Hubla
    'kiwify.com',      // Kiwify (.com / .com.br)
    'mycartpanda.com', // CartPanda
    'cartpanda',       // CartPanda (domínios alternativos)
    'kirvano.com',     // Kirvano
    'ticto.app',       // Ticto
    'ticto.com',       // Ticto
    'onprofit',        // OnProfit
    'shop.tiktok',     // TikTok Shop
    'eduzz.com',       // Eduzz
    'cakto.com',       // Cakto
    'lastlink.com',    // Lastlink
    'payt.com',        // Payt
    'perfectpay.com',  // PerfectPay
    'b4you.com',       // B4You
    'hotmart.com',     // Hotmart
    'pagtrust',        // PagTrust
    'ephra'            // Ephra Finance
  ];

  // Players de vídeo (vturb e afins) embutidos via <iframe>. Decoramos o src
  // pra que o sck/UTMs cheguem ao player e sigam até o checkout que ele abre.
  var PLAYER_HOSTS = ['vturb', 'converteai', 'pandavideo'];

  function hostnameOf(href) {
    try {
      return new URL(href, window.location.href).hostname.toLowerCase();
    } catch (e) {
      return '';
    }
  }

  function matchesAny(host, list) {
    if (!host) return false;
    for (var i = 0; i < list.length; i++) {
      if (host.indexOf(list[i]) !== -1) return true;
    }
    return false;
  }

  function isCheckoutHost(host) {
    return matchesAny(host, CHECKOUT_HOSTS);
  }

  // A palavra "checkout" no host ou no CAMINHO da URL também conta como
  // checkout — cobre plataforma que ainda não está na lista (o caso Ephra:
  // eventos saíam sem identidade de browser porque o clique nunca virava IC).
  // A query string fica de fora de propósito: um `?next=/checkout` em página
  // de login dispararia IC falso. A lista continua existindo porque nem todo
  // checkout usa a palavra (hub.la, ticto.app, kiwify...).
  function isCheckoutUrl(href) {
    var u;
    try {
      u = new URL(href, window.location.href);
    } catch (e) {
      return false;
    }
    var host = u.hostname.toLowerCase();
    if (isCheckoutHost(host)) return true;
    return (host + u.pathname.toLowerCase()).indexOf('checkout') !== -1;
  }

  // true se o link aponta pra um host diferente do atual (link externo).
  function isExternalLink(href) {
    var host = hostnameOf(href);
    return !!host && host !== window.location.hostname.toLowerCase();
  }

  // Dispara InitiateCheckout no máximo uma vez por host de checkout por
  // pageload — evita refire em múltiplos cliques, mas registra a intenção.
  var icFired = {};
  function fireInitiateCheckout(host) {
    if (!host || icFired[host]) return;
    icFired[host] = 1;
    // ⛔ `InitiateCheckout` sai SEM customData: ele é espelhado na Meta e o
    // espelho repassa o customData inteiro para a conta do cliente.
    send('InitiateCheckout');
    // ⭐ Em que ponto do vídeo a pessoa clicou em comprar. Vai num `Engagement`
    // separado justamente por causa do espelho acima. Casa com o
    // InitiateCheckout pelo `session_id`, que os dois já carregam.
    //
    // É o que responde "qual minuto vende" — o relatório mais caro do painel da
    // VTurb — só que com o NOSSO faturamento em vez da atribuição deles.
    var pos = posicaoDoVideo();
    if (pos) {
      send('Engagement', {
        kind: 'video_at_checkout',
        seconds: pos.seconds,
        duration: pos.duration,
        percent: pos.percent
      });
    }
  }

  // Anexa os params de tracking guardados ao href, sem sobrescrever os que o
  // link já traz — com UMA exceção: em link de CHECKOUT, um `sck` presente que
  // NÃO é token nosso (rótulo hardcoded no botão de compra) é SUBSTITUÍDO pelo
  // token. O rótulo não existe no sck-store e mataria a atribuição e a
  // reidratação da CAPI daquela venda — e é justamente a prática do cliente
  // que rastreia por sck. Retorna a nova URL (ou a original, se nada mudou).
  function decorateUrl(href, stored) {
    var u;
    try {
      u = new URL(href, window.location.href);
    } catch (e) {
      return href;
    }
    var checkout = isCheckoutUrl(u.href);
    for (var i = 0; i < TRACKING_PARAMS.length; i++) {
      var k = TRACKING_PARAMS[i];
      if (!stored[k]) continue;
      var atual = u.searchParams.get(k);
      if (!atual) {
        u.searchParams.set(k, stored[k]);
      } else if (checkout && (k === 'sck' || k === 'utm_sck') && !isSckToken(atual)) {
        u.searchParams.set(k, stored[k]);
      }
    }
    return u.toString();
  }

  // Seletores de botões que avançam pro checkout mas NÃO são <a href> (SPAs de
  // funil). Clique aqui dispara InitiateCheckout antes do redirect — o
  // sendBeacon garante a entrega mesmo saindo da página.
  var CHECKOUT_TRIGGER_SELECTOR = '.pagtrust-funnel-next-step';

  function onLinkClick(e) {
    // Botão de avançar do funil (ex.: PagTrust): o alvo pode ser o próprio
    // elemento ou um descendente — closest() cobre os dois.
    var t = e.target;
    if (t && t.closest && t.closest(CHECKOUT_TRIGGER_SELECTOR)) {
      fireInitiateCheckout('funnel-next-step');
    }
    var el = e.target;
    while (el && el.nodeName !== 'A') el = el.parentNode;
    if (!el || !el.href || !isExternalLink(el.href)) return;
    // ensureSck: o link de checkout PRECISA sair com o token (é ele que volta
    // no webhook), mesmo se o sessionStorage estiver indisponível.
    var newHref = decorateUrl(el.href, ensureSck(persistTracking()));
    if (newHref !== el.href) el.href = newHref;
    // Link de checkout: registra a intenção de compra (e o collector guarda a
    // identidade de browser por sck pra reidratar o Purchase na CAPI).
    if (isCheckoutUrl(newHref)) {
      fireInitiateCheckout(hostnameOf(newHref));
    }
  }

  // Delegação no capture: pega cliques (esquerdo e meio) em qualquer <a>,
  // inclusive os inseridos dinamicamente, antes da navegação acontecer.
  function hookOutboundLinks() {
    document.addEventListener('click', onLinkClick, true);
    document.addEventListener('auxclick', onLinkClick, true);
  }

  // Decora o src de <iframe>s de checkout/player (vturb) com sck+UTMs, sem
  // sobrescrever params já presentes. Cross-origin: só conseguimos reescrever o
  // src (não o DOM interno), então isso só ajuda players que repassam a query.
  function decorateIframes(stored) {
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute('src');
      if (!src) continue;
      var host = hostnameOf(src);
      if (!isCheckoutUrl(src) && !matchesAny(host, PLAYER_HOSTS)) continue;
      var nu = decorateUrl(src, stored);
      if (nu !== src) frames[i].setAttribute('src', nu);
    }
  }

  // vturb e checkouts costumam injetar o iframe depois do load. Reaplica a
  // decoração quando novos nós entram no DOM (debounce via rAF/timeout).
  function watchIframes() {
    decorateIframes(ensureSck(persistTracking()));
    if (typeof MutationObserver !== 'function') return;
    var scheduled = false;
    var obs = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      var run = function () {
        scheduled = false;
        decorateIframes(ensureSck(persistTracking()));
      };
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      else setTimeout(run, 200);
    });
    obs.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  // ── Lead: dispara no submit de formulários (opt-in / captura de e-mail).
  // Por padrão qualquer <form> conta; pule um form com data-th-ignore, ou
  // restrinja via window.thLeadSelector (CSS selector). Dedup: 1x por página.
  var leadFired = false;
  function onSubmit(e) {
    if (leadFired) return;
    var form = e.target;
    if (!form || form.nodeName !== 'FORM') return;
    if (form.getAttribute('data-th-ignore') !== null) return;
    var sel = window.thLeadSelector;
    if (sel) {
      try {
        if (!form.matches(sel)) return;
      } catch (e2) {}
    }
    leadFired = true;
    send('Lead');
  }
  function hookLeads() {
    if (window.thLeadEvents === false) return;
    document.addEventListener('submit', onSubmit, true);
  }

  // ── Engajamento: marca público qualificado. Dispara o evento custom
  // 'Engagement' ao atingir % de scroll (window.thScrollDepths, default [75])
  // e/ou segundos na página (window.thTimeOnPage, default [30]). 1x por marco.
  function hookEngagement() {
    if (window.thEngagementEvents === false) return;
    var scrollMarks = window.thScrollDepths || [75];
    var timeMarks = window.thTimeOnPage || [30];
    var doneScroll = {};
    var doneTime = {};

    if (scrollMarks && scrollMarks.length) {
      var onScroll = function () {
        var doc = document.documentElement || {};
        var body = document.body || {};
        var top = window.pageYOffset || doc.scrollTop || 0;
        var max =
          (doc.scrollHeight || body.scrollHeight || 0) -
          (window.innerHeight || doc.clientHeight || 0);
        var pct = max > 0 ? Math.round((top / max) * 100) : 100;
        for (var i = 0; i < scrollMarks.length; i++) {
          var m = scrollMarks[i];
          if (pct >= m && !doneScroll[m]) {
            doneScroll[m] = 1;
            send('Engagement', { kind: 'scroll', value: m });
          }
        }
      };
      try {
        window.addEventListener('scroll', onScroll, { passive: true });
      } catch (e3) {
        window.addEventListener('scroll', onScroll, false);
      }
      onScroll();
    }

    for (var j = 0; j < timeMarks.length; j++) {
      (function (secs) {
        setTimeout(function () {
          if (doneTime[secs]) return;
          doneTime[secs] = 1;
          send('Engagement', { kind: 'time', seconds: secs });
        }, secs * 1000);
      })(timeMarks[j]);
    }
  }

  // ⛔ TODO SINAL NOVO DE VÍDEO VAI POR `Engagement`, NUNCA no payload de
  // `ViewContent` ou `InitiateCheckout`.
  //
  // Esses dois são ESPELHADOS no pixel da Meta do cliente, e o espelho repassa o
  // customData inteiro: `fbq('track', eventType, customData || {}, ...)` (ver
  // `metaMirror`). Pendurar diagnóstico nosso neles despeja campo interno na
  // conta de anúncio do cliente. `Engagement` não está em `META_MIRROR_EVENTS`,
  // então fica só com a gente.

  // Vídeo "principal" da página: o mais adiantado no momento. Existe para o
  // clique de compra poder carimbar EM QUE PONTO do vídeo a pessoa estava —
  // é o que responde "qual minuto vende" com o nosso faturamento, em vez do
  // relatório equivalente da VTurb, que só sabe do lado dela.
  var videoPrincipal = null;

  /**
   * Posição de UM elemento de vídeo, ou null se ele não tem duração utilizável.
   *
   * ⛔ Evento que acontece NUM vídeo (ended, seek, unmute) tem de reportar a
   * posição DAQUELE vídeo, não a do principal. A primeira versão usava sempre o
   * principal e produziu, em produção, um `video_ended` com
   * `{duration: 0, seconds: 0, percent: 100}` — duração zero com 100% assistido,
   * que é impossível. A página tinha um vídeo de fração de segundo que venceu a
   * eleição enquanto a VSL ainda estava em currentTime = 0, e o `ended` da VSL
   * saiu carimbado com a posição do outro.
   */
  /**
   * Piso para um `<video>` contar como CONTEUDO.
   *
   * ⚠️ Medido em producao (25/08): paginas de VSL reais tem elementos `<video>`
   * de fracao de segundo — loop de previa do player, decoracao. Eles disparavam
   * `ended`/`exit` com `{duration: 0, seconds: 0, percent: 100}`, porque
   * `Math.round(0.9)` e 0 e `0.5/0.9` e 56%. Sinal de decoracao, nao de VSL.
   *
   * O defeito e mais VELHO que os sinais novos: o `VideoProgress` ja contava
   * esses elementos, que cruzam qualquer marco no primeiro tick. Parte dos
   * 13.509 VideoProgress de 90 dias e decoracao.
   *
   * 3s e folgado para excluir decoracao e baixo para nao descartar depoimento
   * curto legitimo.
   */
  var VIDEO_MIN_S = 3;

  function ehConteudo(t) {
    return !!t && t.duration >= VIDEO_MIN_S;
  }

  function posicaoDe(t) {
    if (!ehConteudo(t)) return null;
    return {
      seconds: Math.round(t.currentTime),
      duration: Math.round(t.duration),
      percent: Math.round((t.currentTime / t.duration) * 100)
    };
  }

  /**
   * Posição do vídeo principal. Só para eventos que NÃO nascem de um vídeo
   * específico: o clique de compra e a saída da página.
   */
  function posicaoDoVideo() {
    return posicaoDe(videoPrincipal);
  }

  // ── Vídeo (VSL): dispara ViewContent no play e VideoProgress nos marcos de %
  // assistido (window.thVideoMilestones, default [50]). Cobre o smartplayer
  // vturb/converteai (web component que renderiza um <video> na própria página,
  // inclusive em shadow DOM aberto) e, como fallback, players em <iframe> que
  // postam mensagens de play/progresso. Best-effort: players cross-origin sem
  // postMessage não são detectáveis. Desligue com window.thVideoEvents = false.
  function hookVideo() {
    if (window.thVideoEvents === false) return;
    var milestones = window.thVideoMilestones || [50];
    var viewFired = false;
    var donePct = {};
    var BOUND = '__thVid';
    // Flags por ELEMENTO (não por página): `FOTO` guarda muted/autoplay do
    // instante do play; `FEITO` marca que o `video_play` já saiu.
    var PLAY_FOTO = '__thPlayFoto';
    var PLAY_FEITO = '__thPlayFeito';

    /**
     * Registra o play e emite o `video_play` ASSIM QUE for possível.
     *
     * ⛔ Por que não emitir direto no `play`: em player HLS o `duration` muitas
     * vezes ainda NÃO chegou quando o `play` dispara, e `ehConteudo` (que exige
     * `duration >= 3`) devolve false. O evento se perdia — e se perdia
     * justamente em quem tem conexão LENTA, que é a população que mais
     * abandona. Medido em 27/08/2026: só 1.011 de 2.826 sessões (36%) tinham
     * `video_play`, e toda estatística sobre ele estava enviesada para o lado
     * otimista.
     *
     * ⛔ `muted` e `autoplay` são FOTOGRAFADOS no play, não na hora de emitir.
     * Entre o play e o primeiro `timeupdate` com duração o visitante pode ter
     * tirado o som — emitir com o valor de depois faria a taxa de autoplay mudo
     * medir o CONTRÁRIO do que aconteceu.
     */
    function registraPlay(t) {
      if (!t || t[PLAY_FEITO]) return;
      if (!t[PLAY_FOTO]) {
        t[PLAY_FOTO] = { muted: t.muted ? 1 : 0, autoplay: t.autoplay ? 1 : 0 };
      }
      // Ainda sem duração utilizável: fica pendente, o `onTimeUpdate` reemite.
      if (!ehConteudo(t)) return;
      t[PLAY_FEITO] = 1;
      // ⚠️ VSL costuma dar autoplay MUDO, e aí o play mede o navegador, não a
      // pessoa. Sem `muted` a taxa de play nasce inflada e ninguém percebe,
      // porque o número existe e parece plausível.
      send('Engagement', {
        kind: 'video_play',
        muted: t[PLAY_FOTO].muted,
        autoplay: t[PLAY_FOTO].autoplay
      });
    }

    function fireView(ev) {
      var t = ev && ev.target;
      // ⛔ O `video_play` é por VÍDEO; o `ViewContent` é por PÁGINA. Registrar
      // ANTES do return: com o return primeiro, o segundo vídeo da página nunca
      // produzia play, porque o `viewFired` já estava marcado pelo primeiro.
      registraPlay(t);
      if (viewFired) return;
      viewFired = true;
      // ⛔ `ViewContent` continua SEM customData e SEM o piso de conteúdo: ele é
      // espelhado na Meta, e mudar o volume dele mexeria no sinal da conta do
      // cliente. A diferença entre ele e o `video_play` é o que MEDE quanto do
      // play é decoração.
      send('ViewContent');
    }
    function fireProgress(pct, t) {
      for (var i = 0; i < milestones.length; i++) {
        var m = milestones[i];
        if (pct >= m && !donePct[m]) {
          donePct[m] = 1;
          // `percent` é o MARCO (estável, comparável entre vídeos); `seconds` e
          // `duration` são o instante real. Só o marco não compara uma VSL de 12
          // min com uma de 45, e o cálculo já tinha os dois em mãos.
          //
          // ⚠️ `t` é OPCIONAL: o fallback de <iframe> chama esta função só com a
          // porcentagem raspada do postMessage, sem elemento nenhum. Ali o
          // evento sai como sempre saiu, só sem seconds/duration.
          var dados = { percent: m };
          if (t && t.duration > 0) {
            dados.seconds = Math.round(t.currentTime);
            dados.duration = Math.round(t.duration);
          }
          send('VideoProgress', dados);
        }
      }
    }

    function onTimeUpdate(ev) {
      var t = ev.target;
      // Decoracao fica de fora aqui em cima: nao elege principal e nao cruza
      // marco. Video de fracao de segundo cruzaria QUALQUER marco no primeiro
      // tick, e o VideoProgress dele nao descreve nada.
      if (ehConteudo(t)) {
        // ⭐ Agora que a duração chegou, solta o `video_play` que ficou pendente.
        // ⛔ Só se houve play de verdade (`PLAY_FOTO` existe): `timeupdate`
        // também dispara em `seeking`, e emitir play sem play inventaria dado.
        if (t[PLAY_FOTO]) registraPlay(t);
        // Elege o vídeo principal pelo mais adiantado — página com dois players
        // (VSL + depoimento) senão carimbaria o errado no clique de compra.
        if (!videoPrincipal || t.currentTime > videoPrincipal.currentTime) {
          videoPrincipal = t;
        }
        fireProgress(Math.round((t.currentTime / t.duration) * 100), t);
      }
    }

    /** Sinal de vídeo, no máximo uma vez por elemento (`flag` marca o <video>). */
    function umaVezPorVideo(t, flag, kind, extra) {
      // Sem posicao utilizavel nao ha o que reportar: emitir so o `kind` gera
      // linha que parece dado e nao e.
      if (!ehConteudo(t) || t[flag]) return;
      t[flag] = 1;
      var dados = { kind: kind };
      // ⛔ `posicaoDe(t)` e NÃO `posicaoDoVideo()`: a posição é a DESTE vídeo,
      // que é o que o evento descreve. Ver o comentário em `posicaoDe`.
      var pos = posicaoDe(t);
      if (pos) {
        dados.seconds = pos.seconds;
        dados.duration = pos.duration;
        dados.percent = pos.percent;
      }
      if (extra) {
        for (var k in extra) {
          if (Object.prototype.hasOwnProperty.call(extra, k)) dados[k] = extra[k];
        }
      }
      send('Engagement', dados);
    }

    function onVolumeChange(ev) {
      var t = ev.target;
      // Só a transição mudo → com som interessa. Autoplay mudo é o padrão da
      // VSL; tirar o mudo é a pessoa DECIDINDO assistir, e é o sinal de intenção
      // mais forte que uma página de vendas produz.
      if (!t || t.muted) return;
      umaVezPorVideo(t, '__thUnmute', 'video_unmute');
    }
    function onEnded(ev) {
      // Terminar o vídeo e não comprar é um diagnóstico; abandonar aos 3 min é
      // outro. Sem isto os dois são a mesma linha.
      umaVezPorVideo(ev.target, '__thEnded', 'video_ended');
    }
    function onSeeking(ev) {
      // Quem pula pro fim é caçador de preço. Uma vez por vídeo de propósito:
      // `seeking` dispara em rajada enquanto a barra é arrastada.
      umaVezPorVideo(ev.target, '__thSeek', 'video_seek');
    }

    function bindVideos(root) {
      var vids;
      try {
        vids = root.querySelectorAll('video');
      } catch (e) {
        return;
      }
      for (var i = 0; i < vids.length; i++) {
        var v = vids[i];
        // ⛔ Com `renderRoot` no caminho, o `querySelectorAll('video')` deixa de
        // ser garantidamente do DOM: componente de terceiro pode expor um
        // `renderRoot` que devolve qualquer coisa. Sem esta guarda o TypeError
        // sobe por `rescan` → `hookVideo` e MATA o resto do carregamento — o
        // `iniciaEspelhoMeta` e o `send('PageView')` rodam DEPOIS dele.
        if (!v || typeof v.addEventListener !== 'function') continue;
        if (v[BOUND]) continue;
        v[BOUND] = 1;
        v.addEventListener('play', fireView, true);
        v.addEventListener('playing', fireView, true);
        v.addEventListener('timeupdate', onTimeUpdate, true);
        v.addEventListener('volumechange', onVolumeChange, true);
        v.addEventListener('ended', onEnded, true);
        v.addEventListener('seeking', onSeeking, true);
      }
    }
    /**
     * Raiz interna de um elemento, INCLUINDO shadow fechado.
     *
     * ⛔ `shadowRoot` e `null` quando o shadow foi criado com `mode: 'closed'`,
     * e e exatamente o caso do player VTurb. Componente Lit guarda a MESMA raiz
     * em `renderRoot`, que continua acessivel de fora. Sem isto o scan nao
     * enxerga nada e o sinal de VSL nao existe.
     *
     * ⚠️ Medido em producao (26/08/2026, Chrome com perfil limpo): o `<video>`
     * da VSL fica em `document > VTURB-SMARTPLAYER > HLS-VIDEO`, DOIS niveis de
     * shadow fechado. O scan antigo achava ZERO video em
     * brunokraus.com.br e rianmedeiross.com; com `renderRoot` acha o elemento
     * certo, com `duration` de 1836s e 950s. O que sobrava no light DOM era so
     * o slot de preload (0,12s), que o piso de `ehConteudo` descarta.
     *
     * ⚠️ `renderRoot` de um componente nao-Lit pode ser qualquer coisa, entao
     * o `querySelectorAll` e conferido antes de devolver.
     */
    function raizInterna(el) {
      var r = el.shadowRoot || el.renderRoot;
      if (!r || r === el || typeof r.querySelectorAll !== 'function') return null;
      return r;
    }

    // Teto de profundidade: o VTurb usa 2. Seis e folgado e impede que uma
    // arvore patologica (ou um `renderRoot` que aponta para cima) prenda o laco.
    var SHADOW_MAX_PROF = 6;

    function scanShadow(root, prof, vistos) {
      if (prof > SHADOW_MAX_PROF) return;
      var all;
      try {
        all = root.querySelectorAll('*');
      } catch (e) {
        return;
      }
      for (var i = 0; i < all.length; i++) {
        var sub = raizInterna(all[i]);
        // `vistos` e por varredura, nao global: elemento novo tem de ser
        // reencontrado no proximo rescan. Serve so contra ciclo dentro de UMA
        // passada.
        if (!sub || vistos.indexOf(sub) !== -1) continue;
        vistos.push(sub);
        bindVideos(sub);
        scanShadow(sub, prof + 1, vistos);
      }
    }
    function rescan() {
      bindVideos(document);
      scanShadow(document, 0, []);
    }
    rescan();

    if (typeof MutationObserver === 'function') {
      var scheduled = false;
      var obs = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        var run = function () {
          scheduled = false;
          rescan();
        };
        if (window.requestAnimationFrame) window.requestAnimationFrame(run);
        else setTimeout(run, 300);
      });
      obs.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
      });
    }

    // ── Ponto de abandono. Hoje sabemos que passou de um marco; não sabemos
    // ONDE parou, que é a pergunta de quem edita a VSL.
    //
    // ⚠️ `pagehide` e não `beforeunload`: o segundo não é confiável no Safari
    // mobile, justamente onde a VSL é assistida. O `send` já usa `sendBeacon`
    // como caminho primário, que é o que sobrevive ao descarregamento — não
    // precisa de mecanismo novo.
    //
    // ⛔ NÃO trava depois do primeiro envio. `visibilitychange → hidden` dispara
    // em troca de aba, que não é abandono: travar ali gravaria o instante da
    // primeira troca de aba como "onde parou". A guarda é a posição ter
    // AVANÇADO, então o último evento da sessão é o abandono de verdade
    // (na leitura, `max(seconds)` por sessão).
    //
    // ⛔ E NÃO se resolve com um teto de N eventos: o teto cortaria os ÚLTIMOS,
    // que são exatamente o abandono real. A régua é o AVANÇO MÍNIMO —
    // troca de aba em rajada não gera evento, e o volume fica limitado a
    // `duração / 30` por sessão em vez de ilimitado.
    //
    // `pagehide` é saída de verdade e ignora o avanço mínimo: é a única
    // chance de carimbar a posição final com precisão. Onde ele não dispara
    // (Safari mobile), o `visibilitychange` garante ±30s do ponto real.
    var AVANCO_MIN_S = 30;
    var ultimaSaida = -1;
    function enviaSaida(forcado) {
      var pos = posicaoDoVideo();
      if (!pos) return;
      var minimo = forcado === true ? 1 : AVANCO_MIN_S;
      if (pos.seconds - ultimaSaida < minimo) return;
      ultimaSaida = pos.seconds;
      send('Engagement', {
        kind: 'video_exit',
        seconds: pos.seconds,
        duration: pos.duration,
        percent: pos.percent
      });
    }
    window.addEventListener(
      'pagehide',
      function () {
        enviaSaida(true);
      },
      true
    );
    document.addEventListener(
      'visibilitychange',
      function () {
        if (document.visibilityState === 'hidden') enviaSaida(false);
      },
      true
    );

    // Fallback: mensagens de players em <iframe> (origem de host de player).
    window.addEventListener('message', function (e) {
      var host = '';
      try {
        host = new URL(e.origin).hostname.toLowerCase();
      } catch (err) {}
      if (!matchesAny(host, PLAYER_HOSTS)) return;
      var str = typeof e.data === 'string' ? e.data : '';
      if (!str && e.data && typeof e.data === 'object') {
        try {
          str = JSON.stringify(e.data);
        } catch (e2) {}
      }
      if (/play|playing|start/i.test(str)) fireView();
      var pm = str.match(/(?:percent|progress|played)["':\s]+(\d{1,3})/i);
      if (pm) fireProgress(parseInt(pm[1], 10));
    });
  }

  function buildPayload(eventType, customData) {
    var params = new URLSearchParams(window.location.search);
    var stored = ensureSck(persistTracking());
    // Lê da URL; se faltar (ex.: navegação que limpou a query), cai no que
    // foi guardado na sessão.
    function p(name) {
      return params.get(name) || stored[name] || '';
    }

    var payload = {
      eventId: uuid(),
      eventType: eventType,
      pixelId: window.thPixelId || '',
      timestamp: Date.now(),
      session: {
        browserId: getBrowserId(),
        sessionId: getSessionId()
      },
      page: {
        url: window.location.href,
        title: document.title || '',
        referrer: document.referrer || '',
        queryParams: window.location.search || ''
      },
      utm: {
        source: p('utm_source'),
        medium: p('utm_medium'),
        campaign: p('utm_campaign'),
        term: p('utm_term'),
        content: p('utm_content'),
        src: p('utm_src') || p('src'),
        // Sempre o token garantido pelo ensureSck — nunca o valor cru da URL,
        // que pode ser rótulo de campanha do cliente (ver SCK_TOKEN_RE).
        sck: stored.sck
      },
      ads: {
        fbclid: p('fbclid'),
        fbp: ensureFbp(),
        fbc: ensureFbc(p('fbclid')),
        gclid: p('gclid'),
        gbraid: p('gbraid')
      },
      device: {
        type: getDeviceType(),
        browserFamily: getBrowserFamily(),
        browserVersion: getBrowserVersion(),
        connectionType: getConnectionType(),
        hasTouchCapability: hasTouch()
      }
    };

    if (customData && typeof customData === 'object') {
      payload.custom = customData;
    }

    return payload;
  }

  function endpoint() {
    return window.thEndpoint || DEFAULT_ENDPOINT;
  }

  // ─── Espelho no pixel da Meta ────────────────────────────────────────────
  //
  // O cliente instala só o NOSSO script, mas a Meta precisa dos eventos de topo
  // de funil para montar público de retargeting e alimentar a otimização. A CAPI
  // não cobre isso: ela envia Purchase/InitiateCheckout a partir do WEBHOOK da
  // plataforma, e nunca vê PageView. Então o pixel carrega o fbevents.js do
  // cliente e espelha nele os eventos de browser.
  //
  // É o desenho que a própria Meta recomenda: pixel no browser + CAPI no
  // servidor, deduplicados por `event_id`. Aqui o `eventID` é o MESMO `eventId`
  // que vai no nosso payload — então, no dia em que o servidor reforçar esses
  // eventos, a dedup já funciona sem mudar nada no browser.

  // Só eventos PADRÃO da Meta. `Engagement` e `VideoProgress` são conceitos
  // nossos: mandá-los como evento customizado polui a conta do cliente sem
  // ganho de otimização. `Purchase` fica de fora de propósito — ele acontece no
  // checkout da plataforma, fora desta página, e é responsabilidade da CAPI.
  //
  // Lista, não objeto: `eventType` vem de `th('track', X)` — entrada de terceiro.
  // Com objeto, `th('track','constructor')` acha `Object.prototype.constructor`,
  // passa no gate e dispara `fbq('track','constructor')` na conta do cliente.
  // Comparação exata contra uma lista não tem herança para escalar. É também a
  // lista canônica que o collector e o painel replicam — a ordem é a da UI.
  var META_MIRROR_EVENTS = ['PageView', 'ViewContent', 'Lead', 'InitiateCheckout', 'AddToCart'];

  // Teto de eventos bufferizados enquanto a config não resolve. `hookEngagement`
  // e `hookVideo` disparam sozinhos e o fetch pode nunca voltar.
  var META_BUFFER_MAX = 50;

  var metaPixelId = '';
  var metaResolved = false;
  var metaBuffer = [];
  // null = servidor não mandou config → tudo ligado. É a regra de opt-out que
  // as três camadas repetem: campo ausente liga tudo, só `=== false` desliga.
  var metaEventsCfg = null;

  function ehEventoEspelhavel(eventType) {
    for (var i = 0; i < META_MIRROR_EVENTS.length; i++) {
      if (META_MIRROR_EVENTS[i] === eventType) return true;
    }
    return false;
  }

  // Só é consultado com nome canônico (o teto estático já rodou), então não há
  // como uma chave de protótipo chegar aqui.
  function eventoHabilitado(eventType) {
    if (!metaEventsCfg) return true;
    return metaEventsCfg[eventType] !== false;
  }

  function algumEventoHabilitado() {
    for (var i = 0; i < META_MIRROR_EVENTS.length; i++) {
      if (eventoHabilitado(META_MIRROR_EVENTS[i])) return true;
    }
    return false;
  }

  // O cliente já tem o pixel da Meta na página? Então NÃO injetamos: dois `init`
  // no mesmo pixel fariam cada PageView contar duas vezes. A checagem roda no
  // momento da injeção (depois do fetch da config), não no load — assim damos o
  // máximo de tempo para o snippet dele aparecer, caso esteja abaixo do nosso.
  function jaTemPixelDaMeta() {
    if (window.fbq || window._fbq) return true;
    try {
      var s = document.getElementsByTagName('script');
      for (var i = 0; i < s.length; i++) {
        if (s[i].src && s[i].src.indexOf('connect.facebook.net') >= 0) return true;
      }
    } catch (e) {}
    return false;
  }

  function carregaFbevents() {
    /* eslint-disable */
    var n = (window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    var t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    var s = document.getElementsByTagName('script')[0];
    if (s && s.parentNode) s.parentNode.insertBefore(t, s);
    else document.head.appendChild(t);
    /* eslint-enable */
  }

  // ⚠️ O filtro por configuração vive AQUI, nunca no `send()`. O collector só
  // grava fbp/fbc/ip/browser_id no sck-store quando recebe um InitiateCheckout
  // (collector.go), e é isso que o capi-sender reidrata no Purchase. Suprimir o
  // POST derrubaria a qualidade de match de TODAS as compras do cliente —
  // inclusive as do caminho que ele não desligou.
  function metaMirror(eventType, eventId, customData) {
    if (window.thMetaMirror === false) return;
    // Teto estático ANTES do buffer: sem ele o buffer aceitaria o conjunto
    // aberto de `th('track', X)` e cresceria sem limite até a config resolver.
    if (!ehEventoEspelhavel(eventType)) return;
    if (!metaResolved) {
      if (metaBuffer.length < META_BUFFER_MAX) {
        metaBuffer.push([eventType, eventId, customData]);
      }
      return;
    }
    // O replay reentra por aqui, então o evento bufferizado antes do fetch (o
    // PageView automático é sempre esse caso) é julgado com a config já
    // resolvida. Pôr esta linha acima do buffer daria o mesmo resultado — o que
    // NÃO dá é subir o teto estático, que é o único limite do que entra ali.
    if (!eventoHabilitado(eventType)) return;
    if (!metaPixelId || !window.fbq) return;
    try {
      window.fbq('track', eventType, customData || {}, { eventID: eventId });
    } catch (e) {}
  }

  // Busca o meta_pixel_id do collector. Resposta vazia é o caso COMUM (dashboard
  // sem destino Meta vinculado) e é no-op silencioso, não erro.
  function iniciaEspelhoMeta() {
    if (window.thMetaMirror === false || !window.thPixelId || !window.fetch) {
      metaResolved = true;
      metaBuffer = [];
      return;
    }
    fetch(endpoint() + '?pixelId=' + encodeURIComponent(window.thPixelId), {
      method: 'GET',
      mode: 'cors'
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) {
        var id = cfg && cfg.metaPixelId;
        var ev = cfg && cfg.events;
        // Array também passa no typeof; cai no default de tudo-ligado, que é o
        // lado seguro para um payload malformado.
        if (ev && typeof ev === 'object') metaEventsCfg = ev;
        // Sem nenhum evento habilitado não injetamos: seriam 60 KB de fbevents
        // e um pixel conectado e mudo na conta do cliente.
        if (id && algumEventoHabilitado() && !jaTemPixelDaMeta()) {
          metaPixelId = id;
          carregaFbevents();
          window.fbq('init', id);
        }
      })
      ['catch'](function () {})
      .then(function () {
        metaResolved = true;
        for (var i = 0; i < metaBuffer.length; i++) {
          metaMirror(metaBuffer[i][0], metaBuffer[i][1], metaBuffer[i][2]);
        }
        metaBuffer = [];
      });
  }

  function send(eventType, customData) {
    if (!window.thPixelId) {
      if (window.console) console.warn('[trackhunter] window.thPixelId ausente — evento ignorado');
      return;
    }

    var payload = buildPayload(eventType, customData);
    // Mesmo eventId nos dois lados: é o que permite a Meta deduplicar se o
    // servidor um dia reforçar o mesmo evento.
    metaMirror(eventType, payload.eventId, customData);

    var body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(endpoint(), blob)) return;
      } catch (e) {
      }
    }

    if (window.fetch) {
      fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
        mode: 'cors'
      })['catch'](function () {});
    }
  }

  function handle(args) {
    var cmd = args[0];
    if (cmd === 'track') {
      send(args[1] || 'PageView', args[2]);
    } else if (cmd === 'init') {
      window.thPixelId = args[1];
    } else if (window.console) {
      console.warn('[trackhunter] comando desconhecido:', cmd);
    }
  }

  var queued = window.th && window.th.q ? window.th.q : [];

  window.th = function () {
    handle(arguments);
  };

  for (var i = 0; i < queued.length; i++) {
    handle(queued[i]);
  }

  // Captura/garante os params de tracking, reflete na URL atual e propaga
  // pros links de checkout e iframes de player.
  hookHistory();
  applyTrackingToUrl(ensureSck(persistTracking()));
  hookOutboundLinks();
  watchIframes();
  hookLeads();
  hookEngagement();
  hookVideo();
  // Antes do PageView: os eventos disparados enquanto a config não chega ficam
  // no buffer e são replayados quando ela resolve.
  iniciaEspelhoMeta();

  if (window.thAutoPageView !== false) {
    send('PageView');
  }
})(window, document, navigator);
