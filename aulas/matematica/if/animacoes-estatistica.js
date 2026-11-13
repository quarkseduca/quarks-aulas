/* Animações de Estatística e probabilidade (Matemática, IF).
   Só se movem na tela aberta e depois que a figura aparece; lentas; paradas com prefers-reduced-motion
   (aí a figura já aparece no estado final).
   - "estat-contagem"  as 40 respostas ("Como você vem para a escola?") saem do monte, uma de cada vez, e vão para a
                       linha da sua categoria; o contador de cada linha sobe até a frequência absoluta (18, 10, 8 e 4).
   - "estat-ordena"    os 7 tempos até a escola (12, 25, 8, 18, 30, 10, 15) deslizam para a ordem crescente; o do meio
                       (15) acende como mediana, com 3 valores de cada lado. O 18, que estava no meio da lista
                       original, fica marcado de leve: ele não é a mediana. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = "Figtree,'Segoe UI',sans-serif";
  var TITULO = "'Bricolage Grotesque'," + FONTE;
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
  /* laço comum: monta, desenha o quadro t (undefined = estado inicial; Infinity = final) */
  function laco(monta, quadro, duracao) {
    function prepara(box) {
      box._vez = (box._vez || 0) + 1;
      box.innerHTML = "";
      box._est = monta(box);
      quadro(box._est, 0);
    }
    return {
      inicia: prepara, zera: prepara,
      roda: function (box) {
        prepara(box);
        if (reduz()) { quadro(box._est, duracao); return; }
        var vez = box._vez, t0 = null;
        function passo(agora) {
          if (box._vez !== vez) return;
          if (t0 === null) t0 = agora;
          var t = (agora - t0) / 1000;
          quadro(box._est, Math.min(t, duracao));
          if (t < duracao) requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
      }
    };
  }

  /* ---------- Contagem das respostas ---------- */
  var CATS = [
    { nome: "ônibus", n: 18, cor: "#2F6BFF" },
    { nome: "a pé", n: 10, cor: "#6551D1" },
    { nome: "carro", n: 8, cor: "#0F8B8D" },
    { nome: "bicicleta", n: 4, cor: "#E0A800" }
  ];
  var ORDEM = (function () { // ordem fixa e "embaralhada" das 40 respostas
    var lista = [], r = 7;
    CATS.forEach(function (c, i) { for (var j = 0; j < c.n; j++) lista.push(i); });
    for (var k = lista.length - 1; k > 0; k--) { r = (r * 37 + 11) % 101; var m = r % (k + 1); var x = lista[k]; lista[k] = lista[m]; lista[m] = x; }
    return lista;
  })();
  var INTERVALO = 0.24, VIAGEM = 0.9;
  var DUR_CONTA = ORDEM.length * INTERVALO + VIAGEM + 0.2;

  window.QuarksAnimacoes["estat-contagem"] = laco(function (box) {
    var svg = el("svg", { viewBox: "0 0 1120 470", width: "1120", height: "470", style: "overflow:visible" }, box);
    var e = { fichas: [], cont: [], chegou: [] };
    el("rect", { x: 0, y: 30, width: 330, height: 220, rx: 26, fill: "#fff", stroke: "#E4DEFB", "stroke-width": 2 }, svg);
    txt(svg, 165, 290, "as 40 respostas", { "font-size": 26, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle" });
    CATS.forEach(function (c, i) {
      var y = 60 + i * 105;
      txt(svg, 400, y + 10, c.nome, { "font-size": 32, "font-weight": 800, fill: "#3F2FA0" });
      el("line", { x1: 560, y1: y + 22, x2: 1000, y2: y + 22, stroke: "#E4DEFB", "stroke-width": 3 }, svg);
      e.cont.push(txt(svg, 1110, y + 14, "0", { "font-size": 46, "font-weight": 800, fill: c.cor, "text-anchor": "end", "font-family": TITULO, style: "font-variant-numeric:tabular-nums" }));
    });
    var usados = [0, 0, 0, 0];
    ORDEM.forEach(function (cat, k) {
      var x0 = 40 + (k % 8) * 36, y0 = 62 + Math.floor(k / 8) * 38;
      var x1 = 572 + usados[cat] * 23, y1 = 60 + cat * 105;
      usados[cat]++;
      var f = el("circle", { cx: x0, cy: y0, r: 13, fill: CATS[cat].cor, stroke: "#fff", "stroke-width": 2 }, svg);
      e.fichas.push({ el: f, x0: x0, y0: y0, x1: x1, y1: y1, cat: cat, t: k * INTERVALO });
    });
    return e;
  }, function (e, t) {
    var conta = [0, 0, 0, 0];
    e.fichas.forEach(function (f) {
      var x = suave((t - f.t) / VIAGEM);
      var cx = f.x0 + (f.x1 - f.x0) * x, cy = f.y0 + (f.y1 - f.y0) * x - Math.sin(Math.PI * x) * 60;
      f.el.setAttribute("cx", cx.toFixed(1)); f.el.setAttribute("cy", cy.toFixed(1));
      if (x >= 1) conta[f.cat]++;
    });
    e.cont.forEach(function (c, i) { c.textContent = conta[i]; });
  }, DUR_CONTA);

  /* ---------- Ordenar para achar a mediana ---------- */
  var VALORES = [12, 25, 8, 18, 30, 10, 15];
  var DUR_ORD = 5.2;
  window.QuarksAnimacoes["estat-ordena"] = laco(function (box) {
    var svg = el("svg", { viewBox: "0 0 1120 300", width: "1120", height: "300", style: "overflow:visible" }, box);
    var e = { cartas: [] };
    var ordem = VALORES.map(function (v, i) { return i; }).sort(function (a, b) { return VALORES[a] - VALORES[b]; });
    e.chave = el("path", { d: "M70 250 Q70 272 92 272 H1030 Q1052 272 1052 250", fill: "none", stroke: "#C9C0F0", "stroke-width": 3, opacity: 0 }, svg);
    e.rotulo = txt(svg, 560, 236, "3 valores  ·  mediana  ·  3 valores", { "font-size": 26, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle", opacity: 0 });
    VALORES.forEach(function (v, i) {
      var g = el("g", {}, svg);
      var fundo = el("rect", { x: -62, y: -70, width: 124, height: 140, rx: 24, fill: "#fff", stroke: "#DCD6F3", "stroke-width": 3 }, g);
      txt(g, 0, 18, String(v), { "font-size": 58, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "middle", "font-family": TITULO });
      e.cartas.push({ g: g, fundo: fundo, de: 80 + i * 160, para: 80 + ordem.indexOf(i) * 160, v: v, meioAntes: i === 3, meioDepois: ordem.indexOf(i) === 3 });
    });
    return e;
  }, function (e, t) {
    var x = suave((t - 0.8) / 2.6), luz = suave((t - 3.6) / 1);
    e.cartas.forEach(function (c, k) {
      var px = c.de + (c.para - c.de) * x;
      var py = 110 - Math.sin(Math.PI * x) * (k % 2 ? 26 : -26);
      c.g.setAttribute("transform", "translate(" + px.toFixed(1) + " " + py.toFixed(1) + ")");
      if (c.meioDepois) {
        c.fundo.setAttribute("fill", luz > 0.5 ? "#FFD10C" : "#fff");
        c.fundo.setAttribute("stroke", luz > 0.5 ? "#E0A800" : "#DCD6F3");
        c.g.setAttribute("opacity", 1);
      } else {
        c.g.setAttribute("opacity", (1 - 0.35 * luz).toFixed(2));
      }
      if (c.meioAntes) c.fundo.setAttribute("stroke-dasharray", x < 0.05 ? "10 8" : "none");
    });
    e.chave.setAttribute("opacity", luz.toFixed(2));
    e.rotulo.setAttribute("opacity", luz.toFixed(2));
  }, DUR_ORD);

  document.addEventListener("DOMContentLoaded", function () {
    ["estat-contagem", "estat-ordena"].forEach(function (n) {
      document.querySelectorAll('[data-anima="' + n + '"]').forEach(function (b) { window.QuarksAnimacoes[n].inicia(b); });
    });
  });
})();
