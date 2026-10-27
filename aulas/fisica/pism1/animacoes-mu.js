/* Animações das aulas de Movimento uniforme (Física, PISM I). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

/* Duas pistas: em cima, MU a 20 m/s (marcas sempre a 20 m); embaixo, acelerando (a = 8 m/s²).
   As duas chegam aos 100 m em 5 s, mas só a de cima anda distâncias iguais em tempos iguais. */
window.QuarksAnimacoes["mu-pistas"] = (function () {
  var NS = "http://www.w3.org/2000/svg";
  var X0 = 150, PX = 14.5, DUR = 5, SEG_REAL = 1.25; // 1 s da simulação = 1,25 s na tela
  var pistas = [
    { y: 120, pos: function (t) { return 20 * t; }, cor: "var(--d)", corTexto: "var(--d-forte)", nome: "Velocidade constante: 20 m/s" },
    { y: 360, pos: function (t) { return 4 * t * t; }, cor: "#9C93C4", corTexto: "#6E6694", nome: "Velocidade aumentando" }
  ];

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
  function carro(pai, cor) {
    var g = el("g", {}, pai);
    el("rect", { x: -96, y: -52, width: 96, height: 34, rx: 14, fill: cor }, g);
    el("path", { d: "M-78 -52 Q-70 -76 -48 -76 L-34 -76 Q-18 -76 -12 -52 Z", fill: cor }, g);
    el("path", { d: "M-68 -54 Q-63 -70 -50 -70 L-44 -70 L-44 -54 Z M-38 -54 L-38 -70 L-34 -70 Q-24 -70 -20 -54 Z", fill: "#fff", opacity: ".85" }, g);
    el("circle", { cx: -74, cy: -16, r: 12, fill: "#292B2C" }, g);
    el("circle", { cx: -22, cy: -16, r: 12, fill: "#292B2C" }, g);
    el("circle", { cx: -74, cy: -16, r: 4.5, fill: "#fff" }, g);
    el("circle", { cx: -22, cy: -16, r: 4.5, fill: "#fff" }, g);
    return g;
  }

  function monta(box) {
    box.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 1760 520", width: "1760", height: "520", style: "overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
    var relogio = txt(svg, 1740, 36, "t = 0 s", { "text-anchor": "end", "font-size": "44", "font-weight": "800", fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
    var estado = { svg: svg, relogio: relogio, linhas: [] };
    pistas.forEach(function (p) {
      var g = el("g", {}, svg);
      txt(g, X0 - 60, p.y - 92, p.nome, { "font-size": "30", "font-weight": "700", fill: p.corTexto });
      el("line", { x1: X0 - 60, y1: p.y, x2: X0 + 100 * PX + 40, y2: p.y, stroke: "#DCD6F3", "stroke-width": "8", "stroke-linecap": "round" }, g);
      var marcas = el("g", {}, g);
      var c = carro(g, p.cor);
      estado.linhas.push({ p: p, marcas: marcas, carro: c, feitas: 0 });
    });
    desenha(estado, 0);
    return estado;
  }

  function marca(L, t) {
    var x = X0 + L.p.pos(t) * PX, y = L.p.y;
    el("line", { x1: x, y1: y - 18, x2: x, y2: y + 18, stroke: L.p.cor, "stroke-width": "5", "stroke-linecap": "round" }, L.marcas);
    txt(L.marcas, x, y + 50, t + " s", { "text-anchor": "middle", "font-size": "28", "font-weight": "700", fill: "#5E5A70" });
    if (t > 0) {
      var xa = X0 + L.p.pos(t - 1) * PX, d = L.p.pos(t) - L.p.pos(t - 1);
      var g = el("g", { opacity: "0" }, L.marcas);
      el("path", { d: "M" + (xa + 6) + " " + (y + 66) + " L" + (x - 6) + " " + (y + 66), stroke: L.p.cor, "stroke-width": "3", fill: "none" }, g);
      txt(g, (xa + x) / 2, y + 100, d + " m", { "text-anchor": "middle", "font-size": "28", "font-weight": "800", fill: L.p.corTexto });
      requestAnimationFrame(function () { g.style.transition = "opacity .5s"; g.setAttribute("opacity", "1"); });
    }
  }

  function desenha(e, t) {
    e.relogio.textContent = "t = " + Math.floor(t + 1e-6) + " s";
    e.linhas.forEach(function (L) {
      while (L.feitas <= Math.floor(t + 1e-6) && L.feitas <= DUR) { marca(L, L.feitas); L.feitas++; }
      var x = X0 + L.p.pos(t) * PX;
      L.carro.setAttribute("transform", "translate(" + (x + 48) + " " + L.p.y + ")");
    });
  }

  return {
    roda: function (box, direto) {
      var e = box._estado = monta(box);
      var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (direto || reduz) { desenha(e, DUR); return; }
      var t0 = null;
      function quadro(agora) {
        if (box._estado !== e) return;
        if (t0 === null) t0 = agora;
        var t = Math.min(DUR, (agora - t0) / 1000 / SEG_REAL);
        desenha(e, t);
        if (t < DUR) requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    },
    zera: function (box) { box._estado = monta(box); },
    inicia: function (box) { box._estado = monta(box); }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-anima="mu-pistas"]').forEach(function (b) { window.QuarksAnimacoes["mu-pistas"].inicia(b); });
});
