/* Animações de Astronomia (Física, IF).
   Regra do Quarks: só se movem na tela aberta e depois que a figura aparece (data-anima-passo);
   lentas e pequenas; sem animação com prefers-reduced-motion (a figura fica parada no quadro que explica).
   - "gnomon"       o Sol cruza o céu (leste -> oeste) e a sombra da vara muda de tamanho e de lado (data-modo="dia");
                    ou a sombra do meio-dia ao longo do ano, de junho a dezembro (data-modo="ano").
   - "estacoes"     a Terra dá a volta no Sol com o eixo inclinado sempre para o mesmo lado; a estação no hemisfério sul.
   - "fases-lua"    a Lua dá a volta na Terra (vista de cima) e, ao lado, a fase como a vemos no céu do Brasil.
   - "sistema-solar" os oito planetas em volta do Sol (fora de escala); data-modo="cometa": um cometa e a sua cauda.
   - "luz-sol"      a luz sai do Sol e chega à Terra em 500 s (cerca de 8 min), com o relógio acelerado.
   Galáxia (svg[data-galaxia]): os pontos da espiral são desenhados uma vez; quem gira é o CSS da parte. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var FONTE = "Figtree,'Segoe UI',sans-serif";
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

  /* Fábrica de animação contínua: monta(box) desenha e devolve o estado; quadro(estado, t em s) atualiza. */
  function laco(monta, quadro, tParado) {
    function prepara(box) {
      box._vez = (box._vez || 0) + 1;
      box.innerHTML = "";
      box._est = monta(box);
      quadro(box._est, tParado);
    }
    return {
      inicia: prepara,
      zera: prepara,
      roda: function (box) {
        prepara(box);
        if (reduz()) return;
        var vez = box._vez, t0 = null, ultimo = 0;
        function passo(agora) {
          if (box._vez !== vez) return;
          if (t0 === null) t0 = agora;
          if (agora - ultimo > 30) { ultimo = agora; quadro(box._est, (agora - t0) / 1000); }
          requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
      }
    };
  }

  function svgDe(box) {
    var w = +box.dataset.w || 800, h = +box.dataset.h || 400;
    return el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, style: "display:block;overflow:visible", "aria-hidden": "true" }, box);
  }

  /* ---------- Gnômon ---------- */
  window.QuarksAnimacoes["gnomon"] = laco(function (box) {
    var modo = box.dataset.modo || "dia";
    var s = svgDe(box), W = +box.dataset.w || 800, H = +box.dataset.h || 400;
    var g = H - 70, cx = W / 2, hv = 120; // chão, vara e altura da vara
    var e = { modo: modo, cx: cx, g: g, hv: hv, W: W, H: H };
    var ceu = el("rect", { x: 0, y: 0, width: W, height: g, rx: 28, fill: "#E9F3FB" }, s);
    e.ceu = ceu;
    e.noite = el("rect", { x: 0, y: 0, width: W, height: g, rx: 28, fill: "#2B2357", opacity: 0 }, s);
    var est = el("g", { opacity: 0 }, s);
    [[.12, .2], [.3, .1], [.52, .26], [.7, .12], [.86, .3], [.22, .42], [.62, .45], [.42, .14], [.93, .1]].forEach(function (p) {
      el("circle", { cx: p[0] * W, cy: p[1] * g, r: 3, fill: "#fff" }, est);
    });
    e.est = est;
    el("rect", { x: 0, y: g, width: W, height: 26, rx: 13, fill: "#CFE5C0" }, s);
    if (modo === "dia") {
      txt(s, 30, g + 62, "leste", { "font-size": 28, "font-weight": 700, fill: "#5E5A70" });
      txt(s, W - 30, g + 62, "oeste", { "font-size": 28, "font-weight": 700, fill: "#5E5A70", "text-anchor": "end" });
    } else {
      txt(s, 30, g + 62, "sul", { "font-size": 28, "font-weight": 700, fill: "#5E5A70" });
      txt(s, W - 30, g + 62, "norte", { "font-size": 28, "font-weight": 700, fill: "#5E5A70", "text-anchor": "end" });
    }
    e.marcas = el("g", {}, s);
    e.raio = el("line", { stroke: "#E0A100", "stroke-width": 3, "stroke-dasharray": "4 8", "stroke-linecap": "round" }, s);
    e.sombra = el("line", { stroke: "#4A4560", "stroke-width": 14, "stroke-linecap": "round", opacity: .85 }, s);
    el("line", { x1: cx, y1: g + 6, x2: cx, y2: g - hv, stroke: "#292B2C", "stroke-width": 9, "stroke-linecap": "round" }, s);
    e.sol = el("g", {}, s);
    el("circle", { r: 46, fill: "#FFD10C", opacity: .25 }, e.sol);
    el("circle", { r: 30, fill: "#FFD10C", stroke: "#F0A500", "stroke-width": 4 }, e.sol);
    e.rotulo = txt(s, cx, 50, "", { "font-size": 36, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "middle" });
    e.feitas = {};
    return e;
  }, function (e, t) {
    var cx = e.cx, g = e.g, hv = e.hv, D = Math.min(e.W * .44, (g - 40));
    var ux, uy, nome = "", vis = 1;
    if (e.modo === "dia") {
      var T = 9, TN = 2.2, c = t % (T + TN);
      if (t === undefined) c = T * .2; // quadro parado: manhã
      var dia = c < T, th = Math.PI * (.04 + .92 * Math.min(1, c / T));
      ux = -Math.cos(th); uy = Math.sin(th) * .92 + .08;
      var n = Math.hypot(ux, uy); ux /= n; uy /= n;
      vis = dia ? Math.min(1, Math.sin(th) * 4) : 0;
      e.noite.setAttribute("opacity", dia ? Math.max(0, .55 - Math.sin(th) * 2).toFixed(2) : .85);
      e.est.setAttribute("opacity", dia ? 0 : 1);
      var f = c / T;
      nome = !dia ? "noite" : f < .4 ? "manhã" : f < .6 ? "meio-dia" : "tarde";
      if (dia) {
        [[.22, "manhã"], [.5, "meio-dia"], [.78, "tarde"]].forEach(function (m) {
          if (f >= m[0] && !e.feitas[m[1]]) {
            e.feitas[m[1]] = true;
            var tip = cx - hv * ux / uy;
            el("line", { x1: cx, y1: g + 2, x2: tip, y2: g + 2, stroke: "#8C7BEA", "stroke-width": 5, "stroke-linecap": "round", opacity: .55 }, e.marcas);
            el("circle", { cx: tip, cy: g + 2, r: 8, fill: "#8C7BEA" }, e.marcas);
          }
        });
      } else if (Object.keys(e.feitas).length) { e.feitas = {}; e.marcas.innerHTML = ""; }
    } else {
      // ano: altura do Sol ao meio-dia em Juiz de Fora, de cerca de 45° (junho) a cerca de 88° (dezembro)
      var P = 8, fase = t === undefined ? 0 : (t % P) / P;
      var alt = (66.5 - 21.5 * Math.cos(2 * Math.PI * fase)) * Math.PI / 180;
      ux = Math.cos(alt); uy = Math.sin(alt); // Sol do lado norte (direita)
      e.noite.setAttribute("opacity", 0); e.est.setAttribute("opacity", 0);
      var m = Math.cos(2 * Math.PI * fase);
      nome = m > .85 ? "junho · inverno: sombra longa" : m < -.85 ? "dezembro · verão: sombra curta" : (fase < .5 ? "de junho para dezembro" : "de dezembro para junho");
    }
    var sx = cx + ux * D, sy = g - hv - uy * D;
    e.sol.setAttribute("transform", "translate(" + sx.toFixed(1) + " " + sy.toFixed(1) + ")");
    e.sol.setAttribute("opacity", vis.toFixed(2));
    var tipx = cx - hv * ux / uy;
    tipx = Math.max(20, Math.min(e.W - 20, tipx));
    e.sombra.setAttribute("x1", cx); e.sombra.setAttribute("y1", g + 2);
    e.sombra.setAttribute("x2", tipx.toFixed(1)); e.sombra.setAttribute("y2", g + 2);
    e.sombra.setAttribute("opacity", (vis * .85).toFixed(2));
    e.raio.setAttribute("x1", sx.toFixed(1)); e.raio.setAttribute("y1", sy.toFixed(1));
    e.raio.setAttribute("x2", tipx.toFixed(1)); e.raio.setAttribute("y2", g);
    e.raio.setAttribute("opacity", (vis * .9).toFixed(2));
    e.rotulo.textContent = nome;
  }, undefined);

  /* ---------- Estações: a Terra em volta do Sol, eixo sempre inclinado para o mesmo lado ---------- */
  window.QuarksAnimacoes["estacoes"] = laco(function (box) {
    var s = svgDe(box), W = +box.dataset.w || 900, H = +box.dataset.h || 500;
    var e = { cx: W / 2, cy: H / 2 + 10, a: W / 2 - 110, b: H / 2 - 80 };
    el("ellipse", { cx: e.cx, cy: e.cy, rx: e.a, ry: e.b, fill: "none", stroke: "#B9B0E0", "stroke-width": 3, "stroke-dasharray": "8 10" }, s);
    var sol = el("g", { transform: "translate(" + e.cx + " " + e.cy + ")" }, s);
    el("circle", { r: 78, fill: "#FFD10C", opacity: .22 }, sol);
    el("circle", { r: 56, fill: "#FFD10C", stroke: "#F0A500", "stroke-width": 4 }, sol);
    var marcos = [[0, "dezembro"], [-Math.PI / 2, "março"], [Math.PI, "junho"], [Math.PI / 2, "setembro"]];
    marcos.forEach(function (m) {
      var x = e.cx + (e.a) * Math.cos(m[0]), y = e.cy + (e.b) * Math.sin(m[0]);
      el("circle", { cx: x, cy: y, r: 6, fill: "#B9B0E0" }, s);
      var dx = Math.cos(m[0]), dy = Math.sin(m[0]);
      txt(s, x + dx * 64, y + dy * 66 + (dy === 0 ? 92 : dy > 0 ? 20 : -6), m[1], { "font-size": 26, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle" });
    });
    e.terra = el("g", {}, s);
    el("circle", { r: 40, fill: "#4C9BE8" }, e.terra);
    e.sombra = el("path", { fill: "#3B2A73", opacity: .8 }, e.terra);
    el("circle", { r: 40, fill: "none", stroke: "#292B2C", "stroke-width": 3 }, e.terra);
    var inc = 23.5 * Math.PI / 180;
    el("line", { x1: -62 * Math.sin(inc), y1: 62 * Math.cos(inc), x2: 62 * Math.sin(inc), y2: -62 * Math.cos(inc), stroke: "#292B2C", "stroke-width": 4, "stroke-linecap": "round" }, e.terra);
    txt(e.terra, 62 * Math.sin(inc) + 8, -62 * Math.cos(inc) - 4, "N", { "font-size": 20, "font-weight": 800, fill: "#292B2C" });
    e.cx0 = e.cx;
    e.rot = el("g", {}, s);
    e.caixa = el("rect", { rx: 20, height: 48, fill: "#fff", stroke: "#0F8B8D", "stroke-width": 3 }, e.rot);
    e.est = txt(e.rot, 0, 0, "", { "font-size": 28, "font-weight": 800, fill: "#0B6B6D", "text-anchor": "middle" });
    return e;
  }, function (e, t) {
    var P = 24, f = t === undefined ? 0 : (t % P) / P;
    var phi = -2 * Math.PI * f; // dezembro (direita) -> março (alto) -> junho (esquerda) -> setembro (baixo)
    var x = e.cx + e.a * Math.cos(phi), y = e.cy + e.b * Math.sin(phi);
    e.terra.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
    // metade escura: a do lado oposto ao Sol
    var ang = Math.atan2(y - e.cy, x - e.cx); // direção Sol -> Terra
    var r = 40, nx = -Math.sin(ang), ny = Math.cos(ang);
    var p1 = [r * nx, r * ny], p2 = [-r * nx, -r * ny];
    e.sombra.setAttribute("d", "M" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " A40 40 0 0 " + 0 + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + " Z");
    var q = ((f * 4) % 4 + 4) % 4, nomes = ["verão no Sul", "outono no Sul", "inverno no Sul", "primavera no Sul"];
    var nome = nomes[Math.floor(q)];
    e.est.textContent = nome;
    var w = 30 + nome.length * 15;
    var ly = y + (Math.sin(phi) > .3 ? -78 : 92);
    e.est.setAttribute("x", x.toFixed(1)); e.est.setAttribute("y", (ly + 10).toFixed(1));
    e.caixa.setAttribute("x", (x - w / 2).toFixed(1)); e.caixa.setAttribute("y", (ly - 24).toFixed(1)); e.caixa.setAttribute("width", w);
  }, undefined);

  /* ---------- Fases da Lua ---------- */
  function faseD(cx, cy, r, a) {
    // a: ângulo desde a lua nova (0 a 2π). Céu do Brasil: crescendo, o lado claro é o esquerdo.
    a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    var k = Math.abs(Math.cos(a)) * r, top = cx + " " + (cy - r), bot = cx + " " + (cy + r);
    var cresce = a < Math.PI, giba = Math.cos(a) < 0;
    var s1 = cresce ? 0 : 1; // topo -> base pelo lado claro
    var s2 = cresce ? (giba ? 0 : 1) : (giba ? 1 : 0);
    return "M" + top + " A" + r + " " + r + " 0 0 " + s1 + " " + bot + " A" + k.toFixed(2) + " " + r + " 0 0 " + s2 + " " + top + " Z";
  }
  window.QuarksAnimacoes["fases-lua"] = laco(function (box) {
    var s = svgDe(box), W = +box.dataset.w || 1100, H = +box.dataset.h || 560;
    var e = { ex: 430, ey: H / 2, R: 200 };
    // luz do Sol
    var luz = el("g", { stroke: "#F0A500", "stroke-width": 4, "stroke-linecap": "round" }, s);
    for (var i = 0; i < 5; i++) {
      var yy = 70 + i * (H - 140) / 4;
      el("line", { x1: 10, y1: yy, x2: 120, y2: yy }, luz);
      el("path", { d: "M106 " + (yy - 10) + " L122 " + yy + " L106 " + (yy + 10), fill: "none" }, luz);
    }
    txt(s, 10, 36, "luz do Sol", { "font-size": 24, "font-weight": 700, fill: "#B07A00" });
    el("circle", { cx: e.ex, cy: e.ey, r: e.R, fill: "none", stroke: "#B9B0E0", "stroke-width": 3, "stroke-dasharray": "8 10" }, s);
    var terra = el("g", { transform: "translate(" + e.ex + " " + e.ey + ")" }, s);
    el("circle", { r: 56, fill: "#4C9BE8" }, terra);
    el("path", { d: "M0 -56 A56 56 0 0 1 0 56 Z", fill: "#3B2A73", opacity: .8 }, terra);
    el("circle", { r: 56, fill: "none", stroke: "#292B2C", "stroke-width": 3 }, terra);
    txt(s, e.ex, e.ey + 92, "Terra", { "font-size": 24, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle" });
    e.visada = el("line", { stroke: "#8C7BEA", "stroke-width": 3, "stroke-dasharray": "3 9", "stroke-linecap": "round" }, s);
    e.lua = el("g", {}, s);
    el("circle", { r: 30, fill: "#F3F1FA" }, e.lua);
    el("path", { d: "M0 -30 A30 30 0 0 1 0 30 Z", fill: "#3A3550" }, e.lua);
    el("circle", { r: 30, fill: "none", stroke: "#292B2C", "stroke-width": 3 }, e.lua);
    // como vemos
    var px = W - 200, py = H / 2 - 20;
    txt(s, px, 46, "como vemos daqui", { "font-size": 26, "font-weight": 800, fill: "#0B6B6D", "text-anchor": "middle" });
    el("circle", { cx: px, cy: py, r: 120, fill: "#3A3550" }, s);
    e.faseP = el("path", { fill: "#F3F1FA" }, s);
    el("circle", { cx: px, cy: py, r: 120, fill: "none", stroke: "#292B2C", "stroke-width": 3 }, s);
    e.nome = txt(s, px, py + 178, "", { "font-size": 34, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "middle" });
    e.px = px; e.py = py;
    return e;
  }, function (e, t) {
    var P = 22, u = t === undefined ? Math.PI / 2 : 2 * Math.PI * (t % P) / P;
    var a = u - .55 * Math.sin(4 * u) / 4; // demora um pouco mais nas quatro fases principais
    var x = e.ex - e.R * Math.cos(a), y = e.ey + e.R * Math.sin(a);
    e.lua.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
    e.visada.setAttribute("x1", e.ex); e.visada.setAttribute("y1", e.ey);
    e.visada.setAttribute("x2", x.toFixed(1)); e.visada.setAttribute("y2", y.toFixed(1));
    e.faseP.setAttribute("d", faseD(e.px, e.py, 120, a));
    var aa = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), q = aa / (Math.PI / 2), perto = Math.abs(q - Math.round(q)) < .14;
    var nomes = ["lua nova", "quarto crescente", "lua cheia", "quarto minguante", "lua nova"];
    e.nome.textContent = perto ? nomes[Math.round(q)] : (aa < Math.PI ? "a parte clara aumenta" : "a parte clara diminui");
    e.nome.setAttribute("fill", perto ? "#3F2FA0" : "#5E5A70");
  }, undefined);

  /* ---------- Sistema Solar (fora de escala) e cometa ---------- */
  var PLANETAS = [
    ["Mercúrio", 82, 7, "#A9A3B8", 10], ["Vênus", 114, 11, "#E8C27A", 14], ["Terra", 148, 12, "#4C9BE8", 18], ["Marte", 182, 9, "#D8644A", 24],
    ["Júpiter", 272, 30, "#D9A774", 34], ["Saturno", 352, 24, "#E6CF8E", 44], ["Urano", 422, 18, "#8FD3DD", 56], ["Netuno", 488, 17, "#4D74D9", 70]
  ];
  window.QuarksAnimacoes["sistema-solar"] = laco(function (box) {
    var modo = box.dataset.modo || "planetas";
    var s = svgDe(box), W = +box.dataset.w || 1100, H = +box.dataset.h || 520;
    var e = { modo: modo, cx: W / 2, cy: H / 2, k: .38, p: [] };
    if (modo === "cometa") {
      e.cx = 200;
      e.a = 300; e.ec = .8; e.b = e.a * .6;
      var c = e.a * e.ec; // o Sol fica num foco
      el("ellipse", { cx: e.cx + c, cy: e.cy, rx: e.a, ry: e.b, fill: "none", stroke: "#B9B0E0", "stroke-width": 3, "stroke-dasharray": "8 10" }, s);
      [[140, "Terra"]].forEach(function (o) {
        el("ellipse", { cx: e.cx, cy: e.cy, rx: o[0] * .6, ry: o[0] * .6 * .55, fill: "none", stroke: "#DCD6F3", "stroke-width": 2 }, s);
      });
      e.cauda = el("path", { fill: "#9FD8F0", opacity: .7 }, s);
      e.cometa = el("circle", { r: 9, fill: "#fff", stroke: "#8C7BEA", "stroke-width": 3 }, s);
    } else {
      PLANETAS.forEach(function (p) {
        el("ellipse", { cx: e.cx, cy: e.cy, rx: p[1], ry: p[1] * e.k, fill: "none", stroke: "#DCD6F3", "stroke-width": 2 }, s);
      });
      // cinturão de asteroides
      var cint = el("g", { fill: "#B5ADC9" }, s);
      for (var i = 0; i < 70; i++) {
        var a = i * 2.39996, r = 214 + ((i * 37) % 26);
        el("circle", { cx: (e.cx + r * Math.cos(a)).toFixed(1), cy: (e.cy + r * e.k * Math.sin(a)).toFixed(1), r: 2.2 }, cint);
      }
      e.cint = cint;
    }
    var sol = el("g", { transform: "translate(" + e.cx + " " + e.cy + ")" }, s);
    el("circle", { r: 36, fill: "#FFD10C", opacity: .22 }, sol);
    el("circle", { r: 25, fill: "#FFD10C", stroke: "#F0A500", "stroke-width": 4 }, sol);
    if (modo !== "cometa") {
      PLANETAS.forEach(function (p, i) {
        var g = el("g", {}, s);
        if (p[0] === "Saturno") el("ellipse", { rx: p[2] * 1.9, ry: p[2] * .55, fill: "none", stroke: "#C9A866", "stroke-width": 4 }, g);
        el("circle", { r: p[2], fill: p[3], stroke: "rgba(41,43,44,.35)", "stroke-width": 2 }, g);
        var rot = txt(g, 0, -p[2] - 10, p[0], { "font-size": 20, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle" });
        e.p.push({ g: g, a: p[1], T: p[4], f0: (i * 1.7) % (2 * Math.PI) });
      });
    }
    return e;
  }, function (e, t) {
    t = t === undefined ? 0 : t;
    if (e.modo === "cometa") {
      // anomalia média -> excêntrica (Kepler): o cometa corre perto do Sol e se arrasta longe dele
      var P = 14, M = 2 * Math.PI * (t % P) / P + Math.PI, E = M;
      for (var i = 0; i < 8; i++) E = E - (E - e.ec * Math.sin(E) - M) / (1 - e.ec * Math.cos(E));
      var c = e.a * e.ec, x = e.cx + c + e.a * Math.cos(E), y = e.cy + e.b * Math.sin(E);
      e.cometa.setAttribute("cx", x.toFixed(1)); e.cometa.setAttribute("cy", y.toFixed(1));
      var dx = x - e.cx, dy = y - e.cy, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      var L = Math.max(0, 180 * (1 - d / (e.a * 1.15))); // cauda cresce perto do Sol, sempre para longe dele
      var px = -uy, py = ux, w = 4 + L * .1;
      if (L < 4) { e.cauda.setAttribute("d", ""); return; }
      e.cauda.setAttribute("d", "M" + (x + px * 7).toFixed(1) + " " + (y + py * 7).toFixed(1) + " L" + (x + ux * L + px * w).toFixed(1) + " " + (y + uy * L + py * w).toFixed(1) +
        " L" + (x + ux * L - px * w).toFixed(1) + " " + (y + uy * L - py * w).toFixed(1) + " L" + (x - px * 7).toFixed(1) + " " + (y - py * 7).toFixed(1) + " Z");
      return;
    }
    e.p.forEach(function (p) {
      var a = p.f0 - 2 * Math.PI * t / p.T;
      p.g.setAttribute("transform", "translate(" + (e.cx + p.a * Math.cos(a)).toFixed(1) + " " + (e.cy + p.a * e.k * Math.sin(a)).toFixed(1) + ")");
    });
  }, undefined);

  /* ---------- A luz do Sol até a Terra ---------- */
  window.QuarksAnimacoes["luz-sol"] = laco(function (box) {
    var s = svgDe(box), W = +box.dataset.w || 1100, H = +box.dataset.h || 220;
    var e = { x0: 120, x1: W - 90, y: H / 2 + 10 };
    var sol = el("g", { transform: "translate(70 " + e.y + ")" }, s);
    el("circle", { r: 92, fill: "#FFD10C", opacity: .2 }, sol);
    el("circle", { r: 66, fill: "#FFD10C", stroke: "#F0A500", "stroke-width": 4 }, sol);
    el("line", { x1: e.x0 + 30, y1: e.y, x2: e.x1 - 30, y2: e.y, stroke: "#DCD6F3", "stroke-width": 6, "stroke-dasharray": "2 14", "stroke-linecap": "round" }, s);
    var terra = el("g", { transform: "translate(" + e.x1 + " " + e.y + ")" }, s);
    el("circle", { r: 22, fill: "#4C9BE8", stroke: "#292B2C", "stroke-width": 3 }, terra);
    txt(s, e.x1, e.y + 58, "Terra", { "font-size": 24, "font-weight": 700, fill: "#5E5A70", "text-anchor": "middle" });
    e.pulso = el("g", {}, s);
    el("circle", { r: 18, fill: "#FFD10C", opacity: .35 }, e.pulso);
    el("circle", { r: 9, fill: "#FFD10C", stroke: "#F0A500", "stroke-width": 3 }, e.pulso);
    e.rel = txt(s, (e.x0 + e.x1) / 2, 34, "", { "font-size": 34, "font-weight": 800, fill: "#3F2FA0", "text-anchor": "middle", style: "font-variant-numeric:tabular-nums" });
    return e;
  }, function (e, t) {
    var P = 6.5, c = t === undefined ? 5.2 : t % P, f = Math.min(1, c / 5.2);
    var x = e.x0 + 40 + (e.x1 - e.x0 - 70) * f;
    e.pulso.setAttribute("transform", "translate(" + x.toFixed(1) + " " + e.y + ")");
    e.pulso.setAttribute("opacity", f >= 1 ? .3 : 1);
    var seg = Math.round(500 * f);
    e.rel.textContent = "t = " + seg + " s" + (f >= 1 ? "  ≈ 8 min" : "");
  }, undefined);

  /* ---------- Galáxia em espiral (desenhada uma vez; o CSS gira) ---------- */
  function galaxia(svg) {
    var n = +svg.dataset.galaxia || 900, R = 230, g = el("g", { class: "galaxia-gira" }, svg);
    var semente = 7;
    function rnd() { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }
    el("circle", { cx: 0, cy: 0, r: 60, fill: "#FFF4C2", opacity: .55 }, g);
    el("circle", { cx: 0, cy: 0, r: 34, fill: "#FFF4C2", opacity: .8 }, g);
    for (var i = 0; i < n; i++) {
      var braco = i % 2, d = Math.pow(rnd(), .7) * R, ang = braco * Math.PI + d / 52 + (rnd() - .5) * .75;
      var x = d * Math.cos(ang) + (rnd() - .5) * 16, y = d * Math.sin(ang) + (rnd() - .5) * 16;
      el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: (rnd() * 1.6 + .8).toFixed(1), fill: rnd() < .2 ? "#FFE58A" : "#fff", opacity: (.45 + rnd() * .55).toFixed(2) }, g);
    }
    // "você está aqui": num braço, longe do centro
    var dS = R * .6, aS = dS / 52 + .1;
    var m = el("g", { transform: "translate(" + (dS * Math.cos(aS)).toFixed(1) + " " + (dS * Math.sin(aS)).toFixed(1) + ")" }, g);
    el("circle", { r: 13, fill: "none", stroke: "#FFD10C", "stroke-width": 4 }, m);
    el("circle", { r: 5, fill: "#FFD10C" }, m);
    svg._sol = m;
  }

  document.addEventListener("DOMContentLoaded", function () {
    ["gnomon", "estacoes", "fases-lua", "sistema-solar", "luz-sol"].forEach(function (nome) {
      document.querySelectorAll('[data-anima="' + nome + '"]').forEach(function (b) { window.QuarksAnimacoes[nome].inicia(b); });
    });
    document.querySelectorAll("svg[data-galaxia]").forEach(galaxia);
  });
})();
