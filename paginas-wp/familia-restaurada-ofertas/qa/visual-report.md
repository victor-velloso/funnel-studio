# QA visual

## xyz vs default

data-m xyz=default default=default texto igual=true

## Overflow

Nenhum.

## Copy ausente

Nenhuma.

## Vazamentos

Nenhum.

## Mais de 3 linhas (390)

Nenhum.

## Imagens quebradas

Nenhuma.

## Eduzz thankyou.js sem transactionkey

- upsell/default sem chave: tags=1 fr-no-eduzz=true sunVisivel=false spinnerVisivel=false oferta=true
- downsell/default sem chave: tags=1 fr-no-eduzz=true sunVisivel=false spinnerVisivel=false oferta=true

O script carrega nas duas páginas. Sem transactionkey ele pede GET https://elements-api.eduzz.com/thankyou/ com a query da página e recebe 404. O bloco (#sun-root / #sun-loading) fica oculto (html.fr-no-eduzz). Chamadas vistas: 33.

## Erros de console / pageerror

Nenhum erro nosso. O 404 do lookup da Eduzz sem transactionkey não quebra a página.


## Pesos locais (cópias da biblioteca)

- fr-capa-casamento.webp: 25686 bytes
- fr-capa-filhos.webp: 21530 bytes
- fr-capa-oracao.webp: 23452 bytes
- fr-capa-financeiro.webp: 23342 bytes
- fr-preview-casamento.webp: 45348 bytes
- fr-preview-filhos.webp: 53530 bytes
- fr-preview-oracao.webp: 43808 bytes
- fr-preview-financeiro.webp: 43848 bytes
- fr-simbolo-casamento.svg: 488 bytes
- fr-simbolo-filhos.svg: 559 bytes
- fr-simbolo-oracao.svg: 548 bytes
- fr-simbolo-financeiro.svg: 3441 bytes
- fr-ezenete-autora.webp: 33000 bytes

## Prints

21 arquivos.
