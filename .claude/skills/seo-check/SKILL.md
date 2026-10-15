---
name: seo-check
description: Monatlicher SEO-Check für berlinando.de — Google Search Console auswerten (lange Suchanfragen per Regex), Indexierung prüfen, Titel/Beschreibungen verbessern und daraus Aufgaben für Claude Design ableiten. Nutzen, wenn jemand sagt „SEO prüfen", „wie läuft die Seite bei Google", „Search Console anschauen" oder „warum finden uns die Leute nicht".
---

# SEO-Check Berlinando

Ziel der Website: brasilianische Berlin-Besucher*innen sollen Marta finden und
über WhatsApp schreiben. Gesucht wird auf **Portugiesisch** („guia brasileira em
Berlim", „tour em português Berlim", „visita guiada Sachsenhausen português").
Kommunikation mit den Nutzerinnen auf Deutsch, einfach erklärt.

## Reihenfolge — das Wichtigste zuerst

1. **Wird die Seite überhaupt gefunden?** (Indexierung)
2. **Google-Unternehmensprofil** — für eine Stadtführerin der stärkste Hebel,
   stärker als jede Textoptimierung. Marta hat ein Profil mit 5,0 Sternen:
   https://maps.app.goo.gl/wQ5y3nbHFzzEezR36
3. **Titel und Beschreibungen** der 17 Seiten (stehen in `werkzeuge/seo-texte.mjs`).
4. **Erst wenn Daten da sind:** die langen Suchanfragen auswerten (siehe unten).

## 1. Indexierung prüfen (ohne Login möglich)

```bash
curl -s https://berlinando.de/sitemap.xml | grep -c "<loc>"   # sollte 17 sein
curl -sI https://berlinando.de/ | head -2                      # 200 = erreichbar
```

Ob Google die Seiten kennt, zeigt die Suche `site:berlinando.de` (im Browser).
Steht dort nichts, ist die Seite noch nicht im Index — dann in der Search Console
die Sitemap einreichen und einzelne Seiten über „URL-Prüfung → Indexierung
beantragen" anstoßen.

## 2. Search Console auswerten (braucht Martas Google-Login)

Adresse: https://search.google.com/search-console (Property `berlinando.de`;
die Verifizierung steckt als `<meta name="google-site-verification">` in jeder
Seite — sie kommt aus Claude Design, also nicht aus den Seiten entfernen).

**Lange Suchanfragen finden** (weniger Konkurrenz, konkretere Absicht):
Leistung → Suchanfragen → Filter „Suchanfrage" → **Benutzerdefiniert (Regex)** →

```
^\S+(\s+\S+){3,}$
```

(= mindestens vier Wörter). Dann oben **„Durchschnittliche Position"** einschalten
und nach Impressionen sortieren. Interessant sind Suchanfragen mit **vielen
Impressionen und Position 5–20**: Dafür kennt Google die Seite schon, sie steht
aber zu weit unten.

**Daraus wird eine Aufgabe für Claude Design:** die Suchformulierung in
Seitentitel, Überschrift (H1) und **erstem Satz** verwenden — in Martas eigener
Sprache, nichts Erfundenes. Gibt es für ein Thema keine passende Seite (z. B.
„visita guiada em português Sachsenhausen"), lieber einen eigenen Abschnitt auf
der passenden Tourseite vorschlagen als eine neue Seite.

**Grenzen, die man kennen sollte:**
- Die Search Console zeigt **nur Google**. Anfragen aus ChatGPT oder Perplexity
  tauchen dort nicht auf.
- Vor etwa drei Monaten Laufzeit sind die Zahlen zu klein für Schlüsse.
  berlinando.de zeigt erst seit **21.09.2026** auf diese Website.

## 3. Titel und Beschreibungen

Stehen in `werkzeuge/seo-texte.mjs` (eine Zeile je Seite) und werden bei jeder
Übernahme eingetragen. Prüfen: Kommt das vor, was Gäste eingeben — „em
português", „guia brasileira", der Tour-Name, „Berlim"? Titel bis ~60 Zeichen,
Beschreibung bis ~155 Zeichen. Änderungen dort direkt möglich, danach
`npm run uebernehmen` — das ist **kein** Design-Eingriff.

## Regeln

- Website-Inhalte (Texte, Überschriften, Bilder) ändert **Claude Design**, nicht
  dieses Repo. Hier entstehen nur Vorschläge + die SEO-Angaben.
- Keine erfundenen Inhalte, keine Keyword-Wiederholungen. Martas Ton bleibt.
- Kein Tracking einbauen (kein Analytics, kein Tag Manager) — die
  Datenschutzerklärung sagt ausdrücklich, dass es keins gibt.
- Ergebnis immer in einfachen Worten zusammenfassen: Was wurde gefunden, was
  ändern wir, was bringt das.
