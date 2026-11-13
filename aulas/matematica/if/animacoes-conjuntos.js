/* Animações de Números e operações (Matemática, IF): Conjuntos, Conjuntos numéricos e Múltiplos e divisores.
   Regra: só rodam na tela aberta e depois do clique da figura (o motor chama roda/zera); com
   prefers-reduced-motion, mostram direto o quadro final.
   - nc-figurinhas: as 24 figurinhas do Davi se arrumam em grupos iguais (divisores) e, com 5 amigos, sobram 4.
   - nc-crivo: de 1 a 30, os múltiplos de 2, 3 e 5 vão saindo e ficam só os primos.
   - nc-reta: a reta "com lupa": √2 fica sempre preso entre 1,4 e 1,5; 1,41 e 1,42; 1,414 e 1,415…
   - nc-onibus: as saídas de dois ônibus (de 12 em 12 e de 18 em 18 min) até saírem juntos de novo, aos 36 min. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var ROXO = "#3F2FA0", COR = "#2F6BFF", FORTE = "#1E4FD8", CLARA = "#E8F0FF", CINZA = "#5E5A70", LINHA = "#C9C0F0", AMARELO = "#FFD10C", ERRO = "#C2384F";
  function parado() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) {
    var t = el("text", Object.assign({ x: x, y: y, "font-family": "Figtree,'Segoe UI',sans-serif" }, at || {}), pai);
    t.textContent = s;
    return t;
  }
  function svgDe(box) {
    box.innerHTML = "";
    var w = +box.dataset.w || box.offsetWidth || 800, h = +box.dataset.h || box.offsetHeight || 400;
    return el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, style: "overflow:visible;display:block" }, box);
  }
  /* espera t ms, mas para se a figura foi zerada */
  function relogio(box) {
    var id = (box._id = (box._id || 0) + 1), timers = [];
    return {
      vivo: function () { return box._id === id; },
      depois: function (ms, f) { timers.push(setTimeout(function () { if (box._id === id) f(); }, ms)); }
    };
  }
  function para(box) { box._id = (box._id || 0) + 1; }

  /* ---------- nc-figurinhas ---------- */
  window.QuarksAnimacoes["nc-figurinhas"] = (function () {
    var N = 24, L = 34, G = 10; // lado da figurinha e folga (o lado muda com data-l)
    function arranjo(k, W) {
      // k grupos (linhas) com o máximo de figurinhas por grupo; o que sobra vai para a direita, em vermelho
      var por = Math.floor(N / k), sobra = N - por * k, pos = [];
      var gy = L + 24, y0 = 70;
      for (var i = 0; i < N; i++) {
        var g = Math.floor(i / por);
        if (g < k) pos.push({ x: 20 + (i % por) * (L + G), y: y0 + g * gy, s: g });
        else { var j = i - por * k; pos.push({ x: W - 60 - (j % 2) * (L + G), y: y0 + Math.floor(j / 2) * (L + G), s: -1 }); }
      }
      return { pos: pos, por: por, sobra: sobra };
    }
    var CORES = ["#2F6BFF", "#6551D1", "#0F8B8D", "#E8408A", "#1F9D62", "#8C7BEA", "#FF8A3D", "#4B39B3", "#2F6BFF", "#6551D1", "#0F8B8D", "#E8408A"];
    function monta(box) {
      L = +box.dataset.l || 34; G = Math.round(L * .3);
      var svg = svgDe(box), W = +box.dataset.w || 820;
      var leg = txt(svg, 20, 34, "", { "font-size": "32", "font-weight": "800", fill: ROXO });
      var cartas = [];
      for (var i = 0; i < N; i++) {
        var g = el("g", { style: "transition:transform 1.3s cubic-bezier(.5,0,.3,1)" }, svg);
        var r = el("rect", { x: 0, y: 0, width: L, height: L + 8, rx: 7, fill: COR, stroke: "#fff", "stroke-width": "2", style: "transition:fill .8s" }, g);
        el("circle", { cx: L / 2, cy: (L + 8) / 2, r: L / 4, fill: "#fff", opacity: ".8" }, g);
        cartas.push({ g: g, r: r });
      }
      return { svg: svg, W: W, L: L, leg: leg, cartas: cartas };
    }
    function poe(e, k, modo) {
      L = e.L; G = Math.round(L * .3);
      var a = arranjo(k, e.W);
      a.pos.forEach(function (p, i) {
        e.cartas[i].g.style.transform = "translate(" + p.x + "px," + p.y + "px)";
        e.cartas[i].r.setAttribute("fill", p.s < 0 ? ERRO : CORES[p.s % CORES.length]);
      });
      e.leg.textContent = modo === "pares" ? k + " · " + a.por + " = 24" :
        k + (k === 1 ? " amigo" : " amigos") + " · " + a.por + " para cada · " + (a.sobra ? "sobram " + a.sobra : "sobra 0");
      e.leg.setAttribute("fill", a.sobra ? ERRO : ROXO);
    }
    return {
      inicia: function (box) { var e = monta(box); var s = (box.dataset.seq || "3,4,5").split(",").map(Number); poe(e, s[0], box.dataset.modo); },
      roda: function (box, direto) {
        var e = monta(box), seq = (box.dataset.seq || "3,4,5").split(",").map(Number), r = relogio(box), modo = box.dataset.modo;
        poe(e, seq[0], modo);
        if (direto || parado()) { poe(e, seq[seq.length - 1], modo); return; }
        var i = 0;
        (function passo() {
          r.depois(4200, function () { i = (i + 1) % seq.length; poe(e, seq[i], modo); passo(); });
        })();
      },
      zera: function (box) { para(box); var e = monta(box); var s = (box.dataset.seq || "3,4,5").split(",").map(Number); poe(e, s[0], box.dataset.modo); }
    };
  })();

  /* ---------- nc-crivo ---------- */
  window.QuarksAnimacoes["nc-crivo"] = (function () {
    var COL = 10, LADO = 74, ESP = 10;
    function primo(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
    function monta(box) {
      var svg = svgDe(box), cas = {};
      for (var n = 1; n <= 30; n++) {
        var i = n - 1, x = (i % COL) * (LADO + ESP), y = Math.floor(i / COL) * (LADO + ESP);
        var g = el("g", { style: "transition:opacity .7s" }, svg);
        var r = el("rect", { x: x, y: y, width: LADO, height: LADO, rx: 18, fill: "#fff", stroke: LINHA, "stroke-width": "2.5", style: "transition:fill .6s, stroke .6s" }, g);
        var t = txt(g, x + LADO / 2, y + LADO / 2 + 12, String(n), { "text-anchor": "middle", "font-size": "34", "font-weight": "800", fill: ROXO });
        cas[n] = { g: g, r: r, t: t };
      }
      var leg = txt(svg, 0, 3 * (LADO + ESP) + 46, "", { "font-size": "30", "font-weight": "800", fill: FORTE });
      return { svg: svg, cas: cas, leg: leg };
    }
    function sai(c) { c.g.style.opacity = ".16"; }
    function marca(c) { c.r.setAttribute("fill", AMARELO); c.r.setAttribute("stroke", "#E0B400"); }
    function final(e) {
      for (var n = 1; n <= 30; n++) { if (primo(n)) marca(e.cas[n]); else sai(e.cas[n]); }
      e.leg.textContent = "Sobram os primos: 2, 3, 5, 7, 11, 13, 17, 19, 23 e 29";
    }
    return {
      inicia: function (box) { monta(box); },
      roda: function (box, direto) {
        var e = monta(box), r = relogio(box);
        if (direto || parado()) { final(e); return; }
        var t = 600;
        r.depois(t, function () { sai(e.cas[1]); e.leg.textContent = "O 1 não é primo: tem um divisor só"; });
        t += 2200;
        [2, 3, 5].forEach(function (p) {
          r.depois(t, function () { marca(e.cas[p]); e.leg.textContent = p + " é primo. Saem os outros múltiplos de " + p; });
          t += 900;
          for (var m = 2 * p; m <= 30; m += p) (function (m, d) { r.depois(t + d, function () { sai(e.cas[m]); }); })(m, (m / p - 2) * 160);
          t += Math.floor(30 / p) * 160 + 1600;
        });
        r.depois(t, function () { final(e); });
      },
      zera: function (box) { para(box); monta(box); }
    };
  })();

  /* ---------- nc-reta ---------- */
  window.QuarksAnimacoes["nc-reta"] = (function () {
    var R2 = Math.SQRT2, W = 1080, X0 = 40, X1 = 1040, DY = 128;
    var niveis = [
      { a: 1, b: 2, passo: .1, casas: 1 },
      { a: 1.4, b: 1.5, passo: .01, casas: 2 },
      { a: 1.41, b: 1.42, passo: .001, casas: 3 },
      { a: 1.414, b: 1.415, passo: .0001, casas: 4 }
    ];
    function br(v, c) { return v.toFixed(c).replace(".", ","); }
    function monta(box) {
      var svg = svgDe(box), linhas = [];
      niveis.forEach(function (nv, k) {
        var y = 40 + k * DY, g = el("g", { opacity: "0", style: "transition:opacity .9s" }, svg);
        el("line", { x1: X0 - 20, y1: y, x2: X1 + 20, y2: y, stroke: LINHA, "stroke-width": "5", "stroke-linecap": "round" }, g);
        for (var i = 0; i <= 10; i++) {
          var x = X0 + i * (X1 - X0) / 10, ponta = i === 0 || i === 10;
          el("line", { x1: x, y1: y - (ponta ? 16 : 9), x2: x, y2: y + (ponta ? 16 : 9), stroke: ponta ? ROXO : "#A99BE6", "stroke-width": ponta ? "4" : "3" }, g);
          if (ponta || i === 4 || i === 5) txt(g, x, y + 44, br(nv.a + i * nv.passo, nv.casas), { "text-anchor": "middle", "font-size": ponta ? "26" : "22", "font-weight": "700", fill: ponta ? ROXO : CINZA });
        }
        var xr = X0 + (R2 - nv.a) / (nv.b - nv.a) * (X1 - X0);
        var p = el("circle", { cx: xr, cy: y, r: 13, fill: COR, stroke: "#fff", "stroke-width": "4" }, g);
        txt(g, xr, y - 24, "√2", { "text-anchor": "middle", "font-size": "28", "font-weight": "800", fill: FORTE });
        // a "lupa": do trecho que contém √2 nesta reta para a reta de baixo inteira
        var lupa = null;
        if (k < niveis.length - 1) {
          var prox = niveis[k + 1];
          var xa = X0 + (prox.a - nv.a) / (nv.b - nv.a) * (X1 - X0), xb = X0 + (prox.b - nv.a) / (nv.b - nv.a) * (X1 - X0);
          lupa = el("path", { d: "M" + xa + " " + (y + 14) + " L" + X0 + " " + (y + DY - 18) + " M" + xb + " " + (y + 14) + " L" + X1 + " " + (y + DY - 18), stroke: COR, "stroke-width": "2.5", "stroke-dasharray": "6 8", fill: "none", opacity: "0", style: "transition:opacity .9s" }, svg);
          el("rect", { x: xa, y: y - 10, width: Math.max(4, xb - xa), height: 20, rx: 6, fill: COR, opacity: ".18" }, g);
        }
        linhas.push({ g: g, p: p, lupa: lupa });
      });
      return { svg: svg, linhas: linhas };
    }
    function liga(L) { L.g.setAttribute("opacity", "1"); if (L.lupa) L.lupa.setAttribute("opacity", ".8"); }
    return {
      inicia: function (box) { var e = monta(box); e.linhas[0].g.setAttribute("opacity", "1"); },
      roda: function (box, direto) {
        var e = monta(box), r = relogio(box);
        if (direto || parado()) { e.linhas.forEach(liga); return; }
        e.linhas.forEach(function (L, k) { r.depois(300 + k * 2600, function () { liga(L); }); });
      },
      zera: function (box) { para(box); var e = monta(box); e.linhas[0].g.setAttribute("opacity", "1"); }
    };
  })();

  /* ---------- nc-onibus ---------- */
  window.QuarksAnimacoes["nc-onibus"] = (function () {
    var X0 = 190, PX = 12, FIM = 72, DUR = 9000;
    var linhas = [{ y: 90, a: 12, cor: COR, nome: "de 12 em 12" }, { y: 230, a: 18, cor: "#6551D1", nome: "de 18 em 18" }];
    function onibus(pai, cor) {
      var g = el("g", {}, pai);
      el("rect", { x: -26, y: -40, width: 52, height: 32, rx: 9, fill: cor }, g);
      el("rect", { x: -20, y: -35, width: 16, height: 11, rx: 3, fill: "#fff", opacity: ".85" }, g);
      el("rect", { x: 2, y: -35, width: 16, height: 11, rx: 3, fill: "#fff", opacity: ".85" }, g);
      el("circle", { cx: -14, cy: -8, r: 6, fill: "#292B2C" }, g);
      el("circle", { cx: 14, cy: -8, r: 6, fill: "#292B2C" }, g);
      return g;
    }
    function monta(box) {
      var svg = svgDe(box), marcas = [];
      linhas.forEach(function (L) {
        txt(svg, 0, L.y + 10, L.nome, { "font-size": "24", "font-weight": "800", fill: L.cor });
        el("line", { x1: X0 - 10, y1: L.y, x2: X0 + FIM * PX + 20, y2: L.y, stroke: LINHA, "stroke-width": "6", "stroke-linecap": "round" }, svg);
        for (var m = 0; m <= FIM; m += L.a) {
          var g = el("g", { transform: "translate(" + (X0 + m * PX) + " " + L.y + ")", opacity: "0", style: "transition:opacity .5s" }, svg);
          onibus(g, L.cor);
          txt(g, 0, 40, m + " min", { "text-anchor": "middle", "font-size": "22", "font-weight": "700", fill: CINZA });
          marcas.push({ m: m, g: g });
        }
      });
      var faixa = el("g", { opacity: "0", style: "transition:opacity .8s" }, svg);
      el("rect", { x: X0 + 36 * PX - 40, y: 20, width: 80, height: 300, rx: 24, fill: AMARELO, opacity: ".28" }, faixa);
      txt(faixa, X0 + 36 * PX, 352, "juntos de novo: 36 min", { "text-anchor": "middle", "font-size": "28", "font-weight": "800", fill: ROXO });
      var faixa2 = el("g", { opacity: "0", style: "transition:opacity .8s" }, svg);
      el("rect", { x: X0 + 72 * PX - 40, y: 20, width: 80, height: 300, rx: 24, fill: AMARELO, opacity: ".2" }, faixa2);
      txt(faixa2, X0 + 72 * PX, 352, "72 min", { "text-anchor": "middle", "font-size": "26", "font-weight": "800", fill: CINZA });
      var cursor = el("line", { x1: X0, y1: 30, x2: X0, y2: 300, stroke: ROXO, "stroke-width": "3", "stroke-dasharray": "4 8", opacity: ".7" }, svg);
      svg.insertBefore(faixa, svg.firstChild); svg.insertBefore(faixa2, svg.firstChild);
      return { svg: svg, marcas: marcas, faixa: faixa, faixa2: faixa2, cursor: cursor };
    }
    function ate(e, m) {
      e.marcas.forEach(function (k) { if (k.m <= m + 1e-6) k.g.setAttribute("opacity", "1"); });
      if (m >= 36) e.faixa.setAttribute("opacity", "1");
      if (m >= 72) e.faixa2.setAttribute("opacity", "1");
      var x = X0 + Math.min(m, FIM) * PX;
      e.cursor.setAttribute("x1", x); e.cursor.setAttribute("x2", x);
    }
    return {
      inicia: function (box) { var e = monta(box); ate(e, 0); },
      roda: function (box, direto) {
        var e = monta(box), r = relogio(box);
        if (direto || parado()) { ate(e, FIM); return; }
        var t0 = null, T36 = DUR / 2, PAUSA = 1800;
        function quadro(agora) {
          if (!r.vivo()) return;
          if (t0 === null) t0 = agora;
          var t = agora - t0;
          var m = t < T36 ? t / DUR * FIM : t < T36 + PAUSA ? 36 : (t - PAUSA) / DUR * FIM;
          ate(e, Math.min(FIM, m));
          if (m < FIM) requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      },
      zera: function (box) { para(box); var e = monta(box); ate(e, 0); }
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    ["nc-figurinhas", "nc-crivo", "nc-reta", "nc-onibus"].forEach(function (nome) {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
  });
})();
