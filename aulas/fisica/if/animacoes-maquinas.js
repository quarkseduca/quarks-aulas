/* Animações de Máquinas simples (Física, IF).
   Só se movem na tela aberta e depois que a figura aparece; lentas; paradas com prefers-reduced-motion.
   - "gangorra"  Ana (300 N) a 2 m do apoio; Davi (400 N) começa a 2 m (a gangorra desce do lado dele) e escorrega
                 até 1,5 m, onde 300 · 2 = 400 · 1,5 e a gangorra fica na horizontal.
   - "roldana"   data-modo="fixa": a mão puxa para baixo e a carga sobe a mesma altura, com força igual ao peso;
                 data-modo="movel": a carga sobe h e a mão puxa 2h de corda, com metade da força.
   Engrenagens (svg g[data-dentes]): o contorno dos dentes é desenhado uma vez; quem gira é o CSS da parte. */
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
  function laco(monta, quadro) {
    function prepara(box) {
      box._vez = (box._vez || 0) + 1;
      box.innerHTML = "";
      box._est = monta(box);
      quadro(box._est, undefined);
    }
    return {
      inicia: prepara, zera: prepara,
      roda: function (box) {
        prepara(box);
        if (reduz()) return;
        var vez = box._vez, t0 = null, ultimo = 0;
        function passo(agora) {
          if (box._vez !== vez) return;
          if (t0 === null) t0 = agora;
          if (agora - ultimo > 30) { ultimo = agora; quadro(box._est, (agora - t0) / 1000); }
          requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
      }
    };
  }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function pessoa(pai, cor, nome, peso) {
    var g = el("g", {}, pai);
    el("circle", { cx: 0, cy: -118, r: 22, fill: cor }, g);
    el("path", { d: "M-26 -10 Q-28 -88 0 -92 Q28 -88 26 -10 Z", fill: cor }, g);
    txt(g, 0, -152, nome, { "font-size": 26, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "middle" });
    txt(g, 0, -192, peso, { "font-size": 24, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle" });
    return g;
  }

  /* ---------- Gangorra ---------- */
  window.QuarksAnimacoes["gangorra"] = laco(function (box) {
    var W = +box.dataset.w || 1000, H = +box.dataset.h || 420;
    var s = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "display:block;overflow:visible", "aria-hidden": "true" }, box);
    var e = { cx: W / 2, cy: H - 110, px: 170 }; // 170 px por metro
    el("rect", { x: 40, y: H - 40, width: W - 80, height: 16, rx: 8, fill: "#E4DEFB" }, s);
    el("path", { d: "M" + (e.cx - 46) + " " + (H - 40) + " L" + e.cx + " " + (e.cy + 6) + " L" + (e.cx + 46) + " " + (H - 40) + " Z", fill: "#8C7BEA" }, s);
    e.barra = el("g", {}, s);
    el("rect", { x: -2.6 * e.px, y: -10, width: 5.2 * e.px, height: 20, rx: 10, fill: "#C9A26B", stroke: "#8A6A3E", "stroke-width": 3 }, e.barra);
    // marcas de meio em meio metro
    for (var m = -2.5; m <= 2.51; m += .5) {
      if (Math.abs(m) < .01) continue;
      el("line", { x1: m * e.px, y1: 10, x2: m * e.px, y2: 22, stroke: "#8A6A3E", "stroke-width": 3 }, e.barra);
    }
    e.ana = pessoa(e.barra, "#8C7BEA", "Ana", "300 N");
    e.ana.setAttribute("transform", "translate(" + (-2 * e.px) + " -10)");
    e.davi = pessoa(e.barra, "#0F8B8D", "Davi", "400 N");
    e.cotaA = el("g", {}, e.barra);
    el("path", { d: "M" + (-2 * e.px) + " 46 H-4", stroke: "#8C7BEA", "stroke-width": 3 }, e.cotaA);
    txt(e.cotaA, -e.px, 80, "2 m", { "font-size": 26, "font-weight": 800, fill: "#5E5A70", "text-anchor": "middle" });
    e.cotaD = el("path", { stroke: "#0F8B8D", "stroke-width": 3 }, e.barra);
    e.cotaDt = txt(e.barra, 0, 80, "", { "font-size": 26, "font-weight": 800, fill: "#0B6B6D", "text-anchor": "middle" });
    e.conta = txt(s, e.cx, 38, "", { "font-size": 34, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "middle", style: "font-variant-numeric:tabular-nums" });
    return e;
  }, function (e, t) {
    var P = 9, c = t === undefined ? 8 : t % P;
    var b = 2 - .5 * suave((c - 1.8) / 3.4); // de 2 m a 1,5 m
    var dif = 400 * b - 300 * 2; // > 0: desce do lado de Davi
    var ang = Math.max(-9, Math.min(9, dif / 200 * 9));
    e.barra.setAttribute("transform", "translate(" + e.cx + " " + e.cy + ") rotate(" + ang.toFixed(2) + ")");
    e.davi.setAttribute("transform", "translate(" + (b * e.px).toFixed(1) + " -10)");
    e.cotaD.setAttribute("d", "M4 46 H" + (b * e.px).toFixed(1));
    e.cotaDt.setAttribute("x", (b * e.px / 2).toFixed(1));
    var bt = String(parseFloat(b.toFixed(2))).replace(".", ",");
    e.cotaDt.textContent = bt + " m";
    var dt = Math.round(400 * b);
    e.conta.textContent = "300 · 2 = 600   " + (Math.abs(dif) < 3 ? "=" : dif > 0 ? "<" : ">") + "   400 · " + bt + " = " + dt;
  });

  /* ---------- Roldanas ---------- */
  window.QuarksAnimacoes["roldana"] = laco(function (box) {
    var modo = box.dataset.modo || "fixa";
    var W = +box.dataset.w || 560, H = +box.dataset.h || 600;
    var s = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "display:block;overflow:visible", "aria-hidden": "true" }, box);
    var e = { modo: modo, W: W, H: H, R: 46, teto: 40, h: modo === "movel" ? 105 : 150 };
    el("rect", { x: 20, y: 10, width: W - 40, height: 30, rx: 8, fill: "#B5ADC9" }, s);
    for (var i = 0; i < 12; i++) el("line", { x1: 40 + i * (W - 80) / 11, y1: 10, x2: 26 + i * (W - 80) / 11, y2: 0, stroke: "#B5ADC9", "stroke-width": 3 }, s);
    e.cordas = el("g", { stroke: "#0B6B6D", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }, s);
    e.fixa = { x: modo === "fixa" ? W / 2 : W / 2 + 70, y: e.teto + 70 };
    if (modo === "fixa") {
      el("line", { x1: e.fixa.x, y1: e.teto, x2: e.fixa.x, y2: e.fixa.y, stroke: "#5E5A70", "stroke-width": 8 }, s);
      roda(s, e.fixa.x, e.fixa.y, e.R, "#8C7BEA");
    }
    e.carga = el("g", {}, s);
    el("rect", { x: -62, y: 0, width: 124, height: 96, rx: 14, fill: "#E8C27A", stroke: "#B8893A", "stroke-width": 4 }, e.carga);
    txt(e.carga, 0, 60, "carga", { "font-size": 26, "font-weight": 800, fill: "#6E4B12", "text-anchor": "middle" });
    if (modo === "movel") {
      e.movel = el("g", {}, s);
      roda(e.movel, 0, 0, e.R, "#0F8B8D");
      el("line", { x1: 0, y1: 0, x2: 0, y2: 70, stroke: "#5E5A70", "stroke-width": 8 }, e.movel);
    }
    e.mao = el("g", {}, s);
    el("rect", { x: -20, y: -16, width: 40, height: 40, rx: 14, fill: "#F2C29B", stroke: "#B9845A", "stroke-width": 3 }, e.mao);
    e.seta = el("g", {}, s);
    e.rotF = txt(s, 0, 0, "", { "font-size": 30, "font-weight": 800, fill: "#3F2FA0" });
    e.cotas = el("g", {}, s);
    e.rotH = txt(s, 0, 0, "", { "font-size": 26, "font-weight": 800, fill: "#5E5A70", "text-anchor": "end" });
    e.rotC = txt(s, 0, 0, "", { "font-size": 26, "font-weight": 800, fill: "#0B6B6D" });
    return e;
  }, function (e, t) {
    var P = 7, c = t === undefined ? 3.5 : t % P;
    var f = c < 3.5 ? suave(c / 3) : 1 - suave((c - 3.8) / 2.8);
    var R = e.R, sobe = e.h * f, H = e.H;
    var c0 = H - 130; // topo da carga embaixo
    var topoCarga = c0 - sobe;
    e.carga.setAttribute("transform", "translate(" + (e.modo === "fixa" ? e.fixa.x - R : e.W / 2 - 40) + " " + topoCarga.toFixed(1) + ")");
    var d = "";
    var mx, my, Fr;
    if (e.modo === "fixa") {
      var xe = e.fixa.x - R, xd = e.fixa.x + R;
      d += "M" + xe + " " + topoCarga.toFixed(1) + " V" + e.fixa.y + " A" + R + " " + R + " 0 0 1 " + xd + " " + e.fixa.y;
      my = e.fixa.y + 160 + sobe; mx = xd;
      d += " V" + my.toFixed(1);
      Fr = "F = P";
      e.cotas.innerHTML = "";
      cota(e.cotas, xe - 84, c0 + 0, c0 - sobe, "#5E5A70");
      cota(e.cotas, xd + 50, e.fixa.y + 160, my, "#0B6B6D");
      e.rotH.setAttribute("x", xe - 100); e.rotH.setAttribute("y", c0 - sobe / 2 + 8);
      e.rotC.setAttribute("x", xd + 70); e.rotC.setAttribute("y", e.fixa.y + 160 + sobe / 2 + 8);
      e.rotH.textContent = "sobe h"; e.rotC.textContent = "puxa h";
    } else {
      var cxm = e.W / 2 - 40, cym = topoCarga - 70; // centro da roldana móvel
      e.movel.setAttribute("transform", "translate(" + cxm + " " + cym.toFixed(1) + ")");
      var xa = cxm - R, xb = cxm + R;
      d += "M" + xa + " " + e.teto + " V" + cym.toFixed(1) + " A" + R + " " + R + " 0 0 0 " + xb + " " + cym.toFixed(1);
      my = cym - 110 - sobe; // a ponta da corda sobe o dobro
      mx = xb;
      d += " V" + my.toFixed(1);
      Fr = "F = P/2";
      e.cotas.innerHTML = "";
      cota(e.cotas, xa - 46, c0, c0 - sobe, "#5E5A70");
      cota(e.cotas, xb + 60, cym + sobe - 110, my, "#0B6B6D");
      e.rotH.setAttribute("x", xa - 62); e.rotH.setAttribute("y", c0 - sobe / 2 + 8);
      e.rotC.setAttribute("x", xb + 80); e.rotC.setAttribute("y", (cym + sobe - 110 + my) / 2 + 8);
      e.rotH.textContent = "sobe h"; e.rotC.textContent = sobe > 4 ? "puxa 2h" : "";
    }
    e.cordas.innerHTML = '<path d="' + d + '"/>';
    e.mao.setAttribute("transform", "translate(" + mx + " " + my.toFixed(1) + ")");
    var dir = e.modo === "fixa" ? 1 : -1, y0 = my + (dir > 0 ? 34 : -26), L = e.modo === "fixa" ? 90 : 52;
    e.seta.innerHTML = '<path d="M' + mx + " " + y0.toFixed(1) + " V" + (y0 + dir * L).toFixed(1) + '" stroke="#3F2FA0" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M' + (mx - 14) + " " + (y0 + dir * (L - 16)).toFixed(1) + " L" + mx + " " + (y0 + dir * (L + 4)).toFixed(1) + " L" + (mx + 14) + " " + (y0 + dir * (L - 16)).toFixed(1) + '" fill="none" stroke="#3F2FA0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
    e.rotF.setAttribute("x", mx + 26); e.rotF.setAttribute("y", (y0 + dir * L / 2 + 10).toFixed(1));
    e.rotF.textContent = Fr;
  });
  function roda(pai, x, y, R, cor) {
    el("circle", { cx: x, cy: y, r: R, fill: "#fff", stroke: cor, "stroke-width": 8 }, pai);
    el("circle", { cx: x, cy: y, r: R - 14, fill: "none", stroke: cor, "stroke-width": 3, opacity: .5 }, pai);
    el("circle", { cx: x, cy: y, r: 8, fill: cor }, pai);
  }
  function cota(pai, x, y1, y2, cor) {
    if (Math.abs(y1 - y2) < 4) return;
    el("line", { x1: x, y1: y1, x2: x, y2: y2, stroke: cor, "stroke-width": 3 }, pai);
    el("line", { x1: x - 10, y1: y1, x2: x + 10, y2: y1, stroke: cor, "stroke-width": 3 }, pai);
    el("line", { x1: x - 10, y1: y2, x2: x + 10, y2: y2, stroke: cor, "stroke-width": 3 }, pai);
  }

  /* ---------- Engrenagens: contorno com dentes ---------- */
  function dentes(g) {
    var n = +g.dataset.dentes, r = +g.dataset.r, h = +(g.dataset.h || 14);
    var d = "", passo = 2 * Math.PI / n;
    for (var i = 0; i < n; i++) {
      var a = i * passo, pts = [[r, a], [r + h, a + passo * .18], [r + h, a + passo * .5], [r, a + passo * .68]];
      pts.forEach(function (p, j) {
        var x = (p[0] * Math.cos(p[1])).toFixed(1), y = (p[0] * Math.sin(p[1])).toFixed(1);
        d += (i === 0 && j === 0 ? "M" : "L") + x + " " + y + " ";
      });
    }
    el("path", { d: d + "Z", fill: g.dataset.cor || "#8C7BEA", stroke: "rgba(41,43,44,.4)", "stroke-width": 2 }, g);
    el("circle", { r: r * .55, fill: "#fff", opacity: .55 }, g);
    el("circle", { r: 10, fill: "#292B2C" }, g);
    el("line", { x1: 0, y1: 0, x2: r * .8, y2: 0, stroke: "#292B2C", "stroke-width": 6, "stroke-linecap": "round" }, g);
  }

  document.addEventListener("DOMContentLoaded", function () {
    ["gangorra", "roldana"].forEach(function (nome) {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
    document.querySelectorAll("g[data-dentes]").forEach(dentes);
  });
})();
