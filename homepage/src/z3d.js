// theziffr. Startseite 3.0: das Z als Skulptur, eine durchgehende Bewegung über die ganze Seite.
// Ein Canvas, ein Material, drei Teile. Der Zustand ist eine Funktion der Scrollposition (stetig, auch rückwärts),
// geglättet mit einer bildratenunabhängigen Dämpfung. Keine Timeline, kein Pinning, kein Eingriff ins Scrollen.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Shape, ExtrudeGeometry, MeshPhysicalMaterial,
  MeshStandardMaterial, MeshBasicMaterial, PMREMGenerator, PlaneGeometry, SphereGeometry, Color,
  ACESFilmicToneMapping, BackSide, DoubleSide, Vector2
} from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- Form: das Signet, exakt aus dem Logo-Pfad ----------
const D = 'M692 227 H1083 C1077 253 1056 272 1030 288 C1001 308 948 337 884 369 C820 400 762 430 718 461 C745 442 771 434 796 433 H1083 V478 H692 C709 442 730 416 762 389 C804 353 857 324 918 295 L989 269 H692 Z';
const CUT1 = 269, CUT2 = 433, CX = 887.5, CY = 352.5, U = 251;

function sample(d, seg) {
  const t = d.match(/[A-Za-z]|-?\d*\.?\d+/g); let i = 0, x = 0, y = 0; const p = [];
  const n = () => +t[i++];
  while (i < t.length) {
    const c = t[i++];
    if (c === 'M' || c === 'L') { x = n(); y = n(); p.push([x, y]); }
    else if (c === 'H') { x = n(); p.push([x, y]); }
    else if (c === 'V') { y = n(); p.push([x, y]); }
    else if (c === 'C') {
      const x1 = n(), y1 = n(), x2 = n(), y2 = n(), x3 = n(), y3 = n();
      for (let k = 1; k <= seg; k++) {
        const u = k / seg, v = 1 - u;
        p.push([v * v * v * x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
                v * v * v * y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3]);
      }
      x = x3; y = y3;
    }
  }
  const a = p[0], b = p[p.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6) p.pop();
  return p;
}
// Sutherland-Hodgman gegen eine waagrechte Gerade
function clip(poly, c, keepAbove) {
  const inside = q => keepAbove ? q[1] <= c + 1e-9 : q[1] >= c - 1e-9; const out = [];
  for (let k = 0; k < poly.length; k++) {
    const A = poly[k], B = poly[(k + 1) % poly.length], ia = inside(A), ib = inside(B);
    if (ia) out.push(A);
    if (ia !== ib) { const u = (c - A[1]) / (B[1] - A[1]); out.push([A[0] + (B[0] - A[0]) * u, c]); }
  }
  return out;
}
// Doppelte und kollineare Punkte (auch Rückläufer entlang der Schnittkante) entfernen
function clean(p) {
  let ch = true;
  while (ch && p.length > 3) {
    ch = false;
    for (let k = 0; k < p.length; k++) {
      const A = p[(k - 1 + p.length) % p.length], B = p[k], C = p[(k + 1) % p.length];
      const cr = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
      if (Math.hypot(B[0] - A[0], B[1] - A[1]) < 1e-6 || Math.abs(cr) < 1e-4) { p.splice(k, 1); ch = true; break; }
    }
  }
  return p;
}
function parts(hi) {
  const full = sample(D, hi ? 40 : 24);
  const polys = [clip(full, CUT1, true), clip(clip(full, CUT1, false), CUT2, true), clip(full, CUT2, false)].map(clean);
  const depth = 0.2, bs = 0.02;
  return polys.map(poly => {
    const sh = new Shape(poly.map(([x, y]) => new Vector2((x - CX) / U, -(y - CY) / U)));
    let g = new ExtrudeGeometry(sh, { depth, steps: 1, bevelEnabled: true, bevelThickness: 0.024, bevelSize: bs, bevelOffset: -bs, bevelSegments: hi ? 6 : 4, curveSegments: 1 });
    g.translate(0, 0, -depth / 2);
    g.computeBoundingBox(); const bb = g.boundingBox, c = { x: (bb.min.x + bb.max.x) / 2, y: (bb.min.y + bb.max.y) / 2 };
    g.translate(-c.x, -c.y, 0);
    g = toCreasedNormals(g, 0.6);
    return { g, c: [c.x, c.y] };
  });
}

