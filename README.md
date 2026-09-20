# Berlinando — Website

Website von **Marta Rocha**, brasilianische Stadtführerin in Berlin.
Sprache der Seite: Portugiesisch (pt-BR).

## So funktioniert's

```
Claude Design  ──Export (ZIP)──▶  Claude Code  ──git push──▶  GitHub  ──automatisch──▶  Live-Seite
(hier wird gestaltet             („neuer Export liegt          (dieses Repo)            (GitHub Pages)
 und Text geändert)               in Downloads")
```

1. **Gestalten & Texte ändern** — im Claude-Design-Projekt „Berlinando website strategy".
2. **Exportieren** — Projekt als ZIP herunterladen (landet in `Downloads`).
3. **Übernehmen** — in Claude Code (in diesem Ordner) sagen:
   *„Neuer Export liegt in Downloads, bitte übernehmen."*
   Claude wandelt den Export um, prüft jede Seite und zeigt, was sich ändert.
4. **Freigeben** — nach deinem OK wird hochgeladen; 1–2 Minuten später ist es live.

**Wichtig:** Design und Texte **nur in Claude Design** ändern. Direkte Änderungen
in `website/` werden bei der nächsten Übernahme überschrieben.

## Ordner

| Ordner / Datei | Inhalt |
| --- | --- |
| `website/` | **die Website** — genau das, was online geht (fertiges HTML) |
| `website/assets/` | Fotos, Logo, Favicon (das „B" aus Martas Logo), Schriften, `site.js` (Aufklappen, Karussell, Scroll-Effekte) |
| `werkzeuge/design-uebernehmen.mjs` | wandelt einen Claude-Design-Export in `website/` um |
| `fotos-gross/` | große Fassungen einiger Fotos – ersetzen bei jeder Übernahme die kleinere Export-Fassung |
| `werkzeuge/korrekturen.mjs` | Texte, die bei jeder Übernahme fest ersetzt werden (z. B. Datenschutz-Hosting) |
| `werkzeuge/bilder-responsive.mjs` | erzeugt von jedem Foto kleine Fassungen (WebP), damit Handys nicht die Laptop-Größe laden |
| `werkzeuge/seo.mjs` | ergänzt Google-Beschreibung, Teilen-Vorschau (WhatsApp), `sitemap.xml`, `robots.txt` |
| `werkzeuge/seo-texte.mjs` | **die Beschreibungstexte** je Seite — hier ändern, wenn sie anders lauten sollen |
| `werkzeuge/qa-vergleich.mjs` | vergleicht `website/` Seite für Seite mit dem Original-Export |
| `.claude/skills/design-uebernehmen/` | Anleitung für Claude Code |
| `.github/workflows/` | automatisches Veröffentlichen von `website/` |

## Wenn die eigene Domain kommt (berlinando.de)

Die Adresse der Seite steht an **genau einer Stelle**: `SEITE_BASIS` ganz oben in
`werkzeuge/seo.mjs`. Dort auf `https://berlinando.de` ändern, danach einmal
`npm run uebernehmen` — Sitemap, Teilen-Vorschau und die Angaben für Google
stellen sich mit um. (Zusätzlich muss die Domain in den GitHub-Pages-Einstellungen
eingetragen werden.)

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

## Einrichtung auf einem neuen Rechner

```bash
git clone https://github.com/mr-nalim/berlinando.git
cd berlinando
npm install
npx playwright install chromium
```

(Nur für das Übernehmen/Prüfen nötig. Die Website selbst braucht nichts davon.)

Website lokal ansehen: `npm run vorschau` → http://localhost:8000

## Warum wird der Export umgewandelt?

Der Export aus Claude Design ist eine *Bauanleitung*: Beim Aufruf lädt jede Seite
~3 MB Programmcode von einem US-Server (unpkg.com) und Schriften von Google und
baut sich erst dann im Browser zusammen — langsam, schlecht für Google und
datenschutzrechtlich heikel. Die Umwandlung erzeugt daraus fertige Seiten, die
genauso aussehen und sich genauso verhalten, aber **nichts von fremden Servern
laden**. Deshalb braucht die Seite auch kein Cookie-Banner.

Neue externe Einbindungen (Karten, Videos, Statistik, Schriften aus dem Netz) nur
nach Absprache — sonst muss die Datenschutzerklärung angepasst werden.
