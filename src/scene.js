/*
 * Scene 3D: PC prosedural (tanpa model/tekstur eksternal).
 * Dibundel bersama three.js (hanya modul yang dipakai) menjadi assets/scene.min.js
 * lewat `tools/` (lihat README). app.js memuat file ini secara lazy.
 *
 * Scene ini TIDAK punya loop sendiri. app.js memanggil render() hanya bila ada
 * perubahan (scroll, pointer, ketikan), jadi saat diam GPU ikut diam.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Vector3, HemisphereLight, DirectionalLight,
  Group, Mesh, Shape, ExtrudeGeometry, MeshStandardMaterial, MeshBasicMaterial,
  PlaneGeometry, BoxGeometry, InstancedMesh, Matrix4, Color, SphereGeometry,
  Sprite, SpriteMaterial, AdditiveBlending, CanvasTexture, SRGBColorSpace,
  ACESFilmicToneMapping, Points, PointsMaterial, BufferGeometry, BufferAttribute,
  Fog, LinearFilter,
} from "three";

/* Posisi layar di dalam grup PC (dipakai app.js untuk menghitung zoom "cover"). */
export const SCREEN = { y: 0.35, z: 0.064, w: 3.26, h: 2.04 };
export const FOV = 35;

function rrShape(w, h, r) {
  const s = new Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slabGeo(w, h, d, r, b) {
  const g = new ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, Math.max(0.002, r - b)), {
    depth: Math.max(0.002, d - 2 * b),
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 2,
    curveSegments: 6,
  });
  g.translate(0, 0, -(d - 2 * b) / 2);
  return g;
}
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,.35)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export function createScene(canvas, { colors: COL, bio, brand, sub, outro, worksTitle, mobile }) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: !mobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  let dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  scene.fog = new Fog(COL.bg, 16, 40);
  const camera = new PerspectiveCamera(FOV, 1, 0.05, 80);
  const look = new Vector3();

  scene.add(new HemisphereLight(0xffffff, COL.bg2, 1.25));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new DirectionalLight(COL.accent, 2.6);
  rim.position.set(-6, 2, -5);
  scene.add(rim);

  /* ---------- PC ---------- */
  const group = new Group();
  scene.add(group);
  const body = new MeshStandardMaterial({ color: COL.obj, roughness: 0.35, metalness: 0.55 });
  const dark = new MeshBasicMaterial({ color: 0x05070c });
  const glowTex = glowTexture();

  const mon = new Group();
  mon.position.y = SCREEN.y;
  group.add(mon);
  mon.add(new Mesh(slabGeo(3.5, 2.24, 0.12, 0.08, 0.03), body));
  const back = new Mesh(slabGeo(2.4, 1.4, 0.22, 0.2, 0.06), body);
  back.position.z = -0.14;
  mon.add(back);
  const bezel = new Mesh(new PlaneGeometry(3.4, 2.14), dark);
  bezel.position.z = 0.061;
  mon.add(bezel);

  /* Layar = canvas 2D sebagai tekstur. Tanpa mipmap: unggah ulang lebih murah. */
  const sc = document.createElement("canvas");
  sc.width = 1024;
  sc.height = 640;
  const sg = sc.getContext("2d");
  const stex = new CanvasTexture(sc);
  stex.colorSpace = SRGBColorSpace;
  stex.generateMipmaps = false;
  stex.minFilter = LinearFilter;
  const scr = new Mesh(new PlaneGeometry(SCREEN.w, SCREEN.h), new MeshBasicMaterial({ map: stex, toneMapped: false }));
  scr.position.z = SCREEN.z;
  mon.add(scr);
  const led = new Mesh(new BoxGeometry(0.34, 0.018, 0.02), new MeshBasicMaterial({ color: COL.accent }));
  led.position.set(0, -1.09, 0.06);
  mon.add(led);

  const neck = new Mesh(slabGeo(0.36, 1.25, 0.12, 0.06, 0.02), body);
  neck.position.set(0, -0.92, -0.3);
  neck.rotation.x = -0.12;
  group.add(neck);
  const base = new Mesh(slabGeo(1.5, 0.95, 0.06, 0.32, 0.02), body);
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, -1.56, -0.25);
  group.add(base);

  const kb = new Group();
  kb.position.set(-0.2, -1.56, 1.15);
  group.add(kb);
  const kbBase = new Mesh(slabGeo(2.75, 0.92, 0.07, 0.08, 0.02), body);
  kbBase.rotation.x = -Math.PI / 2;
  kb.add(kbBase);
  const COLS = 14, ROWS = 4, N = COLS * ROWS;
  const keys = new InstancedMesh(
    new BoxGeometry(0.15, 0.05, 0.15),
    new MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }),
    N,
  );
  const m4 = new Matrix4(), cold = new Color(COL.obj2), hot = new Color(COL.accent), tmp = new Color();
  const heat = new Float32Array(N);
  for (let r = 0, i = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++, i++) {
      m4.makeTranslation(-1.17 + c * 0.18, 0.06, -0.28 + r * 0.187);
      keys.setMatrixAt(i, m4);
      keys.setColorAt(i, cold);
    }
  kb.add(keys);
  const mouse = new Mesh(new SphereGeometry(0.2, 16, 10), body);
  mouse.scale.set(0.75, 0.35, 1.1);
  mouse.position.set(1.65, -1.52, 1.2);
  group.add(mouse);

  const glow = new Sprite(new SpriteMaterial({
    map: glowTex, color: COL.accent, transparent: true, opacity: 0.2,
    depthWrite: false, blending: AdditiveBlending,
  }));
  glow.scale.setScalar(7.5);
  glow.position.set(0, 0.4, -0.8);
  group.add(glow);

  const shadow = new Mesh(
    new PlaneGeometry(6, 6),
    new MeshBasicMaterial({ map: glowTex, color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  const DUST = mobile ? 140 : 260, dp = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 26;
    dp[i * 3 + 1] = (Math.random() - 0.5) * 14;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
  }
  const dg = new BufferGeometry();
  dg.setAttribute("position", new BufferAttribute(dp, 3));
  const dust = new Points(dg, new PointsMaterial({
    color: COL.accent, size: 0.05, map: glowTex, transparent: true, opacity: 0.7,
    depthWrite: false, blending: AdditiveBlending,
  }));
  scene.add(dust);

  /* ---------- Isi layar ---------- */
  const TK = {
    bg: "#0b1020", kw: "#c792ea", var: "#eef1ff", key: COL.accent, str: "#c3e88d",
    num: "#f78c6c", pun: "#8f9bb3", com: "#6f789b", ln: "#3c4566", ink: "#eef1ff",
  };
  const LINES = bio.lines;
  const TOTAL = bio.total;

  function wrap(text, maxW) {
    const words = String(text).split(/\s+/), out = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (sg.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    return out;
  }
  function osBar(W, title) {
    const head = 44;
    sg.fillStyle = "rgba(255,255,255,.05)";
    sg.fillRect(0, 0, W, head);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      sg.fillStyle = c;
      sg.beginPath();
      sg.arc(26 + i * 20, head / 2, 6, 0, 7);
      sg.fill();
    });
    sg.fillStyle = TK.pun;
    sg.font = "500 17px ui-monospace, Menlo, Consolas, monospace";
    sg.textBaseline = "middle";
    sg.fillText(title, 100, head / 2);
    return head;
  }
  function drawScreen(mode, typed, blink, narrow) {
    const W = sc.width, H = sc.height;
    sg.fillStyle = TK.bg;
    sg.fillRect(0, 0, W, H);
    sg.textAlign = "left";
    if (mode === "code") {
      const head = osBar(W, bio.file);
      const fs = Math.floor(Math.min((H - head) / ((LINES.length + 1) * 1.55), W / 40));
      sg.font = "500 " + fs + "px ui-monospace, Menlo, Consolas, monospace";
      sg.textBaseline = "alphabetic";
      const cw = sg.measureText("M").width, lh = fs * 1.55, x0 = fs * 3.2, maxX = W - fs * 0.8;
      let left = typed, y = head + lh * 1.1, x = x0;
      for (let i = 0; i < LINES.length && left > 0; i++) {
        sg.fillStyle = TK.ln;
        sg.textAlign = "right";
        sg.fillText(String(i + 1), fs * 2.2, y);
        sg.textAlign = "left";
        x = x0;
        for (const tk of LINES[i]) {
          if (left <= 0) break;
          let txt = tk[1].slice(0, Math.max(0, left));
          left -= tk[1].length;
          sg.fillStyle = TK[tk[0]] || TK.var;
          while (txt.length) {
            if (maxX - x < cw) { y += lh; x = x0 + cw * 2; }
            const part = txt.slice(0, Math.max(1, Math.floor((maxX - x) / cw)));
            sg.fillText(part, x, y);
            x += cw * part.length;
            txt = txt.slice(part.length);
          }
        }
        left -= 1;
        if (left <= 0 && typed < TOTAL && blink) {
          sg.fillStyle = COL.accent;
          sg.fillRect(x + 2, y - fs * 0.8, fs * 0.55, fs * 1.05);
        }
        y += lh;
      }
    } else if (mode === "works") {
      /* Layar "menyala": pola grid + kursor di tengah. Sengaja tanpa judul supaya
         saat crossfade ke layar DOM tidak terlihat teks ganda. */
      osBar(W, "~/usam/works");
      const g2 = sg.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
      g2.addColorStop(0, "rgba(124,240,197,.20)");
      g2.addColorStop(1, "rgba(108,140,255,0)");
      sg.fillStyle = g2;
      sg.fillRect(0, 44, W, H - 44);
      sg.strokeStyle = "rgba(124,240,197,.08)";
      sg.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { sg.beginPath(); sg.moveTo(x + 0.5, 44); sg.lineTo(x + 0.5, H); sg.stroke(); }
      for (let y = 44; y < H; y += 40) { sg.beginPath(); sg.moveTo(0, y + 0.5); sg.lineTo(W, y + 0.5); sg.stroke(); }
      sg.textAlign = "center";
      sg.textBaseline = "middle";
      sg.fillStyle = COL.accent;
      sg.font = "500 30px ui-monospace, Menlo, Consolas, monospace";
      sg.fillText("> open ./works" + (blink ? " \u2588" : "  "), W / 2, H / 2);
      sg.textAlign = "left";
    } else {
      const grad = sg.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, COL.accent);
      grad.addColorStop(1, COL.accent2);
      sg.globalAlpha = 0.28;
      sg.fillStyle = grad;
      sg.fillRect(0, 0, W, H);
      sg.globalAlpha = 1;
      const main = mode === "logo" ? brand : outro;
      sg.textAlign = "center";
      sg.textBaseline = "middle";
      sg.fillStyle = TK.ink;
      let fs = mode === "logo" ? 96 : 80;
      sg.font = "700 " + fs + "px 'Space Grotesk', system-ui, sans-serif";
      let lines = wrap(main, W * 0.82);
      while (lines.length > 2 && fs > 30) {
        fs -= 6;
        sg.font = "700 " + fs + "px 'Space Grotesk', system-ui, sans-serif";
        lines = wrap(main, W * 0.82);
      }
      const total = lines.length * fs * 1.1;
      lines.forEach((l, i) => sg.fillText(l, W / 2, H / 2 - total / 2 + fs * 0.55 + i * fs * 1.1 - fs * 0.25));
      sg.font = "500 26px ui-monospace, Menlo, Consolas, monospace";
      sg.fillStyle = "rgba(255,255,255,.75)";
      sg.fillText(sub, W / 2, H / 2 + total / 2 + 30);
      sg.textAlign = "left";
    }
    stex.needsUpdate = true;
  }

  /* ---------- API ---------- */
  let screenKey = "";
  let kbAcc = 0, kbActive = false;
  const floor = -1.6;

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  /** P: pose, scr: {mode, typed, blink}. Mengembalikan true bila masih ada animasi (tombol menyala). */
  function render(P, scr, t, dt) {
    look.set(P.lx, P.ly, P.lz);
    camera.position.set(P.cx, P.cy, P.cz);
    camera.lookAt(look);
    group.position.set(P.px, P.py, P.pz);
    group.rotation.set(P.rx, P.ry, P.rz);
    group.scale.setScalar(P.s);
    shadow.position.set(P.px, P.py + floor * P.s, P.pz);
    shadow.scale.setScalar(P.s);
    glow.material.opacity = 0.1 + 0.35 * P.glow;
    dust.rotation.y = t * 0.015;

    const k = scr.mode === "code" && scr.typed < TOTAL ? 1 : 0;
    kbAcc += dt;
    if (k && kbAcc > 0.06) {
      kbAcc = 0;
      heat[(Math.random() * N) | 0] = 1;
      heat[(Math.random() * N) | 0] = 1;
    }
    kbActive = false;
    for (let i = 0; i < N; i++)
      if (heat[i] > 0) {
        heat[i] = Math.max(0, heat[i] - dt * 2.4);
        tmp.copy(cold).lerp(hot, heat[i]);
        keys.setColorAt(i, tmp);
        kbActive = true;
      }
    if (kbActive) keys.instanceColor.needsUpdate = true;

    const sk = scr.mode + "|" + (scr.mode === "code" ? scr.typed + "|" + scr.blink : scr.mode === "works" ? scr.blink : "");
    if (sk !== screenKey) {
      screenKey = sk;
      drawScreen(scr.mode, scr.typed, scr.blink, scr.narrow);
    }
    renderer.render(scene, camera);
    return kbActive || k === 1;
  }

  function lowerQuality() {
    if (dpr <= 1) return false;
    dpr = Math.max(1, dpr - 0.5);
    renderer.setPixelRatio(dpr);
    resize();
    return true;
  }
  /* Font web mungkin baru siap setelah layar pertama digambar. */
  function redrawScreen() { screenKey = ""; }

  return { render, resize, lowerQuality, redrawScreen };
}