// ---------- Licht: ein kleines Studio, als Umgebung vorgerechnet ----------
function studio() {
  const s = new Scene();
  s.add(new Mesh(new SphereGeometry(12, 32, 16), new MeshBasicMaterial({ color: new Color('#2a2b28'), side: BackSide })));
  const box = (w, h, col, k, pos) => { const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(col).multiplyScalar(k), side: DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
  box(7, 2.4, '#E7E3DB', 3.4, [0, 7, 1.5]);     // Hauptlicht oben, Elfenbein
  box(0.5, 8, '#E7E3DB', 5.0, [-7, 0.6, 2]);    // Streiflicht links: die Kanten
  box(0.7, 7, '#AD806B', 9.0, [7, -0.4, -1.5]); // Kupfer, Gegenlicht rechts hinten
  box(5, 1.2, '#54796B', 1.6, [0, -6, 2.5]);    // Smaragd vom Boden
  box(4.2, 3.2, '#E7E3DB', 1.5, [2.5, 1.2, 8]);   // weiche Front
  return s;
}

// ---------- Choreografie: ein Zustand pro Abschnitt, dazwischen stetig ----------
// x, y: Lage in Bruchteilen des Bildes (Mitte 0). s: Grösse (1 = füllt). r*: Drehung. ey/ez: Auffächern der drei Teile
// in Höhe/Tiefe. tw: Gegendrehung der Teile. ly: Diagonale legt sich waagrecht (drei Balken). env: Lichtlauf. o: Deckkraft.
const K = ['x', 'y', 's', 'rx', 'ry', 'rz', 'ey', 'ez', 'tw', 'ly', 'env', 'o'];
const S = (x, y, s, rx, ry, rz, ey, ez, tw, ly, env, o) => [x, y, s, rx, ry, rz, ey, ez, tw, ly, env, o];
const DESK = {
  hero:   S( .24, -.02, .54,  .16, -.52,  .02,  0,   0,    0,   0,  0,   1),
  ord:    S( .27,  .20, .30,  .55, -1.10, .10, .55, 1.0,  .55,  0,  .9,  .95),
  regel:  S(-.27, -.22, .33, -.18,  .72, -.05, .22, .40, -.30,  0, 1.7,  .95),
  pruef:  S( .29, -.27, .29,  .30, -.92,  .08, .30, .55,  .60,  0, 2.5,  .95),
  plan:   S(-.27, -.21, .34,  .28,  .34,  0,   .46,  0,    0,   1, 3.1,  .95),
  eins:   S(-.24,  .00, .5,  .06, -.20,  0,    0,   0,    0,   0, 3.95, 1),
  grund:  S(-.28, -.24, .30, 1.18, -.16,  .30,  0,  .22,  .12,  0, 4.7,  .85),
  fin:    S( 0,    .26, .24,  .10,  .22,  0,    0,   0,    0,   0, 5.5,  1)
};
const MOB = {
  hero:   S( .00,  .25, .62,  .16, -.48,  .02,  0,   0,    0,   0,  0,   1),
  ord:    S( .30,  .30, .50,  .55, -1.10, .10, .55, 1.0,  .55,  0,  .9,  .17),
  regel:  S(-.32,  .28, .52, -.18,  .72, -.05, .22, .40, -.30,  0, 1.7,  .17),
  pruef:  S( .32,  .28, .52,  .30, -.92,  .08, .30, .55,  .60,  0, 2.5,  .17),
  plan:   S(-.28,  .28, .52,  .28,  .34,  0,   .46,  0,    0,   1, 3.1,  .17),
  eins:   S( 0,    .25, .62,  .06, -.20,  0,    0,   0,    0,   0, 3.95, 1),
  grund:  S( .30,  .30, .46, 1.18, -.16,  .30,  0,  .22,  .12,  0, 4.7,  .17),
  fin:    S( 0,    .28, .42,  .10,  .22,  0,    0,   0,    0,   0, 5.5,  1)
};
// Catmull-Rom mit reduzierter Tangente: stetige Geschwindigkeit, ohne Stillstand an den Ankern
function track(keys, t, out) {
  const n = keys.length, i = Math.max(0, Math.min(n - 1, Math.floor(t))), u = Math.max(0, Math.min(1, t - i));
  const p1 = keys[i], p2 = keys[Math.min(n - 1, i + 1)], p0 = keys[Math.max(0, i - 1)], p3 = keys[Math.min(n - 1, i + 2)];
  const T = 0.62, u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  for (let k = 0; k < p1.length; k++) {
    const m1 = (p2[k] - p0[k]) * 0.5 * T * (i > 0 ? 1 : 2), m2 = (p3[k] - p1[k]) * 0.5 * T * (i + 2 < n ? 1 : 2);
    out[k] = h00 * p1[k] + h10 * m1 + h01 * p2[k] + h11 * m2;
  }
  return out;
}

// ---------- Laufzeit ----------
let R = null;
const ease = u => u >= 1 ? 1 : 1 - Math.pow(2, -10 * u);

function start(opts) {
  if (R) return true;
  const still = !!(opts && opts.still);
  const de = document.documentElement;
  const touch = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const hi = !touch && cores > 4;                      // Stufe hoch: Klarlack, Anisotropie, feinere Kanten
  const canvas = document.createElement('canvas'); canvas.id = 'z3'; canvas.setAttribute('aria-hidden', 'true');
  let gl;
  try {
    gl = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false });
  } catch (e) { return false; }
  if (!gl || !gl.getContext()) return false;
  gl.setClearColor(0x000000, 0);
  gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.3;

  const scene = new Scene(), cam = new PerspectiveCamera(20, 1, 0.1, 60); cam.position.set(0, 0, 8.5);
  const pm = new PMREMGenerator(gl); const env = pm.fromScene(studio(), 0.035).texture; pm.dispose();
  scene.environment = env;
  const mat = hi
    ? new MeshPhysicalMaterial({ color: new Color('#5F8D7C'), metalness: 0.66, roughness: 0.24, clearcoat: 0.85, clearcoatRoughness: 0.08, anisotropy: 0.3, envMapIntensity: 1.5 })
    : new MeshStandardMaterial({ color: new Color('#5F8D7C'), metalness: 0.66, roughness: 0.25, envMapIntensity: 1.6 });
  const root = new Group(), P = parts(hi).map(({ g, c }) => { const pivot = new Group(); const m = new Mesh(g, mat); pivot.add(m); pivot.userData.c = c; root.add(pivot); return pivot; });
  scene.add(root);
  const diag = Math.atan2(164, 300); // Neigung der Diagonale

  // Anker: ein Zustand pro Abschnitt [data-z]
  const secs = [...document.querySelectorAll('[data-z]')];
  let anchors = [], keys = [], mobile = false, W = 0, H = 0, dpr = 1;
  const measure = () => {
    mobile = innerWidth <= 820;
    const set = mobile ? MOB : DESK, vh = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - vh);
    anchors = []; keys = [];
    let last = -1;
    secs.forEach((el, i) => {
      let top = 0; for (let n = el; n; n = n.offsetParent) top += n.offsetTop;
      let a = i === 0 ? 0 : Math.min(max, Math.max(0, top + el.offsetHeight / 2 - vh / 2));
      if (a <= last) a = last + 1;
      anchors.push(a); keys.push(set[el.dataset.z] || set.hero); last = a;
    });
  };
  const size = (force) => {
    const w = innerWidth, h = canvas.clientHeight || innerHeight;
    if (!force && w === W && (touch ? Math.abs(h - H) < 160 : h === H)) return; // iOS: Adressleiste ignorieren
    W = w; H = h;
    gl.setPixelRatio(dpr); gl.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
  };
  dpr = Math.min(devicePixelRatio || 1, touch ? 2 : 1.75);
  if (still) canvas.classList.add('still');
  document.body.insertBefore(canvas, document.body.firstChild);
  de.classList.add('z3on');
  measure(); size(true);

  const tOf = y => {
    const a = anchors; if (y <= a[0]) return 0;
    for (let i = 0; i < a.length - 1; i++) if (y < a[i + 1]) return i + (y - a[i]) / (a[i + 1] - a[i]);
    return a.length - 1;
  };
  const st = new Array(K.length).fill(0);
  const visW = () => 2 * Math.tan(cam.fov * Math.PI / 360) * cam.position.z * cam.aspect, visH = () => 2 * Math.tan(cam.fov * Math.PI / 360) * cam.position.z;
  let op = -1;
  const apply = (s, time) => {
    const [x, y, sc, rx, ry, rz, ey, ez, tw, ly, en, o] = s;
    const vw = visW(), vh = visH(), fit = Math.min(vh, vw / 1.62);
    root.position.set(x * vw, y * vh, 0); root.scale.setScalar(sc * fit);
    const b1 = still ? 0 : Math.sin(time * 0.23) * 0.05, b2 = still ? 0 : Math.sin(time * 0.31 + 1.3) * 0.025;
    root.rotation.set(rx + b2, ry + b1, rz);
    const off = [[0.10 * ez, 0.36 * ey, 0.44 * ez], [0, 0, 0], [-0.10 * ez, -0.36 * ey, -0.44 * ez]];
    P.forEach((p, i) => {
      const [cx, cy] = p.userData.c; p.position.set(cx + off[i][0], cy + off[i][1], off[i][2]);
      if (i === 0) p.rotation.set(-0.5 * tw, 0.35 * tw, 0);
      else if (i === 1) p.rotation.set(0.6 * tw, 0, -diag * ly);
      else p.rotation.set(-0.5 * tw, -0.35 * tw, 0);
    });
    scene.environmentRotation.set(0, en * 1.1 + (still ? 0 : time * 0.035), 0);
    const oo = Math.max(0, Math.min(1, o)); if (Math.abs(oo - op) > 0.004) { canvas.style.opacity = oo.toFixed(3); op = oo; }
  };

  let raf = 0, tS = tOf(scrollY), lastT = performance.now(), t0 = lastT, acc = 0, fr = 0, lost = false;
  const intro = still ? 0 : 1;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    const tg = tOf(scrollY);
    // Dämpfung: weit weg holt sie stufenlos schneller auf (nie ein Sprung), nah dran bleibt sie weich
    const gap = Math.abs(tg - tS), rate = 7.5 * (1 + Math.max(0, gap - 0.8) * 1.4);
    const step = (tg - tS) * (1 - Math.exp(-dt * rate)), vmax = 4.5 * dt; // höchstens 4,5 Abschnitte pro Sekunde
    tS += Math.max(-vmax, Math.min(vmax, step));
    track(keys, tS, st);
    const k = intro ? 1 - ease((now - t0) / 1900) : 0;
    if (k > 0) { st[3] += 0.35 * k; st[4] -= 1.1 * k; st[6] += 0.6 * k; st[7] += 1.1 * k; st[8] += 0.5 * k; st[10] -= 1.2 * k; st[11] *= 1 - k * k * k; }
    apply(st, (now - t0) / 1000);
    gl.render(scene, cam);
    // Qualität an das Gerät anpassen: über 22 ms im Mittel → Auflösung schrittweise senken (nie wieder hoch, kein Pendeln)
    acc += dt; fr++;
    if (acc > 1.2) { const avg = acc / fr; acc = 0; fr = 0; if (avg > 0.022 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); size(true); } }
  };
  const onResize = () => { measure(); size(false); if (still) renderStill(); };
  const renderStill = () => { track(keys, 0, st); apply(st, 0); gl.render(scene, cam); };
  addEventListener('resize', onResize, { passive: true });
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => measure()) : null; if (ro) ro.observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('load', measure, { once: true });
  const vis = () => { if (still || lost) return; if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', vis);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0; de.classList.remove('z3on'); de.classList.add('z3off'); canvas.remove(); });
  if (still) renderStill(); else raf = requestAnimationFrame(frame);

  R = {
    stop() { cancelAnimationFrame(raf); raf = 0; removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', vis); if (ro) ro.disconnect();
      try { P.forEach(p => p.children[0].geometry.dispose()); mat.dispose(); env.dispose(); gl.dispose(); } catch (e) {} canvas.remove(); de.classList.remove('z3on'); R = null; },
    dbg() { return { t: tS, target: tOf(scrollY), anchors: anchors.slice(), dpr, hi, mobile, st: st.slice(), op: canvas.style.opacity }; }
  };
  return true;
}
window.Z3D = { start, stop() { if (R) R.stop(); }, get on() { return !!R; }, dbg() { return R ? R.dbg() : null; } };
