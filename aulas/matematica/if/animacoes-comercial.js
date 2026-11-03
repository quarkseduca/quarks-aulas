/* Animações de Matemática comercial (Matemática, IF/Sudeste): razão e proporção, porcentagem e juros simples.
   Cada uma mostra o conteúdo: o retângulo v·t que muda de forma e não muda de área, as duas obras do muro,
   as notas que se nivelam na média e a dívida que sobe o mesmo valor todo mês.
   Só rodam na tela aberta (o motor chama roda quando a figura aparece e zera quando sai) e respeitam prefers-reduced-motion. */
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
  function virgula(n, casas) { return n.toFixed(casas).replace(".", ","); }
  function suave(u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

  /* Laço de quadros que para sozinho quando a figura é zerada (box._id muda) */
  function laco(box, f) {
    var id = box._id = (box._id || 0) + 1, t0 = null;
    function q(agora) {
      if (box._id !== id) return;
      if (t0 === null) t0 = agora;
      if (f((agora - t0) / 1000) !== false) requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  }

  /* ---------- 1. Inversamente proporcionais: v · t = 120 ----------
     O ponto anda pela curva; o retângulo de lados v e t muda de forma, mas a área (a distância) é sempre 120. */
  window.QuarksAnimacoes["com-inversa"] = (function () {
    var W = 760, H = 470, X0 = 90, Y0 = 400, KX = 4.6, KY = 78; // 1 km/h = 4,6 px; 1 h = 78 px
    function px(v) { return X0 + v * KX; }
    function py(t) { return Y0 - t * KY; }
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "overflow:visible;" + FONTE }, box);
      var ret = el("rect", { x: X0, y: py(2), width: 60 * KX, height: 2 * KY, fill: "var(--d-clara)", stroke: "var(--d)", "stroke-width": 3, rx: 4 }, svg);
      // eixos
      el("path", { d: "M" + X0 + " " + (Y0 + 2) + " V20 M" + (X0 - 2) + " " + Y0 + " H" + (W - 20), stroke: "#9C93C4", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, svg);
      el("path", { d: "M" + (X0 - 10) + " 34 L" + X0 + " 16 L" + (X0 + 10) + " 34 M" + (W - 36) + " " + (Y0 - 10) + " L" + (W - 18) + " " + Y0 + " L" + (W - 36) + " " + (Y0 + 10), stroke: "#9C93C4", "stroke-width": 4, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
      txt(svg, X0 - 20, 30, "t (h)", { "text-anchor": "end", "font-size": 26, "font-weight": 800, fill: "#5E5A70" });
      txt(svg, W - 10, Y0 + 74, "v (km/h)", { "text-anchor": "end", "font-size": 26, "font-weight": 800, fill: "#5E5A70" });
      [30, 60, 120].forEach(function (v) {
        el("line", { x1: px(v), y1: Y0 - 8, x2: px(v), y2: Y0 + 8, stroke: "#9C93C4", "stroke-width": 3 }, svg);
        txt(svg, px(v), Y0 + 38, String(v), { "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#5E5A70" });
      });
      [1, 2, 4].forEach(function (t) {
        el("line", { x1: X0 - 8, y1: py(t), x2: X0 + 8, y2: py(t), stroke: "#9C93C4", "stroke-width": 3 }, svg);
        txt(svg, X0 - 18, py(t) + 9, String(t), { "text-anchor": "end", "font-size": 26, "font-weight": 700, fill: "#5E5A70" });
      });
      // curva v · t = 120
      var d = "";
      for (var v = 26; v <= 136; v += 2) d += (d ? " L" : "M") + px(v).toFixed(1) + " " + py(120 / v).toFixed(1);
      el("path", { d: d, fill: "none", stroke: "var(--d-forte)", "stroke-width": 5, "stroke-linecap": "round" }, svg);
      // pontos da tabela
      [[30, 4], [60, 2], [120, 1]].forEach(function (p) { el("circle", { cx: px(p[0]), cy: py(p[1]), r: 9, fill: "#fff", stroke: "var(--d-forte)", "stroke-width": 4 }, svg); });
      var bola = el("circle", { cx: px(60), cy: py(2), r: 13, fill: "#FFD10C", stroke: "#fff", "stroke-width": 4 }, svg);
      var rotulo = txt(svg, X0 + 20, py(2) + 46, "", { "font-size": 30, "font-weight": 800, fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
      var area = txt(svg, W - 20, 70, "", { "text-anchor": "end", "font-size": 30, "font-weight": 800, fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
      return { ret: ret, bola: bola, rotulo: rotulo, area: area };
    }
    function desenha(e, v, andando) {
      var t = 120 / v;
      e.ret.setAttribute("width", (v * KX).toFixed(1));
      e.ret.setAttribute("y", py(t).toFixed(1));
      e.ret.setAttribute("height", (t * KY).toFixed(1));
      e.bola.setAttribute("cx", px(v).toFixed(1));
      e.bola.setAttribute("cy", py(t).toFixed(1));
      e.rotulo.setAttribute("y", Math.min(Y0 - 16, py(t) + 44).toFixed(1));
      e.rotulo.textContent = "área = v · t = 120";
      e.rotulo.setAttribute("opacity", v >= 55 ? 1 : 0);
      e.area.textContent = andando ? "v · t = 120 km" : v + " km/h · " + t + " h = 120 km";
    }
    return {
      inicia: function (box) { box._e = monta(box); desenha(box._e, 60); },
      roda: function (box, direto) {
        var e = box._e = monta(box);
        desenha(e, 60);
        if (direto || reduz()) return;
        // passeia pelos pontos da tabela: para em cada um (os números aparecem) e anda devagar até o próximo
        var paradas = [60, 120, 30, 60], PARA = 2.6, ANDA = 3.2, CICLO = 3 * (PARA + ANDA);
        laco(box, function (s) {
          var c = s % CICLO, k = Math.floor(c / (PARA + ANDA)), r = c - k * (PARA + ANDA);
          var a = paradas[k], b = paradas[k + 1];
          if (r < PARA) { desenha(e, a); return; }
          var u = suave((r - PARA) / ANDA);
          desenha(e, a * Math.pow(b / a, u), true);
        });
      },
      zera: function (box) { box._id = (box._id || 0) + 1; box._e = monta(box); desenha(box._e, 60); }
    };
  })();

  /* ---------- 2. Regra de três inversa: o muro ----------
     Em cima, 6 pedreiros; embaixo, 4. O muro sobe um pouco por dia; o de 6 termina no dia 10, o de 4 no dia 15. */
  window.QuarksAnimacoes["com-obra"] = (function () {
    var W = 800, H = 440, XM = 300, LM = 440, HM = 120;
    var equipes = [{ n: 6, dias: 10, y: 40 }, { n: 4, dias: 15, y: 250 }];
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "overflow:visible;" + FONTE }, box);
      var dia = txt(svg, W, 26, "dia 0", { "text-anchor": "end", "font-size": 34, "font-weight": 800, fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
      var linhas = equipes.map(function (q) {
        var g = el("g", {}, svg);
        // pedreiros (cabeça e corpo), em fila
        var col = q.n > 4 ? 3 : 2;
        for (var i = 0; i < q.n; i++) {
          var cx = 26 + (i % col) * 66 + (col === 2 ? 33 : 0), cy = q.y + 30 + Math.floor(i / col) * 82;
          var p = el("g", { class: "com-pedreiro" }, g);
          el("path", { d: "M" + (cx - 22) + " " + (cy + 66) + " Q" + cx + " " + (cy + 18) + " " + (cx + 22) + " " + (cy + 66) + " Z", fill: "var(--d)" }, p);
          el("circle", { cx: cx, cy: cy + 14, r: 15, fill: "#F2C9A0" }, p);
          el("path", { d: "M" + (cx - 17) + " " + (cy + 8) + " Q" + cx + " " + (cy - 14) + " " + (cx + 17) + " " + (cy + 8) + " Z", fill: "#FFD10C" }, p);
        }
        txt(g, 92, q.y + 214, q.n + " pedreiros", { "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: "var(--d-forte)" });
        // contorno do muro e tijolos que vão subindo
        el("rect", { x: XM, y: q.y + 60, width: LM, height: HM, rx: 10, fill: "#fff", stroke: "#C9C0F0", "stroke-width": 3, "stroke-dasharray": "10 8" }, g);
        var clip = "com-clip-" + q.n + "-" + Math.random().toString(36).slice(2, 7);
        var cp = el("clipPath", { id: clip }, g);
        var janela = el("rect", { x: XM, y: q.y + 60 + HM, width: LM, height: 0 }, cp);
        var tij = el("g", { "clip-path": "url(#" + clip + ")" }, g);
        for (var r = 0; r < 4; r++) for (var c = -1; c < 8; c++) {
          var x = XM + c * 60 + (r % 2 ? 30 : 0);
          el("rect", { x: x + 2, y: q.y + 60 + r * 30 + 2, width: 56, height: 26, rx: 5, fill: "#E8806A" }, tij);
        }
        var fim = txt(g, XM + LM / 2, q.y + 222, "", { "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#3F2FA0" });
        return { q: q, janela: janela, fim: fim };
      });
      return { dia: dia, linhas: linhas };
    }
    function desenha(e, d) {
      e.dia.textContent = "dia " + Math.floor(d + 1e-6);
      e.linhas.forEach(function (L) {
        var f = Math.min(1, d / L.q.dias);
        L.janela.setAttribute("y", (L.q.y + 60 + HM * (1 - f)).toFixed(1));
        L.janela.setAttribute("height", (HM * f).toFixed(1));
        L.fim.textContent = f >= 1 ? "pronto em " + L.q.dias + " dias" : "";
      });
    }
    return {
      inicia: function (box) { box._e = monta(box); desenha(box._e, 0); },
      roda: function (box, direto) {
        var e = box._e = monta(box);
        if (direto || reduz()) { desenha(e, 15); return; }
        desenha(e, 0);
        laco(box, function (s) {
          var d = Math.min(15, Math.max(0, s - .6) / .55); // um dia a cada 0,55 s
          desenha(e, d);
          return d < 15;
        });
      },
      zera: function (box) { box._id = (box._id || 0) + 1; box._e = monta(box); desenha(box._e, 0); }
    };
  })();

  /* ---------- 3. Média aritmética: as notas se nivelam ----------
     As barras 6, 7, 8 e 9 trocam pontos até ficarem todas na mesma altura: 7,5. O total, 30, não muda. */
  window.QuarksAnimacoes["com-media"] = (function () {
    var W = 760, H = 470, X0 = 80, Y0 = 400, K = 34, LB = 110, ESP = 160;
    function monta(box) {
      box.innerHTML = "";
      var vals = (box.dataset.valores || "6,7,8,9").split(",").map(Number);
      var media = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "overflow:visible;" + FONTE }, box);
      el("line", { x1: X0 - 20, y1: Y0, x2: W - 10, y2: Y0, stroke: "#9C93C4", "stroke-width": 4, "stroke-linecap": "round" }, svg);
      for (var g = 2; g <= 10; g += 2) {
        el("line", { x1: X0 - 20, y1: Y0 - g * K, x2: W - 10, y2: Y0 - g * K, stroke: "#E4DEFB", "stroke-width": 2 }, svg);
        txt(svg, X0 - 30, Y0 - g * K + 9, String(g), { "text-anchor": "end", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
      }
      var linha = el("g", { opacity: 0 }, svg);
      el("line", { x1: X0 - 20, y1: Y0 - media * K, x2: W - 10, y2: Y0 - media * K, stroke: "#FFD10C", "stroke-width": 5, "stroke-dasharray": "14 10" }, linha);
      txt(linha, W - 10, Y0 - media * K - 64, "média " + virgula(media, media % 1 ? 1 : 0), { "text-anchor": "end", "font-size": 28, "font-weight": 800, fill: "#8A6A00" });
      var barras = vals.map(function (v, i) {
        var x = X0 + 20 + i * ESP;
        var r = el("rect", { x: x, y: Y0 - v * K, width: LB, height: v * K, rx: 14, fill: "var(--d)" }, svg);
        var t = txt(svg, x + LB / 2, Y0 - v * K - 14, String(v), { "text-anchor": "middle", "font-size": 32, "font-weight": 800, fill: "#3F2FA0" });
        txt(svg, x + LB / 2, Y0 + 40, (i + 1) + "ª", { "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#5E5A70" });
        return { v: v, r: r, t: t };
      });
      return { vals: vals, media: media, barras: barras, linha: linha };
    }
    function desenha(e, u) {
      e.barras.forEach(function (b) {
        var h = b.v + (e.media - b.v) * u;
        b.r.setAttribute("y", (Y0 - h * K).toFixed(1));
        b.r.setAttribute("height", (h * K).toFixed(1));
        b.t.setAttribute("y", (Y0 - h * K - 14).toFixed(1));
        b.t.textContent = u >= 1 ? virgula(e.media, e.media % 1 ? 1 : 0) : (u <= 0 ? String(b.v) : virgula(h, 1));
      });
      e.linha.setAttribute("opacity", Math.min(1, u * 1.4).toFixed(2));
    }
    return {
      inicia: function (box) { box._e = monta(box); desenha(box._e, 0); },
      roda: function (box, direto) {
        var e = box._e = monta(box);
        if (direto || reduz()) { desenha(e, 1); return; }
        desenha(e, 0);
        laco(box, function (s) {
          var u = Math.min(1, Math.max(0, s - 1) / 4); // espera 1 s e nivela em 4 s
          desenha(e, suave(u));
          return u < 1;
        });
      },
      zera: function (box) { box._id = (box._id || 0) + 1; box._e = monta(box); desenha(box._e, 0); }
    };
  })();

  /* ---------- 4. Juros simples: a dívida de Lúcia, mês a mês ----------
     Sobre os R$ 2 000 (roxo), cada mês empilha os mesmos R$ 60 de juros (amarelo). As pontas formam uma reta. */
  window.QuarksAnimacoes["com-juros"] = (function () {
    var W = 860, H = 500, X0 = 120, Y0 = 430, ESP = 124, LB = 84, BASE = 1900, K = .8; // 1 real = 0,8 px acima de 1 900
    function y(val) { return Y0 - (val - BASE) * K; }
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "overflow:visible;" + FONTE }, box);
      el("line", { x1: X0 - 30, y1: Y0, x2: W, y2: Y0, stroke: "#9C93C4", "stroke-width": 4, "stroke-linecap": "round" }, svg);
      [2000, 2100, 2200, 2300].forEach(function (v) {
        el("line", { x1: X0 - 30, y1: y(v), x2: W, y2: y(v), stroke: "#E4DEFB", "stroke-width": 2 }, svg);
        txt(svg, X0 - 40, y(v) + 9, v === 2000 ? "2 000" : "2 " + String(v).slice(1), { "text-anchor": "end", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
      });
      // corte no eixo (o eixo não começa em zero)
      el("path", { d: "M" + (X0 - 44) + " " + (Y0 - 30) + " l16 -10 M" + (X0 - 44) + " " + (Y0 - 20) + " l16 -10", stroke: "#9C93C4", "stroke-width": 3 }, svg);
      var reta = el("path", { d: "", fill: "none", stroke: "#3F2FA0", "stroke-width": 4, "stroke-dasharray": "10 8" }, svg);
      var meses = [];
      for (var m = 0; m <= 5; m++) {
        var x = X0 + m * ESP, g = el("g", {}, svg);
        el("rect", { x: x, y: y(2000), width: LB, height: Y0 - y(2000), rx: 8, fill: "var(--d)" }, g);
        var j = el("rect", { x: x, y: y(2000), width: LB, height: 0, fill: "#FFD10C" }, g);
        var faixas = el("g", {}, g);
        for (var k = 1; k <= m; k++) el("line", { x1: x + 6, y1: y(2000 + 60 * k), x2: x + LB - 6, y2: y(2000 + 60 * k), stroke: "#fff", "stroke-width": 2, opacity: 0 }, faixas);
        var valor = txt(g, x + LB / 2, y(2000) - 14, "2 000", { "text-anchor": "middle", "font-size": 24, "font-weight": 800, fill: "#3F2FA0", opacity: 0, style: "font-variant-numeric:tabular-nums" });
        txt(g, x + LB / 2, Y0 + 38, "mês " + m, { "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
        var mais = txt(g, x + LB / 2, y(2000 + 60 * m) + 32, "+60", { "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#4B258D", opacity: 0 });
        meses.push({ m: m, x: x, j: j, faixas: faixas, valor: valor, mais: mais, g: g });
      }
      return { meses: meses, reta: reta };
    }
    function desenha(e, s) { // s = meses já passados (0 a 5, contínuo)
      var d = "";
      e.meses.forEach(function (M) {
        var vis = M.m === 0 || s >= M.m - 1;
        M.g.setAttribute("opacity", vis ? 1 : .15);
        var jur = M.m === 0 || !vis ? 0 : 60 * (M.m - 1) + 60 * Math.max(0, Math.min(1, s - (M.m - 1)));
        M.j.setAttribute("y", y(2000 + jur).toFixed(1));
        M.j.setAttribute("height", (jur * K).toFixed(1));
        Array.prototype.forEach.call(M.faixas.children, function (l, k) { l.setAttribute("opacity", vis && jur >= 60 * (k + 1) - .5 ? .9 : 0); });
        M.valor.setAttribute("y", (y(2000 + jur) - 14).toFixed(1));
        M.valor.textContent = String(Math.round(2000 + jur)).replace(/^(\d)(\d{3})$/, "$1 $2");
        M.valor.setAttribute("opacity", vis ? 1 : 0);
        if (M.m > 0) M.mais.setAttribute("opacity", s >= M.m - .001 ? 1 : 0);
        if (vis) d += (d ? " L" : "M") + (M.x + LB / 2) + " " + y(2000 + jur).toFixed(1);
      });
      e.reta.setAttribute("d", s >= 5 - .001 ? d : "");
    }
    return {
      inicia: function (box) { box._e = monta(box); desenha(box._e, 0); },
      roda: function (box, direto) {
        var e = box._e = monta(box);
        if (direto || reduz()) { desenha(e, 5); return; }
        desenha(e, 0);
        laco(box, function (t) {
          var s = Math.min(5, Math.max(0, t - .8) / 1.2); // um mês a cada 1,2 s
          desenha(e, s);
          return s < 5;
        });
      },
      zera: function (box) { box._id = (box._id || 0) + 1; box._e = monta(box); desenha(box._e, 0); }
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    ["com-inversa", "com-obra", "com-media", "com-juros"].forEach(function (n) {
      document.querySelectorAll('[data-anima="' + n + '"]').forEach(function (b) { window.QuarksAnimacoes[n].inicia(b); });
    });
  });
})();
