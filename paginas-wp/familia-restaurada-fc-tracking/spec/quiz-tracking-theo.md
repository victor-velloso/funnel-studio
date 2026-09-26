# Gravação do quiz Família no Funnel Control

O widget em `https://www.ezeneterodrigues.com.br/quiz-familia/` e as páginas de upsell/downsell continuam no WordPress. Este trecho só avisa o Funnel Control de que uma pessoa passou por uma tela ou por uma oferta. Não manda nome, e-mail, WhatsApp nem sexo.

Endpoint (só grava, sem token na página):

`https://funnel-control.vercel.app/api/track/quiz`

Origens aceitas: `https://www.ezeneterodrigues.com.br` e `https://ezeneterodrigues.com.br`.

Áreas, no mesmo código de letra que o quiz já usa:

| Letra | Área no payload |
|---|---|
| C | casamento |
| F | filhos |
| O | oracao |
| D | financeiro |

`step` nulo e `page` nula entram na deduplicação como vazio. O mesmo visitante não grava duas vezes o mesmo evento na mesma tela. View de upsell e view de downsell são as duas, porque a página entra na chave.

## Quiz — colar junto da `track()` que já existe

O `visitor_id` fica em `S.vid`, dentro do `fr_state` que o quiz já persiste. Gere uma vez.

```javascript
var FC_TRACK = "https://funnel-control.vercel.app/api/track/quiz";
var FC_AREA = { C: "casamento", F: "filhos", O: "oracao", D: "financeiro" };
function fcVid() {
  if (!S.vid) {
    S.vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("fc" + Math.random().toString(36).slice(2) + Date.now().toString(36));
    persist();
  }
  return S.vid;
}
function fcSend(body) {
  var payload = JSON.stringify(body);
  try {
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon(FC_TRACK, blob)) return;
    }
  } catch (e) {}
  try {
    fetch(FC_TRACK, { method: "POST", mode: "cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: payload, keepalive: true }).catch(function () {});
  } catch (e2) {}
}
function fcTrack(ev, data) {
  var d = data || {};
  var step = ev.indexOf("step_") === 0 ? ev.slice(5) : null;
  var hist = S.history || [];
  var prev = step && hist.length >= 2 ? hist[hist.length - 2] : null;
  var utm = S.utms || {};
  var area = d.area ? (FC_AREA[d.area] || null) : null;
  fcSend({
    funnel: "familia",
    visitor_id: fcVid(),
    event: ev,
    step: step,
    prev_step: prev,
    step_index: typeof d.step_index === "number" ? d.step_index : null,
    area: area,
    situacao: typeof d.situacao === "string" ? d.situacao : null,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    utm_content: utm.utm_content || null,
    utm_term: utm.utm_term || null,
    fbclid: utm.fbclid || null
  });
}
```

No fim da `track(ev, data)` que já faz dataLayer, pixel e gtag, acrescentar só isto (não enviar `data` inteiro: ele pode ter sexo ou outro campo):

```javascript
function track(ev, data) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: "quiz_" + ev }, data || {}));
    if (typeof fbq === "function") { fbq("trackCustom", "Quiz_" + ev, data || {}); }
    if (typeof gtag === "function") { gtag("event", "quiz_" + ev, data || {}); }
    if (window.posthog && window.posthog.capture) { window.posthog.capture("quiz_" + ev, data || {}); }
  } catch (e) {}
  try { fcTrack(ev, data); } catch (e2) {}
}
```

`next()` já grava `step_<tela>` da tela de destino, e o histórico tem a tela anterior. A abertura (`t01-abertura`) hoje não dispara `step_`. No `boot`, depois de `render(); track("view");`, acrescentar a tela em que a pessoa está:

```javascript
render();
track("view");
try { var aberto = cur(); track("step_" + aberto.st.name, { step_index: aberto.i }); } catch (e) {}
```

