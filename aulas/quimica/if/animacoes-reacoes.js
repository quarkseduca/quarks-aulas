/* Animações de Reações químicas (Química, IF).
   Regra: só se movem na tela aberta (.slide.ativo) e depois que a figura aparece (data-anima-passo).
   - Rearranjo (data-anima="rearranjo", data-reacao="h2o" | "ch4" | "nh3" | "neutra"):
     os átomos dos reagentes vibram, se soltam, trocam de parceiros e formam os produtos.
     Nenhum átomo some nem aparece: é o que a equação balanceada e a Lei de Lavoisier dizem.
     data-inverte="1" faz o caminho de volta (ex.: 2 H2O -> 2 H2 + O2, a decomposição da água).
     Ciclo de 8 s: reagentes (2 s), troca (2,2 s), produtos (2,8 s) e recomeço suave (1 s). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

window.QuarksAnimacoes.rearranjo = (function () {
  var NS = "http://www.w3.org/2000/svg";
  var COR = { H: ["#FFFFFF", "#C9C4DC", "#8C84B8"], O: ["#FF8A7A", "#C8301F", "#8E2115"], C: ["#8A8A96", "#2E2E36", "#1E1E24"],
              N: ["#7FA8FF", "#2A5BD0", "#1B3E94"], Na: ["#D9CCFF", "#8C7BEA", "#4B39B3"], Cl: ["#B8F0A8", "#4CA34A", "#2E6B2C"] };
  var RAIO = { H: 21, O: 33, C: 33, N: 32, Na: 35, Cl: 35 };
  /* cada átomo: [elemento, x inicial, y inicial, x final, y final] */
  var REACOES = {
    h2o: { w: 900, h: 300, seta: [420, 500], at: [
      ["O", 250, 150, 690, 95], ["O", 298, 150, 690, 215],
      ["H", 80, 95, 656, 122], ["H", 116, 95, 724, 122], ["H", 80, 205, 656, 242], ["H", 116, 205, 724, 242]] },
    ch4: { w: 1000, h: 320, seta: [430, 530], at: [
      ["O", 300, 95, 602, 165], ["O", 348, 95, 880, 95], ["O", 300, 225, 698, 165], ["O", 348, 225, 880, 225],
      ["C", 110, 160, 650, 165],
      ["H", 110, 112, 846, 122], ["H", 158, 160, 914, 122], ["H", 110, 208, 846, 252], ["H", 62, 160, 914, 252]] },
    nh3: { w: 900, h: 300, seta: [380, 480], at: [
      ["N", 90, 150, 690, 90], ["N", 138, 150, 690, 210],
      ["H", 250, 70, 652, 112], ["H", 286, 70, 728, 112], ["H", 250, 150, 690, 128],
      ["H", 286, 150, 652, 232], ["H", 250, 230, 728, 232], ["H", 286, 230, 690, 248]] },
    neutra: { w: 820, h: 300, seta: [300, 400], at: [
      ["Na", 70, 215, 620, 95], ["Cl", 114, 95, 678, 95], ["O", 126, 215, 650, 215],
      ["H", 70, 95, 616, 242], ["H", 166, 215, 684, 242]] }
  };

  function el(nome, at) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); return e; }
  var parado = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function gradientes() {
    if (document.getElementById("rx-defs")) return;
    var svg = el("svg", { id: "rx-defs", width: 0, height: 0, "aria-hidden": "true" });
    svg.style.position = "absolute";
    var defs = el("defs", {});
    Object.keys(COR).forEach(function (k) {
      var g = el("radialGradient", { id: "rx-" + k, cx: ".35", cy: ".3", r: ".8" });
      g.appendChild(el("stop", { offset: "0", "stop-color": COR[k][0] }));
      g.appendChild(el("stop", { offset: "1", "stop-color": COR[k][1] }));
      defs.appendChild(g);
    });
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  function monta(box) {
    gradientes();
    var R = REACOES[box.dataset.reacao], inv = box.dataset.inverte === "1";
    box.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + R.w + " " + R.h, "aria-hidden": "true" });
    svg.style.cssText = "display:block;width:100%;height:100%;overflow:visible";
    var y0 = R.h / 2, s = R.seta;
    svg.appendChild(el("path", { d: "M" + s[0] + " " + y0 + " H" + (s[1] - 4), stroke: "#6551D1", "stroke-width": 7, "stroke-linecap": "round", fill: "none" }));
    svg.appendChild(el("path", { d: "M" + (s[1] - 20) + " " + (y0 - 16) + " L" + s[1] + " " + y0 + " L" + (s[1] - 20) + " " + (y0 + 16), stroke: "#6551D1", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" }));
    var camada = el("g", {});
    svg.appendChild(camada);
    var lista = R.at.map(function (a, i) {
      var g = el("g", {}), r = RAIO[a[0]];
      g.appendChild(el("circle", { r: r, fill: "url(#rx-" + a[0] + ")", stroke: COR[a[0]][2], "stroke-width": 2 }));
      var t = el("text", { "text-anchor": "middle", y: (r > 25 ? 10 : 8), "font-family": "Figtree,sans-serif", "font-weight": 800,
                            "font-size": (r > 25 ? (a[0].length > 1 ? 24 : 28) : 21), fill: a[0] === "H" ? "#4B39B3" : "#fff" });
      t.textContent = a[0];
      g.appendChild(t);
      camada.appendChild(g);
      var ini = inv ? [a[3], a[4]] : [a[1], a[2]], fim = inv ? [a[1], a[2]] : [a[3], a[4]];
      return { g: g, ini: ini, fim: fim, fase: i * 1.37, arco: (i % 2 ? -1 : 1) * (30 + (i % 3) * 14) };
    });
    box.appendChild(svg);
    return { svg: svg, camada: camada, lista: lista, vez: 0 };
  }

  function suave(u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

  function desenha(E, t, final) {
    var T = 8, c = final ? 5 : t % T, op = 1, u;
    if (c < 2) u = 0;
    else if (c < 4.2) u = suave((c - 2) / 2.2);
    else u = 1;
    if (c >= 7) { op = c < 7.5 ? 1 - (c - 7) / .5 : 0; }
    if (c < .5 && t >= T) op = c / .5;
    E.lista.forEach(function (a) {
      var x = a.ini[0] + (a.fim[0] - a.ini[0]) * u, y = a.ini[1] + (a.fim[1] - a.ini[1]) * u + Math.sin(Math.PI * u) * a.arco;
      if (!final && (u === 0 || u === 1)) { // vibração leve (1,5 px)
        x += 1.5 * Math.sin(t * 5.1 + a.fase); y += 1.5 * Math.cos(t * 4.3 + a.fase * 1.7);
      }
      a.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
    });
    E.camada.setAttribute("opacity", op.toFixed(2));
  }

  function prepara(box) { var E = box._rx = monta(box); desenha(E, 0); return E; }

  return {
    inicia: prepara,
    zera: function (box) { if (box._rx) box._rx.vez++; prepara(box); },
    roda: function (box, direto) {
      if (box._rx) box._rx.vez++;
      var E = prepara(box), vez = E.vez, slide = box.closest(".slide");
      if (parado()) { desenha(E, 0, true); return; }
      var t0 = null, ultimo = 0;
      function quadro(agora) {
        if (box._rx !== E || E.vez !== vez) return;
        if (t0 === null) t0 = agora;
        if (slide && !slide.classList.contains("ativo")) { t0 = null; requestAnimationFrame(quadro); return; }
        if (agora - ultimo > 33) { ultimo = agora; desenha(E, (agora - t0) / 1000); }
        requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-anima="rearranjo"]').forEach(function (b) { window.QuarksAnimacoes.rearranjo.inicia(b); });
});
