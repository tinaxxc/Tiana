// theziffr. 2.27: baut index.html und home3d.js aus der Version 2.26 (index.orig.html, home3d.orig.js).
// Anmelde-Skript, Formulare und GSAP-Bündel bleiben unverändert; ersetzt werden nur einzelne, benannte Stellen.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { transform } from 'esbuild';
let html = readFileSync('index.orig.html', 'utf8');
const swap = (a, b) => { const n = html.split(a).length - 1; if (n !== 1) throw new Error(`erwartet 1× «${a.slice(0, 70)}», gefunden ${n}`); html = html.replace(a, b); };
// --- Bewegung: Wörter heissen .zw, keine vererbte Variable, keine Keyframes, kein Zeitschalter
swap(".w{position:absolute;left:0;top:0;font-size:17px;font-weight:500;line-height:2.1;white-space:nowrap;color:var(--ink);transform-origin:0 50%;will-change:transform,opacity}\n@property --dr{syntax:'<number>';inherits:true;initial-value:1}\n.field{--dr:1;transition:--dr .9s cubic-bezier(.23,1,.32,1)}\nhtml.ordered .field{--dr:0}\n.w i{display:inline-block;font-style:normal;animation:drift var(--t,9s) ease-in-out var(--d,0s) infinite alternate}\n@keyframes drift{from{transform:translate3d(0,calc(var(--dr) * -4px),0)}to{transform:translate3d(0,calc(var(--dr) * 4px),0)}}",
     ".zw{position:absolute;left:0;top:0;font-size:17px;font-weight:500;line-height:2.1;white-space:nowrap;color:var(--ink);transform-origin:0 50%;will-change:transform,opacity;backface-visibility:hidden}\n.zw i{display:inline-block;font-style:normal;will-change:transform}");
swap("  .w{font-size:15px;line-height:2}.slot{", "  .zw{font-size:15px;line-height:2}.slot{");
swap(".w,.slot{line-height:1.8!important}", ".zw,.slot{line-height:1.8!important}");
swap('s.src=\'home3d.js\'', 's.src=\'home3d.js?v=2.27\'');
// --- Texte, leicht geglättet (Fakten unverändert)
swap('<h2 class="sh" id="h-p2">Prüfen, bevor abgerechnet wird. Und dabei dazulernen.</h2>', '<h2 class="sh" id="h-p2">Prüfen, bevor abgerechnet wird, und dabei dazulernen.</h2>');
swap('Kombinationen, Ausschlüsse, Pflichtangaben: Was fehlt oder nicht zusammen geht, fällt in der Sitzung auf. Tariffragen bekommen eine Antwort mit der Regel dahinter, theacademy. macht daraus Wissen mit Lektionen und Übungen aus der Praxis.',
     'Fehlt eine Pflichtangabe oder schliessen sich zwei Positionen aus, siehst du es noch in der Sitzung. Tariffragen beantwortet theziffr. mit der Regel dahinter, und theacademy. vertieft das Wissen mit Lektionen und Übungen aus der Praxis.');
swap('theziffr. erfindet keine Regeln. Es zeigt zu jedem Hinweis die Regel dahinter, damit nachvollziehbar bleibt, warum etwas passt oder nicht.',
     'theziffr. zeigt zu jedem Hinweis die Regel dahinter. So bleibt nachvollziehbar, warum etwas passt oder nicht.');
swap('Was du erfasst, prüft theziffr. Was es prüft, erklärt es. Was du lernst, wendest du an. Und alles fliesst in die Planung.',
     'Was du erfasst, prüft theziffr. und erklärt die Regel dazu. Was du in theacademy. lernst, wendest du in der nächsten Sitzung an, und die Zahlen fliessen in die Planung.');
swap('theziffr. verbindet Behandlungserfassung, Tarifregeln, Prüfung, Wissen und wirtschaftliche Planung in einer Anwendung. Für TARDOC und die ambulanten Pauschalen, 2026 und 2027.</p>',
     'theziffr. verbindet Behandlungserfassung, Tarifregeln, Prüfung, Wissen und wirtschaftliche Planung in einer Anwendung. Für TARDOC und die ambulanten Pauschalen, in den Tarifjahren 2026 und 2027.</p>');
// --- Handy: offenes Anmeldeformular liegt über dem Wortfeld, das Feld tritt zurück
swap('@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}\n</style>',
     '.field{transition:opacity .3s ease}\n@media (max-width:820px){html:has(#f:not([hidden])) .field,html:has(#cp:not([hidden])) .field{opacity:0}}\n@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}\n</style>');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
// --- home3d.js: GSAP-Bündel bis zur eigenen Logik übernehmen, eigene Logik ersetzen
const js = readFileSync('home3d.orig.js', 'utf8'), nl = js.indexOf('\n'), first = js.slice(0, nl), lic = js.slice(nl);
const cut = first.indexOf('var Lt=a=>'); if (cut < 0 || first.indexOf('var Lt=a=>', cut + 1) >= 0) throw new Error('Schnittstelle im Bündel nicht eindeutig');
const own = (await transform(readFileSync('src/words.js', 'utf8'), { minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false, target: 'es2019' })).code.trim();
writeFileSync('dist/home3d.js', first.slice(0, cut) + own + '})();' + lic);
console.log('ok');
