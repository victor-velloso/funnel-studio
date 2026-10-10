#!/usr/bin/env python3
"""Gera pagina-a.html, pagina-b.html e downsell-a.html. Rode: python3 build.py
Copy fixa aqui; variáveis em config.js; textos por área em textos.js."""
KIT = '<span data-var="kitNome">Combo Casa Restaurada</span>'
def V(k, d): return f'<span data-var="{k}">{d}</span>'
def MC(art=""): return f'<span data-mc="{art}">{(art+" ") if art else ""}seu manual</span>'

HEAD = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Raleway:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="upsell.css">
</head>
<body data-pagina="{pag}" class="{cls}">
'''
FOOT = '''<script src="config.js"></script>
<script src="textos.js"></script>
<script src="upsell.js"></script>
</body>
</html>
'''
def etapas(atual):
    return f'''<div class="etapas" role="list">
      <div class="etapa feita" role="listitem"><span class="pt" data-ic="check" data-size="15"></span><span class="nm">Compra feita</span></div>
      <div class="etapa atual" role="listitem"><span class="pt"></span><span class="nm">{atual}</span>{'<span class="aqui">você está aqui</span>' if atual=='Condição especial' else ''}</div>
      <div class="etapa" role="listitem"><span class="pt"></span><span class="nm">Acesso</span></div>
    </div>'''

def pgto():
    return '''<p class="pgto"><span class="ics"><span data-ic="lock" data-size="15"></span><span data-ic="card" data-size="15"></span><span data-ic="pix" data-size="15"></span></span><span>Pagamento único. Pagou no cartão? É um clique, no mesmo cartão. Pagou no Pix? Você gera um Pix novo na próxima tela.</span></p>'''

SELO7 = '''<svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="36" fill="#fff" stroke="#A25A38" stroke-width="1.5"/><circle cx="38" cy="38" r="30" fill="none" stroke="#A25A38" stroke-width="1" stroke-dasharray="2 3"/><text x="38" y="42" text-anchor="middle" font-family="Raleway,sans-serif" font-weight="800" font-size="24" fill="#A25A38">7</text><text x="38" y="54" text-anchor="middle" font-family="Open Sans,sans-serif" font-weight="700" font-size="7.5" letter-spacing="1.5" fill="#7E4527">DIAS</text></svg>'''

def upsell(pag):
    A = pag == "a"
    btn = "SIM, QUERO COMPLETAR A MINHA CASA COM OS 4 MANUAIS" if A else f'SIM, QUERO OS 3 QUE FALTAM POR {V("parcelaB","12x de R$ 4,86")}'
    aceite = "aceiteA" if A else "aceiteB"
    recusa = "recusaA" if A else "obrigado"
    parc = V("parcelaA","12x de R$ 10,03") if A else V("parcelaB","12x de R$ 4,86")
    avis = V("avistaA","R$ 97") if A else V("avistaB","R$ 47")
    recusa_txt = f'Não, obrigada. Prefiro seguir só com {MC("o")} e abrir mão dessa condição.'
    h = HEAD.format(title=("Combo Casa Restaurada" if A else "Os 3 manuais que faltam") + " · Família Restaurada", pag=pag, cls="tem-fixo")
    h += f'''
<!-- BLOCO 1 · Faixa de confirmação e retenção -->
<div class="faixa">NÃO FECHE ESTA PÁGINA</div>
<header class="wrap topo">
  <div class="ok-linha"><span class="bola" data-ic="check" data-size="17"></span><p>Deu certo. O seu manual já está garantido e vai chegar no mesmo e-mail da sua compra.</p></div>
  <p class="sub">Antes de você ir baixar, eu separei uma condição que só aparece aqui, logo depois da compra. Leia com calma até o final.</p>
  {etapas("Condição especial")}
</header>

