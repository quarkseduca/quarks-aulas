/* Animações de Ligações químicas (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo).
   - transfere: o metal passa o(s) elétron(s) da camada de valência para o ametal; os dois ficam com octeto,
     viram íons (cargas aparecem) e se aproximam, porque cargas opostas se atraem.
     data-m="Na|2,8,1"  data-a="Cl|2,8,7"  data-k="1" (quantos átomos do ametal)  data-w / data-h (tamanho).
   - reticulo: o retículo cristalino do NaCl em 3D, girando devagar (uma volta em 30 s), com os íons vibrando no lugar.
   - Moléculas (svg.vibra): cada átomo vibra de leve, sozinho; as ligações não se rompem. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var parado = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function el(nome, at, pai) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); if (pai) pai.appendChild(e); return e; }
  function laco(box, f) { // ~30 quadros por segundo, cancelado quando box._vez muda
    var vez = box._vez, t0 = null, ultimo = 0;
    function q(agora) {
      if (box._vez !== vez) return;
      if (t0 === null) t0 = agora;
      if (agora - ultimo > 33) { ultimo = agora; f((agora - t0) / 1000); }
      requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  }
  var suave = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  /* ---------------- transfere ---------------- */
  var COR = { Na: "#8C7BEA", K: "#8C7BEA", Ca: "#8C7BEA", Mg: "#8C7BEA", Al: "#8C7BEA", Cl: "#14A863", Br: "#B5531F", F: "#14A863", O: "#E5533D", S: "#D9A400" };
  function atomo(txt) { var p = txt.split("|"); return { s: p[0], c: p[1].split(",").map(Number) }; }
  function sobrescrito(n, sinal) { return (n > 1 ? n : "") + sinal; }

  function montaT(box) {
    var W = +box.dataset.w || 900, H = +box.dataset.h || 360, k = +(box.dataset.k || 1);
    var m = atomo(box.dataset.m), a = atomo(box.dataset.a), esc = +(box.dataset.s || 1);
    box.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true" }, box);
    svg.style.display = "block"; svg.style.overflow = "visible";
    var R0 = 30 * esc, DR = 20 * esc;
    function raio(c, i) { return R0 + DR * (i + 1); }
    function desenhaAtomo(at, x, y, cor) {
      var g = el("g", { transform: "translate(" + x + " " + y + ")" }, svg), n = at.c.length;
      for (var i = 0; i < n - 1; i++) el("circle", { r: raio(at.c, i), fill: "none", stroke: "#D6CFF3", "stroke-width": 2.5 }, g);
      var ext = el("circle", { r: raio(at.c, n - 1), fill: "none", stroke: "#B9B0E6", "stroke-width": 3, "stroke-dasharray": "6 6" }, g);
      el("circle", { r: R0 - 2, fill: cor, stroke: "#fff", "stroke-width": 3 }, g);
      var t = el("text", { y: 11 * esc, "text-anchor": "middle", "font-family": "Bricolage Grotesque, Figtree, sans-serif", "font-weight": 800, "font-size": 30 * esc, fill: "#fff" }, g);
      t.textContent = at.s;
      var carga = el("text", { x: raio(at.c, n - 1) * .78, y: -raio(at.c, n - 1) * .78, "font-family": "Figtree, sans-serif", "font-weight": 800, "font-size": 34 * esc, fill: "#292B2C", opacity: 0 }, g);
      var rot = el("text", { y: raio(at.c, n - 1) + 40 * esc, "text-anchor": "middle", "font-family": "Figtree, sans-serif", "font-weight": 700, "font-size": 26 * esc, fill: "#5E5A70" }, g);
      rot.textContent = at.c.join("-");
      return { g: g, x: x, y: y, ext: ext, carga: carga, rot: rot, rExt: raio(at.c, n - 1), at: at };
    }
    var S = { svg: svg, W: W, H: H };
    var xm = W * .25, xa = W * .72, ym = H * .45;
    S.M = desenhaAtomo(m, xm, ym, COR[m.s] || "#8C7BEA");
    S.A = [];
    for (var j = 0; j < k; j++) {
      var ya = k === 1 ? ym : ym + (j - (k - 1) / 2) * (H * 1.08 / k);
      S.A.push(desenhaAtomo(a, xa, ya, COR[a.s] || "#14A863"));
    }
    // elétrons de valência do metal (sobre o anel externo, voltados para o ametal)
    var nv = m.c[m.c.length - 1], falta = 8 - a.c[a.c.length - 1];
    S.eM = [];
    for (var i = 0; i < nv; i++) {
      var ang = (i - (nv - 1) / 2) * 0.55;
      var e = el("circle", { r: 9 * esc, fill: "#FFD10C", stroke: "#292B2C", "stroke-width": 2 }, svg);
      S.eM.push({ c: e, x0: xm + S.M.rExt * Math.cos(ang), y0: ym + S.M.rExt * Math.sin(ang) });
    }
    // elétrons do ametal: 8 lugares no anel externo, os que faltam ficam vagos (voltados para o metal)
    S.vagas = [];
    S.A.forEach(function (A) {
      var nA = a.c[a.c.length - 1];
      var ang0 = Math.atan2(ym - A.y, xm - A.x);
      for (var s = 0; s < 8; s++) {
        var ang = ang0 + s * Math.PI / 4;
        var dx = A.rExt * Math.cos(ang), dy = A.rExt * Math.sin(ang);
        if (s < 8 - nA) S.vagas.push({ x: A.x + dx, y: A.y + dy, A: A });
        else el("circle", { cx: dx.toFixed(1), cy: dy.toFixed(1), r: 8 * esc, fill: COR[a.s] || "#14A863", stroke: "#fff", "stroke-width": 2 }, A.g);
      }
    });
    S.nv = nv; S.cargaM = sobrescrito(nv, "+"); S.cargaA = sobrescrito(falta, "−");
    S.rotM = m.c.slice(0, -1).join("-"); S.rotA = a.c.slice(0, -1).concat([8]).join("-");
    S.rotM0 = m.c.join("-"); S.rotA0 = a.c.join("-");
    box._S = S;
    quadroT(S, 0);
  }

  var T_CICLO = 9;
  function quadroT(S, t) {
    var tc = t % T_CICLO, n = S.nv, dur = 1.3, ini = 0.8;
    S.eM.forEach(function (e, i) {
      var v = S.vagas[i], f = suave((tc - ini - i * dur) / dur);
      // arco: sai do metal, sobe e cai na vaga do ametal (o ametal se aproxima no fim; acompanha)
      var ax = v.x + aprox(S, tc, v.A), ay = v.y;
      var mx = (e.x0 + ax) / 2, my = Math.min(e.y0, ay) - 90;
      var x = (1 - f) * (1 - f) * e.x0 + 2 * (1 - f) * f * mx + f * f * ax;
      var y = (1 - f) * (1 - f) * e.y0 + 2 * (1 - f) * f * my + f * f * ay;
      if (f >= 1) { x = ax; y = ay; }
      e.c.setAttribute("cx", x.toFixed(1));
      e.c.setAttribute("cy", y.toFixed(1));
    });
    var fim = ini + n * dur, ions = suave((tc - fim) / 0.7);
    S.M.ext.setAttribute("opacity", (1 - .85 * ions).toFixed(2));
    S.M.carga.setAttribute("opacity", ions.toFixed(2)); S.M.carga.textContent = S.cargaM;
    S.M.rot.textContent = ions > .5 ? S.rotM : S.rotM0;
    S.M.g.setAttribute("transform", "translate(" + (S.M.x + aproxM(S, tc)).toFixed(1) + " " + S.M.y + ")");
    S.A.forEach(function (A) {
      A.carga.setAttribute("opacity", ions.toFixed(2)); A.carga.textContent = S.cargaA;
      A.rot.textContent = ions > .5 ? S.rotA : S.rotA0;
      A.g.setAttribute("transform", "translate(" + (A.x + aprox(S, tc, A)).toFixed(1) + " " + A.y + ")");
    });
    var some = tc > T_CICLO - .5 ? 1 - (tc - (T_CICLO - .5)) / .5 : tc < .3 ? tc / .3 : 1;
    S.svg.style.opacity = some.toFixed(2);
  }
  function fase(S, tc) { return suave((tc - (0.8 + S.nv * 1.3 + 0.5)) / 1.2); }
  function aproxM(S, tc) { return 30 * fase(S, tc); }   // o cátion vai para a direita
  function aprox(S, tc, A) { return -30 * fase(S, tc); } // o ânion vem para a esquerda

  window.QuarksAnimacoes.transfere = {
    inicia: montaT,
    zera: function (box) { box._vez = (box._vez || 0) + 1; montaT(box); },
    roda: function (box) {
      box._vez = (box._vez || 0) + 1;
      if (!box._S) montaT(box);
      var S = box._S;
      if (parado()) { quadroT(S, T_CICLO - 1); return; }
      laco(box, function (t) { quadroT(S, t); });
    }
  };

  /* ---------------- reticulo ---------------- */
  function montaR(box) {
    var L = +(box.dataset.w || 380);
    box.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + L + " " + L, width: L, height: L, "aria-hidden": "true" }, box);
    svg.style.display = "block";
    var p = [], n = 4, c = (n - 1) / 2;
    for (var x = 0; x < n; x++) for (var y = 0; y < n; y++) for (var z = 0; z < n; z++)
      p.push({ q: [x - c, y - c, z - c], na: (x + y + z) % 2 === 0, f: Math.random() * 6.3, f2: Math.random() * 6.3 });
    var lig = [];
    for (var i = 0; i < p.length; i++) for (var j = i + 1; j < p.length; j++) {
      var d = Math.abs(p[i].q[0] - p[j].q[0]) + Math.abs(p[i].q[1] - p[j].q[1]) + Math.abs(p[i].q[2] - p[j].q[2]);
      if (d === 1) lig.push([i, j]);
    }
    box._R = { svg: svg, p: p, lig: lig, L: L, E: L / 6.2 };
    quadroR(box._R, 0);
  }
  function gira(q, ax, ay) {
    var x = q[0], y = q[1], z = q[2], c = Math.cos(ay), s = Math.sin(ay);
    var x2 = c * x + s * z, z2 = -s * x + c * z;
    c = Math.cos(ax); s = Math.sin(ax);
    return [x2, c * y - s * z2, s * y + c * z2];
  }
  function quadroR(R, t) {
    var ay = .6 + t * 2 * Math.PI / 30, ax = -.42, E = R.E, m = R.L / 2, amp = .035; // vibração de ~2 px
    var P = R.p.map(function (o) {
      var v = [o.q[0] + amp * Math.sin(t * 3.1 + o.f), o.q[1] + amp * Math.sin(t * 2.7 + o.f2), o.q[2] + amp * Math.cos(t * 2.9 + o.f)];
      return gira(v, ax, ay);
    });
    var zs = P.map(function (q) { return q[2]; }), zmin = Math.min.apply(null, zs), zmax = Math.max.apply(null, zs);
    var itens = [];
    R.lig.forEach(function (e) { itens.push([(P[e[0]][2] + P[e[1]][2]) / 2 - .01, 0, e[0], e[1]]); });
    P.forEach(function (q, i) { itens.push([q[2], 1, i]); });
    itens.sort(function (a, b) { return a[0] - b[0]; });
    var h = "";
    itens.forEach(function (it) {
      var f = (it[0] - zmin) / (zmax - zmin + 1e-9), op = (.45 + .55 * f).toFixed(2);
      if (it[1] === 0) {
        var a = P[it[2]], b = P[it[3]];
        h += '<line x1="' + (m + a[0] * E).toFixed(1) + '" y1="' + (m + a[1] * E).toFixed(1) + '" x2="' + (m + b[0] * E).toFixed(1) + '" y2="' + (m + b[1] * E).toFixed(1) + '" stroke="#B9B0E6" stroke-opacity="' + op + '" stroke-width="2.5"/>';
      } else {
        var q = P[it[2]], na = R.p[it[2]].na, r = (na ? 10 : 17) * (.8 + .25 * f);
        h += '<circle cx="' + (m + q[0] * E).toFixed(1) + '" cy="' + (m + q[1] * E).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="url(' + (na ? "#gNa" : "#gCl") + ')" opacity="' + op + '"/>';
      }
    });
    R.svg.innerHTML = h;
  }
  window.QuarksAnimacoes.reticulo = {
    inicia: montaR,
    zera: function (box) { box._vez = (box._vez || 0) + 1; if (!box._R) montaR(box); quadroR(box._R, 0); },
    roda: function (box) {
      box._vez = (box._vez || 0) + 1;
      if (!box._R) montaR(box);
      if (parado()) return;
      laco(box, function (t) { quadroR(box._R, t); });
    }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  /* Moléculas: troca o <use> pelo desenho de verdade, para cada átomo poder vibrar sozinho. */
  var n = 0;
  document.querySelectorAll("svg.vibra").forEach(function (svg) {
    var u = svg.querySelector("use"), sym = u && document.querySelector(u.getAttribute("href"));
    if (!sym) return;
    svg.setAttribute("viewBox", sym.getAttribute("viewBox"));
    var g = sym.querySelector("g").cloneNode(true);
    svg.replaceChild(g, u);
    g.querySelectorAll("circle").forEach(function (c) {
      n++;
      c.style.animationDelay = (-((n * 0.37) % 1.7)).toFixed(2) + "s";
      c.style.animationDuration = (1.5 + (n % 5) * 0.12).toFixed(2) + "s";
      c.classList.add(n % 2 ? "vib-a" : "vib-b");
    });
  });
  document.querySelectorAll('[data-anima="transfere"]').forEach(function (b) { window.QuarksAnimacoes.transfere.inicia(b); });
  document.querySelectorAll('[data-anima="reticulo"]').forEach(function (b) { window.QuarksAnimacoes.reticulo.inicia(b); });
});
