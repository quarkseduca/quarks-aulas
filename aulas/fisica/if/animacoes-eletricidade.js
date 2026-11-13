/* Animações de Eletricidade (Física, IF).
   Regra: só rodam na tela aberta, depois que a figura aparece (o motor chama roda/zera);
   com prefers-reduced-motion, mostram direto o estado final, parado.
   - el-eletrons: elétrons livres num fio de cobre. data-modo="caos" (cada um para um lado)
     ou "ordem" (a pilha empurra: todos andam no mesmo sentido, sem deixar de tremer).
   - el-carga: bateria de 5000 mAh carregando com 2 A; o relógio vai de 0 a 2,5 h.
   - el-medidor: o medidor de luz gira como um odômetro, de data-de até data-ate (kWh). */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function reduz() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- Elétrons livres ---------- */
  window.QuarksAnimacoes["el-eletrons"] = (function () {
    var W = 760, H = 200, N = 26;
    function monta(box) {
      box.innerHTML = "";
      var s = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, style: "overflow:visible" }, box);
      el("rect", { x: 0, y: 20, width: W, height: H - 40, rx: 80, fill: "url(#elCobre)", stroke: "#8A4A1C", "stroke-width": 4 }, s);
      var ions = el("g", {}, s);
      for (var i = 0; i < 12; i++) for (var j = 0; j < 3; j++) {
        el("circle", { cx: 50 + i * 60 + (j % 2) * 30, cy: 58 + j * 42, r: 9, fill: "#C7773A", stroke: "#8A4A1C", "stroke-width": 2 }, ions);
      }
      var g = el("g", {}, s), es = [];
      var semente = 7;
      function rnd() { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; }
      for (var k = 0; k < N; k++) {
        var e = { x: 30 + rnd() * (W - 60), y: 44 + rnd() * (H - 88), vx: (rnd() - .5) * 2, vy: (rnd() - .5) * 2 };
        e.c = el("circle", { r: 8, fill: "#FFD10C", stroke: "#3F2FA0", "stroke-width": 2.5 }, g);
        es.push(e);
      }
      return { svg: s, es: es, rnd: rnd };
    }
    function passo(st, ordem, dt) {
      st.es.forEach(function (e) {
        e.vx += (st.rnd() - .5) * .9; e.vy += (st.rnd() - .5) * .9;
        e.vx *= .9; e.vy *= .9;
        e.x += (e.vx + (ordem ? 1.15 : 0)) * dt; e.y += e.vy * dt;
        if (e.y < 44) { e.y = 44; e.vy = Math.abs(e.vy); }
        if (e.y > H - 44) { e.y = H - 44; e.vy = -Math.abs(e.vy); }
        if (e.x > W - 24) e.x = ordem ? 24 : W - 24;
        if (e.x < 24) e.x = ordem ? W - 24 : 24;
        e.c.setAttribute("cx", e.x.toFixed(1)); e.c.setAttribute("cy", e.y.toFixed(1));
      });
    }
    return {
      inicia: function (box) { box._st = monta(box); passo(box._st, false, 0); },
      roda: function (box) {
        var st = box._st = monta(box), ordem = box.dataset.modo === "ordem";
        passo(st, ordem, 0);
        if (reduz()) return;
        var t0 = null;
        function quadro(agora) {
          if (box._st !== st) return;
          var dt = t0 === null ? 1 : Math.min(3, (agora - t0) / 33);
          t0 = agora;
          passo(st, ordem, dt);
          requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      },
      zera: function (box) { box._st = monta(box); passo(box._st, false, 0); }
    };
  })();

  /* ---------- Bateria carregando ---------- */
  window.QuarksAnimacoes["el-carga"] = (function () {
    var TOTAL = 2.5, SEG = 6; // 2,5 h da conta em 6 s na tela
    function monta(box) {
      box.innerHTML = "";
      var s = el("svg", { viewBox: "0 0 300 300", width: 300, height: 300, style: "overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
      el("rect", { x: 100, y: 30, width: 100, height: 200, rx: 18, fill: "#fff", stroke: "#292B2C", "stroke-width": 6 }, s);
      el("rect", { x: 128, y: 14, width: 44, height: 18, rx: 5, fill: "#292B2C" }, s);
      var fill = el("rect", { x: 110, y: 220, width: 80, height: 0, rx: 8, fill: "var(--d)" }, s);
      var raio = el("path", { d: "M156 80 L134 132 H152 L142 180 L168 120 H150 Z", fill: "#FFD10C", stroke: "#8A6A00", "stroke-width": 2, "stroke-linejoin": "round" }, s);
      var pct = el("text", { x: 150, y: 270, "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#3F2FA0" }, s);
      var rel = el("text", { x: 150, y: 306, "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#5E5A70" }, s);
      return { fill: fill, pct: pct, rel: rel, raio: raio };
    }
    function desenha(st, t) {
      var f = Math.min(1, t / TOTAL);
      st.fill.setAttribute("height", (180 * f).toFixed(1));
      st.fill.setAttribute("y", (220 - 180 * f).toFixed(1));
      st.pct.textContent = Math.round(5000 * f) + " mAh";
      var h = Math.floor(t + 1e-9), m = Math.round((t - h) * 60);
      if (m === 60) { h++; m = 0; }
      st.rel.textContent = "t = " + h + " h " + String(m).padStart(2, "0") + " min";
    }
    return {
      inicia: function (box) { box._st = monta(box); desenha(box._st, 0); },
      roda: function (box, direto) {
        var st = box._st = monta(box);
        if (direto || reduz()) { desenha(st, TOTAL); return; }
        var t0 = null;
        function quadro(agora) {
          if (box._st !== st) return;
          if (t0 === null) t0 = agora;
          var t = Math.min(TOTAL, (agora - t0) / 1000 / SEG * TOTAL);
          desenha(st, t);
          if (t < TOTAL) requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      },
      zera: function (box) { box._st = monta(box); desenha(box._st, 0); }
    };
  })();

  /* ---------- Medidor de luz (odômetro) ---------- */
  window.QuarksAnimacoes["el-medidor"] = (function () {
    var SEG = 4.5;
    function monta(box) {
      box.innerHTML = "";
      var s = el("svg", { viewBox: "0 0 460 300", width: 460, height: 300, style: "overflow:visible;font-family:Figtree,'Segoe UI',sans-serif" }, box);
      el("rect", { x: 10, y: 10, width: 440, height: 280, rx: 36, fill: "#fff", stroke: "#7F7A99", "stroke-width": 5 }, s);
      el("text", { x: 230, y: 62, "text-anchor": "middle", "font-size": 24, "font-weight": 800, fill: "#5E5A70", "letter-spacing": "3" }, s).textContent = "MEDIDOR DE ENERGIA";
      var dig = [];
      for (var i = 0; i < 4; i++) {
        var g = el("g", {}, s);
        el("rect", { x: 70 + i * 82, y: 92, width: 70, height: 96, rx: 12, fill: "#292B2C" }, g);
        var clip = "clipDig" + Math.random().toString(36).slice(2, 7);
        var cp = el("clipPath", { id: clip }, s);
        el("rect", { x: 70 + i * 82, y: 92, width: 70, height: 96, rx: 12 }, cp);
        var col = el("g", { "clip-path": "url(#" + clip + ")" }, g);
        var fita = el("g", {}, col);
        for (var d = 0; d <= 10; d++) {
          el("text", { x: 105 + i * 82, y: 160 + d * 96, "text-anchor": "middle", "font-size": 64, "font-weight": 800, fill: "#FFD10C", "font-family": "'Bricolage Grotesque','Segoe UI',sans-serif" }, fita).textContent = d % 10;
        }
        dig.push(fita);
      }
      el("text", { x: 230, y: 236, "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#3F2FA0" }, s).textContent = "kWh";
      var disco = el("g", {}, s);
      el("rect", { x: 150, y: 252, width: 160, height: 14, rx: 7, fill: "#E4DEFB" }, disco);
      var marca = el("rect", { x: 150, y: 252, width: 28, height: 14, rx: 7, fill: "var(--d)" }, disco);
      return { dig: dig, marca: marca };
    }
    function desenha(st, v) {
      // cada roda mostra o seu algarismo; a roda gira suave quando a da direita passa do 9
      for (var i = 3; i >= 0; i--) {
        var pot = Math.pow(10, 3 - i), d = Math.floor(v / pot) % 10, r = v % pot;
        var frac = r > pot - 1 ? r - (pot - 1) : 0;
        st.dig[i].setAttribute("transform", "translate(0 " + (-(d + frac) * 96).toFixed(1) + ")");
      }
      st.marca.setAttribute("x", (150 + ((v * 3) % 132)).toFixed(1));
    }
    return {
      inicia: function (box) { box._st = monta(box); desenha(box._st, +box.dataset.de); },
      roda: function (box, direto) {
        var st = box._st = monta(box), de = +box.dataset.de, ate = +box.dataset.ate;
        if (direto || reduz()) { desenha(st, ate); return; }
        var t0 = null;
        function quadro(agora) {
          if (box._st !== st) return;
          if (t0 === null) t0 = agora;
          var f = Math.min(1, (agora - t0) / 1000 / SEG), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          desenha(st, de + (ate - de) * e);
          if (f < 1) requestAnimationFrame(quadro);
        }
        requestAnimationFrame(quadro);
      },
      zera: function (box) { box._st = monta(box); desenha(box._st, +box.dataset.de); }
    };
  })();

  function inicia() {
    ["el-eletrons", "el-carga", "el-medidor"].forEach(function (n) {
      document.querySelectorAll('[data-anima="' + n + '"]').forEach(function (b) { if (!b._st) window.QuarksAnimacoes[n].inicia(b); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicia); else inicia();
})();