<main>
<!-- BLOCO 2 · Celebrar a decisão [varia por ?m] -->
<section class="sec wrap reveal">
  <div data-slot="capa-dela"></div>
  <h1 class="h-hero">Você acabou de fazer o que <span class="terra">pouca gente faz.</span></h1>
  <div class="celebrar" data-slot="celebrar"></div>
  <div class="fecho2">
    <p>Começar pela área que mais dói foi a decisão certa. A partir de hoje, você vai pra oração sabendo o que está enfrentando ali.</p>
    <em>Mas, antes de você ir baixar, eu preciso te mostrar uma coisa.</em>
  </div>
</section>

<!-- ESPAÇO DO VÍDEO (segunda fase): só entra quando o vídeo da Pra. Ezenete existir.
<section class="sec wrap"><div style="aspect-ratio:16/9;border-radius:16px;overflow:hidden">[vídeo]</div></section>
-->

<!-- BLOCO 3 · O aviso -->
<section class="sec wrap reveal">
  <h2 class="t-sec">Dentro de casa, <span class="terra">nada aperta sozinho.</span></h2>
  <p class="center">Quem vive numa casa sabe como é.</p>
  <p class="destaque blk">Quando uma área da casa aperta, as outras sentem junto.</p>
  <ul class="cenas4">
    <li class="cena4"><img src="assets/fr-simbolo-casamento.svg" width="40" height="40" alt=""><span>A briga com o marido muda o clima da casa inteira.</span></li>
    <li class="cena4"><img src="assets/fr-simbolo-filhos.svg" width="40" height="40" alt=""><span>O filho se fecha no quarto.</span></li>
    <li class="cena4"><img src="assets/fr-simbolo-financeiro.svg" width="40" height="40" alt=""><span>A conta que não fecha tira o sono.</span></li>
    <li class="cena4"><img src="assets/fr-simbolo-oracao.svg" width="40" height="40" alt=""><span>E a oração vai esfriando no meio disso tudo.</span></li>
  </ul>
  <p class="blk">Isso acontece porque a casa é uma só. Não tem nada a ver com a sua fé ser pequena.</p>
  <figure class="versiculo blk">
    <blockquote>“Com a sabedoria se edifica a casa, e com a inteligência ela se firma.”</blockquote>
    <cite>PROVÉRBIOS 24:3 · A PALAVRA FALA DA CASA INTEIRA</cite>
  </figure>
  <div class="blk">
    <p>Repara que o versículo não fala de um cômodo. Fala da casa. Você acabou de buscar direção pra área que mais dói, e esse é o começo certo.</p>
    <p>Só que, quando outra área apertar e você estiver sem direção nela, o mais comum é voltar a orar do jeito de antes, sem saber o que pedir.</p>
    <p>Por isso tanta gente começa bem e, uns meses depois, se vê de novo perdida na oração. Cuidou de uma área e deixou as outras pro dia em que apertassem.</p>
    <p>E, quando apertam, costumam apertar juntas. Foi pensando nisso que eu preparei esta página.</p>
  </div>
</section>

<!-- BLOCO 4 · O problema que continua [varia por ?area] -->
<section class="sec wrap reveal">
  <div data-slot="gancho4"></div>
</section>

<!-- BLOCO 5 · O caminho da casa inteira -->
<section class="sec wrap reveal">
  <h2 class="t-sec">São 4 portas na mesma casa. Da primeira, <span class="verde">você já está cuidando.</span></h2>
  <p class="center">Os meus 4 manuais usam o mesmo método. Pra cada situação, você entende o que está acontecendo, de onde aquilo vem e o que orar, com a Palavra na mão.</p>
  <div class="metodo"><span class="m-chip">Situação</span><span class="sep" data-ic="arrowR" data-size="14"></span><span class="m-chip">Causa</span><span class="sep" data-ic="arrowR" data-size="14"></span><span class="m-chip">O que orar</span></div>
  <p class="palavra"><span class="ib" data-ic="book" data-size="17"></span>com a Palavra na mão</p>
  <div class="blk">
    <p>No manual que você comprou, você aprende esse jeito de orar. Nos outros, você usa esse mesmo jeito em cada área da casa, sem começar do zero.</p>
    {('<p>Nesta página, e só nela, você leva o ' + KIT + ', com os 4 manuais juntos. ' + MC("O") + ' vem no combo junto com os outros 3, pra você ter a casa inteira no mesmo lugar. Na prática, o que chega de novo pra você são os 3 que faltam:</p>' if A else '<p>Nesta página, e só nela, os 3 manuais que faltam destravam juntos. ' + MC("O") + ' já é seu e fica do jeito que está:</p>')}
  </div>
  <div data-slot="portas"></div>
