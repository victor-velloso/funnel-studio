/* Copy aprovada, palavra por palavra. Nada aqui é reescrito. */
export const ORDER = ["casamento", "filhos", "oracao", "financeiro"];

export const AREAS = [
  {
    id: "casamento",
    nome: "Casamento Restaurado",
    capa: "fr-capa-casamento.webp",
    prev: "fr-preview-casamento.webp",
    sym: "fr-simbolo-casamento.svg",
    door: "Tem o casamento.",
    frase: "As armas espirituais pra orar pelo seu casamento: no silêncio dentro de casa, na traição, quando ele fala em ir embora.",
    fraseA: "As armas espirituais pra orar pelo seu casamento:",
    fraseB: "no silêncio dentro de casa, na traição, quando ele fala em ir embora.",
    b3a: "Você já vai orar pelo seu casamento.",
    b3b: "Mas o casamento não é a única porta dessa casa.",
    b6a: "Você já leva o Casamento Restaurado.",
    b6b: "Os 4 manuais juntos completam com Filhos Restaurados, Vida de Oração Restaurada e Financeiro Restaurado.",
    chips: ["Filhos Restaurados", "Vida de Oração Restaurada", "Financeiro Restaurado"],
    d4a: "Você já leva o casamento.",
    d4b: "Com esse preço, entram também os filhos, a sua vida de oração e o financeiro."
  },
  {
    id: "filhos",
    nome: "Filhos Restaurados",
    capa: "fr-capa-filhos.webp",
    prev: "fr-preview-filhos.webp",
    sym: "fr-simbolo-filhos.svg",
    door: "Tem o filho.",
    frase: "As armas espirituais pra ficar na brecha pelo filho que se afastou de Deus, da igreja ou de você.",
    fraseA: "As armas espirituais pra ficar na brecha pelo filho",
    fraseB: "que se afastou de Deus, da igreja ou de você.",
    b3a: "Você já vai ficar na brecha pelo seu filho.",
    b3b: "Mas o filho não é a única porta dessa casa.",
    b6a: "Você já leva o Filhos Restaurados.",
    b6b: "Os 4 manuais juntos completam com Casamento Restaurado, Vida de Oração Restaurada e Financeiro Restaurado.",
    chips: ["Casamento Restaurado", "Vida de Oração Restaurada", "Financeiro Restaurado"],
    d4a: "Você já leva os filhos.",
    d4b: "Com esse preço, entram também o casamento, a sua vida de oração e o financeiro."
  },
  {
    id: "oracao",
    nome: "Vida de Oração Restaurada",
    capa: "fr-capa-oracao.webp",
    prev: "fr-preview-oracao.webp",
    sym: "fr-simbolo-oracao.svg",
    door: "Tem a sua vida de oração.",
    frase: "As armas espirituais pra quem ajoelha e não sai nada. Pra voltar a orar quando a vontade sumiu.",
    fraseA: "As armas espirituais pra quem ajoelha e não sai nada.",
    fraseB: "Pra voltar a orar quando a vontade sumiu.",
    b3a: "Você já vai voltar a orar.",
    b3b: "Mas a sua oração não é a única porta dessa casa.",
    b6a: "Você já leva o Vida de Oração Restaurada.",
    b6b: "Os 4 manuais juntos completam com Casamento Restaurado, Filhos Restaurados e Financeiro Restaurado.",
    chips: ["Casamento Restaurado", "Filhos Restaurados", "Financeiro Restaurado"],
    d4a: "Você já leva a sua vida de oração.",
    d4b: "Com esse preço, entram também o casamento, os filhos e o financeiro."
  },
  {
    id: "financeiro",
    nome: "Financeiro Restaurado",
    capa: "fr-capa-financeiro.webp",
    prev: "fr-preview-financeiro.webp",
    sym: "fr-simbolo-financeiro.svg",
    door: "Tem a conta no fim do mês.",
    frase: "As armas espirituais pra orar pela vida financeira da casa: a dívida, o nome sujo, o peso que fica todo em cima de uma pessoa só.",
    fraseA: "As armas espirituais pra orar pela vida financeira da casa:",
    fraseB: "a dívida, o nome sujo, o peso que fica todo em cima de uma pessoa só.",
    b3a: "Você já vai orar pela conta que não fecha.",
    b3b: "Mas o dinheiro não é a única porta dessa casa.",
    b6a: "Você já leva o Financeiro Restaurado.",
    b6b: "Os 4 manuais juntos completam com Casamento Restaurado, Filhos Restaurados e Vida de Oração Restaurada.",
    chips: ["Casamento Restaurado", "Filhos Restaurados", "Vida de Oração Restaurada"],
    d4a: "Você já leva o financeiro.",
    d4b: "Com esse preço, entram também o casamento, os filhos e a sua vida de oração."
  }
];

