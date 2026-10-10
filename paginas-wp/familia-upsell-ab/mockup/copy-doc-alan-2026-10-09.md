# **Copy das páginas de upsell e downsell - Família Restaurada (teste A/B)**

Ela acabou de fazer o teste e comprar um dos 4 manuais (casamento, filhos, vida de oração ou financeiro). Logo depois da compra, cai numa destas duas páginas, divididas meio a meio:

  - **Página A:** o Combo Casa Restaurada, por 12x de R$ 10,03 ou R$ 97 à vista.
  - **Página B:** os 3 manuais que faltam, por 12x de R$ 4,86 ou R$ 47 à vista.

Quem recusa a A vai pro downsell da A (o mesmo kit por R$ 67), que está no fim deste doc. O downsell da B depende da decisão do Peter e ainda não está aqui.

Cada página tem duas variações:

  - **Com a 2ª área:** usa a segunda área que o teste calcula ("Também pesa aí"). Os trechos marcados com \[COM A 2ª ÁREA\] entram só nessa variação, e os campos \[SEGUNDA ÁREA\] e \[MANUAL DA SEGUNDA ÁREA\] são preenchidos pela tabela abaixo. Esse dado ainda precisa chegar na URL.
  - **Sem a 2ª área:** os trechos marcados com \[SEM A 2ª ÁREA\] entram no lugar. Essa variação vale também quando o teste não calcula segunda área.

O campo \[MANUAL COMPRADO\] e os blocos marcados com \[VARIAÇÃO POR ÁREA\] mudam conforme o manual que ela comprou (?m=casamento, filhos, oracao ou financeiro). Sem parâmetro, vale o texto "Sem parâmetro". Todo o resto é igual.

  
  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Valor na URL\*\* | \*\*\\\[MANUAL COMPRADO\\\]\*\* | \*\*\\\[SEGUNDA ÁREA\\\]\*\* | \*\*\\\[MANUAL DA SEGUNDA ÁREA\\\]\*\* |
| casamento | Casamento Restaurado | o seu casamento (se ela marcou que o casamento acabou: a dor do casamento que acabou) | Casamento Restaurado |
| filhos | Filhos Restaurados | o seu filho | Filhos Restaurados |
| oracao | Vida de Oração Restaurada | a sua vida de oração | Vida de Oração Restaurada |
| financeiro | Financeiro Restaurado | as contas da casa | Financeiro Restaurado |
| sem parâmetro | o seu manual | (usar a variação sem a 2ª área) | (usar a variação sem a 2ª área) |

  