</section>

<!-- BLOCO 6 · Um bloco pra cada manual novo [varia por ?m e ?area] -->
<section class="sec wrap reveal">
  <h2 class="t-sec">{'O que destrava hoje no combo' if A else 'Os 3 que destravam hoje'}</h2>
  <div class="manuais" data-slot="manuais"></div>
  <div data-slot="preview"></div>
  <p class="linha6">O mesmo método do manual que você já tem, agora pra cada área da casa.</p>
</section>

<!-- BLOCO 7 · Prova -->
<section class="sec wrap reveal">
  <div class="foto"><img src="assets/fr-ezenete-autora.webp" alt="Pra. Ezenete Rodrigues" width="600" height="604" loading="lazy"></div>
  <h2 class="t-sec">Quem ensina</h2>
  <p class="center">Eu sou a Pra. Ezenete Rodrigues e estou há mais de 20 anos à frente da intercessão da Estância Paraíso, em Sabará (MG). Já formei mais de 200 mil pessoas na intercessão e sou autora do livro <em>Uma Vida de Milagres</em>.</p>
  <div class="numeros">
    <div class="num"><b>20+ anos</b><span>à frente da intercessão da Estância Paraíso</span></div>
    <div class="num"><b>200 mil</b><span>pessoas formadas na intercessão</span></div>
    <div class="num"><b>60</b><span>armas espirituais novas pra sua casa</span></div>
    <div class="num"><b>Autora</b><span>de Uma Vida de Milagres</span></div>
  </div>
  <p class="blk center"><strong>Veja o que dizem as mulheres que aprenderam a orar comigo:</strong></p>
  <div class="relatos">
    <figure class="relato"><div class="shot"><img src="assets/fr-relato-1-recorte.webp" alt="Relato de @katianascimento9902" width="750" height="214" loading="lazy"></div><figcaption>@katianascimento9902</figcaption></figure>
    <figure class="relato"><div class="shot"><img src="assets/fr-relato-2-recorte.webp" alt="Relato de @andrezarosolen" width="750" height="248" loading="lazy"></div><figcaption>@andrezarosolen</figcaption></figure>
    <figure class="relato"><div class="shot claro"><img src="assets/fr-relato-3-recorte.webp" alt="Relato de @maria.rgoncalves" width="454" height="99" loading="lazy"></div><figcaption>@maria.rgoncalves</figcaption></figure>
  </div>
  <p class="legenda">Relatos reais publicados nas minhas redes. São testemunhos pessoais e não representam promessa de resultado.</p>
</section>

<!-- BLOCO 8 · Pra quem é (fundo creme) -->
<section class="sec-creme reveal">
  <div class="wrap">
    <h2 class="t-sec">Essa condição é pra você que:</h2>
    <ul class="checks">
      <li><span class="ck" data-ic="check" data-size="15"></span><span>Quer cuidar da casa inteira, e não só da área que mais dói agora;</span></li>
      <li><span class="ck" data-ic="check" data-size="15"></span><span>Quer orar por cada pessoa da sua casa sabendo o que pedir, e não só quando a crise estoura;</span></li>
      <li><span class="ck" data-ic="check" data-size="15"></span><span>Já fez campanha, jejum e propósito, e quer entender o que está acontecendo antes de pedir de novo;</span></li>
      <li><span class="ck" data-ic="check" data-size="15"></span><span>Quer ter a direção da próxima área na mão antes de ela apertar;</span></li>
      <li><span class="ck" data-ic="check" data-size="15"></span><span data-slot="item8"></span></li>
    </ul>
  </div>
</section>