Eventos que o Funnel Control aceita deste quiz: `view`, `start`, `step_<t01…t41>`, `lead`, `resultado_visto`, `pitch_visto`, `checkout_click`. `clique_print`, `arma_vista` e os outros continuam no pixel; a API recusa o que está fora da lista.

`situacao` tem de ser o código curto (`C1`, `$1`), que já é `r.sit`. Não mandar o título.

## Upsell e downsell — colar na `track(ev)` da página

As duas páginas usam a mesma função. `CFG.page` já é `"upsell"` ou `"downsell"`. O `?m=` já está em `data-m`. O `visitor_id` é o mesmo `fr_state` do quiz, quando o navegador é o mesmo. Se não existir, cria um e grava só o `vid`, sem apagar o resto.

```javascript
var FC_TRACK = "https://funnel-control.vercel.app/api/track/quiz";
var FC_AREAS = { casamento: "casamento", filhos: "filhos", oracao: "oracao", financeiro: "financeiro" };
function fcState() {
  try { return JSON.parse(localStorage.getItem("fr_state") || "{}") || {}; } catch (e) { return {}; }
}
function fcVid() {
  var s = fcState();
  if (!s.vid) {
    s.vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("fc" + Math.random().toString(36).slice(2) + Date.now().toString(36));
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
  try {
    fetch(FC_TRACK, { method: "POST", mode: "cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: payload, keepalive: true }).catch(function () {});
  } catch (e2) {}
}
function track(ev) {
  var root = document.getElementById("fr-oferta");
  var m = root ? root.getAttribute("data-m") : "";
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: ev, page: CFG.page, m: m });
  } catch (e) {}
  try {
    if (typeof window.fbq === "function") window.fbq("trackCustom", ev, { page: CFG.page, m: m });
  } catch (e2) {}
  try {
    fcSend({
      funnel: "familia",
      visitor_id: fcVid(),
      event: ev,
      page: CFG.page,
      area: FC_AREAS[m] || null
    });
  } catch (e3) {}
}
```

Eventos desta página: `fr_oferta_view`, `fr_oferta_accept`, `fr_oferta_decline`. Quem pagou no Pix não passa pelo upsell de um clique; essa ausência não vira número.

## Como testar

1. Abrir o quiz com `?utm_content=FR%20-%20AD02%7C120249352071220585&utm_source=quiz` e clicar numa opção da primeira tela.
2. No DevTools, a requisição para `/api/track/quiz` deve ser POST `text/plain`, status 200, corpo `{ "ok": true }`. O segundo load do mesmo evento responde `{ "ok": true, "duplicado": true }`.
3. Um POST com `nome` ou `email` responde 400 `{ "ok": false, "error": "dado_pessoal" }` e nada disso é gravado.
4. No Funnel Control, a aba Visão do funil Família passa a mostrar pessoas por tela. Antes do trecho no ar, a etapa fica "sem dado ainda". A divisão das quatro ofertas, se já houver venda, aparece rotulada como venda do front na Eduzz.

Payload mínimo de uma tela:

```json
{
  "funnel": "familia",
  "visitor_id": "11111111-1111-4111-8111-111111111111",
  "event": "step_t34-captura",
  "step": "t34-captura",
  "prev_step": "t33-loading",
  "step_index": 30,
  "area": "casamento",
  "situacao": "C1",
  "utm_source": "quiz",
  "utm_medium": "funnel",
  "utm_campaign": "familia-restaurada",
  "utm_content": "FR - AD02|120249352071220585",
  "utm_term": null,
  "fbclid": null
}
```

O `ad_id` não vai no JSON: a API corta `utm_content` no primeiro `::` e lê os dígitos depois de `|`. UTM longo ou com `& = ? # ! ,` não rejeita o evento: o campo é truncado (UTM em 300 caracteres, `fbclid` em 512) ou descartado se parecer e-mail. Nome, e-mail e telefone em campo próprio continuam rejeitando o evento inteiro.
