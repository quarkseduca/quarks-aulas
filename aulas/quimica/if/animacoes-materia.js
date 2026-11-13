/* Animações de Substâncias e misturas (Química, IF).
   Regra: só se movem na tela aberta (.slide.ativo) e depois que a figura aparece (.mostra).
   - Moléculas (svg.vibra): os átomos vibram de leve, sempre: a matéria nunca fica parada.
   - Redes do carbono (data-anima="rede-3d"): diamante e fulereno giram devagar para mostrar o 3D;
     no grafite, a camada do meio desliza sobre as outras (por isso ele risca o papel). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

window.QuarksAnimacoes["rede-3d"] = (function () {
  var NS = "http://www.w3.org/2000/svg";
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
  function ligacoes(p, d, tol) {
    var e = [];
    for (var i = 0; i < p.length; i++) for (var j = i + 1; j < p.length; j++) if (Math.abs(dist(p[i], p[j]) - d) < tol) e.push([i, j]);
    return e;
  }
  function fulereno() {
    var f = (1 + Math.sqrt(5)) / 2, base = [[0, 1, 3 * f], [1, 2 + f, 2 * f], [f, 2, 2 * f + 1]], vistos = {}, p = [];
    base.forEach(function (b) {
      [[0, 1, 2], [1, 2, 0], [2, 0, 1]].forEach(function (o) {
        for (var s = 0; s < 8; s++) {
          var q = [0, 1, 2].map(function (k) { return b[o[k]] * ((s >> k) & 1 ? -1 : 1); });
          var ch = q.map(function (v) { return v.toFixed(4); }).join(",");
          if (!vistos[ch]) { vistos[ch] = 1; p.push(q); }
        }
      });
    });
    return { p: p, e: ligacoes(p, 2, .05), escala: 26, r: 9 };
  }
  function diamante() {
    var p = [], c = 2.25;
    for (var x = 0; x < 5; x++) for (var y = 0; y < 5; y++) for (var z = 0; z < 5; z++) if ((x + y + z) % 2 === 0) {
      [[x, y, z], [x + .5, y + .5, z + .5]].forEach(function (q) { if (dist(q, [c, c, c]) < 1.9) p.push([q[0] - c, q[1] - c, q[2] - c]); });
    }
    return { p: p, e: ligacoes(p, Math.sqrt(3) / 2, .02), escala: 62, r: 7 };
  }
  function grafite() {
    var p = [], camada = [];
    for (var L = 0; L < 3; L++) for (var i = -4; i <= 4; i++) for (var j = -4; j <= 4; j++) for (var k = 0; k < 2; k++) {
      var x = Math.sqrt(3) * (i + j / 2) + (L % 2) * Math.sqrt(3) / 2, z = 1.5 * j + k;
      if (Math.abs(x) < 2.7 && Math.abs(z - .5) < 2.6) { p.push([x, (L - 1) * 2.3, z]); camada.push(L); }
    }
    return { p: p, e: ligacoes(p, 1, .02), escala: 40, r: 5.5, camada: camada };
  }
  var FAB = { fulereno: fulereno, diamante: diamante, grafite: grafite };
  var VISTA = { fulereno: [.5, .3], diamante: [.35, .55], grafite: [.42, .35] };

  function gira(q, ax, ay) {
    var x = q[0], y = q[1], z = q[2], c = Math.cos(ay), s = Math.sin(ay);
    var x2 = c * x + s * z, z2 = -s * x + c * z;
    c = Math.cos(ax); s = Math.sin(ax);
    return [x2, c * y - s * z2, s * y + c * z2];
  }

  function desenha(box, t) {
    var r = box._rede, tipo = box.dataset.rede, v = VISTA[tipo], ax = v[0], ay = v[1];
    var pts = r.p;
    if (tipo === "grafite") {
      var desl = Math.sin(t * 2 * Math.PI / 7) * 0.9; // a camada do meio vai e volta (7 s)
      pts = r.p.map(function (q, i) { return r.camada[i] === 1 ? [q[0] + desl, q[1], q[2]] : q; });
    } else {
      ay += t * 2 * Math.PI / 30; // uma volta a cada 30 s
    }
    var P = pts.map(function (q) { return gira(q, ax, ay); });
    var zs = P.map(function (q) { return q[2]; }), zmin = Math.min.apply(null, zs), zmax = Math.max.apply(null, zs);
    var itens = [];
    r.e.forEach(function (e) {
      if (tipo === "grafite" && r.camada[e[0]] !== r.camada[e[1]]) return;
      itens.push([(P[e[0]][2] + P[e[1]][2]) / 2, 0, e[0], e[1]]);
    });
    P.forEach(function (q, i) { itens.push([q[2] + 1e-3, 1, i, 0]); });
    itens.sort(function (a, b) { return a[0] - b[0]; });
    var h = "", E = r.escala, m = 150;
    itens.forEach(function (it) {
      var f = (it[0] - zmin) / (zmax - zmin + 1e-9), op = (.35 + .65 * f).toFixed(2);
      if (it[1] === 0) {
        var a = P[it[2]], b = P[it[3]];
        h += '<line x1="' + (m + a[0] * E).toFixed(1) + '" y1="' + (m + a[1] * E).toFixed(1) + '" x2="' + (m + b[0] * E).toFixed(1) + '" y2="' + (m + b[1] * E).toFixed(1) + '" stroke="#8C84B8" stroke-opacity="' + op + '" stroke-width="3"/>';
      } else {
        var c = P[it[2]];
        h += '<circle cx="' + (m + c[0] * E).toFixed(1) + '" cy="' + (m + c[1] * E).toFixed(1) + '" r="' + (r.r * (.75 + .25 * f)).toFixed(1) + '" fill="url(#gC)" opacity="' + op + '"/>';
      }
    });
    box._svg.innerHTML = h;
  }

  function prepara(box) {
    if (!box._rede) {
      box._rede = FAB[box.dataset.rede]();
      box._svg = document.createElementNS(NS, "svg");
      box._svg.setAttribute("viewBox", "0 0 300 300");
      box._svg.setAttribute("aria-hidden", "true");
      box.insertBefore(box._svg, box.firstChild);
    }
    box._vez = (box._vez || 0) + 1; // cancela o laço anterior
    desenha(box, 0);
  }

  return {
    inicia: prepara,
    zera: prepara,
    roda: function (box) {
      prepara(box);
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var vez = box._vez, t0 = null, ultimo = 0;
      function quadro(agora) {
        if (box._vez !== vez) return;
        if (t0 === null) t0 = agora;
        if (agora - ultimo > 33) { ultimo = agora; desenha(box, (agora - t0) / 1000); } // 30 quadros por segundo bastam
        requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
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
  document.querySelectorAll('[data-anima="rede-3d"]').forEach(function (b) { window.QuarksAnimacoes["rede-3d"].inicia(b); });
});