<!-- BLOCO 9 · Você recebe -->
<section class="sec wrap reveal">
  <h2 class="t-sec">{'Levando o combo agora, você recebe:' if A else 'Levando os 3 agora, você recebe:'}</h2>
  <div class="recebe">
    <div data-leque="{'kit' if A else 'tres'}" data-size="112"></div>
    <ul class="itens">
      {(f'<li><span class="ck-t" data-ic="check" data-size="18"></span><span><strong>{KIT}</strong>: os 4 juntos, com {MC("o")} que já é seu</span></li>') if A else ''}
      <li><span class="ck-t" data-ic="check" data-size="18"></span><span><strong>Os 3 manuais que faltam completos</strong>, com 20 armas espirituais cada</span></li>
      <li><span class="dot" data-ic="check" data-size="16"></span><span>Situação, causa e o que orar em cada situação, com a Palavra aplicada</span><span class="incl">incluso</span></li>
      <li><span class="dot" data-ic="check" data-size="16"></span><span>Entrega no mesmo e-mail da sua compra</span><span class="incl">incluso</span></li>
      <li><span class="dot" data-ic="check" data-size="16"></span><span>Pra ler no celular ou imprimir</span><span class="incl">incluso</span></li>
      <li><span class="dot" data-ic="check" data-size="16"></span><span>Garantia de 7 dias</span><span class="incl">incluso</span></li>
    </ul>
  </div>
  {'' if A else f'<p class="fora"><span class="ck-v" data-ic="check" data-size="17"></span><span data-slot="capa-mini"></span><span>{MC("O")} continua seu, do jeito que você comprou.</span></p>'}
</section>

<!-- BLOCO 10 · Preço + BLOCO 11 · Aceite e recusa -->
<section class="sec wrap reveal" id="preco">
  <div class="preco">
    <div data-leque="{'kit' if A else 'tres'}" data-size="70"></div>
    <p class="fora-pg">VALOR FORA DESTA PÁGINA</p>
    <p class="conta">Cada manual sai por {V("precoAvulso","R$ 47")}. {'Os 3 que faltam, separados, somam' if A else 'Os 3, separados, somam'} {V("somaAvulsos","R$ 141")}.</p>
    <div class="div-preco"></div>
    <p class="cond">CONDIÇÃO DE QUEM ACABOU DE COMPRAR</p>
    <span class="so-aqui">SÓ NESTA PÁGINA</span>
    <p class="sai-por">{('O ' + KIT + ' sai por') if A else 'Os 3 manuais que faltam saem por'}</p>
    <p class="parcela">{parc}</p>
    <p class="avista">ou {avis} à vista</p>
    <p class="dif">{(f'Você fica com os 3 que faltam por {V("diferencaA","R$ 44")} a menos do que pagaria por eles separados, e {MC("o")} vem junto no combo.') if A else f'Dá {V("porManualB","R$ 15,67")} por manual, com as 20 armas espirituais de cada um.'}</p>
    <div class="btn-wrap">
      <!-- LINK DE 1 CLIQUE: troque em config.js > links.{aceite} -->
      <a class="btn cta-aceite" href="#" data-link="{aceite}">{btn}</a>
    </div>
    {pgto()}
  </div>
  <!-- RECUSA: {'leva pro downsell-a com o mesmo ?m e ?area' if A else 'página de obrigado da compra (config.js > links.obrigado)'} -->
  <a class="recusa" href="#" data-link="{recusa}">{recusa_txt}</a>
</section>

<!-- BLOCO 12 · Garantia -->
<section class="sec wrap reveal">
  <div class="garantia">{SELO7}<div><h3>FIQUE TRANQUILA, A SUA COMPRA É SEGURA</h3><p>Você tem 7 dias pra ler, orar e usar. Se sentir que não é pra você, é só mandar uma mensagem pro nosso suporte que a gente devolve todo o valor desta compra.</p></div></div>
</section>

