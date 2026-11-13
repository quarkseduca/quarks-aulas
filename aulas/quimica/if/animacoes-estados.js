/* Animações de Estados físicos (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo).
   Um motor de partículas só (data-anima="particulas"), com o modo em data-modo:
   - solido: presas na rede, só vibram no lugar;
   - liquido: juntas, sem ordem, deslizando umas sobre as outras;
   - gas: afastadas e rápidas, em todas as direções;
   - perfume: saem do frasco e se espalham pela sala sozinhas;
   - seringa: o êmbolo empurra o gás, que se comprime (espaço vazio entre as partículas);
   - evaporacao: só as partículas mais agitadas da superfície escapam, de vez em quando;
   - ebulicao: líquido agitado com bolhas por todo lado e muitas partículas escapando;
   - aquecimento: acompanha o gráfico da água pura (um ponto corre a curva; o gelo derrete no patamar de 0 °C
     e a água ferve no patamar de 100 °C, com a temperatura parada enquanto o estado muda). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

window.QuarksAnimacoes.particulas = (function () {
  var NS = "http://www.w3.org/2000/svg";
  var parado = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function el(nome, at) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function sorte(semente) { var s = semente || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* curva da água pura (tempo em min, temperatura em °C), a mesma do gráfico do slide e da apostila */
  var CURVA = [[0, -20], [2, 0], [6, 0], [11, 100], [17, 100], [19, 120]];
  function tempAgua(t) {
    for (var i = 1; i < CURVA.length; i++) if (t <= CURVA[i][0]) {
      var a = CURVA[i - 1], b = CURVA[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]);
    }
    return CURVA[CURVA.length - 1][1];
  }

  function monta(box) {
    var W = +box.dataset.w || box.clientWidth || 400, H = +box.dataset.h || box.clientHeight || 300;
    var modo = box.dataset.modo, r = +(box.dataset.r || 13), rnd = sorte(+(box.dataset.semente || 11));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", width: W, height: H });
    svg.style.display = "block";
    var fundo = el("g", {}), camada = el("g", {}), frente = el("g", {});
    svg.appendChild(fundo); svg.appendChild(camada); svg.appendChild(frente);
    var S = { W: W, H: H, r: r, modo: modo, ps: [], svg: svg, fundo: fundo, frente: frente, rnd: rnd, t: 0, chao: H - 6, teto: 6, dir: W - 6, esq: 6 };

    function particula(x, y, f) {
      var c = el("circle", { r: r, fill: "url(#gPart)", stroke: "#3A2196", "stroke-width": 1.5 });
      camada.appendChild(c);
      var p = { x: x, y: y, hx: x, hy: y, vx: 0, vy: 0, f: f, c: c, fase: rnd() * 6.3, a: 1 };
      S.ps.push(p); return p;
    }
    function rede(cols, linhas, x0, yBase, passo) {
      for (var j = 0; j < linhas; j++) for (var i = 0; i < cols; i++)
        particula(x0 + i * passo + (j % 2) * passo / 2, yBase - j * passo * 0.88, "s");
    }
    var passo = r * 2.15;
    if (modo === "solido" || modo === "aquecimento") {
      var cols = +(box.dataset.cols || 6), lin = +(box.dataset.linhas || 4);
      var larg = (cols - 0.5) * passo;
      rede(cols, lin, (W - larg) / 2 + r, S.chao - r - 2, passo);
      if (modo === "aquecimento") {
        // ordem em que derretem (de cima para baixo, com um pouco de acaso) e em que vão para o gás
        S.ps.slice().sort(function (a, b) { return a.hy - b.hy + (rnd() - .5) * passo; }).forEach(function (p, i) { p.ordF = i; });
        S.ps.slice().sort(function () { return rnd() - .5; }).forEach(function (p, i) { p.ordE = i; });
        var raiz = box.closest(".slide") || box.parentNode;
        S.rotulo = raiz.querySelector("[data-estado-agua]");
        S.ponto = raiz.querySelector("[data-ponto]");
        S.leitura = raiz.querySelector("[data-leitura]");
      }
    } else if (modo === "liquido" || modo === "evaporacao" || modo === "ebulicao") {
      var n = +(box.dataset.n || 22), porLinha = Math.floor((W - 12) / (passo * 0.98));
      for (var k = 0; k < n; k++) {
        var p = particula(10 + r + (k % porLinha) * passo * 0.98 + rnd() * 3, S.chao - r - Math.floor(k / porLinha) * passo * 0.9, "l");
        p.vx = (rnd() - .5) * 30;
      }
      if (modo === "ebulicao") {
        S.bolhas = [];
        for (var b = 0; b < 6; b++) {
          var bo = el("circle", { r: 4, fill: "#fff", "fill-opacity": .55, stroke: "#8C7BEA", "stroke-width": 2, opacity: 0 });
          frente.appendChild(bo); S.bolhas.push({ c: bo, x: 20 + rnd() * (W - 40), y: S.chao, v: 40 + rnd() * 30, rr: 3, vivo: false, espera: b * 0.45 });
        }
      }
    } else if (modo === "gas" || modo === "seringa") {
      var ng = +(box.dataset.n || 10);
      for (var g = 0; g < ng; g++) {
        var q = particula(r + 4 + rnd() * (W * (modo === "seringa" ? .55 : 1) - 2 * r - 8), r + 4 + rnd() * (H - 2 * r - 8), "g");
        var ang = rnd() * 6.283, v = +(box.dataset.v || 120);
        q.vx = Math.cos(ang) * v; q.vy = Math.sin(ang) * v;
      }
      if (modo === "seringa") {
        S.x0 = +(box.dataset.x0 || 30); S.x1 = +(box.dataset.x1 || W - 30);
        S.emb = el("g", {});
        S.emb.appendChild(el("rect", { x: 0, y: 6, width: 16, height: H - 12, rx: 6, fill: "#8C7BEA", stroke: "#4B39B3", "stroke-width": 2 }));
        S.emb.appendChild(el("rect", { x: 16, y: H / 2 - 8, width: W, height: 16, rx: 8, fill: "#C9C1F2", stroke: "#8C7BEA", "stroke-width": 2 }));
        frente.appendChild(S.emb);
        S.dir = S.x1;
      }
    } else if (modo === "perfume") {
      S.boca = { x: +(box.dataset.bx || 120), y: +(box.dataset.by || H - 120) };
      S.solta = 0;
      for (var m = 0; m < (+box.dataset.n || 26); m++) { var pp = particula(S.boca.x, S.boca.y + 30, "g"); pp.preso = true; pp.c.setAttribute("opacity", 0); }
    }
    box.innerHTML = "";
    box.appendChild(svg);
    box._S = S;
    desenha(S);
  }

  function desenha(S) {
    S.ps.forEach(function (p) {
      var x = p.x, y = p.y;
      if (p.f === "s") { x = p.hx + Math.sin(S.t * 9 + p.fase) * (S.vib || 1.6); y = p.hy + Math.cos(S.t * 7.3 + p.fase * 1.7) * (S.vib || 1.6); }
      p.c.setAttribute("cx", x.toFixed(1)); p.c.setAttribute("cy", y.toFixed(1));
    });
  }

  function paredes(S, p, e) {
    var r = S.r;
    if (p.x < S.esq + r) { p.x = S.esq + r; p.vx = Math.abs(p.vx) * e; }
    if (p.x > S.dir - r) { p.x = S.dir - r; p.vx = -Math.abs(p.vx) * e; }
    if (p.y > S.chao - r) { p.y = S.chao - r; p.vy = -Math.abs(p.vy) * e; }
    if (p.y < S.teto + r && !S.aberto) { p.y = S.teto + r; p.vy = Math.abs(p.vy) * e; }
  }

  function empurra(S, lista) {
    var d2 = (S.r * 2) * (S.r * 2);
    for (var i = 0; i < lista.length; i++) for (var j = i + 1; j < lista.length; j++) {
      var a = lista[i], b = lista[j], dx = b.x - a.x, dy = b.y - a.y, q = dx * dx + dy * dy;
      if (q < d2 && q > 1e-6) {
        var d = Math.sqrt(q), sobra = (S.r * 2 - d) / 2, nx = dx / d, ny = dy / d;
        var fa = a.f === "s" ? 0 : 1, fb = b.f === "s" ? 0 : 1, t = fa + fb || 1;
        a.x -= nx * sobra * 2 * fa / t; a.y -= ny * sobra * 2 * fa / t;
        b.x += nx * sobra * 2 * fb / t; b.y += ny * sobra * 2 * fb / t;
        var vr = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vr < 0) { a.vx += vr * nx * .5 * fa; a.vy += vr * ny * .5 * fa; b.vx -= vr * nx * .5 * fb; b.vy -= vr * ny * .5 * fb; }
      }
    }
  }

  function passo(S, dt) {
    S.t += dt;
    var rnd = S.rnd, G = 260, agita = 1;
    if (S.modo === "seringa") { // o êmbolo vai e volta (6 s): o gás ocupa menos espaço quando é apertado
      var k = (1 - Math.cos(S.t * 2 * Math.PI / 6)) / 2;
      S.dir = S.x1 - (S.x1 - S.x0) * 0.55 * k;
      S.emb.setAttribute("transform", "translate(" + S.dir.toFixed(1) + " 0)");
    }
    if (S.modo === "aquecimento") aquece(S);
    if (S.modo === "evaporacao" || S.modo === "ebulicao") escapa(S, dt);
    var liq = [];
    S.ps.forEach(function (p) {
      if (p.f === "s") return;
      if (p.f === "l") {
        agita = S.agita || 1;
        p.vy += G * dt;
        p.vx += (rnd() - .5) * 220 * agita * dt * 6; p.vy += (rnd() - .5) * 160 * agita * dt * 6;
        p.vx *= .96; p.vy *= .96;
        liq.push(p);
      } else if (p.f === "g") {
        if (S.modo === "perfume") { // passeia pelo ar trombando nas partículas do ar (muda de direção ao acaso)
          if (p.preso) return;
          var ang = Math.atan2(p.vy, p.vx) + (rnd() - .5) * 1.4, v = 70;
          p.vx = Math.cos(ang) * v; p.vy = Math.sin(ang) * v;
        }
        if (p.sobe) p.vy -= 30 * dt;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      paredes(S, p, p.f === "g" ? 1 : .3);
    });
    if (liq.length) empurra(S, S.modo === "aquecimento" ? S.ps.filter(function (p) { return p.f !== "g"; }) : liq);
    if (S.modo === "perfume") perfume(S, dt);
    if (S.bolhas) S.bolhas.forEach(function (b) {
      if (!b.vivo) { b.espera -= dt; if (b.espera <= 0) { b.vivo = true; b.x = 20 + rnd() * (S.W - 40); b.y = S.chao - 4; b.rr = 3; } else return; }
      b.y -= b.v * dt; b.rr = Math.min(11, b.rr + 9 * dt);
      var topo = S.nivel || S.H * .45;
      b.c.setAttribute("cx", b.x.toFixed(1)); b.c.setAttribute("cy", b.y.toFixed(1)); b.c.setAttribute("r", b.rr.toFixed(1));
      b.c.setAttribute("opacity", b.y < topo ? 0 : 1);
      if (b.y < topo) { b.vivo = false; b.espera = rnd() * 1.2; }
    });
    desenha(S);
  }

  function perfume(S, dt) {
    S.solta += dt;
    var livres = Math.min(S.ps.length, Math.floor(S.solta / 0.45));
    for (var i = 0; i < livres; i++) {
      var p = S.ps[i];
      if (p.preso) { p.preso = false; p.x = S.boca.x; p.y = S.boca.y; var a = -Math.PI / 2 + (S.rnd() - .5); p.vx = Math.cos(a) * 70; p.vy = Math.sin(a) * 70; p.c.setAttribute("opacity", 1); }
    }
    if (S.solta > 24) { // recomeça: o frasco "enche" de novo
      S.solta = 0; S.ps.forEach(function (p) { p.preso = true; p.c.setAttribute("opacity", 0); });
    }
  }

  function escapa(S, dt) {
    var liq = S.ps.filter(function (p) { return p.f === "l"; });
    var topo = liq.reduce(function (m, p) { return Math.min(m, p.y); }, S.H);
    S.nivel = topo;
    S.agita = S.modo === "ebulicao" ? 2.4 : 1;
    S.espera = (S.espera || 0) - dt;
    if (S.espera <= 0 && liq.length > 6) { // uma das mais agitadas da superfície escapa
      var sup = liq.filter(function (p) { return p.y < topo + S.r * 1.5; });
      var p = sup[Math.floor(S.rnd() * sup.length)];
      if (p) { p.f = "g"; p.vy = -(S.modo === "ebulicao" ? 150 : 90); p.vx = (S.rnd() - .5) * 60; p.sobe = true; }
      S.espera = S.modo === "ebulicao" ? 0.35 + S.rnd() * .3 : 1.6 + S.rnd() * 1.4;
    }
    S.aberto = true;
    S.ps.forEach(function (p) { // saiu pelo alto: volta ao líquido por baixo (a quantidade do desenho não acaba)
      if (p.f === "g" && p.y < -S.r * 2) { p.f = "l"; p.sobe = false; p.y = S.chao - S.r; p.x = S.r + 8 + S.rnd() * (S.W - 2 * S.r - 16); p.vx = 0; p.vy = 0; }
    });
  }

  function aquece(S) {
    var dur = 17, ciclo = dur + 3, tc = S.t % ciclo;
    if (S.ultimo !== undefined && tc < S.ultimo) reinicia(S);
    S.ultimo = tc;
    var t = Math.min(19, tc / dur * 19), T = tempAgua(t), N = S.ps.length;
    var fs = t < 2 ? 1 : t < 6 ? 1 - (t - 2) / 4 : 0, fg = t < 11 ? 0 : t < 17 ? (t - 11) / 6 : 1;
    S.vib = 1.2 + Math.max(0, T + 20) / 20 * 1.6; // mais quente, mais agitado
    S.agita = .7 + Math.max(0, T) / 100 * 1.3;
    S.ps.forEach(function (p) {
      if (p.f === "s" && p.ordF < (1 - fs) * N - 0.5) { p.f = "l"; p.x = p.hx; p.y = p.hy; p.vx = (S.rnd() - .5) * 40; }
      if (p.f === "l" && p.ordE < fg * N - 0.5) { p.f = "g"; var a = S.rnd() * 6.283; p.vx = Math.cos(a) * 170; p.vy = -Math.abs(Math.sin(a)) * 170 - 40; }
    });
    var nome = fs === 1 ? "sólido" : fs > 0 ? "sólido + líquido" : fg === 0 ? "líquido" : fg < 1 ? "líquido + gás" : "gás";
    if (S.rotulo && S.rotulo.textContent !== nome) S.rotulo.textContent = nome;
    if (S.ponto) { // o ponto corre sobre a curva do gráfico
      var X = +S.ponto.dataset.x0 + t * +S.ponto.dataset.kx, Y = +S.ponto.dataset.y0 - (T - +S.ponto.dataset.t0) * +S.ponto.dataset.ky;
      S.ponto.setAttribute("transform", "translate(" + X.toFixed(1) + " " + Y.toFixed(1) + ")");
    }
    if (S.leitura) S.leitura.textContent = Math.round(t) + " min · " + Math.round(T) + " °C";
  }

  function reinicia(S) {
    S.ps.forEach(function (p) { p.f = "s"; p.x = p.hx; p.y = p.hy; p.vx = 0; p.vy = 0; });
  }

  return {
    inicia: function (box) { monta(box); },
    zera: function (box) { box._vez = (box._vez || 0) + 1; monta(box); if (box.dataset.modo === "aquecimento") aquece(box._S); },
    roda: function (box) {
      box._vez = (box._vez || 0) + 1;
      if (!box._S) monta(box);
      var S = box._S;
      if (parado()) { if (S.modo === "aquecimento") { S.t = 19; aquece(S); } desenha(S); return; }
      var vez = box._vez, antes = null;
      function quadro(agora) {
        if (box._vez !== vez) return;
        if (antes === null) antes = agora;
        var dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
        passo(S, dt / 2); passo(S, dt / 2); // dois meios passos: as partículas não atravessam umas as outras
        requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-anima="particulas"]').forEach(function (b) { window.QuarksAnimacoes.particulas.inicia(b); });
});
