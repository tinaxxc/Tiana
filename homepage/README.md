# theziffr. Startseite 2.27

Basis: v2.26.0, unverändert in Aussehen, Farben und Ablauf. Geändert sind nur `index.html` und `home3d.js`.
Build: `npm install && node build.mjs` → `dist/`. Alle Eingriffe stehen einzeln in `build.mjs` und `src/words.js`.

## Was das Ruckeln verursachte (v2.26) und was geändert ist
1. Animierte, vererbte CSS-Variable `--dr` an 25 Wörtern: der Browser rechnete pro Bild alle Stile neu. Ersetzt durch direkte Transforms.
2. Zeitbasierte Transition beim Umschalten der Klasse `ordered` (bei 10 %): hing nicht am Scrollen, rückwärts anders. Jetzt folgt das Schweben dem Scrollfortschritt.
3. 25 dauernd laufende CSS-Keyframes: ersetzt durch einen Ticker, der stillsteht, sobald die Wörter geordnet sind.
4. Zielpositionen per `getBoundingClientRect` während laufender Transforms: jetzt aus dem Layout (`offsetLeft/offsetTop`).
5. Fehler: Die CSS-Klasse `.w` galt für Wörter und Kennwortfeld; das Kennwortfeld lag absolut positioniert über dem Benutzernamen. Wörter heissen jetzt `.zw`.
6. Scrub-Glättung 0,35 → 0,6 s, damit Mausrad-Rasten nicht als Stufen sichtbar sind.
7. Handy: Bei offenem Anmeldeformular tritt das Wortfeld zurück.

Texte leicht geglättet (Fakten unverändert): Lead, «Prüfen, bevor abgerechnet wird, und dabei dazulernen.», Absatz zu Prüfung/theacademy., «Jeder Hinweis hat eine Grundlage», «Alles greift ineinander».

## Messung (Chromium, CPU 6-fach gedrosselt, Bilder über 25 ms)
| | v2.26 | v2.27 |
|---|---|---|
| Handy 390, langsam vorwärts | 44 | 12–18 |
| Handy 390, schnell rückwärts | 22 | 1–8 |
| Desktop 1440, langsam vorwärts | 55 | 4 |
| Desktop 1440, schnell rückwärts | 30 | 8 |
| Stilberechnung in 2 s Ruhe (Handy) | 541 ms | ~200 ms |

Nicht getestet: echtes iPhone/Android/Safari, Login gegen den Cloudflare-Server.
