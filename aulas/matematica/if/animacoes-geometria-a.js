/* Animações de Geometria plana, primeira metade (Matemática, IF): ângulos, paralelas, triângulos, Tales, semelhança e Pitágoras.
   Regra: só se movem na tela aberta (.slide.ativo) e depois que a figura aparece (data-anima-passo).
   Com prefers-reduced-motion, cada figura fica parada no quadro que mostra o conteúdo.
   - angulo-abre: um lado do ângulo abre devagar e o nome muda (agudo, reto, obtuso, raso).
   - euclides-gira: uma reta gira em torno de P; ela sempre corta r, menos numa posição: a única paralela.
   - transversal: a transversal balança devagar; os oito ângulos mudam, mas só existem duas medidas (a e b, com a + b = 180°).
   - triangulo-180: os ângulos A e B viajam até C e, junto com C, formam um ângulo raso.
   - tales-feixe: a segunda transversal inclina; DE e EF mudam, a razão DE/EF não muda.
   - semelhanca-k: o triângulo 3-4-5 cresce com k = 1, 2, 3; perímetro × k e área × k² (k² cópias cabem dentro).
   - pitagoras-pecas: os 9 + 16 quadradinhos dos catetos vão para o quadrado da hipotenusa (25).
   - tipo-triangulo: o ângulo entre os lados 4 e 3 abre e fecha; a² comparado com b² + c² = 25 diz o tipo. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = "Figtree,'Segoe UI',sans-serif";
  var AZUL = "#2F6BFF", AZUL_F = "#1E4FD8", ROXO = "#6551D1", ROXO_T = "#3F2FA0", LILAS = "#8C7BEA", CINZA = "#5E5A70", LINHA = "#292B2C", AMARELO = "#FFD10C";

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
  function svg(box, w, h) {
    box.innerHTML = "";
    return el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, style: "overflow:visible;display:block", "aria-hidden": "true" }, box);
  }
  function reduz() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function ativo(box) { var s = box.closest(".slide"); return !!(s && s.classList.contains("ativo")); }
  function suave(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  function rad(g) { return g * Math.PI / 180; }
  function num(v, d) { return v.toFixed(d === undefined ? 0 : d).replace(".", ","); }
  /* ponto no ângulo (graus, sentido anti-horário da Matemática) a partir de (cx, cy), com y para baixo */
  function pol(cx, cy, r, g) { return [cx + r * Math.cos(rad(g)), cy - r * Math.sin(rad(g))]; }
  function arco(cx, cy, r, g1, g2) {
    var a = pol(cx, cy, r, g1), b = pol(cx, cy, r, g2), grande = (g2 - g1) % 360 > 180 ? 1 : 0;
    return "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " A" + r + " " + r + " 0 " + grande + " 0 " + b[0].toFixed(1) + " " + b[1].toFixed(1);
  }
  function setor(cx, cy, r, g1, g2) { return "M" + cx + " " + cy + " L" + arco(cx, cy, r, g1, g2).slice(1) + " Z"; }
  /* quadros-chave: lista [tempo, valor]; interpolação suave entre eles, em laço */
  function chave(lista, t) {
    var T = lista[lista.length - 1][0];
    t = t % T;
    for (var i = 1; i < lista.length; i++) {
      if (t <= lista[i][0]) {
        var a = lista[i - 1], b = lista[i];
        return a[1] + (b[1] - a[1]) * suave((t - a[0]) / (b[0] - a[0] || 1));
      }
    }
    return lista[lista.length - 1][1];
  }

  /* Registra uma animação: monta(box) cria a figura; desenha(estado, t) põe o quadro do tempo t (s). */
  function registra(nome, monta, desenha, t0, tParado) {
    window.QuarksAnimacoes[nome] = {
      inicia: function (box) { box._e = monta(box); desenha(box._e, t0); },
      roda: function (box) {
        if (!box._e) box._e = monta(box);
        var id = (box._id || 0) + 1;
        box._id = id;
        if (reduz()) { desenha(box._e, tParado); return; }
        var ini = null;
        function quadro(agora) {
          if (box._id !== id) return;
          if (!ativo(box)) { box._id++; return; }
          if (ini === null) ini = agora;
          desenha(box._e, t0 + (agora - ini) / 1000);
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      },
      zera: function (box) { box._id = (box._id || 0) + 1; if (box._e) desenha(box._e, t0); }
    };
  }

  /* ---------- 1. O ângulo que abre ---------- */
  registra("angulo-abre", function (box) {
    var s = svg(box, 760, 470), O = [380, 380], R = 300;
    el("line", { x1: O[0], y1: O[1], x2: O[0] + R, y2: O[1], stroke: LINHA, "stroke-width": 7, "stroke-linecap": "round" }, s);
    var setorA = el("path", { fill: "rgba(47,107,255,.14)" }, s);
    var arcoA = el("path", { fill: "none", stroke: AZUL, "stroke-width": 5 }, s);
    var reto = el("path", { fill: "none", stroke: AZUL, "stroke-width": 5 }, s);
    var lado = el("line", { x1: O[0], y1: O[1], stroke: LINHA, "stroke-width": 7, "stroke-linecap": "round" }, s);
    el("circle", { cx: O[0], cy: O[1], r: 11, fill: AMARELO, stroke: "#fff", "stroke-width": 4 }, s);
    txt(s, O[0] + 6, O[1] + 48, "vértice", { "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: CINZA });
    var med = txt(s, 380, 40, "", { "text-anchor": "middle", "font-size": 46, "font-weight": 800, fill: ROXO_T, style: "font-variant-numeric:tabular-nums" });
    var nome = txt(s, 380, 92, "", { "text-anchor": "middle", "font-size": 38, "font-weight": 800, fill: AZUL_F });
    return { setor: setorA, arco: arcoA, reto: reto, lado: lado, med: med, nome: nome, O: O, R: R };
  }, function (e, t) {
    var g = chave([[0, 40], [1.6, 40], [3.4, 90], [5.4, 90], [7, 135], [8.6, 135], [10.2, 180], [12.4, 180], [14.6, 40]], t);
    var p = pol(e.O[0], e.O[1], e.R, g);
    e.lado.setAttribute("x2", p[0].toFixed(1)); e.lado.setAttribute("y2", p[1].toFixed(1));
    var ehReto = Math.abs(g - 90) < .6;
    e.setor.setAttribute("d", setor(e.O[0], e.O[1], 80, 0, Math.max(g, .1)));
    e.arco.setAttribute("d", arco(e.O[0], e.O[1], 80, 0, Math.max(g, .1)));
    e.arco.style.display = ehReto ? "none" : "";
    e.reto.setAttribute("d", "M" + (e.O[0] + 46) + " " + e.O[1] + " V" + (e.O[1] - 46) + " H" + e.O[0]);
    e.reto.style.display = ehReto ? "" : "none";
    e.med.textContent = Math.round(g) + "°";
    e.nome.textContent = g >= 179.4 ? "raso" : ehReto ? "reto" : g < 90 ? "agudo" : "obtuso";
  }, 0, 1);

  /* ---------- 2. Axioma de Euclides: a reta que gira em torno de P ---------- */
  registra("euclides-gira", function (box) {
    var s = svg(box, 1000, 470), P = [500, 150], Y = 380;
    el("line", { x1: 0, y1: Y, x2: 1000, y2: Y, stroke: LINHA, "stroke-width": 6, "stroke-linecap": "round" }, s);
    txt(s, 1010, Y + 12, "r", { "font-size": 40, "font-style": "italic", "font-weight": 700, fill: LINHA });
    var corte = el("clipPath", { id: "corte-euclides" }, s);
    el("rect", { x: -10, y: -10, width: 1020, height: 445 }, corte);
    var reta = el("line", { stroke: AZUL, "stroke-width": 6, "stroke-linecap": "round", "clip-path": "url(#corte-euclides)" }, s);
    var X = el("circle", { r: 12, fill: "#C2384F", stroke: "#fff", "stroke-width": 4 }, s);
    var xt = txt(s, 0, Y + 56, "corta r", { "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: "#C2384F" });
    el("circle", { cx: P[0], cy: P[1], r: 12, fill: AMARELO, stroke: LINHA, "stroke-width": 3 }, s);
    txt(s, P[0] - 34, P[1] - 22, "P", { "text-anchor": "middle", "font-size": 40, "font-weight": 800, fill: ROXO_T });
    var par = txt(s, 500, 260, "paralela: nunca corta r", { "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: "#1F9D62" });
    return { reta: reta, X: X, xt: xt, par: par, P: P, Y: Y };
  }, function (e, t) {
    var u = (t % 20) / 20, f = u - Math.sin(2 * Math.PI * u) / (2 * Math.PI); // para devagar na posição paralela
    var g = 180 * f, L = 760;
    var a = pol(e.P[0], e.P[1], L, g), b = pol(e.P[0], e.P[1], -L, g);
    e.reta.setAttribute("x1", a[0].toFixed(1)); e.reta.setAttribute("y1", a[1].toFixed(1));
    e.reta.setAttribute("x2", b[0].toFixed(1)); e.reta.setAttribute("y2", b[1].toFixed(1));
    var sg = Math.sin(rad(g)), paralela = Math.abs(sg) < .035;
    e.reta.setAttribute("stroke", paralela ? "#1F9D62" : AZUL);
    e.par.style.opacity = paralela ? 1 : 0;
    var x = paralela ? 99999 : e.P[0] - (e.Y - e.P[1]) * Math.cos(rad(g)) / sg;
    var ve = x > 20 && x < 980;
    e.X.style.display = ve ? "" : "none"; e.xt.style.display = ve ? "" : "none";
    if (ve) { e.X.setAttribute("cx", x.toFixed(1)); e.X.setAttribute("cy", e.Y); e.xt.setAttribute("x", (x + (Math.cos(rad(g)) * sg > 0 ? -70 : 70)).toFixed(1)); }
  }, 6, 0);

  /* ---------- 3. Paralelas e transversal: só duas medidas ---------- */
  registra("transversal", function (box) {
    var s = svg(box, 900, 480), Y1 = 110, Y2 = 330;
    [Y1, Y2].forEach(function (y, i) {
      el("line", { x1: 30, y1: y, x2: 840, y2: y, stroke: LINHA, "stroke-width": 6, "stroke-linecap": "round" }, s);
      txt(s, 856, y + 13, i ? "s" : "r", { "font-size": 40, "font-style": "italic", "font-weight": 700, fill: LINHA });
    });
    var reta = el("line", { stroke: ROXO, "stroke-width": 6, "stroke-linecap": "round" }, s);
    var tl = txt(s, 0, 0, "t", { "font-size": 40, "font-style": "italic", "font-weight": 700, fill: ROXO });
    var arcos = [], rot = [];
    for (var i = 0; i < 8; i++) {
      arcos.push(el("path", { "stroke-width": 4 }, s));
      rot.push(txt(s, 0, 0, "", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": 30, "font-weight": 800 }, s));
    }
    var placa = txt(s, 900, 470, "", { "text-anchor": "end", "font-size": 36, "font-weight": 800, fill: ROXO_T, style: "font-variant-numeric:tabular-nums" });
    return { reta: reta, tl: tl, arcos: arcos, rot: rot, placa: placa, Y: [Y1, Y2] };
  }, function (e, t) {
    var a = 62 + 10 * Math.sin(2 * Math.PI * t / 7), c = [440, 220];
    var p1 = pol(c[0], c[1], 200, a), p2 = pol(c[0], c[1], -200, a);
    e.reta.setAttribute("x1", p1[0].toFixed(1)); e.reta.setAttribute("y1", p1[1].toFixed(1));
    e.reta.setAttribute("x2", p2[0].toFixed(1)); e.reta.setAttribute("y2", p2[1].toFixed(1));
    e.tl.setAttribute("x", (p1[0] + 16).toFixed(1)); e.tl.setAttribute("y", (p1[1] + 24).toFixed(1));
    var k = 0, cot = Math.cos(rad(a)) / Math.sin(rad(a));
    e.Y.forEach(function (y) {
      var x = c[0] - (y - c[1]) * cot;
      [[0, a], [a, 180], [180, 180 + a], [180 + a, 360]].forEach(function (par, j) {
        var agudo = j % 2 === 0, cor = agudo ? AZUL : LILAS;
        e.arcos[k].setAttribute("d", setor(x, y, agudo ? 52 : 40, par[0], par[1]));
        e.arcos[k].setAttribute("fill", agudo ? "rgba(47,107,255,.16)" : "rgba(140,123,234,.16)");
        e.arcos[k].setAttribute("stroke", cor);
        var m = pol(x, y, agudo ? 82 : 70, (par[0] + par[1]) / 2);
        e.rot[k].setAttribute("x", m[0].toFixed(1)); e.rot[k].setAttribute("y", m[1].toFixed(1));
        e.rot[k].setAttribute("fill", agudo ? AZUL_F : ROXO);
        e.rot[k].textContent = agudo ? "a" : "b";
        k++;
      });
    });
    var ag = Math.round(a);
    e.placa.textContent = ("a = " + ag + "° · b = " + (180 - ag) + "° · a + b = 180°").replace(/ /g, "\u00a0");
  }, 0, 0);

  /* ---------- 4. Soma dos ângulos do triângulo: as pontas se juntam em C ---------- */
  registra("triangulo-180", function (box) {
    var s = svg(box, 820, 470), A = [110, 420], B = [720, 420], C = [470, 140];
    var dAC = Math.atan2(A[1] - C[1], C[0] - A[0]) * 180 / Math.PI;   // direção A→C
    var dBC = Math.atan2(B[1] - C[1], C[0] - B[0]) * 180 / Math.PI;   // direção B→C
    var dCA = dAC + 180, dCB = dBC + 180;
    var par = el("line", { x1: C[0] - 380, y1: C[1], x2: C[0] + 330, y2: C[1], stroke: CINZA, "stroke-width": 4, "stroke-dasharray": "14 12" }, s);
    el("polygon", { points: [A, B, C].map(function (p) { return p.join(","); }).join(" "), fill: "rgba(47,107,255,.06)", stroke: LINHA, "stroke-width": 5, "stroke-linejoin": "round" }, s);
    function cunha(cor, g1, g2) {
      var g = el("g", {}, s);
      el("path", { d: setor(0, 0, 70, g1, g2), fill: cor, "fill-opacity": .85, stroke: "#fff", "stroke-width": 3 }, g);
      return g;
    }
    var wC = cunha(AMARELO, dCA, dCB); wC.setAttribute("transform", "translate(" + C + ")");
    var wA = cunha(AZUL, 0, dAC), wB = cunha(LILAS, dBC, 180);
    [["A", A, -34, 22], ["B", B, 30, 22], ["C", C, 0, -26]].forEach(function (v) {
      txt(s, v[1][0] + v[2], v[1][1] + v[3] + 12, v[0], { "text-anchor": "middle", "font-size": 40, "font-weight": 800, fill: ROXO_T });
    });
    var raso = txt(s, C[0], C[1] - 70, "A + B + C = 180°", { "text-anchor": "middle", "font-size": 40, "font-weight": 800, fill: ROXO_T });
    return { A: A, B: B, C: C, wA: wA, wB: wB, par: par, raso: raso };
  }, function (e, t) {
    var u = chave([[0, 0], [1.8, 0], [4.6, 1], [8.6, 1], [11.2, 0]], t);
    function poe(w, V) {
      var x = V[0] + (e.C[0] - V[0]) * u, y = V[1] + (e.C[1] - V[1]) * u;
      w.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (180 * u).toFixed(1) + ")");
    }
    poe(e.wA, e.A); poe(e.wB, e.B);
    e.par.style.opacity = u; e.raso.style.opacity = Math.max(0, (u - .85) / .15);
  }, 0, 6);

  /* ---------- 5. Tales: a razão que não muda ---------- */
  registra("tales-feixe", function (box) {
    var s = svg(box, 900, 440), Ys = [60, 190, 385], esc = 32.5; // 130 px = 4 unidades; 195 px = 6 unidades
    Ys.forEach(function (y, i) {
      el("line", { x1: 20, y1: y, x2: 860, y2: y, stroke: LINHA, "stroke-width": 5, "stroke-linecap": "round" }, s);
      txt(s, 876, y + 12, ["a", "b", "c"][i], { "font-size": 36, "font-style": "italic", "font-weight": 700, fill: LINHA });
    });
    var t1 = el("line", { x1: 150, y1: 15, x2: 150, y2: 425, stroke: AZUL, "stroke-width": 6, "stroke-linecap": "round" }, s);
    var t2 = el("line", { stroke: ROXO, "stroke-width": 6, "stroke-linecap": "round" }, s);
    function xNa(x1, y1, x2, y2, y) { return x1 + (x2 - x1) * (y - y1) / (y2 - y1); }
    var P1 = Ys.map(function (y) { return [150, y]; });
    P1.forEach(function (p, i) { el("circle", { cx: p[0], cy: p[1], r: 9, fill: LINHA }, s); txt(s, p[0] - 34, p[1] - 14, "ABC"[i], { "font-size": 32, "font-weight": 800, fill: ROXO_T }); });
    txt(s, 100, 137, "4", { "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: AZUL_F });
    txt(s, 100, 300, "6", { "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: AZUL_F });
    var pts = [], nomes = [];
    for (var i = 0; i < 3; i++) { pts.push(el("circle", { r: 9, fill: LINHA }, s)); nomes.push(txt(s, 0, 0, "DEF"[i], { "font-size": 32, "font-weight": 800, fill: ROXO_T })); }
    var de = txt(s, 0, 0, "", { "font-size": 30, "font-weight": 800, fill: ROXO, style: "font-variant-numeric:tabular-nums" });
    var ef = txt(s, 0, 0, "", { "font-size": 30, "font-weight": 800, fill: ROXO, style: "font-variant-numeric:tabular-nums" });
    return { t2: t2, pts: pts, nomes: nomes, de: de, ef: ef, Ys: Ys, esc: esc, xNa: xNa, box: box };
  }, function (e, t) {
    var topo = [420, 15], baixo = [640 + 170 * Math.sin(2 * Math.PI * t / 9), 425];
    e.t2.setAttribute("x1", topo[0]); e.t2.setAttribute("y1", topo[1]); e.t2.setAttribute("x2", baixo[0].toFixed(1)); e.t2.setAttribute("y2", baixo[1]);
    var P = e.Ys.map(function (y) { return [e.xNa(topo[0], topo[1], baixo[0], baixo[1], y), y]; });
    P.forEach(function (p, i) {
      e.pts[i].setAttribute("cx", p[0].toFixed(1)); e.pts[i].setAttribute("cy", p[1]);
      e.nomes[i].setAttribute("x", (p[0] + 16).toFixed(1)); e.nomes[i].setAttribute("y", p[1] - 14);
    });
    var DE = Math.hypot(P[1][0] - P[0][0], 130) / e.esc, EF = Math.hypot(P[2][0] - P[1][0], 195) / e.esc;
    e.de.textContent = num(DE, 1); e.ef.textContent = num(EF, 1);
    e.de.setAttribute("x", ((P[0][0] + P[1][0]) / 2 + 22).toFixed(1)); e.de.setAttribute("y", 137);
    e.ef.setAttribute("x", ((P[1][0] + P[2][0]) / 2 + 26).toFixed(1)); e.ef.setAttribute("y", 300);
    var r = e.box.parentNode && e.box.parentNode.querySelector("[data-razao]");
    if (r) r.textContent = num(DE, 1) + " ÷ " + num(EF, 1) + " = " + num(DE / EF, 2);
  }, 0, 0);

  /* ---------- 6. Razão de semelhança: perímetro × k, área × k² ---------- */
  registra("semelhanca-k", function (box) {
    var s = svg(box, 700, 520), O = [40, 490], u = 38; // triângulo retângulo de catetos 4 (horizontal) e 3 (vertical)
    var grade = el("g", { stroke: "#fff", "stroke-width": 3 }, s);
    var tri = el("polygon", { fill: "rgba(47,107,255,.22)", stroke: AZUL_F, "stroke-width": 5, "stroke-linejoin": "round" }, s);
    var orig = el("polygon", { points: [O, [O[0] + 4 * u, O[1]], [O[0], O[1] - 3 * u]].map(function (p) { return p.join(","); }).join(" "), fill: "none", stroke: AMARELO, "stroke-width": 5, "stroke-linejoin": "round" }, s);
    var kT = txt(s, 690, 60, "", { "text-anchor": "end", "font-size": 52, "font-weight": 800, fill: ROXO_T, style: "font-variant-numeric:tabular-nums" });
    return { O: O, u: u, grade: grade, tri: tri, orig: orig, kT: kT, box: box };
  }, function (e, t) {
    var k = chave([[0, 1], [2, 1], [4, 2], [7, 2], [9, 3], [12, 3], [14.5, 1]], t), O = e.O, u = e.u;
    var B = [O[0] + 4 * u * k, O[1]], C = [O[0], O[1] - 3 * u * k];
    e.tri.setAttribute("points", [O, B, C].map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "));
    e.kT.textContent = "k = " + num(k, 1);
    var n = Math.round(k), perto = Math.abs(k - n) < .03 && n > 1;
    e.grade.innerHTML = "";
    if (perto) {
      for (var i = 1; i < n; i++) {
        var f = i / n;
        el("line", { x1: O[0] + 4 * u * k * f, y1: O[1], x2: O[0] + 4 * u * k * f, y2: O[1] - 3 * u * k * (1 - f) }, e.grade);
        el("line", { x1: O[0], y1: O[1] - 3 * u * k * f, x2: O[0] + 4 * u * k * (1 - f), y2: O[1] - 3 * u * k * f }, e.grade);
        el("line", { x1: O[0] + 4 * u * k * f, y1: O[1], x2: O[0], y2: O[1] - 3 * u * k * f }, e.grade);
      }
    }
    e.grade.style.opacity = perto ? 1 : 0;
    var p = e.box.parentNode && e.box.parentNode.querySelector("[data-perimetro]"), a = e.box.parentNode && e.box.parentNode.querySelector("[data-area]");
    if (p) p.textContent = num(12 * k, 1).replace(",0", "");
    if (a) a.textContent = num(6 * k * k, 1).replace(",0", "");
  }, 0, 5);

  /* ---------- 7. Pitágoras com quadradinhos: 9 + 16 = 25 ---------- */
  registra("pitagoras-pecas", function (box) {
    var u = +(box.dataset.u || 42), Cx = 3 * u + 20, Cy = 7 * u + 20, s = svg(box, 10 * u + 40, 11 * u + 40);
    var A = [Cx, Cy - 3 * u], B = [Cx + 4 * u, Cy];
    var e1 = [.8 * u, .6 * u], e2 = [.6 * u, -.8 * u];
    function pts(l) { return l.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
    el("polygon", { points: pts([[Cx, Cy], [Cx + 4 * u, Cy], [Cx + 4 * u, Cy + 4 * u], [Cx, Cy + 4 * u]]), fill: "none", stroke: AZUL, "stroke-width": 3, "stroke-dasharray": "8 7" }, s);
    el("polygon", { points: pts([[Cx - 3 * u, Cy - 3 * u], [Cx, Cy - 3 * u], [Cx, Cy], [Cx - 3 * u, Cy]]), fill: "none", stroke: LILAS, "stroke-width": 3, "stroke-dasharray": "8 7" }, s);
    el("polygon", { points: pts([A, B, [B[0] + 3 * u, B[1] - 4 * u], [A[0] + 3 * u, A[1] - 4 * u]]), fill: "none", stroke: ROXO, "stroke-width": 3, "stroke-dasharray": "8 7" }, s);
    var pecas = [], alvos = [];
    for (var i = 0; i < 5; i++) for (var j = 0; j < 5; j++) alvos.push([A[0] + (i + .5) * e1[0] + (j + .5) * e2[0], A[1] + (i + .5) * e1[1] + (j + .5) * e2[1]]);
    alvos.sort(function (p, q) { return p[1] - q[1] || p[0] - q[0]; }); // de cima para baixo
    var origem = [];
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) origem.push([Cx - 3 * u + (j + .5) * u, Cy - 3 * u + (i + .5) * u, LILAS]);
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) origem.push([Cx + (j + .5) * u, Cy + (i + .5) * u, AZUL]);
    origem.forEach(function (o, n) {
      var g = el("g", {}, s);
      el("rect", { x: -u / 2 + 2, y: -u / 2 + 2, width: u - 4, height: u - 4, rx: u / 6, fill: o[2], "fill-opacity": .9 }, g);
      pecas.push({ g: g, de: o, para: alvos[n], atraso: (n % 9) * .09 + (n < 9 ? 0 : .5) });
    });
    el("polygon", { points: pts([A, B, [Cx, Cy]]), fill: "#fff", stroke: LINHA, "stroke-width": 5, "stroke-linejoin": "round" }, s);
    el("path", { d: "M" + (Cx + 20) + " " + Cy + " V" + (Cy - 20) + " H" + Cx, fill: "none", stroke: LINHA, "stroke-width": 3 }, s);
    var n9 = txt(s, Cx - 1.5 * u, Cy - 3 * u - 16, "3² = 9", { "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: ROXO });
    var n16 = txt(s, Cx + 4 * u + 18, Cy + 2.2 * u, "4² = 16", { "text-anchor": "start", "font-size": 30, "font-weight": 800, fill: AZUL_F });
    var n25 = txt(s, A[0] + 2.5 * e1[0] + 5.6 * e2[0], A[1] + 2.5 * e1[1] + 5.6 * e2[1], "5² = 25", { "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: ROXO_T });
    return { pecas: pecas, n25: n25 };
  }, function (e, t) {
    var u = chave([[0, 0], [2, 0], [6, 1], [10, 1], [13, 0]], t);
    e.pecas.forEach(function (p) {
      var v = suave(u * 2.3 - p.atraso); // cada peça sai no seu tempo
      var x = p.de[0] + (p.para[0] - p.de[0]) * v, y = p.de[1] + (p.para[1] - p.de[1]) * v;
      p.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (36.87 * v).toFixed(2) + ")");
    });
    e.n25.style.opacity = Math.max(0, (u - .8) / .2);
  }, 0, 8);

  /* ---------- 8. O tipo do triângulo pelo maior lado ---------- */
  registra("tipo-triangulo", function (box) {
    var s = svg(box, 760, 470), V = [240, 410], u = 90;
    var lado = el("line", { stroke: "#C2384F", "stroke-width": 7, "stroke-linecap": "round" }, s);
    el("line", { x1: V[0], y1: V[1], x2: V[0] + 4 * u, y2: V[1], stroke: LINHA, "stroke-width": 7, "stroke-linecap": "round" }, s);
    var c = el("line", { x1: V[0], y1: V[1], stroke: LINHA, "stroke-width": 7, "stroke-linecap": "round" }, s);
    var ang = el("path", { fill: "rgba(101,81,209,.16)", stroke: ROXO, "stroke-width": 4 }, s);
    txt(s, V[0] + 2 * u, V[1] + 46, "b = 4", { "text-anchor": "middle", "font-size": 32, "font-weight": 800, fill: LINHA });
    var ct = txt(s, 0, 0, "c = 3", { "text-anchor": "end", "font-size": 32, "font-weight": 800, fill: LINHA });
    var at = txt(s, 0, 0, "a", { "font-size": 38, "font-weight": 800, "font-style": "italic", fill: "#C2384F" });
    var gt = txt(s, V[0], V[1] - 70, "", { "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: ROXO });
    return { s: s, V: V, u: u, lado: lado, c: c, ang: ang, ct: ct, at: at, gt: gt, box: box };
  }, function (e, t) {
    var g = chave([[0, 90], [2, 90], [4, 65], [6.5, 65], [8.5, 90], [10.5, 90], [12.5, 120], [15, 120], [17, 90]], t);
    var V = e.V, u = e.u, P = pol(V[0], V[1], 3 * u, g), Q = [V[0] + 4 * u, V[1]];
    e.c.setAttribute("x2", P[0].toFixed(1)); e.c.setAttribute("y2", P[1].toFixed(1));
    e.lado.setAttribute("x1", P[0].toFixed(1)); e.lado.setAttribute("y1", P[1].toFixed(1)); e.lado.setAttribute("x2", Q[0]); e.lado.setAttribute("y2", Q[1]);
    var reto = Math.abs(g - 90) < .6;
    e.ang.setAttribute("d", reto ? "M" + (V[0] + 34) + " " + V[1] + " V" + (V[1] - 34) + " H" + V[0] + " Z" : setor(V[0], V[1], 50, 0, g));
    var m = pol(V[0], V[1], 1.5 * u, g);
    e.ct.setAttribute("x", (m[0] - 18).toFixed(1)); e.ct.setAttribute("y", (m[1]).toFixed(1));
    e.at.setAttribute("x", ((P[0] + Q[0]) / 2 + 16).toFixed(1)); e.at.setAttribute("y", ((P[1] + Q[1]) / 2 - 10).toFixed(1));
    var p2 = pol(V[0], V[1], 88, g / 2);
    e.gt.setAttribute("x", p2[0].toFixed(1)); e.gt.setAttribute("y", (p2[1] + 10).toFixed(1));
    e.gt.textContent = Math.round(g) + "°";
    var a2 = 25 - 24 * Math.cos(rad(g)), tipo = reto ? "retângulo" : a2 < 25 ? "acutângulo" : "obtusângulo";
    var pai = e.box.parentNode, q;
    if (pai && (q = pai.querySelector("[data-a2]"))) q.textContent = num(reto ? 25 : a2, 1).replace(",0", "");
    if (pai && (q = pai.querySelector("[data-sinal]"))) q.textContent = reto ? "=" : a2 < 25 ? "<" : ">";
    if (pai && (q = pai.querySelector("[data-tipo]"))) q.textContent = tipo;
  }, 0, 0);
})();

document.addEventListener("DOMContentLoaded", function () {
  ["angulo-abre", "euclides-gira", "transversal", "triangulo-180", "tales-feixe", "semelhanca-k", "pitagoras-pecas", "tipo-triangulo"].forEach(function (n) {
    document.querySelectorAll('[data-anima="' + n + '"]').forEach(function (b) { window.QuarksAnimacoes[n].inicia(b); });
  });
});
