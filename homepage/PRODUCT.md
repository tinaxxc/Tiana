# theziffr.

Source: the owner's brief of 22.11.2026 (the "Ultimate Design & Motion Upgrade" brief). No separate interview took place; the brief answers the init questions.

## What it is
One web application for Swiss ambulatory tariffs: recording treatments, TARDOC and ambulatory flat-rate (Pauschalen) rules, checking a session, answering tariff questions, learning (theacademy.) and economic planning (AL ceiling, revenue, cost, scenarios). Tariff years 2026 and 2027.

## Who uses it
Practices and clinics in Switzerland. Doctors, practice managers and billing staff who know TARDOC and want to see the rule behind a hint.

## Surfaces
- Public homepage (`index.html`), before login. Mode: Persuade. Main action: "Zugang anfragen" (contact form); secondary: "Anmelden".
- The application itself (`app.enc`, encrypted, loaded after login). Mode: Operate. Not part of this work.

## Brand
- theziffr. is the only brand. Every module, theacademy. included, has equal rank. No highlighting of individual specialties.
- Signature: the Z mark (three parts: top bar, diagonal, bottom bar), emerald #55756B, with the wordmark.
- Palette: Obsidian #151615, Warm Graphite #242421, Ivory #E7E3DB, secondary text #AAA9A2, lines #393A36, Emerald #54796B, Copper #AD806B. No other brand colours, no all-green look.
- Direction: Swiss precision × editorial luxury × cinematic motion × intelligent technology. Reduced and confident.
- Voice: German (Swiss orthography, no ß), addresses the reader with "du", plain and factual.

## Constraints
- Cloudflare Pages, advanced mode (`_worker.js`). Public files are whitelisted in the worker; the homepage may only use `index.html`, `home3d.js` and the existing media.
- CSP: scripts from 'self' and inline only, no CDNs.
- Login, licence, offline and app-loading code in `index.html` must stay unchanged.
