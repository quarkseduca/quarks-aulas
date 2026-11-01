/* Animações de Fenômenos físicos e químicos (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo).
   Uma animação só (data-anima="rearranjo"), com o modo em data-modo:
   - fisico: seis moléculas de água saem da rede do gelo e se espalham (água líquida) e voltam;
     cada molécula continua inteira (um O e dois H): a substância não muda;
   - quimico: 2 H2 + O2 → 2 H2O. As moléculas de hidrogênio e de oxigênio se desfazem e os mesmos
     átomos se juntam de outro jeito, formando moléculas novas (água). Nenhum átomo some nem aparece.
   Os átomos vibram de leve (1 a 2 px) o tempo todo. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

window.QuarksAnimacoes.rearranjo = (function () {
  var NS = "http://www.w3.org/2000/svg";
  function parado() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function el(nome, at) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); return e; }
  var RO = 22, RH = 13, DOH = 27, ANG = 52 * Math.PI / 180;

  /* posições dos átomos de uma molécula de água com o O em (x, y) e girada de a */
  function agua(x, y, a) {
    return [[x, y, "O"], [x + DOH * Math.sin(a - ANG), y + DOH * Math.cos(a - ANG), "H"], [x + DOH * Math.sin(a + ANG), y + DOH * Math.cos(a + ANG), "H"]];
  }

  function cenaFisico(W, H) {
    var A = [], B = [], cx = W / 2, cy = H / 2 + 8;
    var esp = [[-250, -70, .6], [-60, -95, 2.4], [170, -60, -1.2], [-180, 75, 3.6], [40, 60, 1.1], [250, 70, -2.6]];
    for (var i = 0; i < 6; i++) {
      var col = i % 3, lin = Math.floor(i / 3);
      A = A.concat(agua(cx - 80 + col * 80, cy - 36 + lin * 72, 0));
      B = B.concat(agua(cx + esp[i][0], cy + esp[i][1], esp[i][2]));
    }
    return { A: A, B: B, ciclo: 9, fases: [1.6, 4.2, 6.6, 9], rotA: "gelo: rede organizada", rotB: "água líquida: moléculas soltas" };
  }

  function cenaQuimico(W, H) {
    var y1 = H / 2 - 62, y2 = H / 2 + 52;
    // reagentes: H2, H2 e O2 à esquerda
    var A = [[110, y1, "H"], [138, y1, "H"], [110, y2, "H"], [138, y2, "H"], [250, H / 2 - 22, "O"], [292, H / 2 - 22, "O"]];
    // produtos: duas águas à direita (os mesmos átomos, em outra arrumação)
    var w1 = agua(W - 170, y1 - 6, 0), w2 = agua(W - 170, y2 - 6, 0);
    var B = [w1[1], w1[2], w2[1], w2[2], w1[0], w2[0]];
    return { A: A, B: B, ciclo: 9, fases: [1.8, 4.8, 7.6, 9], rotA: "antes: H₂ e O₂ (reagentes)", rotB: "depois: H₂O (produto)", separa: true };
  }

  function monta(box) {
    if (box._r) return box._r;
    var W = +box.dataset.w || 760, H = +box.dataset.h || 300;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true" });
    svg.style.display = "block"; svg.style.overflow = "visible";
    var lig = el("g", { stroke: "#B9B0E6", "stroke-width": 6, "stroke-linecap": "round" }), at = el("g", {});
    svg.appendChild(lig); svg.appendChild(at);
    box.insertBefore(svg, box.firstChild);
    var C = box.dataset.modo === "quimico" ? cenaQuimico(W, H) : cenaFisico(W, H);
    C.circ = C.A.map(function (p, i) {
      var o = p[2] === "O";
      return at.appendChild(el("circle", { r: o ? RO : RH, fill: o ? "url(#gO)" : "url(#gH)", stroke: o ? "#8E2115" : "#8C84B8", "stroke-width": 2 }));
    });
    C.lig = lig; C.rot = (box.closest(".painel") || box.parentNode).querySelector("[data-fase]");
    box._r = C; return C;
  }

  /* ligações: liga cada H ao O mais perto (até 34 px) e, no começo do modo químico, H-H e O-O */
  function desenha(C, t) {
    var f = C.fases, s, P, rotulo;
    if (t < f[0]) s = 0; else if (t < f[1]) s = suave((t - f[0]) / (f[1] - f[0])); else if (t < f[2]) s = 1; else s = 1 - suave((t - f[2]) / (f[3] - f[2]));
    var op = 1;
    if (C.separa && t >= f[2]) { // no químico, a água some e os reagentes aparecem de novo
      var m = (f[2] + f[3]) / 2;
      if (t < m) { s = 1; op = 1 - (t - f[2]) / (m - f[2]); } else { s = 0; op = (t - m) / (f[3] - m); }
    }
    P = C.A.map(function (a, i) {
      var b = C.B[i], k = s;
      var x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
      if (C.separa && s > 0 && s < 1) y += Math.sin(Math.PI * s) * (i % 2 ? -26 : 26); // as moléculas se desfazem no caminho
      var v = 1.5, ph = i * 1.7;
      x += v * Math.sin(t * 7.1 + ph); y += v * Math.cos(t * 6.3 + ph * 1.3);
      return [x, y, a[2]];
    });
    P.forEach(function (p, i) { C.circ[i].setAttribute("cx", p[0].toFixed(1)); C.circ[i].setAttribute("cy", p[1].toFixed(1)); C.circ[i].setAttribute("opacity", op.toFixed(2)); });
    var h = "";
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      var d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]), par = P[i][2] + P[j][2];
      var lim = par === "OH" || par === "HO" ? 34 : par === "HH" ? 34 : par === "OO" ? 48 : 0;
      if (lim && d < lim) h += '<line x1="' + P[i][0].toFixed(1) + '" y1="' + P[i][1].toFixed(1) + '" x2="' + P[j][0].toFixed(1) + '" y2="' + P[j][1].toFixed(1) + '" opacity="' + op.toFixed(2) + '"/>';
    }
    C.lig.innerHTML = h;
    rotulo = s < .5 ? C.rotA : C.rotB;
    if (C.rot && C.rot.textContent !== rotulo) C.rot.textContent = rotulo;
  }

  function prepara(box) { var C = monta(box); box._vez = (box._vez || 0) + 1; desenha(C, 0); return C; }

  return {
    inicia: prepara,
    zera: prepara,
    roda: function (box) {
      var C = prepara(box);
      if (parado()) { desenha(C, C.fases[1]); return; }
      var vez = box._vez, t0 = null, ultimo = 0;
      function quadro(agora) {
        if (box._vez !== vez) return;
        if (t0 === null) t0 = agora;
        if (agora - ultimo > 33) { ultimo = agora; desenha(C, ((agora - t0) / 1000) % C.ciclo); }
        requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-anima="rearranjo"]').forEach(function (b) { window.QuarksAnimacoes.rearranjo.inicia(b); });
});
