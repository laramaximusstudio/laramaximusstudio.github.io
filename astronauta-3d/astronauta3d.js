/* Mascote 3D: astronauta Wyguivan Reyller (Equipe Maximus · MyBroker).
   Modelo 3D montado em tempo real (three.js) com esqueleto: flutua, acena, segura a bandeira
   com a mão fechada no mastro, pousa, fica em pé e caminha de verdade.
   Versão realista: proporção adulta, trama de tecido na roupa, viseira dourada espelhada
   (reflete a Terra e o sol), bolha de vidro, lanternas no capacete, painel de controle no peito,
   propulsores na mochila e anel holográfico quando ele pousa.
   O logo MyBroker é um patch aplicado na roupa (acompanha a curva, a luz e a costura).
   Se o 3D não puder rodar, /astro-boot.js carrega o astronauta antigo (2D). */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

/* ===================== MODELO ===================== */
const MB_ICON = "M111 5l-4 1l-6 5l-94 95l0 3l12 2l2-1l6 1l2-1l5 1l1-1l9 1l16-1l46-45l1 2l-29 52l0 5l3 5l23 23l5 3l6 0l50-28l2 1l-1 2l-49 49l-3 1l-7-1l-47-47l-48-1l-4 1l-1 4l94 95l7 5l8 0l5-3l105-106l2-7l-2-5l-31-32l-13-11l-9 0l-35 27l-7 4l-1-2l29-38l3-6l0-4l-3-6l-39-39l-3-2z";

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* Patch do peito: base de tecido cinza com costura, placa azul e símbolo MyBroker. */
function drawBadge(g, W, H, bump) {
  g.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, s = H * 0.86;
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  // moldura de tecido
  rr(cx - s * 0.62, cy - s * 0.5, s * 1.24, s, s * 0.16);
  g.fillStyle = bump ? "#808080" : "#c9ccd3"; g.fill();
  // placa
  rr(cx - s * 0.5, cy - s * 0.4, s, s * 0.8, s * 0.12);
  if (bump) { g.fillStyle = "#b0b0b0"; g.fill(); }
  else {
    const gr = g.createLinearGradient(0, cy - s * 0.4, 0, cy + s * 0.4);
    gr.addColorStop(0, "#2b55d9"); gr.addColorStop(1, "#14307f");
    g.fillStyle = gr; g.fill();
  }
  // costura
  g.setLineDash([s * 0.035, s * 0.025]); g.lineWidth = s * 0.012;
  g.strokeStyle = bump ? "#5a5a5a" : "rgba(255,255,255,.75)";
  rr(cx - s * 0.56, cy - s * 0.45, s * 1.12, s * 0.9, s * 0.14); g.stroke(); g.setLineDash([]);
  // símbolo
  const p = new Path2D(MB_ICON), k = (s * 0.62) / 231;
  g.save(); g.translate(cx - (7 + 221 / 2) * k, cy - (5 + 231 / 2) * k); g.scale(k, k);
  g.fillStyle = "#ffffff"; g.fill(p); g.restore();
}

const FLAG_DRAW = {
  br(g, w, h) { g.fillStyle = "#009c3b"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffdf00"; g.beginPath(); g.moveTo(w / 2, h * .1); g.lineTo(w * .92, h / 2); g.lineTo(w / 2, h * .9); g.lineTo(w * .08, h / 2); g.closePath(); g.fill(); g.fillStyle = "#002776"; g.beginPath(); g.arc(w / 2, h / 2, h * .235, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = h * .045; g.beginPath(); g.arc(w / 2, h * .83, h * .42, -2.05, -1.1); g.stroke(); },
  us(g, w, h) { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#fff" : "#b22234"; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = "#3c3b6e"; g.fillRect(0, 0, w * .42, h * 7 / 13); g.fillStyle = "#fff"; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { g.beginPath(); g.arc(w * .035 + c * w * .068 + (r % 2) * w * .034, h * .06 + r * h * .1, h * .018, 0, 7); g.fill(); } },
  pt(g, w, h) { g.fillStyle = "#ff0000"; g.fillRect(0, 0, w, h); g.fillStyle = "#006600"; g.fillRect(0, 0, w * .4, h); g.strokeStyle = "#ffe000"; g.lineWidth = h * .06; g.beginPath(); g.arc(w * .4, h / 2, h * .2, 0, 7); g.stroke(); g.fillStyle = "#ff0000"; g.strokeStyle = "#fff"; g.lineWidth = h * .03; g.beginPath(); g.moveTo(w * .33, h * .38); g.lineTo(w * .47, h * .38); g.lineTo(w * .47, h * .55); g.quadraticCurveTo(w * .47, h * .65, w * .4, h * .68); g.quadraticCurveTo(w * .33, h * .65, w * .33, h * .55); g.closePath(); g.fill(); g.stroke(); },
  ae(g, w, h) { g.fillStyle = "#00732f"; g.fillRect(0, 0, w, h / 3); g.fillStyle = "#ffffff"; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = "#000000"; g.fillRect(0, h * 2 / 3, w, h / 3 + 1); g.fillStyle = "#ff0000"; g.fillRect(0, 0, w * 0.26, h); },
  py(g, w, h) { g.fillStyle = "#d52b1e"; g.fillRect(0, 0, w, h / 3); g.fillStyle = "#fff"; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = "#0038a8"; g.fillRect(0, h * 2 / 3, w, h / 3 + 1); g.strokeStyle = "#2c7a2c"; g.lineWidth = h * .035; g.beginPath(); g.arc(w / 2, h / 2, h * .12, 0, 7); g.stroke(); g.fillStyle = "#f5c400"; g.beginPath(); g.arc(w / 2, h / 2, h * .04, 0, 7); g.fill(); },
};

/* trama de tecido Ortho-Fabric (relevo fino da roupa) */
function weaveTex() {
  const t = canvasTex(256, 256, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const wx = Math.sin(x * 0.785) * Math.sin(y * 0.392), wy = Math.sin(y * 0.785) * Math.sin(x * 0.392 + 1.57);
      const n = 128 + 34 * ((x >> 2) + (y >> 2) & 1 ? wx : wy) + (Math.random() - 0.5) * 26;
      const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = n; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 7); return t;
}
/* Terra vista do espaço (aparece refletida na viseira) */
function earthTex() {
  return canvasTex(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0d3f8f"); gr.addColorStop(0.5, "#1f6fd0"); gr.addColorStop(1, "#0a2f6e");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#2f8f4e"; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(Math.random() * w, h * 0.25 + Math.random() * h * 0.5, 10 + Math.random() * 28, 6 + Math.random() * 14, Math.random() * 3, 0, 7); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.75)"; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 30, 2 + Math.random() * 5, Math.random() * 0.6 - 0.3, 0, 7); g.fill(); }
  });
}
function makeEnv(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0c0c10);
  const panel = (w, h, col, k, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); sc.add(m); };
  panel(7, 3, 0xffffff, 5, [0, 6, 2]);
  panel(3, 5, 0xffffff, 3, [5, 1.5, 4]);
  panel(4, 5, 0xff7a1a, 4, [-5, 1, -2]);
  panel(4, 2, 0x9fb7ff, 1.6, [-4, 2.5, 5]);
  panel(14, 14, 0x16161c, 1, [0, -6, 0]);
  panel(9, 5, 0xffe2b8, 1.1, [-1.5, 2.6, 7]);
  panel(5, 3, 0xff9a3c, 1.4, [3.5, 0.5, 6]);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 20), new THREE.MeshBasicMaterial({ map: earthTex() }));
  earth.position.set(3.2, -1.2, 6.5); sc.add(earth);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(14) }));
  sun.position.set(-3.5, 3.2, 6); sc.add(sun);
  const t = pm.fromScene(sc, 0.02).texture; pm.dispose(); return t;
}

