// theziffr. Startseite 2.27: Begriffsfeld ordnet sich in fünf Aufgaben. Gleicher Ablauf wie 2.26, ruckelfrei.
// Wird hinter das gebündelte GSAP 3.15.1 gehängt: Hr = gsap, I = ScrollTrigger (Namen aus dem Bündel).
// Änderungen gegenüber 2.26:
//  - Das Schweben der Wörter hängt am Scrollfortschritt statt an einer vererbten CSS-Variable mit Zeit-Transition
//    (keine Stilneuberechnung aller Kinder pro Bild, rückwärts identisch, kein Umschalten bei 10 %).
//  - Ein gemeinsamer Ticker statt 25 laufender CSS-Keyframes; steht still, sobald die Wörter geordnet sind.
//  - Zielpositionen aus dem Layout (offsetLeft/offsetTop), unabhängig von Scrollstand und laufenden Transforms.
//  - Wörter heissen .zw (2.26: .w, kollidierte mit dem Kennwortfeld).
var Lt = a => { let e = Math.sin(a * 127.1 + 311.7) * 43758.5453; return e - Math.floor(e); }, kt = null;
function gf() {
  const de = document.documentElement, cine = document.getElementById('cine'), wrap = document.querySelector('.stage > .wrap'), field = document.querySelector('.field');
  if (!cine || !wrap || !field) return false;
  de.classList.add('z3on');
  const mob = matchMedia('(max-width:820px)').matches, $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const slots = $$('.slot'), n = slots.length, perRow = mob ? 4 : 5, rows = mob ? 7 : 5;
  const R = mob ? { x0: 0, x1: .74, y0: .6, y1: .95 } : { x0: .42, x1: .88, y0: .12, y1: .86 };
  const order = slots.map((_, i) => i).sort((a, b) => Lt(a + 7) - Lt(b + 7));
  const words = [], inner = [], P = [];
  slots.forEach((s, i) => {
    const w = document.createElement('span'); w.className = 'zw';
    const it = document.createElement('i'); it.textContent = s.textContent; w.appendChild(it); field.appendChild(w); words.push(w); inner.push(it);
    const k = order.indexOf(i), c = k % perRow, r = Math.floor(k / perRow), big = Lt(i + 29) > .7;
    P.push({
      X: R.x0 + (R.x1 - R.x0) * ((c + .15 + Lt(i + 3) * .7) / perRow), Y: R.y0 + (R.y1 - R.y0) * ((r + .1 + Lt(i + 11) * .8) / rows),
      s: big ? (mob ? 1.3 : 1.7 + Lt(i) * .5) : (mob ? .78 + Lt(i + 5) * .2 : .85 + Lt(i + 5) * .3), o: big ? 1 : .42 + Lt(i + 13) * .4,
      ph: Lt(i + 41) * Math.PI * 2, w: Math.PI * 2 / (14 + Lt(i + 43) * 10)
    });
  });
  let W = wrap.clientWidth, H = wrap.clientHeight, T = [];
  // Zielposition jedes Platzhalters im Koordinatensystem der Bühne, aus dem Layout (Transforms zählen nicht mit)
  const off = el => { let x = 0, y = 0; for (let e = el; e && e !== wrap; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return { x, y }; };
  const measure = () => { W = wrap.clientWidth; H = wrap.clientHeight; T = slots.map(off); };
  measure();
  // Startfeld ohne Überlappungen (wie 2.26)
  (() => {
    const G = 6, B = mob ? 15 : 17, LH = words[0].offsetHeight || B * 2.1;
    const A = words.map((el, i) => { const h = B * 1.3 * P[i].s; return { x: P[i].X * W, y: P[i].Y * H + LH / 2 - h / 2, w: el.offsetWidth * P[i].s + G, h: h + G, off: LH / 2 - h / 2 }; });
    const acts = document.querySelector('.hero .acts'), wr = wrap.getBoundingClientRect(), actB = acts ? acts.getBoundingClientRect().bottom - wr.top + 18 : 0;
    const x0 = R.x0 * W, x1 = R.x1 * W + (mob ? W * .24 : W * .1), y0 = mob ? Math.max(R.y0 * H, actB) : R.y0 * H, y1 = Math.max(R.y1 * H, y0 + H * (mob ? .5 : .3));
    for (let it = 0; it < 220; it++) {
      let hit = false;
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
        const p = A[a], q = A[b], ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x), oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
        if (ox > 0 && oy > 0) { hit = true; if (oy < ox) { const d = oy / 2 + .5, s = p.y < q.y ? 1 : -1; p.y -= d * s; q.y += d * s; } else { const d = ox / 2 + .5, s = p.x < q.x ? 1 : -1; p.x -= d * s; q.x += d * s; } }
      }
      for (const p of A) { p.x = Math.max(x0, Math.min(x1 - p.w, p.x)); p.y = Math.max(y0, Math.min(y1 - p.h, p.y)); }
      if (!hit) break;
    }
    A.forEach((p, i) => { P[i].X = p.x / W; P[i].Y = (p.y - p.off) / H; });
  })();

  const tl = Hr.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.to({}, { duration: 1 }, 0);
  const oh = document.querySelector('.oh'), h3 = $$('.col h3'), cols = document.querySelector('.cols');
  Hr.set([oh].concat(h3), { opacity: 0 }); Hr.set(cols, { y: 40 });
  tl.to(cols, { y: 0, duration: .3, ease: 'power3.out' }, .2);
  words.forEach((w, i) => {
    const col = Math.floor(i / 5), row = i % 5;
    tl.fromTo(w, { x: () => P[i].X * W, y: () => P[i].Y * H, scale: P[i].s, opacity: P[i].o, force3D: true },
      { x: () => T[i].x, y: () => T[i].y, scale: 1, opacity: 1, duration: .42, ease: 'sine.inOut', immediateRender: true, force3D: true }, .12 + col * .035 + row * .01);
  });
  tl.to(h3, { opacity: 1, duration: .12, stagger: .03, ease: 'power3.out' }, .4);
  tl.fromTo(oh, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .1, ease: 'power3.out', immediateRender: false }, .74);

  // Schweben: Ausschlag folgt dem Fortschritt (voll bei 0, null ab 16 %), daher vorwärts wie rückwärts gleich
  const setY = inner.map(el => Hr.quickSetter(el, 'y', 'px'));
  let lastA = -1;
  const drift = (time) => {
    const p = tl.progress(), u = Math.min(1, p / .16), a = 1 - u * u * (3 - 2 * u);
    if (a === 0 && lastA === 0) return;
    for (let i = 0; i < n; i++) setY[i](Math.sin(time * P[i].w * 1 + P[i].ph) * 4 * a);
    lastA = a;
  };
  Hr.ticker.add(drift);

  I.config({ ignoreMobileResize: true });
  I.addEventListener('refreshInit', measure);
  const trig = I.create({ trigger: cine, start: 'top top', end: 'bottom bottom', animation: tl, scrub: .6, invalidateOnRefresh: true });
  kt = { tl, trig, words, measure, drift };
  requestAnimationFrame(() => I.refresh());
  if (document.readyState !== 'complete') addEventListener('load', () => I.refresh(), { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => I.refresh());
  return true;
}
function mf() {
  if (!kt) return;
  try { Hr.ticker.remove(kt.drift); kt.trig.kill(); kt.tl.kill(); I.removeEventListener('refreshInit', kt.measure); kt.words.forEach(w => w.remove()); } catch (e) {}
  kt = null; document.documentElement.classList.remove('z3on');
}
window.Z3D = { start: gf, stop: mf, get p() { return kt ? kt.tl.progress() : 0; }, get on() { return !!kt; }, dbg() { return kt ? { p: kt.tl.progress(), s: kt.trig.progress } : null; } };
