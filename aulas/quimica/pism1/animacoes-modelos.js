/* Animações de Modelos atômicos (Química, PISM I). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

/* Experimento da folha de ouro: partículas alfa saem da fonte, a maioria atravessa a folha em linha reta,
   algumas desviam bastante e pouquíssimas voltam. Cada chegada acende um ponto na tela fluorescente. */
window.QuarksAnimacoes["folha-de-ouro"] = (function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = { x: 250, y: 280 }, FOLHA = 800;
  var TELA = { cx: 940, cy: 270, rx: 700, ry: 240 };
  var VEL = 760, INTERVALO = 0.13, N = 64; // px/s, s entre partículas
  // Trajetórias fixas (iguais em toda gravação): 0 = passa reto; ângulo em graus = desvio.
  var DESVIOS = {};
  [[5, 24], [11, -38], [17, 61], [23, -18], [30, 47], [37, -72], [44, 30], [52, -55], [58, 21]].forEach(function (d) { DESVIOS[d[0]] = d[1]; });
  DESVIOS[14] = -152; DESVIOS[41] = -138; // as que voltam (para cima e para a esquerda, longe da câmera)

  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) { var t = el("text", Object.assign({ x: x, y: y }, at || {}), pai); t.textContent = s; return t; }
  function sorteio(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

  function batida(y0, ang) {
    var a = ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
    var px = (FOLHA - TELA.cx) / TELA.rx, py = (y0 - TELA.cy) / TELA.ry, qx = dx / TELA.rx, qy = dy / TELA.ry;
    var A = qx * qx + qy * qy, B = 2 * (px * qx + py * qy), C = px * px + py * py - 1;
    var t = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
    return { x: FOLHA + t * dx, y: y0 + t * dy, t: t };
  }

  function particulas() {
    var lista = [];
    for (var i = 0; i < N; i++) {
      var y0 = FONTE.y + (sorteio(i) - .5) * 26;
      var ang = DESVIOS[i] !== undefined ? DESVIOS[i] : (sorteio(i + 99) - .5) * 4;
      var b = batida(y0, ang);
      var t1 = (FOLHA - FONTE.x - 40) / VEL;
      lista.push({ ini: i * INTERVALO, y0: y0, b: b, t1: t1, t2: t1 + b.t / VEL, grande: Math.abs(ang) > 10 });
    }
    return lista;
  }

  function monta(box) {
    box.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 1760 560", width: "1760", height: "560", style: "overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
    // tela fluorescente: elipse aberta do lado da fonte
    var d = "", ini = 200, fim = 520;
    for (var g = ini; g <= fim; g += 4) {
      var a = g * Math.PI / 180;
      d += (g === ini ? "M" : "L") + (TELA.cx + TELA.rx * Math.cos(a)).toFixed(1) + " " + (TELA.cy + TELA.ry * Math.sin(a)).toFixed(1);
    }
    el("path", { d: d, fill: "none", stroke: "#DCD6F3", "stroke-width": "18", "stroke-linecap": "round" }, svg);
    txt(svg, 1720, 20, "tela fluorescente", { "text-anchor": "end", "font-size": "28", "font-weight": "700", fill: "#5E5A70" });
    // fonte
    el("rect", { x: 40, y: 200, width: 170, height: 160, rx: 26, fill: "#F1EEFD", stroke: "#3F2FA0", "stroke-width": "4" }, svg);
    el("circle", { cx: 125, cy: 280, r: 30, fill: "#FFD10C", stroke: "#292B2C", "stroke-width": "3" }, svg);
    el("rect", { x: 205, y: 266, width: 30, height: 28, rx: 6, fill: "#3F2FA0" }, svg);
    txt(svg, 125, 410, "fonte de partículas α", { "text-anchor": "middle", "font-size": "28", "font-weight": "700", fill: "#3F2FA0" });
    txt(svg, 125, 446, "(positivas e pesadas)", { "text-anchor": "middle", "font-size": "24", "font-weight": "600", fill: "#5E5A70" });
    // folha de ouro
    el("rect", { x: FOLHA - 7, y: 150, width: 14, height: 260, rx: 5, fill: "#E7B437", stroke: "#8A6A00", "stroke-width": "2" }, svg);
    txt(svg, FOLHA, 130, "folha de ouro finíssima", { "text-anchor": "middle", "font-size": "28", "font-weight": "700", fill: "#8A6A00" });
    var pontos = el("g", {}, svg), rastros = el("g", {}, svg), bolas = el("g", {}, svg);
    return { svg: svg, pontos: pontos, rastros: rastros, bolas: bolas, lista: particulas(), feitas: {} };
  }

  function acende(e, p, i) {
    if (e.feitas[i]) return;
    e.feitas[i] = true;
    var r = p.grande ? 11 : 7;
    el("circle", { cx: p.b.x.toFixed(1), cy: p.b.y.toFixed(1), r: r + 10, fill: "#FFD10C", opacity: ".28" }, e.pontos);
    el("circle", { cx: p.b.x.toFixed(1), cy: p.b.y.toFixed(1), r: r, fill: "#FFD10C", stroke: "#B88A00", "stroke-width": "1.5" }, e.pontos);
    if (p.grande) {
      el("path", { d: "M" + (FONTE.x + 40) + " " + p.y0.toFixed(1) + "L" + FOLHA + " " + p.y0.toFixed(1) + "L" + p.b.x.toFixed(1) + " " + p.b.y.toFixed(1),
        fill: "none", stroke: "#6551D1", "stroke-width": "3", "stroke-opacity": ".45", "stroke-dasharray": "8 8" }, e.rastros);
    }
  }

  function posicao(p, t) {
    var s = t - p.ini;
    if (s < 0 || s > p.t2) return null;
    if (s < p.t1) return [FONTE.x + 40 + s * VEL, p.y0];
    var f = (s - p.t1) / (p.t2 - p.t1);
    return [FOLHA + (p.b.x - FOLHA) * f, p.y0 + (p.b.y - p.y0) * f];
  }

  function desenha(e, t) {
    e.bolas.innerHTML = "";
    e.lista.forEach(function (p, i) {
      var q = posicao(p, t);
      if (q) el("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 8, fill: "#6551D1", stroke: "#fff", "stroke-width": "2.5" }, e.bolas);
      else if (t - p.ini > p.t2) acende(e, p, i);
    });
  }

  function fim(e) { var u = e.lista[e.lista.length - 1]; return u.ini + u.t2 + .05; }

  return {
    roda: function (box, direto) {
      var e = box._estado = monta(box);
      var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (direto || reduz) { desenha(e, fim(e)); return; }
      var t0 = null;
      function quadro(agora) {
        if (box._estado !== e) return;
        if (t0 === null) t0 = agora;
        var t = (agora - t0) / 1000;
        desenha(e, Math.min(t, fim(e)));
        if (t < fim(e)) requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    },
    zera: function (box) { box._estado = monta(box); },
    inicia: function (box) { box._estado = monta(box); }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-anima="folha-de-ouro"]').forEach(function (b) { window.QuarksAnimacoes["folha-de-ouro"].inicia(b); });
});
