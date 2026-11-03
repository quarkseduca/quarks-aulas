/* Animações de Trigonometria (Matemática, IF).
   Só se movem na tela aberta e depois que a figura aparece; lentas; paradas com prefers-reduced-motion.
   - "trig-semelhantes"  um triângulo retângulo de ângulo α fixo cresce e encolhe em degraus (lados 3s, 4s e 5s);
                         os lados mudam, mas oposto ÷ hipotenusa fica sempre 0,60. Começa em 1,5 e 2,5 (a rampa curta)
                         e passa por 3 e 5 (a rampa longa) do gancho. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = "Figtree,'Segoe UI',sans-serif";
  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) {
    var t = el("text", Object.assign({ x: x, y: y, "font-family": FONTE }, at || {}), pai);
    t.textContent = s;
    return t;
  }
  function reduz() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function virgula(v) { return v.toFixed(1).replace(".", ","); }

  /* ---------- Triângulos semelhantes ---------- */
  var U = 40, AX = 40, AY = 440;                 // 1 unidade = 40 px; vértice do ângulo α
  var DEGRAUS = [0.5, 1, 1.5, 2, 2.5, 2, 1.5, 1]; // fator s: lados 3s, 4s, 5s
  var FICA = 1.6, MUDA = 1.4;                    // segundos parado e mudando, em cada degrau

  function monta(box) {
    box.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 1080 470", width: "1080", height: "470", style: "overflow:visible" }, box);
    var e = { svg: svg };
    e.tri = el("path", { fill: "var(--d-clara)", stroke: "var(--d-forte)", "stroke-width": 5, "stroke-linejoin": "round" }, svg);
    e.op = el("line", { stroke: "#FFB800", "stroke-width": 9, "stroke-linecap": "round" }, svg);
    e.hip = el("line", { stroke: "var(--d)", "stroke-width": 9, "stroke-linecap": "round" }, svg);
    e.reto = el("path", { fill: "none", stroke: "#292B2C", "stroke-width": 3 }, svg);
    var ang = Math.atan2(3, 4);
    el("path", { d: "M" + (AX + 70) + " " + AY + " A70 70 0 0 0 " + (AX + 70 * Math.cos(ang)) + " " + (AY - 70 * Math.sin(ang)), fill: "none", stroke: "#3F2FA0", "stroke-width": 5 }, svg);
    txt(svg, AX + 84, AY - 14, "α", { "font-size": 34, "font-weight": 800, fill: "#3F2FA0", "font-style": "italic" });
    e.tOp = txt(svg, 0, 0, "", { "font-size": 30, "font-weight": 800, fill: "#8A6A00" });
    e.tHip = txt(svg, 0, 0, "", { "font-size": 30, "font-weight": 800, fill: "var(--d-forte)", "text-anchor": "end" });
    var g = el("g", {}, svg);
    el("rect", { x: 560, y: 70, width: 500, height: 250, rx: 28, fill: "#fff", stroke: "#E4DEFB", "stroke-width": 2 }, g);
    txt(g, 600, 130, "cateto oposto", { "font-size": 30, "font-weight": 700, fill: "#8A6A00" });
    txt(g, 600, 182, "hipotenusa", { "font-size": 30, "font-weight": 700, fill: "var(--d-forte)" });
    e.vOp = txt(g, 1020, 130, "", { "font-size": 34, "font-weight": 800, fill: "#292B2C", "text-anchor": "end", style: "font-variant-numeric:tabular-nums" });
    e.vHip = txt(g, 1020, 182, "", { "font-size": 34, "font-weight": 800, fill: "#292B2C", "text-anchor": "end", style: "font-variant-numeric:tabular-nums" });
    el("line", { x1: 600, y1: 214, x2: 1020, y2: 214, stroke: "#E4DEFB", "stroke-width": 2 }, g);
    txt(g, 600, 280, "oposto ÷ hipotenusa", { "font-size": 30, "font-weight": 700, fill: "#3F2FA0" });
    txt(g, 1020, 282, "0,60", { "font-size": 44, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "end", "font-family": "'Bricolage Grotesque'," + FONTE });
    return e;
  }

  function desenha(e, s, sRotulo) {
    var b = 4 * s * U, h = 3 * s * U, Cx = AX + b, By = AY - h;
    e.tri.setAttribute("d", "M" + AX + " " + AY + " L" + Cx + " " + AY + " L" + Cx + " " + By + " Z");
    e.op.setAttribute("x1", Cx); e.op.setAttribute("y1", AY); e.op.setAttribute("x2", Cx); e.op.setAttribute("y2", By);
    e.hip.setAttribute("x1", AX); e.hip.setAttribute("y1", AY); e.hip.setAttribute("x2", Cx); e.hip.setAttribute("y2", By);
    var q = Math.min(22, h / 3);
    e.reto.setAttribute("d", "M" + (Cx - q) + " " + AY + " V" + (AY - q) + " H" + Cx);
    e.tOp.setAttribute("x", Cx + 16); e.tOp.setAttribute("y", AY - h / 2 + 10);
    e.tHip.setAttribute("x", AX + b / 2 - 18); e.tHip.setAttribute("y", AY - h / 2 - 16);
    e.tOp.textContent = virgula(3 * sRotulo);
    e.tHip.textContent = virgula(5 * sRotulo);
    e.vOp.textContent = virgula(3 * sRotulo);
    e.vHip.textContent = virgula(5 * sRotulo);
  }

  function quadro(e, t) {
    var ciclo = FICA + MUDA, n = DEGRAUS.length;
    var k = Math.floor(t / ciclo), f = t - k * ciclo;
    var a = DEGRAUS[k % n], b = DEGRAUS[(k + 1) % n];
    if (f < FICA) { desenha(e, a, a); return; }
    var x = suave((f - FICA) / MUDA);
    desenha(e, a + (b - a) * x, x < 0.5 ? a : b);
  }

  function prepara(box) {
    box._vez = (box._vez || 0) + 1;
    box._est = monta(box);
    desenha(box._est, 1.5, 1.5);
  }

  window.QuarksAnimacoes["trig-semelhantes"] = {
    inicia: prepara,
    zera: prepara,
    roda: function (box) {
      prepara(box);
      if (reduz()) return;
      var vez = box._vez, t0 = null, ultimo = 0;
      function passo(agora) {
        if (box._vez !== vez) return;
        if (t0 === null) t0 = agora;
        if (agora - ultimo > 30) { ultimo = agora; quadro(box._est, (agora - t0) / 1000 + 2 * (FICA + MUDA)); }
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[data-anima="trig-semelhantes"]').forEach(function (b) { prepara(b); });
  });
})();
