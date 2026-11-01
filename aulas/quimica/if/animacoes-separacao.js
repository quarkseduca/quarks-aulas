/* Animações de Separação de misturas (Química, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (o motor chama roda/zera pelo data-anima-passo).
   Cada animação mostra o método funcionando:
   - "decanta":    as partículas de terra descem e assentam no fundo do béquer; a água vai clareando.
   - "ima":        o ímã desce e só a limalha de ferro sobe até ele; a areia fica.
   - "centrifuga": no tubo, as hemácias (mais densas) descem e o plasma amarelo aparece em cima.
   - "funil":      a torneira abre, a água (mais densa, embaixo) escoa para o béquer e para na interface.
   - "destila":    bolhas no balão, o vapor sobe, condensa no tubo resfriado e pinga no frasco coletor.
   Com prefers-reduced-motion, cada uma mostra direto o estado final, sem movimento. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  function reduz() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function num(el, k, padrao) { var v = parseFloat(el.dataset[k]); return isNaN(v) ? padrao : v; }
  function el(tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  /* números "aleatórios" sempre iguais (a figura não muda a cada abertura) */
  function sorteio(semente) { var s = semente || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* laço de quadros comum: chama desenha(g, t em segundos); para quando o g é zerado */
  function laco(g, desenha, fim) {
    g._vez = (g._vez || 0) + 1;
    var vez = g._vez, t0 = null, ultimo = 0;
    function quadro(agora) {
      if (g._vez !== vez) return;
      if (t0 === null) t0 = agora;
      var t = (agora - t0) / 1000;
      if (agora - ultimo > 33) { ultimo = agora; desenha(g, t); }
      if (fim && t > fim) { desenha(g, fim); return; }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }
  function para(g) { g._vez = (g._vez || 0) + 1; }

  /* ---------- decantação: terra que assenta ---------- */
  function prepDecanta(g) {
    if (!g._p) {
      var r = sorteio(11), x0 = num(g, "x0", 0), x1 = num(g, "x1", 100), y0 = num(g, "y0", 0), y1 = num(g, "y1", 100), n = num(g, "n", 60);
      g._p = [];
      for (var i = 0; i < n; i++) {
        var raio = 3 + r() * 5, x = x0 + raio + r() * (x1 - x0 - 2 * raio);
        var c = el("circle", { r: raio.toFixed(1), fill: r() < .5 ? "#9C6B3E" : "#B98A57" });
        g.appendChild(c);
        g._p.push({ c: c, x: x, y: y0 + raio + r() * (y1 - y0 - 2 * raio - 30), yf: y1 - raio - r() * 22, dur: 2 + 4.5 * (1 - (raio - 3) / 5) });
      }
      g._turvo = g.querySelector(".turvo");
    }
  }
  function desDecanta(g, t) {
    var maxDur = 6.5;
    g._p.forEach(function (p) {
      var f = suave(t / p.dur);
      p.c.setAttribute("cx", p.x.toFixed(1));
      p.c.setAttribute("cy", (p.y + (p.yf - p.y) * f).toFixed(1));
    });
    if (g._turvo) g._turvo.setAttribute("opacity", (0.42 * (1 - suave(t / maxDur)) + 0.04).toFixed(2));
  }
  window.QuarksAnimacoes.decanta = {
    inicia: function (g) { prepDecanta(g); desDecanta(g, 0); },
    zera: function (g) { para(g); prepDecanta(g); desDecanta(g, 0); },
    roda: function (g) { prepDecanta(g); if (reduz()) { desDecanta(g, 99); return; } laco(g, desDecanta, 7); }
  };

  /* ---------- separação magnética: só o ferro sobe ---------- */
  function prepIma(g) {
    if (!g._p) {
      var r = sorteio(5), x0 = num(g, "x0", 0), x1 = num(g, "x1", 100), y0 = num(g, "y0", 0), y1 = num(g, "y1", 20);
      var polos = (g.dataset.polos || "0,40").split(";").map(function (s) { return s.split(",").map(Number); });
      var ym = num(g, "ym", 0);
      g._areia = el("g", {}); g._ferro = el("g", {});
      g.appendChild(g._areia); g.appendChild(g._ferro);
      for (var i = 0; i < 70; i++) {
        g._areia.appendChild(el("circle", { cx: (x0 + r() * (x1 - x0)).toFixed(1), cy: (y0 + r() * (y1 - y0)).toFixed(1), r: (4 + r() * 3).toFixed(1), fill: r() < .5 ? "#E2C48C" : "#D2AE6E" }));
      }
      g._p = [];
      for (var j = 0; j < 34; j++) {
        var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), ang = r() * 180;
        var polo = polos[j % polos.length], xf = polo[0] + r() * (polo[1] - polo[0]), yf = ym + 4 + r() * 16;
        var e = el("rect", { x: -7, y: -2, width: 14, height: 4, rx: 2, fill: "#5A5A66" });
        g._ferro.appendChild(e);
        g._p.push({ e: e, x: x, y: y, a: ang, xf: xf, yf: yf, af: 90 + (r() - .5) * 40, atraso: r() * 1.2 });
      }
      g._corpo = g.querySelector(".ima-corpo");
    }
  }
  function desIma(g, t) {
    var desce = suave(t / 1.4);
    if (g._corpo) g._corpo.setAttribute("transform", "translate(0 " + (-60 * (1 - desce)).toFixed(1) + ")");
    g._p.forEach(function (p) {
      var f = suave((t - 1.4 - p.atraso) / 1.3), x = p.x + (p.xf - p.x) * f, y = p.y + (p.yf - p.y) * f, a = p.a + (p.af - p.a) * f;
      if (f >= 1 && t < 40) { x += Math.sin(t * 6 + p.xf) * .8; } /* presa ao ímã, tremendo de leve */
      p.e.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + a.toFixed(0) + ")");
    });
  }
  window.QuarksAnimacoes.ima = {
    inicia: function (g) { prepIma(g); desIma(g, 0); },
    zera: function (g) { para(g); prepIma(g); desIma(g, 0); },
    roda: function (g) { prepIma(g); if (reduz()) { desIma(g, 99); return; } laco(g, desIma, 40); }
  };

  /* ---------- centrifugação: hemácias descem, plasma aparece ---------- */
  function prepCentrifuga(g) {
    if (!g._p) {
      var r = sorteio(3), x0 = num(g, "x0", 0), x1 = num(g, "x1", 40), y0 = num(g, "y0", 0), y1 = num(g, "y1", 200), yc = num(g, "yc", 120);
      g._p = [];
      for (var i = 0; i < 46; i++) {
        var c = el("circle", { r: "4.5", fill: "#B5202E", stroke: "#7E1220", "stroke-width": "1" });
        g.appendChild(c);
        g._p.push({ c: c, x: x0 + 5 + r() * (x1 - x0 - 10), y: y0 + 5 + r() * (y1 - y0 - 10), yf: yc + 6 + r() * (y1 - yc - 12) });
      }
      g._mistura = g.querySelector(".mistura");
    }
  }
  function desCentrifuga(g, t) {
    var f = suave(t / 6);
    g._p.forEach(function (p) {
      var y = p.y < p.yf ? p.y + (p.yf - p.y) * f : p.y + (p.yf - p.y) * f;
      p.c.setAttribute("cx", p.x.toFixed(1)); p.c.setAttribute("cy", y.toFixed(1));
    });
    if (g._mistura) g._mistura.setAttribute("opacity", (1 - f).toFixed(2));
  }
  window.QuarksAnimacoes.centrifuga = {
    inicia: function (g) { prepCentrifuga(g); desCentrifuga(g, 0); },
    zera: function (g) { para(g); prepCentrifuga(g); desCentrifuga(g, 0); },
    roda: function (g) { prepCentrifuga(g); if (reduz()) { desCentrifuga(g, 99); return; } laco(g, desCentrifuga, 6.5); }
  };

  /* ---------- funil de separação: a água escoa e a torneira fecha na interface ---------- */
  function prepFunil(g) {
    if (!g._ok) {
      g._ok = true;
      g._oleo = g.querySelector(".oleo"); g._agua = g.querySelector(".agua"); g._bequer = g.querySelector(".coletado");
      g._valv = g.querySelector(".valvula"); g._gota = g.querySelector(".gota");
    }
  }
  function desFunil(g, t) {
    var yO0 = num(g, "oleo0", 150), yI0 = num(g, "inter0", 260), yI1 = num(g, "inter1", 360), yB0 = num(g, "beq0", 540), yB1 = num(g, "beq1", 500);
    var yFim = num(g, "fim", 420), xT = num(g, "xt", 210), yT = num(g, "yt", 440), yS = num(g, "ys", 520);
    var abre = t > .8, f = suave((t - .8) / 5.5), fechado = t > 6.5;
    var yI = yI0 + (yI1 - yI0) * f, desl = yI - yI0;
    g._oleo.setAttribute("y", (yO0 + desl * .55).toFixed(1));
    g._oleo.setAttribute("height", (yI - yO0 - desl * .55).toFixed(1));
    g._agua.setAttribute("y", yI.toFixed(1));
    g._agua.setAttribute("height", Math.max(0, yFim - yI).toFixed(1));
    var yb = yB0 + (yB1 - yB0) * f;
    g._bequer.setAttribute("y", yb.toFixed(1));
    g._bequer.setAttribute("height", (yB0 - yb + 2).toFixed(1));
    if (g._valv) g._valv.setAttribute("transform", "rotate(" + (abre && !fechado ? 90 : 0) + " " + xT + " " + num(g, "yv", 400) + ")");
    if (g._gota) {
      if (abre && !fechado) {
        var c = ((t - .8) % .55) / .55;
        g._gota.setAttribute("opacity", "1");
        g._gota.setAttribute("cy", (yT + (Math.min(yS, yb) - yT) * c * c).toFixed(1));
      } else g._gota.setAttribute("opacity", "0");
    }
  }
  window.QuarksAnimacoes.funil = {
    inicia: function (g) { prepFunil(g); desFunil(g, 0); },
    zera: function (g) { para(g); prepFunil(g); desFunil(g, 0); },
    roda: function (g) { prepFunil(g); if (reduz()) { desFunil(g, 99); return; } laco(g, desFunil, 7.5); }
  };

  /* ---------- destilação: bolhas, vapor que vira gota, frasco que enche ---------- */
  function prepDestila(g) {
    if (!g._ok) {
      g._ok = true;
      var r = sorteio(17);
      g._cam = g.querySelector(".caminho");
      g._L = g._cam.getTotalLength();
      g._liq = parseFloat(g.dataset.liquido || "0.45"); /* fração do caminho em que o vapor já virou líquido */
      g._v = []; g._b = [];
      for (var i = 0; i < 14; i++) { var c = el("circle", { r: "6" }); g.appendChild(c); g._v.push({ c: c, fase: i / 14 }); }
      var bx0 = num(g, "bx0", 0), bx1 = num(g, "bx1", 50), by0 = num(g, "by0", 0), by1 = num(g, "by1", 40);
      for (var j = 0; j < 9; j++) {
        var b = el("circle", { r: (3 + r() * 3).toFixed(1), fill: "none", stroke: "#fff", "stroke-width": "2.5" });
        g.appendChild(b);
        g._b.push({ c: b, x: bx0 + r() * (bx1 - bx0), y0: by1, y1: by0, fase: r() });
      }
      g._gota = el("circle", { r: "6", fill: "#5DA9E9" }); g.appendChild(g._gota);
      g._col = g.querySelector(".coletado");
      g._fimP = g._cam.getPointAtLength(g._L);
    }
  }
  function desDestila(g, t) {
    var per = 3.2; /* segundos para o vapor percorrer o caminho */
    g._v.forEach(function (v) {
      var s = ((t / per) + v.fase) % 1, p = g._cam.getPointAtLength(s * g._L), liquido = s > g._liq;
      v.c.setAttribute("cx", p.x.toFixed(1)); v.c.setAttribute("cy", p.y.toFixed(1));
      v.c.setAttribute("fill", liquido ? "#5DA9E9" : "#C9C0F0");
      v.c.setAttribute("r", liquido ? "5" : "7");
      v.c.setAttribute("opacity", t === 0 ? "0" : (liquido ? ".95" : ".8"));
    });
    g._b.forEach(function (b) {
      var s = ((t / 1.6) + b.fase) % 1;
      b.c.setAttribute("cx", (b.x + Math.sin(s * 9) * 2).toFixed(1));
      b.c.setAttribute("cy", (b.y0 + (b.y1 - b.y0) * s).toFixed(1));
      b.c.setAttribute("opacity", t === 0 ? "0" : (s < .85 ? ".9" : "0"));
    });
    var yc0 = num(g, "c0", 570), yc1 = num(g, "c1", 520), enche = Math.min(1, t / 24), yc = yc0 - (yc0 - yc1) * enche;
    if (g._col) { g._col.setAttribute("y", yc.toFixed(1)); g._col.setAttribute("height", (yc0 - yc + 2).toFixed(1)); }
    var q = (t % .8) / .8;
    g._gota.setAttribute("cx", g._fimP.x.toFixed(1));
    g._gota.setAttribute("cy", (g._fimP.y + (yc - g._fimP.y) * q * q).toFixed(1));
    g._gota.setAttribute("opacity", t === 0 ? "0" : "1");
  }
  window.QuarksAnimacoes.destila = {
    inicia: function (g) { prepDestila(g); desDestila(g, 0); },
    zera: function (g) { para(g); prepDestila(g); desDestila(g, 0); },
    roda: function (g) {
      prepDestila(g);
      if (reduz()) { desDestila(g, 24); g._v.concat(g._b).forEach(function (v) { v.c.setAttribute("opacity", "0"); }); g._gota.setAttribute("opacity", "0"); return; }
      laco(g, desDestila);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    ["decanta", "ima", "centrifuga", "funil", "destila"].forEach(function (nome) {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (g) { window.QuarksAnimacoes[nome].inicia(g); });
    });
  });
})();