<!-- BLOCO 13 · Perguntas frequentes -->
<section class="sec wrap reveal">
  <h2 class="t-sec">Perguntas frequentes</h2>
  <div class="faq">
    <details><summary>Vou pagar de novo pelo manual que eu comprei?</summary><p>{(f'Não. O que você já pagou continua valendo e não é cobrado de novo. O combo traz os 4 manuais juntos, e {MC("o")} entra nele porque o combo é o conjunto completo da casa. Na prática, o que chega de novo pra você são os outros 3.') if A else f'Não. {MC("O")} já é seu e não entra nessa cobrança. O valor desta página é só pelos 3 manuais que faltam.'}</p></details>
    <details><summary>Como eu recebo?</summary><p>{'Os manuais chegam' if A else 'Os 3 manuais chegam'} no mesmo e-mail da sua compra, logo depois que o pagamento é confirmado. No Pix, chegam assim que o Pix for confirmado. Se não encontrar, olhe a caixa de spam ou fale com o nosso suporte.</p></details>
    <details><summary>Posso aproveitar essa condição depois?</summary><p>Não. Ela aparece só aqui, logo depois da compra. Fora desta página, cada manual volta ao valor normal de {V("precoAvulso","R$ 47")}.</p></details>
    <details><summary>Faz sentido pra quem está começando a orar agora?</summary><p>Faz. Os manuais não partem do princípio de que você já sabe orar com direção. Cada situação vem explicada, com o que orar e a Palavra pra usar, e dá pra começar com poucos minutos por dia.</p></details>
    <details><summary>Isso garante que a situação da minha casa vai mudar?</summary><p>Não. Ninguém pode te garantir que o casamento volta, que o filho se converte ou que a dívida some. O que os manuais te dão é direção: entender o que está acontecendo em cada área da casa e saber o que orar ali.</p></details>
    <details><summary>E se eu não gostar?</summary><p>Você tem 7 dias de garantia. Se sentir que não é pra você, é só mandar uma mensagem que a gente devolve 100% do valor, sem pergunta e sem burocracia.</p></details>
  </div>
</section>

<!-- BLOCO 14 · Fechamento [linha varia por ?area] -->
<section class="sec wrap reveal fecho14">
  <h2 class="h-fecho">Deus não te chamou só pra cuidar da área que mais dói. Ele te chamou pra <span class="terra">cuidar da casa.</span></h2>
  <p class="center" style="margin-top:14px">Você já deu o passo mais difícil, que foi parar pra entender o que está acontecendo. A pergunta que fica é simples: quando a próxima área apertar, você quer estar sem saber o que orar ou já com a direção na mão?</p>
  <div class="blk" data-slot="linha14"></div>
  <p class="nao-volta">Essa condição não aparece de novo.</p>
  <div class="btn-wrap">
    <!-- LINK DE 1 CLIQUE: config.js > links.{aceite} -->
    <a class="btn cta-aceite" href="#" data-link="{aceite}">{btn}</a>
  </div>
  <p class="resumo">{parc} ou {avis} à vista · Garantia de 7 dias · Chega no mesmo e-mail da sua compra</p>
  <a class="recusa" href="#" data-link="{recusa}">{recusa_txt}</a>
</section>
</main>

<!-- Botão fixo: aparece a partir do bloco 10 (some quando um botão de aceite está na tela) -->
<div class="cta-fixo" aria-hidden="false"><a class="btn" href="#" data-link="{aceite}">{btn}</a></div>
'''
    return h + FOOT

def downsell():
    h = HEAD.format(title="Última condição · Combo Casa Restaurada", pag="down", cls="")
    h += f'''
<!-- BLOCO 1 · Faixa -->
<div class="faixa">ESPERE: UMA ÚLTIMA CONDIÇÃO ANTES DE VOCÊ SAIR</div>
<header class="wrap topo">
  <div class="ok-linha"><span class="bola" data-ic="check" data-size="17"></span><p>O seu manual continua garantido e vai chegar no mesmo e-mail da sua compra.</p></div>
  {etapas("Última condição")}
</header>

<main>
<!-- BLOCO 2 · Título -->
<section class="sec wrap reveal">
  <div data-leque="kit" data-size="96"></div>
  <h1 class="h-down blk">O mesmo <span data-var="kitNome">Combo Casa Restaurada</span>. <span class="terra"><span data-var="diferencaDown">R$ 30</span> a menos.</span></h1>
  <div class="celebrar">
    <p>Tudo bem você ter recusado. Mas, se o motivo foi o valor, isso dá pra resolver.</p>
    <p>O mesmo combo com os 4 manuais sai aqui por {V("parcelaDown","12x de R$ 6,93")}. É a última condição antes de você ir baixar o seu manual.</p>
  </div>
