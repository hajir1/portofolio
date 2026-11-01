/*
 * Portofolio Usam Muhazir: alur scroll.
 *
 * Tanpa GSAP, Lenis, atau Motion: satu loop requestAnimationFrame kecil yang
 * hanya berjalan saat ada yang berubah. three.js (assets/scene.min.js) dimuat
 * belakangan, setelah halaman tampil, jadi teks langsung bisa dibaca.
 *
 * Urutan scroll (dalam piksel, dihitung ulang saat ukuran layar berubah):
 *   A  hero → about    : PC berputar menghadap depan
 *   B  about           : layar mengetik biodata dalam bentuk kode
 *   C  zoom            : kamera masuk ke layar sampai memenuhi viewport
 *   D  works           : layar DOM menggantikan 3D, proyek bergulir di dalamnya
 *   E  zoom out        : kembali ke 3D, kamera mundur → kontak
 */

/* ==== BIODATA (diketik di layar PC) ==== */
(function () {
"use strict";
const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || location.href.replace(/[^/]*$/, "assets/app.js");

const CONFIG = {
  file: "biodata.js",
  komentar: "Hello! Here is my profile.",
  variabel: "hajir",
  profil: {
    nama: "Usam Muhazir",
    peran: "Full-stack Developer",
    kota: "Malang",
    pengalaman: "5 years",
    keahlian: [
      "Tailwind", "Javascript", "React", "Node.js", "Express", "NestJs", "Php",
      "Laravel", "Python", "Django", "Mysql", "PostgreSQL", "Redis", "Wordpress",
      "Divi", "Git",
    ],
    status: "Open to projects",
  },
  layarSub: "usammuhazir.vercel.app",
  layarAkhir: "Let's build something.",
};

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* ---------- Kode biodata: token berwarna ---------- */
function bioLines(c) {
  const q = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  const val = (v) => {
    if (Array.isArray(v)) {
      const out = [["pun", "["]];
      v.forEach((x, i) => { if (i) out.push(["pun", ", "]); out.push(["str", q(x)]); });
      out.push(["pun", "]"]);
      return out;
    }
    return typeof v === "number" ? [["num", String(v)]] : [["str", q(v)]];
  };
  const lines = [[["com", "// " + c.komentar]], [["kw", "const "], ["var", c.variabel], ["pun", " = {"]]];
  for (const k of Object.keys(c.profil))
    lines.push([["pun", "  "], ["key", k], ["pun", ": "], ...val(c.profil[k]), ["pun", ","]]);
  lines.push([["pun", "};"]]);
  return lines;
}
const LINES = bioLines(CONFIG);
const TOTAL = LINES.reduce((n, l) => n + l.reduce((m, t) => m + t[1].length, 0) + 1, 0);

/* ---------- Mode: efek penuh atau statis ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const conn = navigator.connection || {};
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) || conn.saveData;
function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
}
const FX = !reduce && !lowEnd && webglOK();
const mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;

/* Tahun di footer */
const yr = $("#yr");
if (yr) yr.textContent = new Date().getFullYear();

/* Muncul saat terlihat (dipakai juga di mode statis) */
const revealIO = "IntersectionObserver" in window
  ? new IntersectionObserver((en) => en.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
    }), { rootMargin: "0px 0px -12% 0px" })
  : null;
$$("[data-reveal]").forEach((el) => (revealIO ? revealIO.observe(el) : el.classList.add("in")));

