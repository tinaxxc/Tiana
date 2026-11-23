# theziffr. Startseite 3.0: Bericht

## Was geändert ist
Nur `index.html` (Gestaltung, Texte, Ladeskript der Skulptur) und `home3d.js` (3D-Engine). Die übrigen 18 Dateien im ZIP sind byte-identisch mit v2.26.0: `_worker.js`, `app.enc`, `ck.enc`, `admin.html`, `soon.html`, `sw.js`, Manifest, Icons und Medien. Das Anmelde-Skript in `index.html` (98 Zeilen) ist zeichengenau übernommen (per `diff` geprüft), ebenso Kopf, Login-Formulare und Kontakt-Dialog (Funktion unverändert, im Dialog nur die Überschrift).

Build: `npm install && node build.mjs` erzeugt `dist/index.html` und `dist/home3d.js` aus `src/` und `index.orig.html`.

## Ursachen des Ruckelns in v2.26 (im Code gefunden)
1. **Vererbte CSS-Variable als Animation.** `--dr` (per `@property`) wurde auf `.field` animiert und an 25 Wortelemente vererbt. Jedes Bild erzwang eine Stilneuberechnung aller Kinder (Emil Kowalski, animation-performance: «Inherited CSS variables»).
2. **Zeitbasiert und scrollbasiert gemischt.** Die Klasse `ordered` wurde bei 10 % Fortschritt umgeschaltet und startete eine 0,9-s-Transition, die nicht am Scrollen hing. Rückwärts scrollen sah deshalb anders aus als vorwärts.
3. **25 dauerhafte CSS-Keyframes** (`drift`) liefen gleichzeitig mit dem Scrubbing, dazu skalierter Text (Neurasterung).
4. **Messung gegen ein bewegtes Ziel.** Die Zielpositionen der Wörter wurden per `getBoundingClientRect` gemessen, während `.cols` selbst animiert war. Daraus entstanden Sprünge nach `refresh`.
5. **Abfolge statt Fluss.** Nach der ersten Szene erschienen alle Abschnitte einmalig per IntersectionObserver (zeitbasiert, nicht umkehrbar), das Signet als separate CSS-Transition.
6. **Layoutfehler:** `.w` war doppelt definiert (Passwortfeld und Wörter). Bei aktiver Animation wurde das Kennwortfeld absolut positioniert.
7. Es gab **kein 3D-Objekt**: «home3d.js» enthielt nur GSAP und ScrollTrigger.

## Neue Architektur
- Ein Canvas (Three.js r170, lokal gebündelt, CSP-konform), ein Material, drei Teile. Das Z ist exakt aus dem Logo-Pfad extrudiert und an den Linien des Signets (y 269 und 433) in die drei Teile des Logos geschnitten. Die Kanten sind abgerundet, die Normalen geglättet, Kanten über 34° bleiben scharf.
- Das Licht ist ein vorgerechnetes Studio (PMREM): Elfenbein oben, Streiflicht links, Kupfer im Gegenlicht, Smaragd vom Boden. Der Lichtlauf über die Oberfläche folgt dem Scrollen.
- **Ein Zustand pro Abschnitt** (`data-z`). Dazwischen interpoliert eine Catmull-Rom-Kurve mit stetiger Geschwindigkeit. Der Zustand ist eine reine Funktion der Scrollposition, deshalb verhält sich die Bewegung vorwärts und rückwärts identisch.
- Die Dämpfung ist bildratenunabhängig und holt grosse Abstände stufenlos schneller auf, mit höchstens 4,5 Abschnitten pro Sekunde. Das ergibt keine Sprünge, kein Pinning und keine Scrollblockade.
- Text und Produktbilder stehen still (keine Einblendungen beim Scrollen). Bewegt wird nur die Skulptur. Der Einstieg beim Laden läuft einmal.
- Qualitätsstufen:
  - Desktop mit mehr als 4 Kernen: Klarlack und Anisotropie.
  - Sonst ein einfacheres Material.
  - Pixeldichte höchstens 2 (Touch) bzw. 1,75.
  - Wenn ein Bild im Mittel über 22 ms braucht, senkt die Seite die Auflösung schrittweise.
  - Auf iOS werden Höhenänderungen durch die Adressleiste ignoriert (`100lvh`).
  - Im Hintergrund-Tab stoppt die Animation, ein Kontextverlust wird abgefangen.
- Reduzierte Bewegung: ruhiges Standbild im Hero, keine Animation. Ohne WebGL: das flache Signet. In der Home-Bildschirm-App und auf `/eintritt` wird die Skulptur gar nicht geladen.

## Angewendete Skills
- **Emil Kowalski** (`animation-performance`, `choreograph`): Diagnose der Ursachen 1 bis 4, nur `transform`/`opacity` am DOM, eine Hauptbewegung, Text und Karten statisch, Unterbrechbarkeit (Richtungswechsel, Stopps).
- **Impeccable** (`context`, `craft-floor`, `detect`): PRODUCT.md aus dem Auftrag, Browser-Oberflächen im Markendesign (Auswahl, Scrollbalken, Fokus, Cursor), Kontrastkorrektur (Chips 4,49 → über 4,5:1), Schraffur entfernt.
- **Taste Skill** (`copy-lint`, Hausregeln): kein Einblenden beim Scrollen, ein Knopfpaar, echte Produktoberflächen als HTML, gleiche Randkanten, doppelte Überschrift aufgelöst.
- **Humanizer**: Gestrichen bzw. umgeschrieben wurden die Pointe «Der Tarif wird jedes Jahr komplexer. Du nicht.» (§1/§2), der vorbeugende Satz «erfindet keine Regeln» (§5), die vierfache Reihung «Was du erfasst … Was es prüft …» (§6), das Satzfragment «Und dabei dazulernen.» (§2) und der Gedankenstrich im Titel (§8). Fakten blieben gleich.

## Tests
Durchgeführt (Chromium headless, WebGL über SwiftShader):
- Screenshots aller 8 Abschnitte bei 1440×900 und 390×844, Hero bei 768×1024 und 1024×768.
- Zustände: Login-Formular (Desktop, Handy über die Kopfzeile), Kontakt-Dialog, reduzierte Bewegung, ohne WebGL (Desktop und Handy), `/eintritt`.
- Bewegungsmessung pro Bild (langsam vorwärts, schnell rückwärts, schnell mit Stopps, Richtungswechsel), 1440 und 390: in allen Fällen stetig, nach dem Stoppen exakt am Ziel (Abstand < 1e-8), keine Skriptfehler.
- Taste `copy-lint`: 0 FAIL, 1 WARN (Schrittnummern 1–4 in der Pauschalen-Oberfläche, gewollt). Impeccable `detect`: «overused-font» bleibt, weil die Schriften zur bestehenden Marke gehören.

Nicht durchgeführt bzw. nicht möglich:
- **Echtes iPhone / Android / Safari:** Kein Gerät und kein WebKit mit GPU verfügbar. Bildzeiten auf echter Hardware sind nicht gemessen (SwiftShader rendert auf der CPU).
- **Login gegen den echten Server** (KV, Schlüssel): lokal gibt es keine Cloudflare-Umgebung. Der Code ist unverändert, getestet sind nur Öffnen und Darstellung der Formulare.
- **Vergleich mit dem Instagram-Reel:** Das Video liegt in dieser Sitzung nicht vor.
- Taste `gate.mjs`, `consistency.mjs` und `check.mjs` liefen nicht: Sie setzen das Starter-Kit von Taste als Seitengerüst voraus, die bestehende Seite verwendet es nicht.
