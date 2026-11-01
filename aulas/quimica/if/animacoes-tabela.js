/* Tabela periódica e distribuição eletrônica (Química, IF).
   Regra: só se movem na tela aberta (.slide.ativo) e depois que a figura aparece.
   - svg.tp: a tabela periódica é desenhada aqui (118 elementos, cores da marca). Cada casa recebe classes
     de tipo (t-metal, t-ametal, t-nobre, t-h), grupo (g1…g18), período (p1…p7) e bloco (b-s, b-p, b-d, b-f),
     para os destaques por clique ficarem só no CSS da parte.
   - data-anima="tabela-monta": a tabela se monta em ordem crescente de número atômico (a ordem de Moseley).
   - data-anima="enche": os elétrons entram nos subníveis na ordem do diagrama de Linus Pauling, um por vez. */
window.QuarksAnimacoes = window.QuarksAnimacoes || {};

(function () {
  var NS = "http://www.w3.org/2000/svg";
  var SIMB = ("H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og").split(" ");
  // não metais (sem os gases nobres e sem o H, que tem classe própria)
  var AMETAL = { B: 1, C: 1, N: 1, O: 1, F: 1, Si: 1, P: 1, S: 1, Cl: 1, As: 1, Se: 1, Br: 1, Te: 1, I: 1, At: 1, Ts: 1 };
  var NOBRE = { He: 1, Ne: 1, Ar: 1, Kr: 1, Xe: 1, Rn: 1, Og: 1 };
  var INICIO = [0, 1, 3, 11, 19, 37, 55, 87]; // primeiro Z de cada período

  /* posição (período, grupo) de cada Z; lantanídeos e actinídeos vão para as linhas de baixo (grupo 0 = linha f) */
  function lugar(z) {
    var p = 1;
    while (p < 7 && z >= INICIO[p + 1]) p++;
    var i = z - INICIO[p];
    if (p === 1) return { p: 1, g: z === 1 ? 1 : 18 };
    if (p <= 3) return { p: p, g: i < 2 ? i + 1 : i + 11 };
    if (p <= 5) return { p: p, g: i + 1 };
    if (i < 2) return { p: p, g: i + 1 };
    if (i < 17) return { p: p, g: 0, f: i - 2 }; // La…Lu ou Ac…Lr
    return { p: p, g: i - 13 };
  }
  var L = 56, C = 52; // passo e tamanho da casa
  function xy(o) {
    if (o.g === 0) return [ (o.f + 2) * L + 40, 7 * L + 30 + (o.p - 6) * L + 46 ];
    return [ (o.g - 1) * L + 40, (o.p - 1) * L + 46 ];
  }

  function desenha(svg) {
    var h = "", rot = (svg.dataset.rotulos || "").split(" ");
    if (rot.indexOf("grupos") >= 0) for (var g = 1; g <= 18; g++)
      h += '<text class="rot-g" x="' + ((g - 1) * L + 40 + C / 2) + '" y="34" text-anchor="middle">' + g + "</text>";
    if (rot.indexOf("periodos") >= 0) for (var p = 1; p <= 7; p++)
      h += '<text class="rot-p" x="22" y="' + ((p - 1) * L + 46 + C / 2 + 8) + '" text-anchor="middle">' + p + "</text>";
    // casas que lembram onde entram os lantanídeos e os actinídeos
    [[6, "57–71"], [7, "89–103"]].forEach(function (c) {
      var x = 2 * L + 40, y = (c[0] - 1) * L + 46;
      h += '<g class="el lugar-f b-f g3 p' + c[0] + '"><rect x="' + x + '" y="' + y + '" width="' + C + '" height="' + C + '" rx="9"/>' +
        '<text class="s" x="' + (x + C / 2) + '" y="' + (y + 33) + '" text-anchor="middle" style="font-size:12px">' + c[1] + "</text></g>";
    });
    for (var z = 1; z <= 118; z++) {
      var s = SIMB[z - 1], o = lugar(z), q = xy(o);
      var t = s === "H" ? "t-h" : NOBRE[s] ? "t-nobre" : AMETAL[s] ? "t-ametal" : "t-metal";
      var b = o.g === 0 ? "b-f" : (o.g <= 2 || s === "He") ? "b-s" : o.g <= 12 ? "b-d" : "b-p";
      var cl = "el " + t + " " + b + " p" + o.p + (o.g ? " g" + o.g : (z < 72 ? " lan" : " act")) + " e-" + s;
      h += '<g class="' + cl + '" data-z="' + z + '"><rect x="' + q[0] + '" y="' + q[1] + '" width="' + C + '" height="' + C + '" rx="9"/>' +
        '<text class="z" x="' + (q[0] + 6) + '" y="' + (q[1] + 15) + '">' + z + "</text>" +
        '<text class="s" x="' + (q[0] + C / 2) + '" y="' + (q[1] + 41) + '" text-anchor="middle">' + s + "</text></g>";
    }
    if (rot.indexOf("f") >= 0) {
      var y6 = 7 * L + 76, y7 = y6 + L;
      h += '<text class="rot-f" x="' + (2 * L + 30) + '" y="' + (y6 + 34) + '" text-anchor="end">lantanídeos</text>' +
        '<text class="rot-f" x="' + (2 * L + 30) + '" y="' + (y7 + 34) + '" text-anchor="end">actinídeos</text>';
    }
    svg.setAttribute("viewBox", "0 0 " + (18 * L + 44) + " " + (9 * L + 80));
    svg.insertAdjacentHTML("afterbegin", h);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("svg.tp").forEach(function (s) { if (!s.querySelector(".el")) desenha(s); }); // em geral a tabela já vem pronta no HTML
    document.querySelectorAll('[data-anima="enche"]').forEach(function (b) { enche.monta(b, true); });
  });

  /* ---------- A tabela se monta em ordem de Z ---------- */
  window.QuarksAnimacoes["tabela-monta"] = {
    inicia: function () {},
    zera: function (svg) {
      svg._vez = (svg._vez || 0) + 1;
      svg.querySelectorAll(".el").forEach(function (g) { g.style.opacity = ""; });
      var c = svg.parentNode.querySelector("[data-contador]"); if (c) c.textContent = "";
    },
    roda: function (svg) {
      var els = Array.prototype.slice.call(svg.querySelectorAll(".el[data-z]"));
      var lugares = svg.querySelectorAll(".lugar-f");
      var c = svg.parentNode.querySelector("[data-contador]");
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var vez = svg._vez = (svg._vez || 0) + 1;
      els.forEach(function (g) { g.style.opacity = "0"; });
      lugares.forEach(function (g) { g.style.opacity = "0"; });
      var z = 0;
      function proximo() {
        if (svg._vez !== vez) return;
        z++;
        if (z > 118) { lugares.forEach(function (g) { g.style.opacity = ""; }); if (c) c.textContent = "118 elementos"; return; }
        var g = svg.querySelector('.el[data-z="' + z + '"]');
        g.style.transition = "opacity .35s"; g.style.opacity = "1";
        if (c) c.textContent = "Z = " + z + " · " + g.querySelector(".s").textContent;
        setTimeout(proximo, z < 20 ? 160 : 45); // devagar no começo, para dar tempo de ler
      }
      setTimeout(proximo, 300);
    }
  };

  /* ---------- Elétrons entrando nos subníveis ---------- */
  var ORDEM = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];
  var MAX = { s: 2, p: 6, d: 10, f: 14 };
  function sup(n) { return String(n); } // o número de elétrons fica no alto pelo CSS (.sub-n i)
  var enche = {
    monta: function (box, cheio) {
      var z = +box.dataset.z, h = "", r = z;
      for (var i = 0; r > 0; i++) {
        var m = Math.min(MAX[ORDEM[i][1]], r); r -= m;
        h += '<span class="sub-n" data-max="' + m + '"><b>' + ORDEM[i] + '</b><i>' + (cheio ? sup(m) : "") + "</i></span>";
      }
      box.querySelector(".fila").innerHTML = h;
      var c = box.querySelector("[data-conta]"); if (c) c.textContent = cheio ? z + " de " + z : "0 de " + z;
      box.classList.toggle("pronto", !!cheio);
      box.querySelectorAll(".sub-n").forEach(function (s) { s.classList.toggle("cheio", !!cheio); });
    },
    inicia: function (box) { enche.monta(box, true); },
    zera: function (box) { box._vez = (box._vez || 0) + 1; enche.monta(box, false); },
    roda: function (box) {
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { enche.monta(box, true); return; }
      var vez = box._vez = (box._vez || 0) + 1;
      enche.monta(box, false);
      var subs = box.querySelectorAll(".sub-n"), z = +box.dataset.z, c = box.querySelector("[data-conta]");
      var i = 0, n = 0, total = 0;
      function passo() {
        if (box._vez !== vez) return;
        var s = subs[i];
        n++; total++;
        s.classList.add("enchendo");
        s.querySelector("i").textContent = sup(n);
        if (c) c.textContent = total + " de " + z;
        if (n >= +s.dataset.max) { s.classList.remove("enchendo"); s.classList.add("cheio"); i++; n = 0; }
        if (total >= z) { box.classList.add("pronto"); return; }
        setTimeout(passo, 230);
      }
      setTimeout(passo, 500);
    }
  };
  window.QuarksAnimacoes.enche = enche;
})();