/* Hitung naik untuk angka */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = parseFloat(el.textContent);
  if (!isFinite(target) || reduce) return;
  const t0 = performance.now();
  const step = (now) => {
    const p = clamp((now - t0) / 1400);
    el.textContent = Math.round(target * easeOut(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (!FX) {
  /* Statis: semua konten tampil apa adanya, tanpa 3D. */
  root.classList.add("static");
  $$("[data-count]").forEach((el) => (revealIO ? new IntersectionObserver((en, io) => {
    if (en[0].isIntersecting) { countUp(el); io.disconnect(); }
  }).observe(el) : null));
} else {
  root.classList.add("fx");
  startFX();
}

function startFX() {
  const canvas = $("#gl");
  const journey = $("#journey");
  const about = $(".about");
  const statement = $(".statement");
  const os = $(".os");
  const view = $(".os-view");
  const track = $(".os-track");
  const wins = $$(".win", track);
  const counter = $("#os-count");
  const stats = $(".stats", track);
  const progressBar = $(".progress i");
  const navLinks = $$(".nav a[href^='#']");

  /* Kalimat besar → kata per kata, menyala mengikuti scroll */
  const words = [];
  if (statement) {
    const txt = statement.textContent.trim();
    statement.setAttribute("aria-label", txt);
    statement.textContent = "";
    txt.split(/\s+/).forEach((w, i, a) => {
      const s = document.createElement("span");
      s.textContent = w;
      s.setAttribute("aria-hidden", "true");
      statement.appendChild(s);
      if (i < a.length - 1) statement.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }

  /* ---------- Tata letak segmen ---------- */
  let vh = innerHeight, vw = innerWidth;
  let L = {}; // batas segmen dalam px scroll absolut
  let winBox = [];
  let innerMax = 0;
  function layout() {
    vh = innerHeight;
    vw = innerWidth;
    scr.narrow = vw / vh < 1.2;
    const heroEnd = journey.offsetTop; // A: 0 → heroEnd
    const aboutLen = vh * 1.3;
    const zoomLen = vh * 1.1;
    innerMax = Math.max(0, track.scrollHeight - view.clientHeight);
    const hold = vh * 0.25;
    const worksLen = innerMax + hold * 2;
    const outLen = vh * 1.1;
    journey.style.height = aboutLen + zoomLen + worksLen + outLen + vh + "px";
    L = {
      heroEnd,
      b0: heroEnd, b1: heroEnd + aboutLen,
      c1: heroEnd + aboutLen + zoomLen,
      d0: heroEnd + aboutLen + zoomLen + hold,
      d1: heroEnd + aboutLen + zoomLen + hold + innerMax,
      e0: heroEnd + aboutLen + zoomLen + worksLen,
      e1: heroEnd + aboutLen + zoomLen + worksLen + outLen,
    };
    winBox = wins.map((w) => ({ top: w.offsetTop, h: w.offsetHeight }));
    if (stats) winBox.stats = { top: stats.offsetTop, h: stats.offsetHeight };
  }

  /* ---------- Pose ---------- */
  let SCREEN = { y: 0.35, z: 0.064, w: 3.26, h: 2.04 }, FOV = 35;
  const narrowK = () => {
    const a = vw / vh;
    return a < 0.9 ? Math.pow(0.9 / a, 0.85) : 1;
  };
  function poses() {
    const a = vw / vh, n = a < 0.9, k = narrowK();
    const hero = {
      cx: 0, cy: 1.2 * k, cz: 12 * k, lx: 0, ly: n ? 2.2 : 1.6, lz: 0,
      px: 0, py: -0.3, pz: 0, rx: 0.1, ry: -0.45, rz: 0, s: 0.85, glow: 0.2,
    };
    const ab = n
      ? { cx: 0, cy: 0.6 * k, cz: 8.6 * k, lx: 0, ly: -1.2, lz: 0, px: 0, py: 0.4, pz: 0, rx: 0.05, ry: -0.12, rz: 0, s: 1, glow: 1 }
      : { cx: 0, cy: 0.5, cz: 8.6, lx: 0, ly: 0.1, lz: 0, px: 1.8, py: 0, pz: 0, rx: 0.05, ry: -0.28, rz: 0, s: 1, glow: 1 };
    /* Cover: layar memenuhi viewport (sisi terpendek pas, sisi lain terpotong) */
    const tanH = Math.tan((FOV * Math.PI) / 360);
    const visH = Math.min(SCREEN.h, SCREEN.w / a) * 0.94;
    const d = visH / 2 / tanH;
    const cover = {
      cx: 0, cy: SCREEN.y, cz: SCREEN.z + d, lx: 0, ly: SCREEN.y, lz: SCREEN.z,
      px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0, s: 1, glow: 0.6,
    };
    const out = {
      cx: 0, cy: 0.9 * k, cz: 11 * k, lx: 0, ly: n ? -2.9 : -1.55, lz: 0,
      px: 0, py: 0, pz: 0, rx: 0.12, ry: 0.42, rz: 0, s: 0.85, glow: 0.5,
    };
    return { hero, ab, cover, out };
  }
  let PS = null;
  const P = {};
  function mix(a, b, t) {
    for (const key in a) P[key] = lerp(a[key], b[key], t);
    return P;
  }

  /* ---------- Status scroll ---------- */
  let target = scrollY, cur = scrollY;
  let scene = null, sceneFailed = false;
  const scr = { mode: "logo", typed: 0, blink: true, narrow: false };
  let osOp = 0, zoomness = 0, section = "beranda";
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let introT = 1, introStart = 0;

  function update(y) {
    /* Pose & layar */
    let pose, ambient = 1;
    if (y < L.b0) {
      const t = ease(clamp(y / Math.max(1, L.heroEnd)));
      pose = mix(PS.hero, PS.ab, t);
      scr.mode = t > 0.55 ? "code" : "logo";
      scr.typed = 0;
      zoomness = 0;
      section = t > 0.5 ? "profil" : "beranda";
    } else if (y < L.b1) {
      const t = (y - L.b0) / (L.b1 - L.b0);
      pose = mix(PS.ab, PS.ab, 0);
      P.ry += t * 0.12;
      scr.mode = "code";
      scr.typed = Math.min(TOTAL, Math.round(clamp(t / 0.85) * TOTAL));
      zoomness = 0;
      section = "profil";
    } else if (y < L.c1) {
      const t = (y - L.b1) / (L.c1 - L.b1);
      const z = ease(clamp(t / 0.92));
      pose = mix(PS.ab, PS.cover, z);
      /* busur: kamera naik sedikit lalu menukik ke layar */
      const arc = Math.sin(z * Math.PI);
      pose.cy += arc * 0.9;
      pose.cx += arc * (vw / vh < 0.9 ? 0 : -0.8);
      scr.mode = t < 0.35 ? "code" : "works";
      scr.typed = TOTAL;
      zoomness = z;
      ambient = 1 - z;
      section = "karya";
    } else if (y < L.e0) {
      pose = mix(PS.cover, PS.cover, 0);
      scr.mode = "works";
      zoomness = 1;
      ambient = 0;
      section = "karya";
    } else {
      const t = clamp((y - L.e0) / (L.e1 - L.e0));
      const z = ease(clamp((t - 0.12) / 0.88));
      pose = mix(PS.cover, PS.out, z);
      /* PC berputar satu kali sambil kamera mundur */
      pose.ry += Math.PI * 2 * ease(clamp((z - 0.25) / 0.75));
      pose.cy += Math.sin(z * Math.PI) * 0.8;
      scr.mode = "text";
      zoomness = 1 - z;
      ambient = z;
      section = t > 0.5 ? "kontak" : "karya";
    }
    /* Intro: PC naik dari bawah sambil berputar saat 3D pertama tampil */
    if (introT < 1) {
      const e = easeOut(introT), r = 1 - e;
      pose.py -= r * 3.2;
      pose.ry += r * 2.4;
      pose.rx += r * 0.5;
      pose.s *= 0.55 + 0.45 * e;
    }
    /* sedikit goyang & paralaks pointer, hilang saat sudah zoom */
    pose.ry += Math.sin(now * 0.00045) * 0.06 * ambient;
    pose.cx += pointer.x * 0.5 * ambient;
    pose.cy -= pointer.y * 0.3 * ambient;

    /* Panel about */
    const aIn = clamp((y - L.heroEnd * 0.55) / (L.heroEnd * 0.4));
    const aOut = clamp((y - L.b1) / ((L.c1 - L.b1) * 0.25));
    const aOp = aIn * (1 - aOut);
    about.style.opacity = aOp;
    about.style.transform = `translate3d(0, ${(1 - aIn) * 40 - aOut * 40}px, 0)`;
    about.style.visibility = aOp > 0.01 ? "visible" : "hidden";

    /* Kalimat besar saat zoom */
    if (statement) {
      const t = (y - L.b1) / (L.c1 - L.b1);
      const sOp = clamp(t / 0.12) * (1 - clamp((t - 0.48) / 0.14));
      statement.style.opacity = sOp;
      statement.style.visibility = sOp > 0.01 ? "visible" : "hidden";
      statement.style.transform = `translate3d(-50%, 0, 0) scale(${1 + clamp(t) * 0.08})`;
      const lit = clamp((t - 0.05) / 0.5) * words.length;
      words.forEach((w, i) => (w.style.opacity = clamp(lit - i + 1, 0.15, 1)));
    }

    /* Layar DOM */
    let o;
    if (y < L.e0) o = clamp((y - (L.c1 - (L.c1 - L.b1) * 0.14)) / ((L.c1 - L.b1) * 0.12));
    else o = 1 - clamp((y - L.e0) / ((L.e1 - L.e0) * 0.14));
    if (o !== osOp) {
      osOp = o;
      os.style.opacity = o;
      os.style.setProperty("--on", o.toFixed(3));
      os.style.visibility = o > 0.001 ? "visible" : "hidden";
      os.classList.toggle("live", o > 0.6);
    }
    if (o > 0) {
      const off = clamp(y - L.d0, 0, innerMax);
      track.style.transform = `translate3d(0, ${-off}px, 0)`;
      const vH = view.clientHeight, mid = vH * 0.5;
      let best = 0, bestD = 1e9;
      winBox.forEach((b, i) => {
        const c = b.top + b.h / 2 - off;
        const r = (c - mid) / (vH * 0.75); // >0 di bawah, <0 di atas
        const d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = i; }
        const el = wins[i];
        const enter = clamp(r, 0, 1.3), leave = clamp(-r, 0, 1.3);
        el.style.transform =
          `translate3d(0, ${enter * 60}px, ${-enter * 220 - leave * 80}px) rotateX(${enter * 24 - leave * 8}deg)`;
        el.style.opacity = 1 - clamp((enter - 0.55) / 0.75) * 0.85 - clamp((leave - 0.7) / 0.6) * 0.6;
      });
      if (counter) counter.textContent = String(best + 1).padStart(2, "0") + " / " + String(wins.length).padStart(2, "0");
      if (winBox.stats && winBox.stats.top - off < vH * 0.8) $$("[data-count]", stats).forEach(countUp);
    }

    /* Navigasi & progres */
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + section));
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = `scaleX(${clamp(y / Math.max(1, max))})`;
    return pose;
  }

  /* ---------- Loop: berjalan hanya saat perlu ---------- */
  let raf = 0, now = performance.now(), last = now, lastRender = 0;
  let kbBusy = false, slowFrames = 0, renderedFrames = 0, visible = true;
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(ts) {
    raf = 0;
    if (sceneFailed) return;
    now = ts;
    const dt = Math.min((ts - last) / 1000, 0.1);
    last = ts;
    const k = 1 - Math.exp(-dt * 9);
    const moving = Math.abs(target - cur) > 0.4;
    cur = moving ? lerp(cur, target, k) : target;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
    const pMoving = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002;
    const typing = scr.mode === "code" && scr.typed < TOTAL;
    scr.blink = typing || scr.mode === "works" ? Math.floor(ts / 450) % 2 === 0 : false;
    if (introT < 1) introT = clamp((ts - introStart) / 1800);

    const pose = update(cur);
    const covered = osOp >= 1;
    const ambient = !covered && visible && !document.hidden;
    if (scene && !covered && visible && !document.hidden) {
      /* Saat diam: 30 fps untuk goyang halus; saat scroll: penuh */
      const need = moving || pMoving || kbBusy || typing || introT < 1 || ts - lastRender > 33;
      if (need) {
        const t0 = performance.now();
        kbBusy = scene.render(pose, scr, ts / 1000, Math.max(dt, ts - lastRender > 33 ? 0.033 : dt));
        lastRender = ts;
        renderedFrames++;
        if (performance.now() - t0 > 14 || dt > 0.034) slowFrames++;
        if (renderedFrames === 120) {
          if (slowFrames > 50) scene.lowerQuality();
          renderedFrames = slowFrames = 0;
        }
      }
    }
    if (moving || pMoving || kbBusy || typing || introT < 1 || (scene && ambient)) raf = requestAnimationFrame(frame);
  }

  addEventListener("scroll", () => { target = scrollY; wake(); }, { passive: true });
  if (!mobile)
    addEventListener("pointermove", (e) => {
      pointer.tx = e.clientX / innerWidth - 0.5;
      pointer.ty = e.clientY / innerHeight - 0.5;
      wake();
    }, { passive: true });
  document.addEventListener("visibilitychange", wake);
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; wake(); }).observe(canvas);

  let rz = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      layout();
      PS = poses();
      if (scene) scene.resize();
      target = cur = scrollY;
      wake();
    });
  });

  /* Tautan navigasi → posisi di dalam alur scroll */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const map = {
      beranda: 0,
      profil: L.b0 + (L.b1 - L.b0) * 0.6,
      karya: L.d0,
      kontak: $("#kontak").offsetTop,
    };
    if (!(id in map)) return;
    e.preventDefault();
    scrollTo({ top: map[id], behavior: "smooth" });
    history.replaceState(null, "", "#" + id);
  });

  layout();
  PS = poses();
  /* Gambar proyek berukuran tetap (width/height), tetapi hitung ulang setelah font siap. */
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => { layout(); if (scene) scene.redrawScreen(); wake(); });
  addEventListener("load", () => { layout(); wake(); });
  if (location.hash) {
    const a = document.querySelector(`.nav a[href="${location.hash}"]`);
    if (a) setTimeout(() => a.click(), 50);
  }
  wake();

  /* ---------- Muat three.js setelah halaman tampil ---------- */
  /* <script> biasa (bukan import()) supaya juga jalan saat index.html dibuka langsung dari disk (file://). */
  const base = SCRIPT_SRC;
  const loadScript = () =>
    new Promise((res, rej) => {
      if (window.PortoScene) return res(window.PortoScene);
      const el = document.createElement("script");
      el.src = new URL("scene.min.js", base).href;
      el.async = true;
      el.onload = () => (window.PortoScene ? res(window.PortoScene) : rej(new Error("PortoScene missing")));
      el.onerror = () => rej(new Error("scene.min.js gagal dimuat"));
      document.head.appendChild(el);
    });
  const load = () =>
    loadScript()
      .then((m) => {
        SCREEN = m.SCREEN;
        FOV = m.FOV;
        PS = poses();
        const css = getComputedStyle(root);
        const v = (n) => css.getPropertyValue(n).trim();
        scene = m.createScene(canvas, {
          colors: {
            bg: v("--bg"), bg2: v("--bg-2"), accent: v("--accent"), accent2: v("--accent-2"),
            obj: v("--obj"), obj2: v("--obj-2"),
          },
          bio: { lines: LINES, total: TOTAL, file: CONFIG.file },
          brand: ($(".nav .brand") || {}).textContent || "Usam Muhazir",
          sub: CONFIG.layarSub,
          outro: CONFIG.layarAkhir,
          worksTitle: ($("#karya-t") || {}).textContent || "Latest projects",
          mobile,
        });
        lastRender = 0;
        introStart = performance.now();
        introT = target < L.heroEnd * 0.3 ? 0 : 1;
        wake();
        requestAnimationFrame(() => root.classList.add("gl-ready"));
      })
      .catch((err) => {
        console.warn("[3D] tidak aktif:", err);
        sceneFailed = true;
        root.classList.remove("fx");
        root.classList.add("static");
        journey.style.height = "";
        $$("[style]", journey).forEach((el) => el.removeAttribute("style"));
        $$("[data-count]").forEach(countUp);
      });
  if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 1200 });
  else setTimeout(load, 200);
}
})();
