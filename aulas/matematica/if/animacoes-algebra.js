/* Animações do capítulo Álgebra (Matemática, IF/Sudeste).
   alg-balanca: a balança de 2x + 3 = 11 (tira 3 kg dos dois lados e divide por 2);
   alg-barras: x/2 + x/3 = 10 numa barra dividida em sextos;
   alg-delta: as raízes de x² − 4x + c = 0 se aproximam, se juntam e somem quando o delta fica negativo;
   alg-terreno: o terreno de largura x e comprimento x + 3 cresce até a área dar 40 m².
   Cada uma só roda no slide aberto, devagar, e respeita prefers-reduced-motion. */
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
  function ativo(box) { var s = box.closest(".slide"); return !s || s.classList.contains("ativo"); }
  function suave(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  /* Laço de quadros: para sozinho quando a figura é refeita (zera) ou o slide sai da tela. */
  function laco(box, e, f) {
    var t0 = null;
    function q(agora) {
      if (box._estado !== e || !ativo(box)) return;
      if (t0 === null) t0 = agora;
      if (f((agora - t0) / 1000) !== false) requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  }
  function registra(nome, monta, desenha, duracao, continua) {
    window.QuarksAnimacoes[nome] = {
      inicia: function (box) { box._estado = monta(box); desenha(box._estado, 0); },
      zera: function (box) { box._estado = monta(box); desenha(box._estado, 0); },
      roda: function (box, direto) {
        var e = box._estado = monta(box);
        if (direto || reduz()) { desenha(e, duracao, true); return; }
        laco(box, e, function (t) {
          desenha(e, continua ? t : Math.min(t, duracao));
          return continua || t < duracao;
        });
      }
    };
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
  }

  /* ---------------- Balança: 2x + 3 = 11 ---------------- */
  (function () {
    var CX = 520, PIVO = 150, BRACO = 330;
    function peso(pai, x, y) {
      var fora = el("g", {}, pai), g = el("g", { transform: "translate(" + x + " " + y + ")" }, fora);
      el("rect", { x: -26, y: -40, width: 52, height: 40, rx: 10, fill: "#FFD10C", stroke: "#C9A400", "stroke-width": "2" }, g);
      txt(g, 0, -13, "1", { "text-anchor": "middle", "font-size": "22", "font-weight": "800", fill: "#292B2C" });
      return fora;
    }
    function caixa(pai, x, y) {
      var fora = el("g", {}, pai), g = el("g", { transform: "translate(" + x + " " + y + ")" }, fora);
      el("rect", { x: -44, y: -84, width: 88, height: 84, rx: 14, fill: "var(--d-clara)", stroke: "var(--d)", "stroke-width": "4" }, g);
      txt(g, 0, -30, "x", { "text-anchor": "middle", "font-size": "44", "font-weight": "800", "font-style": "italic", fill: "var(--d-forte)" });
      return fora;
    }
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 1040 520", width: box.dataset.w || "1040", height: box.dataset.h || "520", style: "overflow:visible;" + FONTE }, box);
      el("path", { d: "M" + (CX - 120) + " 500 L" + (CX + 120) + " 500 L" + CX + " " + (PIVO + 16) + " Z", fill: "#E4DEFB", stroke: "#C9C0F0", "stroke-width": "3", "stroke-linejoin": "round" }, svg);
      var braco = el("g", {}, svg);
      el("rect", { x: CX - BRACO - 20, y: PIVO - 8, width: 2 * BRACO + 40, height: 16, rx: 8, fill: "#3F2FA0" }, braco);
      el("circle", { cx: CX, cy: PIVO, r: 16, fill: "#FFD10C", stroke: "#3F2FA0", "stroke-width": "4" }, svg);
      var pratos = [-1, 1].map(function (lado) {
        var g = el("g", {}, svg);
        el("path", { d: "M-120 0 L0 -150 L120 0", fill: "none", stroke: "#8C7BEA", "stroke-width": "3" }, g);
        el("path", { d: "M-150 0 Q0 46 150 0 Z", fill: "#fff", stroke: "#8C7BEA", "stroke-width": "4", "stroke-linejoin": "round" }, g);
        var carga = el("g", {}, g);
        return { lado: lado, g: g, carga: carga };
      });
      var esq = pratos[0], dir = pratos[1];
      var cx = [caixa(esq.carga, -58, -2), caixa(esq.carga, 50, -2)];
      var pe = [peso(esq.carga, 112, -2), peso(esq.carga, 112, -44), peso(esq.carga, 112, -86)];
      var pd = [], i;
      for (i = 0; i < 11; i++) {
        var col = i % 4, lin = Math.floor(i / 4);
        pd.push(peso(dir.carga, -84 + col * 56, -2 - lin * 42));
      }
      var rotulo = txt(svg, CX, 40, "2x + 3 = 11", { "text-anchor": "middle", "font-size": "44", "font-weight": "800", fill: "#3F2FA0" });
      var acao = txt(svg, CX, 92, "", { "text-anchor": "middle", "font-size": "30", "font-weight": "800", fill: "var(--d-forte)" });
      return { svg: svg, braco: braco, esq: esq, dir: dir, caixas: cx, pe: pe, pd: pd, rotulo: rotulo, acao: acao };
    }
    function desenha(e, t, fim) {
      var ang = fim ? 0 : 1.4 * Math.sin(t * 2 * Math.PI / 5);
      var r = ang * Math.PI / 180;
      e.braco.setAttribute("transform", "rotate(" + ang.toFixed(3) + " " + CX + " " + PIVO + ")");
      [e.esq, e.dir].forEach(function (p) {
        var x = CX + p.lado * BRACO * Math.cos(r), y = PIVO + p.lado * BRACO * Math.sin(r);
        p.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + (y + 150).toFixed(1) + ")");
      });
      // 2 s a 4 s: sobem e somem 3 pesos de cada lado
      var u = fim ? 1 : suave((t - 2) / 2);
      var some = [e.pe[0], e.pe[1], e.pe[2], e.pd[8], e.pd[9], e.pd[10]];
      some.forEach(function (g) { g.style.opacity = String(1 - u); g.style.transform = "translateY(" + (-70 * u) + "px)"; });
      // 5 s a 6,5 s: os 8 pesos se separam em dois grupos de 4, um para cada caixa
      var v = fim ? 1 : suave((t - 5) / 1.5);
      e.pd.slice(0, 8).forEach(function (g, i) {
        g.style.transform = "translateX(" + ((i % 4 < 2 ? -16 : 16) * v) + "px)";
      });
      e.caixas[0].style.transform = "translateX(" + (-10 * v) + "px)";
      e.caixas[1].style.transform = "translateX(" + (10 * v) + "px)";
      if (t < 2 && !fim) { e.rotulo.textContent = "2x + 3 = 11"; e.acao.textContent = ""; }
      else if (t < 5 && !fim) { e.rotulo.textContent = "2x = 8"; e.acao.textContent = "− 3 kg dos dois lados"; }
      else { e.rotulo.textContent = v >= 1 ? "x = 4" : "2x = 8"; e.acao.textContent = "÷ 2 dos dois lados"; }
    }
    registra("alg-balanca", monta, desenha, 7, true);
  })();

  /* ---------------- Barras: x/2 + x/3 = 10 ---------------- */
  (function () {
    var X0 = 60, L = 1080, Y = 200, H = 90, P = L / 6;
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 1200 470", width: box.dataset.w || "1200", height: box.dataset.h || "470", style: "overflow:visible;" + FONTE }, box);
      txt(svg, X0, Y - 120, "o número x", { "font-size": "30", "font-weight": "800", fill: "#3F2FA0" });
      el("rect", { x: X0, y: Y, width: L, height: H, rx: 18, fill: "#fff", stroke: "var(--d)", "stroke-width": "4" }, svg);
      var metade = el("rect", { x: X0, y: Y, width: 3 * P, height: H, rx: 18, fill: "var(--d)", opacity: "0" }, svg);
      var terco = el("rect", { x: X0 + 3 * P, y: Y, width: 2 * P, height: H, rx: 0, fill: "#FFD10C", opacity: "0" }, svg);
      var cortes = [];
      for (var i = 1; i < 6; i++) cortes.push(el("line", { x1: X0 + i * P, y1: Y, x2: X0 + i * P, y2: Y + H, stroke: "#8C7BEA", "stroke-width": "3", "stroke-dasharray": "8 6", opacity: "0" }, svg));
      var chaveM = el("g", { opacity: "0" }, svg);
      el("path", { d: "M" + (X0 + 6) + " " + (Y - 20) + " Q" + (X0 + 6) + " " + (Y - 44) + " " + (X0 + 40) + " " + (Y - 44) + " L" + (X0 + 1.5 * P - 20) + " " + (Y - 44) + " L" + (X0 + 1.5 * P) + " " + (Y - 64) + " L" + (X0 + 1.5 * P + 20) + " " + (Y - 44) + " L" + (X0 + 3 * P - 40) + " " + (Y - 44) + " Q" + (X0 + 3 * P - 6) + " " + (Y - 44) + " " + (X0 + 3 * P - 6) + " " + (Y - 20), fill: "none", stroke: "var(--d)", "stroke-width": "4", "stroke-linecap": "round" }, chaveM);
      txt(chaveM, X0 + 1.5 * P, Y - 80, "x/2: metade", { "text-anchor": "middle", "font-size": "30", "font-weight": "800", fill: "var(--d-forte)" });
      var chaveT = el("g", { opacity: "0" }, svg);
      el("path", { d: "M" + (X0 + 3 * P + 6) + " " + (Y + H + 20) + " Q" + (X0 + 3 * P + 6) + " " + (Y + H + 44) + " " + (X0 + 3 * P + 40) + " " + (Y + H + 44) + " L" + (X0 + 4 * P - 20) + " " + (Y + H + 44) + " L" + (X0 + 4 * P) + " " + (Y + H + 64) + " L" + (X0 + 4 * P + 20) + " " + (Y + H + 44) + " L" + (X0 + 5 * P - 40) + " " + (Y + H + 44) + " Q" + (X0 + 5 * P - 6) + " " + (Y + H + 44) + " " + (X0 + 5 * P - 6) + " " + (Y + H + 20), fill: "none", stroke: "#C9A400", "stroke-width": "4", "stroke-linecap": "round" }, chaveT);
      txt(chaveT, X0 + 4 * P, Y + H + 104, "x/3: um terço", { "text-anchor": "middle", "font-size": "30", "font-weight": "800", fill: "#8A6A00" });
      var nums = [];
      for (i = 0; i < 6; i++) nums.push(txt(svg, X0 + (i + .5) * P, Y + 60, "2", { "text-anchor": "middle", "font-size": "40", "font-weight": "800", fill: i < 3 ? "#fff" : (i < 5 ? "#292B2C" : "#3F2FA0"), opacity: "0" }));
      var soma = txt(svg, X0 + L, Y - 80, "", { "text-anchor": "end", "font-size": "34", "font-weight": "800", fill: "#3F2FA0" });
      var fim = txt(svg, X0, Y + H + 104, "", { "text-anchor": "start", "font-size": "34", "font-weight": "800", fill: "#3F2FA0" });
      return { metade: metade, terco: terco, cortes: cortes, chaveM: chaveM, chaveT: chaveT, nums: nums, soma: soma, fim: fim };
    }
    function desenha(e, t) {
      var a = suave(t / 1.2), b = suave((t - 1.5) / 1), c = suave((t - 3) / 1), d = suave((t - 4.6) / 1), f = suave((t - 6.2) / 1);
      e.cortes.forEach(function (l) { l.setAttribute("opacity", a); });
      e.metade.setAttribute("opacity", (.9 * b).toFixed(2)); e.chaveM.setAttribute("opacity", b);
      e.terco.setAttribute("opacity", (.9 * c).toFixed(2)); e.chaveT.setAttribute("opacity", c);
      e.soma.textContent = d > 0 ? "5 pedaços = 10" : "";
      e.soma.setAttribute("opacity", d);
      e.nums.forEach(function (n, i) { n.setAttribute("opacity", i < 5 ? d : f); });
      e.fim.textContent = f > 0 ? "6 pedaços: x = 12" : "";
      e.fim.setAttribute("opacity", f);
    }
    registra("alg-barras", monta, desenha, 7.4, false);
  })();

  /* ---------------- Delta: x² − 4x + c = 0 ---------------- */
  (function () {
    var X0 = 120, U = 150; // x = 0 em X0; 1 unidade = 150 px
    var CS = [0, 3, 4, 5], PASSO = 2.6;
    function px(x) { return X0 + x * U; }
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 1000 380", width: box.dataset.w || "1000", height: box.dataset.h || "380", style: "overflow:visible;" + FONTE }, box);
      var eq = txt(svg, 500, 50, "", { "text-anchor": "middle", "font-size": "46", "font-weight": "800", fill: "#3F2FA0" });
      var dl = txt(svg, 500, 110, "", { "text-anchor": "middle", "font-size": "36", "font-weight": "800", fill: "var(--d-forte)", style: "font-variant-numeric:tabular-nums" });
      el("line", { x1: 40, y1: 240, x2: 940, y2: 240, stroke: "#BFB6E6", "stroke-width": "5", "stroke-linecap": "round" }, svg);
      el("path", { d: "M928 228 L950 240 L928 252", fill: "none", stroke: "#BFB6E6", "stroke-width": "5", "stroke-linecap": "round" }, svg);
      for (var k = 0; k <= 5; k++) {
        el("line", { x1: px(k), y1: 228, x2: px(k), y2: 252, stroke: "#BFB6E6", "stroke-width": "4" }, svg);
        txt(svg, px(k), 290, String(k), { "text-anchor": "middle", "font-size": "28", "font-weight": "700", fill: "#5E5A70" });
      }
      var r1 = el("circle", { cx: px(0), cy: 240, r: 20, fill: "var(--d)", stroke: "#fff", "stroke-width": "5" }, svg);
      var r2 = el("circle", { cx: px(4), cy: 240, r: 20, fill: "#FFD10C", stroke: "#fff", "stroke-width": "5" }, svg);
      var aviso = txt(svg, 500, 350, "", { "text-anchor": "middle", "font-size": "32", "font-weight": "800", fill: "#3F2FA0" });
      return { eq: eq, dl: dl, r1: r1, r2: r2, aviso: aviso };
    }
    function raizes(c) { var D = 16 - 4 * c; return D >= 0 ? [2 - Math.sqrt(D) / 2, 2 + Math.sqrt(D) / 2] : null; }
    function desenha(e, t, fim) {
      var n = CS.length, ciclo = n * PASSO;
      var tt = fim ? (2 * PASSO + .1) : (t % ciclo);
      var i = Math.floor(tt / PASSO), u = suave((tt - i * PASSO) / 1.1);
      var c0 = CS[i];
      var D = 16 - 4 * c0;
      e.eq.textContent = "x² − 4x + " + c0 + " = 0";
      e.dl.textContent = "Δ = 16 − 4 · " + c0 + " = " + D;
      // posição das raízes: interpola do valor de c0 até c0 (fica parado) e só desliza na troca
      var prev = CS[(i - 1 + n) % n];
      var a = raizes(prev), b = raizes(c0);
      var w = (t < .01 || fim) ? 1 : u;
      var x1, x2, op;
      if (a && b) { x1 = a[0] + (b[0] - a[0]) * w; x2 = a[1] + (b[1] - a[1]) * w; op = 1; }
      else if (a && !b) { x1 = 2; x2 = 2; op = 1 - w; }
      else if (!a && b) { x1 = b[0]; x2 = b[1]; op = w; }
      else { x1 = 2; x2 = 2; op = 0; }
      e.r1.setAttribute("cx", px(x1)); e.r2.setAttribute("cx", px(x2));
      e.r1.setAttribute("opacity", op); e.r2.setAttribute("opacity", op);
      e.aviso.textContent = D > 0 ? "Δ > 0: duas raízes reais diferentes" : (D === 0 ? "Δ = 0: duas raízes iguais (uma só)" : "Δ < 0: nenhuma raiz real");
      e.aviso.setAttribute("fill", D < 0 ? "#C2384F" : "#3F2FA0");
    }
    registra("alg-delta", monta, desenha, 0, true);
  })();

  /* ---------------- Terreno: x(x + 3) = 40 ---------------- */
  (function () {
    var U = 52, OX = 60, OY = 400; // canto inferior esquerdo do terreno
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 800 470", width: box.dataset.w || "800", height: box.dataset.h || "470", style: "overflow:visible;" + FONTE }, box);
      var alvo = el("rect", { x: OX, y: OY - 5 * U, width: 8 * U, height: 5 * U, rx: 6, fill: "none", stroke: "#C9C0F0", "stroke-width": "3", "stroke-dasharray": "10 8" }, svg);
      var ret = el("rect", { x: OX, y: OY - U, width: 4 * U, height: U, rx: 6, fill: "var(--d-clara)", stroke: "var(--d)", "stroke-width": "4" }, svg);
      var lx = txt(svg, OX - 16, OY - U / 2 + 10, "x", { "text-anchor": "end", "font-size": "30", "font-weight": "800", fill: "var(--d-forte)" });
      var lc = txt(svg, OX + 2 * U, OY + 40, "x + 3", { "text-anchor": "middle", "font-size": "30", "font-weight": "800", fill: "var(--d-forte)" });
      var area = txt(svg, 640, 120, "", { "text-anchor": "start", "font-size": "34", "font-weight": "800", fill: "#3F2FA0", style: "font-variant-numeric:tabular-nums" });
      var conta = txt(svg, 640, 170, "", { "text-anchor": "start", "font-size": "30", "font-weight": "700", fill: "#5E5A70", style: "font-variant-numeric:tabular-nums" });
      void alvo;
      return { ret: ret, lx: lx, lc: lc, area: area, conta: conta };
    }
    function desenha(e, t, fim) {
      var x = fim ? 5 : Math.min(5, 1 + Math.floor(t / 1.4));
      var u = fim ? 1 : suave((t - (x - 1) * 1.4) / .8);
      var xa = x === 1 ? 1 : (x - 1) + u;
      var w = (xa + 3) * U, h = xa * U;
      e.ret.setAttribute("y", OY - h); e.ret.setAttribute("width", w); e.ret.setAttribute("height", h);
      e.lx.setAttribute("y", OY - h / 2 + 10); e.lx.textContent = "x = " + x;
      e.lc.setAttribute("x", OX + w / 2); e.lc.textContent = (x + 3) + " m";
      e.area.textContent = "área: " + x * (x + 3) + " m²";
      e.conta.textContent = x + " · " + (x + 3) + " = " + x * (x + 3);
      var ok = x === 5;
      e.ret.setAttribute("fill", ok ? "#E3F6EC" : "var(--d-clara)");
      e.ret.setAttribute("stroke", ok ? "#1F9D62" : "var(--d)");
      e.area.setAttribute("fill", ok ? "#1F9D62" : "#3F2FA0");
    }
    registra("alg-terreno", monta, desenha, 6.6, false);
  })();
})();
