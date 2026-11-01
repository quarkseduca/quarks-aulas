/* Animações de Ácidos, Bases e Sais (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo).
   Um motor de íons só (data-anima="ions"), com o modo em data-modo:
   - ionizacao: moléculas de ácido (HCl ou HF) entram na água; o H+ passa para uma molécula de água,
     que vira H3O+, e o resto vira o ânion (Cl− ou F−). data-alfa diz a fração que se ioniza
     (HCl 0,92: quase todas; HF 0,08: quase nenhuma). data-pronto="1": a solução já está pronta.
   - dissociacao: o cristal iônico (NaOH ou NaCl) se desfaz na água: os íons, que já existiam, só se separam.
   - neutralizacao: gotas de base (Na+ e OH−) caem numa solução de HCl (H3O+ e Cl−);
     cada OH− que encontra um H3O+ forma duas moléculas de água. Sobram Na+ e Cl−: o sal dissolvido.
   O contador (data-contador = id de um elemento, data-texto com {k} e {n}) acompanha a conta.
   Também aqui: svg.vibra (cada átomo de uma molécula vibra sozinho), como em animacoes-materia.js. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

window.QuarksAnimacoes.ions = (function () {
  var NS = "http://www.w3.org/2000/svg";
  var parado = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function el(nome, at) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function sorte(semente) { var s = semente || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var COR = { Cl: ["url(#gCl)", "#1E7A3C"], F: ["url(#gF)", "#7A7A12"], Na: ["url(#gNa)", "#3A2196"] };

  /* desenho de cada espécie (centro em 0,0; R = raio do oxigênio) */
  function desenhaEspecie(p, R) {
    var g = p.g; while (g.firstChild) g.removeChild(g.firstChild);
    var rot = el("g", {}); g.appendChild(rot); p.rot = rot;
    function atomo(x, y, r, fill, stroke) { rot.appendChild(el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(1), fill: fill, stroke: stroke, "stroke-width": 1.5 })); }
    var H = R * 0.6, X = p.x0 || "Cl", sinal = "";
    if (p.tipo === "w") { atomo(-R * .82, R * .62, H, "url(#gH)", "#8C84B8"); atomo(R * .82, R * .62, H, "url(#gH)", "#8C84B8"); atomo(0, 0, R, "url(#gO)", "#8E2115"); }
    else if (p.tipo === "hx") { atomo(R * 1.3, 0, H, "url(#gH)", "#8C84B8"); atomo(0, 0, R * 1.18, COR[X][0], COR[X][1]); }
    else if (p.tipo === "h3o") { atomo(-R * .86, R * .58, H, "url(#gH)", "#8C84B8"); atomo(R * .86, R * .58, H, "url(#gH)", "#8C84B8"); atomo(0, -R * 1.02, H, "url(#gH)", "#8C84B8"); atomo(0, 0, R, "url(#gO)", "#8E2115"); sinal = "+"; }
    else if (p.tipo === "x") { atomo(0, 0, R * 1.18, COR[X][0], COR[X][1]); sinal = "−"; }
    else if (p.tipo === "na") { atomo(0, 0, R * 1.05, COR.Na[0], COR.Na[1]); sinal = "+"; }
    else if (p.tipo === "oh") { atomo(R * 1.02, 0, H, "url(#gH)", "#8C84B8"); atomo(0, 0, R, "url(#gO)", "#8E2115"); sinal = "−"; }
    if (sinal) { // o sinal da carga não gira com a partícula
      var b = el("g", { transform: "translate(" + (R * .95).toFixed(1) + " " + (-R * 1.05).toFixed(1) + ")" });
      b.appendChild(el("circle", { r: (R * .52).toFixed(1), fill: "#fff", stroke: sinal === "+" ? "#C63C28" : "#1F6FB3", "stroke-width": 2 }));
      var t = el("text", { "text-anchor": "middle", y: (R * .3).toFixed(1), "font-family": "Figtree,sans-serif", "font-weight": 800, "font-size": (R * .95).toFixed(1), fill: sinal === "+" ? "#C63C28" : "#1F6FB3" });
      t.textContent = sinal; b.appendChild(t); g.appendChild(b);
    }
    p.raio = p.tipo === "w" || p.tipo === "oh" || p.tipo === "h3o" ? R * 1.45 : R * 1.4;
  }

  function monta(box) {
    var W = +box.dataset.w || 700, H = +box.dataset.h || 400, R = +(box.dataset.r || 11);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true" });
    svg.style.display = "block";
    var camada = el("g", {}), frente = el("g", {});
    svg.appendChild(camada); svg.appendChild(frente);
    var S = { W: W, H: H, R: R, modo: box.dataset.modo, ps: [], t: 0, rnd: sorte(+(box.dataset.semente || 13)), camada: camada, frente: frente, efeitos: [], box: box };
    S.v = +(box.dataset.v || 26);
    S.nAc = +(box.dataset.nAcido || 8);
    S.X = box.dataset.acido || box.dataset.an || "Cl";
    var nW = +(box.dataset.nAgua || 20);
    for (var i = 0; i < nW; i++) nova(S, "w", R * 1.6 + S.rnd() * (W - R * 3.2), R * 1.6 + S.rnd() * (H - R * 3.2));
    if (S.modo === "ionizacao") {
      var ordem = []; for (var k = 0; k < S.nAc; k++) ordem.push(k);
      ordem.sort(function () { return S.rnd() - .5; });
      S.vai = {}; var m = Math.round(+(box.dataset.alfa || 1) * S.nAc);
      ordem.slice(0, m).forEach(function (k) { S.vai[k] = true; });
      S.int = +(box.dataset.intervalo || 1.2); S.solto = 0; S.fim = S.nAc * S.int + 9;
    } else if (S.modo === "dissociacao") {
      var cols = +(box.dataset.cols || 4), lin = +(box.dataset.linhas || 3), esp = R * 2.7;
      var x0 = W / 2 - (cols - 1) * esp / 2, y0 = H - R * 2.2;
      S.rede = [];
      for (var j = 0; j < lin; j++) for (var c = 0; c < cols; c++) {
        var tipo = (c + j) % 2 ? (S.X === "OH" ? "oh" : "x") : "na";
        var q = nova(S, tipo, x0 + c * esp, y0 - j * esp); q.preso = true; q.hx = q.x; q.hy = q.y; q.ang = 0; q.va = 0;
        S.rede.push(q);
      }
      // empurra a água de cima do cristal
      S.ps.forEach(function (p) { if (p.tipo === "w" && p.y > y0 - lin * esp - R && Math.abs(p.x - W / 2) < cols * esp / 2 + R) p.y = R * 2 + S.rnd() * (y0 - lin * esp - R * 3); });
      S.rede.slice().sort(function (a, b) { return (a.y - b.y) * 3 - Math.abs(a.x - W / 2) + Math.abs(b.x - W / 2); }).forEach(function (q, n) { q.ordem = n; });
      S.fim = S.rede.length * 0.9 + 8;
    } else if (S.modo === "neutralizacao") {
      for (var a = 0; a < S.nAc; a++) {
        nova(S, "h3o", R * 2 + S.rnd() * (W - R * 4), H * .35 + S.rnd() * (H * .6 - R * 2));
        nova(S, "x", R * 2 + S.rnd() * (W - R * 4), H * .35 + S.rnd() * (H * .6 - R * 2));
      }
      S.solto = 0; S.fim = S.nAc * 1.5 + 8;
    }
    S.svg = svg;
    box.innerHTML = ""; box.appendChild(svg); box._S = S;
    if (box.dataset.pronto === "1") { for (var n = 0; n < (S.fim - 2) / 0.02; n++) passo(S, 0.02, true); S.pronto = true; }
    desenha(S); conta(S);
    return S;
  }

  function nova(S, tipo, x, y) {
    var p = { tipo: tipo, x: x, y: y, vx: (S.rnd() - .5) * S.v, vy: (S.rnd() - .5) * S.v, ang: S.rnd() * 360, va: (S.rnd() - .5) * 60, g: el("g", {}), x0: S.X === "OH" ? "Cl" : S.X, idade: 0 };
    S.camada.appendChild(p.g); desenhaEspecie(p, S.R); S.ps.push(p); return p;
  }
  function vira(S, p, tipo) { p.tipo = tipo; desenhaEspecie(p, S.R); }

  function anel(S, x, y) { // brilho amarelo onde a reação acontece
    var c = el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: S.R, fill: "none", stroke: "#FFD10C", "stroke-width": 5 });
    S.frente.appendChild(c); S.efeitos.push({ c: c, t: 0, tipo: "anel" });
  }

  function passo(S, dt, mudo) {
    S.t += dt;
    var R = S.R, W = S.W, H = S.H, rnd = S.rnd;
    if (S.modo === "ionizacao") ioniza(S, dt, mudo);
    if (S.modo === "dissociacao") dissocia(S);
    if (S.modo === "neutralizacao") neutraliza(S, dt, mudo);
    S.ps.forEach(function (p) {
      p.idade += dt;
      if (p.preso) return;
      p.vx += (rnd() - .5) * S.v * 9 * dt; p.vy += (rnd() - .5) * S.v * 9 * dt;
      var vel = Math.hypot(p.vx, p.vy), lim = S.v * (p.entrando || (p.rapido && p.tipo === "oh") ? 3 : 1.3);
      if (vel > lim) { p.vx *= lim / vel; p.vy *= lim / vel; }
      if (p.entrando) { p.vy += 40 * dt; if (p.y > R * 6) p.entrando = false; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.ang += p.va * dt;
      var m = p.raio * .8;
      if (p.x < m) { p.x = m; p.vx = Math.abs(p.vx); } if (p.x > W - m) { p.x = W - m; p.vx = -Math.abs(p.vx); }
      if (p.y < m) { p.y = m; p.vy = Math.abs(p.vy); } if (p.y > H - m) { p.y = H - m; p.vy = -Math.abs(p.vy); }
    });
    // as partículas não se atravessam (empurrão suave)
    for (var i = 0; i < S.ps.length; i++) for (var j = i + 1; j < S.ps.length; j++) {
      var a = S.ps[i], b = S.ps[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = (a.raio + b.raio) * .78;
      if (d < min && d > 1e-3) {
        var s = (min - d) / 2, nx = dx / d, ny = dy / d, fa = a.preso ? 0 : 1, fb = b.preso ? 0 : 1, t = fa + fb || 1;
        a.x -= nx * s * 2 * fa / t; a.y -= ny * s * 2 * fa / t; b.x += nx * s * 2 * fb / t; b.y += ny * s * 2 * fb / t;
      }
    }
    var vivos = S.efeitos; S.efeitos = [];
    vivos = vivos.filter(function (e) {
      e.t += dt;
      if (e.tipo === "anel") { e.c.setAttribute("r", (R + e.t * 60).toFixed(1)); e.c.setAttribute("opacity", Math.max(0, 1 - e.t / .7).toFixed(2)); if (e.t > .7) { e.c.remove(); return false; } }
      else if (e.tipo === "proton") { // o H+ viaja do ácido até a água
        var k = Math.min(1, e.t / .55), x = e.a.x + (e.b.x - e.a.x) * k, y = e.a.y + (e.b.y - e.a.y) * k;
        e.c.setAttribute("cx", x.toFixed(1)); e.c.setAttribute("cy", y.toFixed(1));
        if (k >= 1) { e.c.remove(); vira(S, e.b, "h3o"); e.b.ocupado = false; if (!mudo) anel(S, e.b.x, e.b.y); conta(S); return false; }
      }
      return true;
    });
    S.efeitos = vivos.concat(S.efeitos); // os anéis criados agora entram na lista
    if (!S.pronto && S.t > S.fim) reinicia(S);
  }

  function ioniza(S, dt, mudo) {
    while (S.solto < S.nAc && S.t > 0.6 + S.solto * S.int) { // o gás entra pela boca do copo
      var p = nova(S, "hx", S.R * 3 + S.rnd() * (S.W - S.R * 6), S.R * 1.6);
      p.vy = 70; p.entrando = true; p.k = S.solto; S.solto++; if (!mudo) conta(S);
    }
    S.ps.forEach(function (p) {
      if (p.tipo !== "hx" || !S.vai[p.k] || p.idade < 0.8 || p.ocupado) return;
      var alvo = null, dmin = S.R * (p.idade > 2.5 ? 12 : 6); // se demorar, procura uma água mais longe
      S.ps.forEach(function (q) { if (q.tipo === "w" && !q.ocupado) { var d = Math.hypot(q.x - p.x, q.y - p.y); if (d < dmin) { dmin = d; alvo = q; } } });
      if (!alvo) return;
      var ang = p.ang * Math.PI / 180, hx = p.x + Math.cos(ang) * S.R * 1.3, hy = p.y + Math.sin(ang) * S.R * 1.3;
      vira(S, p, "x"); alvo.ocupado = true;
      var c = el("circle", { cx: hx, cy: hy, r: S.R * .6, fill: "url(#gH)", stroke: "#C63C28", "stroke-width": 2.5 });
      S.frente.appendChild(c); S.efeitos.push({ tipo: "proton", c: c, t: 0, a: { x: hx, y: hy }, b: alvo });
      p.vx += (p.x - alvo.x) * .8; p.vy += (p.y - alvo.y) * .8; // os íons se afastam
    });
  }

  function dissocia(S) {
    S.rede.forEach(function (q) {
      if (q.preso && S.t > 1 + q.ordem * 0.9) {
        q.preso = false; var a = -Math.PI / 2 + (q.x - S.W / 2) / S.W * 2.4 + (S.rnd() - .5) * .6;
        q.vx = Math.cos(a) * S.v * 2.5; q.vy = Math.sin(a) * S.v * 2.5; q.va = (S.rnd() - .5) * 60; conta(S);
      }
      if (q.preso) { q.x = q.hx + Math.sin(S.t * 8 + q.ordem) * 1.2; q.y = q.hy + Math.cos(S.t * 7 + q.ordem * 1.7) * 1.2; }
    });
  }

  function neutraliza(S, dt, mudo) {
    while (S.solto < S.nAc && S.t > 1 + S.solto * 1.5) { // cada gota de base traz um Na+ e um OH−
      var x = S.R * 4 + S.rnd() * (S.W - S.R * 8);
      var o = nova(S, "oh", x, S.R * 1.6); o.vy = 70; o.entrando = true;
      var n = nova(S, "na", x + S.R * 3, S.R * 1.6); n.vy = 60; n.entrando = true; S.solto++;
    }
    S.ps.forEach(function (o) { // o OH− é atraído pelo H3O+ mais perto (cargas opostas)
      if (o.tipo !== "oh" || o.entrando) return;
      var alvo = null, dmin = 1e9;
      S.ps.forEach(function (h) { if (h.tipo === "h3o") { var d = Math.hypot(h.x - o.x, h.y - o.y); if (d < dmin) { dmin = d; alvo = h; } } });
      if (alvo) { o.rapido = true; o.vx += (alvo.x - o.x) / dmin * 160 * dt; o.vy += (alvo.y - o.y) / dmin * 160 * dt; }
    });
    S.ps.forEach(function (o) {
      if (o.tipo !== "oh" || o.idade < .6) return;
      S.ps.forEach(function (h) {
        if (o.tipo !== "oh" || h.tipo !== "h3o") return;
        if (Math.hypot(h.x - o.x, h.y - o.y) < S.R * 4) { vira(S, h, "w"); vira(S, o, "w"); if (!mudo) anel(S, (h.x + o.x) / 2, (h.y + o.y) / 2); conta(S); }
      });
    });
  }

  function conta(S) {
    var id = S.box.dataset.contador, alvo = id && document.getElementById(id);
    if (!alvo) return;
    var k = 0, n = S.nAc;
    if (S.modo === "ionizacao") { k = S.ps.filter(function (p) { return p.tipo === "x"; }).length; n = S.solto || 0; }
    else if (S.modo === "dissociacao") { k = S.rede.filter(function (q) { return !q.preso; }).length; n = S.rede.length; }
    else { k = S.ps.filter(function (p) { return p.tipo === "h3o"; }).length; }
    alvo.textContent = n === 0 ? "\u00a0" : (S.box.dataset.texto || "{k} de {n}").replace("{k}", k).replace("{n}", n);
  }

  function desenha(S) {
    S.ps.forEach(function (p) { p.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")"); p.rot.setAttribute("transform", "rotate(" + p.ang.toFixed(1) + ")"); });
  }

  function reinicia(S) { var box = S.box; monta(box); box._S.vez = S.vez; }

  return {
    inicia: function (box) { monta(box); },
    zera: function (box) { box._vez = (box._vez || 0) + 1; monta(box); },
    roda: function (box) {
      box._vez = (box._vez || 0) + 1;
      if (!box._S) monta(box);
      if (parado()) { var S0 = box._S; if (!S0.pronto) { for (var n = 0; n < (S0.fim - 2) / 0.02; n++) passo(S0, 0.02, true); } desenha(S0); conta(S0); return; }
      var vez = box._vez, antes = null;
      function quadro(agora) {
        if (box._vez !== vez) return;
        if (antes === null) antes = agora;
        var dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
        var S = box._S; passo(S, dt / 2); passo(box._S, dt / 2); desenha(box._S);
        requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-anima="ions"]').forEach(function (b) { window.QuarksAnimacoes.ions.inicia(b); });
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
});
