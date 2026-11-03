/* Animações do capítulo Funções (Matemática, IF/Sudeste).
   Gráficos que se desenham, pontos que acham o seu "endereço", a máquina f(x), os palitos, a reta vertical que varre o plano,
   a reta que gira com a, a parábola que muda com a, b e c, o tanque que esvazia, a bola e o canteiro.
   Regras do Quarks: só a tela aberta se move, lento e pequeno, nada na zona da câmera; com prefers-reduced-motion
   (ou ao voltar um clique) a figura já aparece pronta. Cada animação: window.QuarksAnimacoes[nome] = {inicia, roda, zera}. */
(function () {
  "use strict";
  var A = window.QuarksAnimacoes = window.QuarksAnimacoes || {};
  var NS = "http://www.w3.org/2000/svg";
  var COR = { d: "var(--d)", forte: "var(--d-forte)", roxo: "#6551D1", titulo: "#3F2FA0", cinza: "#5E5A70", grade: "#ECE8FB",
    eixo: "#7F7A99", amarelo: "#FFD10C", erro: "#C2384F", certo: "#1F9D62", lilas: "#8C7BEA", carvao: "#292B2C" };
  var FONTE = "Figtree,'Segoe UI',sans-serif";
  var uid = 0;

  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) if (at[k] !== undefined) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) {
    var t = el("text", Object.assign({ x: x, y: y, "font-family": FONTE }, at || {}), pai);
    t.textContent = s;
    return t;
  }
  function reduz() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function ativo(box) { var s = box.closest(".slide"); return !s || s.classList.contains("ativo"); }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  /* número com vírgula e sinal de menos de verdade */
  function fmt(n, casas) {
    casas = casas === undefined ? 1 : casas;
    var s = (Math.round(n * Math.pow(10, casas)) / Math.pow(10, casas)).toFixed(casas);
    if (casas > 0) s = s.replace(/\.?0+$/, "");
    if (s === "-0") s = "0";
    return s.replace("-", "−").replace(".", ",");
  }

  /* ---------- Plano cartesiano ---------- */
  function plano(svg, o) {
    var W = o.w, H = o.h, pl = o.pl === undefined ? 60 : o.pl, pr = o.pr === undefined ? 40 : o.pr,
      pt = o.pt === undefined ? 30 : o.pt, pb = o.pb === undefined ? 50 : o.pb;
    var ox = o.x || 0, oy = o.y || 0;
    var sx = (W - pl - pr) / (o.xmax - o.xmin), sy = (H - pt - pb) / (o.ymax - o.ymin);
    function X(x) { return ox + pl + (x - o.xmin) * sx; }
    function Y(y) { return oy + pt + (o.ymax - y) * sy; }
    var g = el("g", {}, svg);
    var id = "fnclip" + (++uid);
    var defs = el("defs", {}, g);
    var cp = el("clipPath", { id: id }, defs);
    el("rect", { x: X(o.xmin), y: Y(o.ymax), width: (o.xmax - o.xmin) * sx, height: (o.ymax - o.ymin) * sy }, cp);
    var dx = o.dx || 1, dy = o.dy || 1, lx = o.lx || dx, ly = o.ly || dy;
    var grade = el("g", { stroke: COR.grade, "stroke-width": 2 }, g);
    if (o.grade !== false) {
      for (var x = Math.ceil(o.xmin / dx) * dx; x <= o.xmax + 1e-9; x += dx) el("line", { x1: X(x), y1: Y(o.ymin), x2: X(x), y2: Y(o.ymax) }, grade);
      for (var y = Math.ceil(o.ymin / dy) * dy; y <= o.ymax + 1e-9; y += dy) el("line", { x1: X(o.xmin), y1: Y(y), x2: X(o.xmax), y2: Y(y) }, grade);
    }
    var ex = Y(Math.min(Math.max(0, o.ymin), o.ymax)), ey = X(Math.min(Math.max(0, o.xmin), o.xmax));
    var eixos = el("g", { stroke: COR.eixo, "stroke-width": 3.5, "stroke-linecap": "round", fill: "none" }, g);
    el("line", { x1: X(o.xmin) - 6, y1: ex, x2: X(o.xmax) + 22, y2: ex }, eixos);
    el("path", { d: "M" + (X(o.xmax) + 10) + " " + (ex - 9) + " L" + (X(o.xmax) + 24) + " " + ex + " L" + (X(o.xmax) + 10) + " " + (ex + 9) }, eixos);
    el("line", { x1: ey, y1: Y(o.ymin) + 6, x2: ey, y2: Y(o.ymax) - 22 }, eixos);
    el("path", { d: "M" + (ey - 9) + " " + (Y(o.ymax) - 10) + " L" + ey + " " + (Y(o.ymax) - 24) + " L" + (ey + 9) + " " + (Y(o.ymax) - 10) }, eixos);
    var fs = o.fs || 22;
    var nums = el("g", { "font-size": fs, "font-weight": 700, fill: COR.cinza, "font-family": FONTE }, g);
    if (o.numeros !== false) {
      for (x = Math.ceil(o.xmin / lx) * lx; x <= o.xmax + 1e-9; x += lx) {
        if (Math.abs(x) < 1e-9 || (o.pulaX || []).indexOf(x) >= 0) continue;
        el("line", { x1: X(x), y1: ex - 7, x2: X(x), y2: ex + 7, stroke: COR.eixo, "stroke-width": 3 }, nums);
        txt(nums, X(x), ex + fs + 12, fmt(x, 2), { "text-anchor": "middle" });
      }
      for (y = Math.ceil(o.ymin / ly) * ly; y <= o.ymax + 1e-9; y += ly) {
        if (Math.abs(y) < 1e-9 || (o.pulaY || []).indexOf(y) >= 0) continue;
        el("line", { x1: ey - 7, y1: Y(y), x2: ey + 7, y2: Y(y), stroke: COR.eixo, "stroke-width": 3 }, nums);
        txt(nums, ey - 14, Y(y) + fs * .35, fmt(y, 2), { "text-anchor": "end" });
      }
      if (o.xmin <= 0 && o.ymin <= 0 && o.zero !== false) txt(nums, ey - 12, ex + fs + 10, "0", { "text-anchor": "end" });
    }
    var rot = el("g", { "font-size": fs + 8, "font-weight": 700, fill: COR.titulo, "font-style": "italic", "font-family": FONTE }, g);
    txt(rot, X(o.xmax) + 24, ex - 16, o.rx || "x", { "text-anchor": "end" });
    txt(rot, ey + 16, Y(o.ymax) - 12, o.ry || "y", {});
    var dentro = el("g", { "clip-path": "url(#" + id + ")" }, g);
    var fora = el("g", {}, g);
    return { g: g, X: X, Y: Y, sx: sx, sy: sy, o: o, dentro: dentro, fora: fora, nums: nums };
  }

  /* caminho de uma função entre x0 e x1 */
  function caminho(P, f, x0, x1, n) {
    n = n || 160;
    var d = "";
    for (var i = 0; i <= n; i++) {
      var x = x0 + (x1 - x0) * i / n, y = f(x);
      var Yy = Math.max(-4000, Math.min(4000, P.Y(y)));
      d += (i ? " L" : "M") + P.X(x).toFixed(1) + " " + Yy.toFixed(1);
    }
    return d;
  }
  function ponto(pai, x, y, cor, r) {
    return el("circle", { cx: x, cy: y, r: r || 11, fill: cor || COR.d, stroke: "#fff", "stroke-width": 4 }, pai);
  }
  function rotulo(pai, x, y, s, at) {
    var g = el("g", {}, pai);
    var t = txt(g, x, y, s, Object.assign({ "font-size": 26, "font-weight": 800, fill: COR.titulo, "paint-order": "stroke", stroke: "#fff", "stroke-width": 8, "stroke-linejoin": "round" }, at || {}));
    return t;
  }

  /* ---------- Tempo ---------- */
  function tween(e, dur, f, fim) {
    if (e.direto || dur <= 0) { f(1); if (fim) fim(); return; }
    var t0 = null;
    function q(agora) {
      if (e.box._estado !== e) return;
      if (t0 === null) t0 = agora;
      var p = Math.min(1, (agora - t0) / dur);
      f(p);
      if (p < 1) requestAnimationFrame(q); else if (fim) fim();
    }
    requestAnimationFrame(q);
  }
  function cadeia(e, passos) {
    var i = 0;
    (function prox() {
      if (i >= passos.length || e.box._estado !== e) return;
      var s = passos[i++];
      tween(e, s[0], s[1] || function () {}, prox);
    })();
  }
  function laco(e, f, tFixo) {
    if (e.direto) { f(tFixo || 0); return; }
    var t0 = null;
    function q(agora) {
      if (e.box._estado !== e || !ativo(e.box)) return;
      if (t0 === null) t0 = agora;
      f((agora - t0) / 1000);
      requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  }
  /* risco que se desenha */
  function riscoPronto(path) {
    var L = path.getTotalLength ? path.getTotalLength() : 2000;
    path.style.strokeDasharray = L + " " + L;
    path.style.strokeDashoffset = L;
    return function (p) { path.style.strokeDashoffset = L * (1 - p); };
  }
  function aparece(node) { node.setAttribute("opacity", 0); return function (p) { node.setAttribute("opacity", p); }; }
  function cfg(box, nome, padrao) { var v = box.getAttribute("data-" + nome); return v === null ? padrao : v; }

  function novoSvg(box) {
    box.innerHTML = "";
    var W = box.offsetWidth || +cfg(box, "w", 860), H = box.offsetHeight || +cfg(box, "h", 600);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "overflow:visible;font-family:" + FONTE }, box);
    return { svg: svg, W: W, H: H };
  }

  function registra(nome, monta, roda) {
    A[nome] = {
      inicia: function (box) { var e = monta(box); e.box = box; box._estado = e; if (e.inicial) e.inicial(); },
      zera: function (box) { var e = monta(box); e.box = box; box._estado = e; if (e.inicial) e.inicial(); },
      roda: function (box, voltando) {
        var e = monta(box); e.box = box; box._estado = e;
        e.direto = !!voltando || reduz();
        if (e.inicial) e.inicial();
        roda(e);
      }
    };
  }

  /* =====================================================================
     1. fn-plano: cada ponto anda da origem até o seu endereço (x primeiro, y depois)
     ===================================================================== */
  registra("fn-plano", function (box) {
    var b = novoSvg(box);
    var P = plano(b.svg, { w: b.W, h: b.H, xmin: -5, xmax: 5, ymin: -4, ymax: 4, pl: 30, pr: 40, pt: 40, pb: 20 });
    var quad = el("g", { "font-size": 30, "font-weight": 800, fill: COR.lilas, "font-family": FONTE, "text-anchor": "middle", opacity: 0 }, P.g);
    txt(quad, P.X(3.4), P.Y(3.3), "1º quadrante"); txt(quad, P.X(-3.4), P.Y(3.3), "2º quadrante");
    txt(quad, P.X(-3.4), P.Y(-3.6), "3º quadrante"); txt(quad, P.X(3.4), P.Y(-3.6), "4º quadrante");
    var lista = (cfg(box, "pontos", "A:3:2;B:-2:1;C:-1:-3;D:2:-2;E:0:3")).split(";").map(function (s) { var p = s.split(":"); return { n: p[0], x: +p[1], y: +p[2] }; });
    ponto(P.g, P.X(0), P.Y(0), COR.amarelo, 9);
    return { P: P, quad: quad, lista: lista, camada: el("g", {}, P.g) };
  }, function (e) {
    var P = e.P, passos = [];
    e.lista.forEach(function (p) {
      var trilha = el("path", { d: "M" + P.X(0) + " " + P.Y(0) + " L" + P.X(p.x) + " " + P.Y(0) + " L" + P.X(p.x) + " " + P.Y(p.y),
        fill: "none", stroke: COR.lilas, "stroke-width": 4, "stroke-dasharray": "10 9", "stroke-linecap": "round", opacity: 0 }, e.camada);
      var bola = el("circle", { cx: P.X(0), cy: P.Y(0), r: 10, fill: COR.d, opacity: 0 }, e.camada);
      var g = el("g", { opacity: 0 }, e.camada);
      ponto(g, P.X(p.x), P.Y(p.y), COR.d, 12);
      rotulo(g, P.X(p.x) + (p.x < 0 ? -18 : 18), P.Y(p.y) - 16, p.n + "(" + fmt(p.x) + "; " + fmt(p.y) + ")", { "font-size": 28, "text-anchor": p.x < 0 ? "end" : "start" });
      passos.push([1, function () { trilha.setAttribute("opacity", .9); bola.setAttribute("opacity", 1); }]);
      passos.push([p.x === 0 ? 1 : 700, function (k) { bola.setAttribute("cx", P.X(p.x * ease(k))); }]);
      passos.push([p.y === 0 ? 1 : 700, function (k) { bola.setAttribute("cy", P.Y(p.y * ease(k))); }]);
      passos.push([350, function (k) { g.setAttribute("opacity", k); bola.setAttribute("opacity", 1 - k); }]);
      passos.push([250, null]);
    });
    if (cfg(e.box, "quadrantes", "sim") !== "nao") passos.push([900, function (k) { e.quad.setAttribute("opacity", k); }]);
    cadeia(e, passos);
  });

  /* =====================================================================
     2. fn-maquina: a máquina f(x) = 2x + 3 recebe x e devolve f(x)
     ===================================================================== */
  registra("fn-maquina", function (box) {
    var b = novoSvg(box), W = b.W, H = b.H, s = b.svg;
    var mx = W / 2, my = 150;
    el("rect", { x: 40, y: my - 8, width: W - 80, height: 16, rx: 8, fill: "#E4DEFB" }, s);
    var corpo = el("g", {}, s);
    var caixa = el("rect", { x: mx - 190, y: my - 95, width: 380, height: 190, rx: 40, fill: COR.d }, corpo);
    el("rect", { x: mx - 160, y: my - 62, width: 320, height: 92, rx: 22, fill: "#fff", "fill-opacity": .16 }, corpo);
    txt(corpo, mx, my + 6, "f(x) = 2x + 3", { "text-anchor": "middle", "font-size": 50, "font-weight": 800, fill: "#fff", "font-style": "italic" });
    txt(corpo, mx, my + 64, "a lei da função", { "text-anchor": "middle", "font-size": 22, "font-weight": 700, fill: "#fff", "fill-opacity": .85 });
    var luz = el("circle", { cx: mx + 150, cy: my - 66, r: 9, fill: COR.amarelo, opacity: .35 }, corpo);
    txt(s, 90, my - 70, "entra x", { "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: COR.cinza });
    txt(s, W - 90, my - 70, "sai y", { "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: COR.cinza });
    function ficha(cor) {
      var g = el("g", { opacity: 0 }, s);
      el("rect", { x: -62, y: -36, width: 124, height: 72, rx: 36, fill: "#fff", stroke: cor, "stroke-width": 5 }, g);
      var t = txt(g, 0, 14, "", { "text-anchor": "middle", "font-size": 40, "font-weight": 800, fill: COR.titulo });
      return { g: g, t: t };
    }
    var ent = ficha(COR.lilas), sai = ficha(COR.d);
    s.appendChild(corpo);
    var pares = el("g", { "font-size": 34, "font-weight": 800, "font-family": FONTE, "text-anchor": "middle" }, s);
    var vals = [4, -1, 0, 6], cel = [];
    vals.forEach(function (v, i) {
      var x = W / 2 + (i - 1.5) * Math.min(220, (W - 80) / 4), g = el("g", { opacity: 0 }, pares);
      el("rect", { x: x - 100, y: 300, width: 200, height: 70, rx: 22, fill: "#fff", stroke: "#E4DEFB", "stroke-width": 2 }, g);
      txt(g, x, 348, "f(" + fmt(v) + ") = " + fmt(2 * v + 3), { fill: COR.titulo });
      cel.push(g);
    });
    return { s: s, mx: mx, my: my, W: W, ent: ent, sai: sai, vals: vals, cel: cel, luz: luz };
  }, function (e) {
    var T = 3.4, mx = e.mx, my = e.my;
    laco(e, function (t) {
      var n = Math.floor(t / T), k = n % e.vals.length, u = (t % T) / T, v = e.vals[k];
      if (e.direto) { n = 3; k = 3; u = .9; v = e.vals[3]; }
      e.ent.t.textContent = fmt(v); e.sai.t.textContent = fmt(2 * v + 3);
      var a = Math.min(1, u / .32);
      e.ent.g.setAttribute("transform", "translate(" + (100 + (mx - 140 - 100) * ease(a)) + " " + my + ")");
      e.ent.g.setAttribute("opacity", u < .32 ? Math.min(1, u / .06) : Math.max(0, 1 - (u - .32) / .06));
      e.luz.setAttribute("opacity", u > .32 && u < .52 ? 1 : .35);
      var c = Math.max(0, Math.min(1, (u - .5) / .3));
      e.sai.g.setAttribute("transform", "translate(" + (mx + 140 + (e.W - 100 - mx - 140) * ease(c)) + " " + my + ")");
      e.sai.g.setAttribute("opacity", u < .5 ? 0 : Math.min(1, (u - .5) / .06));
      e.cel.forEach(function (g, i) { g.setAttribute("opacity", (n >= e.vals.length || i < k || (i === k && u > .82)) ? 1 : 0); });
    }, 0);
  });

  /* =====================================================================
     3. fn-palitos: quadrados de palitos de fósforo, palito por palito
     ===================================================================== */
  registra("fn-palitos", function (box) {
    var b = novoSvg(box), s = b.svg, L = 74, figs = [], x0 = 20, gap = 64;
    function palito(pai, x1, y1, x2, y2) {
      var g = el("g", { opacity: 0 }, pai);
      el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#E2B567", "stroke-width": 9, "stroke-linecap": "round" }, g);
      var hx = x2, hy = y2;
      el("circle", { cx: hx, cy: hy, r: 8, fill: COR.erro }, g);
      return g;
    }
    for (var n = 1; n <= 4; n++) {
      var g = el("g", {}, s), y0 = 30, pal = [];
      pal.push(palito(g, x0, y0 + L, x0, y0 + 4));
      for (var q = 0; q < n; q++) {
        var xa = x0 + q * L, xb = xa + L;
        pal.push(palito(g, xa + 4, y0, xb - 4, y0));
        pal.push(palito(g, xa + 4, y0 + L, xb - 4, y0 + L));
        pal.push(palito(g, xb, y0 + L - 4, xb, y0 + 4));
      }
      var rot = el("g", { opacity: 0 }, g);
      txt(rot, x0 + n * L / 2, y0 + L + 54, "n = " + n, { "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: COR.cinza });
      txt(rot, x0 + n * L / 2, y0 + L + 96, (1 + 3 * n) + " palitos", { "text-anchor": "middle", "font-size": 32, "font-weight": 800, fill: COR.titulo });
      figs.push({ pal: pal, rot: rot, n: n });
      x0 += n * L + gap;
    }
    return { figs: figs };
  }, function (e) {
    var passos = [];
    e.figs.forEach(function (f) {
      f.pal.forEach(function (p, i) {
        passos.push([f.n === 1 || i >= f.pal.length - 3 ? 260 : 60, function (k) { p.setAttribute("opacity", k); }]);
      });
      passos.push([350, function (k) { f.rot.setAttribute("opacity", k); }]);
      passos.push([300, null]);
    });
    cadeia(e, passos);
  });

  /* =====================================================================
     4. fn-tabela: os pontos da tabela de y = 2x − 1 aparecem, a reta se desenha e a leitura f(2) = 3
     ===================================================================== */
  registra("fn-tabela", function (box) {
    var b = novoSvg(box);
    var P = plano(b.svg, { w: b.W, h: b.H, xmin: -2, xmax: 4, ymin: -4, ymax: 6, pl: 50, pr: 40, pt: 40, pb: 20 });
    var f = function (x) { return 2 * x - 1; };
    var reta = el("path", { d: caminho(P, f, -1.5, 3.5, 2), fill: "none", stroke: COR.d, "stroke-width": 6, "stroke-linecap": "round" }, P.dentro);
    var pts = [-1, 0, 1, 2, 3].map(function (x) {
      var g = el("g", { opacity: 0 }, P.fora);
      ponto(g, P.X(x), P.Y(f(x)), COR.titulo, 11);
      rotulo(g, P.X(x) + (x === 0 ? 18 : -18), P.Y(f(x)) + (x === 0 ? 8 : -14), "(" + fmt(x) + "; " + fmt(f(x)) + ")", { "font-size": 24, "text-anchor": x === 0 ? "start" : "end" });
      return g;
    });
    var leitura = el("g", { opacity: 0 }, P.fora);
    el("path", { d: "M" + P.X(2) + " " + P.Y(0) + " V" + P.Y(3) + " H" + P.X(0), fill: "none", stroke: COR.amarelo, "stroke-width": 5, "stroke-dasharray": "12 9" }, leitura);
    rotulo(leitura, P.X(0) + 14, P.Y(3) - 14, "f(2) = 3", { "font-size": 30 });
    return { reta: reta, pts: pts, leitura: leitura };
  }, function (e) {
    var desenha = riscoPronto(e.reta), passos = [];
    e.pts.forEach(function (g) { passos.push([420, function (k) { g.setAttribute("opacity", k); }]); });
    passos.push([200, null]);
    passos.push([1200, function (k) { desenha(ease(k)); }]);
    passos.push([400, null]);
    passos.push([700, function (k) { e.leitura.setAttribute("opacity", k); }]);
    cadeia(e, passos);
  });

  /* =====================================================================
     5. fn-vertical: a reta vertical varre o plano; numa função corta uma vez, na circunferência duas
     ===================================================================== */
  registra("fn-vertical", function (box) {
    var b = novoSvg(box), w = (b.W - 60) / 2, H = b.H;
    var paineis = [
      { x: 0, nome: "É gráfico de função", f: function (x) { return 1.6 * Math.sin(x * 1.15) + .25 * x; }, cor: COR.d },
      { x: w + 60, nome: "Não é gráfico de função", circ: 3, cor: COR.lilas }
    ];
    paineis.forEach(function (p) {
      txt(b.svg, p.x + w / 2, 34, p.nome, { "text-anchor": "middle", "font-size": 32, "font-weight": 800, fill: COR.titulo });
      var P = p.P = plano(b.svg, { x: p.x, y: 50, w: w, h: H - 50, xmin: -4.5, xmax: 4.5, ymin: -4, ymax: 4, pl: 20, pr: 34, pt: 34, pb: 14, numeros: false });
      if (p.f) el("path", { d: caminho(P, p.f, -4.5, 4.5), fill: "none", stroke: p.cor, "stroke-width": 6, "stroke-linecap": "round" }, P.dentro);
      else el("ellipse", { cx: P.X(0), cy: P.Y(0), rx: 3 * P.sx, ry: 3 * P.sy, fill: "none", stroke: p.cor, "stroke-width": 6 }, P.dentro);
      p.linha = el("line", { y1: P.Y(4.2), y2: P.Y(-4.2), stroke: COR.amarelo, "stroke-width": 5, "stroke-dasharray": "14 10" }, P.fora);
      p.b1 = ponto(P.fora, 0, 0, COR.certo, 12); p.b2 = ponto(P.fora, 0, 0, COR.erro, 12);
      p.tag = el("g", {}, P.fora);
      p.tagR = el("rect", { x: p.x + w / 2 - 150, y: H - 70, width: 300, height: 56, rx: 28, fill: "#fff", stroke: "#E4DEFB", "stroke-width": 2 }, p.tag);
      p.tagT = txt(p.tag, p.x + w / 2, H - 31, "", { "text-anchor": "middle", "font-size": 28, "font-weight": 800 });
    });
    return { paineis: paineis };
  }, function (e) {
    laco(e, function (t) {
      var u = (t % 8) / 8, tri = u < .5 ? u * 2 : 2 - u * 2, x = -4.2 + 8.4 * ease(tri);
      if (e.direto) x = 1.4;
      e.paineis.forEach(function (p) {
        var P = p.P, X = P.X(x);
        p.linha.setAttribute("x1", X); p.linha.setAttribute("x2", X);
        if (p.f) {
          p.b1.setAttribute("cx", X); p.b1.setAttribute("cy", P.Y(p.f(x))); p.b1.setAttribute("opacity", 1); p.b2.setAttribute("opacity", 0);
          p.tagT.textContent = "corta 1 vez ✓"; p.tagT.setAttribute("fill", COR.certo);
        } else if (Math.abs(x) < 3) {
          var yy = Math.sqrt(9 - x * x);
          p.b1.setAttribute("cx", X); p.b1.setAttribute("cy", P.Y(yy)); p.b2.setAttribute("cx", X); p.b2.setAttribute("cy", P.Y(-yy));
          p.b1.setAttribute("fill", COR.erro); p.b1.setAttribute("opacity", 1); p.b2.setAttribute("opacity", 1);
          p.tagT.textContent = "corta 2 vezes ✗"; p.tagT.setAttribute("fill", COR.erro);
        } else {
          p.b1.setAttribute("opacity", 0); p.b2.setAttribute("opacity", 0);
          p.tagT.textContent = "não corta"; p.tagT.setAttribute("fill", COR.cinza);
        }
      });
    });
  });

  /* =====================================================================
     6. fn-reta-a: a reta y = ax + b gira conforme a muda (data-b, data-lista)
     ===================================================================== */
  registra("fn-reta-a", function (box) {
    var b = novoSvg(box), bb = +cfg(box, "b", 1);
    var P = plano(b.svg, { w: b.W, h: b.H - 80, y: 80, xmin: -4, xmax: 4, ymin: -4, ymax: 5, pl: 44, pr: 40, pt: 36, pb: 10, ly: 2, lx: 2 });
    var lei = txt(b.svg, 0, 46, "", { "font-size": 44, "font-weight": 800, fill: COR.titulo, "font-style": "italic" });
    var diz = txt(b.svg, b.W, 46, "", { "text-anchor": "end", "font-size": 32, "font-weight": 800, fill: COR.forte });
    var tri = el("path", { fill: "none", stroke: COR.amarelo, "stroke-width": 5, "stroke-linejoin": "round" }, P.dentro);
    var reta = el("line", { stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var r1 = rotulo(P.fora, 0, 0, "1", { "font-size": 26, "text-anchor": "middle" });
    var ra = rotulo(P.fora, 0, 0, "a", { "font-size": 26, "font-style": "italic" });
    ponto(P.fora, P.X(0), P.Y(bb), COR.amarelo, 11);
    var lista = cfg(box, "lista", "2,1,0.5,0,-1,-2").split(",").map(Number);
    return { P: P, b: bb, lei: lei, diz: diz, tri: tri, reta: reta, r1: r1, ra: ra, lista: lista, ident: cfg(box, "identidade", "") === "sim" };
  }, function (e) {
    var P = e.P, bb = e.b;
    function desenha(a) {
      e.reta.setAttribute("x1", P.X(-4.5)); e.reta.setAttribute("y1", P.Y(a * -4.5 + bb));
      e.reta.setAttribute("x2", P.X(4.5)); e.reta.setAttribute("y2", P.Y(a * 4.5 + bb));
      e.tri.setAttribute("d", "M" + P.X(0) + " " + P.Y(bb) + " H" + P.X(1) + " V" + P.Y(bb + a));
      e.r1.setAttribute("x", P.X(.5)); e.r1.setAttribute("y", P.Y(bb) + (a >= 0 ? 34 : -14));
      e.ra.setAttribute("x", P.X(1) + 12); e.ra.setAttribute("y", P.Y(bb + a / 2) + 9);
      e.ra.setAttribute("opacity", Math.abs(a) > .15 ? 1 : 0);
      var sa = fmt(a), sb = bb === 0 ? "" : (bb > 0 ? " + " + fmt(bb) : " − " + fmt(-bb));
      var termo = Math.abs(a) < .005 ? "" : (sa === "1" ? "x" : sa === "−1" ? "−x" : sa + "x");
      e.lei.textContent = "y = " + (termo || (bb === 0 ? "0" : fmt(bb))) + (termo ? sb : "") + "  ·  a = " + sa;
      e.diz.textContent = Math.abs(a) < .05 ? "horizontal: constante" : a > 0 ? (e.ident && Math.abs(a - 1) < .02 ? "identidade: y = x" : "sobe: crescente") : "desce: decrescente";
      e.diz.setAttribute("fill", a > .05 ? COR.forte : a < -.05 ? COR.erro : COR.cinza);
    }
    var L = e.lista, T = 3;
    laco(e, function (t) {
      var n = Math.floor(t / T), u = (t % T) / T, i = n % L.length, j = (i + 1) % L.length;
      var a = u < .55 ? L[i] : L[i] + (L[j] - L[i]) * ease((u - .55) / .45);
      if (e.direto) a = L[0];
      desenha(Math.round(a * 100) / 100);
    });
  });

  /* =====================================================================
     7. fn-reta-b: a reta y = x + b sobe e desce sem mudar a inclinação
     ===================================================================== */
  registra("fn-reta-b", function (box) {
    var b = novoSvg(box);
    var P = plano(b.svg, { w: b.W, h: b.H - 80, y: 80, xmin: -4, xmax: 4, ymin: -4, ymax: 5, pl: 44, pr: 40, pt: 36, pb: 10, ly: 2, lx: 2 });
    [2, 0, -2].forEach(function (k) {
      el("line", { x1: P.X(-5), y1: P.Y(-5 + k), x2: P.X(5), y2: P.Y(5 + k), stroke: COR.lilas, "stroke-width": 3, "stroke-dasharray": "10 10", opacity: .55 }, P.dentro);
    });
    var reta = el("line", { stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var pb = ponto(P.fora, P.X(0), P.Y(0), COR.amarelo, 12);
    var lei = txt(b.svg, 0, 46, "", { "font-size": 44, "font-weight": 800, fill: COR.titulo, "font-style": "italic" });
    txt(b.svg, b.W, 46, "a = 1 o tempo todo", { "text-anchor": "end", "font-size": 30, "font-weight": 800, fill: COR.forte });
    return { P: P, reta: reta, pb: pb, lei: lei };
  }, function (e) {
    var P = e.P;
    laco(e, function (t) {
      var bb = e.direto ? 2 : 2.2 * Math.sin(t * 2 * Math.PI / 8);
      bb = Math.round(bb * 10) / 10;
      e.reta.setAttribute("x1", P.X(-5)); e.reta.setAttribute("y1", P.Y(-5 + bb));
      e.reta.setAttribute("x2", P.X(5)); e.reta.setAttribute("y2", P.Y(5 + bb));
      e.pb.setAttribute("cy", P.Y(bb));
      e.lei.textContent = "y = x " + (bb < 0 ? "− " + fmt(-bb) : "+ " + fmt(bb)) + "  ·  b = " + fmt(bb);
    });
  });

  /* =====================================================================
     8. fn-tanque: V = 40 − 5t; o tanque esvazia e a reta desce até o zero
     ===================================================================== */
  registra("fn-tanque", function (box) {
    var b = novoSvg(box), tw = 170;
    var P = plano(b.svg, { w: b.W - tw - 30, h: b.H, xmin: 0, xmax: 9, ymin: 0, ymax: 45, dy: 5, ly: 10, lx: 1, pl: 70, pr: 40, pt: 50, pb: 54, rx: "t (h)", ry: "V (L)" });
    var reta = el("path", { d: caminho(P, function (t) { return 40 - 5 * t; }, 0, 8, 2), fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var bola = ponto(P.fora, P.X(0), P.Y(40), COR.d, 12);
    var zero = el("g", { opacity: 0 }, P.fora);
    ponto(zero, P.X(8), P.Y(0), COR.amarelo, 14);
    rotulo(zero, P.X(8) - 18, P.Y(0) - 24, "(8; 0)", { "font-size": 30, "text-anchor": "end" });
    var tx = b.W - tw, ty = 70, th = b.H - 200;
    el("rect", { x: tx, y: ty, width: tw - 20, height: th, rx: 26, fill: "#fff", stroke: COR.eixo, "stroke-width": 4 }, b.svg);
    var nivel = el("rect", { x: tx + 8, width: tw - 36, rx: 18, fill: "#FFD10C", "fill-opacity": .8 }, b.svg);
    var leit = txt(b.svg, tx + (tw - 20) / 2, ty + th + 50, "", { "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: COR.titulo });
    var leit2 = txt(b.svg, tx + (tw - 20) / 2, ty + th + 90, "", { "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: COR.cinza });
    return { P: P, reta: reta, bola: bola, zero: zero, nivel: nivel, ty: ty, th: th, leit: leit, leit2: leit2 };
  }, function (e) {
    var desenha = riscoPronto(e.reta), P = e.P;
    function em(t) {
      var V = 40 - 5 * t, h = (e.th - 16) * V / 40;
      e.nivel.setAttribute("y", e.ty + e.th - 8 - h); e.nivel.setAttribute("height", Math.max(0, h));
      e.bola.setAttribute("cx", P.X(t)); e.bola.setAttribute("cy", P.Y(V));
      e.leit.textContent = "V = " + fmt(V, 0) + " L"; e.leit2.textContent = "t = " + fmt(t, 1) + " h";
    }
    em(0);
    cadeia(e, [[500, null], [5200, function (k) { desenha(k); em(8 * k); }], [600, function (k) { e.zero.setAttribute("opacity", k); }]]);
  });

  /* =====================================================================
     9. fn-academias: as duas retas se desenham e se cruzam em 4 meses
     ===================================================================== */
  registra("fn-academias", function (box) {
    var b = novoSvg(box);
    var P = plano(b.svg, { w: b.W, h: b.H, xmin: 0, xmax: 7, ymin: 0, ymax: 700, dy: 100, ly: 100, lx: 1, pl: 80, pr: 70, pt: 40, pb: 54, rx: "meses", ry: "R$", fs: 22 });
    var ra = el("path", { d: caminho(P, function (x) { return 60 + 80 * x; }, 0, 7, 2), fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var rb = el("path", { d: caminho(P, function (x) { return 95 * x; }, 0, 7, 2), fill: "none", stroke: COR.lilas, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var nomes = el("g", { opacity: 0 }, P.fora);
    rotulo(nomes, P.X(1.6), P.Y(60 + 80 * 1.6) - 26, "A = 60 + 80x", { "font-size": 28, fill: COR.forte, "text-anchor": "middle" });
    rotulo(nomes, P.X(2.9), P.Y(95 * 2.9) + 50, "B = 95x", { "font-size": 28, fill: "#6E5FCF", "text-anchor": "start" });
    var cruza = el("g", { opacity: 0 }, P.fora);
    el("path", { d: "M" + P.X(4) + " " + P.Y(0) + " V" + P.Y(380), stroke: COR.amarelo, "stroke-width": 5, "stroke-dasharray": "12 9", fill: "none" }, cruza);
    ponto(cruza, P.X(4), P.Y(380), COR.amarelo, 15);
    rotulo(cruza, P.X(4) - 22, P.Y(380) - 22, "4 meses: R$ 380 nos dois", { "font-size": 28, "text-anchor": "end" });
    return { ra: ra, rb: rb, nomes: nomes, cruza: cruza };
  }, function (e) {
    var da = riscoPronto(e.ra), db = riscoPronto(e.rb);
    cadeia(e, [[300, null], [3200, function (k) { da(k); db(k); }], [500, function (k) { e.nomes.setAttribute("opacity", k); }], [700, function (k) { e.cruza.setAttribute("opacity", k); }]]);
  });

  /* =====================================================================
     10. fn-parabola: a parábola y = ax² + bx + c muda com a, b e c (data-modo: letras que variam)
     ===================================================================== */
  var QUADROS = {
    a: [[2, -2, -3], [.5, -2, -3], [-1, -2, -3], [1, -2, -3]],
    c: [[1, -2, 2], [1, -2, -3]],
    b: [[1, 2, -3], [1, 0, -3], [1, -2, -3]]
  };
  registra("fn-parabola", function (box) {
    var b = novoSvg(box), modo = cfg(box, "modo", "abc");
    var P = plano(b.svg, { w: b.W, h: b.H - 230, y: 80, xmin: -5, xmax: 5, ymin: -6, ymax: 6, pl: 36, pr: 40, pt: 30, pb: 10, lx: 1, ly: 2 });
    var lei = el("text", { x: 0, y: 50, "font-size": 48, "font-weight": 800, fill: COR.titulo, "font-style": "italic", "font-family": FONTE }, b.svg);
    var pecas = ["y = ", "", "x² ", "", "x ", ""].map(function (s) { var t = el("tspan", {}, lei); t.textContent = s; return t; });
    var curva = el("path", { fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var tang = el("line", { stroke: COR.amarelo, "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }, P.dentro);
    var pc = ponto(P.fora, P.X(0), 0, COR.amarelo, 12);
    var pv = ponto(P.fora, 0, 0, COR.titulo, 11);
    var info = el("g", { "font-size": 30, "font-weight": 700, "font-family": FONTE, fill: COR.carvao }, b.svg);
    var l1 = txt(info, 0, b.H - 96, ""), l2 = txt(info, 0, b.H - 54, ""), l3 = txt(info, 0, b.H - 12, "");
    var seq = [[1, -2, -3]], focos = [""];
    modo.split("").forEach(function (m) { (QUADROS[m] || []).forEach(function (q) { seq.push(q); focos.push(m); }); });
    return { P: P, pecas: pecas, curva: curva, tang: tang, pc: pc, pv: pv, l: [l1, l2, l3], seq: seq, focos: focos, modo: modo };
  }, function (e) {
    var P = e.P;
    function coef(v, primeiro) {
      var s = fmt(Math.abs(v), 1);
      return (primeiro ? (v < 0 ? "−" : "") : (v < 0 ? " − " : " + ")) + s;
    }
    function desenha(a, b, c, foco) {
      e.curva.setAttribute("d", caminho(P, function (x) { return a * x * x + b * x + c; }, -5.2, 5.2, 200));
      e.pecas[1].textContent = coef(a, true);
      e.pecas[3].textContent = coef(b, false);
      e.pecas[5].textContent = coef(c, false);
      [1, 3, 5].forEach(function (i, k) {
        var on = foco === "abc"[k];
        e.pecas[i].setAttribute("fill", on ? "var(--d)" : COR.titulo);
        e.pecas[i].setAttribute("font-size", on ? 58 : 48);
      });
      e.pc.setAttribute("cy", P.Y(c));
      if (Math.abs(a) > .03) {
        var xv = -b / (2 * a), yv = a * xv * xv + b * xv + c;
        e.pv.setAttribute("cx", P.X(xv)); e.pv.setAttribute("cy", P.Y(yv));
        e.pv.setAttribute("opacity", yv > -6.3 && yv < 6.3 && Math.abs(xv) < 5.2 ? 1 : 0);
      } else e.pv.setAttribute("opacity", 0);
      e.tang.setAttribute("opacity", foco === "b" ? 1 : 0);
      e.tang.setAttribute("x1", P.X(-1)); e.tang.setAttribute("y1", P.Y(c - b));
      e.tang.setAttribute("x2", P.X(1)); e.tang.setAttribute("y2", P.Y(c + b));
      e.l[0].textContent = "a " + (a > .03 ? "> 0: boca para cima (U)" : a < -.03 ? "< 0: boca para baixo (∩)" : "= 0: não é parábola!");
      e.l[0].setAttribute("fill", foco === "a" ? "var(--d-forte)" : COR.carvao);
      e.l[1].textContent = "c = " + fmt(c, 1) + ": corta o eixo y em (0; " + fmt(c, 1) + ")";
      e.l[1].setAttribute("fill", foco === "c" ? "var(--d-forte)" : COR.carvao);
      e.l[2].textContent = "b " + (b > .05 ? "> 0: cruza o eixo y subindo" : b < -.05 ? "< 0: cruza o eixo y descendo" : "= 0: vértice sobre o eixo y");
      e.l[2].setAttribute("fill", foco === "b" ? "var(--d-forte)" : COR.carvao);
      e.l.forEach(function (l, k) { l.setAttribute("opacity", e.modo.indexOf("acb"[k]) >= 0 || k === 0 ? 1 : .35); });
    }
    var S = e.seq, F = e.focos, T = 3.2;
    laco(e, function (t) {
      var n = Math.floor(t / T), u = (t % T) / T, i = n % S.length, j = (i + 1) % S.length;
      var k = u < .5 ? 0 : ease((u - .5) / .5), q = [0, 1, 2].map(function (m) { return S[i][m] + (S[j][m] - S[i][m]) * k; });
      var foco = u < .5 ? F[i] : F[j];
      if (e.direto) { q = S[0]; foco = ""; }
      desenha(q[0], q[1], q[2], foco);
    });
  });

  /* =====================================================================
     11. fn-tabela-parabola: os pontos de y = x² − 2x − 3, a curva e o eixo de simetria
     ===================================================================== */
  function parabolaBase(box, o) {
    var b = novoSvg(box);
    var P = plano(b.svg, Object.assign({ w: b.W, h: b.H, xmin: -3, xmax: 5, ymin: -5, ymax: 6, pl: 44, pr: 40, pt: 36, pb: 16 }, o || {}));
    return { b: b, P: P };
  }
  var F0 = function (x) { return x * x - 2 * x - 3; };
  registra("fn-tabela-parabola", function (box) {
    var z = parabolaBase(box), P = z.P;
    var curva = el("path", { d: caminho(P, F0, -2.25, 4.25), fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var pts = [-2, -1, 0, 1, 2, 3, 4].map(function (x) { var g = el("g", { opacity: 0 }, P.fora); ponto(g, P.X(x), P.Y(F0(x)), COR.titulo, 11); return g; });
    var eixo = el("g", { opacity: 0 }, P.fora);
    el("line", { x1: P.X(1), y1: P.Y(6), x2: P.X(1), y2: P.Y(-5), stroke: COR.amarelo, "stroke-width": 5, "stroke-dasharray": "14 10" }, eixo);
    [[0, 2], [-1, 3], [-2, 4]].forEach(function (p) {
      el("line", { x1: P.X(p[0]) + 14, y1: P.Y(F0(p[0])), x2: P.X(p[1]) - 14, y2: P.Y(F0(p[1])), stroke: COR.lilas, "stroke-width": 3, "stroke-dasharray": "6 8" }, eixo);
    });
    rotulo(eixo, P.X(1) + 16, P.Y(5.3), "eixo de simetria: x = 1", { "font-size": 26 });
    return { curva: curva, pts: pts, eixo: eixo };
  }, function (e) {
    var d = riscoPronto(e.curva), passos = [];
    e.pts.forEach(function (g) { passos.push([380, function (k) { g.setAttribute("opacity", k); }]); });
    passos.push([300, null], [1600, function (k) { d(ease(k)); }], [400, null], [800, function (k) { e.eixo.setAttribute("opacity", k); }]);
    cadeia(e, passos);
  });

  /* =====================================================================
     12. fn-cortes: a parábola se desenha e mostra zeros, corte em y e vértice
     ===================================================================== */
  registra("fn-cortes", function (box) {
    var z = parabolaBase(box), P = z.P;
    var curva = el("path", { d: caminho(P, F0, -2.25, 4.25), fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    function marca(x, y, cor, s, dx, dy, anc) { var g = el("g", { opacity: 0 }, P.fora); ponto(g, P.X(x), P.Y(y), cor, 13); rotulo(g, P.X(x) + dx, P.Y(y) + dy, s, { "font-size": 28, "text-anchor": anc || "start" }); return g; }
    var zeros = el("g", { opacity: 0 }, P.fora);
    zeros.appendChild(marca(-1, 0, COR.d, "(−1; 0)", -16, -18, "end")).setAttribute("opacity", 1);
    zeros.appendChild(marca(3, 0, COR.d, "(3; 0)", 16, -18)).setAttribute("opacity", 1);
    var cy = marca(0, -3, COR.amarelo, "(0; −3)", 20, 30);
    var v = el("g", { opacity: 0 }, P.fora);
    el("line", { x1: P.X(1), y1: P.Y(6), x2: P.X(1), y2: P.Y(-5), stroke: COR.lilas, "stroke-width": 4, "stroke-dasharray": "12 10" }, v);
    v.appendChild(marca(1, -4, COR.titulo, "V(1; −4)", 18, 10)).setAttribute("opacity", 1);
    return { curva: curva, zeros: zeros, cy: cy, v: v };
  }, function (e) {
    var d = riscoPronto(e.curva);
    cadeia(e, [[300, null], [1800, function (k) { d(ease(k)); }], [600, function (k) { e.zeros.setAttribute("opacity", k); }], [500, null],
      [600, function (k) { e.cy.setAttribute("opacity", k); }], [500, null], [700, function (k) { e.v.setAttribute("opacity", k); }]]);
  });

  /* =====================================================================
     13. fn-delta: y = x² − 2x + c sobe; o Δ diz quantos cortes há no eixo x
     ===================================================================== */
  registra("fn-delta", function (box) {
    var b = novoSvg(box);
    var P = plano(b.svg, { w: b.W, h: b.H - 80, y: 80, xmin: -3, xmax: 5, ymin: -5, ymax: 6, pl: 44, pr: 40, pt: 30, pb: 10 });
    var curva = el("path", { fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var z1 = ponto(P.fora, 0, P.Y(0), COR.amarelo, 13), z2 = ponto(P.fora, 0, P.Y(0), COR.amarelo, 13);
    var lei = txt(b.svg, 0, 48, "", { "font-size": 40, "font-weight": 800, fill: COR.titulo, "font-style": "italic" });
    var diz = txt(b.svg, b.W, 48, "", { "text-anchor": "end", "font-size": 34, "font-weight": 800 });
    return { P: P, curva: curva, z1: z1, z2: z2, lei: lei, diz: diz };
  }, function (e) {
    var P = e.P, K = [-3, 1, 3], T = 3.6;
    laco(e, function (t) {
      var n = Math.floor(t / T), u = (t % T) / T, i = n % K.length, j = (i + 1) % K.length;
      var c = u < .55 ? K[i] : K[i] + (K[j] - K[i]) * ease((u - .55) / .45);
      if (e.direto) c = -3;
      c = Math.round(c * 20) / 20;
      e.curva.setAttribute("d", caminho(P, function (x) { return x * x - 2 * x + c; }, -3.2, 5.2));
      var D = 4 - 4 * c;
      e.lei.textContent = "y = x² − 2x " + (c < 0 ? "− " + fmt(-c) : "+ " + fmt(c)) + "  ·  Δ = " + fmt(D);
      if (D > .01) {
        var r = Math.sqrt(D) / 2;
        e.z1.setAttribute("cx", P.X(1 - r)); e.z2.setAttribute("cx", P.X(1 + r));
        e.z1.setAttribute("opacity", 1); e.z2.setAttribute("opacity", 1);
        e.diz.textContent = "Δ > 0: corta em 2 pontos"; e.diz.setAttribute("fill", COR.forte);
      } else if (D > -.01) {
        e.z1.setAttribute("cx", P.X(1)); e.z1.setAttribute("opacity", 1); e.z2.setAttribute("opacity", 0);
        e.diz.textContent = "Δ = 0: toca em 1 ponto"; e.diz.setAttribute("fill", COR.titulo);
      } else {
        e.z1.setAttribute("opacity", 0); e.z2.setAttribute("opacity", 0);
        e.diz.textContent = "Δ < 0: não toca"; e.diz.setAttribute("fill", COR.erro);
      }
    });
  });

  /* =====================================================================
     14. fn-bola: h = −5t² + 20t; a bola sobe e desce e o gráfico vai sendo traçado
     ===================================================================== */
  registra("fn-bola", function (box) {
    var b = novoSvg(box), col = 130;
    var P = plano(b.svg, { x: col, w: b.W - col, h: b.H, xmin: 0, xmax: 4.5, ymin: 0, ymax: 25, dx: .5, lx: 1, dy: 5, ly: 5, pl: 64, pr: 50, pt: 40, pb: 54, rx: "t (s)", ry: "h (m)" });
    el("line", { x1: 30, y1: P.Y(0), x2: col - 10, y2: P.Y(0), stroke: COR.eixo, "stroke-width": 5, "stroke-linecap": "round" }, b.svg);
    var curva = el("path", { d: caminho(P, function (t) { return -5 * t * t + 20 * t; }, 0, 4), fill: "none", stroke: COR.d, "stroke-width": 7, "stroke-linecap": "round" }, P.dentro);
    var guia = el("line", { stroke: COR.lilas, "stroke-width": 3, "stroke-dasharray": "8 8" }, b.svg);
    var bola = el("g", {}, b.svg);
    el("circle", { cx: 0, cy: 0, r: 22, fill: "#fff", stroke: COR.carvao, "stroke-width": 4 }, bola);
    el("path", { d: "M-12 -6 L0 -15 L12 -6 L7 9 L-7 9 Z", fill: COR.carvao }, bola);
    var pt = ponto(P.fora, 0, 0, COR.d, 11);
    var max = el("g", { opacity: 0 }, P.fora);
    el("path", { d: "M" + P.X(2) + " " + P.Y(0) + " V" + P.Y(20) + " H" + P.X(0), fill: "none", stroke: COR.amarelo, "stroke-width": 4, "stroke-dasharray": "10 8" }, max);
    ponto(max, P.X(2), P.Y(20), COR.amarelo, 14);
    rotulo(max, P.X(2) + 20, P.Y(20) - 18, "máximo: 20 m em 2 s", { "font-size": 28 });
    var rel = txt(b.svg, b.W, 30, "", { "text-anchor": "end", "font-size": 30, "font-weight": 800, fill: COR.titulo });
    return { P: P, curva: curva, guia: guia, bola: bola, pt: pt, max: max, rel: rel, col: col };
  }, function (e) {
    var d = riscoPronto(e.curva), P = e.P;
    laco(e, function (s) {
      var u = s % 7.5, t = Math.min(4, u / 1.1);
      if (e.direto) t = 2;
      var h = -5 * t * t + 20 * t;
      d(e.direto ? 1 : t / 4);
      e.bola.setAttribute("transform", "translate(" + (e.col / 2 + 10) + " " + (P.Y(h) - 22) + ")");
      e.pt.setAttribute("cx", P.X(t)); e.pt.setAttribute("cy", P.Y(h));
      e.guia.setAttribute("x1", e.col / 2 + 36); e.guia.setAttribute("x2", P.X(t)); e.guia.setAttribute("y1", P.Y(h)); e.guia.setAttribute("y2", P.Y(h));
      e.max.setAttribute("opacity", t >= 2 ? 1 : 0);
      e.rel.textContent = "t = " + fmt(t, 1) + " s  ·  h = " + fmt(h, 1) + " m";
    });
  });

  /* =====================================================================
     15. fn-canteiro: 20 m de tela; o retângulo muda e a área anda na parábola A = −x² + 10x
     ===================================================================== */
  registra("fn-canteiro", function (box) {
    var b = novoSvg(box), esq = Math.min(440, b.W * .5), K = 40;
    var ret = el("rect", { x: 20, y: 40, fill: "#E8F0FF", stroke: COR.d, "stroke-width": 6, rx: 6 }, b.svg);
    var tx = txt(b.svg, 0, 0, "", { "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: COR.forte });
    var ty = txt(b.svg, 0, 0, "", { "font-size": 28, "font-weight": 800, fill: COR.forte });
    var ta = txt(b.svg, 0, 0, "", { "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: COR.titulo });
    var P = plano(b.svg, { x: esq, w: b.W - esq, h: b.H, xmin: 0, xmax: 10, ymin: 0, ymax: 30, dx: 1, lx: 2, dy: 5, ly: 10, pl: 60, pr: 40, pt: 40, pb: 54, rx: "x (m)", ry: "A (m²)" });
    el("path", { d: caminho(P, function (x) { return -x * x + 10 * x; }, 0, 10), fill: "none", stroke: COR.lilas, "stroke-width": 5 }, P.dentro);
    var pt = ponto(P.fora, 0, 0, COR.d, 13);
    return { ret: ret, tx: tx, ty: ty, ta: ta, P: P, pt: pt, K: K, esq: esq, H: b.H };
  }, function (e) {
    var P = e.P, K = Math.min(e.K, (e.esq - 90) / 9);
    laco(e, function (s) {
      var x = e.direto ? 3 : 5 - 4 * Math.cos(s * 2 * Math.PI / 12), y = 10 - x, A = x * y;
      var w = x * K, h = y * K, x0 = 20, y0 = 40;
      e.ret.setAttribute("width", w); e.ret.setAttribute("height", h);
      e.tx.setAttribute("x", x0 + w / 2); e.tx.setAttribute("y", y0 - 12); e.tx.textContent = fmt(x) + " m";
      e.ty.setAttribute("x", x0 + w + 12); e.ty.setAttribute("y", y0 + h / 2 + 10); e.ty.textContent = fmt(y) + " m";
      e.ta.setAttribute("x", x0 + w / 2); e.ta.setAttribute("y", y0 + h + 46); e.ta.textContent = fmt(A) + " m²";
      e.pt.setAttribute("cx", P.X(x)); e.pt.setAttribute("cy", P.Y(A));
    });
  });

  /* =====================================================================
     16. fn-figura: gráfico descrito em data-fig (JSON). Com "anima": true, as curvas se desenham e os pontos
         aparecem um a um quando a figura entra; sem ele, é uma figura parada (ex.: figura de questão).
     ===================================================================== */
  registra("fn-figura", function (box) {
    var b = novoSvg(box), o = {};
    try { o = JSON.parse(box.getAttribute("data-fig") || "{}"); } catch (err) { o = {}; }
    var P = plano(b.svg, Object.assign({ w: b.W, h: b.H }, o));
    var itens = [];
    (o.areas || []).forEach(function (a) {
      var g = el("rect", { x: P.X(a.x1), y: P.Y(a.y2), width: P.X(a.x2) - P.X(a.x1), height: P.Y(a.y1) - P.Y(a.y2), fill: a.cor || COR.amarelo, "fill-opacity": a.op || .25 }, P.dentro);
      itens.push({ g: g, tipo: "some", fixo: a.fixo });
    });
    (o.segs || []).forEach(function (s) {
      var g = el("line", { x1: P.X(s.x1), y1: P.Y(s.y1), x2: P.X(s.x2), y2: P.Y(s.y2), stroke: s.cor || COR.amarelo, "stroke-width": s.w || 5, "stroke-dasharray": s.tr ? "12 9" : undefined, "stroke-linecap": "round" }, s.fora ? P.fora : P.dentro);
      itens.push({ g: g, tipo: "risco", fixo: s.fixo });
    });
    (o.circs || []).forEach(function (c) {
      var g = el("ellipse", { cx: P.X(c.x), cy: P.Y(c.y), rx: c.r * P.sx, ry: c.r * P.sy, fill: "none", stroke: c.cor || COR.d, "stroke-width": c.w || 6 }, P.dentro);
      itens.push({ g: g, tipo: "risco", fixo: c.fixo });
    });
    (o.curvas || []).forEach(function (c) {
      var f = new Function("x", "return " + c.f);
      var dd;
      if (c.inv) { dd = ""; for (var i = 0; i <= 120; i++) { var yy = c.de + (c.ate - c.de) * i / 120; dd += (i ? " L" : "M") + P.X(f(yy)).toFixed(1) + " " + P.Y(yy).toFixed(1); } }
      var g = el("path", { d: dd || caminho(P, f, c.de === undefined ? P.o.xmin - .2 : c.de, c.ate === undefined ? P.o.xmax + .2 : c.ate, c.n || 200), fill: "none", stroke: c.cor || COR.d, "stroke-width": c.w || 7, "stroke-linecap": "round", "stroke-dasharray": c.tr ? "12 9" : undefined }, P.dentro);
      itens.push({ g: g, tipo: c.tr ? "some" : "risco", fixo: c.fixo });
    });
    (o.pontos || []).forEach(function (p) {
      var g = el("g", {}, P.fora);
      ponto(g, P.X(p.x), P.Y(p.y), p.cor || COR.titulo, p.r || 11);
      if (p.t) rotulo(g, P.X(p.x) + (p.dx === undefined ? 16 : p.dx), P.Y(p.y) + (p.dy === undefined ? -16 : p.dy), p.t, { "font-size": p.fs || 26, "text-anchor": p.anc || "start" });
      itens.push({ g: g, tipo: "some", fixo: p.fixo });
    });
    (o.textos || []).forEach(function (t) {
      var g = rotulo(P.fora, P.X(t.x), P.Y(t.y), t.t, { "font-size": t.fs || 26, "text-anchor": t.anc || "middle", fill: t.cor || COR.titulo });
      itens.push({ g: g, tipo: "some", fixo: t.fixo });
    });
    var lista = [].concat(o.areas || [], o.segs || [], o.circs || [], o.curvas || [], o.pontos || [], o.textos || []);
    itens.forEach(function (it, i) { if (lista[i] && lista[i].passo) it.g.setAttribute("data-passo", lista[i].passo); });
    return { itens: itens, anima: !!o.anima };
  }, function (e) {
    if (!e.anima) return;
    var passos = [];
    e.itens.forEach(function (it) {
      if (it.fixo) return;
      if (it.tipo === "risco") { var d = riscoPronto(it.g); passos.push([1300, function (k) { d(ease(k)); }]); }
      else { it.g.setAttribute("opacity", 0); passos.push([420, function (k) { it.g.setAttribute("opacity", k); }]); }
      passos.push([150, null]);
    });
    cadeia(e, passos);
  });

  /* figura parada: não se remonta ao entrar no slide (os itens com "passo" usam o data-passo do motor) */
  (function () {
    var F = A["fn-figura"], r = F.roda, z = F.zera;
    function anima(box) { return /"anima"\s*:\s*true/.test(box.getAttribute("data-fig") || ""); }
    F.roda = function (box, v) { if (anima(box)) r(box, v); };
    F.zera = function (box) { if (anima(box)) z(box); };
  })();

  /* o script vem depois do palco: as figuras já existem e são montadas antes do motor */
  document.querySelectorAll("[data-anima^='fn-']").forEach(function (b) { var a = A[b.dataset.anima]; if (a) a.inicia(b); });
})();
