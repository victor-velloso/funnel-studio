# Família Restaurada — rastreio no Funnel Control

Três páginas do funil Família (quiz, upsell e downsell) com o aviso ao endpoint `https://funnel-control.vercel.app/api/track/quiz`. O app Vite da raiz deste repositório não foi alterado.

`base/` é o código que está no ar, copiado byte a byte. Os três `.txt` nesta pasta são esse mesmo código com **somente** as linhas de rastreio acrescentadas. Não há linha removida, linha reescrita, nem linha em branco nova.

```bash
diff base/quiz-familia-codigo-para-colar.txt quiz-familia-codigo-para-colar.txt
diff base/familia-oferta-codigo-para-colar.txt familia-oferta-codigo-para-colar.txt
diff base/familia-oferta-2-codigo-para-colar.txt familia-oferta-2-codigo-para-colar.txt
```

Cada `diff` só tem linhas `>`.

A spec do endpoint está em `spec/quiz-tracking-theo.md`.

## O que entrou

**Quiz.** Depois da `track(ev, data)` que já manda dataLayer, pixel e gtag, o bloco `FC_TRACK` / `FC_AREA` / `fcVid` / `fcSend` / `fcTrack`. No fim dessa `track`, uma chamada `fcTrack(ev, data)`. No `boot`, logo abaixo de `render(); track("view");`, o `step_` da tela em que a pessoa já está.

**Ofertas (upsell e downsell, o mesmo acréscimo).** `FC_TRACK` / `FC_AREAS` / `fcState` / `fcVid` / `fcSend` imediatamente antes da `track(ev)`. No fim dessa `track`, o `fcSend` com `funnel`, `visitor_id`, `event`, `page` e `area`.

O Funnel Control recebe só os campos da spec. O objeto `data` inteiro não vai no payload. Nome, e-mail, telefone e sexo não entram.

## Adaptações em relação à spec

- **A (confirmada).** No quiz, `step && hist.length >= 2` virou `step && ge(hist.length, 2)`. O helper `ge` já existia: o wpautop do Elementor já tinha quebrado um `>=` numa publicação. O código novo do quiz não usa `>=` nem `<=`.
- **B (rejeitada).** `situacao` sai cru, o valor de `d.situacao` / `r.sit` (`C1`, `D1`, `D16`, `D11`, …). Não passa por `imgCode`.
- **C (confirmada).** Nas ofertas, o `visitor_id` não usa `&&`. Lê `window.crypto` e, se houver `randomUUID`, usa; senão fica o id `fc` + aleatório.
- **D (confirmada).** Nas ofertas, quando ainda não existe `fr_state`, o `setItem` não grava só `{vid}`. Antes de gravar, semeia `answers`, `history` e `lead` se faltarem, sem apagar o que já estava. O quiz ao vivo quebra se abrir um estado sem `answers`.

Nas ofertas, o código novo também não usa `<` nem `>` soltos. Não há linha em branco dentro dos `<script>`.

## sha256

Bases (iguais ao que está no ar):

| Arquivo | sha256 |
|---|---|
| `base/quiz-familia-codigo-para-colar.txt` | `61b5b4eefe752cbb039482b575d39fcf1e9913112c2ba2422d4aa191dd078d47` |
| `base/familia-oferta-codigo-para-colar.txt` | `6b5e5ad30e59ad61c5c0bf1013657bd3f0a7d06483a30185cfe9c0b84fa2531b` |
| `base/familia-oferta-2-codigo-para-colar.txt` | `ab3e793d301a6d9c3b4b42c09723fd447d151a734baeef563543371480b827e1` |

Arquivos para colar:

| Arquivo | sha256 |
|---|---|
| `quiz-familia-codigo-para-colar.txt` | `3146b8269c392b069769a3c053fc1e199ce0acc00ea1aecf2397d877af36aea9` |
| `familia-oferta-codigo-para-colar.txt` | `1c11b3c3471dc756c8707ce4c5fa1a04bfd024484b95b635bcd1fda4b9576297` |
| `familia-oferta-2-codigo-para-colar.txt` | `c090daed6fd99597944400b79602842fc1fce26a4fcc987191a1b71331903a1e` |

Spec: `spec/quiz-tracking-theo.md` — `8ad86b57d829e0dc3bb29785e73ebad2096b4f766947913c52c0629637b8d6f9`.
