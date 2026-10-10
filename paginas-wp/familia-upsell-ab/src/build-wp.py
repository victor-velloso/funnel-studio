#!/usr/bin/env python3
"""Gera os 3 blocos do Elementor (widget HTML) a partir do mockup aprovado (../mockup/).
Rode: python3 build-wp.py  ->  ../familia-upsell-a-codigo-para-colar.txt etc.
Nada aqui reescreve copy: o HTML sai do build.py do mockup e os textos por área do textos.js."""
import os, re, io, sys, json, builtins
HERE = os.path.dirname(os.path.abspath(__file__))
MOCK = os.path.abspath(os.path.join(HERE, "..", "mockup"))
OUT = os.path.abspath(os.path.join(HERE, ".."))
ASSET = "https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/"
# ---------- 1) HTML do mockup (executa o build.py sem gravar arquivo) ----------
pages = {}
class Cap(io.StringIO):
    def __init__(self, name): super().__init__(); self.name = name
    def close(self): pages[os.path.basename(self.name)] = self.getvalue(); super().close()
real_open = builtins.open
def fake_open(f, mode="r", *a, **k):
    if "w" in mode and str(f).endswith(".html"): return Cap(f)
    return real_open(f, mode, *a, **k)
src = real_open(os.path.join(MOCK, "build.py"), encoding="utf-8").read()
builtins.open = fake_open
try:
    exec(compile(src, "build.py", "exec"), {"__name__": "mock"})
finally:
    builtins.open = real_open
# ---------- 2) CSS escopado em #fr-up ----------
def split_rules(css):
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j == -1: break
        sel = css[i:j].strip(); depth = 1; k = j + 1
        while depth:
            if css[k] == "{": depth += 1
            elif css[k] == "}": depth -= 1
            k += 1
        out.append((sel, css[j+1:k-1])); i = k
    return out
def scope_sel(s):
    s = s.strip()
    if s == ":root" or s == "body": return ["#fr-up"]
    if s == "html": return []
    if s == "*": return ["#fr-up", "#fr-up *", "#fr-up *::before", "#fr-up *::after"]
    if s.startswith(".tem-fixo"): return ["#fr-up" + s]
    return ["#fr-up " + s]
