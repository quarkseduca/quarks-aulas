/* Animações de Propriedades da matéria (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo).
   - afunda-flutua: cada objeto cai no copo com óleo e água e para onde a sua densidade manda
     (a cortiça boia no óleo, o plástico fica entre o óleo e a água, o ferro vai ao fundo);
     os que flutuam balançam de leve na superfície.
   - solubilidade: grãos de sal caem na água, um de cada vez (cada grão vale 4 g). Os primeiros
     se dissolvem e somem; quando a conta chega a 36 g (o máximo em 100 g de água a 20 °C),
     a solução fica saturada e os grãos seguintes ficam no fundo (corpo de fundo). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  function parado() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function laco(box, desenha) {
    box._vez = (box._vez || 0) + 1;
    var vez = box._vez, t0 = null, ultimo = 0;
    function quadro(agora) {
      if (box._vez !== vez) return;
      if (t0 === null) t0 = agora;
      if (agora - ultimo > 33) { ultimo = agora; desenha((agora - t0) / 1000); }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }
  function para(box) { box._vez = (box._vez || 0) + 1; }

  /* ---------- Afunda ou flutua ---------- */
  var Y0 = 20; // todos começam acima do copo
  function objs(box) { return Array.prototype.slice.call(box.querySelectorAll("[data-obj]")); }
  function poe(g, y) { g.setAttribute("transform", "translate(" + g.dataset.x + " " + y.toFixed(1) + ")"); }
  function posAfunda(g, t) {
    var ini = +g.dataset.ini, T = +g.dataset.t, y1 = +g.dataset.y1;
    var s = (t - ini) / T;
    if (s <= 0) return null;
    var y = Y0 + (y1 - Y0) * suave(s);
    if (s >= 1 && g.dataset.boia) y += 2 * Math.sin((t - ini - T) * 2 * Math.PI / 4); // balança 2 px a cada 4 s
    return y;
  }
  window.QuarksAnimacoes["afunda-flutua"] = {
    inicia: function (box) { objs(box).forEach(function (g) { poe(g, Y0); g.style.opacity = 0; }); },
    zera: function (box) { para(box); this.inicia(box); },
    roda: function (box) {
      var lista = objs(box);
      if (parado()) { lista.forEach(function (g) { poe(g, +g.dataset.y1); g.style.opacity = 1; }); return; }
      laco(box, function (t) {
        lista.forEach(function (g) {
          var y = posAfunda(g, t);
          if (y === null) { g.style.opacity = 0; return; }
          g.style.opacity = 1; poe(g, y);
        });
      });
    }
  };

  /* ---------- Solubilidade ---------- */
  var GRAO = 4, MAX = 36, N = 12, INTERVALO = 0.9, QUEDA = 1.7, CICLO = N * INTERVALO + QUEDA + 4;
  function prepara(box) {
    if (box._sol) return box._sol;
    var svg = box.querySelector("svg.graos-sal"), raiz = box.closest(".slide") || document;
    var S = { svg: svg, graos: [], diss: raiz.querySelector("[data-dissolvido]"), fundo: raiz.querySelector("[data-fundo]"), satur: raiz.querySelector("[data-saturada]") };
    var topo = +box.dataset.topo || 40, sup = +box.dataset.sup || 150, chao = +box.dataset.chao || 420, cx = +box.dataset.cx || 260;
    for (var i = 0; i < N; i++) {
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("width", 14); r.setAttribute("height", 14); r.setAttribute("rx", 3);
      r.setAttribute("fill", "#FFFFFF"); r.setAttribute("stroke", "#8C84B8"); r.setAttribute("stroke-width", 2);
      svg.appendChild(r);
      var x = cx - 40 + ((i * 37) % 80);
      var resto = i - MAX / GRAO; // grãos que sobram vão para o fundo, lado a lado
      S.graos.push({ el: r, x: x, xf: cx - 30 + resto * 18, topo: topo, sup: sup, chao: chao, dissolve: i < MAX / GRAO, t: i * INTERVALO });
    }
    box._sol = S; return S;
  }
  function desenhaSol(S, t) {
    var diss = 0, fundo = 0;
    S.graos.forEach(function (g) {
      var s = (t - g.t) / QUEDA, el = g.el;
      if (s <= 0) { el.style.opacity = 0; return; }
      var y, op = 1, esc = 1, x = g.x;
      if (g.dissolve) {
        y = g.topo + (g.sup + 90 - g.topo) * Math.min(1, s);
        if (s > .45) { var f = Math.min(1, (s - .45) / .55); esc = 1 - f; op = 1 - f; }
        if (s >= 1) diss += GRAO;
      } else {
        y = g.topo + (g.chao - 14 - g.topo) * suave(s);
        x = g.x + (g.xf - g.x) * suave(s);
        if (s >= 1) fundo += GRAO;
      }
      el.style.opacity = op;
      el.setAttribute("transform", "translate(" + (x + 7).toFixed(1) + " " + (y + 7).toFixed(1) + ") scale(" + esc.toFixed(2) + ") translate(-7 -7)");
    });
    if (S.diss) S.diss.textContent = diss;
    if (S.fundo) S.fundo.textContent = fundo;
    if (S.satur) S.satur.classList.toggle("on", diss >= MAX);
  }
  window.QuarksAnimacoes.solubilidade = {
    inicia: function (box) { desenhaSol(prepara(box), 0); },
    zera: function (box) { para(box); desenhaSol(prepara(box), 0); },
    roda: function (box) {
      var S = prepara(box);
      if (parado()) { desenhaSol(S, CICLO - 4); return; }
      laco(box, function (t) { desenhaSol(S, t % CICLO); });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[data-anima="afunda-flutua"]').forEach(function (b) { window.QuarksAnimacoes["afunda-flutua"].inicia(b); });
    document.querySelectorAll('[data-anima="solubilidade"]').forEach(function (b) { window.QuarksAnimacoes.solubilidade.inicia(b); });
  });
})();