/* PROPOSTA — aguardando aprovação do Steve */
export const copyDefault = {
  b3l1: "Você já vai orar pela sua casa.",
  b3l2: "Mas essa não é a única porta dessa casa.",
  b6a: "Você já leva o seu manual.",
  b6b: "Os 4 manuais juntos completam com os outros três.",
  d4: "Você já leva o seu manual. Com esse preço, entram também os outros três."
};

export const SHARED = {
  band1: "✔ Deu certo. O seu manual já está garantido.",
  band2: "Antes de ir baixar, tem uma coisa que eu quero te mostrar.",
  sub: "Os 4 manuais da Pra. Ezenete Rodrigues juntos, pra você saber o que orar em cada área da sua casa.",
  b4a: "Você começou pela área que mais está doendo agora. E isso foi certo.",
  b4b: "Só que casa não tem uma porta só.",
  know: "E quem vive dentro de casa sabe:",
  hl: "quando uma dessas aperta, as outras sentem junto.",
  minis: [
    { sym: "casamento", t: "A briga com o marido → tira a vontade de orar" },
    { sym: "filhos", t: "O filho longe de Deus → tira o sono" },
    { sym: "financeiro", t: "A conta que não fecha → vira briga na mesa" }
  ],
  close1: "Você não precisa resolver tudo hoje.",
  close2: "Mas também não precisa voltar pro ",
  closeI: "às vezes não sei o que fazer",
  close3: " quando a próxima porta apertar.",
  h2: "O que você leva",
  each1: "Cada manual mostra a situação, a causa e o que orar.",
  each2: "Com a Palavra na mão, aplicada àquela situação.",
  chipsLine: ["Situação", "Causa", "O que orar"],
  word: "Com a Palavra na mão",
  priceLead: "Os 4 manuais juntos saem por",
  price: "R$97",
  cmp: "Se fosse pegar os outros três separados, a R$47 cada, dava R$141.",
  mail: "Os 4 chegam no mesmo e-mail do manual que você acabou de comprar.",
  seals: ["e-mail", "celular", "4 manuais"],
  btn: "Sim, quero os 4 manuais por R$97",
  micro: "Pagamento único, no mesmo cartão da compra que você acabou de fazer.",
  red1: "Pra ficar claro: esses manuais não são promessa de milagre.",
  red2: "Ninguém pode te garantir que o marido volta, que o filho se converte ou que a dívida some.",
  red3a: "O que eles te dão é direção:",
  red3b: "entender o que está acontecendo em cada área da casa e saber o que orar ali.",
  no: "Não, obrigada. Quero só o manual que eu comprei.",
  steps: ["Compra", "Oferta especial", "Acesso"],
  caring: "cuidando",
  ajar: "aberta",
  yours: "✓ o seu",
  owned: "✓ já é seu",
  downBand: "O seu manual continua garantido.",
  downTitle: "Tudo bem. Sem pressão nenhuma.",
  downOpen: "Mas antes de você ir, eu quero deixar uma porta aberta: os mesmos 4 manuais, completos, por",
  downPrice: "R$67",
  downNot: "Não é uma versão menor, nem com pedaço faltando.",
  downSame: "São exatamente os mesmos 4 manuais.",
  downBefore: "Antes: 4 manuais · R$97",
  downNow: "Agora: os mesmos 4 manuais · R$67",
  downWhy1: "Eu sei que tem mês em que R$97 pesa.",
  downWhy2: "Esse preço é pra quem quer ter a casa inteira coberta e sentiu o valor.",
  downBtn: "Sim, quero os 4 manuais por R$67",
  downMicro: "Pagamento único. Chega no mesmo e-mail.",
  downRed1: "Os manuais são direção pra orar em cada área da casa.",
  downRed2: "Não são promessa de resultado.",
  downNo: "Não, obrigada. Quero só o que eu já comprei."
};

