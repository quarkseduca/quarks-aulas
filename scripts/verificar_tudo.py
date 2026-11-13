#!/usr/bin/env python3
"""Verificação automática dos slides do Quarks (rode antes de juntar no main ou de mandar os slides para a gestão).

    python3 scripts/verificar_tudo.py              # tudo
    python3 scripts/verificar_tudo.py --publicar   # o mesmo; é como a trava do push (scripts/ganchos/pre-push) chama

Só usa a biblioteca padrão do Python; o node (se existir) confere a sintaxe do JavaScript.
Não grava nada nos slides. Sai com código 1 se alguma verificação falhar; avisos não bloqueiam.

Regra já descumprida por uma parte antiga fica em scripts/pendencias_conhecidas.json (parte, regra e quantas vezes):
vira aviso. Qualquer descumprimento NOVO falha. Consertou uma pendência? Tire-a da lista.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))
sys.dont_write_bytecode = True
import build  # noqa: E402  (mesmas regras de leitura do build.py)

FALHAS, AVISOS = [], []
CAMPOS = ["disciplina", "curso", "assunto", "parte", "titulo"]
RX_SECAO = r'<section class="slide[^"]*"[^>]*>.*?</section>'  # o mesmo padrão do build.py


def ok(n): print("ok     " + n)
def aviso(n, d=""): AVISOS.append(n); print("aviso  " + n + (f"\n       {d}" if d else ""))
def falha(n, d=""): FALHAS.append(n); print("FALHA  " + n + (f"\n       {d}" if d else ""))
def rodar(c, **k): return subprocess.run(c, capture_output=True, text=True, **k)


def resultado(nome, erros, limite=40):
    if erros:
        falha(nome, "\n       ".join(erros[:limite]) + (f"\n       ... e mais {len(erros) - limite}" if len(erros) > limite else ""))
    else:
        ok(nome)


def arquivos_git():
    r = rodar(["git", "ls-files"], cwd=RAIZ)
    if r.returncode != 0:
        return [p for p in RAIZ.rglob("*") if p.is_file() and ".git" not in p.parts]
    return [RAIZ / l for l in r.stdout.splitlines() if (RAIZ / l).is_file()]


def instalar_trava():
    """Liga a trava do push (scripts/ganchos/pre-push) neste clone, se ainda não estiver ligada."""
    if not (RAIZ / ".git").exists():
        return
    if rodar(["git", "config", "core.hooksPath"], cwd=RAIZ).stdout.strip() != "scripts/ganchos":
        if rodar(["git", "config", "core.hooksPath", "scripts/ganchos"], cwd=RAIZ).returncode == 0:
            print("trava instalada: todo push para o main passa antes por esta verificação\n")


def partes():
    return sorted((RAIZ / "aulas").rglob("*.html"))


def pid(a):
    return a.relative_to(RAIZ / "aulas").with_suffix("").as_posix()


def texto_visivel(sec):
    """O que aparece no slide: sem notas, sem resolução do professor, sem estilos, scripts e comentários."""
    s = re.sub(r"<aside\b.*?</aside>", " ", sec, flags=re.S)
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    return re.sub(r"<[^>]+>", " ", s)


def regras_da_parte(a, plano, cores):
    """Lista de (regra, detalhe) descumpridos por uma parte. Erro de cabeçalho devolve só ele (o resto depende dele)."""
    fonte = a.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--aula\s*(\{.*?\})\s*-->", fonte, re.S)
    if not m:
        return [("cabecalho", "falta o bloco <!--aula {...} --> no começo do arquivo")]
    try:
        meta = json.loads(m.group(1))
    except ValueError as e:
        return [("cabecalho", f"o bloco <!--aula --> não é um JSON válido ({e})")]
    v = []
    for c in CAMPOS:
        if not str(meta.get(c, "")).strip():
            v.append(("cabecalho", f"falta o campo {c}"))
    if v:
        return v
    if meta["disciplina"] not in build.DISCIPLINAS:
        return [("cabecalho", f"disciplina desconhecida: {meta['disciplina']} (use {', '.join(build.DISCIPLINAS)})")]
    if meta["disciplina"] != a.relative_to(RAIZ / "aulas").parts[0]:
        v.append(("cabecalho", f"a disciplina do cabeçalho ({meta['disciplina']}) não é a da pasta"))
    if meta["curso"] not in build.CURSOS:
        v.append(("cabecalho", f"curso desconhecido: {meta['curso']} (use {', '.join(build.CURSOS)})"))
    elif build.CURSOS[meta["curso"]] != a.relative_to(RAIZ / "aulas").parts[1]:
        v.append(("cabecalho", f"o curso do cabeçalho ({meta['curso']}) não é o da pasta"))
    if meta["disciplina"] not in cores:
        v.append(("cor", f'a disciplina {meta["disciplina"]} não tem cor em motor/aula.css ([data-disc="{meta["disciplina"]}"])'))
    lista = meta.get("scripts", [])
    if not isinstance(lista, list):
        v.append(("scripts", 'o campo "scripts" tem de ser uma lista'))
        lista = []
    for s in lista:
        if not (a.parent / s).is_file():
            v.append(("scripts", f"o script {s} listado no cabeçalho não existe"))
    if meta["curso"] in build.CURSOS:
        chave = f'{build.CURSOS[meta["curso"]]}/{meta["disciplina"]}'
        if build.lugar_no_plano(meta, plano.get(chave, []))[0] is None:
            v.append(("cronograma", f"não foi achada em planejamento/cronograma.json ({chave}: {meta['assunto']} · {meta['parte']} · {meta['titulo']})"))

    corpo = fonte[m.end():]
    secs = re.findall(RX_SECAO, corpo, re.S)
    n_abre, n_fecha = len(re.findall(r"<section\b", corpo)), len(re.findall(r"</section>", corpo))
    if n_abre != len(secs) or n_fecha != len(secs):
        v.append(("slides", f"{n_abre} <section> abertas, {n_fecha} fechadas e {len(secs)} slides reconhecidos pelo build "
                            '(a tag tem de ser <section class="slide ..." ...> e cada uma fechar com </section>)'))
    if not secs:
        return v + [("slides", "nenhum slide reconhecido")]
    abre = [re.match(r'<section class="slide([^"]*)"([^>]*)>', s) for s in secs]
    if "capa" not in abre[0].group(1).split():
        v.append(("capa-inicio", "a primeira tela não é capa"))
    elif not re.search(r"<h1\b", secs[0]):
        v.append(("capa-inicio", "a capa não tem o título (h1)"))
    if "capa" not in abre[-1].group(1).split():
        v.append(("capa-fim", "a última tela não é capa"))
    elif "A seguir" not in texto_visivel(secs[-1]):
        v.append(("capa-fim", 'a última tela não traz "A seguir"'))
    for i, (sec, ab) in enumerate(zip(secs, abre), 1):
        nome = re.search(r'data-nome="([^"]*)"', ab.group(2))
        onde = f"slide {i}" + (f" ({nome.group(1)})" if nome and nome.group(1) else "")
        classes = ab.group(1).split()
        if not nome or not nome.group(1).strip():
            v.append(("data-nome", f"{onde}: falta o data-nome"))
        if "questao" in classes:
            for cls in ("area-resolucao", "pilula-pausa", "painel-questao"):
                if not re.search(r'class="[^"]*\b' + cls + r'\b', sec):
                    v.append(("questao-molde", f"{onde}: falta .{cls}"))
            alts = re.search(r'<ol class="alternativas[^"]*"[^>]*>(.*?)</ol>', sec, re.S)
            if not alts:
                v.append(("questao-sem-alternativas", f"{onde}: questão sem alternativas (sem gabarito para marcar)"))
            else:
                g = len(re.findall(r'<li[^>]*data-em="[^"]*\bcerto\b', alts.group(1)))
                if g != 1:
                    v.append(("gabarito", f"{onde}: {g} alternativas marcadas como certas (tem de ser exatamente 1)"))
            res = re.search(r'<aside class="resolucao">(.*?)</aside>', sec, re.S)
            if not res:
                v.append(("resolucao", f"{onde}: falta a resolução do professor (<aside class=\"resolucao\">)"))
            else:
                for cls, o_que in (("dados", "os dados"), ("passos", "os passos"), ("resposta", "a resposta")):
                    if f'class="{cls}"' not in res.group(1):
                        v.append(("resolucao", f"{onde}: a resolução não tem {o_que} (.{cls})"))
        else:  # no enunciado de uma questão oficial a palavra pode vir da prova; fora dele, nunca
            t = re.search(r".{0,40}\baulas?\b.{0,30}", texto_visivel(sec), re.I | re.S)
            if t:
                v.append(("palavra-aula", f'{onde}: a palavra "aula" aparece no slide ("{" ".join(t.group(0).split())}")'))
    return v


def v_build():
    r = rodar([sys.executable, "build.py", "--check"], cwd=RAIZ)
    saida = [l for l in r.stdout.splitlines() if l.strip()]
    for l in saida:
        if l.startswith(("pulado", "aviso")):
            aviso("build.py --check: " + l)
    if r.returncode != 0:
        return falha("build.py --check (saida/ e os slides da gestão iguais ao que o build gera)",
                     "\n       ".join(l for l in saida if not l.startswith(("ok", "pulado", "aviso")))[:3000] + r.stderr[-1500:])
    ok("build.py --check: " + "; ".join(l[4:] for l in saida if l.startswith("ok: ")))


def v_partes():
    plano = json.loads((RAIZ / "planejamento" / "cronograma.json").read_text(encoding="utf-8"))
    cores = set(re.findall(r'\[data-disc="([a-z]+)"\]', (RAIZ / "motor" / "aula.css").read_text(encoding="utf-8")))
    arq = RAIZ / "scripts" / "pendencias_conhecidas.json"
    conhecidas = json.loads(arq.read_text(encoding="utf-8")) if arq.is_file() else {}
    conhecidas = {k: v for k, v in conhecidas.items() if not k.startswith("_")}
    erros, velhas, sobras, n = [], [], [], 0
    lista = partes()
    for a in lista:
        p = pid(a)
        try:
            achou = regras_da_parte(a, plano, cores)
        except Exception as e:  # noqa: BLE001
            achou = [("leitura", f"não deu para conferir: {e!r}")]
        cont = Counter(r for r, _ in achou)
        perm = conhecidas.get(p, {})
        for regra, q in cont.items():
            det = [d for r, d in achou if r == regra]
            if q <= perm.get(regra, 0):
                velhas += [f"{p}: {d}" for d in det]
            else:
                erros += [f"{p}: {d}" for d in det]
        sobras += [f"{p}: {regra} (lista diz {q}, hoje {cont.get(regra, 0)})" for regra, q in perm.items() if cont.get(regra, 0) < q]
        n += 1
    sobras += [f"{p}: a parte não existe mais" for p in conhecidas if not (RAIZ / "aulas" / (p + ".html")).is_file()]
    resultado(f"regras das partes ({n} partes: cabeçalho, cronograma, cor, capas, data-nome, molde das questões, gabarito, resolução, palavra \"aula\")", erros)
    if velhas:
        aviso(f"{len(velhas)} pendência(s) conhecida(s) em partes antigas (scripts/pendencias_conhecidas.json)", "\n       ".join(velhas))
    if sobras:
        aviso("pendência(s) já consertada(s): tire de scripts/pendencias_conhecidas.json", "\n       ".join(sobras))


def scripts_embutidos(html):
    return [m.group(2) for m in re.finditer(r"<script(\s[^>]*)?>(.*?)</script>", html, re.S)
            if not re.search(r"\bsrc=|type=\"(?!text/javascript|module)", m.group(1) or "") and m.group(2).strip()]


def v_node():
    if not shutil.which("node"):
        return aviso("node --check PULADO: node não encontrado neste computador (a sintaxe do JavaScript não foi conferida)")
    erros, n = [], 0
    alvos = sorted((RAIZ / "motor").glob("*.js")) + sorted((RAIZ / "aulas").rglob("*.js"))
    with tempfile.TemporaryDirectory() as tmp:
        for a in partes():
            for i, js in enumerate(scripts_embutidos(a.read_text(encoding="utf-8")), 1):
                f = Path(tmp) / (pid(a).replace("/", "--") + f"--script{i}.js")
                f.write_text(js, encoding="utf-8")
                alvos.append(f)
        for f in alvos:
            n += 1
            r = rodar(["node", "--check", str(f)])
            if r.returncode != 0:
                nome = f.relative_to(RAIZ).as_posix() if RAIZ in f.parents else f.name
                erros.append(f"{nome}: {r.stderr.strip()[:500]}")
    resultado(f"node --check em {n} scripts (motor, animações e scripts embutidos nas partes)", erros)


def textos():
    for p in arquivos_git():
        rel = p.relative_to(RAIZ).as_posix()
        if rel.startswith(("saida/", "vendor/")) or p.suffix not in (".html", ".js", ".css", ".py", ".md", ".json", ".yml", ".sh", ".txt", ""):
            continue
        try:
            yield rel, p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue


def v_gerais():
    eu = Path(__file__).resolve().relative_to(RAIZ).as_posix()
    nome, conflito, segredo = [], [], []
    padroes = [("chave da Anthropic", r"sk-ant-[A-Za-z0-9_-]{20,}"), ("chave da OpenAI", r"\bsk-(?:proj-)?[A-Za-z0-9]{32,}"),
               ("token do GitHub", r"\bgh[pousr]_[A-Za-z0-9]{36}"), ("chave do Asaas", r"\$aact_[A-Za-z0-9_=-]{20,}"),
               ("chave da AWS", r"\bAKIA[0-9A-Z]{16}\b"), ("chave privada", "-----BEGIN (?:RSA |EC |OPENSSH )?" + "PRIVATE KEY-----")]
    for rel, s in textos():
        for i, l in enumerate(s.splitlines(), 1):
            if l.startswith(("<" * 7 + " ", ">" * 7 + " ")):
                conflito.append(f"{rel}:{i}")
            if rel not in (eu, "CLAUDE.md") and re.search(r"\b(?:[dDnN]?[aA]|pela|Pela|à|À) Quarks\b", l):
                nome.append(f"{rel}:{i}: {l.strip()[:90]}")
        if rel != eu:
            segredo += [f"{n} em {rel}" for n, rx in padroes if re.search(rx, s)]
    proibidos = [p.relative_to(RAIZ).as_posix() for p in arquivos_git() if p.name == "config.php" or p.suffix == ".sqlite"]
    resultado('o nome é masculino: "o Quarks" (nada de "a Quarks", "da Quarks", "na Quarks")', nome)
    resultado("sem marcadores de conflito de merge", conflito)
    resultado("sem chaves nem senhas no repositório", segredo + [f"{x} não pode estar no git" for x in proibidos])


def main():
    print(f"Verificação dos slides do Quarks em {RAIZ}\n")
    instalar_trava()
    for v in (v_build, v_partes, v_node, v_gerais):
        try:
            v()
        except Exception as e:  # noqa: BLE001  (uma verificação quebrada não pode esconder as outras)
            falha(v.__name__, f"erro ao verificar: {e!r}")
    print()
    if FALHAS:
        print(f"{len(FALHAS)} verificação(ões) FALHARAM. Corrija antes de juntar no main.")
        sys.exit(1)
    print("Tudo certo." + (f" ({len(AVISOS)} aviso(s))" if AVISOS else ""))


if __name__ == "__main__":
    main()
