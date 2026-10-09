# paginas-wp/familia-upsell-ab · Upsell A/B da Família Restaurada (código pro Elementor)

Gerado a partir do mockup aprovado pelo Victor em 09/10 às 18:21 (`mockup/`). Nada publicado.
Feito localmente: a pasta tem a estrutura pronta pra commitar em `paginas-wp/familia-upsell-ab/` no repo funnel-studio.

## Blocos (1 widget HTML do Elementor cada, página Full Width sem espaço)
| Página | Slug sugerido | Arquivo |
|---|---|---|
| A · Combo Casa Restaurada R$ 97 | /familia-upsell-a/ | familia-upsell-a-codigo-para-colar.txt |
| B · os 3 manuais R$ 47 | /familia-upsell-b/ | familia-upsell-b-codigo-para-colar.txt |
| Downsell da A · R$ 67 | /familia-upsell-a-2/ | familia-upsell-a-2-codigo-para-colar.txt |

Cada bloco é autossuficiente: fontes (Google Fonts, como o mockup), CSS preso em `#fr-up`, markup, config, textos e lógica, mais o script da Eduzz (thankyou.js) como nas ofertas no ar.
Gerar de novo: `python3 src/build-wp.py` e conferir com `python3 src/lint-wp.py *-codigo-para-colar.txt`.

## O que pode mudar (no `window.UPSELL_CONFIG` de CADA bloco)
- `links.aceiteA`, `links.aceiteB`, `links.aceiteDown`: links de 1 clique da Eduzz (hoje `#`; o botão não sai da página).
- `parcelaA/B/Down` (12x de R$ 10,03 / 4,86 / 6,93): **não confirmadas**. Se mudar, confira `diferencaA`, `porManualB` e `diferencaDown`.
- `links.recusaA` = /familia-upsell-a-2/ (leva ?m e ?area); `links.obrigado` e `links.recusaDown` = /parabens-familia/.
- `fcEnviarVariante` (false): só ligar quando o Funnel Control aceitar os campos `variant` e `area2`.
- `casamentoAcabou` ("casamento"): 2ª área casamento vinda do quiz com casamento que acabou. "padrao" = usa o texto sem 2ª área.

## Parâmetros
- `?m=` manual comprado. `?area=` 2ª área. Inválida, igual ao m ou sem m = sem 2ª área.
- Sem `?area` na URL: lê `fr_state.res.m2` do quiz (só leitura), só quando `fr_state.res.m` = m. Exige o patch do quiz (`quiz-patch/`).

## Herdado das ofertas no ar (/familia-oferta/ e /familia-oferta-2/)
- Funnel Control: `fr_oferta_view` / `fr_oferta_accept` / `fr_oferta_decline`, mesmo payload `{funnel, visitor_id, event, page, area}` (a API recusa qualquer outro campo).
- `fr_state`: só leitura; sem vid, grava o vid com answers/history/lead vazios (igual às ofertas).
- UTMs: URL > quiz > UTMify > utm_data; proteção contra a reescrita do UTMify; tira `m` e `area` do utm_data e do link da Eduzz; `u=1` no aceite.
- JS WordPress-safe: sem linha em branco, sem `&&`, sem `<`, `>`, `<=`, `>=`, sem `=>`.

## Imagens
Todas já estão na mídia do site (wp-content/uploads/2026/09/, iguais byte a byte às do mockup). Os 3 prints de relato usam os originais do quiz com o mesmo recorte por CSS do quiz. Nenhum upload necessário.

## Patch do quiz (página 5019) · `quiz-patch/`
Uma linha no `renderPitch`: salva `S.res = {m, m2, cx}` no `fr_state` (cx = casamento acabou). Base = código no ar hoje (conferido linha a linha). Teste: `quiz-patch/resultado-teste-res-quiz.txt` (7 caminhos do quiz).

## QA
`qa/qa.js` (486 checagens, 0 falhas, `qa/resultado.json`): cada bloco dentro do casco real da /familia-oferta/ (tema do site), servido local, sem rede pra fora.
