/* Animações do capítulo Óptica (Física, IF).
   Regra: só se movem na tela aberta e depois que a figura aparece (data-anima-passo); lentas e pequenas;
   com prefers-reduced-motion, mostram a figura parada.
   - opt-fotons: pontinhos de luz andam devagar sobre cada caminho de luz (path.raio) da figura, mostrando
     o sentido da propagação. Só andam nos caminhos que já apareceram (os que estão dentro de um data-passo sem .mostra ficam parados).
   - opt-reflexao: lei da reflexão. O raio incidente muda de inclinação devagar e o refletido acompanha:
     os ângulos i e r, medidos a partir da normal, são sempre iguais.
   - opt-sombra: uma bola opaca entre a fonte de luz e o anteparo. A fonte cresce e encolhe devagar:
     pequena, só sombra de borda nítida; grande, sombra no meio e penumbra em volta.
   - opt-lupa: uma lupa (lente convergente) passa devagar sobre uma linha de texto; dentro dela as letras aparecem maiores e direitas. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  function parado() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function el(nome, at, pai) {
    var e = document.createElementNS(NS, nome);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, at) { var t = el("text", Object.assign({ x: x, y: y }, at || {}), pai); t.textContent = s; return t; }
  function seta(pai, x1, y1, x2, y2, cor, larg) {
    var g = el("g", {}, pai), dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, a = 26, b = 12;
    el("path", { d: "M" + x1 + " " + y1 + " L" + (x2 - ux * a * .8) + " " + (y2 - uy * a * .8), stroke: cor, "stroke-width": larg || 6, "stroke-linecap": "round", fill: "none" }, g);
    el("polygon", { points: x2 + "," + y2 + " " + (x2 - ux * a - uy * b) + "," + (y2 - uy * a + ux * b) + " " + (x2 - ux * a + uy * b) + "," + (y2 - uy * a - ux * b), fill: cor }, g);
    return g;
  }

  /* ---------- Pontinhos de luz sobre os caminhos ---------- */
  window.QuarksAnimacoes["opt-fotons"] = (function () {
    var VEL = 120, PASSO = 150; // unidades do SVG por segundo e distância entre pontinhos
    function visivel(p, box) {
      for (var e = p; e && e !== box; e = e.parentNode) {
        if (e.hasAttribute && e.hasAttribute("data-passo") && !e.classList.contains("mostra")) return false;
      }
      return true;
    }
    function limpa(box) {
      box._roda = false;
      (box._pontos || []).forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
      box._pontos = [];
    }
    return {
      inicia: function (box) { limpa(box); },
      zera: function (box) { limpa(box); },
      roda: function (box) {
        limpa(box);
        if (parado()) return;
        var caminhos = Array.prototype.slice.call(box.querySelectorAll("path.raio, line.raio, polyline.raio"));
        var lista = caminhos.map(function (p) {
          var L = p.getTotalLength ? p.getTotalLength() : 0, n = Math.max(1, Math.round(L / PASSO));
          var g = el("g", { "pointer-events": "none" });
          p.parentNode.insertBefore(g, p.nextSibling);
          box._pontos.push(g);
          var cor = p.getAttribute("data-cor") || getComputedStyle(p).stroke || "#E0A800";
          var bolas = [];
          for (var k = 0; k < n; k++) bolas.push(el("circle", { r: p.getAttribute("data-r") || 6, fill: "#FFFFFF", stroke: cor, "stroke-width": 3.5, opacity: 0 }, g));
          return { p: p, L: L, n: n, bolas: bolas, vel: +(p.getAttribute("data-vel") || VEL) };
        });
        box._roda = true;
        var t0 = null, eu = box._pontos;
        function quadro(agora) {
          if (!box._roda || box._pontos !== eu) return;
          if (t0 === null) t0 = agora;
          var t = (agora - t0) / 1000;
          lista.forEach(function (c) {
            var ve = visivel(c.p, box);
            c.bolas.forEach(function (b, k) {
              if (!ve || !c.L) { b.setAttribute("opacity", 0); return; }
              var s = (t * c.vel + k * c.L / c.n) % c.L, pt = c.p.getPointAtLength(s);
              var borda = Math.min(s, c.L - s) / 40; // some de leve nas pontas
              b.setAttribute("cx", pt.x); b.setAttribute("cy", pt.y);
              b.setAttribute("opacity", Math.max(0, Math.min(1, borda)));
            });
          });
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
  })();

  /* ---------- Lei da reflexão ---------- */
  window.QuarksAnimacoes["opt-reflexao"] = (function () {
    var W = 760, H = 470, OX = 380, OY = 400, L = 310, RA = 96;
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "display:block;overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
      // espelho com hachura atrás
      el("rect", { x: 50, y: OY, width: 660, height: 14, rx: 4, fill: "#CFE9EA", stroke: "#0B6B6D", "stroke-width": 3 }, svg);
      for (var x = 70; x < 710; x += 34) el("line", { x1: x, y1: OY + 16, x2: x - 22, y2: OY + 40, stroke: "#9C93C4", "stroke-width": 3 }, svg);
      txt(svg, 712, OY + 62, "espelho", { "text-anchor": "end", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
      el("line", { x1: OX, y1: OY, x2: OX, y2: 40, stroke: "#5E5A70", "stroke-width": 3, "stroke-dasharray": "10 9" }, svg);
      txt(svg, OX, 28, "normal", { "text-anchor": "middle", "font-size": 24, "font-weight": 800, fill: "#5E5A70" });
      var g = el("g", {}, svg);
      return { svg: svg, g: g };
    }
    function desenha(e, graus) {
      var a = graus * Math.PI / 180, s = Math.sin(a), c = Math.cos(a), g = e.g;
      while (g.firstChild) g.removeChild(g.firstChild);
      var Ax = OX - L * s, Ay = OY - L * c, Bx = OX + L * s, By = OY - L * c;
      // arcos dos ângulos, a partir da normal
      el("path", { d: "M" + OX + " " + (OY - RA) + " A" + RA + " " + RA + " 0 0 0 " + (OX - RA * s) + " " + (OY - RA * c), fill: "rgba(224,168,0,.16)", stroke: "#B08600", "stroke-width": 3 }, g);
      el("path", { d: "M" + OX + " " + (OY - RA) + " A" + RA + " " + RA + " 0 0 1 " + (OX + RA * s) + " " + (OY - RA * c), fill: "rgba(15,139,141,.14)", stroke: "#0B6B6D", "stroke-width": 3 }, g);
      // raios: incidente (chega ao espelho) e refletido (sai)
      var mx = (Ax + OX) / 2, my = (Ay + OY) / 2;
      el("line", { x1: Ax, y1: Ay, x2: OX, y2: OY, stroke: "#E0A800", "stroke-width": 7, "stroke-linecap": "round" }, g);
      seta(g, Ax + (mx - Ax) * .5, Ay + (my - Ay) * .5, mx + (OX - mx) * .25, my + (OY - my) * .25, "#E0A800", 7);
      seta(g, OX, OY, Bx, By, "#E0A800", 7);
      el("circle", { cx: OX, cy: OY, r: 7, fill: "#3F2FA0" }, g);
      var n = Math.round(graus), bx = 150 * Math.sin(a / 2), by = 150 * Math.cos(a / 2);
      txt(g, OX - bx, OY - by, "i = " + n + "°", { "text-anchor": "end", "font-size": 34, "font-weight": 800, fill: "#8A6A00" });
      txt(g, OX + bx, OY - by, "r = " + n + "°", { "text-anchor": "start", "font-size": 34, "font-weight": 800, fill: "#0B6B6D" });
      txt(g, Ax - 6, Ay - 16, "raio incidente", { "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
      txt(g, Bx + 6, By - 16, "raio refletido", { "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
    }
    return {
      inicia: function (box) { box._e = monta(box); desenha(box._e, 40); },
      zera: function (box) { box._e = monta(box); desenha(box._e, 40); },
      roda: function (box) {
        var e = box._e = monta(box);
        desenha(e, 40);
        if (parado()) return;
        var t0 = null;
        function quadro(agora) {
          if (box._e !== e) return;
          if (t0 === null) t0 = agora;
          var t = (agora - t0) / 1000;
          desenha(e, 40 + 18 * Math.sin(2 * Math.PI * t / 9)); // de 22° a 58°, uma volta a cada 9 s
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
  })();

  /* ---------- Sombra e penumbra ---------- */
  window.QuarksAnimacoes["opt-sombra"] = (function () {
    var W = 1000, H = 460, CY = 230, S = 80, O = 390, R0 = 55, D = 860;
    var K = (D - O) / (O - S);
    function monta(box) {
      box.innerHTML = "";
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "display:block;overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
      var g = el("g", {}, svg);
      return { svg: svg, g: g };
    }
    function desenha(e, R) {
      var g = e.g;
      while (g.firstChild) g.removeChild(g.firstChild);
      var umb = R0 + (R0 - R) * K, pen = R0 + (R0 + R) * K;
      // região iluminada até o anteparo
      el("path", { d: "M" + S + " " + (CY - R) + " L" + D + " 0 L" + D + " " + H + " L" + S + " " + (CY + R) + " Z", fill: "#FFF4C2", opacity: .7 }, g);
      // penumbra e sombra atrás da bola
      el("path", { d: "M" + O + " " + (CY - R0) + " L" + D + " " + (CY - pen) + " L" + D + " " + (CY + pen) + " L" + O + " " + (CY + R0) + " Z", fill: "#B7AED6", opacity: .75 }, g);
      el("path", { d: "M" + O + " " + (CY - R0) + " L" + D + " " + (CY - umb) + " L" + D + " " + (CY + umb) + " L" + O + " " + (CY + R0) + " Z", fill: "#3B3550", opacity: .88 }, g);
      // raios que passam rente à bola (das bordas da fonte)
      [[CY - R, CY - R0, CY - umb], [CY + R, CY - R0, CY - pen], [CY + R, CY + R0, CY + umb], [CY - R, CY + R0, CY + pen]].forEach(function (r) {
        el("line", { x1: S, y1: r[0], x2: D, y2: r[2], stroke: "#E0A800", "stroke-width": 2.5, "stroke-dasharray": "2 0", opacity: .9 }, g);
      });
      // anteparo com a marca da sombra
      el("rect", { x: D, y: 0, width: 18, height: H, fill: "#FFFFFF", stroke: "#9C93C4", "stroke-width": 3 }, g);
      el("rect", { x: D + 1.5, y: CY - pen, width: 15, height: 2 * pen, fill: "#B7AED6" }, g);
      el("rect", { x: D + 1.5, y: CY - umb, width: 15, height: 2 * umb, fill: "#3B3550" }, g);
      // fonte e bola
      el("circle", { cx: S, cy: CY, r: R + 10, fill: "#FFD10C", opacity: .25 }, g);
      el("circle", { cx: S, cy: CY, r: R, fill: "#FFD10C", stroke: "#E0A800", "stroke-width": 3 }, g);
      el("circle", { cx: O, cy: CY, r: R0, fill: "#5E5A70", stroke: "#3B3550", "stroke-width": 3 }, g);
      txt(g, O, CY + R0 + 36, "bola opaca", { "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
      txt(g, S, CY + 112, R < 16 ? "fonte pequena" : R > 32 ? "fonte grande" : "fonte", { "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "#8A6A00" });
      txt(g, D + 30, CY + 9, "sombra", { "font-size": 26, "font-weight": 800, fill: "#3B3550" });
      if (pen - umb > 30) {
        txt(g, D + 30, CY - (umb + pen) / 2 + 9, "penumbra", { "font-size": 26, "font-weight": 800, fill: "#6E6694" });
        txt(g, D + 30, CY + (umb + pen) / 2 + 9, "penumbra", { "font-size": 26, "font-weight": 800, fill: "#6E6694" });
      }
      txt(g, D + 9, H + 34, "anteparo", { "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "#5E5A70" });
    }
    function raio(t) { return 6 + 36 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 10)); } // de 6 a 42, uma volta a cada 10 s
    return {
      inicia: function (box) { box._e = monta(box); desenha(box._e, 6); },
      zera: function (box) { box._e = monta(box); desenha(box._e, 6); },
      roda: function (box) {
        var e = box._e = monta(box);
        if (parado()) { desenha(e, 42); return; }
        desenha(e, 6);
        var t0 = null;
        function quadro(agora) {
          if (box._e !== e) return;
          if (t0 === null) t0 = agora;
          desenha(e, raio((agora - t0) / 1000));
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
  })();

  /* ---------- Lupa que passa devagar sobre um texto (lente convergente: letras maiores e direitas) ----------
     data-texto: a linha de texto; data-aumento: quanto a lupa aumenta (padrão 2); data-w e data-h: tamanho. */
  window.QuarksAnimacoes["opt-lupa"] = (function () {
    var conta = 0;
    function monta(box) {
      box.innerHTML = "";
      var W = +box.dataset.w || 760, H = +box.dataset.h || 260, Y = H / 2 + 10, R = +box.dataset.raio || 92, K = +box.dataset.aumento || 2;
      var id = "opLupaClip" + (++conta);
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "display:block;overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
      var defs = el("defs", {}, svg), cp = el("clipPath", { id: id }, defs), furo = el("circle", { cx: 0, cy: Y - 8, r: R }, cp);
      el("rect", { x: 0, y: 0, width: W, height: H, rx: 24, fill: "#FFFFFF", stroke: "#E4DEFB", "stroke-width": 2 }, svg);
      var t = txt(svg, 30, Y, box.dataset.texto || "", { "font-size": 26, "font-weight": 600, fill: "#292B2C" });
      var vista = el("g", { "clip-path": "url(#" + id + ")" }, svg);
      el("rect", { x: 0, y: 0, width: W, height: H, fill: "#FFFDF2" }, vista);
      var zoom = el("g", {}, vista);
      txt(zoom, 30, Y, box.dataset.texto || "", { "font-size": 26, "font-weight": 600, fill: "#292B2C" });
      var aro = el("g", {}, svg);
      el("circle", { cx: 0, cy: Y - 8, r: R, fill: "rgba(224,244,244,.18)", stroke: "#5E5A70", "stroke-width": 10 }, aro);
      el("path", { d: "M" + (R * .72) + " " + (Y - 8 + R * .72) + " l" + (R * .55) + " " + (R * .55), stroke: "#5E5A70", "stroke-width": 20, "stroke-linecap": "round" }, aro);
      var larg = 0;
      try { larg = t.getComputedTextLength(); } catch (e) { larg = W - 60; }
      return { furo: furo, zoom: zoom, aro: aro, Y: Y - 8, K: K, x0: 30 + R * .6, x1: Math.min(W - R * .6, 30 + larg - R * .4) };
    }
    function poe(e, x) {
      e.furo.setAttribute("cx", x);
      e.zoom.setAttribute("transform", "translate(" + x + " " + e.Y + ") scale(" + e.K + ") translate(" + (-x) + " " + (-e.Y) + ")");
      e.aro.setAttribute("transform", "translate(" + x + " 0)");
    }
    return {
      inicia: function (box) { var e = box._e = monta(box); poe(e, e.x0); },
      zera: function (box) { var e = box._e = monta(box); poe(e, e.x0); },
      roda: function (box) {
        var e = box._e = monta(box);
        poe(e, e.x0);
        if (parado()) { poe(e, (e.x0 + e.x1) / 2); return; }
        var t0 = null;
        function quadro(agora) {
          if (box._e !== e) return;
          if (t0 === null) t0 = agora;
          var t = (agora - t0) / 1000, u = 0.5 - 0.5 * Math.cos(2 * Math.PI * t / 12); // vai e volta em 12 s
          poe(e, e.x0 + (e.x1 - e.x0) * u);
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      }
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    ["opt-fotons", "opt-reflexao", "opt-sombra", "opt-lupa"].forEach(function (nome) {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
  });
})();
