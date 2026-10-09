/* =====================================================================
   TEXTOS VARIÁVEIS DAS PÁGINAS DE UPSELL (Família Restaurada, teste A/B)
   Troque aqui e as 3 páginas atualizam juntas.
   Tudo que está aqui ainda depende de confirmação (Victor/Peter).
   No HTML, cada lugar que usa um destes valores tem data-var="<chave>".
   ===================================================================== */
window.UPSELL_CONFIG = {
  /* Nome do kit (doc do Alan: "Combo Casa Restaurada") */
  kitNome: "Combo Casa Restaurada",

  /* Página A: kit com os 4 manuais */
  parcelaA: "12x de R$ 10,03",
  avistaA: "R$ 97",
  diferencaA: "R$ 44",          /* R$ 141 - R$ 97 */

  /* Página B: os 3 manuais que faltam */
  parcelaB: "12x de R$ 4,86",
  avistaB: "R$ 47",
  porManualB: "R$ 15,67",       /* R$ 47 / 3 */

  /* Downsell da A: mesmo kit */
  parcelaDown: "12x de R$ 6,93",
  avistaDown: "R$ 67",
  diferencaDown: "R$ 30",       /* R$ 97 - R$ 67 */

  /* Valor fora da página */
  precoAvulso: "R$ 47",
  somaAvulsos: "R$ 141",

  /* Links (o Theo troca pelos links reais da Eduzz).
     Aceite = link de 1 clique. Recusa da A leva pro downsell com ?m e ?area. */
  links: {
    aceiteA: "#",        /* LINK DE 1 CLIQUE DA PÁGINA A */
    aceiteB: "#",        /* LINK DE 1 CLIQUE DA PÁGINA B */
    aceiteDown: "#",     /* LINK DE 1 CLIQUE DO DOWNSELL DA A */
    recusaA: "downsell-a.html",  /* downsell da A (leva ?m e ?area junto) */
    obrigado: "#",       /* PÁGINA DE OBRIGADO DA COMPRA (recusa da Página B leva pra cá) */
    recusaDown: "#"      /* entrega do manual que ela já comprou */
  },

  /* Nome do parâmetro da 2ª área na URL */
  paramArea: "area"
};
