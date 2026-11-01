/* Animações de Óxidos (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo).
   - chuvaacida: a chaminé e o escapamento soltam moléculas de SO2 e NO2 que sobem até a nuvem;
     a nuvem escurece e as gotas ácidas caem sobre a estátua de mármore, que vai sendo corroída;
   - estufa: a luz do Sol (amarela) atravessa o ar e aquece o chão; o chão devolve calor (infravermelho, vermelho);
     cada molécula de CO2 que o calor encontra o reenvia em qualquer direção. Com mais CO2 (data-co2 maior),
     mais calor volta para o chão. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var parado = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function el(nome, at, pai) { var e = document.createElementNS(NS, nome); for (var k in at) e.setAttribute(k, at[k]); if (pai) pai.appendChild(e); return e; }
  function sorte(semente) { var s = semente || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* molécula angular (SO2, NO2) ou linear (CO2), desenhada em volta de (0,0) */
  function molecula(pai, tipo) {
    var g = el("g", {}, pai);
    if (tipo === "co2") {
      el("circle", { cx: -17, cy: 0, r: 9, fill: "#E5533D", stroke: "#8E2115", "stroke-width": 1.5 }, g);
      el("circle", { cx: 17, cy: 0, r: 9, fill: "#E5533D", stroke: "#8E2115", "stroke-width": 1.5 }, g);
      el("circle", { cx: 0, cy: 0, r: 10, fill: "#3A3A44", stroke: "#1C1C22", "stroke-width": 1.5 }, g);
    } else {
      var cor = tipo === "no2" ? "#3D6FD6" : "#F2C400", borda = tipo === "no2" ? "#1B3E94" : "#8A6A00";
      el("circle", { cx: -12, cy: 7, r: 7.5, fill: "#E5533D", stroke: "#8E2115", "stroke-width": 1.5 }, g);
      el("circle", { cx: 12, cy: 7, r: 7.5, fill: "#E5533D", stroke: "#8E2115", "stroke-width": 1.5 }, g);
      el("circle", { cx: 0, cy: -2, r: 10, fill: cor, stroke: borda, "stroke-width": 1.5 }, g);
    }
    return g;
  }

  /* ------------------------------------------------------------------ chuva ácida */
  function montaChuva(box) {
    var W = +box.dataset.w || 900, H = +box.dataset.h || 520, rnd = sorte(13);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true" });
    svg.style.display = "block";
    var chao = H - 50;
    el("rect", { x: 0, y: 0, width: W, height: H, rx: 24, fill: "#F4F2FD" }, svg);
    el("rect", { x: 0, y: chao, width: W, height: H - chao, fill: "#D9EFD3" }, svg);
    // fábrica com chaminé (esquerda)
    var fx = 60;
    el("rect", { x: fx, y: chao - 110, width: 150, height: 110, rx: 8, fill: "#B9B0E6", stroke: "#7F7A99", "stroke-width": 3 }, svg);
    el("rect", { x: fx + 104, y: chao - 230, width: 34, height: 125, fill: "#9A91CC", stroke: "#7F7A99", "stroke-width": 3 }, svg);
    for (var j = 0; j < 3; j++) el("rect", { x: fx + 18 + j * 30, y: chao - 70, width: 18, height: 26, rx: 3, fill: "#FFE680" }, svg);
    // carro (meio)
    var cx = 300;
    el("path", { d: "M" + cx + " " + (chao - 14) + " v-26 q0-10 10-10 h26 l18-22 h56 l20 22 h18 q10 0 10 10 v26 z", fill: "#8C7BEA", stroke: "#4B39B3", "stroke-width": 3 }, svg);
    el("circle", { cx: cx + 30, cy: chao - 12, r: 13, fill: "#292B2C" }, svg);
    el("circle", { cx: cx + 118, cy: chao - 12, r: 13, fill: "#292B2C" }, svg);
    // estátua de mármore (direita)
    var ex = W - 170;
    el("rect", { x: ex - 10, y: chao - 40, width: 120, height: 40, rx: 4, fill: "#E9E6F2", stroke: "#9A95AD", "stroke-width": 3 }, svg);
    var est = el("g", {}, svg);
    el("circle", { cx: ex + 50, cy: chao - 150, r: 24, fill: "#F6F4FB", stroke: "#9A95AD", "stroke-width": 3 }, est);
    el("path", { d: "M" + (ex + 18) + " " + (chao - 40) + " l8 -86 q24 -12 48 0 l8 86 z", fill: "#F6F4FB", stroke: "#9A95AD", "stroke-width": 3 }, est);
    var manchas = el("g", {}, svg), lista = [];
    [[ex + 40, chao - 154, 6], [ex + 60, chao - 140, 5], [ex + 34, chao - 100, 7], [ex + 64, chao - 80, 6], [ex + 44, chao - 62, 5], [ex + 58, chao - 112, 4]].forEach(function (m) {
      lista.push(el("circle", { cx: m[0], cy: m[1], r: m[2], fill: "#9A95AD", opacity: 0 }, manchas));
    });
    // nuvem
    var nuvem = el("g", {}, svg), nx = W - 300, ny = 90;
    var corNuvem = [];
    [[nx, ny, 50], [nx + 60, ny - 22, 58], [nx + 125, ny, 50], [nx + 60, ny + 18, 52], [nx + 175, ny + 10, 36], [nx - 40, ny + 12, 34]].forEach(function (c) {
      corNuvem.push(el("circle", { cx: c[0], cy: c[1], r: c[2], fill: "#FFFFFF", stroke: "#C9C1F2", "stroke-width": 2 }, nuvem));
    });
    var camadaM = el("g", {}, svg), camadaG = el("g", {}, svg);
    var S = { W: W, H: H, chao: chao, rnd: rnd, t: 0, mols: [], gotas: [], manchas: lista, nuvem: corNuvem, carga: 0,
      fontes: [{ x: fx + 121, y: chao - 236, tipo: "so2" }, { x: cx - 4, y: chao - 22, tipo: "no2" }], nx: nx + 60, ny: ny, ex: ex, camadaM: camadaM, camadaG: camadaG, espera: 0, esperaG: 0 };
    box.innerHTML = ""; box.appendChild(svg); box._S = S;
  }

  function passoChuva(S, dt) {
    S.t += dt;
    var rnd = S.rnd;
    S.espera -= dt;
    if (S.espera <= 0 && S.mols.length < 14) {
      var f = S.fontes[rnd() < .6 ? 0 : 1];
      var g = molecula(S.camadaM, f.tipo);
      S.mols.push({ g: g, x: f.x, y: f.y, x0: f.x, y0: f.y, k: 0, fase: rnd() * 6.3, dur: 5 + rnd() * 2, ax: S.nx - 70 + rnd() * 140 });
      S.espera = .7 + rnd() * .5;
    }
    S.mols = S.mols.filter(function (m) {
      m.k += dt / m.dur;
      var k = Math.min(1, m.k), alvoX = m.ax, alvoY = S.ny + 10;
      m.x = m.x0 + (alvoX - m.x0) * k + Math.sin(S.t * 2 + m.fase) * 10;
      m.y = m.y0 + (alvoY - m.y0) * (1 - Math.pow(1 - k, 1.6));
      var op = k > .9 ? (1 - k) * 10 : 1;
      m.g.setAttribute("transform", "translate(" + m.x.toFixed(1) + " " + m.y.toFixed(1) + ") rotate(" + (Math.sin(S.t * 3 + m.fase) * 20).toFixed(1) + ")");
      m.g.setAttribute("opacity", op.toFixed(2));
      if (k >= 1) { m.g.remove(); S.carga = Math.min(1, S.carga + .08); return false; }
      return true;
    });
    // a nuvem fica cinza com os óxidos que reagem com a água dela
    var tom = Math.round(255 - S.carga * 70);
    S.nuvem.forEach(function (c) { c.setAttribute("fill", "rgb(" + tom + "," + tom + "," + Math.min(255, tom + 14) + ")"); });
    // gotas ácidas: começam quando a nuvem já recebeu óxidos
    S.esperaG -= dt;
    if (S.carga > .25 && S.esperaG <= 0) {
      var x = S.nx - 90 + rnd() * 210;
      var gota = el("path", { d: "M0 -12 q7 10 7 15 a7 7 0 0 1 -14 0 q0 -5 7 -15 z", fill: "#7FB2E8", stroke: "#2E6FB3", "stroke-width": 1.5 }, S.camadaG);
      S.gotas.push({ g: gota, x: x, y: S.ny + 60, v: 230 + rnd() * 60 });
      S.esperaG = .16 + rnd() * .12;
    }
    S.gotas = S.gotas.filter(function (d) {
      d.y += d.v * dt;
      d.g.setAttribute("transform", "translate(" + d.x.toFixed(1) + " " + d.y.toFixed(1) + ")");
      var noAlvo = d.x > S.ex + 10 && d.x < S.ex + 92 && d.y > S.chao - 170;
      if (d.y > S.chao - 4 || noAlvo) {
        if (noAlvo) { var m = S.manchas[Math.floor(rnd() * S.manchas.length)]; m.setAttribute("opacity", Math.min(.85, +m.getAttribute("opacity") + .06).toFixed(2)); }
        d.g.remove(); return false;
      }
      return true;
    });
    if (S.t > 40) { // recomeça: estátua limpa, nuvem branca
      S.t = 0; S.carga = 0; S.manchas.forEach(function (m) { m.setAttribute("opacity", 0); });
    }
  }

  function quadroFinalChuva(S) {
    S.carga = .8;
    var tom = Math.round(255 - S.carga * 70);
    S.nuvem.forEach(function (c) { c.setAttribute("fill", "rgb(" + tom + "," + tom + "," + (tom + 14) + ")"); });
    S.manchas.forEach(function (m) { m.setAttribute("opacity", .7); });
    S.fontes.forEach(function (f, i) { for (var k = 1; k <= 3; k++) { var g = molecula(S.camadaM, f.tipo); var x = f.x + (S.nx - f.x) * k / 4, y = f.y + (S.ny - f.y) * k / 4; g.setAttribute("transform", "translate(" + x + " " + y + ")"); } });
    for (var k = 0; k < 8; k++) { var g = el("path", { d: "M0 -12 q7 10 7 15 a7 7 0 0 1 -14 0 q0 -5 7 -15 z", fill: "#7FB2E8", stroke: "#2E6FB3", "stroke-width": 1.5 }, S.camadaG); g.setAttribute("transform", "translate(" + (S.nx - 80 + k * 26) + " " + (S.ny + 90 + (k % 3) * 70) + ")"); }
  }

  /* ------------------------------------------------------------------ efeito estufa */
  function montaEstufa(box) {
    var W = +box.dataset.w || 600, H = +box.dataset.h || 480, n = +(box.dataset.co2 || 4), rnd = sorte(+(box.dataset.semente || 21));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, "aria-hidden": "true" });
    svg.style.display = "block";
    var chao = H - 60;
    el("rect", { x: 0, y: 0, width: W, height: H, rx: 24, fill: "#F4F2FD" }, svg);
    el("rect", { x: 0, y: 110, width: W, height: chao - 110, fill: "#E9E4FC" }, svg); // atmosfera
    el("rect", { x: 0, y: chao, width: W, height: H - chao, fill: "#CFE8C4" }, svg);
    var sol = el("g", {}, svg);
    el("circle", { cx: 60, cy: 56, r: 34, fill: "#FFD10C" }, sol);
    var raios = el("g", {}, svg), calor = el("g", {}, svg), mols = el("g", {}, svg);
    var S = { W: W, H: H, chao: chao, rnd: rnd, t: 0, luz: [], ir: [], co2: [], raios: raios, calor: calor, espL: 0, espI: 0, topo: 110 };
    for (var i = 0; i < n; i++) {
      var x = 50 + (i + .5) * (W - 100) / n + (rnd() - .5) * 20, y = 145 + (i % 3) * (chao - 230) / 2 + rnd() * 20;
      var g = molecula(mols, "co2");
      S.co2.push({ g: g, x: x, y: y, fase: rnd() * 6.3, brilho: 0 });
    }
    box.innerHTML = ""; box.appendChild(svg); box._S = S;
    desenhaCO2(S);
  }

  function desenhaCO2(S) {
    S.co2.forEach(function (m) {
      var a = 1.4 + m.brilho * 3;
      m.g.setAttribute("transform", "translate(" + (m.x + Math.sin(S.t * 8 + m.fase) * a).toFixed(1) + " " + (m.y + Math.cos(S.t * 6.5 + m.fase) * a).toFixed(1) + ")");
    });
  }

  function passoEstufa(S, dt) {
    S.t += dt;
    var rnd = S.rnd;
    S.espL -= dt;
    if (S.espL <= 0) { // luz do Sol entra
      var x0 = 70 + rnd() * 30, ang = .5 + rnd() * .5;
      var r = el("path", { d: "M0 0 L-16 -10", stroke: "#F2B800", "stroke-width": 5, "stroke-linecap": "round" }, S.raios);
      S.luz.push({ g: r, x: x0, y: 80, vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260 });
      S.espL = .3 + rnd() * .15;
    }
    S.luz = S.luz.filter(function (p) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + (Math.atan2(p.vy, p.vx) * 180 / Math.PI + 180 + 32) + ")");
      if (p.y >= S.chao - 2 || p.x > S.W) { // chega ao chão: vira calor que sobe
        p.g.remove();
        if (p.x < S.W - 10) soltaCalor(S, p.x);
        return false;
      }
      return true;
    });
    S.ir = S.ir.filter(function (p) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida += dt;
      var onda = "M0 0 q5 -6 10 0 t10 0 t10 0";
      p.g.setAttribute("d", onda);
      p.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + (Math.atan2(p.vy, p.vx) * 180 / Math.PI) + ")");
      for (var i = 0; i < S.co2.length; i++) {
        var m = S.co2[i];
        if (!p.pegos[i] && Math.abs(p.x - m.x) < 34 && Math.abs(p.y - m.y) < 26) { // o CO2 absorve e reenvia em direção qualquer
          p.pegos[i] = true; m.brilho = 1;
          var a = rnd() < .6 ? Math.PI / 2 + (rnd() - .5) * 1.4 : -Math.PI / 2 + (rnd() - .5) * 1.4, v = 150;
          p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
          p.g.setAttribute("stroke", "#C2384F");
          break;
        }
      }
      if (p.y >= S.chao && p.vy > 0) { p.g.remove(); return false; } // voltou ao chão: aquece de novo
      if (p.y < S.topo - 20 || p.x < -20 || p.x > S.W + 20) { p.g.remove(); return false; } // escapou para o espaço
      return true;
    });
    S.co2.forEach(function (m) { m.brilho = Math.max(0, m.brilho - dt * 1.5); });
    desenhaCO2(S);
  }

  function soltaCalor(S, x) {
    var a = -Math.PI / 2 + (S.rnd() - .5) * .9, v = 140;
    var g = el("path", { d: "M0 0", fill: "none", stroke: "#E5533D", "stroke-width": 4, "stroke-linecap": "round" }, S.calor);
    S.ir.push({ g: g, x: x, y: S.chao - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0, pegos: {} });
  }

  function quadroFinalEstufa(S) {
    [[.25, .55], [.5, .4], [.75, .6]].forEach(function (q) {
      var r = el("path", { d: "M0 0 L-16 -10", stroke: "#F2B800", "stroke-width": 5, "stroke-linecap": "round" }, S.raios);
      r.setAttribute("transform", "translate(" + (q[0] * S.W) + " " + (q[1] * S.H) + ") rotate(212)");
      var c = el("path", { d: "M0 0 q5 -6 10 0 t10 0 t10 0", fill: "none", stroke: "#E5533D", "stroke-width": 4 }, S.calor);
      c.setAttribute("transform", "translate(" + (q[0] * S.W + 40) + " " + (q[1] * S.H + 60) + ") rotate(-90)");
    });
  }

  function motor(monta, passo, final) {
    return {
      inicia: function (box) { monta(box); },
      zera: function (box) { box._vez = (box._vez || 0) + 1; monta(box); },
      roda: function (box) {
        box._vez = (box._vez || 0) + 1;
        if (!box._S) monta(box);
        var S = box._S;
        if (parado()) { final(S); return; }
        var vez = box._vez, antes = null;
        function quadro(agora) {
          if (box._vez !== vez) return;
          if (antes === null) antes = agora;
          var dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
          passo(S, dt);
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
  }

  window.QuarksAnimacoes.chuvaacida = motor(montaChuva, passoChuva, quadroFinalChuva);
  window.QuarksAnimacoes.estufa = motor(montaEstufa, passoEstufa, quadroFinalEstufa);

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[data-anima="chuvaacida"]').forEach(function (b) { window.QuarksAnimacoes.chuvaacida.inicia(b); });
    document.querySelectorAll('[data-anima="estufa"]').forEach(function (b) { window.QuarksAnimacoes.estufa.inicia(b); });
  });
})();
