/* Motor de slides do Quarks.
   Teclas: → / espaço / PageDown avança; ← / PageUp volta; N notas; D caneta (1-4 cores, Z desfaz, C apaga);
   B tela de pausa; G modo gravação (esconde o "câmera" da moldura); F tela cheia; ? ajuda. */
(function () {
  "use strict";
  var palco = document.getElementById("palco");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var animacoes = window.QuarksAnimacoes || {};
  var atual = 0, passo = 0, inicio = null;

  /* ---------- Escala do palco ---------- */
  function escala() {
    var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    palco.style.setProperty("--k", k);
    palco.dataset.k = k;
  }
  window.addEventListener("resize", escala);
  escala();

  /* ---------- Passos ---------- */
  function maxPasso(s) {
    var m = 0;
    s.querySelectorAll("[data-passo]").forEach(function (el) { m = Math.max(m, +el.dataset.passo); });
    s.querySelectorAll("[data-em]").forEach(function (el) {
      el.dataset.em.split(/\s+/).forEach(function (par) { m = Math.max(m, +par.split(":")[0]); });
    });
    s.querySelectorAll("[data-anima]").forEach(function (el) { m = Math.max(m, +(el.dataset.animaPasso || 0)); });
    return m;
  }

  function aplica(s, p, voltando) {
    s.querySelectorAll("[data-passo]").forEach(function (el) {
      el.classList.toggle("mostra", p >= +el.dataset.passo);
    });
    s.querySelectorAll("[data-em]").forEach(function (el) {
      el.dataset.em.split(/\s+/).forEach(function (par) {
        var x = par.split(":");
        el.classList.toggle(x[1], p >= +x[0]);
      });
    });
    s.querySelectorAll("[data-anima]").forEach(function (el) {
      var a = animacoes[el.dataset.anima];
      if (!a) return;
      var n = +(el.dataset.animaPasso || 0);
      if (p >= n && !el._rodou) { el._rodou = true; a.roda(el, voltando); }
      else if (p < n && el._rodou) { el._rodou = false; a.zera(el); }
    });
  }

  function mostra(i, p, voltando) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i !== atual) {
      slides[atual].querySelectorAll("[data-anima]").forEach(function (el) {
        var a = animacoes[el.dataset.anima];
        if (a && el._rodou) { el._rodou = false; a.zera(el); }
      });
    }
    atual = i;
    passo = Math.max(0, Math.min(maxPasso(slides[i]), p));
    slides.forEach(function (s, j) { s.classList.toggle("ativo", j === i); });
    palco.classList.toggle("escuro", slides[i].classList.contains("capa"));
    aplica(slides[i], passo, voltando);
    document.querySelector("#progresso span").textContent = (i + 1) + " / " + slides.length;
    document.querySelector("#progresso .trilho b").style.width = ((i + 1) / slides.length * 100) + "%";
    try { history.replaceState(null, "", "#s" + (i + 1)); } catch (e) { /* sem histórico */ }
    redesenha();
    atualizaNotas();
  }

  function avanca() {
    if (inicio === null) inicio = Date.now();
    if (passo < maxPasso(slides[atual])) mostra(atual, passo + 1);
    else if (atual < slides.length - 1) mostra(atual + 1, 0);
  }
  function volta() {
    if (passo > 0) mostra(atual, passo - 1, true);
    else if (atual > 0) mostra(atual - 1, maxPasso(slides[atual - 1]), true);
  }

  /* ---------- Caneta (traços guardados por slide) ---------- */
  var tela = document.getElementById("caneta");
  var ctx = tela.getContext("2d");
  var tracos = {};          // índice do slide -> lista de traços
  var tracoAtual = null;
  var cores = ["#3F2FA0", "var(--d)", "#292B2C", "#C2384F"];
  var corCaneta = cores[0];
  function corReal(c) { return c.indexOf("var(") === 0 ? (getComputedStyle(palco).getPropertyValue("--d").trim() || "#6551D1") : c; }
  function ponto(ev) {
    var r = tela.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width * 1920, (ev.clientY - r.top) / r.height * 1080];
  }
  function risca(t) {
    ctx.strokeStyle = corReal(t.cor); ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    t.p.forEach(function (q, i) { if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
    if (t.p.length === 1) ctx.lineTo(t.p[0][0] + .1, t.p[0][1]);
    ctx.stroke();
  }
  function redesenha() { ctx.clearRect(0, 0, 1920, 1080); (tracos[atual] || []).forEach(risca); }
  function limpaCaneta() { tracos[atual] = []; redesenha(); }
  function desfaz() { (tracos[atual] || []).pop(); redesenha(); }
  tela.addEventListener("pointerdown", function (ev) {
    tela.setPointerCapture(ev.pointerId);
    tracoAtual = { cor: corCaneta, p: [ponto(ev)] };
    (tracos[atual] = tracos[atual] || []).push(tracoAtual);
    risca(tracoAtual);
  });
  tela.addEventListener("pointermove", function (ev) {
    if (!tracoAtual) return;
    tracoAtual.p.push(ponto(ev)); redesenha();
  });
  tela.addEventListener("pointerup", function () { tracoAtual = null; });

  /* ---------- Notas do professor ---------- */
  var janelaNotas = null;
  var painel = document.getElementById("notasPainel");
  function textoNotas() {
    var s = slides[atual], prox = slides[atual + 1];
    var n = s.querySelector(".notas");
    return {
      cabeca: "Slide " + (atual + 1) + " de " + slides.length + " · clique " + passo + " de " + maxPasso(s),
      notas: n ? n.innerHTML : "<i>Sem notas neste slide.</i>",
      proximo: prox ? (prox.dataset.nome || "Slide " + (atual + 2)) : "Fim da aula"
    };
  }
  function relogio() {
    if (inicio === null) return "00:00";
    var t = Math.floor((Date.now() - inicio) / 1000);
    return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
  }
  function atualizaNotas() {
    var t = textoNotas();
    if (janelaNotas && !janelaNotas.closed) {
      var d = janelaNotas.document;
      d.getElementById("cab").textContent = t.cabeca;
      d.getElementById("txt").innerHTML = t.notas;
      d.getElementById("prox").textContent = t.proximo;
    }
    if (!painel.hidden) painel.innerHTML = "<b>" + t.cabeca + "</b><br>" + t.notas + "<br><b>Próximo:</b> " + t.proximo;
  }
  setInterval(function () {
    if (janelaNotas && !janelaNotas.closed) janelaNotas.document.getElementById("rel").textContent = relogio();
  }, 1000);
  function abreNotas() {
    if (janelaNotas && !janelaNotas.closed) { janelaNotas.focus(); return; }
    var w = null;
    try { w = window.open("", "notas-quarks", "width=720,height=520"); } catch (e) { w = null; }
    if (!w) { painel.hidden = !painel.hidden; atualizaNotas(); return; }
    janelaNotas = w;
    w.document.write('<!doctype html><meta charset="utf-8"><title>Notas · ' + document.title + '</title>' +
      '<style>body{margin:0;padding:22px 26px;font:20px/1.5 Figtree,"Segoe UI",sans-serif;background:#F7F5FE;color:#292B2C}' +
      'header{display:flex;justify-content:space-between;align-items:center;font-weight:700;color:#5E5A70;font-size:16px}' +
      '#rel{font:800 34px "Bricolage Grotesque","Segoe UI",sans-serif;color:#3F2FA0;font-variant-numeric:tabular-nums}' +
      '#txt{background:#fff;border:1.5px solid #E4DEFB;border-radius:20px;padding:16px 20px;margin:14px 0}' +
      'p{margin:.3em 0}footer{color:#5E5A70;font-size:16px}footer b{color:#3F2FA0}</style>' +
      '<header><span id="cab"></span><span id="rel">00:00</span></header><div id="txt"></div>' +
      '<footer><b>Próximo:</b> <span id="prox"></span> · use as setas aqui também</footer>');
    w.document.close();
    w.document.addEventListener("keydown", tecla);
    atualizaNotas();
  }

  /* ---------- Ajuda ---------- */
  var ajuda = document.getElementById("ajuda");
  ajuda.addEventListener("click", function () { ajuda.hidden = true; });

  /* ---------- Teclado e cliques ---------- */
  function tecla(ev) {
    var k = ev.key;
    if (["ArrowRight", " ", "PageDown", "Enter", "ArrowDown"].indexOf(k) >= 0) { ev.preventDefault(); avanca(); }
    else if (["ArrowLeft", "PageUp", "Backspace", "ArrowUp"].indexOf(k) >= 0) { ev.preventDefault(); volta(); }
    else if (k === "Home") mostra(0, 0);
    else if (k === "End") mostra(slides.length - 1, 0);
    else if (k === "n" || k === "N") abreNotas();
    else if (k === "d" || k === "D") palco.classList.toggle("desenhando");
    else if (k === "c" || k === "C") limpaCaneta();
    else if (k === "z" || k === "Z") desfaz();
    else if (k >= "1" && k <= "4") { corCaneta = cores[+k - 1]; palco.classList.add("desenhando"); }
    else if (k === "b" || k === "B") { var p = document.getElementById("pausa"); p.hidden = !p.hidden; }
    else if (k === "g" || k === "G") palco.classList.toggle("gravando");
    else if (k === "f" || k === "F") {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
    }
    else if (k === "?" || k === "h" || k === "H") ajuda.hidden = !ajuda.hidden;
    else if (k === "Escape") { ajuda.hidden = true; palco.classList.remove("desenhando"); }
  }
  document.addEventListener("keydown", tecla);
  palco.addEventListener("click", function (ev) {
    if (palco.classList.contains("desenhando")) return;
    var r = palco.getBoundingClientRect();
    if ((ev.clientX - r.left) / r.width < 0.3) volta(); else avanca();
  });

  /* Dica que some sozinha */
  var dica = document.getElementById("dica");
  setTimeout(function () { dica.style.opacity = "0"; }, 3500);
  setTimeout(function () { dica.hidden = true; }, 4200);

  /* ---------- Início ---------- */
  var m = /^#s(\d+)$/.exec(location.hash);
  mostra(m ? +m[1] - 1 : 0, 0);
})();
