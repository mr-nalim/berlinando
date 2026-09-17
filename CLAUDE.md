# Berlinando – Arbeitsregeln für Claude Code

Website von **Marta Rocha**, brasilianische Stadtführerin in Berlin.
Live: https://mr-nalim.github.io/berlinando/ (später berlinando.de).
Einstieg und Ordnerübersicht: [`README.md`](./README.md).

## Mit wem du sprichst
- Zwei Personen arbeiten hier: Marta (GitHub `guiasemberlim-bot`) und
  `mr-nalim`. Beide sind **keine Entwickler*innen** → einfach erklären,
  Schritt für Schritt, Fachbegriffe übersetzen.
- Antworte in der Sprache, in der du angesprochen wirst (Deutsch oder
  Portugiesisch). Die **Website selbst ist Portugiesisch (pt-BR)**, Anrede „você".

## So läuft die Arbeit
1. **Gestaltung und Texte ändern passiert in Claude Design**
   (Projekt „Berlinando website strategy"), nicht hier.
2. Export als ZIP → landet in `~/Downloads`.
3. Hier übernehmen mit dem Skill **`design-uebernehmen`**
   (`.claude/skills/design-uebernehmen/SKILL.md`) – er wandelt um, prüft
   jede Seite gegen das Original und veröffentlicht erst nach Zustimmung.

## Regeln
- **Immer zuerst `git pull`** – die andere Person hat vielleicht etwas geändert.
- **Nie direkt in `website/*.html` Design oder Texte ändern** – die nächste
  Übernahme überschreibt es. Dauerhafte Abweichungen → `werkzeuge/korrekturen.mjs`.
- **Nichts von fremden Servern laden** (keine Google Fonts, CDNs, Tracking,
  Einbettungen). Sonst stimmt die Datenschutzerklärung nicht mehr.
- **Martas Texte nicht umschreiben**; Impressum/Datenschutz nur nach Absprache ändern.
- Veröffentlichen (`git push` auf `main`) **nur nach ausdrücklichem OK**.
  GitHub stellt `website/` danach automatisch online (1–2 Minuten).
- Bei den Gedenkstätten-Touren (Sachsenhausen, Guerra Fria, Alemanha Nazista,
  Berlim Judaica) keine festliche oder reißerische Sprache.

## Fotos
Das sortierte Fotoarchiv liegt nicht im Repo, sondern bei mr-nalim (bzw. in
Google Drive, Ordner „Berlinando Fotos Webseite"). Neue Fotos kommen über
Claude Design auf die Seite.
