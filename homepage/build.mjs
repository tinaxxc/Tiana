// Baut index.html und home3d.js für Cloudflare Pages.
// Funktionale Teile (Kopf, Login- und Kontaktformulare, das ganze Anmelde-Skript) kommen unverändert aus index.orig.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';
const L = readFileSync('index.orig.html', 'utf8').split('\n');
const ln = (a, b) => L.slice(a - 1, b).join('\n');           // 1-basiert, inklusive
const expect = (n, s) => { if (!L[n - 1].startsWith(s)) throw new Error(`index.orig.html Zeile ${n} unerwartet: ${L[n - 1].slice(0, 60)}`); };
expect(272, '</style></head><body>'); expect(274, '<header class="top"'); expect(287, '<form class="pn" id="f"'); expect(298, '<button id="cgo"');
expect(363, '<svg class="zb-sym"'); expect(369, '<section class="band"'); expect(384, '</div></section>'); expect(386, '<footer');
expect(387, '<script>'); expect(484, '  catch(err){b.disabled=false;b.textContent=\'Anfrage senden\''); expect(485, '/* Produktabschnitte'); expect(497, "document.addEventListener('DOMContentLoaded',auto);");
const head = ln(1, 5)
  .replace('<title>theziffr. – Eine Leistung ist mehr als eine Ziffer.</title>', '<title>theziffr. Eine Leistung ist mehr als eine Ziffer.</title>')
  .replace('theziffr. verbindet Behandlungserfassung, Tarifregeln, Prüfung, Wissen und wirtschaftliche Planung in einer Anwendung. Für TARDOC und die ambulanten Pauschalen.', 'theziffr. führt Erfassung, Tarifregeln, Prüfung, Wissen und Planung in einer Anwendung zusammen. Für TARDOC und die ambulanten Pauschalen, 2026 und 2027.')
  .replace('<meta name="theme-color" content="#F4EEE6">', '<meta name="theme-color" content="#151615"><meta name="color-scheme" content="dark">')
  .replace("setAttribute('data-theme','light')", "setAttribute('data-theme','dark')");
const fontsBlock = L[5]; // Zeile 6: <style> mit den eingebetteten Schriften
const body = readFileSync('src/body.html', 'utf8')
  .replace('{{HEADER}}', ln(274, 277)).replace('{{FORMS}}', ln(287, 298)).replace('{{FINSYM}}', L[362])
  .replace('{{MODAL}}', ln(369, 384).replace('<h2 class="sh">Teste theziffr. mit deinen eigenen Fällen</h2>', '<h2 class="sh">Zugang anfragen</h2>')).replace('{{FOOTER}}', L[385]);
const html = [head, fontsBlock, readFileSync('src/page.css', 'utf8').trim(), '</style></head><body>', body.trim(),
  ln(387, 484), readFileSync('src/loader.js', 'utf8').trim(), ln(497, 500)].join('\n') + '\n';
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
await build({ entryPoints: ['src/z3d.js'], bundle: true, minify: true, format: 'iife', target: ['safari15', 'chrome100', 'firefox100'], outfile: 'dist/home3d.js', legalComments: 'eof' });
console.log('ok', html.length);
