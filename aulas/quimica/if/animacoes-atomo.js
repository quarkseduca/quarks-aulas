/* Animações de Estrutura atômica (Química, IF): Modelos atômicos e Número atômico e de massa.
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo); respeitam prefers-reduced-motion.
   - rearranjo: Dalton. 2 H2 + O2 → 2 H2O; os mesmos átomos trocam de parceiro (nada se cria, nada se perde).
   - catodicos: tubo de Crookes. Os elétrons saem do cátodo (−) e acendem a mancha luminosa; com as placas ligadas
     (marcador [data-placas] visível na tela), o feixe curva para a placa positiva.
   - lamina-ouro: experimento de Rutherford. A maioria das partículas alfa atravessa reto, algumas desviam e poucas voltam;
     cada chegada acende um ponto na tela fluorescente.
   - zoom-ouro: dentro da folha de ouro. Núcleos minúsculos e positivos no meio de muito espaço vazio: a alfa que passa longe
     segue reto, a que passa perto é repelida e desvia, a que vem de frente volta.
   - espiral: o problema do modelo de Rutherford. O elétron perderia energia e cairia no núcleo.
   - bohr-salto: o elétron recebe energia, salta para uma camada mais externa e, ao voltar, libera a energia como luz.
   - atomo: núcleo (prótons e nêutrons vibrando) e elétrons girando nas camadas; data-acao="perde" ou "ganha" mostra
     o elétron saindo (cátion) ou chegando (ânion). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) { var t = el("text", Object.assign({ x: x, y: y }, at || {}), pai); t.textContent = s; return t; }
  function parado() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function suave(f) { f = Math.max(0, Math.min(1, f)); return f * f * (3 - 2 * f); }
  function lin(a, b, f) { return a + (b - a) * f; }
  function svgBase(box, W, H) {
    box.innerHTML = "";
    var s = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true", style: "display:block;overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
    return s;
  }
  /* laço de animação: chama desenha(t) a 30 quadros por segundo até zerar ou trocar de tela */
  function laco(box, desenha, fim) {
    box._vez = (box._vez || 0) + 1;
    var vez = box._vez, t0 = null, ultimo = 0;
    if (parado()) { desenha(fim === undefined ? 0 : fim); return; }
    function quadro(agora) {
      if (box._vez !== vez) return;
      if (t0 === null) t0 = agora;
      if (agora - ultimo > 33) { ultimo = agora; desenha((agora - t0) / 1000); }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }
  function para(box) { box._vez = (box._vez || 0) + 1; }
  /* um pacote de onda (energia ou luz) de P na direção (dx, dy) */
  function onda(x, y, dx, dy, L, A, lam) {
    var px = -dy, py = dx, d = "";
    for (var s = 0; s <= L; s += 4) {
      var o = A * Math.sin(2 * Math.PI * s / lam) * Math.sin(Math.PI * s / L);
      d += (s ? "L" : "M") + (x + dx * s + px * o).toFixed(1) + " " + (y + dy * s + py * o).toFixed(1);
    }
    return d;
  }
  function eletron(pai, r) {
    var g = el("g", {}, pai);
    el("circle", { r: r, fill: "#3F2FA0", stroke: "#fff", "stroke-width": 2.5 }, g);
    el("path", { d: "M" + (-r * .5) + " 0H" + (r * .5), stroke: "#fff", "stroke-width": Math.max(2, r * .28), "stroke-linecap": "round" }, g);
    return g;
  }
  function nucleo(pai, x, y, r, sinal) {
    var g = el("g", { transform: "translate(" + x + " " + y + ")" }, pai);
    el("circle", { r: r, fill: "#FFD10C", stroke: "#B88A00", "stroke-width": 2 }, g);
    if (sinal) txt(g, 0, r * .36, "+", { "text-anchor": "middle", "font-size": r * 1.1, "font-weight": 800, fill: "#8A6A00" });
    return g;
  }
  function anima(nome, obj) { window.QuarksAnimacoes[nome] = obj; }

  /* ---------------- rearranjo (Dalton) ---------------- */
  anima("rearranjo", (function () {
    var H = 24, O = 34;
    var ANTES = [[95, 80], [139, 80], [95, 190], [139, 190], [290, 135], [352, 135]];
    var DEPOIS = [[658, 112], [742, 112], [828, 202], [912, 202], [700, 80], [870, 170]];
    function monta(box) {
      var s = svgBase(box, 1000, 270);
      el("path", { d: "M450 135H540M522 117l22 18-22 18", fill: "none", stroke: "#6551D1", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, s);
      var at = [];
      for (var i = 0; i < 6; i++) {
        var o = i >= 4, g = el("g", {}, s);
        el("circle", { r: o ? O : H, fill: o ? "url(#gO)" : "#fff", stroke: o ? "#3F2FA0" : "#292B2C", "stroke-width": 2.5 }, g);
        txt(g, 0, o ? 11 : 9, o ? "O" : "H", { "text-anchor": "middle", "font-size": o ? 30 : 24, "font-weight": 800, fill: o ? "#fff" : "#292B2C" });
        at.push(g);
      }
      // oxigênios por baixo dos hidrogênios
      s.insertBefore(at[4], at[0]); s.insertBefore(at[5], at[0]);
      box._e = { s: s, at: at };
      desenha(box, 0);
    }
    function desenha(box, t) {
      var e = box._e, c = t % 8, f, op = 1;
      if (c < 2) f = 0; else if (c < 4) f = suave((c - 2) / 2); else f = 1;
      if (c > 6.6 && c < 7.2) op = 1 - (c - 6.6) / .6;
      if (c >= 7.2) { f = 0; op = (c - 7.2) / .8; }
      e.at.forEach(function (g, i) {
        var a = ANTES[i], b = DEPOIS[i], arco = Math.sin(Math.PI * f) * (i % 2 ? -40 : 40) * (i >= 4 ? .5 : 1);
        var x = lin(a[0], b[0], f) + 1.4 * Math.sin(t * 3.7 + i * 1.9), y = lin(a[1], b[1], f) + arco + 1.4 * Math.cos(t * 3.1 + i * 2.3);
        g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
        g.setAttribute("opacity", op.toFixed(2));
      });
    }
    return {
      inicia: monta, zera: function (b) { para(b); monta(b); },
      roda: function (b) { if (!b._e) monta(b); laco(b, function (t) { desenha(b, t); }, 4); }
    };
  })());

  /* ---------------- catodicos (Crookes e Thomson) ---------------- */
  anima("catodicos", (function () {
    var X0 = 150, X1 = 560, X2 = 780, XT = 955, Y0 = 190, V = 430, K = 60 / 127600;
    function yDe(x, f) {
      if (x < X1) return Y0;
      if (x < X2) return Y0 - f * K * (x - X1) * (x - X1);
      var D = X2 - X1; return Y0 - f * K * (D * D + 2 * D * (x - X2));
    }
    function monta(box) {
      var s = svgBase(box, 1040, 400);
      el("path", { d: "M470 280v56h-30v40h90v-40h-30v-56", fill: "#F1EEFD", stroke: "#BFB6E6", "stroke-width": 4 }, s);
      txt(s, 485, 396, "bomba de vácuo", { "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
      el("rect", { x: 20, y: 100, width: 1000, height: 180, rx: 90, fill: "#F7F5FE", stroke: "#BFB6E6", "stroke-width": 5 }, s);
      txt(s, 290, 160, "gás rarefeito", { "font-size": 24, "font-weight": 700, fill: "#9A95AD" });
      el("rect", { x: 70, y: 140, width: 22, height: 100, rx: 6, fill: "#3F2FA0" }, s);
      txt(s, 81, 76, "cátodo (−)", { "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: "#3F2FA0" });
      el("path", { d: "M200 112V178M200 202V268", stroke: "#C63C28", "stroke-width": 12, "stroke-linecap": "round" }, s);
      txt(s, 200, 318, "ânodo (+)", { "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: "#C63C28" });
      var placas = el("g", { opacity: 0 }, s);
      el("rect", { x: X1, y: 112, width: X2 - X1, height: 14, rx: 6, fill: "#C63C28" }, placas);
      txt(placas, (X1 + X2) / 2, 98, "placa +", { "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "#C63C28" });
      el("rect", { x: X1, y: 254, width: X2 - X1, height: 14, rx: 6, fill: "#3F2FA0" }, placas);
      txt(placas, (X1 + X2) / 2, 318, "placa −", { "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "#3F2FA0" });
      var raio = el("path", { fill: "none", stroke: "#FFD10C", "stroke-width": 16, "stroke-opacity": .45, "stroke-linecap": "round" }, s);
      var mancha = el("ellipse", { cx: XT + 18, cy: Y0, rx: 14, ry: 26, fill: "#B6F07A", opacity: 0 }, s);
      txt(s, 1000, 340, "mancha luminosa", { "text-anchor": "end", "font-size": 24, "font-weight": 700, fill: "#4E8A1E" });
      var bolas = el("g", {}, s);
      var raiz = box.closest(".slide") || document;
      box._e = { placas: placas, raio: raio, mancha: mancha, bolas: bolas, marca: raiz.querySelector("[data-placas]"), f: 0, tAnt: 0 };
      desenha(box, 0, true);
    }
    function desenha(box, t, estatico) {
      var e = box._e, liga = e.marca && e.marca.classList.contains("mostra");
      var dt = Math.max(0, t - e.tAnt); e.tAnt = t;
      e.f = estatico ? (liga ? 1 : 0) : Math.max(0, Math.min(1, e.f + (liga ? 1 : -1) * dt / .8));
      e.placas.setAttribute("opacity", liga ? 1 : 0);
      var vis = estatico && t === 0 && !box._rodando ? 0 : 1;
      var d = "";
      for (var x = X0; x <= XT; x += 10) d += (x === X0 ? "M" : "L") + x + " " + yDe(x, e.f).toFixed(1);
      e.raio.setAttribute("d", d); e.raio.setAttribute("opacity", vis);
      e.mancha.setAttribute("cy", yDe(XT, e.f).toFixed(1)); e.mancha.setAttribute("opacity", vis ? .85 : 0);
      var h = "";
      if (vis) for (var i = 0; i < 18; i++) {
        var xx = X0 + ((t * V + i * (XT - X0) / 18) % (XT - X0));
        h += '<circle cx="' + xx.toFixed(1) + '" cy="' + (yDe(xx, e.f) + ((i * 7) % 5 - 2) * 1.5).toFixed(1) + '" r="6" fill="#3F2FA0" stroke="#fff" stroke-width="1.5"/>';
      }
      e.bolas.innerHTML = h;
    }
    return {
      inicia: function (b) { b._rodando = false; monta(b); },
      zera: function (b) { para(b); b._rodando = false; monta(b); },
      roda: function (b) {
        b._rodando = true; if (!b._e) monta(b);
        if (parado()) { desenha(b, 1, true); return; }
        laco(b, function (t) { desenha(b, t); });
      }
    };
  })());

  /* ---------------- lamina-ouro (Rutherford: o aparelho) ---------------- */
  anima("lamina-ouro", (function () {
    var FONTE = { x: 250, y: 235 }, FOLHA = 800, TELA = { cx: 940, cy: 235, rx: 700, ry: 210 };
    var VEL = 760, INTERVALO = 0.13, N = 64, DESVIOS = {};
    [[5, 24], [11, -38], [17, 61], [23, -18], [30, 47], [37, -72], [44, 30], [52, -55], [58, 21]].forEach(function (d) { DESVIOS[d[0]] = d[1]; });
    DESVIOS[14] = -152; DESVIOS[41] = -140; // as que voltam (para cima e para a esquerda, longe da câmera)
    function sorteio(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
    function batida(y0, ang) {
      var a = ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
      var px = (FOLHA - TELA.cx) / TELA.rx, py = (y0 - TELA.cy) / TELA.ry, qx = dx / TELA.rx, qy = dy / TELA.ry;
      var A = qx * qx + qy * qy, B = 2 * (px * qx + py * qy), C = px * px + py * py - 1;
      var t = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
      return { x: FOLHA + t * dx, y: y0 + t * dy, t: t };
    }
    function lista() {
      var l = [];
      for (var i = 0; i < N; i++) {
        var y0 = FONTE.y + (sorteio(i) - .5) * 24, ang = DESVIOS[i] !== undefined ? DESVIOS[i] : (sorteio(i + 99) - .5) * 4;
        var b = batida(y0, ang), t1 = (FOLHA - FONTE.x) / VEL;
        l.push({ ini: i * INTERVALO, y0: y0, b: b, t1: t1, t2: t1 + b.t / VEL, grande: Math.abs(ang) > 10 });
      }
      return l;
    }
    function monta(box) {
      var s = svgBase(box, 1760, 460), d = "";
      for (var g = 205; g <= 515; g += 4) {
        var a = g * Math.PI / 180;
        d += (g === 205 ? "M" : "L") + (TELA.cx + TELA.rx * Math.cos(a)).toFixed(1) + " " + (TELA.cy + TELA.ry * Math.sin(a)).toFixed(1);
      }
      el("path", { d: d, fill: "none", stroke: "#DCD6F3", "stroke-width": 18, "stroke-linecap": "round" }, s);
      txt(s, 1720, 14, "tela fluorescente", { "text-anchor": "end", "font-size": 28, "font-weight": 700, fill: "#5E5A70" });
      el("rect", { x: 40, y: 165, width: 210, height: 140, rx: 22, fill: "#9C98A8", stroke: "#5E5A70", "stroke-width": 4 }, s);
      el("rect", { x: 150, y: 226, width: 104, height: 18, fill: "#F7F5FE" }, s);
      el("circle", { cx: 128, cy: 235, r: 26, fill: "#FFD10C", stroke: "#8A6A00", "stroke-width": 3 }, s);
      txt(s, 128, 243, "Po", { "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#5A4500" });
      txt(s, 145, 345, "bloco de chumbo", { "text-anchor": "middle", "font-size": 27, "font-weight": 800, fill: "#3F2FA0" });
      txt(s, 145, 378, "com polônio, que emite α", { "text-anchor": "middle", "font-size": 23, "font-weight": 600, fill: "#5E5A70" });
      el("rect", { x: FOLHA - 7, y: 120, width: 14, height: 230, rx: 5, fill: "#E7B437", stroke: "#8A6A00", "stroke-width": 2 }, s);
      txt(s, FOLHA, 100, "folha de ouro finíssima", { "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: "#8A6A00" });
      box._e = { pontos: el("g", {}, s), rastros: el("g", {}, s), bolas: el("g", {}, s), lista: lista(), feitas: {} };
    }
    function acende(e, p, i) {
      if (e.feitas[i]) return;
      e.feitas[i] = true;
      var r = p.grande ? 11 : 7;
      el("circle", { cx: p.b.x.toFixed(1), cy: p.b.y.toFixed(1), r: r + 10, fill: "#FFD10C", opacity: ".28" }, e.pontos);
      el("circle", { cx: p.b.x.toFixed(1), cy: p.b.y.toFixed(1), r: r, fill: "#FFD10C", stroke: "#B88A00", "stroke-width": "1.5" }, e.pontos);
      if (p.grande) el("path", { d: "M" + FONTE.x + " " + p.y0.toFixed(1) + "L" + FOLHA + " " + p.y0.toFixed(1) + "L" + p.b.x.toFixed(1) + " " + p.b.y.toFixed(1), fill: "none", stroke: "#6551D1", "stroke-width": 3, "stroke-opacity": ".45", "stroke-dasharray": "8 8" }, e.rastros);
    }
    function pos(p, t) {
      var s = t - p.ini;
      if (s < 0 || s > p.t2) return null;
      if (s < p.t1) return [FONTE.x + s * VEL, p.y0];
      var f = (s - p.t1) / (p.t2 - p.t1);
      return [FOLHA + (p.b.x - FOLHA) * f, p.y0 + (p.b.y - p.y0) * f];
    }
    function desenha(e, t) {
      var h = "";
      e.lista.forEach(function (p, i) {
        var q = pos(p, t);
        if (q) h += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="8" fill="#6551D1" stroke="#fff" stroke-width="2.5"/>';
        else if (t - p.ini > p.t2) acende(e, p, i);
      });
      e.bolas.innerHTML = h;
    }
    function fim(e) { var u = e.lista[e.lista.length - 1]; return u.ini + u.t2 + .05; }
    return {
      inicia: monta, zera: function (b) { para(b); monta(b); },
      roda: function (b, direto) {
        monta(b); var e = b._e;
        if (direto || parado()) { desenha(e, fim(e)); return; }
        laco(b, function (t) { desenha(e, Math.min(t, fim(e))); if (t > fim(e)) para(b); });
      }
    };
  })());

  /* ---------------- zoom-ouro (dentro da folha) ---------------- */
  anima("zoom-ouro", (function () {
    var W = 980, H = 460, V = 240, KC = 60000;
    var NUC = [[430, 85], [430, 230], [430, 375], [570, 157], [570, 302]];
    // altura de entrada e instante (s): quase todas passam longe dos núcleos; 150, 88 e 299 passam perto e desviam; 229.95 vem de frente e volta
    var ENTRADAS = [[30, 0], [150, .5], [340, 1.0], [195, 1.5], [229.95, 2.0], [120, 2.6], [410, 3.1], [265, 3.6], [88, 4.2], [60, 4.7], [440, 5.2], [299, 5.7], [10, 6.2]];
    var CICLO = 11.5;
    function trajeto(y0) {
      var x = -20, y = y0, vx = V, vy = 0, dt = 1 / 600, pts = [[x, y]];
      for (var k = 0; k < 600 * 7; k++) {
        var ax = 0, ay = 0;
        NUC.forEach(function (n) {
          var dx = x - n[0], dy = y - n[1], r2 = dx * dx + dy * dy + 4, r = Math.sqrt(r2), a = KC / r2;
          ax += a * dx / r; ay += a * dy / r;
        });
        vx += ax * dt; vy += ay * dt; x += vx * dt; y += vy * dt;
        if (k % 20 === 19) pts.push([x, y]); // um ponto a cada 1/30 s
        if (x < -40 || x > W + 40 || y < -40 || y > H + 40) break;
      }
      return pts;
    }
    function monta(box) {
      var s = svgBase(box, W, H);
      s.style.overflow = "hidden";
      var nuvens = el("g", {}, s);
      NUC.forEach(function (n) {
        el("circle", { cx: n[0], cy: n[1], r: 68, fill: "#FFF8DC", "fill-opacity": .55, stroke: "#E7C766", "stroke-width": 2, "stroke-dasharray": "6 8" }, nuvens);
      });
      var rastros = el("g", {}, s);
      NUC.forEach(function (n) { nucleo(s, n[0], n[1], 7, false); });
      el("path", { d: "M437 222 L486 196", stroke: "#8A6A00", "stroke-width": 2 }, s);
      txt(s, 490, 196, "núcleo (+)", { "font-size": 24, "font-weight": 800, fill: "#8A6A00" });
      txt(s, 640, 450, "eletrosfera: quase vazia", { "font-size": 24, "font-weight": 800, fill: "#B88A00" });
      txt(s, 10, 450, "partículas α (+) →", { "font-size": 24, "font-weight": 800, fill: "#5340B8" });
      box._e = { rastros: rastros, bolas: el("g", {}, s), tr: ENTRADAS.map(function (p) { return { pts: trajeto(p[0]), ini: p[1] }; }) };
    }
    function desenha(box, t) {
      var e = box._e, c = t % CICLO, h = "", r = "";
      e.tr.forEach(function (p) {
        var i = Math.floor((c - p.ini) * 30);
        if (i < 0) return;
        var pts = p.pts, j = Math.min(i, pts.length - 1), d = "";
        for (var k = 0; k <= j; k += 2) d += (k ? "L" : "M") + pts[k][0].toFixed(0) + " " + pts[k][1].toFixed(0);
        r += '<path d="' + d + '" fill="none" stroke="#6551D1" stroke-width="3" stroke-opacity=".3" stroke-dasharray="6 7"/>';
        if (i < pts.length - 1) h += '<circle cx="' + pts[j][0].toFixed(1) + '" cy="' + pts[j][1].toFixed(1) + '" r="8" fill="#6551D1" stroke="#fff" stroke-width="2.5"/>';
      });
      var op = c > CICLO - .6 ? (CICLO - c) / .6 : 1;
      e.rastros.innerHTML = r; e.rastros.setAttribute("opacity", op.toFixed(2));
      e.bolas.innerHTML = h;
    }
    return {
      inicia: monta, zera: function (b) { para(b); monta(b); },
      roda: function (b) { if (!b._e) monta(b); laco(b, function (t) { desenha(b, t); }, CICLO - .7); }
    };
  })());

  /* ---------------- espiral (o problema do modelo de Rutherford) ---------------- */
  anima("espiral", (function () {
    var C = 230, R0 = 170, CICLO = 7;
    function monta(box) {
      var s = svgBase(box, 460, 460);
      el("circle", { cx: C, cy: C, r: R0, fill: "none", stroke: "#BFB6E6", "stroke-width": 3, "stroke-dasharray": "8 9" }, s);
      var rastro = el("path", { fill: "none", stroke: "#E5533D", "stroke-width": 3, "stroke-opacity": .55 }, s);
      var luz = el("g", {}, s);
      var flash = el("circle", { cx: C, cy: C, r: 20, fill: "#FFD10C", opacity: 0 }, s);
      nucleo(s, C, C, 22, true);
      var e = eletron(s, 14);
      box._e = { rastro: rastro, luz: luz, flash: flash, e: e };
      desenha(box, 0);
    }
    function ponto(f) { var r = R0 * Math.pow(1 - f, .7) + 22 * f, a = -Math.PI / 2 + 2 * Math.PI * (2.2 * f + 1.6 * f * f); return [C + r * Math.cos(a), C + r * Math.sin(a), a]; }
    function desenha(box, t) {
      var o = box._e, c = t % CICLO, f = c < .8 ? 0 : Math.min(1, (c - .8) / 4), p = ponto(f), d = "", l = "";
      for (var k = 0; k <= 60; k++) { var q = ponto(f * k / 60); d += (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }
      o.rastro.setAttribute("d", f > 0 ? d : "");
      if (f > 0 && f < 1) for (var m = 1; m <= 3; m++) {
        var fm = Math.max(0, f - m * .07), q2 = ponto(fm), dx = Math.cos(q2[2]), dy = Math.sin(q2[2]), sai = ((c * 2 + m * .33) % 1) * 30;
        l += '<path d="' + onda(q2[0] + dx * (18 + sai), q2[1] + dy * (18 + sai), dx, dy, 30, 6, 12) + '" fill="none" stroke="#E5A800" stroke-width="3" stroke-linecap="round" opacity="' + (1 - sai / 30).toFixed(2) + '"/>';
      }
      o.luz.innerHTML = l;
      o.e.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
      o.e.setAttribute("opacity", c > 4.8 ? 0 : 1);
      var fl = c > 4.8 && c < 5.6 ? 1 - (c - 4.8) / .8 : 0;
      o.flash.setAttribute("opacity", (fl * .8).toFixed(2)); o.flash.setAttribute("r", (22 + (1 - fl) * 40).toFixed(1));
    }
    return {
      inicia: monta, zera: function (b) { para(b); monta(b); },
      roda: function (b) { if (!b._e) monta(b); laco(b, function (t) { desenha(b, t); }, 4); }
    };
  })());

  /* ---------------- bohr-salto (o elétron muda de camada) ---------------- */
  anima("bohr-salto", (function () {
    var W = 700, H = 480, C = [260, 250], RS = [70, 115, 160, 205], CICLO = 9;
    var FASES = ["estado fundamental", "recebe energia", "salta para fora", "estado excitado", "volta", "libera luz (fóton)"];
    function monta(box) {
      var s = svgBase(box, W, H), cor = box.dataset.cor || "#E5533D";
      ["K", "L", "M", "N"].forEach(function (l, i) {
        el("circle", { cx: C[0], cy: C[1], r: RS[i], fill: "none", stroke: "#BFB6E6", "stroke-width": 3, "stroke-dasharray": "8 9" }, s);
        txt(s, C[0] + RS[i] * .72 + 6, C[1] - RS[i] * .72 - 4, l, { "font-size": 28, "font-weight": 800, fill: "#5340B8" });
      });
      nucleo(s, C[0], C[1], 24, true);
      var energia = el("path", { fill: "none", stroke: "#FFB000", "stroke-width": 5, "stroke-linecap": "round" }, s);
      var foton = el("path", { fill: "none", stroke: cor, "stroke-width": 5, "stroke-linecap": "round" }, s);
      var brilho = el("circle", { r: 26, fill: "#FFD10C", opacity: 0 }, s);
      var e = eletron(s, 15);
      var rot = txt(s, W - 10, 40, "", { "text-anchor": "end", "font-size": 30, "font-weight": 800, fill: "#3F2FA0" });
      box._e = { energia: energia, foton: foton, brilho: brilho, e: e, rot: rot };
      desenha(box, 0);
    }
    function ang(t) { return -2.4 + t * 2 * Math.PI / 18; }
    function lugar(t) {
      var c = t % CICLO, r;
      if (c < 2.2) r = RS[0]; else if (c < 2.8) r = lin(RS[0], RS[2], suave((c - 2.2) / .6));
      else if (c < 5) r = RS[2]; else if (c < 5.6) r = lin(RS[2], RS[0], suave((c - 5) / .6)); else r = RS[0];
      var a = ang(t);
      return [C[0] + r * Math.cos(a), C[1] + r * Math.sin(a), a];
    }
    function desenha(box, t) {
      var o = box._e, c = t % CICLO, p = lugar(t), fase = 0;
      o.e.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
      // energia chega do lado esquerdo até o elétron (1,0 s a 2,2 s)
      if (c > 1 && c < 2.2) {
        var alvo = lugar(t - c + 2.2), f = (c - 1) / 1.2, L = 110, dist = 150 * (1 - f);
        o.energia.setAttribute("d", onda(alvo[0] - dist - L, alvo[1], 1, 0, L, 12, 30)); o.energia.setAttribute("opacity", 1); fase = 1;
      } else o.energia.setAttribute("opacity", 0);
      if (c >= 2.2 && c < 2.8) fase = 2; else if (c >= 2.8 && c < 5) fase = 3; else if (c >= 5 && c < 5.6) fase = 4;
      o.brilho.setAttribute("opacity", fase === 3 ? (.25 + .1 * Math.sin(c * 4)).toFixed(2) : 0);
      o.brilho.setAttribute("cx", p[0].toFixed(1)); o.brilho.setAttribute("cy", p[1].toFixed(1));
      // fóton sai do elétron para fora (5,6 s a 7,6 s)
      if (c >= 5.6 && c < 7.6) {
        var q = lugar(t - c + 5.6), g = (c - 5.6) / 2, dx = Math.cos(q[2] + .5), dy = Math.sin(q[2] + .5);
        o.foton.setAttribute("d", onda(q[0] + dx * (20 + 170 * g), q[1] + dy * (20 + 170 * g), dx, dy, 120, 12, 30));
        o.foton.setAttribute("opacity", (1 - g * .7).toFixed(2)); fase = 5;
      } else o.foton.setAttribute("opacity", 0);
      o.rot.textContent = FASES[fase];
    }
    return {
      inicia: monta, zera: function (b) { para(b); monta(b); },
      roda: function (b) { if (!b._e) monta(b); laco(b, function (t) { desenha(b, t); }, 3.5); }
    };
  })());

  /* ---------------- atomo (núcleo + camadas; íons) ---------------- */
  anima("atomo", (function () {
    function monta(box) {
      var d = box.dataset, W = +d.w || 500, H = +d.h || 500, cx = +(d.cx || W / 2), cy = +(d.cy || H / 2);
      var p = +(d.p || 0), n = +(d.n || 0), N = p + n, rn = +(d.rn || 11), re = +(d.re || 11);
      var cam = (d.camadas || "").split(",").filter(Boolean).map(Number), r0 = +(d.r0 || 80), dr = +(d.dr || 52);
      var letras = d.letras ? d.letras.split(",") : null;
      var s = svgBase(box, W, H);
      var R = cam.map(function (_, i) { return r0 + i * dr; });
      R.forEach(function (r, i) {
        el("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: "#BFB6E6", "stroke-width": 3, "stroke-dasharray": "7 9" }, s);
        if (letras) txt(s, cx + r * .7 + 4, cy - r * .7 - 2, letras[i], { "font-size": 24, "font-weight": 800, fill: "#5340B8" });
      });
      var nuc = [], gN = el("g", {}, s);
      for (var i = N - 1; i >= 0; i--) {
        var rr = rn * 1.02 * Math.sqrt(i + .3), a = i * 2.39996, eP = Math.floor((i + 1) * p / N) > Math.floor(i * p / N);
        var g = el("g", {}, gN);
        el("circle", { r: rn, fill: eP ? "#FFD10C" : "#C9C0F0", stroke: eP ? "#B88A00" : "#8C7BEA", "stroke-width": 2 }, g);
        if (eP && rn >= 9) txt(g, 0, rn * .38, "+", { "text-anchor": "middle", "font-size": rn * 1.15, "font-weight": 800, fill: "#8A6A00" });
        nuc.push({ g: g, x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a), f: i * 1.7 });
      }
      var els = [];
      cam.forEach(function (q, k) {
        for (var j = 0; j < q; j++) els.push({ g: eletron(s, re), k: k, a0: -Math.PI / 2 + 2 * Math.PI * j / q + k * .6, w: 2 * Math.PI / (20 + 4 * k), ult: k === cam.length - 1 && j === q - 1 });
      });
      box._e = { cx: cx, cy: cy, R: R, nuc: nuc, els: els, acao: d.acao || "", voo: +(d.voo || 240) };
      desenha(box, 0, 0);
    }
    function desenha(box, t, fAcao, tIni) {
      var o = box._e;
      if (tIni === undefined) tIni = 1.2;
      o.nuc.forEach(function (q) {
        q.g.setAttribute("transform", "translate(" + (q.x + 1.4 * Math.sin(t * 5.3 + q.f)).toFixed(1) + " " + (q.y + 1.4 * Math.cos(t * 4.7 + q.f * 1.3)).toFixed(1) + ")");
      });
      o.els.forEach(function (e) {
        var r = o.R[e.k], op = 1, a = e.a0 + e.w * t;
        // o elétron que sai para no lugar de onde saiu; o que chega espera parado e depois passa a girar
        if (e.ult && o.acao === "perde") a = e.a0 + e.w * Math.min(t, tIni);
        if (e.ult && o.acao === "ganha") a = e.a0 + e.w * Math.max(t, tIni + 2.4);
        if (e.ult && o.acao === "perde") { r += o.voo * suave(fAcao); op = 1 - .85 * suave(fAcao); }
        if (e.ult && o.acao === "ganha") { r += o.voo * (1 - suave(fAcao)); op = .15 + .85 * suave(fAcao); }
        e.g.setAttribute("transform", "translate(" + (o.cx + r * Math.cos(a)).toFixed(1) + " " + (o.cy + r * Math.sin(a)).toFixed(1) + ")");
        e.g.setAttribute("opacity", op.toFixed(2));
      });
    }
    return {
      inicia: monta, zera: function (b) { para(b); monta(b); },
      roda: function (b, direto) {
        if (!b._e) monta(b);
        var ini = direto ? -10 : 0;
        laco(b, function (t) { desenha(b, t, Math.max(0, Math.min(1, (t - ini - 1.2) / 2.4)), ini + 1.2); }, 12);
      }
    };
  })());

  document.addEventListener("DOMContentLoaded", function () {
    ["rearranjo", "catodicos", "lamina-ouro", "zoom-ouro", "espiral", "bohr-salto", "atomo"].forEach(function (nome) {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
  });
})();
