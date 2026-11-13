/* Animações de Geometria plana (Matemática, IF): polígonos regulares, circunferência e círculo, perímetros e áreas.
   Cada animação mostra o conteúdo: as diagonais que dividem o polígono, a corda que se afasta do centro, a reta que
   passa de secante a externa, o ângulo inscrito que não muda, a roda que desenrola o pi, as fatias da pizza que viram
   quase um retângulo. Só rodam no slide aberto e depois do clique que as mostra; com "reduzir movimento", ficam paradas. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = "font-family:Figtree,'Segoe UI',sans-serif";
  var COR = { d: "#2F6BFF", forte: "#1E4FD8", clara: "#E8F0FF", roxo: "#6551D1", titulo: "#3F2FA0", lilas: "#F1EEFD",
              lilas2: "#E4DEFB", linha: "#BFB6E6", amarelo: "#FFD10C", carvao: "#292B2C", cinza: "#5E5A70" };

  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) {
    var t = el("text", Object.assign({ x: x, y: y, "font-weight": "800", "font-size": "30", fill: COR.titulo }, at || {}), pai);
    t.textContent = s;
    return t;
  }
  function reduz() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function arco(cx, cy, r, a1, a2) { // ângulos em graus, sentido anti-horário na tela (y para cima)
    var p1 = [cx + r * Math.cos(a1 * Math.PI / 180), cy - r * Math.sin(a1 * Math.PI / 180)];
    var p2 = [cx + r * Math.cos(a2 * Math.PI / 180), cy - r * Math.sin(a2 * Math.PI / 180)];
    var grande = ((a2 - a1) % 360 + 360) % 360 > 180 ? 1 : 0;
    return "M" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " A" + r + " " + r + " 0 " + grande + " 0 " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
  }
  function pt(cx, cy, r, a) { return [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)]; }

  /* Fábrica: monta(box) devolve o estado; desenha(estado, t em segundos); fim = instante mostrado parado (sem movimento). */
  function laco(nome, monta, desenha, fim) {
    window.QuarksAnimacoes[nome] = {
      inicia: function (box) { box._estado = monta(box); desenha(box._estado, 0); },
      zera: function (box) { box._estado = monta(box); desenha(box._estado, 0); },
      roda: function (box) {
        var e = box._estado = monta(box);
        if (reduz()) { desenha(e, fim); return; }
        var t0 = null;
        function quadro(agora) {
          if (box._estado !== e) return;
          if (t0 === null) t0 = agora;
          desenha(e, (agora - t0) / 1000);
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
  }
  function tela(box, w, h) {
    box.innerHTML = "";
    return el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, style: "display:block;overflow:visible;" + FONTE }, box);
  }

  /* 1. Diagonais de um vértice dividem o polígono em n − 2 triângulos (n = 3 a 8, um de cada vez). */
  var NOMES = { 3: "triângulo", 4: "quadrilátero", 5: "pentágono", 6: "hexágono", 7: "heptágono", 8: "octógono" };
  var PASSO_N = 5.2;
  laco("geob-diagonais", function (box) {
    var svg = tela(box, 520, 560);
    return { svg: svg, n: 0, g: null };
  }, function (e, t) {
    var k = Math.floor(t / PASSO_N) % 6, n = 3 + k, tl = t - Math.floor(t / PASSO_N) * PASSO_N;
    if (e.n !== n) {
      e.n = n;
      if (e.g) e.g.remove();
      var g = e.g = el("g", {}, e.svg), cx = 260, cy = 250, R = 200, vs = [];
      for (var i = 0; i < n; i++) vs.push(pt(cx, cy, R, 90 + 360 * i / n));
      e.tris = [];
      for (var j = 1; j < n - 1; j++) {
        var tri = el("path", { d: "M" + vs[0] + " L" + vs[j] + " L" + vs[j + 1] + " Z", fill: j % 2 ? COR.clara : "#FFF4C2", opacity: "0" }, g);
        e.tris.push(tri);
      }
      el("path", { d: "M" + vs.join(" L") + " Z", fill: "none", stroke: COR.d, "stroke-width": "6", "stroke-linejoin": "round" }, g);
      e.diags = [];
      for (j = 2; j < n - 1; j++) {
        var L = Math.hypot(vs[j][0] - vs[0][0], vs[j][1] - vs[0][1]);
        e.diags.push({ l: el("line", { x1: vs[0][0], y1: vs[0][1], x2: vs[j][0], y2: vs[j][1], stroke: COR.titulo, "stroke-width": "4", "stroke-dasharray": L, "stroke-dashoffset": L }, g), L: L });
      }
      el("circle", { cx: vs[0][0], cy: vs[0][1], r: "12", fill: COR.amarelo, stroke: "#fff", "stroke-width": "4" }, g);
      e.nums = e.tris.map(function (tr, i2) {
        var a = vs[0], b = vs[i2 + 1], c = vs[i2 + 2];
        return txt(g, (a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3 + 10, String(i2 + 1), { "text-anchor": "middle", opacity: "0", "font-size": "30", fill: COR.forte });
      });
      e.nome = txt(g, 260, 510, NOMES[n] + " · " + n + " lados", { "text-anchor": "middle", "font-size": "32", fill: COR.titulo });
      e.conta = txt(g, 260, 552, (n - 2) + (n === 3 ? " triângulo" : " triângulos") + " · S = " + (n - 2) + " · 180° = " + ((n - 2) * 180) + "°", { "text-anchor": "middle", "font-size": "28", fill: COR.forte, opacity: "0" });
    }
    e.diags.forEach(function (d, i) { d.l.setAttribute("stroke-dashoffset", d.L * (1 - suave((tl - 0.5 - i * 0.6) / 0.6))); });
    var t2 = 0.6 + e.diags.length * 0.6;
    e.tris.forEach(function (tr, i) { var o = suave((tl - t2 - i * 0.35) / 0.4); tr.setAttribute("opacity", o); e.nums[i].setAttribute("opacity", o); });
    e.conta.setAttribute("opacity", suave((tl - t2 - e.tris.length * 0.35 - 0.2) / 0.4));
  }, 3 * PASSO_N + 4.9);

  /* 2. A corda sobe e desce: a perpendicular do centro sempre a corta no meio; no centro ela vira o diâmetro. */
  laco("geob-corda", function (box) {
    var svg = tela(box, 560, 520), cx = 280, cy = 260, R = 210;
    el("circle", { cx: cx, cy: cy, r: R, fill: "#fff", stroke: COR.d, "stroke-width": "6" }, svg);
    var tri = el("path", { fill: "#FFF4C2", stroke: "none" }, svg);
    var corda = el("line", { stroke: COR.titulo, "stroke-width": "7", "stroke-linecap": "round" }, svg);
    var perp = el("line", { stroke: COR.cinza, "stroke-width": "4", "stroke-dasharray": "10 8" }, svg);
    var raio = el("line", { stroke: COR.forte, "stroke-width": "5" }, svg);
    var reto = el("path", { fill: "none", stroke: COR.cinza, "stroke-width": "3" }, svg);
    var meio = el("circle", { r: "8", fill: COR.amarelo, stroke: "#fff", "stroke-width": "3" }, svg);
    el("circle", { cx: cx, cy: cy, r: "8", fill: COR.carvao }, svg);
    txt(svg, cx - 30, cy + 10, "O", { "font-size": "28", fill: COR.carvao, "text-anchor": "end" });
    var lr = txt(svg, 0, 0, "r", { "font-size": "34", fill: COR.forte, "font-style": "italic" });
    var ld = txt(svg, 0, 0, "d", { "font-size": "34", fill: COR.cinza, "font-style": "italic" });
    var lm = txt(svg, 0, 0, "metade", { "font-size": "24", fill: COR.titulo, "text-anchor": "middle" });
    var diam = txt(svg, cx, cy + R + 50, "", { "font-size": "28", fill: COR.forte, "text-anchor": "middle" });
    return { cx: cx, cy: cy, R: R, tri: tri, corda: corda, perp: perp, raio: raio, reto: reto, meio: meio, lr: lr, ld: ld, lm: lm, diam: diam };
  }, function (e, t) {
    var d = 150 * Math.cos(2 * Math.PI * t / 9), y = e.cy - d, h = Math.sqrt(e.R * e.R - d * d);
    var x1 = e.cx - h, x2 = e.cx + h;
    e.corda.setAttribute("x1", x1); e.corda.setAttribute("x2", x2); e.corda.setAttribute("y1", y); e.corda.setAttribute("y2", y);
    e.perp.setAttribute("x1", e.cx); e.perp.setAttribute("y1", e.cy); e.perp.setAttribute("x2", e.cx); e.perp.setAttribute("y2", y);
    e.raio.setAttribute("x1", e.cx); e.raio.setAttribute("y1", e.cy); e.raio.setAttribute("x2", x2); e.raio.setAttribute("y2", y);
    e.tri.setAttribute("d", "M" + e.cx + " " + e.cy + " L" + e.cx + " " + y + " L" + x2 + " " + y + " Z");
    e.meio.setAttribute("cx", e.cx); e.meio.setAttribute("cy", y);
    var s = d > 0 ? 1 : -1, q = 18;
    e.reto.setAttribute("d", Math.abs(d) > 30 ? "M" + (e.cx + q) + " " + y + " V" + (y + s * q) + " H" + e.cx : "");
    var perto = Math.abs(d) < 14;
    e.lr.setAttribute("x", (e.cx + x2) / 2 + 6); e.lr.setAttribute("y", (e.cy + y) / 2 + (d > 0 ? 34 : -14));
    e.ld.setAttribute("x", e.cx - 34); e.ld.setAttribute("y", (e.cy + y) / 2 + 12); e.ld.setAttribute("opacity", Math.abs(d) > 40 ? 1 : 0);
    e.lm.setAttribute("x", (e.cx + x2) / 2); e.lm.setAttribute("y", y + (d > 0 ? -16 : 34)); e.lm.setAttribute("opacity", perto ? 0 : 1);
    e.diam.textContent = perto ? "passou pelo centro: diâmetro, a maior corda" : "";
    e.tri.setAttribute("opacity", perto ? 0 : 1);
  }, 1.1);

  /* 3. Reta e circunferência: secante, tangente e externa, conforme a distância d do centro. */
  var PARADAS_R = [{ d: 70, n: "d < r · secante · 2 pontos" }, { d: 160, n: "d = r · tangente · 1 ponto" }, { d: 225, n: "d > r · externa · nenhum ponto" }];
  laco("geob-reta", function (box) {
    var svg = tela(box, 760, 520), cx = 300, cy = 270, R = 160;
    el("circle", { cx: cx, cy: cy, r: R, fill: COR.clara, stroke: COR.d, "stroke-width": "6" }, svg);
    var dl = el("line", { x1: cx, y1: cy, stroke: COR.cinza, "stroke-width": "4", "stroke-dasharray": "10 8" }, svg);
    var reta = el("line", { x1: 20, x2: 740, stroke: COR.titulo, "stroke-width": "6", "stroke-linecap": "round" }, svg);
    var p1 = el("circle", { r: "11", fill: COR.amarelo, stroke: COR.carvao, "stroke-width": "3" }, svg);
    var p2 = el("circle", { r: "11", fill: COR.amarelo, stroke: COR.carvao, "stroke-width": "3" }, svg);
    el("circle", { cx: cx, cy: cy, r: "8", fill: COR.carvao }, svg);
    var rl = el("line", { x1: cx, y1: cy, x2: cx + R * 0.71, y2: cy + R * 0.71, stroke: COR.forte, "stroke-width": "4" }, svg);
    txt(svg, cx + R * 0.42, cy + R * 0.32, "r", { "font-size": "32", fill: COR.forte, "font-style": "italic" });
    var ld = txt(svg, cx + 14, cy, "d", { "font-size": "32", fill: COR.cinza, "font-style": "italic" });
    var est = txt(svg, 300, 505, "", { "font-size": "32", "text-anchor": "middle", fill: COR.titulo });
    return { cx: cx, cy: cy, R: R, dl: dl, reta: reta, p1: p1, p2: p2, ld: ld, est: est, rl: rl };
  }, function (e, t) {
    var ciclo = 3 * 3.2, u = t % ciclo, k = Math.floor(u / 3.2), f = u - k * 3.2;
    var a = PARADAS_R[k].d, b = PARADAS_R[(k + 1) % 3].d;
    var d = f < 2.2 ? a : a + (b - a) * suave((f - 2.2) / 1);
    var y = e.cy - d;
    e.reta.setAttribute("y1", y); e.reta.setAttribute("y2", y);
    e.dl.setAttribute("x2", e.cx); e.dl.setAttribute("y2", y);
    e.ld.setAttribute("y", e.cy - d / 2 + 10);
    var h2 = e.R * e.R - d * d;
    if (h2 >= -1 && Math.abs(d - e.R) < 3) { e.p1.setAttribute("cx", e.cx); e.p1.setAttribute("cy", y); e.p1.setAttribute("opacity", 1); e.p2.setAttribute("opacity", 0); }
    else if (h2 > 0) { var h = Math.sqrt(h2); e.p1.setAttribute("cx", e.cx - h); e.p2.setAttribute("cx", e.cx + h); e.p1.setAttribute("cy", y); e.p2.setAttribute("cy", y); e.p1.setAttribute("opacity", 1); e.p2.setAttribute("opacity", 1); }
    else { e.p1.setAttribute("opacity", 0); e.p2.setAttribute("opacity", 0); }
    e.est.textContent = f < 2.2 ? PARADAS_R[k].n : "";
  }, 3.2 + 0.5);

  /* 4. Duas circunferências: a pequena se aproxima da grande e passa por todas as posições. */
  var PARADAS_C = [{ d: 330, n: "d > R + r · externas" }, { d: 220, n: "d = R + r · tangentes externas" }, { d: 140, n: "R − r < d < R + r · secantes" },
                   { d: 60, n: "d = R − r · tangentes internas" }, { d: 28, n: "d < R − r · uma dentro da outra" }, { d: 0, n: "d = 0 · concêntricas" }];
  laco("geob-duas", function (box) {
    var svg = tela(box, 860, 400), cx = 300, cy = 220, R = 140, r = 80;
    el("circle", { cx: cx, cy: cy, r: R, fill: "none", stroke: COR.d, "stroke-width": "6" }, svg);
    el("circle", { cx: cx, cy: cy, r: "7", fill: COR.d }, svg);
    var g = el("g", {}, svg);
    el("circle", { cx: 0, cy: 0, r: r, fill: "rgba(101,81,209,.12)", stroke: COR.roxo, "stroke-width": "6" }, g);
    el("circle", { cx: 0, cy: 0, r: "7", fill: COR.roxo }, g);
    var dl = el("line", { y1: cy + 10, y2: cy + 10, x1: cx, stroke: COR.carvao, "stroke-width": "3" }, svg);
    var est = txt(svg, 430, 30, "", { "font-size": "30", "text-anchor": "middle", fill: COR.titulo });
    return { cx: cx, cy: cy, g: g, dl: dl, est: est };
  }, function (e, t) {
    var P = PARADAS_C, ciclo = P.length * 3, u = t % ciclo, k = Math.floor(u / 3), f = u - k * 3;
    var a = P[k].d, b = P[(k + 1) % P.length].d;
    var d = f < 2.1 ? a : a + (b - a) * suave((f - 2.1) / 0.9);
    e.g.setAttribute("transform", "translate(" + (e.cx + d) + " " + e.cy + ")");
    e.dl.setAttribute("x2", e.cx + d); e.dl.setAttribute("opacity", d > 4 ? 1 : 0);
    e.est.textContent = f < 2.1 ? P[k].n : "";
  }, 1 * 3 + 0.5);

  /* 5. Ângulo inscrito: o vértice P anda pela circunferência e o ângulo continua sendo metade do central.
        modo "semi": AB é diâmetro e o ângulo em P continua reto. */
  laco("geob-inscrito", function (box) {
    var semi = box.dataset.modo === "semi";
    var svg = tela(box, 560, 560), cx = 280, cy = 280, R = 220;
    var aA = semi ? 180 : 220, aB = semi ? 0 : 320; // arco AB de baixo: 100° (de 220° a 320°) ou o diâmetro
    el("circle", { cx: cx, cy: cy, r: R, fill: "#fff", stroke: COR.linha, "stroke-width": "5" }, svg);
    el("path", { d: arco(cx, cy, R, aA, aB), fill: "none", stroke: COR.d, "stroke-width": "10", "stroke-linecap": "round" }, svg);
    var A = pt(cx, cy, R, aA), B = pt(cx, cy, R, aB);
    if (!semi) {
      el("path", { d: "M" + A + " L" + cx + " " + cy + " L" + B, fill: "none", stroke: COR.roxo, "stroke-width": "4", "stroke-dasharray": "10 8" }, svg);
      el("path", { d: arco(cx, cy, 46, 220, 320), fill: "none", stroke: COR.roxo, "stroke-width": "4" }, svg);
      txt(svg, cx, cy + 92, "100°", { "text-anchor": "middle", "font-size": "28", fill: COR.roxo });
      txt(svg, cx, cy + R + 50, "arco AB = 100°", { "text-anchor": "middle", "font-size": "28", fill: COR.forte });
    } else {
      el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: COR.d, "stroke-width": "5" }, svg);
      txt(svg, cx, cy + 40, "diâmetro: arco de 180°", { "text-anchor": "middle", "font-size": "26", fill: COR.forte });
    }
    el("circle", { cx: cx, cy: cy, r: "7", fill: COR.carvao }, svg);
    var lados = el("path", { fill: "rgba(255,209,12,.22)", stroke: COR.titulo, "stroke-width": "5", "stroke-linejoin": "round" }, svg);
    var marca = el("path", { fill: "none", stroke: COR.amarelo, "stroke-width": "6" }, svg);
    var P = el("circle", { r: "11", fill: COR.amarelo, stroke: COR.carvao, "stroke-width": "3" }, svg);
    var val = txt(svg, 0, 0, semi ? "90°" : "50°", { "text-anchor": "middle", "font-size": "30", fill: COR.carvao });
    [[A, "A"], [B, "B"]].forEach(function (q) { txt(svg, q[0][0] + (q[0][0] < cx ? -22 : 22), q[0][1] + 34, q[1], { "text-anchor": "middle", "font-size": "28", fill: COR.carvao }); });
    el("circle", { cx: A[0], cy: A[1], r: "8", fill: COR.carvao }, svg); el("circle", { cx: B[0], cy: B[1], r: "8", fill: COR.carvao }, svg);
    return { semi: semi, cx: cx, cy: cy, R: R, A: A, B: B, lados: lados, marca: marca, P: P, val: val };
  }, function (e, t) {
    var ap = e.semi ? 90 + 60 * Math.sin(2 * Math.PI * t / 12) : 90 + 65 * Math.sin(2 * Math.PI * t / 12);
    var P = pt(e.cx, e.cy, e.R, ap);
    e.P.setAttribute("cx", P[0]); e.P.setAttribute("cy", P[1]);
    e.lados.setAttribute("d", "M" + e.A + " L" + P + " L" + e.B);
    var ua = Math.atan2(e.A[1] - P[1], e.A[0] - P[0]), ub = Math.atan2(e.B[1] - P[1], e.B[0] - P[0]), m = 40;
    if (e.semi) {
      var q1 = [P[0] + m * 0.7 * Math.cos(ua), P[1] + m * 0.7 * Math.sin(ua)], q2 = [P[0] + m * 0.7 * Math.cos(ub), P[1] + m * 0.7 * Math.sin(ub)];
      e.marca.setAttribute("d", "M" + q1 + " L" + (q1[0] + q2[0] - P[0]) + " " + (q1[1] + q2[1] - P[1]) + " L" + q2);
    } else {
      var dif = Math.atan2(Math.sin(ub - ua), Math.cos(ub - ua));
      e.marca.setAttribute("d", "M" + (P[0] + m * Math.cos(ua)) + " " + (P[1] + m * Math.sin(ua)) + " A" + m + " " + m + " 0 0 " + (dif > 0 ? 1 : 0) + " " + (P[0] + m * Math.cos(ub)) + " " + (P[1] + m * Math.sin(ub)));
    }
    var mx = Math.cos(ua) + Math.cos(ub), my = Math.sin(ua) + Math.sin(ub), mn = Math.hypot(mx, my) || 1;
    e.val.setAttribute("x", P[0] + 84 * mx / mn); e.val.setAttribute("y", P[1] + 84 * my / mn + 10);
  }, 0);

  /* 6. A roda desenrola: uma volta inteira mede um pouco mais de 3 diâmetros (π · d). */
  laco("geob-pi", function (box) {
    var svg = tela(box, 1100, 330), r = 70, x0 = 110, chao = 250, C = 2 * Math.PI * r;
    el("line", { x1: 20, y1: chao, x2: 1080, y2: chao, stroke: COR.linha, "stroke-width": "5", "stroke-linecap": "round" }, svg);
    var trilho = el("line", { x1: x0, y1: chao, x2: x0, y2: chao, stroke: COR.d, "stroke-width": "10", "stroke-linecap": "round" }, svg);
    var diams = el("g", { opacity: "0" }, svg);
    for (var i = 0; i < 3; i++) {
      el("rect", { x: x0 + i * 2 * r + 3, y: chao + 18, width: 2 * r - 6, height: 18, rx: 9, fill: i % 2 ? COR.roxo : COR.amarelo }, diams);
      txt(diams, x0 + i * 2 * r + r, chao + 68, "d", { "text-anchor": "middle", "font-size": "28", "font-style": "italic", fill: COR.titulo });
    }
    el("rect", { x: x0 + 6 * r + 3, y: chao + 18, width: C - 6 * r - 6, height: 18, rx: 6, fill: "#F59BB4" }, diams);
    txt(diams, 20, 40, "3 diâmetros e mais um pouquinho: C = π · d ≈ 3,14 · d", { "font-size": "30", fill: COR.forte });
    var roda = el("g", {}, svg);
    el("circle", { cx: 0, cy: 0, r: r, fill: COR.clara, stroke: COR.d, "stroke-width": "8" }, roda);
    el("line", { x1: -r, y1: 0, x2: r, y2: 0, stroke: COR.titulo, "stroke-width": "4" }, roda);
    el("circle", { cx: 0, cy: 0, r: "7", fill: COR.carvao }, roda);
    el("circle", { cx: 0, cy: r, r: "11", fill: COR.amarelo, stroke: COR.carvao, "stroke-width": "3" }, roda);
    return { r: r, x0: x0, chao: chao, C: C, trilho: trilho, diams: diams, roda: roda };
  }, function (e, t) {
    var u = t % 10, f = suave((u - 0.6) / 5.6), sai = u > 9.2 ? suave((u - 9.2) / 0.6) : 0;
    var x = e.x0 + e.C * f, ang = 360 * f;
    e.roda.setAttribute("transform", "translate(" + x + " " + (e.chao - e.r) + ") rotate(" + ang + ")");
    e.roda.setAttribute("opacity", 1 - sai);
    e.trilho.setAttribute("x2", x); e.trilho.setAttribute("opacity", 1 - sai);
    e.diams.setAttribute("opacity", suave((u - 6.4) / 0.6) * (1 - sai));
  }, 7.4);

  /* 7. A pizza fatiada vira quase um retângulo de altura r e base πr (meia circunferência). */
  var FATIAS = 16;
  laco("geob-pizza", function (box) {
    var svg = tela(box, 1060, 420), r = 150, th = 360 / FATIAS, w = 2 * Math.PI * r / FATIAS;
    var lado = "M0 0 L" + (r * Math.sin(th / 2 * Math.PI / 180)).toFixed(2) + " " + (r * Math.cos(th / 2 * Math.PI / 180)).toFixed(2) +
               " A" + r + " " + r + " 0 0 1 " + (-r * Math.sin(th / 2 * Math.PI / 180)).toFixed(2) + " " + (r * Math.cos(th / 2 * Math.PI / 180)).toFixed(2) + " Z";
    var fs = [];
    for (var i = 0; i < FATIAS; i++) fs.push(el("path", { d: lado, fill: i % 2 ? "#FFE58A" : "#FFC94D", stroke: "#E8A33A", "stroke-width": "2", "stroke-linejoin": "round" }, svg));
    var cotas = el("g", { opacity: "0" }, svg);
    var xs = 380, ys = 110, base = Math.PI * r;
    el("path", { d: "M" + (xs - w / 2) + " " + (ys + r + 30) + " H" + (xs - w / 2 + base + w / 2), stroke: COR.forte, "stroke-width": "4", fill: "none" }, cotas);
    txt(cotas, xs + base / 2, ys + r + 72, "base ≈ meia circunferência = π · r", { "text-anchor": "middle", "font-size": "28", fill: COR.forte });
    el("path", { d: "M" + (xs + base + 30) + " " + ys + " V" + (ys + r), stroke: COR.forte, "stroke-width": "4", fill: "none" }, cotas);
    txt(cotas, xs + base + 44, ys + r / 2 + 10, "altura = r", { "font-size": "28", fill: COR.forte });
    return { fs: fs, r: r, th: th, w: w, xs: xs, ys: ys, cx: 180, cy: 210, cotas: cotas };
  }, function (e, t) {
    var u = t % 9, f = u < 1.5 ? 0 : u < 4.5 ? suave((u - 1.5) / 3) : u < 7.5 ? 1 : 1 - suave((u - 7.5) / 1.5);
    e.fs.forEach(function (p, i) {
      var a0 = i * e.th, x0 = e.cx, y0 = e.cy;                    // no círculo: ponta no centro
      var cima = i % 2 === 0, a1 = cima ? 0 : 180;                  // na fileira: alternando para cima e para baixo
      var x1 = e.xs + i * e.w / 2, y1 = cima ? e.ys : e.ys + e.r;
      var da = ((a1 - a0) % 360 + 540) % 360 - 180;
      var a = a0 + da * f, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
      p.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + a.toFixed(1) + ")");
    });
    e.cotas.setAttribute("opacity", u > 4.5 && u < 7.5 ? suave((u - 4.5) / 0.6) : 0);
  }, 6);
})();