export function createAstronaut(canvas, opts = {}) {
  const WEAVE = weaveTex();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: !!opts.preserve, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  const camera = new THREE.PerspectiveCamera(opts.fov || 26, 1, 0.1, 50);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1a10, 0.55));
  const key = new THREE.DirectionalLight(0xfff4e8, 2.4); key.position.set(3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff7a1a, 3.2); rim.position.set(-4, 2.5, -4); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xa9c2ff, 1.1); rim2.position.set(4, 1, -3); scene.add(rim2);

  /* materiais */
  const M = {
    suit: new THREE.MeshPhysicalMaterial({ color: 0xeeeff1, roughness: 0.7, bumpMap: WEAVE, bumpScale: 1.4, sheen: 0.6, sheenRoughness: 0.7, sheenColor: 0xffffff, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    shell: new THREE.MeshPhysicalMaterial({ color: 0xf6f7f9, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
    soft: new THREE.MeshPhysicalMaterial({ color: 0xb4b8c0, roughness: 0.78, bumpMap: WEAVE, bumpScale: 0.9, sheen: 0.4, sheenColor: 0xdfe4ee }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.6, metalness: 0.2 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xff6a00, roughness: 0.42, clearcoat: 0.5, emissive: 0x3a1200 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd9a64a, metalness: 1, roughness: 0.22 }),
    visor: new THREE.MeshPhysicalMaterial({ color: 0xc9953f, metalness: 1, roughness: 0.05, envMapIntensity: 1.6, iridescence: 0.35, iridescenceIOR: 1.5, clearcoat: 1, clearcoatRoughness: 0.02 }),
    bubble: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.02, transparent: true, opacity: 0.18, envMapIntensity: 1.4, depthWrite: false }),
    metal: new THREE.MeshStandardMaterial({ color: 0x9aa0aa, metalness: 1, roughness: 0.3 }),
    lens: new THREE.MeshBasicMaterial({ color: 0xfff1d6 }),
    btnR: new THREE.MeshStandardMaterial({ color: 0xd8341f, roughness: 0.4, emissive: 0x3a0800 }),
    btnB: new THREE.MeshStandardMaterial({ color: 0x2b55d9, roughness: 0.4, emissive: 0x05102e }),
    glove: new THREE.MeshPhysicalMaterial({ color: 0xe6e8ec, roughness: 0.66, bumpMap: WEAVE, bumpScale: 0.8, sheen: 0.5, sheenColor: 0xffffff }),
    pole: new THREE.MeshStandardMaterial({ color: 0xdfe2e8, metalness: 0.85, roughness: 0.25 }),
    light: new THREE.MeshBasicMaterial({ color: 0xffb066 }),
  };
  const add = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scl); parent.add(m); return m; };
  const grp = (parent, pos = [0, 0, 0], order = "XYZ") => { const g = new THREE.Group(); g.position.set(...pos); g.rotation.order = order; parent.add(g); return g; };
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20);
  const ring = (r, t) => new THREE.TorusGeometry(r, t, 12, 36);
  const H = Math.PI / 2;

  const root = grp(scene);
  const body = grp(root, [0, 0, 0], "YXZ");
  const hips = grp(body, [0, 0.9, 0], "YXZ");
  add(hips, cap(0.22, 0.12), M.suit, [0, 0, 0], [0, 0, H], [1, 1.15, 0.9]);
  add(hips, ring(0.255, 0.035), M.orange, [0, 0.07, 0], [H, 0, 0], [1.08, 0.86, 1]);
  const spine = grp(hips, [0, 0.08, 0], "YXZ");
  const torso = add(spine, cap(0.29, 0.22), M.suit, [0, 0.3, 0], [0, 0, 0], [1.12, 1, 0.84]);
  // patch MyBroker aplicado na roupa (mesma curvatura do tronco)
  const badgeMap = canvasTex(640, 400, (g, w, h) => drawBadge(g, w, h, false));
  const badgeBump = canvasTex(640, 400, (g, w, h) => drawBadge(g, w, h, true), false);
  const badgeMat = new THREE.MeshPhysicalMaterial({ map: badgeMap, bumpMap: badgeBump, bumpScale: 2.2, transparent: true, alphaTest: 0.02, roughness: 0.5, sheen: 0.5, sheenColor: 0xffffff, clearcoat: 0.35, clearcoatRoughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2 });
  add(torso, new THREE.CylinderGeometry(0.2915, 0.2915, 0.205, 40, 1, true, -0.62, 1.24), badgeMat, [0, 0.03, 0]);
  // costuras/listras do tronco
  add(torso, ring(0.291, 0.012), M.orange, [0, -0.115, 0], [H, 0, 0]);
  add(torso, ring(0.291, 0.012), M.soft, [0, 0.135, 0], [H, 0, 0]);
  // painel de controle (DCM) na barriga, com botões
  const dcm = add(spine, new THREE.BoxGeometry(0.3, 0.1, 0.07), M.shell, [0, 0.1, 0.255], [-0.15, 0, 0]);
  add(dcm, new THREE.BoxGeometry(0.31, 0.012, 0.075), M.dark, [0, -0.05, 0]);
  [[-0.1, M.btnR], [-0.035, M.metal], [0.035, M.metal], [0.1, M.btnB]].forEach(([x, m]) => add(dcm, new THREE.CylinderGeometry(0.017, 0.017, 0.02, 16), m, [x, 0.01, 0.04], [H, 0, 0]));
  add(dcm, new THREE.BoxGeometry(0.07, 0.03, 0.006), M.lens, [0, 0.03, 0.037]);
  // conexões de fluido no peito
  for (const s of [-1, 1]) add(spine, new THREE.CylinderGeometry(0.03, 0.03, 0.035, 16), M.orange, [s * 0.17, 0.2, 0.24], [H + 0.2, 0, 0]);
  // gola
  add(spine, ring(0.2, 0.06), M.soft, [0, 0.68, 0], [H, 0, 0], [1, 0.92, 1]);
  add(spine, ring(0.215, 0.022), M.orange, [0, 0.715, 0], [H, 0, 0], [1, 0.92, 1]);
  // mochila
  const shape = new THREE.Shape(); { const w = 0.46, h = 0.54, r = 0.09, x = -w / 2, y = -h / 2; shape.moveTo(x + r, y); shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r); shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h); shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r); shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y); }
  const packGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 5, curveSegments: 10 }); packGeo.center();
  const pack = add(spine, packGeo, M.shell, [0, 0.36, -0.3]);
  add(pack, new THREE.BoxGeometry(0.5, 0.035, 0.26), M.orange, [0, 0.12, 0]);
  add(pack, new THREE.CylinderGeometry(0.07, 0.07, 0.42, 20), M.soft, [-0.17, -0.02, -0.08]);
  add(pack, new THREE.CylinderGeometry(0.07, 0.07, 0.42, 20), M.soft, [0.17, -0.02, -0.08]);
  add(pack, new THREE.SphereGeometry(0.025, 12, 8), M.light, [0.16, 0.22, 0.05]);
  // propulsores da mochila (soltam jatos de luz quando ele flutua)
  const spriteTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,190,110,.9)"); gr.addColorStop(1, "rgba(255,106,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const NP = 40, jetGeo = new THREE.BufferGeometry(), jetPos = new Float32Array(NP * 3), jetCol = new Float32Array(NP * 3);
  jetGeo.setAttribute("position", new THREE.BufferAttribute(jetPos, 3)); jetGeo.setAttribute("color", new THREE.BufferAttribute(jetCol, 3));
  const jets = new THREE.Points(jetGeo, new THREE.PointsMaterial({ size: 0.17, map: spriteTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  pack.add(jets);
  for (const s of [-1, 1]) add(pack, new THREE.CylinderGeometry(0.035, 0.05, 0.06, 16), M.metal, [s * 0.13, -0.33, -0.02]);
  // mangueira
  const hose = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.24, 0.45, -0.15), new THREE.Vector3(0.36, 0.3, 0.05), new THREE.Vector3(0.22, 0.18, 0.24), new THREE.Vector3(0.1, 0.22, 0.27)]), 24, 0.028, 10);
  add(spine, hose, M.soft);
  // cabeça / capacete
  const head = grp(spine, [0, 0.72, 0], "YXZ");
  const R = 0.345;
  add(head, new THREE.SphereGeometry(R, 48, 36), M.shell, [0, 0.27, 0]);
  const visorG = grp(head, [0, 0.28, 0]); visorG.scale.set(1.1, 1.0, 1.04);
  const VA = 0.82;
  add(visorG, new THREE.SphereGeometry(R + 0.006, 48, 24, 0, Math.PI * 2, 0, VA), M.visor, [0, 0, 0], [H, 0, 0]);
  add(visorG, new THREE.TorusGeometry((R + 0.006) * Math.sin(VA), 0.034, 14, 64), M.gold, [0, 0, (R + 0.006) * Math.cos(VA)]);
  add(visorG, new THREE.TorusGeometry((R + 0.006) * Math.sin(VA) + 0.045, 0.02, 10, 64), M.shell, [0, 0, (R + 0.006) * Math.cos(VA) - 0.02]);
  // bolha externa transparente (vidro) sobre a viseira dourada
  add(visorG, new THREE.SphereGeometry(R + 0.03, 40, 20, 0, Math.PI * 2, 0, VA + 0.08), M.bubble, [0, 0, 0], [H, 0, 0]);
  for (const s of [-1, 1]) {
    add(head, new THREE.CylinderGeometry(0.085, 0.085, 0.07, 28), M.soft, [s * 0.335, 0.27, 0], [0, 0, H]);
    add(head, ring(0.07, 0.014), M.orange, [s * 0.372, 0.27, 0], [0, H, 0]);
    // lanternas do capacete (EVA)
    const lamp = add(head, new THREE.BoxGeometry(0.075, 0.075, 0.13), M.shell, [s * 0.255, 0.5, 0.08], [0.15, 0, s * -0.35]);
    add(lamp, new THREE.CylinderGeometry(0.026, 0.026, 0.01, 20), M.lens, [0, 0, 0.068], [H, 0, 0]);
    add(lamp, new THREE.BoxGeometry(0.08, 0.012, 0.135), M.orange, [0, 0.03, 0]);
  }
  const beacon = add(head, new THREE.SphereGeometry(0.018, 12, 10), M.light, [0, 0.615, -0.05]);

  /* braços (s = +1: esquerdo do astronauta, lado direito da tela) */
  function finger(parent, base, side, len, r) {
    const segs = []; let p = parent;
    for (let i = 0; i < 3; i++) {
      const j = grp(p, i === 0 ? base : [0, -len, 0]);
      add(j, cap(r, len * 0.55), M.glove, [0, -len / 2, 0]);
      segs.push(j); p = j;
    }
    return segs;
  }
  function arm(s) {
    const sh = grp(spine, [s * 0.37, 0.52, 0], "ZYX");
    add(sh, new THREE.SphereGeometry(0.135, 24, 18), M.suit, [0, -0.02, 0]);
    add(sh, cap(0.1, 0.18), M.suit, [0, -0.17, 0]);
    add(sh, ring(0.104, 0.02), M.orange, [0, -0.1, 0], [H, 0, 0]);
    const el = grp(sh, [0, -0.33, 0], "YXZ");
    for (let i = 0; i < 3; i++) add(el, ring(0.1 - i * 0.004, 0.022), M.soft, [0, 0.02 - i * 0.04, 0], [H, 0, 0]);
    add(el, cap(0.095, 0.14), M.suit, [0, -0.14, 0]);
    // espelho/checklist de punho (como nos trajes da NASA)
    if (s === -1) add(el, new THREE.BoxGeometry(0.1, 0.06, 0.012), M.metal, [0, -0.2, 0.1], [0, 0, 0]);
    add(el, ring(0.104, 0.032), M.orange, [0, -0.25, 0], [H, 0, 0]);
    const wr = grp(el, [0, -0.29, 0], "YXZ");
    add(wr, new THREE.SphereGeometry(0.095, 20, 16), M.glove, [0, -0.07, 0], [0, 0, 0], [0.75, 0.95, 1.12]);
    const L = 0.048, fr = 0.024;
    const fingers = [-0.066, -0.022, 0.022, 0.066].map((z) => finger(wr, [0, -0.13, z], s, L, fr));
    const thumb = grp(wr, [s * -0.06, -0.09, 0.07], "ZYX");
    add(thumb, cap(0.026, 0.06), M.glove, [0, -0.045, 0]);
    // mastro da bandeira (só na mão esquerda)
    let flag = null;
    if (s === 1) {
      const pole = grp(wr, [0, 0, 0]);
      add(pole, new THREE.CylinderGeometry(0.019, 0.019, 1.08, 14), M.pole, [0, 0.36, 0]);
      add(pole, new THREE.SphereGeometry(0.04, 16, 12), M.gold, [0, 0.92, 0]);
      const fg = new THREE.PlaneGeometry(0.62, 0.42, 24, 12); fg.translate(0.31, 0, 0);
      const base = fg.attributes.position.array.slice();
      const textures = {}; for (const k in FLAG_DRAW) textures[k] = canvasTex(256, 172, FLAG_DRAW[k]);
      const fm = new THREE.MeshPhysicalMaterial({ map: textures.br, side: THREE.DoubleSide, roughness: 0.75, sheen: 0.6, sheenColor: 0xffffff });
      const swivel = grp(pole, [0, 0.68, 0]); const cloth = add(swivel, fg, fm, [0.02, 0, 0]);
      flag = { pole, swivel, cloth, geo: fg, base, textures, mat: fm };
    }
    return { s, sh, el, wr, fingers, thumb, flag };
  }
  const armL = arm(1), armR = arm(-1);

  /* pernas */
  function leg(s) {
    const hp = grp(hips, [s * 0.15, -0.04, 0], "XZY");
    add(hp, cap(0.13, 0.16), M.suit, [0, -0.18, 0]);
    add(hp, ring(0.132, 0.012), M.soft, [0, -0.08, 0], [H, 0, 0]);
    const kn = grp(hp, [0, -0.37, 0], "XYZ");
    for (let i = 0; i < 3; i++) add(kn, ring(0.122 - i * 0.004, 0.024), M.soft, [0, 0.03 - i * 0.045, 0], [H, 0, 0]);
    add(kn, cap(0.12, 0.14), M.suit, [0, -0.16, 0]);
    add(kn, ring(0.124, 0.03), M.orange, [0, -0.28, 0], [H, 0, 0]);
    const an = grp(kn, [0, -0.35, 0], "XYZ");
    add(an, new THREE.SphereGeometry(0.15, 24, 18), M.shell, [0, -0.04, 0.05], [0, 0, 0], [1, 0.72, 1.5]);
    add(an, new THREE.CylinderGeometry(0.15, 0.155, 0.045, 28), M.dark, [0, -0.12, 0.05], [0, 0, 0], [1, 1, 1.5]);
    for (let i = 0; i < 3; i++) add(an, new THREE.BoxGeometry(0.16, 0.012, 0.02), M.orange, [0, 0.0 - i * 0.03, 0.17 + i * 0.012], [0.5, 0, 0]);
    return { hp, kn, an };
  }
  const legL = leg(1), legR = leg(-1);

  // sombra de contato e anel holográfico (quando em pé)
  const shadowTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const holo = grp(scene, [0, 0.006, 0.02]);
  const holoMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const holoRings = [0, 1, 2].map((i) => add(holo, new THREE.RingGeometry(0.42 + i * 0.001, 0.445, 72), holoMat.clone(), [0, 0, 0], [-H, 0, 0]));
  const holoTicks = add(holo, new THREE.RingGeometry(0.5, 0.56, 48, 1, 0, Math.PI * 2), new THREE.MeshBasicMaterial({ color: 0xffa23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, wireframe: true }), [0, 0, 0], [-H, 0, 0]);
  const shadow = add(scene, new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }), [0, 0.002, 0.02], [-H, 0, 0]);

  /* ---------- mão: curvar dedos e encaixar o mastro no punho ---------- */
  function setHand(a, curl, spread = 0) {
    const ang = -a.s * curl;
    a.fingers.forEach((f, i) => { f[0].rotation.z = ang * 0.9; f[1].rotation.z = ang * 1.05; f[2].rotation.z = ang; f[0].rotation.x = (i - 1.5) * spread; });
    const g = Math.min(1, Math.max(0, (curl - 0.3) / 0.9));
    const TT = [-1.2, 0.6, -1.6]; // polegar fechando por cima do indicador
    a.thumb.rotation.set(-0.4 + (TT[0] + 0.4) * g, TT[1] * g * a.s, a.s * (0.9 + (TT[2] - 0.9) * g));
  }
  // centro da pegada para a curvatura usada no punho fechado (circuncentro da cadeia do dedo)
  function gripCenter(s, curl) {
    const L = 0.048, a = -s * curl; let x = 0, y = -0.13, th = 0; const pts = [[x, y]];
    const ks = [0.9, 1.05, 1];
    for (let i = 0; i < 3; i++) { th += a * ks[i]; x += Math.sin(th) * L; y -= Math.cos(th) * L; pts.push([x, y]); }
    const [A, B, C] = [pts[0], pts[2], pts[3]];
    const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
    const ux = ((A[0] ** 2 + A[1] ** 2) * (B[1] - C[1]) + (B[0] ** 2 + B[1] ** 2) * (C[1] - A[1]) + (C[0] ** 2 + C[1] ** 2) * (A[1] - B[1])) / d;
    const uy = ((A[0] ** 2 + A[1] ** 2) * (C[0] - B[0]) + (B[0] ** 2 + B[1] ** 2) * (A[0] - C[0]) + (C[0] ** 2 + C[1] ** 2) * (B[0] - A[0])) / d;
    return [ux, uy];
  }
  const GRIP = 1.25, gc = gripCenter(1, GRIP);
  if (armL.flag) { armL.flag.pole.position.set(gc[0], gc[1], 0); armL.flag.pole.rotation.set(H, 0, 0); }

  const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), vx = new THREE.Vector3(), vy = new THREE.Vector3(), vz = new THREE.Vector3();
  /* punho: mantém o mastro em pé (como uma pessoa segurando a bandeira), com a mão alinhada ao antebraço */
  function alignPole(a, tx, tz) {
    a.wr.rotation.set(0, 0, 0);
    root.updateMatrixWorld(true);
    a.el.getWorldQuaternion(_q);
    vy.set(0, 1, 0).applyQuaternion(_q);
    vz.set(tx, 1, tz).normalize();
    vy.addScaledVector(vz, -vy.dot(vz));
    if (vy.lengthSq() < 1e-4) return;
    vy.normalize(); vx.crossVectors(vy, vz).normalize();
    _m.makeBasis(vx, vy, vz); _q2.setFromRotationMatrix(_m);
    a.wr.quaternion.copy(_q.invert().multiply(_q2));
  }
  let flagId = "br";
  function setFlag(id) { if (armL.flag && armL.flag.textures[id]) { flagId = id; armL.flag.mat.map = armL.flag.textures[id]; armL.flag.mat.needsUpdate = true; } }

  /* ---------- poses ---------- */
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (k) => k * k * (3 - 2 * k);

  /* st: { t, stand, walk, phase, wave, flagUp, spin, yaw, look, lean, hop } */
  function pose(st) {
    const t = st.t || 0, S = sm(Math.min(1, Math.max(0, st.stand || 0))), F = 1 - S, W = (st.walk || 0) * S;
    const ph = st.phase || 0, wv = sm(st.wave || 0), U = sm(st.flagUp == null ? 1 : st.flagUp);
    const fl = Math.sin(t * 1.65), fl2 = Math.sin(t * 1.65 + 0.8);

    // corpo
    hips.position.y = 0.9 + F * (0.32 + 0.05 * fl) - W * 0.045 * Math.abs(Math.sin(ph)) + (st.hop || 0);
    body.rotation.y = (st.yaw || 0) + (st.spin || 0) * Math.PI * 2 + F * 0.32 + S * 0.18;
    body.rotation.x = F * (0.12 + 0.04 * fl2) + W * 0.06;
    body.rotation.z = F * (-0.1 + 0.05 * Math.sin(t * 1.2)) + (st.lean || 0);
    spine.rotation.set(F * 0.05 + W * 0.04, W * 0.14 * Math.sin(ph), F * 0.04 * fl);
    head.rotation.set(F * -0.08 + 0.04 * Math.sin(t * 0.9) - W * 0.05, (st.look || 0) + 0.06 * Math.sin(t * 0.7), F * 0.06 - (st.lean || 0) * 0.5);

    // pernas
    const legPose = (lg, side, p) => {
      const fx = side > 0 ? -0.55 + 0.06 * fl : 0.22 - 0.05 * fl, fk = side > 0 ? 1.0 + 0.08 * fl2 : 0.55;
      const wx = -0.48 * Math.sin(p), wk = 0.12 + 0.95 * Math.max(0, Math.cos(p)) ** 1.5, wa = 0.25 * Math.sin(p) - 0.15 * Math.max(0, Math.cos(p));
      const sx = lerp(0, wx, W / Math.max(S, 1e-3) || 0), sk = lerp(0.04, wk, W / Math.max(S, 1e-3) || 0), sa = lerp(-0.04, wa, W / Math.max(S, 1e-3) || 0);
      lg.hp.rotation.set(lerp(fx, sx, S), 0, side * lerp(0.1, 0.04, S));
      lg.kn.rotation.set(lerp(fk, sk, S), 0, 0);
      lg.an.rotation.set(lerp(0.35, sa, S), 0, 0);
    };
    legPose(legL, 1, ph); legPose(legR, -1, ph + Math.PI);

    // braço direito (aceno)
    {
      const a = armR, s = -1, ww = Math.sin(t * Math.PI * 2 / 0.84);
      const restZ = s * lerp(0.42, 0.18, S), restX = W * 0.5 * Math.sin(ph + Math.PI);
      a.sh.rotation.set(lerp(restX, -0.15, wv), lerp(0, s * -0.1, wv), lerp(restZ, s * 1.25, wv));
      a.el.rotation.set(lerp(-0.45 - W * 0.2, -(1.35 + 0.38 * ww), wv), lerp(0, s * H, wv), 0);
      a.wr.rotation.set(lerp(0, -0.15, wv), lerp(0, s * -0.3, wv), lerp(0, s * 0.1, wv));
      setHand(a, lerp(0.75, 0.12, wv), lerp(0, 0.1, wv));
    }
    // braço esquerdo (bandeira: erguida flutuando / segura ao lado em pé)
    {
      const a = armL, s = 1;
      const bob = 0.05 * fl;
      // erguida
      const ux = -0.3, uy = 0, uz = s * (1.08 + bob), ex = -1.45, ey = s * H, wx = 0, wy = 0, wz = 0;
      // baixa (antebraço à frente, mastro em pé)
      const dx = W * 0.35 * Math.sin(ph), dy = 0, dz = s * 0.22, lex = -1.45, ley = 0;
      a.sh.rotation.set(lerp(dx, ux, U), lerp(dy, uy, U), lerp(dz, uz, U));
      a.el.rotation.set(lerp(lex, ex, U), lerp(ley, ey, U), 0);
      a.wr.rotation.set(lerp(0.02, wx, U), lerp(0, wy, U), lerp(0, wz, U));
      setHand(a, GRIP, 0);
      alignPole(a, s * (0.12 + 0.05 * U) + 0.04 * Math.sin(t * 1.3), -0.05 + W * 0.1 * Math.sin(ph));
      // a bandeira gira no mastro e sempre se abre para fora, voltada para a câmera
      if (a.flag) {
        a.flag.pole.updateMatrixWorld(true); a.flag.pole.getWorldQuaternion(_q);
        vx.set(0.95, 0, -0.3 + 0.12 * Math.sin(t * 0.8)).applyQuaternion(_q.invert());
        a.flag.swivel.rotation.y = Math.atan2(-vx.z, vx.x);
      }
    }
    // tecido da bandeira
    if (armL.flag) {
      const f = armL.flag, p = f.geo.attributes.position, b = f.base;
      for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], k = x / 0.62; p.array[i * 3 + 2] = Math.sin(x * 9 - t * 6.5 + y * 2) * 0.05 * k + Math.sin(x * 4 - t * 3.1) * 0.03 * k; p.array[i * 3 + 1] = y - k * k * 0.04 * (1 + 0.3 * Math.sin(t * 2)); }
      p.needsUpdate = true; f.geo.computeVertexNormals();
    }
    // anel holográfico de pouso
    holoRings.forEach((r, i) => { const k = ((t * 0.6 + i / 3) % 1); r.scale.setScalar(0.7 + k * 0.9); r.material.opacity = S * 0.55 * (1 - k); });
    holoTicks.material.opacity = S * 0.25; holoTicks.rotation.z = t * 0.4;
    // jatos dos propulsores
    {
      const on = F * (0.55 + 0.45 * Math.max(0, Math.sin(t * 2.3))) + (st.hop ? 0.5 : 0);
      for (let i = 0; i < NP; i++) {
        const side = i % 2 ? 1 : -1, age = (t * 2.2 + i / NP * 1.7) % 1, j = Math.sin(i * 12.9898) * 0.5;
        jetPos[i * 3] = side * 0.13 + j * 0.04 * age; jetPos[i * 3 + 1] = -0.37 - age * 0.55; jetPos[i * 3 + 2] = -0.04 - age * 0.12 + Math.cos(i * 7.1) * 0.03 * age;
        const c = on * (1 - age) * (1 - age); jetCol[i * 3] = c; jetCol[i * 3 + 1] = c * 0.72; jetCol[i * 3 + 2] = c * 0.42;
      }
      jetGeo.attributes.position.needsUpdate = true; jetGeo.attributes.color.needsUpdate = true;
    }
    shadow.material.opacity = S * 0.9; shadow.scale.setScalar(1 - 0.15 * W * Math.abs(Math.sin(ph)));
    beacon.material.color.setHSL(0.07, 1, 0.55 + 0.25 * Math.max(0, Math.sin(t * 3)));
  }

  let w = 0, h = 0;
  function frame(cw, ch, dpr = 1, target = [0, 1.25, 0], dist = 6.4) {
    if (cw !== w || ch !== h) { w = cw; h = ch; renderer.setPixelRatio(dpr); renderer.setSize(cw, ch, false); camera.aspect = cw / ch; camera.updateProjectionMatrix(); }
    camera.position.set(target[0], target[1] + 0.25, target[2] + dist); camera.lookAt(target[0], target[1], target[2]);
  }
  function render() { renderer.render(scene, camera); }
  return { pose, render, frame, setFlag, renderer, scene, camera, get flag() { return flagId; } };
}