def scope(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    res = []
    for sel, body in split_rules(css):
        if sel.startswith("@media") or sel.startswith("@supports"):
            res.append(sel + "{" + scope(body) + "}")
            continue
        sels = []
        for p in sel.split(","): sels += scope_sel(p)
        if not sels: continue
        body = re.sub(r"\s*\n\s*", "", body).strip()
        res.append(",".join(sels) + "{" + body + "}")
    return "\n".join(res)
mock_css = real_open(os.path.join(MOCK, "upsell.css"), encoding="utf-8").read()
# Reset contra o tema (Astra + Elementor 3.4.6): devolve ao #fr-up o comportamento do navegador que o mockup usa.
RESET = """
#fr-up{display:block;width:100%;max-width:100%;overflow-x:hidden;position:relative;text-align:left;-webkit-text-size-adjust:100%;text-size-adjust:100%}
#fr-up p,#fr-up li,#fr-up span,#fr-up div,#fr-up a,#fr-up em,#fr-up strong,#fr-up b,#fr-up summary,#fr-up blockquote,#fr-up cite,#fr-up figcaption,#fr-up details{font-family:inherit}
#fr-up h1,#fr-up h2,#fr-up h3{font-family:Raleway,sans-serif !important;text-transform:none;margin:0;padding:0;border:0;background:none}
#fr-up p{margin:0;padding:0}
#fr-up ul,#fr-up ol{margin:0;padding:0;list-style:none}
#fr-up li{margin:0}
#fr-up figure{margin:1em 40px}
#fr-up blockquote{margin:0;padding:0;border:0;background:none;quotes:none}
#fr-up blockquote::before,#fr-up blockquote::after{content:none}
#fr-up cite{font-style:normal}
#fr-up img{height:auto;max-width:100%;border:0;border-radius:0;box-shadow:none}
#fr-up svg{display:inline-block;vertical-align:middle}
#fr-up a{text-decoration:none;box-shadow:none;outline-offset:2px}
#fr-up a.btn,#fr-up a.btn:hover,#fr-up a.btn:focus,#fr-up a.btn:visited{color:#fff !important;text-decoration:none !important}
#fr-up a.recusa,#fr-up a.recusa:hover,#fr-up a.recusa:visited{color:var(--muted) !important;text-decoration:underline !important}
#fr-up details,#fr-up summary{margin:0;border:0;background:none}
#fr-up main,#fr-up header,#fr-up section,#fr-up article{display:block;margin:0}
#fr-up .preco p,#fr-up .faq p{margin-bottom:0}
html.fr-qa #fr-up .reveal{opacity:1 !important;transform:none !important}
html.fr-no-eduzz #sun-loading,html.fr-no-eduzz #sun-root{display:none !important}
"""
EXTRA = """
#fr-up .relato .shot{width:100%}
#fr-up .rcrop{display:block;position:relative;overflow:hidden;width:100%}
#fr-up .rcrop.r1{aspect-ratio:749/214}
#fr-up .rcrop.r2{aspect-ratio:749/247}
#fr-up .rcrop.r1 img,#fr-up .rcrop.r2 img{position:absolute !important;display:block !important;width:calc(100% * 800 / 749) !important;height:auto !important;max-width:none !important;max-height:none !important;aspect-ratio:1/1 !important;left:calc(100% * -12 / 749) !important;margin:0 !important}
#fr-up .rcrop.r1 img{top:calc(100% * -299 / 214) !important}
#fr-up .rcrop.r2 img{top:calc(100% * -264 / 247) !important}
#fr-up .rcrop.r3{max-width:454px;margin:0 auto}
#fr-up .rcrop.r3 img{position:static !important;width:100% !important;height:auto !important}
"""
CSS = RESET.strip() + "\n" + scope(mock_css) + "\n" + EXTRA.strip()
# o body do mockup usa font-family no shorthand; o tema define font no body, então reforça no #fr-up
CSS = CSS.replace('#fr-up{margin:0;background:var(--bg)', '#fr-up{margin:0 !important;background:var(--bg)')
# ---------- 3) Markup ----------
RELATOS = {
 "fr-relato-1-recorte.webp": ("fr-relato-1.webp", "r1"),
 "fr-relato-2-recorte.webp": ("fr-relato-2.webp", "r2"),
 "fr-relato-3-recorte.webp": ("fr-relato-3.webp", "r3"),
}
def markup(html):
    body_open = re.search(r"<body([^>]*)>", html)
    attrs = body_open.group(1)
    pag = re.search(r'data-pagina="([^"]*)"', attrs).group(1)
    cls = re.search(r'class="([^"]*)"', attrs).group(1)
    inner = html[body_open.end(): html.index('<script src="config.js">')]
    # comentário com markup do vídeo sai (fica documentado no README)
    inner = re.sub(r"<!-- ESPAÇO DO VÍDEO.*?-->", "<!-- ESPAÇO DO VÍDEO (2ª fase): entra depois do bloco 2 quando o vídeo existir -->", inner, flags=re.S)
    # relatos: mesma imagem que já está no ar no quiz, com o mesmo recorte por CSS
    def rel(mm):
        tag = mm.group(0)
        f = re.search(r'src="assets/([^"]+)"', tag).group(1)
        orig, rc = RELATOS[f]
        tag = tag.replace('src="assets/' + f + '"', 'src="' + ASSET + orig + '"')
        tag = re.sub(r'\s(width|height)="\d+"', "", tag)
        return '<span class="rcrop ' + rc + '">' + tag.replace(' loading="lazy"', ' loading="lazy" decoding="async"') + "</span>"
    inner = re.sub(r'<img src="assets/fr-relato-[^"]+"[^>]*>', rel, inner)
    inner = inner.replace('src="assets/', 'src="' + ASSET)
    inner = re.sub(r"\s*\n\s*", " ", inner).strip()
    assert "assets/" not in inner
    return pag, cls, inner
# ---------- 4) JS ----------
cfg = real_open(os.path.join(MOCK, "config.js"), encoding="utf-8").read()
txt = real_open(os.path.join(MOCK, "textos.js"), encoding="utf-8").read().replace('"assets/', '"' + ASSET)
logic = real_open(os.path.join(HERE, "upsell-wp.js"), encoding="utf-8").read()
LINKS = """  links: {
    /* LINKS DE 1 CLIQUE DA EDUZZ: o Peter passa. Enquanto for "#", o botão não sai da página.
       Referência (oferta no ar hoje): kit R$ 97 = https://chk.eduzz.com/crl53eyv · kit R$ 67 = https://chk.eduzz.com/liawsws4 */
    aceiteA: "#",        /* LINK DE 1 CLIQUE DA PÁGINA A (Combo R$ 97) */
    aceiteB: "#",        /* LINK DE 1 CLIQUE DA PÁGINA B (3 manuais R$ 47, produto novo) */
    aceiteDown: "#",     /* LINK DE 1 CLIQUE DO DOWNSELL DA A (Combo R$ 67) */
    recusaA: "/familia-upsell-a-2/",  /* downsell da A (leva ?m e ?area junto) */
    obrigado: "/parabens-familia/",   /* recusa da Página B: página de obrigado da compra (a mesma das ofertas no ar) */
    recusaDown: "/parabens-familia/"  /* recusa do downsell: página de obrigado da compra */
  },
  /* true = acrescenta ?u=1 no link de aceite, como a oferta no ar faz (1 clique da Eduzz) */
  umClique: true,
  /* Funnel Control: true = manda "variant" (fcVariante) no view, accept e decline. API liberada pelo Max (FC PR #33, migration em produção 10/10). area2 não vai (a API recusa). */
  fcEnviarVariante: true,
  /* 2ª área = casamento, mas o quiz marcou que o casamento acabou: "casamento" usa o texto do casamento (como no mockup aprovado);
     "padrao" usa o texto sem a 2ª área. O doc do Alan pede "a dor do casamento que acabou", que ainda não tem texto. */
  casamentoAcabou: "padrao","""
def config_for(pag):
    c = re.sub(r"  links: \{.*?\n  \},", LINKS, cfg, flags=re.S)
    variante = {"a": "a", "b": "b", "down": "down-a"}[pag]
    fcv = {"a": "a", "b": "b", "down": "a"}[pag]
    c = c.replace('  paramArea: "area"', '  paramArea: "area",\n  /* braço do teste (vai pro dataLayer e pro pixel) */\n  variante: "' + variante + '",\n  /* braço no Funnel Control (campo variant): A = "a", B = "b", downsell da A = "a" (com page downsell) */\n  fcVariante: "' + fcv + '"')
    return c
def nob(s):
    return "\n".join(l.rstrip() for l in s.split("\n") if l.strip())
EDUZZ = """<script>
(function(){
  var key = "";
  try {
    var q = new URLSearchParams(location.search);
    key = q.get("transactionkey");
    if (!key) key = q.get("transactionKey");
  } catch (e) {}
  if (!key) {
    try { if (window.Eduzz) { if (window.Eduzz.transactionKey) key = window.Eduzz.transactionKey; } } catch (e2) {}
  }
  if (key) return;
  document.documentElement.classList.add("fr-no-eduzz");
})();
</script>
<script src="https://cdn.eduzzcdn.com/sun/thankyou/thankyou.js"></script>"""
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Raleway:wght@600;700;800&display=swap">'
FILES = {"pagina-a.html": ("familia-upsell-a", "Página A · Combo Casa Restaurada (R$ 97)", "/familia-upsell-a/"),
         "pagina-b.html": ("familia-upsell-b", "Página B · os 3 manuais que faltam (R$ 47)", "/familia-upsell-b/"),
         "downsell-a.html": ("familia-upsell-a-2", "Downsell da A · Combo Casa Restaurada (R$ 67)", "/familia-upsell-a-2/")}
out_paths = []
for fn, (slug, titulo, url) in FILES.items():
    pag, cls, inner = markup(pages[fn])
    js = nob(config_for(pag)) + "\n" + nob(txt) + "\n" + nob(logic)
    block = ("<!-- Família Restaurada · upsell A/B · " + titulo + " · página " + url + " · Elementor: 1 widget HTML, página Full Width sem espaço. Gerado por paginas-wp/familia-upsell-ab/src/build-wp.py a partir do mockup aprovado em 09/10. -->\n"
             + FONTS + "\n<style>\n" + CSS + "\n</style>\n"
             + '<div id="fr-up" data-pagina="' + pag + '" class="' + cls + '">' + inner + "</div>\n"
             + "<script>\n" + js + "\n</script>\n" + EDUZZ + "\n")
    block = nob(block) + "\n"
    p = os.path.join(OUT, slug + "-codigo-para-colar.txt")
    real_open(p, "w", encoding="utf-8").write(block)
    out_paths.append(p)
print("\n".join(out_paths))
