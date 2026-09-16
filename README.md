# Berlinando — Website

Website von **Marta Rocha**, brasilianische Stadtführerin in Berlin.
Sprache der Seite: Portugiesisch (pt-BR).

**Reines HTML/CSS** — kein Build, kein Framework, keine Installation. Die Dateien
werden genau so ausgeliefert, wie sie hier liegen. Zum Ansehen reicht ein
Doppelklick auf `index.html` (für die volle Funktion besser über einen lokalen
Server, siehe unten).

## Seiten

| Datei | Seite |
| --- | --- |
| `index.html` | Startseite |
| `passeios.html` | Übersicht der Touren |
| `como-funciona.html` | Ablauf und Preise |
| `quem-sou.html` | Über Marta |
| `catalogo.html` | Katalog für Agenturen |
| `informacoes-legais.html` | Impressum und Datenschutz |
| `tour-1-…` bis `tour-10-…` | die zehn Tourseiten |

## Ordner

- `assets/` — Fotos, Logo, Favicon
- `assets/fonts/` + `assets/fonts.css` — **selbst gehostete** Schriften (Baloo 2, Nunito Sans, Cormorant Garamond)
- `assets/site.js` — das einzige Skript: Aufklappen, Karussell, Scroll-Effekte, Katalog-Filter
- `ds/styles.css` — Basis-Stile aus Claude Design

## Texte ändern

Der Inhalt steht als Klartext zwischen den HTML-Tags, z. B.

```html
<h1 ...>Guia Brasileira em Berlim</h1>
```

Nur den Text zwischen `>` und `<` ändern, die Tags und `style="…"` in Ruhe lassen.
Kontaktdaten (WhatsApp, E-Mail, Instagram) stehen auf mehreren Seiten — bei
Änderungen **alle Seiten** durchsuchen (in VS Code: `Cmd+Shift+F`).

## Neues Foto

Foto nach `assets/` legen (JPEG, lange Seite max. 1600 px, möglichst unter 400 KB)
und im HTML den Dateinamen im `src="assets/…"` austauschen. Das `alt="…"`
beschreibt das Bild auf Portugiesisch (wichtig für Barrierefreiheit und Google).

## Lokal ansehen

```bash
python3 -m http.server 8000
```

Dann im Browser: http://localhost:8000

## Zusammenarbeiten

`main` ist die veröffentlichte Seite.

1. **Vor dem Arbeiten** die neuesten Änderungen holen (`git pull`).
2. Ändern, ansehen, dann speichern und hochladen (`git commit` + `git push`).
3. Größere Umbauten lieber in einem eigenen Zweig + Pull Request, damit die andere
   Person drüberschauen kann.

Jede Seite ist eine eigene Datei — zwei parallele Änderungen kollidieren fast nie.

## Datenschutz (bitte beibehalten)

Die Seite lädt **nichts von fremden Servern**: keine Google Fonts, kein Google
Analytics, keine Karten-Einbettung, keine Skripte von CDNs. Instagram, Facebook
und WhatsApp sind nur **Links**. Deshalb braucht die Seite kein Cookie-Banner.
Neue externe Einbindungen nur nach Absprache — sonst muss die Datenschutzerklärung
angepasst werden.

## Herkunft

Gestaltet in Claude Design („Berlinando website strategy", Export 16.09.2026) und
anschließend in statisches HTML umgewandelt (ohne React/Babel von unpkg.com und
ohne Google Fonts). Aussehen und Verhalten wurden Seite für Seite gegen den Export
geprüft. **Wichtig:** Ein neuer Export aus Claude Design darf nicht einfach über
diese Dateien kopiert werden — er muss wieder umgewandelt werden.