/* ===================== SITE ===================== */
function siteMascot() {
  if (window.__astroMx) return; window.__astroMx = true;
  const EQUIPE = /^\/equipe-maximus/.test(location.pathname);
  const BEMVINDO = EQUIPE ? ["Seja bem-vindo! 👋", "Eu sou o astronauta Wyguivan Reyller 🚀", "Venha decolar com a Equipe Maximus! 💪"]
    : ["Seja bem-vindo! 👋", "Eu sou o astronauta Wyguivan Reyller 🚀", "Estou aqui para te ajudar a encontrar seu imóvel! 🏡"];
  const PAISES = [{ id: "br", ola: "Olá, Brasil! 🇧🇷" }, { id: "us", ola: "Hello, USA! 🇺🇸" }, { id: "pt", ola: "Olá, Portugal! 🇵🇹" }, { id: "py", ola: "¡Hola, Paraguay! 🇵🇾" }, { id: "ae", ola: "⁧مرحباً دبي!⁩ 🇦🇪 Olá, Dubai!" }];
  const FRASES = EQUIPE ? ["Já pensou em crescer de verdade?", "Treinamento toda semana! 📚", "O pódio é o nosso lugar de morada! 🏆", "Agende um café comigo! ☕"]
    : ["Já pensou?", "Já pensou... no imóvel dos seus sonhos?", "Que oportunidade é essa?!", "Não perca essa oportunidade!", "Fale comigo no WhatsApp! 🚀"];
  const SECOES = { lancamentos: "Lançamentos imperdíveis! ✨", loteamentos: "Já pensou no seu lote? 🏡", condominios: "Condomínios fechados! 🔒", "alto-padrao": "Alto padrão... já pensou? 💎", finder: "Busque seu imóvel aqui 🔎", equipe: "Conheça a Equipe Maximus! 💪", contato: "Fale comigo! 👋", galeria: "Olha que lindo! 😍", video: "Dá o play! 🎬", unidades: "Escolha a sua unidade! 📐", tipologias: "Escolha a sua planta! 📐", apartamento: "Pensado para você! 🛋️", lazer: "Lazer completo! 🏊", localizacao: "Localização top! 📍", local: "Localização top! 📍", quero: "Garanta o seu agora! 🚀", porque: "Aqui o resultado é treinado! 💪", conquistas: "A próxima conquista é sua! 🏆", oferece: "Tudo para você vender mais! 🚀", agendar: "Bora tomar um café? ☕" };
  const POUSO = EQUIPE ? ["Pousei! Bora decolar juntos? 🚀", "Em pé e pronto pra te receber! 💪"] : ["Pousei aqui pra te ajudar! 👨‍🚀", "Bora achar o seu imóvel? 🏡", "Em pé e pronto pra te atender! 🚀"];

  const css = `
  .astro3d{position:fixed;z-index:45;width:250px;height:250px;opacity:0;transition:opacity .7s;pointer-events:none;will-change:transform}
  .astro3d.on{opacity:1}
  .astro3d canvas{position:absolute;inset:0;width:100%;height:100%;display:block;filter:drop-shadow(0 14px 20px rgba(0,0,0,.45)) drop-shadow(0 0 26px rgba(255,106,0,.18))}
  .astro3d .a-hit{position:absolute;left:22%;top:6%;width:50%;height:88%;pointer-events:auto;cursor:pointer;border-radius:40%;-webkit-tap-highlight-color:transparent}
  .astro3d-bub{position:fixed;z-index:46;max-width:240px;padding:10px 14px;border-radius:18px 18px 4px 18px;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);color:#140700;font:800 14.5px/1.3 Manrope,system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.5),0 0 0 2px #ff6a00,0 0 24px rgba(255,106,0,.35);opacity:0;transform:translateY(10px) scale(.8);transform-origin:100% 100%;transition:opacity .3s,transform .45s cubic-bezier(.3,1.6,.5,1);pointer-events:none;text-align:left}
  .astro3d-bub.on{opacity:1;transform:none}
  .astro3d-bub::after{content:"";position:absolute;right:18px;bottom:-7px;width:12px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:2px 2px 0 0 #ff6a00}
  @media (max-width:760px){.astro3d{width:205px;height:205px}.astro3d-bub{max-width:205px;font-size:13.5px}}
  @media print{.astro3d,.astro3d-bub{display:none}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const box = document.createElement("div"); box.className = "astro3d";
  const cv = document.createElement("canvas"); box.appendChild(cv);
  const hit = document.createElement("a"); hit.className = "a-hit"; hit.href = "#"; hit.setAttribute("role", "button"); hit.setAttribute("aria-label", "Falar com Wyguivan Reyller no WhatsApp"); box.appendChild(hit);
  const bub = document.createElement("div"); bub.className = "astro3d-bub"; bub.setAttribute("aria-live", "polite");
  document.body.appendChild(box); document.body.appendChild(bub);

  const A = createAstronaut(cv, { fov: 26 });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const visivel = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" ? r : null; };
  function alvo() {
    const lista = [document.getElementById("waFab"), ...document.querySelectorAll(".fab, .bar")];
    for (const el of lista) { const r = visivel(el); if (r) return { el, r }; }
    for (const a of document.querySelectorAll("a[href*='wa.me'], a[data-wa], a[href*='whatsapp']")) {
      let p = a, fixo = false;
      for (let k = 0; p && k < 4; k++, p = p.parentElement) if (getComputedStyle(p).position === "fixed") { fixo = true; break; }
      const r = fixo && visivel(a); if (r) return { el: a, r };
    }
    return null;
  }
  let atual = null, baseRight = 20, baseBottom = 100;
  function place() {
    const t = alvo(); atual = t && t.el;
    if (!t) { box.style.display = bub.style.display = "none"; return; }
    box.style.display = bub.style.display = "";
    const r = t.r, w = box.offsetWidth || 250, h = box.offsetHeight || 250;
    const larga = r.width > innerWidth * 0.6;
    const cx = larga ? r.right - w * 0.5 - 8 : r.right - Math.min(r.width, 80) / 2;
    baseRight = Math.max(14, innerWidth - cx - w * 0.5);
    baseBottom = innerHeight - r.top - 10;
    box.style.right = baseRight + "px"; box.style.bottom = baseBottom + "px";
    bub.style.right = Math.max(8, baseRight + w * 0.38) + "px"; bub.style.bottom = baseBottom + h * 0.97 + "px";
  }
  place(); addEventListener("resize", place); addEventListener("scroll", place, { passive: true }); setInterval(place, 1200);

  /* estado animado (alvo + suavização) */
  const S = { stand: 0, walk: 0, wave: 1, flagUp: 1, spin: 0, yaw: 0, look: 0, lean: 0, phase: 0, x: 0 };
  const T = { stand: 0, walk: 0, wave: 1, flagUp: 1, yaw: 0, look: 0, lean: 0, x: 0 };
  let spinT = -1, walkDir = 1, hop = 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  hit.addEventListener("click", (e) => {
    e.preventDefault(); spin(); say("Bora conversar! 🚀", 2200);
    const el = atual && (atual.matches("a") ? atual : atual.querySelector("a"));
    if (el) el.click(); else window.open("https://wa.me/5562999832718", "_blank", "noopener");
  });

  let bubTimer = 0, busyUntil = 0, waveTimer = 0;
  function say(txt, ms = 2600) { clearTimeout(bubTimer); bub.textContent = txt; bub.classList.add("on"); bubTimer = setTimeout(() => bub.classList.remove("on"), ms); return sleep(ms + 350); }
  function wave(ms = 3000) { T.wave = 1; clearTimeout(waveTimer); waveTimer = setTimeout(() => { T.wave = 0; }, ms); }
  function spin() { spinT = 0; }

  let pz = 0;
  async function pousar(ms = 7000) {
    T.wave = 0; T.flagUp = 0; T.stand = 1; await sleep(1300);
    wave(2600); await say(POUSO[pz++ % POUSO.length], 2600);
    // caminha para um lado e volta
    T.walk = 1; walkDir = Math.random() < 0.5 ? -1 : 1;
    T.yaw = -walkDir * 1.15; T.x = walkDir * Math.min(70, innerWidth * 0.12); await sleep(1900);
    T.yaw = walkDir * 1.15; T.x = 0; await sleep(1900);
    T.walk = 0; T.yaw = 0; await sleep(Math.max(500, ms - 7300));
    T.stand = 0; T.flagUp = 1; await sleep(1000);
  }
  async function trocar(id) { A.setFlag(id); }

  let lastEvt = {};
  function react(key, txt, o = {}) {
    if (!txt) return; const now = Date.now();
    if (lastEvt[key] && now - lastEvt[key] < (o.every || 20000)) return;
    if (!o.force && now < busyUntil - 4000) return;
    lastEvt[key] = now; busyUntil = now + 6500;
    if (o.spin) spin(); else wave(2800);
    say(txt, o.ms || 2800);
  }

  async function loop() {
    await sleep(900);
    const jaViu = (() => { try { return sessionStorage.getItem("astroOla") === "1"; } catch (e) { return false; } })();
    busyUntil = Date.now() + 12000; wave(8500);
    if (!jaViu) { for (const f of BEMVINDO) await say(f, 2700); try { sessionStorage.setItem("astroOla", "1"); } catch (e) {} }
    else await say(BEMVINDO[0], 2400);
    let i = 0, f = 0;
    for (;;) {
      await sleep(2400);
      while (document.hidden || Date.now() < busyUntil) await sleep(700);
      const p = PAISES[i % PAISES.length];
      await trocar(p.id); hop = 0.08; await say(p.ola, 2300);
      if (Date.now() < busyUntil) continue;
      spin(); await say(FRASES[f % FRASES.length], 2700);
      if (f % 2 === 0) { await sleep(800); await pousar(); }
      else { wave(3000); await say("Seja bem-vindo! 👋", 2200); }
      i++; f++;
    }
  }

  /* reage ao cliente */
  addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; const r = box.getBoundingClientRect(); const mx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / innerWidth * 2)); T.look = mx * 0.5; }, { passive: true });
  let lastY = scrollY, scrollEnd = 0;
  addEventListener("scroll", () => {
    const d = scrollY - lastY; lastY = scrollY; T.lean = Math.max(-0.25, Math.min(0.25, -d / 160));
    clearTimeout(scrollEnd); scrollEnd = setTimeout(() => { T.lean = 0; }, 220);
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 160) react("fim", "Chegou até aqui? Não perca essa oportunidade! 🚀", { every: 60000, spin: true });
  }, { passive: true });
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting && en.intersectionRatio > 0.3) react("sec-" + en.target.id, SECOES[en.target.id], { every: 90000 }); }), { threshold: [0.3] });
    Object.keys(SECOES).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
  document.addEventListener("pointerover", (e) => { if (e.pointerType === "mouse" && e.target.closest && e.target.closest(".card, .l-card, [data-slug], .gi, .sp, .un-tab, .tp")) react("hover-card", "Gostou desse? Fale comigo! 😍", { every: 25000 }); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest ? e.target : null; if (!t || t.closest(".astro3d")) return;
    if (t.closest(".card, .gi, .sp, .un-tab")) react("click-card", "Ótima escolha! ✨", { every: 8000, force: true, spin: true });
    else if (t.closest("#filters, #finder, .search, .filters")) react("busca", "Boa! Vou te ajudar a achar 🔎", { every: 30000, force: true });
    else if (t.closest("[data-wa], a[href*='wa.me'], #fSend, #eSend")) react("wa", "Te espero no WhatsApp! 📲", { every: 15000, force: true, spin: true });
  });
  document.addEventListener("change", (e) => { if (e.target.closest && e.target.closest("#finder, .f-grid, .form, form")) react("filtro", "Isso! Tô te ajudando 👌", { every: 30000, force: true }); });
  hit.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") react("hover-astro", "Oi! Eu sou o Wyguivan 🚀 Clica em mim!", { every: 12000, force: true }); });
  let idle = 0; const resetIdle = () => { clearTimeout(idle); idle = setTimeout(() => react("idle", "Ainda por aí? Já pensou? 🤔", { every: 45000, force: true }), 25000); };
  ["pointermove", "scroll", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, resetIdle, { passive: true })); resetIdle();
  let saiu = false;
  document.addEventListener("visibilitychange", () => { if (document.hidden) saiu = true; else if (saiu) { saiu = false; setTimeout(() => react("voltou", "Que bom que voltou! 👋", { every: 30000, force: true }), 600); } });
  document.addEventListener("mouseout", (e) => { if (!e.relatedTarget && e.clientY <= 0) react("saindo", "Espera! Não perca essa oportunidade! 🚀", { every: 60000, force: true, spin: true }); });

  /* render (pausa quando a aba está oculta ou o mascote fora da tela) */
  let last = performance.now(), t0 = last, visible = true;
  if (window.IntersectionObserver) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(box);
  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || !visible || box.style.display === "none") { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    const ease = (k, rate) => { S[k] += (T[k] - S[k]) * (1 - Math.exp(-dt * rate)); };
    ease("stand", 3.2); ease("walk", 5); ease("wave", 6); ease("flagUp", 4); ease("yaw", 6); ease("look", 4); ease("lean", 6);
    S.x += (T.x - S.x) * (1 - Math.exp(-dt * 1.6));
    S.phase += dt * 5.6 * S.walk;
    let sp = 0; if (spinT >= 0) { spinT += dt / 1.3; const k = Math.min(1, spinT); sp = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; if (spinT >= 1) { spinT = -1; sp = 0; } }
    hop *= Math.exp(-dt * 3);
    const w = box.clientWidth, h = box.clientHeight;
    A.frame(w, h, Math.min(2, devicePixelRatio || 1), [0.3, 1.42, 0], 7.4);
    A.pose({ t: reduce ? 0 : t, stand: S.stand, walk: S.walk, phase: S.phase, wave: S.wave, flagUp: S.flagUp, spin: sp, yaw: S.yaw, look: S.look, lean: S.lean, hop: Math.sin(hop * 20) * hop });
    A.render();
    box.style.transform = `translateX(${(-S.x).toFixed(1)}px)`;
  }
  requestAnimationFrame((n) => { last = n; t0 = n; tick(n); requestAnimationFrame(() => box.classList.add("on")); });
  if (!reduce) loop(); else say(BEMVINDO[0], 3000);
}

if (typeof window !== "undefined" && !window.__ASTRO3D_MANUAL) {
  const go = () => { try { siteMascot(); } catch (e) { document.querySelectorAll(".astro3d,.astro3d-bub").forEach((el) => el.remove()); window.__astro3dFail && window.__astro3dFail(e); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
}
