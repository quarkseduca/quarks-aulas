#!/usr/bin/env python3
"""Monta cada aula num arquivo HTML único, pronto para abrir no navegador.

Uso:
  python3 build.py                 # monta todas as aulas em saida/
  python3 build.py aulas/fisica/pism1/mu-1.html
  python3 build.py --previa ...    # versão para a prévia no claude.ai (sem <html>/<head>/<body>)
"""
import base64
import json
import random
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
MOTOR = RAIZ / "motor"
MARCA = RAIZ / "marca"

DISCIPLINAS = {"fisica": "Física", "quimica": "Química", "matematica": "Matemática", "portugues": "Português"}

FONTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800'
          '&family=Figtree:wght@400;600;700;800&display=swap">')
MATHJAX = ("<script>window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]},"
           "svg:{fontCache:'global'},options:{enableMenu:false}};</script>"
           '<script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js"></script>')


def data_uri(nome):
    return "data:image/png;base64," + base64.b64encode((MARCA / nome).read_bytes()).decode()


def estrelas(semente):
    r = random.Random(semente)
    pontos = []
    for _ in range(46):
        x, y = r.uniform(1, 99), r.uniform(1, 99)
        if x < 30 and y > 66:  # longe do canto da câmera
            continue
        pontos.append('<i style="left:%.1f%%;top:%.1f%%;animation-delay:%.1fs;transform:scale(%.2f)"></i>'
                      % (x, y, r.uniform(0, 5), r.uniform(.6, 1.4)))
    return "".join(pontos)


FUNDO = ""

MOLDURA = '''<svg id="moldura" viewBox="0 0 1920 1080" aria-hidden="true">
  <defs><linearGradient id="gcam" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" style="stop-color:#6551D1"/><stop offset="1" style="stop-color:var(--d)"/></linearGradient></defs>
  <rect class="cam-fundo" x="40" y="770" width="480" height="270" rx="26"/>
  <text class="cam-texto" x="280" y="913" text-anchor="middle">CÂMERA</text>
  <rect class="borda-cor" x="38" y="768" width="484" height="274" rx="28" fill="none" stroke="url(#gcam)" stroke-width="4"/>
  <rect class="borda-clara" x="38" y="768" width="484" height="274" rx="28" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>
</svg>'''

AJUDA = '''<div id="ajuda" hidden><div class="janela"><h3>Atalhos da aula</h3><dl>
<dt><kbd>→</kbd> <kbd>espaço</kbd></dt><dd>Avança (um clique por vez)</dd>
<dt><kbd>←</kbd></dt><dd>Volta</dd>
<dt><kbd>N</kbd></dt><dd>Abre as notas numa janela separada (só você vê)</dd>
<dt><kbd>D</kbd></dt><dd>Liga ou desliga a caneta</dd>\n<dt><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd></dt><dd>Cor da caneta: roxo, cor da matéria, carvão, vermelho</dd>\n<dt><kbd>Z</kbd> / <kbd>C</kbd></dt><dd>Desfaz o último traço / apaga tudo do slide</dd>
<dt><kbd>E</kbd></dt><dd>Nas questões: esconde o enunciado e a área de resolução ocupa a tela toda</dd>
<dt><kbd>B</kbd></dt><dd>Tela de pausa</dd>
<dt><kbd>G</kbd></dt><dd>Modo gravação: tira o "CÂMERA" de dentro da moldura</dd>
<dt><kbd>F</kbd></dt><dd>Tela cheia</dd>
<dt><kbd>?</kbd></dt><dd>Mostra ou esconde esta ajuda</dd>
</dl><p style="margin:14px 0 0;color:#5E5A70">No celular: toque à direita para avançar e à esquerda para voltar.</p></div></div>'''


def monta(caminho, previa=False):
    caminho = Path(caminho).resolve()
    fonte = caminho.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--aula\s*(\{.*?\})\s*-->", fonte, re.S)
    if not m:
        sys.exit(f"{caminho}: falta o bloco <!--aula {{...}} -->")
    meta = json.loads(m.group(1))
    slides = fonte[m.end():]
    disc = meta["disciplina"]
    nome_disc = DISCIPLINAS[disc]
    sym_roxo, sym_branco, logo_branco = data_uri("sym-roxo.png"), data_uri("sym-branco.png"), data_uri("logo-branco.png")

    cabeca = (f'<div class="cabeca"><span class="marca"><img src="{sym_roxo}" alt="">{meta["assunto"]} · {meta["titulo"]}</span>'
              f'<span class="selo">{nome_disc} · {meta["curso"]}</span></div>')

    def enfeita(mm):
        abre = mm.group(0)
        if "capa" in abre:
            return abre
        return abre + FUNDO + cabeca
    slides = re.sub(r'<section class="slide(?: [^"]*)?"[^>]*>', enfeita, slides)
    slides = slides.replace('<div class="estrelas"></div>', f'<div class="estrelas">{estrelas(meta["titulo"])}</div>')
    slides = slides.replace("{{SYM_ROXO}}", sym_roxo).replace("{{LOGO_BRANCO}}", logo_branco)

    css = (MOTOR / "aula.css").read_text(encoding="utf-8")
    js_extra = "".join((caminho.parent / s).read_text(encoding="utf-8") + "\n" for s in meta.get("scripts", []))
    js = (MOTOR / "aula.js").read_text(encoding="utf-8")
    titulo = f'{meta["assunto"]} · {meta["titulo"]}'

    corpo = f'''<div id="palco" data-disc="{disc}">
{slides}
{MOLDURA}
<div id="progresso"><span></span><div class="trilho"><b></b></div></div>
<div id="pausa" hidden><img src="{sym_roxo}" alt="Quarks"></div>
<canvas id="caneta" width="1920" height="1080"></canvas>
</div>
{AJUDA}
<div id="notasPainel" hidden></div>
<div id="dica">Aperte ? para ver os atalhos</div>
<script>{js_extra}</script>
<script>{js}</script>'''

    cabecalho = f'<title>{titulo}</title>{FONTES}<style>{css}</style>{MATHJAX}'
    if previa:
        return cabecalho + "\n" + corpo + "\n"
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">{cabecalho}</head>'
            f'<body data-disc="{disc}">{corpo}</body></html>\n')


def main():
    args = sys.argv[1:]
    previa = "--previa" in args
    args = [a for a in args if a != "--previa"]
    aulas = [Path(a) for a in args] or sorted((RAIZ / "aulas").rglob("*.html"))
    for a in aulas:
        rel = Path(a).resolve().relative_to(RAIZ / "aulas")
        destino = RAIZ / "saida" / (rel.with_name(rel.stem + "-previa.html") if previa else rel)
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(monta(a, previa), encoding="utf-8")
        print("ok:", destino.relative_to(RAIZ))


if __name__ == "__main__":
    main()
