# Upsell A/B · Família Restaurada (mockups de design)

Referência visual pro Theo montar no Elementor. É mockup: nada aqui está publicado.

**Versão final aprovada pelo Victor (09/10).** A pessoa rola e lê tudo até o preço.

## Arquivos
- `pagina-a.html`: Página A, Combo Casa Restaurada (R$ 97).
- `pagina-b.html`: Página B, os 3 manuais que faltam (R$ 47).
- `downsell-a.html`: downsell da A, o mesmo combo (R$ 67).
- `upsell.css`: CSS único das 3 páginas (tokens no `:root`).
- `config.js`: **todos os textos provisórios** (nome do kit, parcelas, valores à vista, diferenças e links).
- `textos.js`: textos que mudam por área (copy do Alan, sem reescrever).
- `upsell.js`: troca de área, leques de capas, portas, botão fixo e fade.
- `build.py`: gera os 3 HTML (a copy fixa fica aqui). Rode `python3 build.py` depois de mexer.
- `assets/`: capas, símbolos das áreas, foto da Pra. Ezenete, páginas internas e os 3 prints de relato já recortados (os mesmos da oferta do quiz).
- `prints/` e `contato-upsell-ab.jpg`: prints (390px página inteira e 1280px).

## Parâmetros da URL
- `?m=casamento|filhos|oracao|financeiro`: manual que ela comprou. Muda o bloco 2, a porta 01, o "[MANUAL COMPRADO]" e tira o manual dela do bloco 6. Sem `m`, vale o texto "Sem parâmetro" ("o seu manual").
- `?area=casamento|filhos|oracao|financeiro`: 2ª área do teste. Muda os blocos 4, 5, 6, 8 e 14 (e o bloco 4 do downsell). Vazio, inválido, igual ao `m` ou sem `m` = versão **sem a 2ª área**. O nome do parâmetro fica em `config.js > paramArea`.
- A recusa da Página A leva pro downsell com o mesmo `m` e `area`.
- Exemplos: `pagina-a.html?m=oracao` (sem 2ª área) e `pagina-a.html?m=oracao&area=casamento` (com).

## Textos variáveis (trocar num lugar só)
Em `config.js`: `kitNome` ("Combo Casa Restaurada"), `parcelaA` ("12x de R$ 10,03"), `parcelaB` ("12x de R$ 4,86"), `parcelaDown` ("12x de R$ 6,93"), `avistaA/B/Down`, `diferencaA` (R$ 44), `porManualB` (R$ 15,67), `diferencaDown` (R$ 30), `precoAvulso` e `somaAvulsos`.
No HTML, cada lugar que usa um valor tem `data-var="<chave>"`; o JS preenche. **Se mudar parcela ou à vista, confira as diferenças (R$ 44, R$ 15,67 e R$ 30).**
Links de aceite (1 clique da Eduzz) e recusa: `config.js > links`. A recusa da Página B vai pra `links.obrigado` (página de obrigado da compra). Os botões estão com `href="#"` e um comentário `LINK DE 1 CLIQUE` no HTML.

## Estrutura (blocos do doc)
Página A e B: 1 faixa "NÃO FECHE" + check + barra de 3 etapas · 2 celebrar (capa dela com "já é seu") · [espaço do vídeo comentado no HTML, sem placeholder] · 3 aviso (destaque com fio verde, 4 mini-cards por área: pilha no celular e 2x2 no desktop, versículo em cartão creme) · 4 problema que continua (chip "Também pesa aí" ou destaque) · 5 as 4 portas (linha do tempo) · 6 um card por manual novo + página interna com fade · 7 prova (foto, 4 números, carrossel de relatos, legenda) · 8 pra quem é (fundo creme) · 9 você recebe (leque de capas) · 10/11 cartão de preço com botão e recusa · 12 garantia (selo 7 dias) · 13 FAQ em acordeão · 14 fechamento.
Botão fixo no rodapé (só A e B) aparece só a partir do preço (bloco 10) e some quando um botão de aceite está na tela.
Downsell: faixa "ESPERE" · título + leque · comparação lado a lado (empilha no celular) · o que entra + portas pequenas · preço com botão + linha vermelha · 4 perguntas · recusa. Sem botão fixo.

## Visual
- Fundo branco, cards creme `#FAF6F1`, borda `#EAE0D5`.
- Terracota `#A25A38` (hover `#7E4527`) em botões, destaques e ícones. Verde `#2F9540`/`#256F31` só no que já é dela e nos checks.
- Títulos em Raleway 700/800, corpo em Open Sans 17px, linha 1.6. Microtexto 12 a 14px.
- Cantos 16px nos cards, botões em pílula. Seções a 56px, blocos a 28px. Coluna de no máximo 600px no desktop.
- Sem cronômetro, sem contagem regressiva e sem selo de vagas.
- Não existe variação "casamento que acabou": sem gatilho na URL, vale o texto padrão.
