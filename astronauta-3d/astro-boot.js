/* Carrega o mascote: astronauta 3D (astronauta3d.js) quando o aparelho suporta WebGL.
   Se o 3D não abrir (aparelho antigo, sem WebGL ou falha de rede), carrega o astronauta 2D antigo. */
(function () {
  if (window.__astroBoot) return; window.__astroBoot = true;
  var V3D = "/astronauta3d.js?v=2";
  var done = false;
  function fallback() {
    if (done) return; done = true;
    if (window.__astroMx) return; // 3D já está na tela
    var a = document.createElement("script"); a.src = "/astronauta-img.js?v=3";
    a.onload = function () { var b = document.createElement("script"); b.src = "/astronauta.js?v=5"; document.body.appendChild(b); };
    document.body.appendChild(a);
  }
  window.__astro3dFail = function () { window.__astroMx = false; done = false; fallback(); };
  var gl = null;
  try { var c = document.createElement("canvas"); gl = c.getContext("webgl2") || c.getContext("webgl"); } catch (e) {}
  if (!gl) return fallback();
  var timer = setTimeout(function () { if (!window.__astroMx) fallback(); }, 9000);
  try {
    (new Function("u", "return import(u)"))(V3D).then(function () { clearTimeout(timer); done = true; }, function () { clearTimeout(timer); fallback(); });
  } catch (e) { clearTimeout(timer); fallback(); }
})();