</section>

<!-- BLOCO 3 · O que muda -->
<section class="sec wrap reveal">
  <h2 class="t-sec">O que muda entre a página anterior e esta? <span class="terra">Só o valor.</span></h2>
  <div class="comp">
    <div class="comp-card comp-antes"><span class="ib" data-ic="books" data-size="20"></span><span class="kicker">A CONDIÇÃO ANTERIOR</span><h3>O combo com os 4 manuais</h3><p class="val">{V("parcelaA","12x de R$ 10,03")}</p><p>Você preferiu não levar. Tudo bem.</p></div>
    <div class="comp-card comp-depois"><span class="ib" data-ic="books" data-size="20"></span><span class="kicker terra">A ÚLTIMA CONDIÇÃO</span><h3>O mesmo combo, sem tirar nada</h3><p class="val">{V("parcelaDown","12x de R$ 6,93")}</p><p>Os mesmos 4 manuais e as mesmas 20 armas espirituais em cada um.</p></div>
  </div>
</section>

<!-- BLOCO 4 · O que entra [varia por ?m e ?area] -->
<section class="sec wrap reveal">
  <div data-slot="down-entra"></div>
  <div data-slot="down-portas"></div>
</section>

<!-- BLOCO 5 · Preço e botão -->
<section class="sec wrap reveal" id="preco">
  <div class="preco">
    <span class="so-aqui">ÚLTIMA CONDIÇÃO · SÓ NESTA PÁGINA</span>
    <p class="sai-por">O {KIT} sai por</p>
    <p class="parcela">{V("parcelaDown","12x de R$ 6,93")}</p>
    <p class="avista">ou {V("avistaDown","R$ 67")} à vista</p>
    <div class="btn-wrap">
      <!-- LINK DE 1 CLIQUE: config.js > links.aceiteDown -->
      <a class="btn cta-aceite" href="#" data-link="aceiteDown">SIM, QUERO O COMBO COMPLETO POR {V("parcelaDown","12x de R$ 6,93")}</a>
    </div>
    {pgto()}
  </div>
  <p class="linha-vermelha">Pra ficar claro: os manuais são direção pra orar em cada área da casa. Não são promessa de resultado.</p>
</section>

<!-- BLOCO 6 · Perguntas rápidas -->
<section class="sec wrap reveal">
  <h2 class="t-sec">Perguntas rápidas</h2>
  <div class="faq">
    <details><summary>É o mesmo combo da página anterior?</summary><p>Exatamente o mesmo. Os 4 manuais completos, com as 20 armas espirituais de cada um. Nada foi tirado.</p></details>
    <details><summary>Vou pagar de novo pelo manual que eu comprei?</summary><p>Não. O que você já pagou continua valendo e não é cobrado de novo. Ele vem no combo porque o combo é o conjunto completo da casa. O que chega de novo são os outros 3.</p></details>
    <details><summary>Posso aproveitar essa condição depois?</summary><p>Não. Ela só aparece aqui. Fora desta página, cada manual volta ao valor normal de {V("precoAvulso","R$ 47")}.</p></details>
    <details><summary>E se eu não gostar?</summary><p>Você tem 7 dias de garantia. É só mandar uma mensagem que a gente devolve todo o valor.</p></details>
  </div>
</section>

<!-- BLOCO 7 · Recusa: leva pra entrega do que ela já comprou -->
<section class="sec wrap">
  <a class="recusa" href="#" data-link="recusaDown" style="margin-top:12px">Não, obrigada. Prefiro seguir só com {MC("o")} e abrir mão dessa última condição.</a>
</section>
</main>
'''
    return h + FOOT

open("pagina-a.html","w").write(upsell("a"))
open("pagina-b.html","w").write(upsell("b"))
open("downsell-a.html","w").write(downsell())
print("ok")
