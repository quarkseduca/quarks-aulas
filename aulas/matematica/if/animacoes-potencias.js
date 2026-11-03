/* Animações de Potências e radicais e de Unidades de medida (Matemática, IF).
   Regra do Quarks: só se movem na tela aberta e depois que a figura aparece (data-anima-passo);
   são lentas, rodam uma vez e param no fim; com prefers-reduced-motion, mostram direto o estado final.
   - pr-dobra: a mensagem que dobra a cada rodada (2, 4, 8, 16, 32): a potência 2^n nascendo.
   - pr-virgula: a vírgula anda casa por casa e o expoente da notação científica vai sendo contado.
   - pr-soma-raiz: os 9 + 16 quadradinhos de dois quadrados (lados 3 e 4) montam um quadrado de lado 5, e não 7.
   - um-escada: a escada das unidades; a ficha desce degrau por degrau, multiplicando por 10, 100 ou 1 000.
   - um-carro: o carro a 25 m/s anda 25 m a cada segundo; em 4 s, 100 m. */
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
  /* texto com expoente: base e expoente em tspan elevado */
  function pot(pai, x, y, base, exp, at, tamExp) {
    var t = el("text", Object.assign({ x: x, y: y }, at || {}), pai);
    var a = el("tspan", {}, t); a.textContent = base;
    if (exp !== "" && exp !== undefined) {
      var b = el("tspan", { dy: "-0.55em", "font-size": tamExp || "62%" }, t); b.textContent = exp;
    }
    return t;
  }
  function reduz() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function milhar(n) {
    var s = String(n), p = s.split("."), i = p[0], r = "";
    while (i.length > 3) { r = " " + i.slice(-3) + r; i = i.slice(0, -3); }
    r = i + r;
    return p[1] ? r + "," + p[1] : r;
  }
  /* roda uma sequência de quadros: f(t) com t em segundos, até dur */
  function linhaDoTempo(box, estado, dur, f) {
    if (reduz()) { f(dur); return; }
    var t0 = null;
    function q(agora) {
      if (box._estado !== estado) return;
      if (t0 === null) t0 = agora;
      var t = Math.min(dur, (agora - t0) / 1000);
      f(t);
      if (t < dur) requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  }

  /* ---------- pr-dobra ---------- */
  window.QuarksAnimacoes["pr-dobra"] = (function () {
    var N = 5, W = 860, H = 470, PASSO = 1.3;
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 1120 " + H, width: "1120", height: H, style: "overflow:visible;" + FONTE }, box);
      var e = { svg: svg, niveis: [] };
      var ys = [];
      for (var k = 0; k <= N; k++) ys.push(30 + k * 86);
      for (k = 0; k <= N; k++) {
        var g = el("g", { opacity: k === 0 ? "1" : "0" }, svg);
        g.style.transition = "opacity .6s ease";
        var n = Math.pow(2, k), r = k < 4 ? 14 : (k === 4 ? 12 : 9);
        var fios = el("g", {}, g);
        for (var i = 0; i < n; i++) {
          var x = (i + .5) * W / n;
          if (k > 0) {
            var xp = (Math.floor(i / 2) + .5) * W / (n / 2);
            var l = el("line", { x1: xp, y1: ys[k - 1] + 10, x2: x, y2: ys[k] - r, stroke: "#B9C8F5", "stroke-width": "3", "stroke-linecap": "round" }, fios);
            var len = Math.hypot(x - xp, ys[k] - r - ys[k - 1] - 10);
            l.style.strokeDasharray = len; l.style.strokeDashoffset = len; l.style.transition = "stroke-dashoffset .9s ease-in-out";
          }
          el("circle", { cx: x, cy: ys[k], r: r, fill: k === 0 ? "#3F2FA0" : (k === N ? "#FFD10C" : "var(--d)"), stroke: k === N ? "#C9A100" : "#fff", "stroke-width": "2" }, g);
        }
        if (k > 0) {
          pot(g, 900, ys[k] + 13, "2", String(k), { "font-size": "38", "font-weight": "800", fill: "#3F2FA0" });
          txt(g, 962, ys[k] + 13, "= " + n, { "font-size": "38", "font-weight": "800", fill: k === N ? "#8A6A00" : "var(--d-forte)" });
        } else {
          txt(g, 900, ys[0] + 12, "quem envia", { "font-size": "26", "font-weight": "700", fill: "#5E5A70" });
        }
        e.niveis.push(g);
      }
      return e;
    }
    function desenha(e, t) {
      e.niveis.forEach(function (g, k) {
        if (k === 0) return;
        var vis = t >= (k - 1) * PASSO;
        g.setAttribute("opacity", vis ? "1" : "0");
        g.querySelectorAll("line").forEach(function (l) { l.style.strokeDashoffset = vis ? 0 : l.style.strokeDasharray; });
      });
    }
    return {
      inicia: function (box) { box._estado = monta(box); },
      zera: function (box) { box._estado = monta(box); },
      roda: function (box, direto) {
        var e = box._estado = monta(box);
        if (direto) { desenha(e, 99); return; }
        linhaDoTempo(box, e, (N - 1) * PASSO + .1, function (t) { desenha(e, t); });
      }
    };
  })();

  /* ---------- pr-virgula ---------- */
  window.QuarksAnimacoes["pr-virgula"] = (function () {
    var CEL = 66, PULO = .75, Y = 44; // Y: topo das casas dentro do desenho (os arcos dos pulos ficam acima)
    function monta(box) {
      box.innerHTML = "";
      var dig = box.dataset.digitos, de = +box.dataset.de, ate = +box.dataset.ate;
      var w = dig.length * CEL + 40;
      var svg = el("svg", { viewBox: "0 0 " + (w + 420) + " 170", width: w + 420, height: 170, style: "overflow:visible;" + FONTE }, box);
      var e = { svg: svg, de: de, ate: ate, casas: Math.abs(de - ate), feitos: 0 };
      for (var i = 0; i < dig.length; i++) {
        el("rect", { x: 20 + i * CEL, y: Y, width: CEL - 8, height: 80, rx: 16, fill: "#fff", stroke: "#D5DEFA", "stroke-width": "2" }, svg);
        txt(svg, 20 + i * CEL + (CEL - 8) / 2, Y + 62, dig[i], { "text-anchor": "middle", "font-size": "54", "font-weight": "800", fill: "#292B2C" });
      }
      e.trilha = el("g", {}, svg);
      e.virgula = el("g", {}, svg);
      el("circle", { cx: 0, cy: Y + 72, r: 9, fill: "#FFD10C", stroke: "#C9A100", "stroke-width": "2" }, e.virgula);
      el("path", { d: "M6 " + (Y + 76) + " Q4 " + (Y + 92) + " -6 " + (Y + 100), fill: "none", stroke: "#C9A100", "stroke-width": "6", "stroke-linecap": "round" }, e.virgula);
      var xr = w + 24;
      e.cont = txt(svg, xr, Y + 22, "", { "font-size": "32", "font-weight": "700", fill: "#5E5A70" });
      e.res = el("g", { opacity: "0" }, svg);
      e.res.style.transition = "opacity .6s";
      el("rect", { x: xr - 14, y: Y + 42, width: 330, height: 70, rx: 22, fill: "var(--d-clara)", stroke: "var(--d)", "stroke-width": "2" }, e.res);
      pot(e.res, xr + 8, Y + 92, box.dataset.base, box.dataset.exp, { "font-size": "44", "font-weight": "800", fill: "#3F2FA0" });
      e.xDe = function (p) { return 20 + p * CEL - 4; };
      return e;
    }
    function desenha(e, t) {
      var dir = e.ate < e.de ? -1 : 1;
      var feitos = Math.min(e.casas, Math.floor(t / PULO));
      var f = Math.min(1, t / PULO - feitos);
      if (feitos >= e.casas) f = 0;
      var p = e.de + dir * (feitos + f);
      var y = -Math.sin(Math.PI * f) * 34;
      e.virgula.setAttribute("transform", "translate(" + e.xDe(p) + " " + y + ")");
      while (e.feitos < feitos) {
        var j = e.feitos, x0 = e.xDe(e.de + dir * j), x1 = e.xDe(e.de + dir * (j + 1));
        el("path", { d: "M" + (x0 + dir * 4) + " " + (Y - 6) + " Q" + (x0 + x1) / 2 + " " + (Y - 34) + " " + (x1 - dir * 4) + " " + (Y - 6), fill: "none", stroke: "var(--d)", "stroke-width": "3", "stroke-dasharray": "6 6" }, e.trilha);
        txt(e.trilha, (x0 + x1) / 2, Y - 26, String(j + 1), { "text-anchor": "middle", "font-size": "22", "font-weight": "800", fill: "var(--d-forte)" });
        e.feitos++;
      }
      e.cont.textContent = feitos === 0 ? "" : feitos + (feitos === 1 ? " casa para a " : " casas para a ") + (dir < 0 ? "esquerda" : "direita");
      e.res.setAttribute("opacity", feitos >= e.casas ? "1" : "0");
    }
    return {
      inicia: function (box) { var e = box._estado = monta(box); desenha(e, 0); },
      zera: function (box) { var e = box._estado = monta(box); desenha(e, 0); },
      roda: function (box, direto) {
        var e = box._estado = monta(box);
        if (direto) { desenha(e, 999); return; }
        linhaDoTempo(box, e, e.casas * PULO + .2, function (t) { desenha(e, t); });
      }
    };
  })();

  /* ---------- pr-soma-raiz ---------- */
  window.QuarksAnimacoes["pr-soma-raiz"] = (function () {
    var L = 46;
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 1060 360", width: "1060", height: "360", style: "overflow:visible;" + FONTE }, box);
      var e = { svg: svg, cel: [] };
      // destino: quadrado 5 x 5 em (760, 60); o 3 x 3 fica no canto e as 16 do 4 x 4 completam o L
      var livres = [];
      for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if (r >= 3 || c >= 3) livres.push([r, c]);
      var k = 0;
      // contorno dos dois quadrados de origem (ficam marcados depois que os quadradinhos saem)
      el("rect", { x: 16, y: 126, width: 3 * L + 4, height: 3 * L + 4, rx: 12, fill: "none", stroke: "#B9C8F5", "stroke-width": "3", "stroke-dasharray": "8 7" }, svg);
      el("rect", { x: 236, y: 80, width: 4 * L + 4, height: 4 * L + 4, rx: 12, fill: "none", stroke: "#E8D27A", "stroke-width": "3", "stroke-dasharray": "8 7" }, svg);
      function cel(x, y, cor, borda, alvo) {
        var q = el("rect", { x: 0, y: 0, width: L - 4, height: L - 4, rx: 8, fill: cor, stroke: borda, "stroke-width": "2" }, svg);
        q.style.transition = "transform 2.4s ease-in-out";
        q._ini = [x, y]; q._fim = alvo;
        q.style.transform = "translate(" + x + "px," + y + "px)";
        e.cel.push(q);
      }
      for (r = 0; r < 3; r++) for (c = 0; c < 3; c++) cel(20 + c * L, 130 + r * L, "var(--d)", "#fff", [760 + c * L, 60 + r * L]);
      for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) { var d = livres[k++]; cel(240 + c * L, 84 + r * L, "#FFD10C", "#C9A100", [760 + d[1] * L, 60 + d[0] * L]); }
      txt(svg, 20 + 1.5 * L, 120, "9", { "text-anchor": "middle", "font-size": "34", "font-weight": "800", fill: "var(--d-forte)" });
      txt(svg, 240 + 2 * L, 74, "16", { "text-anchor": "middle", "font-size": "34", "font-weight": "800", fill: "#8A6A00" });
      txt(svg, 20 + 1.5 * L, 300, "lado 3", { "text-anchor": "middle", "font-size": "28", "font-weight": "700", fill: "#5E5A70" });
      txt(svg, 240 + 2 * L, 300, "lado 4", { "text-anchor": "middle", "font-size": "28", "font-weight": "700", fill: "#5E5A70" });
      txt(svg, 180, 210, "+", { "text-anchor": "middle", "font-size": "48", "font-weight": "800", fill: "#3F2FA0" });
      el("path", { d: "M470 200 H690", stroke: "var(--d)", "stroke-width": "6", "stroke-linecap": "round" }, svg);
      el("path", { d: "M672 186 L692 200 L672 214", fill: "none", stroke: "var(--d)", "stroke-width": "6", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
      e.fim = el("g", { opacity: "0" }, svg);
      e.fim.style.transition = "opacity .8s";
      txt(e.fim, 760 + 2.5 * L - 2, 40, "25", { "text-anchor": "middle", "font-size": "34", "font-weight": "800", fill: "#3F2FA0" });
      txt(e.fim, 760 + 2.5 * L - 2, 326, "lado 5", { "text-anchor": "middle", "font-size": "30", "font-weight": "800", fill: "#3F2FA0" });
      return e;
    }
    function fim(e) {
      e.cel.forEach(function (q) { q.style.transform = "translate(" + q._fim[0] + "px," + q._fim[1] + "px)"; });
    }
    return {
      inicia: function (box) { box._estado = monta(box); },
      zera: function (box) { box._estado = monta(box); },
      roda: function (box, direto) {
        var e = box._estado = monta(box);
        if (direto || reduz()) { e.cel.forEach(function (q) { q.style.transition = "none"; }); fim(e); e.fim.setAttribute("opacity", "1"); return; }
        setTimeout(function () { if (box._estado !== e) return; e.cel.forEach(function (q, i) { q.style.transitionDelay = (i % 9) * .06 + "s"; }); fim(e); }, 700);
        setTimeout(function () { if (box._estado === e) e.fim.setAttribute("opacity", "1"); }, 3700);
      }
    };
  })();

  /* ---------- um-escada ---------- */
  window.QuarksAnimacoes["um-escada"] = (function () {
    var PW = 156, PH = 46, PULO = 1.2;
    function monta(box) {
      box.innerHTML = "";
      var un = box.dataset.unid.split("|"), ex = box.dataset.exp || "", f = +box.dataset.fator;
      var de = +box.dataset.de, ate = +box.dataset.ate, v0 = +box.dataset.valor;
      var svg = el("svg", { viewBox: "0 0 " + (un.length * PW + 20) + " " + (un.length * PH + 150), width: un.length * PW + 20, height: un.length * PH + 150, style: "overflow:visible;" + FONTE }, box);
      var e = { svg: svg, de: de, ate: ate, f: f, v0: v0, un: un, ex: ex, setas: [] };
      for (var i = 0; i < un.length; i++) {
        var x = i * PW, y = 60 + i * PH, base = i === +box.dataset.base;
        el("rect", { x: x, y: y, width: PW - 6, height: 66, rx: 18, fill: base ? "var(--d)" : "#fff", stroke: base ? "var(--d)" : "#C9D5F8", "stroke-width": "3" }, svg);
        txt(svg, x + (PW - 6) / 2, y + 46, un[i] + ex, { "text-anchor": "middle", "font-size": "36", "font-weight": "800", fill: base ? "#fff" : "#3F2FA0" });
        if (i < un.length - 1) {
          var g = el("g", { opacity: ".35" }, svg);
          g.style.transition = "opacity .5s";
          el("path", { d: "M" + (x + PW - 30) + " " + (y + 78) + " q 18 22 40 22", fill: "none", stroke: "var(--d)", "stroke-width": "4", "stroke-linecap": "round" }, g);
          el("path", { d: "M" + (x + PW + 2) + " " + (y + 92) + " l 10 8 -12 6", fill: "none", stroke: "var(--d)", "stroke-width": "4", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
          txt(g, x + PW - 34, y + 122, "×" + milhar(f), { "text-anchor": "end", "font-size": "26", "font-weight": "800", fill: "var(--d-forte)" });
          e.setas.push(g);
        }
      }
      e.ficha = el("g", {}, svg);
      el("circle", { cx: 0, cy: 0, r: 17, fill: "#FFD10C", stroke: "#C9A100", "stroke-width": "3" }, e.ficha);
      e.valor = el("text", { x: 0, y: un.length * PH + 136, "font-size": "40", "font-weight": "800", fill: "#3F2FA0" }, svg);
      e.pos = function (p) { return [p * PW + (PW - 6) / 2, 60 + p * PH - 22]; };
      return e;
    }
    function rotulo(e, k) {
      var v = e.v0;
      e.valor.innerHTML = "";
      for (var j = 0; j <= k; j++) {
        var t = el("tspan", { fill: j === k ? "#3F2FA0" : "#5E5A70" }, e.valor);
        t.textContent = (j ? "  =  " : "") + milhar(Math.round(v * 1e6) / 1e6) + " " + e.un[e.de + j] + e.ex;
        v *= e.f;
      }
    }
    function desenha(e, t) {
      var n = e.ate - e.de, feitos = Math.min(n, Math.floor(t / PULO)), fr = Math.min(1, t / PULO - feitos);
      if (feitos >= n) fr = 0;
      var a = e.pos(e.de + feitos), b = e.pos(e.de + feitos + 1);
      var x = a[0] + (b[0] - a[0]) * fr, y = a[1] + (b[1] - a[1]) * fr - Math.sin(Math.PI * fr) * 40;
      e.ficha.setAttribute("transform", "translate(" + x + " " + y + ")");
      e.setas.forEach(function (g, i) { g.setAttribute("opacity", i >= e.de && i < e.de + feitos ? "1" : ".3"); });
      rotulo(e, feitos);
    }
    return {
      inicia: function (box) { var e = box._estado = monta(box); desenha(e, 0); },
      zera: function (box) { var e = box._estado = monta(box); desenha(e, 0); },
      roda: function (box, direto) {
        var e = box._estado = monta(box);
        if (direto) { desenha(e, 999); return; }
        linhaDoTempo(box, e, (e.ate - e.de) * PULO + .3, function (t) { desenha(e, t); });
      }
    };
  })();

  /* ---------- um-carro ---------- */
  window.QuarksAnimacoes["um-carro"] = (function () {
    var X0 = 40, PX = 10, DUR = 4, LENTO = 1.5; // 1 s de estrada = 1,5 s na tela
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 1120 250", width: "1120", height: "250", style: "overflow:visible;" + FONTE }, box);
      var e = { svg: svg, feitas: 0 };
      el("rect", { x: 0, y: 120, width: 1120, height: 60, rx: 30, fill: "#E9EEFC" }, svg);
      el("line", { x1: 20, y1: 150, x2: 1100, y2: 150, stroke: "#fff", "stroke-width": "6", "stroke-dasharray": "34 26" }, svg);
      e.marcas = el("g", {}, svg);
      e.relogio = txt(svg, 1110, 40, "t = 0 s", { "text-anchor": "end", "font-size": "40", "font-weight": "800", fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
      var c = e.carro = el("g", {}, svg);
      el("rect", { x: -96, y: -52, width: 96, height: 34, rx: 14, fill: "var(--d)" }, c);
      el("path", { d: "M-78 -52 Q-70 -76 -48 -76 L-34 -76 Q-18 -76 -12 -52 Z", fill: "var(--d)" }, c);
      el("path", { d: "M-68 -54 Q-63 -70 -50 -70 L-44 -70 L-44 -54 Z M-38 -54 L-38 -70 L-34 -70 Q-24 -70 -20 -54 Z", fill: "#fff", opacity: ".85" }, c);
      el("circle", { cx: -74, cy: -16, r: 12, fill: "#292B2C" }, c);
      el("circle", { cx: -22, cy: -16, r: 12, fill: "#292B2C" }, c);
      return e;
    }
    function marca(e, s) {
      var x = X0 + 25 * s * PX;
      el("line", { x1: x, y1: 112, x2: x, y2: 188, stroke: "var(--d)", "stroke-width": "4", "stroke-linecap": "round" }, e.marcas);
      txt(e.marcas, x, 222, s + " s", { "text-anchor": "middle", "font-size": "26", "font-weight": "700", fill: "#5E5A70" });
      txt(e.marcas, x, 248, 25 * s + " m", { "text-anchor": "middle", "font-size": "26", "font-weight": "800", fill: s === DUR ? "#8A6A00" : "var(--d-forte)" });
    }
    function desenha(e, t) {
      while (e.feitas <= Math.floor(t + 1e-6) && e.feitas <= DUR) { marca(e, e.feitas); e.feitas++; }
      e.relogio.textContent = "t = " + Math.floor(t + 1e-6) + " s";
      e.carro.setAttribute("transform", "translate(" + (X0 + 25 * t * PX + 6) + " 146)");
    }
    return {
      inicia: function (box) { var e = box._estado = monta(box); desenha(e, 0); },
      zera: function (box) { var e = box._estado = monta(box); desenha(e, 0); },
      roda: function (box, direto) {
        var e = box._estado = monta(box);
        if (direto || reduz()) { desenha(e, DUR); return; }
        var t0 = null;
        function q(agora) {
          if (box._estado !== e) return;
          if (t0 === null) t0 = agora;
          var t = Math.min(DUR, (agora - t0) / 1000 / LENTO);
          desenha(e, t);
          if (t < DUR) requestAnimationFrame(q);
        }
        requestAnimationFrame(q);
      }
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    ["pr-dobra", "pr-virgula", "pr-soma-raiz", "um-escada", "um-carro"].forEach(function (n) {
      document.querySelectorAll('[data-anima="' + n + '"]').forEach(function (b) { window.QuarksAnimacoes[n].inicia(b); });
    });
  });
})();
