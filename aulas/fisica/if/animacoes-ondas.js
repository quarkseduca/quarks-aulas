/* Animações do capítulo Ondas (Física, IF/Sudeste).
   Todas mostram o conteúdo: a onda que anda enquanto o ponto da corda só sobe e desce, as partículas do ar
   que se apertam e se afastam, o eco que vai e volta, o comprimento de onda que encurta ao longo do espectro.
   Regras: só rodam no slide aberto e depois do clique indicado (data-anima-passo); ciclos lentos (4 a 7 s);
   com prefers-reduced-motion, fica o desenho parado. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = "font-family:Figtree,'Segoe UI',sans-serif";

  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) {
    var t = el("text", Object.assign({ x: x, y: y }, at || {}), pai);
    t.textContent = s;
    return t;
  }
  function reduz() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function base(box) {
    box.innerHTML = "";
    var w = +box.dataset.w || box.offsetWidth || 800, h = +box.dataset.h || box.offsetHeight || 300;
    return el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, style: "display:block;overflow:visible;" + FONTE, "aria-hidden": "true" }, box);
  }

  /* Fábrica: monta(box) devolve {quadro(t)}; o laço roda a 30 quadros por segundo enquanto o slide estiver aberto. */
  function anima(monta) {
    function prepara(box) {
      box._vez = (box._vez || 0) + 1;
      box._a = monta(box);
      box._a.quadro(+box.dataset.t0 || 0);
    }
    return {
      inicia: prepara,
      zera: prepara,
      roda: function (box) {
        prepara(box);
        if (reduz()) return;
        var vez = box._vez, t0 = null, ultimo = 0, a = box._a, d0 = +box.dataset.t0 || 0;
        function quadro(agora) {
          if (box._vez !== vez) return;
          if (t0 === null) t0 = agora;
          if (agora - ultimo > 33) { ultimo = agora; a.quadro(d0 + (agora - t0) / 1000); }
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
  }

  /* ---------- Onda que anda (corda, gráficos de som) ----------
     data-curvas = JSON: [{y, a, l, cor, w, forma, ponto, x0, x1, rot}]; data-v = velocidade em px/s (igual para todas as
     curvas do mesmo meio: com a mesma velocidade, quem tem λ menor tem frequência maior). "ponto" marca um pedaço da corda,
     que só sobe e desce. Formas: seno, flauta, violao (mesma frequência, outra forma: timbre). */
  function forma(nome, th) {
    if (nome === "violao") return (Math.sin(th) + 0.55 * Math.sin(2 * th + 0.6) + 0.35 * Math.sin(3 * th + 1.1)) / 1.45;
    if (nome === "flauta") return Math.sin(th) + 0.08 * Math.sin(2 * th);
    return Math.sin(th);
  }
  window.QuarksAnimacoes["ondas-traco"] = anima(function (box) {
    var svg = base(box), w = +box.dataset.w, v = +box.dataset.v || 50;
    var curvas = JSON.parse(box.dataset.curvas || "[]").map(function (c) {
      var x0 = c.x0 || 0, x1 = c.x1 || w;
      if (c.eixo !== false) el("line", { x1: x0, y1: c.y, x2: x1, y2: c.y, stroke: "#C9C1EC", "stroke-width": 2, "stroke-dasharray": "8 8" }, svg);
      var p = el("path", { fill: "none", stroke: c.cor || "var(--d)", "stroke-width": c.w || 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
      var bola = null, guia = null;
      if (c.ponto != null) {
        guia = el("line", { x1: c.ponto, x2: c.ponto, y1: c.y - c.a - 14, y2: c.y + c.a + 14, stroke: "#FFD10C", "stroke-width": 3, "stroke-dasharray": "4 6" }, svg);
        bola = el("circle", { cx: c.ponto, cy: c.y, r: 13, fill: "#FFD10C", stroke: "#292B2C", "stroke-width": 3 }, svg);
      }
      if (c.rot) txt(svg, x0, c.y - c.a - 12, c.rot, { "font-size": 26, "font-weight": 800, fill: c.corRot || "#3F2FA0" });
      return { c: c, p: p, bola: bola, x0: x0, x1: x1 };
    });
    return {
      quadro: function (t) {
        curvas.forEach(function (k) {
          var c = k.c, d = "", passo = 4;
          for (var x = k.x0; x <= k.x1 + .1; x += passo) {
            var y = c.y - c.a * forma(c.forma, 2 * Math.PI * (x - k.x0 - v * t) / c.l);
            d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
          }
          k.p.setAttribute("d", d);
          if (k.bola) k.bola.setAttribute("cy", (c.y - c.a * forma(c.forma, 2 * Math.PI * (c.ponto - k.x0 - v * t) / c.l)).toFixed(1));
        });
      }
    };
  });

  /* ---------- A pedra no lago: a ondulação se espalha e a folha só sobe e desce ---------- */
  window.QuarksAnimacoes["ondas-lago"] = anima(function (box) {
    var svg = base(box), w = +box.dataset.w, h = +box.dataset.h;
    var meio = w / 2, nivel = h * 0.48, V = 70, L = 150, A = 24, FOLHA = meio + 330;
    var defs = el("defs", {}, svg);
    var g = el("linearGradient", { id: "ondasAgua", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: 0, "stop-color": "#BFE6E6" }, g); el("stop", { offset: 1, "stop-color": "#7CC6C7" }, g);
    var agua = el("path", { fill: "url(#ondasAgua)" }, svg);
    var linha = el("path", { fill: "none", stroke: "#0B6B6D", "stroke-width": 4, "stroke-linejoin": "round" }, svg);
    var pedra = el("ellipse", { cx: meio, cy: nivel - 120, rx: 22, ry: 16, fill: "#8E8AA0", stroke: "#5E5A70", "stroke-width": 3 }, svg);
    el("line", { x1: FOLHA, y1: nivel - 70, x2: FOLHA, y2: nivel + 50, stroke: "#FFD10C", "stroke-width": 3, "stroke-dasharray": "4 6" }, svg);
    var folha = el("g", {}, svg);
    el("path", { d: "M-34 0 Q0 -22 34 0 Q0 14 -34 0 Z", fill: "#3FA34D", stroke: "#2B7A37", "stroke-width": 3 }, folha);
    el("path", { d: "M-26 0 L28 -2", stroke: "#2B7A37", "stroke-width": 2 }, folha);
    txt(svg, FOLHA, nivel - 84, "a folha", { "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "#3F2FA0" });
    var margem = el("path", { d: "M" + (w - 60) + " " + (nivel - 10) + " Q" + (w - 20) + " " + (nivel - 40) + " " + w + " " + (nivel - 60) + " L" + w + " " + h + " L" + (w - 90) + " " + h + " Z", fill: "#C8B48A" }, svg);
    margem.setAttribute("opacity", ".9");
    var CICLO = 9; // a pedra cai de novo a cada 9 s
    function onda(x, t) {
      var r = Math.abs(x - meio), frente = V * t;
      if (t < 0 || r > frente) return 0;
      var amp = A * Math.exp(-r / 900) * Math.min(1, (frente - r) / 60);
      return amp * Math.sin(2 * Math.PI * (r - frente) / L);
    }
    return {
      quadro: function (tt) {
        var t = (tt % CICLO) - 1.0; // 1 s de queda da pedra
        pedra.setAttribute("cy", (nivel - 120 + 120 * Math.min(1, (1 + t) * (1 + t))).toFixed(1)); pedra.setAttribute("opacity", t < 0 ? 1 : 0);
        var d = "";
        for (var x = 0; x <= w - 40; x += 6) d += (d ? "L" : "M") + x + " " + (nivel - onda(x, t)).toFixed(1);
        linha.setAttribute("d", d);
        agua.setAttribute("d", d + " L" + (w - 40) + " " + h + " L0 " + h + " Z");
        folha.setAttribute("transform", "translate(" + FOLHA + " " + (nivel - 4 - onda(FOLHA, t)).toFixed(1) + ")");
      }
    };
  });

  /* ---------- O som no ar: o alto-falante empurra e puxa; as partículas só vão e voltam ----------
     Regiões mais apertadas (compressões) e menos apertadas (rarefações) andam até o ouvido. */
  window.QuarksAnimacoes["ondas-ar"] = anima(function (box) {
    var svg = base(box), w = +box.dataset.w, h = +box.dataset.h;
    var X0 = 170, X1 = w - 170, L = 260, V = 52, S = 14, linhas = 7, col = Math.floor((X1 - X0) / 18);
    var cone = el("g", {}, svg);
    el("rect", { x: 30, y: h / 2 - 60, width: 60, height: 120, rx: 10, fill: "#4B39B3" }, cone);
    var membrana = el("path", { fill: "#8C7BEA", stroke: "#3F2FA0", "stroke-width": 3 }, svg);
    var pts = [];
    for (var i = 0; i < linhas; i++) for (var j = 0; j < col; j++) {
      var x = X0 + j * 18 + (i % 2) * 9, y = h / 2 - (linhas - 1) * 22 + i * 44;
      var marcado = (i === 3 && j === Math.round(col * 0.45));
      pts.push({ x: x, el: el("circle", { cx: x, cy: y, r: marcado ? 11 : 6, fill: marcado ? "#FFD10C" : "#0F8B8D", stroke: marcado ? "#292B2C" : "none", "stroke-width": 3, opacity: marcado ? 1 : .8 }, svg) });
    }
    // ouvido (tímpano) à direita
    var ouvido = el("g", {}, svg);
    el("path", { d: "M" + (w - 10) + " " + (h / 2 - 90) + " q-60 0 -60 70 q0 40 30 50 q10 30 -10 60", fill: "none", stroke: "#C98A6B", "stroke-width": 12, "stroke-linecap": "round" }, ouvido);
    var timpano = el("line", { x1: w - 110, y1: h / 2 - 40, x2: w - 110, y2: h / 2 + 40, stroke: "#C2384F", "stroke-width": 6, "stroke-linecap": "round" }, svg);
    txt(svg, w - 120, h / 2 - 56, "tímpano", { "text-anchor": "end", "font-size": 24, "font-weight": 800, fill: "#C2384F" });
    return {
      quadro: function (t) {
        var m = 10 * Math.sin(-2 * Math.PI * V * t / L);
        membrana.setAttribute("d", "M90 " + (h / 2 - 80) + " Q" + (130 + 2 * m) + " " + (h / 2) + " 90 " + (h / 2 + 80) + " Z");
        pts.forEach(function (p) {
          p.el.setAttribute("cx", (p.x + S * Math.sin(2 * Math.PI * (p.x - X0 - V * t) / L)).toFixed(1));
        });
        timpano.setAttribute("transform", "translate(" + (5 * Math.sin(2 * Math.PI * (X1 - X0 - V * t) / L)).toFixed(1) + " 0)");
      }
    };
  });

  /* ---------- O eco: o som vai até a montanha e volta (2d), e o relógio mede a ida e a volta ----------
     data-tempo = segundos do problema (ex.: 2), mostrados num relógio em câmera lenta. */
  window.QuarksAnimacoes["ondas-eco"] = anima(function (box) {
    var svg = base(box), w = +box.dataset.w, h = +box.dataset.h;
    var T = +box.dataset.tempo || 2, LENTO = 6 / T; // a ida e volta dura 6 s na tela
    var XP = 120, XM = w - 230, chao = h - 40;
    el("line", { x1: 20, y1: chao, x2: w - 10, y2: chao, stroke: "#BFB6E6", "stroke-width": 6, "stroke-linecap": "round" }, svg);
    el("path", { d: "M" + XM + " " + chao + " L" + (XM + 90) + " " + (chao - 190) + " L" + (XM + 150) + " " + (chao - 150) + " L" + (w - 10) + " " + (chao - 170) + " L" + (w - 10) + " " + chao + " Z", fill: "#B6AFC9", stroke: "#5E5A70", "stroke-width": 3 }, svg);
    var p = el("g", { transform: "translate(" + XP + " " + chao + ")" }, svg);
    el("circle", { cx: 0, cy: -150, r: 26, fill: "#6551D1" }, p);
    el("path", { d: "M0 -122 L0 -60 M0 -60 L-24 0 M0 -60 L24 0 M0 -104 L30 -80", stroke: "#6551D1", "stroke-width": 12, "stroke-linecap": "round", fill: "none" }, p);
    var ida = el("g", {}, svg), volta = el("g", {}, svg);
    for (var i = 0; i < 3; i++) {
      el("path", { d: "M0 -50 Q22 0 0 50", transform: "translate(" + (-i * 18) + " 0)", fill: "none", stroke: "#0F8B8D", "stroke-width": 7 - i * 2, "stroke-linecap": "round", opacity: 1 - i * .3 }, ida);
      el("path", { d: "M0 -50 Q-22 0 0 50", transform: "translate(" + (i * 18) + " 0)", fill: "none", stroke: "#C2384F", "stroke-width": 7 - i * 2, "stroke-linecap": "round", opacity: 1 - i * .3 }, volta);
    }
    var yIda = chao - 175, yVolta = chao - 85;
    var rIda = txt(svg, (XP + XM) / 2, yIda - 58, "ida", { "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#0B6B6D" });
    var rVolta = txt(svg, (XP + XM) / 2, yVolta + 72, "volta", { "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#C2384F" });
    var relogio = txt(svg, w - 10, 40, "", { "text-anchor": "end", "font-size": 40, "font-weight": 800, fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
    var CICLO = 6 + 2.5;
    function num(x) { return x.toFixed(1).replace(".", ","); }
    return {
      quadro: function (tt) {
        var t = tt % CICLO, u = Math.min(t, 6) / 6, x0 = XP + 50, x1 = XM + 20;
        var rel = Math.min(t, 6) / LENTO;
        relogio.textContent = "t = " + num(rel) + " s";
        if (u < .5) {
          ida.setAttribute("transform", "translate(" + (x0 + (x1 - x0) * u * 2).toFixed(1) + " " + yIda + ")"); ida.setAttribute("opacity", 1);
          volta.setAttribute("opacity", 0);
        } else {
          ida.setAttribute("opacity", 0);
          volta.setAttribute("transform", "translate(" + (x1 - (x1 - x0) * (u - .5) * 2).toFixed(1) + " " + yVolta + ")");
          volta.setAttribute("opacity", t < 6.6 ? 1 : 0);
        }
        rIda.setAttribute("opacity", 1); rVolta.setAttribute("opacity", u >= .5 ? 1 : .25);
      }
    };
  });

  /* ---------- O espectro: em cada faixa, uma onda; todas andam com a mesma velocidade (a da luz),
     então, da esquerda para a direita, o comprimento de onda encurta e a frequência sobe (esquema fora de escala).
     data-n = número de faixas; data-gap = espaço entre elas. */
  window.QuarksAnimacoes["ondas-espectro"] = anima(function (box) {
    var svg = base(box), w = +box.dataset.w, h = +box.dataset.h, y = h / 2, A = h * 0.34;
    var n = +box.dataset.n || 7, gap = +box.dataset.gap || 0, lf = (w - gap * (n - 1)) / n, V = 22;
    var lams = [], faixas = [];
    for (var i = 0; i < n; i++) {
      lams.push(240 * Math.pow(20 / 240, i / (n - 1))); // de 240 px a 20 px
      faixas.push(el("path", { fill: "none", stroke: box.dataset.cor || "#3F2FA0", "stroke-width": 4.5, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg));
    }
    return {
      quadro: function (t) {
        faixas.forEach(function (p, i) {
          var x0 = i * (lf + gap) + 10, x1 = x0 + lf - 20, d = "";
          for (var x = x0; x <= x1; x += 1.5) d += (d ? "L" : "M") + x.toFixed(1) + " " + (y - A * Math.sin(2 * Math.PI * (x - V * t) / lams[i])).toFixed(1);
          p.setAttribute("d", d);
        });
      }
    };
  });

  document.addEventListener("DOMContentLoaded", function () {
    ["ondas-traco", "ondas-lago", "ondas-ar", "ondas-eco", "ondas-espectro"].forEach(function (n) {
      document.querySelectorAll('[data-anima="' + n + '"]').forEach(function (b) { window.QuarksAnimacoes[n].inicia(b); });
    });
  });
})();