Direção visual pro Joe: as páginas seguem o padrão da oferta do quiz (estética Raízes, fundo branco, cards creme \#FAF6F1, terracota \#A25A38 na cor principal e verde \#2F9540 só pro que já é dela e pros checks; Raleway nos títulos e Open Sans no corpo). Tokens e componentes estão em /workspace/reset-templates/quiz/design-system.md. A estrutura dos blocos é a mesma das páginas de upsell do Seminário, da Escola e do Raízes. Embaixo de cada bloco tem uma linha "Visual" dizendo qual componente usar.

Regras gerais:

  - Mobile-first em 390px, coluna central estreita no desktop (máximo de uns 600px). Nunca mais de 3 linhas de texto seguidas no celular.
  - Títulos de seção centralizados. Espaço entre seções de 56px e entre blocos de 28px. Entrada das seções com fade suave ao rolar.
  - Nenhum preço antes do bloco 10. O botão do bloco 5 só rola a página até o preço.
  - Botão em pílula terracota, largo. O botão fixo no rodapé aparece a partir do bloco 10.
  - Sem cronômetro, sem contagem regressiva e sem selo de "últimas vagas".
  - Página só de texto por enquanto. O espaço do vídeo da Pra. Ezenete fica previsto depois do bloco 2 e só aparece quando o vídeo existir.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

# Ganchos da 2ª área (páginas A e B)

Esta seção traz o texto pronto de cada gancho, um por área, pra cada ponto da página onde a 2ª área aparece. Vale igual pras páginas A e B. Nos blocos 4, 5, 8 e 14 das páginas, onde aparece \[COM A 2ª ÁREA\] ou \[SEM A 2ª ÁREA\], entra o texto daqui, conforme o valor da 2ª área.

**Pro Theo: valor do parâmetro da 2ª área**

casamento = Casamento · filhos = Filhos · oracao = Oração · financeiro = Financeiro.

Vazio, ausente ou qualquer outro valor = gancho padrão. A 2ª área nunca é igual à área comprada; se por algum erro vier igual ao ?m, use também o padrão. Casamento só aparece pra quem é casada e filhos só pra quem tem filhos, por isso os textos de casamento e de filhos já partem disso.

Na recusa, leve o mesmo ?m e o mesmo valor da 2ª área pro downsell da A, que também usa o gancho (bloco 4 do downsell).

## Bloco 4 · O problema que continua

### Casamento

E no seu caso tem um detalhe. No teste, além do que você escolheu, apareceu mais uma área pesando aí: o seu casamento.

Talvez você nem tenha parado pra pensar nisso agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas as suas respostas mostram que o casamento também está apertando. A conversa que não acontece, a distância dentro de casa, a briga que sempre volta. E o casamento não espera a outra área melhorar pra pesar.

O manual que você levou continua sendo o seu começo e dá conta da área que mais dói. Ele só não fala do casamento, porque cada manual cuida de uma área da casa.

### Filhos

E no seu caso tem um detalhe. No teste, além do que você escolheu, apareceu mais uma área pesando aí: o seu filho.

Talvez você nem tenha parado pra pensar nisso agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas as suas respostas mostram que a preocupação com o seu filho também está apertando. O jeito que ele se fecha, a distância de Deus, o medo do caminho que ele está escolhendo. E essa preocupação não espera a outra área melhorar pra pesar.

O manual que você levou continua sendo o seu começo e dá conta da área que mais dói. Ele só não fala dos filhos, porque cada manual cuida de uma área da casa.

### Oração

E no seu caso tem um detalhe. No teste, além do que você escolheu, apareceu mais uma área pesando aí: a sua vida de oração.

Talvez você nem tenha parado pra pensar nisso agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas as suas respostas mostram que a sua oração também está sofrendo. O joelho que dobra e não sai nada, a oração que parece não passar do teto, os dias em que a vontade de orar some. E isso não espera a outra área melhorar pra pesar.

O manual que você levou continua sendo o seu começo e dá conta da área que mais dói. Ele só não fala da sua vida de oração, porque cada manual cuida de uma área da casa.

### Financeiro

E no seu caso tem um detalhe. No teste, além do que você escolheu, apareceu mais uma área pesando aí: as contas da casa.

Talvez você nem tenha parado pra pensar nisso agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas as suas respostas mostram que o dinheiro também está apertando. A conta que não fecha, a dívida que cresce, o peso que fica todo em cima de uma pessoa só. E a conta do mês não espera a outra área melhorar pra pesar.

O manual que você levou continua sendo o seu começo e dá conta da área que mais dói. Ele só não fala das contas da casa, porque cada manual cuida de uma área da casa.

### Padrão (2ª área vazia)

Pensa na sua casa hoje. Quase sempre, além da área que mais dói, tem uma segunda apertando junto. Pode ser a conversa que não acontece em casa, a oração que esfriou ou a conta que não fecha no fim do mês.

Talvez você nem tenha parado pra pensar nela agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas a outra área não espera a primeira melhorar pra pesar.

O manual que você levou continua sendo o seu começo e dá conta da área que mais dói. Ele só não fala das outras áreas, porque cada manual cuida de uma área da casa.

## Bloco 5 · Porta 02 do caminho (com o chip)

### Casamento

02 · A PORTA QUE TAMBÉM PESA · Casamento Restaurado · O casamento apareceu no seu teste. Aqui você usa o mesmo método onde a pressão já chegou. · Chip: Também pesa aí: o seu casamento · DESTRAVA HOJE

### Filhos

02 · A PORTA QUE TAMBÉM PESA · Filhos Restaurados · O seu filho apareceu no seu teste. Aqui você usa o mesmo método onde a pressão já chegou. · Chip: Também pesa aí: o seu filho · DESTRAVA HOJE

### Oração

02 · A PORTA QUE TAMBÉM PESA · Vida de Oração Restaurada · A sua vida de oração apareceu no seu teste. Aqui você usa o mesmo método onde a pressão já chegou. · Chip: Também pesa aí: a sua vida de oração · DESTRAVA HOJE

### Financeiro

02 · A PORTA QUE TAMBÉM PESA · Financeiro Restaurado · As contas da casa apareceram no seu teste. Aqui você usa o mesmo método onde a pressão já chegou. · Chip: Também pesa aí: as contas da casa · DESTRAVA HOJE

Com a 2ª área, as portas 03 e 04 são os outros 2 manuais, com o título "AS PORTAS QUE HOJE ESTÃO QUIETAS" e o texto "Pra quando essas áreas apertarem, você já ter a direção na mão." No bloco 6, o manual da 2ª área vem primeiro, com o mesmo chip.

### Padrão (2ª área vazia)

Sem chip. 02, 03 e 04 · AS OUTRAS PORTAS DA CASA · Os 3 manuais que você ainda não tem, cada um com a etiqueta DESTRAVA HOJE, na ordem casamento, filhos, oração e financeiro (pulando o que ela comprou). No bloco 6, a mesma ordem.

## Bloco 8 · Item da lista "Essa condição é pra você que"

### Casamento

Viu no teste que o seu casamento também pesa aí, e quer saber o que orar por ele antes da próxima briga.

### Filhos

Viu no teste que o seu filho também pesa aí, e quer ficar na brecha por ele sabendo o que pedir.

### Oração

Viu no teste que a sua vida de oração também pesa aí, e quer voltar a orar sabendo o que dizer a Deus.

### Financeiro

Viu no teste que as contas da casa também pesam aí, e quer orar pela vida financeira da casa com direção, e não só no aperto do fim do mês.

### Padrão (2ª área vazia)

Quer cuidar da casa inteira com o mesmo jeito de orar, antes de a próxima área apertar.

## Bloco 14 · Linha do fechamento

### Casamento

E você já sabe qual área é essa: o seu casamento. O Casamento Restaurado destrava hoje, junto com os outros.

### Filhos

E você já sabe qual área é essa: o seu filho. O Filhos Restaurados destrava hoje, junto com os outros.

### Oração

E você já sabe qual área é essa: a sua vida de oração. O Vida de Oração Restaurada destrava hoje, junto com os outros.

### Financeiro

E você já sabe qual área é essa: as contas da casa. O Financeiro Restaurado destrava hoje, junto com os outros.

### Padrão (2ª área vazia)

E, quando ela apertar, você já vai ter nas mãos a direção pra cada área da casa.

## Downsell da A · Linha do bloco 4

Casamento: Inclusive o Casamento Restaurado, do casamento, que também pesa aí.

Filhos: Inclusive o Filhos Restaurados, do seu filho, que também pesa aí.

Oração: Inclusive o Vida de Oração Restaurada, da sua vida de oração, que também pesa aí.

Financeiro: Inclusive o Financeiro Restaurado, das contas da casa, que também pesam aí.

Padrão (2ª área vazia): a linha não aparece.

# **PÁGINA A: Combo Casa Restaurada (R$ 97)**

## **Bloco 1 · Faixa de confirmação e retenção**

NÃO FECHE ESTA PÁGINA

Deu certo. O seu manual já está garantido e vai chegar no mesmo e-mail da sua compra.

Antes de você ir baixar, eu separei uma condição que só aparece aqui, logo depois da compra. Leia com calma até o final.

Compra feita · Condição especial · Acesso

**Visual:** faixa fina no topo com "NÃO FECHE ESTA PÁGINA" em caixa alta, terracota, letra pequena e espaçada. Logo abaixo, a linha "Deu certo..." com check verde em círculo à esquerda, em negrito, e o parágrafo seguinte menor. Depois, a barra de 3 etapas: "Compra feita" em verde com check, "Condição especial" acesa em terracota com a etiqueta "você está aqui" e "Acesso" em cinza. Isso mostra que a compra deu certo e que falta só um passo.

## **Bloco 2 · Celebrar a decisão \[VARIAÇÃO POR ÁREA\]**

Título (igual pra todas):

Você acabou de fazer o que pouca gente faz.

**Casamento**

A maioria passa anos orando pelo casamento do mesmo jeito, no escuro, e acha que é assim mesmo. Você não. Você parou pra entender o que está acontecendo aí dentro e levou o Casamento Restaurado, pra saber o que orar no silêncio dentro de casa, na briga que sempre volta e na desconfiança que não deixa você dormir.

**Filhos**

A maioria passa anos chorando por um filho sem saber o que pedir, e acha que só resta esperar. Você não. Você parou pra entender o que está acontecendo e levou o Filhos Restaurados, pra saber como ficar na brecha pelo seu filho quando ele se afasta de Deus, da igreja ou de você.

**Oração**

A maioria passa anos ajoelhando sem sentir que a oração sai do lugar, e acha que o problema é ela mesma. Você não. Você parou pra entender o que está acontecendo e levou o Vida de Oração Restaurada, pra voltar a orar com direção, inclusive nos dias em que a vontade de orar some.

**Financeiro**

A maioria passa anos correndo atrás da conta do mês e nunca ora pela vida financeira da casa com direção. Você não. Você parou pra entender o que está acontecendo e levou o Financeiro Restaurado, pra saber o que orar quando a conta não fecha, a dívida aperta e o peso fica todo em cima de uma pessoa só.

**Sem parâmetro**

A maioria passa anos orando do mesmo jeito, no escuro, e acha que é assim mesmo. Você não. Você parou pra entender o que está acontecendo na sua casa e levou o manual da área que mais dói agora.

Fecho do bloco (igual pra todas):

Começar pela área que mais dói foi a decisão certa. A partir de hoje, você vai pra oração sabendo o que está enfrentando ali.

Mas, antes de você ir baixar, eu preciso te mostrar uma coisa.

**Visual:** título centralizado em Raleway 800, grande (26 a 30px), com "pouca gente faz" em terracota. O parágrafo da área vira 2 ou 3 linhas curtas, com o nome do manual em negrito. Ao lado ou logo acima, a capa do manual que ela comprou em mockup pequeno, inteira, com o selo verde "✓ já é seu". O fecho fica centralizado, e a última frase em itálico puxa pro bloco seguinte.

## **Espaço do vídeo (segunda fase)**

Quando a Pra. Ezenete gravar o vídeo curto do upsell, ele entra aqui. Até lá, a página segue direto pro bloco 3.

**Visual:** espaço 16:9 com cantos de 16px, só quando o vídeo existir. Sem placeholder na tela até lá.

## **Bloco 3 · O aviso**

Dentro de casa, nada aperta sozinho.

Quem vive numa casa sabe como é. Quando uma área da casa aperta, as outras sentem junto. A briga com o marido muda o clima da casa inteira. O filho se fecha no quarto. A conta que não fecha tira o sono. E a oração vai esfriando no meio disso tudo.

Isso acontece porque a casa é uma só. Não tem nada a ver com a sua fé ser pequena.

"Com a sabedoria se edifica a casa, e com a inteligência ela se firma."

PROVÉRBIOS 24:3 · A PALAVRA FALA DA CASA INTEIRA

Repara que o versículo não fala de um cômodo. Fala da casa. Você acabou de buscar direção pra área que mais dói, e esse é o começo certo. Só que, quando outra área apertar e você estiver sem direção nela, o mais comum é voltar a orar do jeito de antes, sem saber o que pedir.

Por isso tanta gente começa bem e, uns meses depois, se vê de novo perdida na oração. Cuidou de uma área e deixou as outras pro dia em que apertassem. E, quando apertam, costumam apertar juntas. Foi pensando nisso que eu preparei esta página.

**Visual:** "Dentro de casa, nada aperta sozinho." como título de seção centralizado, com "nada aperta sozinho" em terracota. A frase "Quando uma área da casa aperta, as outras sentem junto." vira destaque com fio vertical verde-escuro à esquerda, 19px. Logo abaixo, as 4 cenas viram 4 mini-cards creme, um por área, em grade 2x2 no desktop e em pilha no celular, cada um com o símbolo da área e a frase curta: aliança com "A briga com o marido muda o clima da casa inteira", criança com "O filho se fecha no quarto", carteira com "A conta que não fecha tira o sono" e mãos em oração com "A oração vai esfriando". Os 4 cards têm a mesma altura e ficam soltos, sem seta ligando um ao outro, pra cada área aparecer como uma situação separada. O versículo fica num cartão creme largo, em itálico 20px, com a referência embaixo em caixa alta pequena e espaçada, terracota. Os dois últimos parágrafos em texto normal, no máximo 3 linhas cada no celular.

## **Bloco 4 · O problema que continua**

\[COM A 2ª ÁREA\]

E no seu caso tem um detalhe. No teste, além do que você escolheu, apareceu mais uma coisa pesando aí: \[SEGUNDA ÁREA\].

Talvez você nem tenha parado pra pensar nisso agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas as suas respostas mostram que essa outra área também está apertando, e ela não espera a primeira melhorar pra pesar.

O \[MANUAL COMPRADO\] continua sendo o seu começo, e ele dá conta da área que mais dói. Ele só não fala de \[SEGUNDA ÁREA\], porque cada manual cuida de uma área da casa.

\[SEM A 2ª ÁREA\]

Pensa na sua casa hoje. Quase sempre, além da área que mais dói, tem uma segunda apertando junto.

Talvez você nem tenha parado pra pensar nela agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas a outra não espera a primeira melhorar pra pesar.

O \[MANUAL COMPRADO\] continua sendo o seu começo, e ele dá conta da área que mais dói. Ele só não fala das outras áreas, porque cada manual cuida de uma área da casa.

**Visual:** com a 2ª área, a frase "apareceu mais uma coisa pesando aí: \[SEGUNDA ÁREA\]" vira o mesmo chip do resultado do quiz ("Também pesa aí"), com o símbolo pequeno da área e o ícone alinhado ao texto, pra ela reconhecer o que viu no teste. Sem a 2ª área, a primeira frase fica em destaque com fio vertical verde-escuro. O último parágrafo fica num cartão creme claro, com check verde ao lado de "continua sendo o seu começo", pra deixar claro que o manual dela vale sozinho.

## **Bloco 5 · O caminho da casa inteira**

São 4 portas na mesma casa. Da primeira, você já está cuidando.

Os meus 4 manuais usam o mesmo método. Pra cada situação, você entende o que está acontecendo, de onde aquilo vem e o que orar, com a Palavra na mão. No manual que você comprou, você aprende esse jeito de orar. Nos outros, você usa esse mesmo jeito em cada área da casa, sem começar do zero.

Nesta página, e só nela, você leva o Combo Casa Restaurada, com os 4 manuais juntos. O \[MANUAL COMPRADO\] vem no combo junto com os outros 3, pra você ter a casa inteira no mesmo lugar. Na prática, o que chega de novo pra você são os 3 que faltam:

01 · A PORTA QUE MAIS DÓI HOJE

\[MANUAL COMPRADO\]

A área que você escolheu no teste. Aqui você aprende o método.

JÁ É SEU

02 · \[COM A 2ª ÁREA\] A PORTA QUE TAMBÉM PESA

\[MANUAL DA SEGUNDA ÁREA\]

A área que apareceu no seu teste. Você usa o mesmo método onde a pressão já chegou.

DESTRAVA HOJE

\[SEM A 2ª ÁREA\] 02, 03 e 04 · AS OUTRAS PORTAS DA CASA

Os 3 manuais que você ainda não tem, na ordem casamento, filhos, oração e financeiro (pulando o que ela comprou), cada um com a etiqueta DESTRAVA HOJE.

03 e 04 · \[COM A 2ª ÁREA\] AS PORTAS QUE HOJE ESTÃO QUIETAS

Os outros 2 manuais. Pra quando essas áreas apertarem, você já ter a direção na mão.

DESTRAVA HOJE

\[ QUERO VER A CONDIÇÃO \]

**Visual:** título de seção centralizado, com "você já está cuidando" em verde. O parágrafo do método vira 3 chips em sequência (Situação · Causa · O que orar), com o ícone de Bíblia aberta ao lado de "com a Palavra na mão". Depois, uma linha do tempo vertical com 4 portas, igual à linha do tempo do resultado do quiz: a 01 em verde com check e a etiqueta "JÁ É SEU"; as outras em terracota com cadeado aberto e a etiqueta "DESTRAVA HOJE", cada uma com a capa pequena do manual. Com a 2ª área, a porta 02 ganha o chip "Também pesa aí" e vem logo depois da 01. Os cards têm a mesma altura e o mesmo espaço entre eles. O botão "QUERO VER A CONDIÇÃO" é largo, em pílula terracota, e só rola a página até o bloco 10.

## **Bloco 6 · Um bloco pra cada manual novo \[VARIAÇÃO POR ÁREA\]**

Título do bloco: O que destrava hoje no combo

Aparecem só os 3 manuais que ela ainda não tem. O que ela comprou sai deste bloco. \[COM A 2ª ÁREA\] O \[MANUAL DA SEGUNDA ÁREA\] vem primeiro, com o chip "Também pesa aí". \[SEM A 2ª ÁREA\] A ordem é casamento, filhos, oração e financeiro.

**Destrava hoje: Casamento Restaurado**

Pra orar pelo casamento sabendo o que está acontecendo: no silêncio dentro de casa, na briga que sempre volta, na traição, quando se fala em ir embora. Você aprende a orar a favor do casamento, e não contra a pessoa.

Chips: 20 armas espirituais · Situação, causa e o que orar · Oração a favor do casamento

**Destrava hoje: Filhos Restaurados**

Pra ficar na brecha pelo filho que se afastou de Deus, da igreja ou de você. Você aprende a largar a culpa que não é sua e a orar pela mente e pelas escolhas dele com a Palavra, sem implorar e sem sermão.

Chips: 20 armas espirituais · Situação, causa e o que orar · Oração pelo filho, mesmo de longe

**Destrava hoje: Vida de Oração Restaurada**

Pra quem ajoelha e não sai nada, ou sente que a oração não passa do teto. Você aprende a voltar a orar começando com poucos minutos por dia, até isso virar costume, inclusive nos dias em que a vontade de orar some.

Chips: 20 armas espirituais · Situação, causa e o que orar · Recomeço de 5 a 15 minutos

**Destrava hoje: Financeiro Restaurado**

Pra orar pela vida financeira da casa: a dívida, o nome sujo, o peso que fica todo em cima de uma pessoa só. Você aprende a juntar oração e responsabilidade, com um passo prático pra cada dia e sem promessa de prosperidade.

Chips: 20 armas espirituais · Situação, causa e o que orar · Oração junto com um passo prático

Linha embaixo dos cards:

O mesmo método do manual que você já tem, agora pra cada área da casa.

**Visual:** título do bloco centralizado. Cada manual num card creme com a capa pequena inteira à esquerda (mockup, nada cortado), a etiqueta "Destrava hoje" em terracota pequena em cima do nome, o nome em Raleway 700 e as 2 frases embaixo. Os chips ficam numa linha embaixo do texto, com ícone de linha (escudo, lista, mãos em oração). Cards em pilha no celular, todos da mesma altura. Se der, mostrar uma página interna real de um dos manuais com moldura e fade, como no bloco "Por dentro de cada situação" da oferta do quiz.

## **Bloco 7 · Prova**

Quem ensina

Eu estou há mais de 20 anos à frente da intercessão da Estância Paraíso, em Sabará (MG). Já formei mais de 200 mil pessoas na intercessão e sou autora do livro Uma Vida de Milagres.

20+ anos · à frente da intercessão da Estância Paraíso

200 mil · pessoas formadas na intercessão

60 · armas espirituais novas pra sua casa

Autora · de Uma Vida de Milagres

Veja o que dizem as mulheres que aprenderam a orar comigo:

(os mesmos 3 prints reais da oferta do quiz, com a mesma legenda de aviso)

**Visual:** foto real da Pra. Ezenete em círculo, centralizada, com o parágrafo curto embaixo. Os 4 contadores lado a lado no desktop e em grade 2x2 no celular, todos com a mesma altura, número grande em terracota e legenda pequena embaixo. Os depoimentos são os mesmos 3 prints reais usados no bloco de relatos da oferta do quiz, recortados só no comentário, dentro de card claro, em carrossel, com a mesma legenda de aviso. Ainda não existe depoimento sobre os manuais em si. Quando existir, ele entra aqui no lugar dos prints gerais.

## **Bloco 8 · Pra quem é**

Essa condição é pra você que:

  - Quer cuidar da casa inteira, e não só da área que mais dói agora;
  - Quer orar por cada pessoa da sua casa sabendo o que pedir, e não só quando a crise estoura;
  - Já fez campanha, jejum e propósito, e quer entender o que está acontecendo antes de pedir de novo;
  - Quer ter a direção da próxima área na mão antes de ela apertar;
  - \[COM A 2ª ÁREA\] Viu no teste que \[SEGUNDA ÁREA\] também pesa aí. \[SEM A 2ª ÁREA\] Quer cuidar da casa inteira com o mesmo jeito de orar.

**Visual:** título centralizado. Lista com check verde em círculo à esquerda de cada item, texto 17px, espaço igual entre os itens. Fundo creme na seção inteira.

## **Bloco 9 · Você recebe**

Levando o combo agora, você recebe:

  - Combo Casa Restaurada: os 4 juntos, com o \[MANUAL COMPRADO\] que já é seu
  - Os 3 manuais que faltam completos, com 20 armas espirituais cada
  - Situação, causa e o que orar em cada situação, com a Palavra aplicada · incluso
  - Entrega no mesmo e-mail da sua compra · incluso
  - Pra ler no celular ou imprimir · incluso
  - Garantia de 7 dias · incluso

**Visual:** cartão branco com borda fina creme. Mockup dos 4 manuais em leque no topo (capas inteiras, a do manual dela na frente com o selo verde "✓ já é seu"). Os dois primeiros itens com check terracota e nome em negrito; os 4 seguintes com a etiqueta "incluso" em verde à direita, alinhada.

## **Bloco 10 · Preço**

VALOR FORA DESTA PÁGINA

Cada manual sai por R$ 47. Os 3 que faltam, separados, somam R$ 141.

CONDIÇÃO DE QUEM ACABOU DE COMPRAR

SÓ NESTA PÁGINA

O Combo Casa Restaurada sai por

12x de R$ 10,03

ou R$ 97 à vista

Você fica com os 3 que faltam por R$ 44 a menos do que pagaria por eles separados, e o \[MANUAL COMPRADO\] vem junto no combo.

**Visual:** cartão de preço igual ao da oferta do quiz: mockup pequeno dos 4 manuais em cima, "VALOR FORA DESTA PÁGINA" em caixa alta pequena e cinza, com a conta dos R$ 141 em texto médio (sem riscar, só informando). O selo "SÓ NESTA PÁGINA" em terracota claro. "12x de R$ 10,03" grande, em terracota, e "ou R$ 97 à vista" logo abaixo, menor. A frase da diferença de R$ 44 em 15px, centralizada. A partir deste bloco, o botão de aceite fica fixo no rodapé.

## **Bloco 11 · Botão de aceite e link de recusa**

**\[ SIM, QUERO COMPLETAR A MINHA CASA COM OS 4 MANUAIS \]**

Linha pequena embaixo do botão:

Pagamento único. Pagou no cartão? É um clique, no mesmo cartão. Pagou no Pix? Você gera um Pix novo na próxima tela.

Link de recusa:

Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa condição.

**Visual:** botão largo em pílula terracota, dentro do cartão de preço, com o mesmo texto do botão fixo do rodapé. Microtexto 13px em cinza, com cadeado e os ícones de cartão e de Pix alinhados ao texto. O link de recusa fica logo abaixo, sublinhado, cinza (\#94867A), 14px, legível e sem cor forte. Leva pro downsell, levando junto o mesmo ?m e a 2ª área.

## **Bloco 12 · Garantia**

FIQUE TRANQUILA, A SUA COMPRA É SEGURA

Você tem 7 dias pra ler, orar e usar. Se sentir que não é pra você, é só mandar uma mensagem pro nosso suporte que a gente devolve todo o valor desta compra.

**Visual:** selo circular de 7 dias em SVG à esquerda, título em caixa alta pequena e o texto ao lado, em 16px. Cartão creme próprio, separado do preço.

## **Bloco 13 · Perguntas frequentes**

**Vou pagar de novo pelo manual que eu comprei?**

Não. O que você já pagou continua valendo e não é cobrado de novo. O combo traz os 4 manuais juntos, e o \[MANUAL COMPRADO\] entra nele porque o combo é o conjunto completo da casa. Na prática, o que chega de novo pra você são os outros 3.

**Como eu recebo?**

Os manuais chegam no mesmo e-mail da sua compra, logo depois que o pagamento é confirmado. No Pix, chegam assim que o Pix for confirmado. Se não encontrar, olhe a caixa de spam ou fale com o nosso suporte.

**Posso aproveitar essa condição depois?**

Não. Ela aparece só aqui, logo depois da compra. Fora desta página, cada manual volta ao valor normal de R$ 47.

**Faz sentido pra quem está começando a orar agora?**

Faz. Os manuais não partem do princípio de que você já sabe orar com direção. Cada situação vem explicada, com o que orar e a Palavra pra usar, e dá pra começar com poucos minutos por dia.

**Isso garante que a situação da minha casa vai mudar?**

Não. Ninguém pode te garantir que o casamento volta, que o filho se converte ou que a dívida some. O que os manuais te dão é direção: entender o que está acontecendo em cada área da casa e saber o que orar ali.

**E se eu não gostar?**

Você tem 7 dias de garantia. Se sentir que não é pra você, é só mandar uma mensagem que a gente devolve 100% do valor, sem pergunta e sem burocracia.

**Visual:** acordeão fechado por padrão, com seta terracota à direita. Fundo branco. A pergunta da garantia de resultado fica sempre visível na lista (regra das páginas da Família).

## **Bloco 14 · Fechamento**

Deus não te chamou só pra cuidar da área que mais dói. Ele te chamou pra cuidar da casa.

Você já deu o passo mais difícil, que foi parar pra entender o que está acontecendo. A pergunta que fica é simples: quando a próxima área apertar, você quer estar sem saber o que orar ou já com a direção na mão?

\[COM A 2ª ÁREA\] E você já sabe qual área é essa: \[SEGUNDA ÁREA\].

Essa condição não aparece de novo.

**\[ SIM, QUERO COMPLETAR A MINHA CASA COM OS 4 MANUAIS \]**

12x de R$ 10,03 ou R$ 97 à vista · Garantia de 7 dias · Chega no mesmo e-mail da sua compra

Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa condição.

**Visual:** a primeira frase como título de fechamento centralizado, com "cuidar da casa" em terracota. O parágrafo em texto normal, centralizado. A linha da 2ª área em destaque, com o chip "Também pesa aí". "Essa condição não aparece de novo." em 15px, sem ícone de relógio. Botão largo terracota, a linha de resumo em 13px cinza embaixo e o mesmo link de recusa do bloco 11.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

# **PÁGINA B: os 3 manuais que faltam (R$ 47)**

## **Bloco 1 · Faixa de confirmação e retenção**

NÃO FECHE ESTA PÁGINA

Deu certo. O seu manual já está garantido e vai chegar no mesmo e-mail da sua compra.

Antes de você ir baixar, eu separei uma condição que só aparece aqui, logo depois da compra. Leia com calma até o final.

Compra feita · Condição especial · Acesso

**Visual:** faixa fina no topo com "NÃO FECHE ESTA PÁGINA" em caixa alta, terracota, letra pequena e espaçada. Logo abaixo, a linha "Deu certo..." com check verde em círculo à esquerda, em negrito, e o parágrafo seguinte menor. Depois, a barra de 3 etapas: "Compra feita" em verde com check, "Condição especial" acesa em terracota com a etiqueta "você está aqui" e "Acesso" em cinza. Isso mostra que a compra deu certo e que falta só um passo.

## **Bloco 2 · Celebrar a decisão \[VARIAÇÃO POR ÁREA\]**

Título (igual pra todas):

Você acabou de fazer o que pouca gente faz.

**Casamento**

A maioria passa anos orando pelo casamento do mesmo jeito, no escuro, e acha que é assim mesmo. Você não. Você parou pra entender o que está acontecendo aí dentro e levou o Casamento Restaurado, pra saber o que orar no silêncio dentro de casa, na briga que sempre volta e na desconfiança que não deixa você dormir.

**Filhos**

A maioria passa anos chorando por um filho sem saber o que pedir, e acha que só resta esperar. Você não. Você parou pra entender o que está acontecendo e levou o Filhos Restaurados, pra saber como ficar na brecha pelo seu filho quando ele se afasta de Deus, da igreja ou de você.

**Oração**

A maioria passa anos ajoelhando sem sentir que a oração sai do lugar, e acha que o problema é ela mesma. Você não. Você parou pra entender o que está acontecendo e levou o Vida de Oração Restaurada, pra voltar a orar com direção, inclusive nos dias em que a vontade de orar some.

**Financeiro**

A maioria passa anos correndo atrás da conta do mês e nunca ora pela vida financeira da casa com direção. Você não. Você parou pra entender o que está acontecendo e levou o Financeiro Restaurado, pra saber o que orar quando a conta não fecha, a dívida aperta e o peso fica todo em cima de uma pessoa só.

**Sem parâmetro**

A maioria passa anos orando do mesmo jeito, no escuro, e acha que é assim mesmo. Você não. Você parou pra entender o que está acontecendo na sua casa e levou o manual da área que mais dói agora.

Fecho do bloco (igual pra todas):

Começar pela área que mais dói foi a decisão certa. A partir de hoje, você vai pra oração sabendo o que está enfrentando ali.

Mas, antes de você ir baixar, eu preciso te mostrar uma coisa.

**Visual:** título centralizado em Raleway 800, grande (26 a 30px), com "pouca gente faz" em terracota. O parágrafo da área vira 2 ou 3 linhas curtas, com o nome do manual em negrito. Ao lado ou logo acima, a capa do manual que ela comprou em mockup pequeno, inteira, com o selo verde "✓ já é seu". O fecho fica centralizado, e a última frase em itálico puxa pro bloco seguinte.

## **Espaço do vídeo (segunda fase)**

Quando a Pra. Ezenete gravar o vídeo curto do upsell, ele entra aqui. Até lá, a página segue direto pro bloco 3.

**Visual:** espaço 16:9 com cantos de 16px, só quando o vídeo existir. Sem placeholder na tela até lá.

## **Bloco 3 · O aviso**

Dentro de casa, nada aperta sozinho.

Quem vive numa casa sabe como é. Quando uma área da casa aperta, as outras sentem junto. A briga com o marido muda o clima da casa inteira. O filho se fecha no quarto. A conta que não fecha tira o sono. E a oração vai esfriando no meio disso tudo.

Isso acontece porque a casa é uma só. Não tem nada a ver com a sua fé ser pequena.

"Com a sabedoria se edifica a casa, e com a inteligência ela se firma."

PROVÉRBIOS 24:3 · A PALAVRA FALA DA CASA INTEIRA

Repara que o versículo não fala de um cômodo. Fala da casa. Você acabou de buscar direção pra área que mais dói, e esse é o começo certo. Só que, quando outra área apertar e você estiver sem direção nela, o mais comum é voltar a orar do jeito de antes, sem saber o que pedir.

Por isso tanta gente começa bem e, uns meses depois, se vê de novo perdida na oração. Cuidou de uma área e deixou as outras pro dia em que apertassem. E, quando apertam, costumam apertar juntas. Foi pensando nisso que eu preparei esta página.

**Visual:** "Dentro de casa, nada aperta sozinho." como título de seção centralizado, com "nada aperta sozinho" em terracota. A frase "Quando uma área da casa aperta, as outras sentem junto." vira destaque com fio vertical verde-escuro à esquerda, 19px. Logo abaixo, as 4 cenas viram 4 mini-cards creme, um por área, em grade 2x2 no desktop e em pilha no celular, cada um com o símbolo da área e a frase curta: aliança com "A briga com o marido muda o clima da casa inteira", criança com "O filho se fecha no quarto", carteira com "A conta que não fecha tira o sono" e mãos em oração com "A oração vai esfriando". Os 4 cards têm a mesma altura e ficam soltos, sem seta ligando um ao outro, pra cada área aparecer como uma situação separada. O versículo fica num cartão creme largo, em itálico 20px, com a referência embaixo em caixa alta pequena e espaçada, terracota. Os dois últimos parágrafos em texto normal, no máximo 3 linhas cada no celular.

## **Bloco 4 · O problema que continua**

\[COM A 2ª ÁREA\]

E no seu caso tem um detalhe. No teste, além do que você escolheu, apareceu mais uma coisa pesando aí: \[SEGUNDA ÁREA\].

Talvez você nem tenha parado pra pensar nisso agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas as suas respostas mostram que essa outra área também está apertando, e ela não espera a primeira melhorar pra pesar.

O \[MANUAL COMPRADO\] continua sendo o seu começo, e ele dá conta da área que mais dói. Ele só não fala de \[SEGUNDA ÁREA\], porque cada manual cuida de uma área da casa.

\[SEM A 2ª ÁREA\]

Pensa na sua casa hoje. Quase sempre, além da área que mais dói, tem uma segunda apertando junto.

Talvez você nem tenha parado pra pensar nela agora. Faz sentido: quando uma área dói muito, a gente só olha pra ela. Mas a outra não espera a primeira melhorar pra pesar.

O \[MANUAL COMPRADO\] continua sendo o seu começo, e ele dá conta da área que mais dói. Ele só não fala das outras áreas, porque cada manual cuida de uma área da casa.

**Visual:** com a 2ª área, a frase "apareceu mais uma coisa pesando aí: \[SEGUNDA ÁREA\]" vira o mesmo chip do resultado do quiz ("Também pesa aí"), com o símbolo pequeno da área e o ícone alinhado ao texto, pra ela reconhecer o que viu no teste. Sem a 2ª área, a primeira frase fica em destaque com fio vertical verde-escuro. O último parágrafo fica num cartão creme claro, com check verde ao lado de "continua sendo o seu começo", pra deixar claro que o manual dela vale sozinho.

## **Bloco 5 · O caminho da casa inteira**

São 4 portas na mesma casa. Da primeira, você já está cuidando.

Os meus 4 manuais usam o mesmo método. Pra cada situação, você entende o que está acontecendo, de onde aquilo vem e o que orar, com a Palavra na mão. No manual que você comprou, você aprende esse jeito de orar. Nos outros, você usa esse mesmo jeito em cada área da casa, sem começar do zero.

Nesta página, e só nela, os 3 manuais que faltam destravam juntos. O \[MANUAL COMPRADO\] já é seu e fica do jeito que está:

01 · A PORTA QUE MAIS DÓI HOJE

\[MANUAL COMPRADO\]

A área que você escolheu no teste. Aqui você aprende o método.

JÁ É SEU

02 · \[COM A 2ª ÁREA\] A PORTA QUE TAMBÉM PESA

\[MANUAL DA SEGUNDA ÁREA\]

A área que apareceu no seu teste. Você usa o mesmo método onde a pressão já chegou.

DESTRAVA HOJE

\[SEM A 2ª ÁREA\] 02, 03 e 04 · AS OUTRAS PORTAS DA CASA

Os 3 manuais que você ainda não tem, na ordem casamento, filhos, oração e financeiro (pulando o que ela comprou), cada um com a etiqueta DESTRAVA HOJE.

03 e 04 · \[COM A 2ª ÁREA\] AS PORTAS QUE HOJE ESTÃO QUIETAS

Os outros 2 manuais. Pra quando essas áreas apertarem, você já ter a direção na mão.

DESTRAVA HOJE

\[ QUERO VER A CONDIÇÃO \]

**Visual:** título de seção centralizado, com "você já está cuidando" em verde. O parágrafo do método vira 3 chips em sequência (Situação · Causa · O que orar), com o ícone de Bíblia aberta ao lado de "com a Palavra na mão". Depois, uma linha do tempo vertical com 4 portas, igual à linha do tempo do resultado do quiz: a 01 em verde com check e a etiqueta "JÁ É SEU"; as outras em terracota com cadeado aberto e a etiqueta "DESTRAVA HOJE", cada uma com a capa pequena do manual. Com a 2ª área, a porta 02 ganha o chip "Também pesa aí" e vem logo depois da 01. Os cards têm a mesma altura e o mesmo espaço entre eles. O botão "QUERO VER A CONDIÇÃO" é largo, em pílula terracota, e só rola a página até o bloco 10.

## **Bloco 6 · Um bloco pra cada manual novo \[VARIAÇÃO POR ÁREA\]**

Título do bloco: Os 3 que destravam hoje

Aparecem só os 3 manuais que ela ainda não tem. O que ela comprou sai deste bloco. \[COM A 2ª ÁREA\] O \[MANUAL DA SEGUNDA ÁREA\] vem primeiro, com o chip "Também pesa aí". \[SEM A 2ª ÁREA\] A ordem é casamento, filhos, oração e financeiro.

**Destrava hoje: Casamento Restaurado**

Pra orar pelo casamento sabendo o que está acontecendo: no silêncio dentro de casa, na briga que sempre volta, na traição, quando se fala em ir embora. Você aprende a orar a favor do casamento, e não contra a pessoa.

Chips: 20 armas espirituais · Situação, causa e o que orar · Oração a favor do casamento

**Destrava hoje: Filhos Restaurados**

Pra ficar na brecha pelo filho que se afastou de Deus, da igreja ou de você. Você aprende a largar a culpa que não é sua e a orar pela mente e pelas escolhas dele com a Palavra, sem implorar e sem sermão.

Chips: 20 armas espirituais · Situação, causa e o que orar · Oração pelo filho, mesmo de longe

**Destrava hoje: Vida de Oração Restaurada**

Pra quem ajoelha e não sai nada, ou sente que a oração não passa do teto. Você aprende a voltar a orar começando com poucos minutos por dia, até isso virar costume, inclusive nos dias em que a vontade de orar some.

Chips: 20 armas espirituais · Situação, causa e o que orar · Recomeço de 5 a 15 minutos

**Destrava hoje: Financeiro Restaurado**

Pra orar pela vida financeira da casa: a dívida, o nome sujo, o peso que fica todo em cima de uma pessoa só. Você aprende a juntar oração e responsabilidade, com um passo prático pra cada dia e sem promessa de prosperidade.

Chips: 20 armas espirituais · Situação, causa e o que orar · Oração junto com um passo prático

Linha embaixo dos cards:

O mesmo método do manual que você já tem, agora pra cada área da casa.

**Visual:** título do bloco centralizado. Cada manual num card creme com a capa pequena inteira à esquerda (mockup, nada cortado), a etiqueta "Destrava hoje" em terracota pequena em cima do nome, o nome em Raleway 700 e as 2 frases embaixo. Os chips ficam numa linha embaixo do texto, com ícone de linha (escudo, lista, mãos em oração). Cards em pilha no celular, todos da mesma altura. Se der, mostrar uma página interna real de um dos manuais com moldura e fade, como no bloco "Por dentro de cada situação" da oferta do quiz.

## **Bloco 7 · Prova**

Quem ensina

Eu estou há mais de 20 anos à frente da intercessão da Estância Paraíso, em Sabará (MG). Já formei mais de 200 mil pessoas na intercessão e sou autora do livro Uma Vida de Milagres.

20+ anos · à frente da intercessão da Estância Paraíso

200 mil · pessoas formadas na intercessão

60 · armas espirituais novas pra sua casa

Autora · de Uma Vida de Milagres

Veja o que dizem as mulheres que aprenderam a orar comigo:

(os mesmos 3 prints reais da oferta do quiz, com a mesma legenda de aviso)

**Visual:** foto real da Pra. Ezenete em círculo, centralizada, com o parágrafo curto embaixo. Os 4 contadores lado a lado no desktop e em grade 2x2 no celular, todos com a mesma altura, número grande em terracota e legenda pequena embaixo. Os depoimentos são os mesmos 3 prints reais usados no bloco de relatos da oferta do quiz, recortados só no comentário, dentro de card claro, em carrossel, com a mesma legenda de aviso. Ainda não existe depoimento sobre os manuais em si. Quando existir, ele entra aqui no lugar dos prints gerais.

## **Bloco 8 · Pra quem é**

Essa condição é pra você que:

  - Quer cuidar da casa inteira, e não só da área que mais dói agora;
  - Quer orar por cada pessoa da sua casa sabendo o que pedir, e não só quando a crise estoura;
  - Já fez campanha, jejum e propósito, e quer entender o que está acontecendo antes de pedir de novo;
  - Quer ter a direção da próxima área na mão antes de ela apertar;
  - \[COM A 2ª ÁREA\] Viu no teste que \[SEGUNDA ÁREA\] também pesa aí. \[SEM A 2ª ÁREA\] Quer cuidar da casa inteira com o mesmo jeito de orar.

**Visual:** título centralizado. Lista com check verde em círculo à esquerda de cada item, texto 17px, espaço igual entre os itens. Fundo creme na seção inteira.

## **Bloco 9 · Você recebe**

Levando os 3 agora, você recebe:

  - Os 3 manuais que faltam completos, com 20 armas espirituais cada
  - Situação, causa e o que orar em cada situação, com a Palavra aplicada · incluso
  - Entrega no mesmo e-mail da sua compra · incluso
  - Pra ler no celular ou imprimir · incluso
  - Garantia de 7 dias · incluso

O \[MANUAL COMPRADO\] continua seu, do jeito que você comprou.

**Visual:** cartão branco com borda fina creme. Mockup dos 3 manuais novos em leque no topo (capas inteiras). O primeiro item com check terracota e nome em negrito; os seguintes com a etiqueta "incluso" em verde à direita, alinhada. A última linha fora do cartão, pequena, com check verde e a capa mínima do manual dela.

## **Bloco 10 · Preço**

VALOR FORA DESTA PÁGINA

Cada manual sai por R$ 47. Os 3, separados, somam R$ 141.

CONDIÇÃO DE QUEM ACABOU DE COMPRAR

SÓ NESTA PÁGINA

Os 3 manuais que faltam saem por

12x de R$ 4,86

ou R$ 47 à vista

Dá R$ 15,67 por manual, com as 20 armas espirituais de cada um.

**Visual:** cartão de preço igual ao da oferta do quiz: mockup pequeno dos 3 manuais novos em cima, "VALOR FORA DESTA PÁGINA" em caixa alta pequena e cinza, com a conta dos R$ 141 em texto médio (sem riscar, só informando). O selo "SÓ NESTA PÁGINA" em terracota claro. "12x de R$ 4,86" grande, em terracota, e "ou R$ 47 à vista" logo abaixo, menor. A frase do valor por manual em 15px, centralizada. A partir deste bloco, o botão de aceite fica fixo no rodapé.

## **Bloco 11 · Botão de aceite e link de recusa**

**\[ SIM, QUERO OS 3 QUE FALTAM POR 12X DE R$ 4,86 \]**

Linha pequena embaixo do botão:

Pagamento único. Pagou no cartão? É um clique, no mesmo cartão. Pagou no Pix? Você gera um Pix novo na próxima tela.

Link de recusa:

Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa condição.

Por enquanto leva pra página de obrigado (downsell da B ainda não definido).

**Visual:** botão largo em pílula terracota, dentro do cartão de preço, com o mesmo texto do botão fixo do rodapé. Microtexto 13px em cinza, com cadeado e os ícones de cartão e de Pix alinhados ao texto. O link de recusa fica logo abaixo, sublinhado, cinza (\#94867A), 14px, legível e sem cor forte. Por enquanto leva pra página de obrigado, porque a B ainda não tem downsell (até o downsell da B ser definido).

## **Bloco 12 · Garantia**

FIQUE TRANQUILA, A SUA COMPRA É SEGURA

Você tem 7 dias pra ler, orar e usar. Se sentir que não é pra você, é só mandar uma mensagem pro nosso suporte que a gente devolve todo o valor desta compra.

**Visual:** selo circular de 7 dias em SVG à esquerda, título em caixa alta pequena e o texto ao lado, em 16px. Cartão creme próprio, separado do preço.

## **Bloco 13 · Perguntas frequentes**

**Vou pagar de novo pelo manual que eu comprei?**

Não. O \[MANUAL COMPRADO\] já é seu e não entra nessa cobrança. O valor desta página é só pelos 3 manuais que faltam.

**Como eu recebo?**

Os 3 manuais chegam no mesmo e-mail da sua compra, logo depois que o pagamento é confirmado. No Pix, chegam assim que o Pix for confirmado. Se não encontrar, olhe a caixa de spam ou fale com o nosso suporte.

**Posso aproveitar essa condição depois?**

Não. Ela aparece só aqui, logo depois da compra. Fora desta página, cada manual volta ao valor normal de R$ 47.

**Faz sentido pra quem está começando a orar agora?**

Faz. Os manuais não partem do princípio de que você já sabe orar com direção. Cada situação vem explicada, com o que orar e a Palavra pra usar, e dá pra começar com poucos minutos por dia.

**Isso garante que a situação da minha casa vai mudar?**

Não. Ninguém pode te garantir que o casamento volta, que o filho se converte ou que a dívida some. O que os manuais te dão é direção: entender o que está acontecendo em cada área da casa e saber o que orar ali.

**E se eu não gostar?**

Você tem 7 dias de garantia. Se sentir que não é pra você, é só mandar uma mensagem que a gente devolve 100% do valor, sem pergunta e sem burocracia.

**Visual:** acordeão fechado por padrão, com seta terracota à direita. Fundo branco. A pergunta da garantia de resultado fica sempre visível na lista (regra das páginas da Família).

## **Bloco 14 · Fechamento**

Deus não te chamou só pra cuidar da área que mais dói. Ele te chamou pra cuidar da casa.

Você já deu o passo mais difícil, que foi parar pra entender o que está acontecendo. A pergunta que fica é simples: quando a próxima área apertar, você quer estar sem saber o que orar ou já com a direção na mão?

\[COM A 2ª ÁREA\] E você já sabe qual área é essa: \[SEGUNDA ÁREA\].

Essa condição não aparece de novo.

**\[ SIM, QUERO OS 3 QUE FALTAM POR 12X DE R$ 4,86 \]**

12x de R$ 4,86 ou R$ 47 à vista · Garantia de 7 dias · Chega no mesmo e-mail da sua compra

Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa condição.

Por enquanto leva pra página de obrigado (downsell da B ainda não definido).

**Visual:** a primeira frase como título de fechamento centralizado, com "cuidar da casa" em terracota. O parágrafo em texto normal, centralizado. A linha da 2ª área em destaque, com o chip "Também pesa aí". "Essa condição não aparece de novo." em 15px, sem ícone de relógio. Botão largo terracota, a linha de resumo em 13px cinza embaixo e o mesmo link de recusa do bloco 11.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

# **DOWNSELL DA PÁGINA A: o mesmo kit por R$ 67**

Aparece só pra quem recusou a página A. É curta e não tem tese nem história própria: o kit é o mesmo e só o valor caiu.

## **Bloco 1 · Faixa**

ESPERE: UMA ÚLTIMA CONDIÇÃO ANTES DE VOCÊ SAIR

O seu manual continua garantido e vai chegar no mesmo e-mail da sua compra.

Compra feita · Última condição · Acesso

**Visual:** a mesma faixa do upsell, com "ESPERE" em terracota e a mesma barra de 3 etapas, agora com "Última condição" acesa.

## **Bloco 2 · Título**

O mesmo Combo Casa Restaurada. R$ 30 a menos.

Tudo bem você ter recusado. Mas, se o motivo foi o valor, isso dá pra resolver. O mesmo combo com os 4 manuais sai aqui por 12x de R$ 6,93. É a última condição antes de você ir baixar o seu manual.

**Visual:** título centralizado em Raleway 800, um pouco menor que o do upsell, com "R$ 30 a menos" em terracota. Mockup dos 4 manuais em leque, menor que no upsell, com a capa do manual dela na frente e o selo "✓ já é seu".

## **Bloco 3 · O que muda**

O que muda entre a página anterior e esta? Só o valor.

A CONDIÇÃO ANTERIOR

O combo com os 4 manuais

12x de R$ 10,03

Você preferiu não levar. Tudo bem.

A ÚLTIMA CONDIÇÃO

O mesmo combo, sem tirar nada

12x de R$ 6,93

Os mesmos 4 manuais e as mesmas 20 armas espirituais em cada um.

**Visual:** 2 cartões lado a lado no desktop e em pilha no celular, com a mesma altura e o mesmo ícone dos 4 manuais nos dois. O da esquerda em cinza claro, o da direita com borda terracota e o valor em destaque. "Só o valor." em terracota, como destaque do título do bloco.

## **Bloco 4 · O que entra \[VARIAÇÃO POR ÁREA\]**

**Casamento:** Você já tem o Casamento Restaurado. Com esse valor, entram também o Filhos Restaurados, o Vida de Oração Restaurada e o Financeiro Restaurado.

**Filhos:** Você já tem o Filhos Restaurados. Com esse valor, entram também o Casamento Restaurado, o Vida de Oração Restaurada e o Financeiro Restaurado.

**Oração:** Você já tem o Vida de Oração Restaurada. Com esse valor, entram também o Casamento Restaurado, o Filhos Restaurados e o Financeiro Restaurado.

**Financeiro:** Você já tem o Financeiro Restaurado. Com esse valor, entram também o Casamento Restaurado, o Filhos Restaurados e o Vida de Oração Restaurada.

**Sem parâmetro:** Você já tem o seu manual. Com esse valor, entram também os outros 3.

\[COM A 2ª ÁREA\] Inclusive o \[MANUAL DA SEGUNDA ÁREA\], da área que também pesa aí.

**Visual:** a mesma linha do tempo das 4 portas do upsell, em tamanho menor: a porta dela em verde com check e as outras três em terracota com "+". Com a 2ª área, a porta dela ganha o chip "Também pesa aí".

## **Bloco 5 · Preço e botão**

ÚLTIMA CONDIÇÃO · SÓ NESTA PÁGINA

O Combo Casa Restaurada sai por

12x de R$ 6,93

ou R$ 67 à vista

**\[ SIM, QUERO O COMBO COMPLETO POR 12X DE R$ 6,93 \]**

Linha pequena embaixo do botão:

Pagamento único. Pagou no cartão? É um clique, no mesmo cartão. Pagou no Pix? Você gera um Pix novo na próxima tela.

Pra ficar claro: os manuais são direção pra orar em cada área da casa. Não são promessa de resultado.

**Visual:** cartão de preço igual ao do upsell, com "12x de R$ 6,93" grande em terracota. Botão largo em pílula terracota, microtexto cinza com os ícones de cartão e de Pix. A linha vermelha num cartão bege pequeno embaixo, em 15px, legível. Sem botão fixo no rodapé, porque a página é curta.

## **Bloco 6 · Perguntas rápidas**

**É o mesmo combo da página anterior?**

Exatamente o mesmo. Os 4 manuais completos, com as 20 armas espirituais de cada um. Nada foi tirado.

**Vou pagar de novo pelo manual que eu comprei?**

Não. O que você já pagou continua valendo e não é cobrado de novo. Ele vem no combo porque o combo é o conjunto completo da casa. O que chega de novo são os outros 3.

**Posso aproveitar essa condição depois?**

Não. Ela só aparece aqui. Fora desta página, cada manual volta ao valor normal de R$ 47.

**E se eu não gostar?**

Você tem 7 dias de garantia. É só mandar uma mensagem que a gente devolve todo o valor.

**Visual:** acordeão fechado, 4 itens, seta terracota à direita.

## **Bloco 7 · Link de recusa**

Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa última condição.

**Visual:** link de texto sublinhado, cinza (\#94867A), 14px, centralizado, com bastante respiro acima. Leva pra entrega do que ela já comprou.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

# **Textos dos botões, juntos**

Página A

\- Aceitar: SIM, QUERO COMPLETAR A MINHA CASA COM OS 4 MANUAIS

\- Recusar: Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa condição.

Página B

\- Aceitar: SIM, QUERO OS 3 QUE FALTAM POR 12X DE R$ 4,86

\- Recusar: Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa condição.

Downsell da A

\- Aceitar: SIM, QUERO O COMBO COMPLETO POR 12X DE R$ 6,93

\- Recusar: Não, obrigada. Prefiro seguir só com o \[MANUAL COMPRADO\] e abrir mão dessa última condição.

Botão do bloco 5 (A e B): QUERO VER A CONDIÇÃO (só rola até o preço)

  