export function areaById(id) {
  return AREAS.find((a) => a.id === id) || null;
}

export function upsellExpected(m) {
  const lines = [
    SHARED.band1, SHARED.band2, SHARED.sub, SHARED.b4a, SHARED.b4b, SHARED.know, SHARED.hl,
    SHARED.close1,
    SHARED.close1 + " " + SHARED.close2 + '"' + SHARED.closeI + '"' + SHARED.close3,
    SHARED.h2, SHARED.each1, SHARED.each2, SHARED.word,
    SHARED.priceLead, SHARED.price, SHARED.priceLead + " " + SHARED.price + ".", SHARED.cmp, SHARED.mail, SHARED.btn, SHARED.micro,
    SHARED.red1, SHARED.red2, SHARED.red3a + " " + SHARED.red3b, SHARED.no,
    ...SHARED.steps, ...SHARED.chipsLine, ...SHARED.seals, ...SHARED.minis.map((x) => x.t)
  ];
  AREAS.forEach((a) => {
    lines.push(a.nome, a.frase, a.door);
  });
  const area = areaById(m);
  if (area) lines.push(area.b3a, area.b3b, area.b6a, area.b6b);
  else lines.push(copyDefault.b3l1, copyDefault.b3l2, copyDefault.b6a, copyDefault.b6b);
  return lines;
}

export function upsellForbidden(m) {
  const bad = [];
  AREAS.forEach((a) => {
    if (a.id === m) return;
    bad.push(a.b3a, a.b3b, a.b6a, a.b6b);
  });
  if (m) bad.push(copyDefault.b3l1, copyDefault.b3l2, copyDefault.b6a, copyDefault.b6b);
  bad.push(SHARED.downBtn, SHARED.downNo, SHARED.downTitle);
  return bad;
}

export function downsellExpected(m) {
  const lines = [
    SHARED.downBand, SHARED.downTitle, SHARED.downOpen.trim(), SHARED.downPrice,
    SHARED.downOpen.trim() + " " + SHARED.downPrice + ".",
    SHARED.downNot, SHARED.downSame, SHARED.downBefore, SHARED.downNow,
    SHARED.downWhy1, SHARED.downWhy2, SHARED.downBtn, SHARED.downMicro,
    SHARED.downRed1, SHARED.downRed2, SHARED.downNo, ...SHARED.steps
  ];
  const area = areaById(m);
  if (area) lines.push(area.d4a, area.d4b, area.d4a + " " + area.d4b);
  else lines.push(copyDefault.d4);
  return lines;
}

export function downsellForbidden(m) {
  const bad = [SHARED.btn, SHARED.no, SHARED.band1, SHARED.band2];
  AREAS.forEach((a) => {
    if (a.id === m) return;
    bad.push(a.d4a);
  });
  if (m) bad.push(copyDefault.d4);
  return bad;
}

AREAS.forEach((a) => {
  const joined = a.fraseA + " " + a.fraseB;
  if (joined !== a.frase) throw new Error("frase partida não fecha: " + a.id);
});
