/* Animações de Termologia (Física, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo); com
   prefers-reduced-motion, cada uma mostra um quadro parado que já conta a ideia.
   - termo-agitacao: partículas de um corpo frio ou quente (data-nivel="frio" ou "quente"): a temperatura é o grau de agitação;
   - termo-equilibrio: dois corpos encostados; o calor passa do mais quente para o mais frio até as temperaturas ficarem iguais;
   - termo-conducao: barra de metal com uma ponta no fogo; a agitação passa de partícula em partícula, sem o metal sair do lugar;
   - termo-conveccao: água numa panela aquecida pelo fundo; a água quente (menos densa) sobe no meio e a fria desce pelos lados;
   - termo-escalas: três termômetros com o mesmo líquido; o nível sobe e desce e as três leituras andam juntas (°C, °F e K);
   - termo-motor: máquina a vapor; o vapor empurra o pistão, a biela gira a roda, e o calor que sobra vai para o ambiente. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  function parado() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function el(nome, at, pai) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); if (pai) pai.appendChild(e); return e; }
  function sorte(s) { s = s || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function fmt(v) { return v.toFixed(1); }

  /* cor da temperatura (0 = frio, 1 = quente): azul-claro → lilás → laranja → vermelho */
  var PARADAS = [[0, [74, 144, 226]], [.4, [140, 110, 214]], [.72, [240, 140, 46]], [1, [214, 58, 31]]];
  function cor(t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 1; i < PARADAS.length; i++) if (t <= PARADAS[i][0]) {
      var a = PARADAS[i - 1], b = PARADAS[i], k = (t - a[0]) / (b[0] - a[0]);
      return "rgb(" + [0, 1, 2].map(function (j) { return Math.round(a[1][j] + (b[1][j] - a[1][j]) * k); }).join(",") + ")";
    }
    return "rgb(214,58,31)";
  }

  /* svg do tamanho da caixa (data-w, data-h) */
  function base(box) {
    var W = +box.dataset.w || 600, H = +box.dataset.h || 300;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true" });
    svg.style.display = "block"; svg.style.overflow = "visible";
    box.insertBefore(svg, box.firstChild);
    return { W: W, H: H, svg: svg };
  }

  /* fábrica: monta(box) cria a cena; desenha(C, t) desenha o instante t (s); ciclo em segundos; tParado é o quadro sem movimento */
  function anima(nome, monta, desenha, ciclo, tParado) {
    var A = {
      inicia: function (box) { if (!box._c) box._c = monta(box); box._vez = (box._vez || 0) + 1; desenha(box._c, 0); },
      zera: function (box) { A.inicia(box); },
      roda: function (box) {
        A.inicia(box);
        var C = box._c, vez = box._vez, t0 = null, ultimo = 0;
        if (parado()) { desenha(C, tParado); return; }
        function quadro(agora) {
          if (box._vez !== vez) return;
          if (t0 === null) t0 = agora;
          if (agora - ultimo > 33) { ultimo = agora; desenha(C, ((agora - t0) / 1000) % ciclo); }
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
    window.QuarksAnimacoes[nome] = A;
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { A.inicia(b); });
    });
  }

  /* chama desenhada em (x, y) = base da chama */
  function chama(pai, x, y, k) {
    var g = el("g", { transform: "translate(" + x + " " + y + ") scale(" + (k || 1) + ")" }, pai);
    var a = el("path", { d: "M0 0 q-30 -30 -6 -78 q8 26 22 34 q8 -22 4 -40 q30 34 10 84 z", fill: "#FF8A3D" }, g);
    var b = el("path", { d: "M2 0 q-16 -16 -2 -44 q6 14 12 18 q6 -10 2 -20 q16 20 4 46 z", fill: "#FFD10C" }, g);
    return { g: g, a: a, b: b, x: x, y: y, k: k || 1 };
  }
  function tremeChama(f, t) {
    var s = 1 + .07 * Math.sin(t * 5.3) + .04 * Math.sin(t * 8.9);
    f.g.setAttribute("transform", "translate(" + f.x + " " + f.y + ") scale(" + fmt(f.k * (1 + .03 * Math.sin(t * 7))) + " " + fmt(f.k * s) + ")");
  }

  /* ---------- termo-agitacao ---------- */
  anima("termo-agitacao", function (box) {
    var B = base(box), quente = box.dataset.nivel === "quente", rnd = sorte(quente ? 31 : 17);
    var cols = +(box.dataset.cols || 7), lin = +(box.dataset.linhas || 4), r = +(box.dataset.r || 13);
    var dx = (B.W - 40) / cols, dy = (B.H - 40) / lin, ps = [];
    for (var i = 0; i < cols; i++) for (var j = 0; j < lin; j++) {
      ps.push({ x: 20 + dx * (i + .5), y: 20 + dy * (j + .5), f1: rnd() * 6.3, f2: rnd() * 6.3, w1: .8 + rnd() * .5, w2: .8 + rnd() * .5,
                c: el("circle", { r: r, fill: cor(quente ? .92 : .08), stroke: quente ? "#9C2A12" : "#2F6DB0", "stroke-width": 1.5 }, B.svg) });
    }
    return { ps: ps, A: quente ? 7 : 1.6, w: quente ? 8.5 : 2.6 };
  }, function (C, t) {
    C.ps.forEach(function (p) {
      p.c.setAttribute("cx", fmt(p.x + C.A * Math.sin(C.w * p.w1 * t + p.f1)));
      p.c.setAttribute("cy", fmt(p.y + C.A * Math.cos(C.w * p.w2 * t + p.f2)));
    });
  }, 1000, .4);

  /* ---------- termo-equilibrio ---------- */
  anima("termo-equilibrio", function (box) {
    var B = base(box), W = B.W, H = B.H, rnd = sorte(5), meio = W / 2, top = 70, bot = H - 20;
    var svg = B.svg;
    el("rect", { x: 10, y: top, width: meio - 10, height: bot - top, rx: 26, fill: "#FFF1E6", stroke: "#F3B48A", "stroke-width": 3 }, svg);
    el("rect", { x: meio, y: top, width: meio - 10, height: bot - top, rx: 26, fill: "#E8F2FC", stroke: "#9CC3EC", "stroke-width": 3 }, svg);
    var fA = el("rect", { x: 10, y: top, width: meio - 10, height: bot - top, rx: 26, fill: "none" }, svg);
    var ps = [], cols = 6, lin = 4, dx = (meio - 50) / cols, dy = (bot - top - 30) / lin;
    [0, 1].forEach(function (lado) {
      for (var i = 0; i < cols; i++) for (var j = 0; j < lin; j++) {
        ps.push({ lado: lado, x: (lado ? meio + 20 : 30) + dx * (i + .5), y: top + 15 + dy * (j + .5), f1: rnd() * 6.3, f2: rnd() * 6.3, w1: .8 + rnd() * .5, w2: .8 + rnd() * .5,
                  c: el("circle", { r: 12, "stroke-width": 1.5, stroke: "rgba(41,43,44,.35)" }, svg) });
      }
    });
    /* pacotes de energia (calor) atravessando a divisa */
    var pac = [];
    for (var k = 0; k < 5; k++) pac.push({ f: k / 5, y: top + 30 + k * (bot - top - 60) / 4, c: el("circle", { r: 8, fill: "#FFD10C", stroke: "#B58E00", "stroke-width": 2 }, svg) });
    /* termômetros no alto de cada corpo */
    function termo(x) {
      el("rect", { x: x - 70, y: 18, width: 140, height: 22, rx: 11, fill: "#fff", stroke: "#BFB6E6", "stroke-width": 2 }, svg);
      return el("rect", { x: x - 66, y: 22, width: 10, height: 14, rx: 7 }, svg);
    }
    var tA = termo(meio / 2 + 5), tB = termo(meio + meio / 2 - 5);
    var rot = el("text", { x: meio, y: 54, "text-anchor": "middle", "font-family": "Figtree,'Segoe UI',sans-serif", "font-weight": 800, "font-size": 24, fill: "#3F2FA0" }, svg);
    return { ps: ps, pac: pac, tA: tA, tB: tB, rot: rot, meio: meio, fA: fA };
  }, function (C, t) {
    /* 0 a 1 s parado; 1 a 7 s troca de calor; 7 a 9 s equilíbrio; 9 a 10 s volta ao início */
    var k = t < 1 ? 0 : t < 7 ? 1 - Math.exp(-(t - 1) / 1.5) : t < 9 ? 1 : 1 - suave(t - 9);
    var TA = 1 - .5 * k, TB = .5 * k, d = TA - TB;
    C.ps.forEach(function (p) {
      var T = p.lado ? TB : TA, A = 1.4 + 6 * T, w = 2.4 + 6.5 * T;
      p.c.setAttribute("fill", cor(T));
      p.c.setAttribute("cx", fmt(p.x + A * Math.sin(w * p.w1 * t + p.f1)));
      p.c.setAttribute("cy", fmt(p.y + A * Math.cos(w * p.w2 * t + p.f2)));
    });
    C.pac.forEach(function (q) {
      var s = (t * .7 + q.f) % 1;
      q.c.setAttribute("cx", fmt(C.meio - 70 + 140 * s));
      q.c.setAttribute("cy", fmt(q.y));
      q.c.setAttribute("opacity", fmt(Math.min(1, d * 1.6) * Math.sin(Math.PI * s)));
    });
    C.tA.setAttribute("width", fmt(10 + 122 * TA)); C.tA.setAttribute("fill", cor(TA));
    C.tB.setAttribute("width", fmt(10 + 122 * TB)); C.tB.setAttribute("fill", cor(TB));
    var txt = d > .04 ? "calor →" : "mesma temperatura: o calor para";
    if (C.rot.textContent !== txt) C.rot.textContent = txt;
  }, 10, 8);

  /* ---------- termo-conducao ---------- */
  function erfc(x) { // aproximação de Abramowitz e Stegun (x >= 0)
    var t = 1 / (1 + .3275911 * x);
    return t * (.254829592 + t * (-.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
  }
  anima("termo-conducao", function (box) {
    var B = base(box), W = B.W, H = B.H, svg = B.svg, x0 = 150, x1 = W - 30, yc = H / 2 + 10, cols = 15, lin = 3;
    el("rect", { x: x0 - 20, y: yc - 62, width: x1 - x0 + 40, height: 124, rx: 30, fill: "#ECEAF4", stroke: "#B9B4CC", "stroke-width": 3 }, svg);
    var f = chama(svg, 92, yc + 90, 1.25);
    var ps = [], dx = (x1 - x0) / cols, rnd = sorte(9);
    for (var i = 0; i < cols; i++) for (var j = 0; j < lin; j++) {
      ps.push({ i: i, x: x0 + dx * (i + .5), y: yc - 36 + j * 36, f1: rnd() * 6.3, f2: rnd() * 6.3, w1: .8 + rnd() * .5, w2: .8 + rnd() * .5,
                c: el("circle", { r: 13, "stroke-width": 1.5, stroke: "rgba(41,43,44,.35)" }, svg) });
    }
    var rot = el("text", { x: x1 - 10, y: yc - 86, "text-anchor": "end", "font-family": "Figtree,'Segoe UI',sans-serif", "font-weight": 800, "font-size": 26, fill: "#C2384F" }, svg);
    rot.textContent = "esta ponta também esquenta";
    return { ps: ps, chama: f, cols: cols, rot: rot };
  }, function (C, t) {
    /* aquece de 0 a 8 s, fica 1,5 s, esfria de volta em 1 s */
    var tt = t < 8 ? t : 8, apaga = t < 9.5 ? 1 : 1 - suave(t - 9.5), ponta = 0;
    tremeChama(C.chama, t);
    C.ps.forEach(function (p) {
      var x = (p.i + .5) / C.cols, T = tt <= 0 ? 0 : erfc(x / (2 * Math.sqrt(.082 * tt))) * apaga;
      if (p.i === C.cols - 1) ponta = T;
      var A = 1.2 + 6 * T, w = 2.4 + 6.5 * T;
      p.c.setAttribute("fill", cor(T));
      p.c.setAttribute("cx", fmt(p.x + A * Math.sin(w * p.w1 * t + p.f1)));
      p.c.setAttribute("cy", fmt(p.y + A * Math.cos(w * p.w2 * t + p.f2)));
    });
    C.rot.setAttribute("opacity", fmt(suave((ponta - .18) / .12)));
  }, 10.5, 8);

  /* ---------- termo-conveccao ---------- */
  anima("termo-conveccao", function (box) {
    var B = base(box), W = B.W, H = B.H, svg = B.svg, rnd = sorte(13);
    var L = 40, R = W - 40, T = 40, Bo = H - 110, cx = W / 2;
    el("path", { d: "M" + L + " " + T + " V" + (Bo - 20) + " Q" + L + " " + Bo + " " + (L + 20) + " " + Bo + " H" + (R - 20) + " Q" + R + " " + Bo + " " + R + " " + (Bo - 20) + " V" + T, fill: "#E3F0FB", stroke: "#7F7A99", "stroke-width": 8, "stroke-linejoin": "round" }, svg);
    el("rect", { x: L - 30, y: T - 12, width: 30, height: 12, rx: 6, fill: "#7F7A99" }, svg);
    el("rect", { x: R, y: T - 12, width: 30, height: 12, rx: 6, fill: "#7F7A99" }, svg);
    var fs = [chama(svg, cx - 50, H - 12, 1), chama(svg, cx, H - 8, 1.15), chama(svg, cx + 50, H - 12, 1)];
    var rx = (R - L) / 4 - 20, ry = (Bo - T) / 2 - 22, ey = (T + Bo) / 2 + 4, ps = [];
    [-1, 1].forEach(function (lado) {
      var ex = cx + lado * ((R - L) / 4);
      for (var k = 0; k < 22; k++) {
        var esc = .35 + .65 * ((k % 4) / 3 * .85 + rnd() * .15);
        ps.push({ lado: lado, ex: ex, rx: rx * esc, ry: ry * esc, f: rnd() * 6.3, c: el("circle", { r: 11, "stroke-width": 1.5, stroke: "rgba(41,43,44,.3)" }, svg) });
      }
    });
    return { ps: ps, fs: fs, ey: ey };
  }, function (C, t) {
    C.fs.forEach(function (f, i) { tremeChama(f, t + i); });
    var w = 2 * Math.PI / 12; // uma volta a cada 12 s
    C.ps.forEach(function (p) {
      /* th = 0: lado de dentro (perto do meio da panela), subindo; th = π/2: no alto, indo para fora;
         th = π: lado de fora, descendo; th = 3π/2: no fundo, voltando para o meio, onde está o fogo */
      var th = p.f + w * t, x = p.ex - p.lado * p.rx * Math.cos(th), y = C.ey - p.ry * Math.sin(th);
      var T = .5 + .5 * Math.cos(th + .1 * Math.PI);
      p.c.setAttribute("cx", fmt(x + 1.5 * Math.sin(t * 6 + p.f)));
      p.c.setAttribute("cy", fmt(y + 1.5 * Math.cos(t * 5 + p.f)));
      p.c.setAttribute("fill", cor(T));
    });
  }, 1200, 2);
  /* ---------- termo-escalas ---------- */
  anima("termo-escalas", function (box) {
    var B = base(box), W = B.W, svg = B.svg, yG = 400, yF = 120, topo = 60;
    var fonte = "Figtree,'Segoe UI',sans-serif";
    [[yF, "água fervendo"], [yG, "gelo derretendo"]].forEach(function (l) {
      el("line", { x1: 0, y1: l[0], x2: W, y2: l[0], stroke: "#9A94B5", "stroke-width": 2.5, "stroke-dasharray": "10 9" }, svg);
      var tx = el("text", { x: 0, y: l[0] - 12, "font-family": fonte, "font-weight": 700, "font-size": 22, fill: "#5E5A70" }, svg); tx.textContent = l[1];
    });
    var esc = [["Celsius", 0, 100, " °C"], ["Fahrenheit", 32, 212, " °F"], ["Kelvin", 273, 373, " K"]], ts = [];
    esc.forEach(function (e, i) {
      var x = 380 + i * 240;
      el("rect", { x: x - 22, y: topo, width: 44, height: 420 - topo, rx: 22, fill: "#fff", stroke: "#4B4760", "stroke-width": 4 }, svg);
      el("circle", { cx: x, cy: 466, r: 42, fill: "#E8590C", stroke: "#4B4760", "stroke-width": 4 }, svg);
      el("rect", { x: x - 22, y: 430, width: 44, height: 12, fill: "#E8590C" }, svg);
      var col = el("rect", { x: x - 10, width: 20, rx: 6, fill: "#E8590C" }, svg);
      [yF, yG].forEach(function (y) { el("line", { x1: x - 32, y1: y, x2: x + 32, y2: y, stroke: "#4B4760", "stroke-width": 4 }, svg); });
      var v1 = el("text", { x: x + 40, y: yF - 10, "font-family": fonte, "font-weight": 800, "font-size": 26, fill: "#3F2FA0" }, svg); v1.textContent = e[2] + e[3];
      var v0 = el("text", { x: x + 40, y: yG - 10, "font-family": fonte, "font-weight": 800, "font-size": 26, fill: "#3F2FA0" }, svg); v0.textContent = e[1] + e[3];
      var nm = el("text", { x: x, y: 545, "text-anchor": "middle", "font-family": fonte, "font-weight": 800, "font-size": 30, fill: "#292B2C" }, svg); nm.textContent = e[0];
      var g = el("g", {}, svg);
      var bal = el("rect", { x: x - 112, height: 46, width: 90, rx: 23, fill: "#FFD10C" }, g);
      var lei = el("text", { x: x - 67, "text-anchor": "middle", "font-family": fonte, "font-weight": 800, "font-size": 24, fill: "#292B2C" }, g);
      ts.push({ e: e, col: col, bal: bal, lei: lei });
    });
    return { ts: ts, yG: yG, yF: yF };
  }, function (C, t) {
    /* sobe de 0 a 100 °C e desce, com uma parada em cada ponto fixo (ciclo de 10 s) */
    var s = t % 10, f = s < 1 ? 0 : s < 5 ? suave((s - 1) / 4) : s < 6 ? 1 : 1 - suave((s - 6) / 4);
    var c5 = Math.round(f * 20) * 5; // leitura de 5 em 5 °C: as três leituras saem exatas
    C.ts.forEach(function (o, i) {
      var y = C.yG + (C.yF - C.yG) * f;
      o.col.setAttribute("y", fmt(y)); o.col.setAttribute("height", fmt(445 - y));
      var v = i === 0 ? c5 : i === 1 ? 32 + c5 * 9 / 5 : 273 + c5;
      o.bal.setAttribute("y", fmt(y - 23)); o.lei.setAttribute("y", fmt(y + 8));
      o.lei.textContent = v + o.e[3];
    });
  }, 10, 3);

  /* ---------- termo-motor ---------- */
  anima("termo-motor", function (box) {
    var B = base(box), svg = B.svg, fonte = "Figtree,'Segoe UI',sans-serif";
    /* caldeira com fogo */
    el("rect", { x: 20, y: 120, width: 190, height: 170, rx: 40, fill: "#E3F0FB", stroke: "#4B4760", "stroke-width": 5 }, svg);
    el("rect", { x: 26, y: 200, width: 178, height: 84, rx: 30, fill: "#9CCBF2" }, svg);
    var bol = [];
    for (var k = 0; k < 5; k++) bol.push({ x: 50 + k * 34, f: k / 5, c: el("circle", { r: 6, fill: "none", stroke: "#fff", "stroke-width": 3 }, svg) });
    var fs = [chama(svg, 70, 372, .95), chama(svg, 115, 376, 1.1), chama(svg, 160, 372, .95)];
    el("rect", { x: 30, y: 300, width: 170, height: 84, rx: 16, fill: "#3A3640", opacity: .12 }, svg);
    /* cano de vapor até o cilindro */
    el("path", { d: "M180 128 V80 H300 V160", fill: "none", stroke: "#B9B4CC", "stroke-width": 22, "stroke-linejoin": "round" }, svg);
    var vap = el("path", { d: "M180 128 V80 H300 V160", fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-dasharray": "4 18", "stroke-linecap": "round" }, svg);
    /* cilindro */
    el("rect", { x: 270, y: 160, width: 290, height: 120, rx: 14, fill: "#F4F2FA", stroke: "#4B4760", "stroke-width": 5 }, svg);
    var vapor = el("rect", { x: 276, y: 166, height: 108, rx: 10, fill: "#DDEBFA" }, svg);
    var pist = el("rect", { y: 168, width: 34, height: 104, rx: 8, fill: "#8E8AA0", stroke: "#4B4760", "stroke-width": 3 }, svg);
    var haste = el("line", { y1: 220, y2: 220, stroke: "#4B4760", "stroke-width": 12, "stroke-linecap": "round" }, svg);
    var biela = el("line", { stroke: "#6551D1", "stroke-width": 14, "stroke-linecap": "round" }, svg);
    /* roda (volante) */
    var cx = 790, cy = 220, R = 150;
    var roda = el("g", {}, svg);
    el("circle", { cx: 0, cy: 0, r: R, fill: "none", stroke: "#4B4760", "stroke-width": 18 }, roda);
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; el("line", { x1: 0, y1: 0, x2: fmt((R - 8) * Math.cos(a)), y2: fmt((R - 8) * Math.sin(a)), stroke: "#8E8AA0", "stroke-width": 8 }, roda); }
    el("circle", { cx: 0, cy: 0, r: 22, fill: "#4B4760" }, roda);
    var pino = el("circle", { r: 13, fill: "#FFD10C", stroke: "#4B4760", "stroke-width": 3 }, svg);
    /* escapamento: o vapor que sobra sai e é resfriado */
    el("path", { d: "M520 280 V350 H640", fill: "none", stroke: "#B9B4CC", "stroke-width": 18, "stroke-linejoin": "round" }, svg);
    var esc = el("path", { d: "M520 280 V350 H640", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-dasharray": "4 16", "stroke-linecap": "round" }, svg);
    return { fs: fs, bol: bol, vap: vap, esc: esc, vapor: vapor, pist: pist, haste: haste, biela: biela, roda: roda, pino: pino, cx: cx, cy: cy };
  }, function (C, t) {
    C.fs.forEach(function (f, i) { tremeChama(f, t + i * 1.3); });
    C.bol.forEach(function (b) { var s = (t * .45 + b.f) % 1; b.c.setAttribute("cx", fmt(b.x)); b.c.setAttribute("cy", fmt(276 - 70 * s)); b.c.setAttribute("opacity", fmt(Math.sin(Math.PI * s))); });
    C.vap.setAttribute("stroke-dashoffset", fmt(-t * 40));
    C.esc.setAttribute("stroke-dashoffset", fmt(-t * 30));
    var th = 2 * Math.PI * t / 4, r = 60, L = 250; // uma volta a cada 4 s
    var px = C.cx + r * Math.cos(th), py = C.cy + r * Math.sin(th);
    var xp = px - Math.sqrt(L * L - Math.pow(py - C.cy, 2)); // ponta da haste, sempre na linha do cilindro
    var xPist = xp - 150;
    C.pist.setAttribute("x", fmt(xPist));
    C.vapor.setAttribute("width", fmt(xPist - 276));
    C.haste.setAttribute("x1", fmt(xPist + 34)); C.haste.setAttribute("x2", fmt(xp));
    C.biela.setAttribute("x1", fmt(xp)); C.biela.setAttribute("y1", C.cy); C.biela.setAttribute("x2", fmt(px)); C.biela.setAttribute("y2", fmt(py));
    C.pino.setAttribute("cx", fmt(px)); C.pino.setAttribute("cy", fmt(py));
    C.roda.setAttribute("transform", "translate(" + C.cx + " " + C.cy + ") rotate(" + fmt(th * 180 / Math.PI) + ")");
  }, 4000, 1);
})();
