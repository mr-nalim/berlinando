---
name: design-uebernehmen
description: Übernimmt einen neuen Export aus Claude Design („Berlinando website strategy*.zip") in website/, prüft ihn gegen das Original und veröffentlicht ihn. Nutzen, wenn jemand sagt „neuer Export liegt in Downloads", „Design übernehmen" oder „Änderungen aus Claude Design live stellen".
---

# Claude-Design-Export übernehmen

Claude Design ist die **Quelle** für Gestaltung und Texte. `website/` ist die daraus
erzeugte, fertige HTML-Version — sie wird bei jeder Übernahme **komplett neu erzeugt**.
Kommunikation mit den Nutzerinnen auf Deutsch, einfach erklärt (keine Fachbegriffe
ohne Erklärung).

## Ablauf

1. **Stand holen:** `git pull`. Gibt es lokale, nicht committete Änderungen in
   `website/`, **stoppen und nachfragen** — sie würden überschrieben.
2. **Einmalig pro Rechner:** Fehlt `node_modules/`, dann `npm install` und
   `npx playwright install chromium`.
3. **Übernehmen:** `npm run uebernehmen` (nimmt die neueste
   `~/Downloads/Berlinando website strategy*.zip`; eine andere Datei:
   `npm run uebernehmen -- <pfad.zip>`). Der Ausgabe den Pfad
   „Original-Export zum Vergleichen" entnehmen.
   - Nenne der Nutzerin Namen + Datum der verwendeten ZIP, damit klar ist, dass
     es die richtige ist.
   - **⚠ „Logik im Export geändert"** → Claude Design hat neue Interaktionen
     eingebaut. `assets/site.js` muss sie nachbilden: React-Logik im Original
     (`<script data-dc-script>`) lesen, in `site.js` umsetzen, dann den neuen
     Abdruck in `GEPRUEFTE_LOGIK` in `werkzeuge/design-uebernehmen.mjs` eintragen.
   - **⚠ „neuer Platzhalter {{ … }}"** → Startwert in `STARTWERTE` ergänzen und
     das Verhalten in `site.js` nachbauen.
   - **⚠ „Korrektur nicht angewendet"** → Text in Claude Design wurde geändert.
     Neue Fassung ansehen; ist sie korrekt, Eintrag in `werkzeuge/korrekturen.mjs`
     löschen, sonst `suche` anpassen.
4. **Prüfen:** `npm run qa -- <Original-Export>/site qa-ergebnis`
   - Jede ✗-Zeile klären und beheben, dann erneut prüfen.
   - **Zusätzlich mit eigenen Augen:** Screenshots der geänderten Seiten
     (`git status` zeigt welche) aus `qa-ergebnis/` ansehen — Desktop **und**
     Handy. Gestalt zuerst (wirkt die Seite stimmig?), dann Details. Große PNGs
     vorher zuschneiden (`convert … -crop`).
5. **Zeigen, was sich ändert:** `git status` + `git diff --stat website/`, in
   einfachen Worten zusammenfassen (welche Seiten, welche Art Änderung).
   Bilder als „neu/ersetzt/entfernt" nennen.
6. **Veröffentlichen — erst nach Zustimmung der Nutzerin:**
   `git add -A && git commit -m "Design-Übernahme: <kurz was>" && git push`.
   GitHub veröffentlicht `website/` danach automatisch (1–2 Minuten, siehe
   Reiter „Actions" im Repo). Anschließend die Live-Seite kurz aufrufen.

## Große Fotos

`fotos-gross/` enthält hochaufgelöste Fassungen einiger Website-Fotos (gleicher
Name, gleicher Bildausschnitt). Die Übernahme nimmt sie automatisch statt der
Export-Fassung, weil Claude Design Fotos auf 1600 px verkleinert. Wird in Claude
Design an einer Stelle das **Motiv** getauscht, die passende Datei dort löschen.

## Regeln

- **Nie** direkt in `website/*.html` Design oder Texte ändern — die nächste
  Übernahme überschreibt das. Dauerhafte Abweichungen gehören in
  `werkzeuge/korrekturen.mjs` (oder besser gleich in Claude Design).
- `website/` lädt **nichts von fremden Servern** (keine Google Fonts, keine CDNs,
  kein Tracking). Das QA-Skript prüft das; eine Meldung dazu ist immer zu beheben.
- Rechtstexte (Impressum/Datenschutz) nicht eigenmächtig umformulieren — Änderungen
  mit den Nutzerinnen abstimmen.
