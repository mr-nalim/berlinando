// ============================================================================
// Claude-Design-Export übernehmen → website/ (fertiges, statisches HTML)
// ----------------------------------------------------------------------------
// Claude Design ist die Quelle für Gestaltung und Texte. Sein Export besteht
// aus Vorlagen (<x-dc>, {{ platzhalter }}, <image-slot>), die erst im Browser
// von React + Babel (geladen von unpkg.com, USA) zusammengebaut würden.
// Dieses Skript macht daraus normale HTML-Seiten in website/:
//   1. ZIP entpacken (Standard: neueste „Berlinando website strategy*.zip"
//      in ~/Downloads)
//   2. Fotos übernehmen — falsch gespeicherte (PNG mit .jpg-Endung) und zu
//      große Bilder werden verkleinert (macOS-Werkzeug `sips`)
//   3. Jede Seite umbauen:
//      - <helmet>-Inhalt → <head>, dazu <title>, lang="pt-BR", Favicon
//      - Google-Fonts-Link raus → selbst gehostete Schriften (assets/fonts.css)
//      - {{ platzhalter }} → Startwerte, onClick/ref/onScroll → entfernt
//      - <image-slot> → normales <img>
//      - React-Logik → assets/site.js (eigenes Vanilla-JS)
//   4. Feste Korrekturen anwenden (werkzeuge/korrekturen.mjs), z. B. den
//      Datenschutztext zum Hosting, solange er in Claude Design noch fehlt
//
// Aufruf (im Repo-Ordner):
//   node werkzeuge/design-uebernehmen.mjs            → neueste ZIP aus Downloads
//   node werkzeuge/design-uebernehmen.mjs <datei.zip>
// Danach: QA mit werkzeuge/qa-vergleich.mjs (siehe .claude/skills/design-uebernehmen)
// ============================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { KORREKTUREN } from './korrekturen.mjs';
import { responsiveBilder } from './bilder-responsive.mjs';
import { seoEinbauen } from './seo.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBSITE = path.join(REPO, 'website');
const ASSETS = path.join(WEBSITE, 'assets');

// Dateien in website/assets, die NICHT aus dem Export kommen (bleiben stehen)
const EIGENE_ASSETS = new Set(['fonts', 'fonts.css', 'site.js', 'favicon.png', 'apple-touch-icon.png']);

// Seitentitel (Browser-Tab & Google). Tourseiten: automatisch aus der <h1>.
const TITEL = {
  'index.html': 'Berlinando · Guia Brasileira em Berlim',
  'passeios.html': 'Passeios privados em Berlim, em português · Berlinando',
  'como-funciona.html': 'Como funcionam os tours e os valores · Berlinando',
  'quem-sou.html': 'Quem sou — guia brasileira em Berlim · Berlinando',
  'catalogo.html': 'Catálogo de tours para agências · Berlinando',
  'informacoes-legais.html': 'Informações legais · Berlinando',
};

// Startwerte der Platzhalter (Zustand „ganz oben, nichts gescrollt").
const STARTWERTE = { heroImgTy: '0', navLogoH: '58', navShade: '0' };

// Fingerabdrücke der React-Logik, die assets/site.js nachbildet (Stand Export 16.09.2026):
// Startseite, Tourseiten (2 Varianten), Katalog, Seiten ohne Logik.
const GEPRUEFTE_LOGIK = new Set(['c3c1b5027a0b', 'e7a211478efe', '025883bb8c79', 'd1c10ac42484', 'da39a3ee5e6b', 'dee2d051686f']);

const MAX_FOTO_KB = 700;  // größere Fotos werden neu komprimiert
const MAX_FOTO_PX = 2600;  // längste Kante (Titelbilder laufen über die ganze Bildschirmbreite)

// Große Fassungen: Liegt hier eine Datei mit demselben Namen wie ein Foto aus dem
// Export, wird sie statt der Export-Fassung verwendet. Claude Design begrenzt
// Fotos beim Export offenbar auf 1600 px – so bleiben die Titelbilder scharf.
const FOTOS_GROSS = path.join(REPO, 'fotos-gross');
const LOGO_BREITE = 720;   // Logo wird max. ~220 px breit angezeigt (×3 für Retina)

// --- 1. ZIP finden & entpacken ----------------------------------------------
function neuesteZip() {
  const dl = path.join(os.homedir(), 'Downloads');
  const kandidaten = fs.readdirSync(dl)
    .filter((d) => /^Berlinando website strategy.*\.zip$/i.test(d))
    .map((d) => ({ d, t: fs.statSync(path.join(dl, d)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (!kandidaten.length) throw new Error('Keine „Berlinando website strategy*.zip" in ~/Downloads gefunden.');
  return path.join(dl, kandidaten[0].d);
}

const zip = process.argv[2] ? path.resolve(process.argv[2]) : neuesteZip();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'berlinando-export-'));
// ditto (macOS) kommt mit Umlauten in Dateinamen klar, unzip nicht immer
try { execFileSync('ditto', ['-x', '-k', zip, tmp]); }
catch { execFileSync('unzip', ['-q', zip, '-d', tmp]); }

const quelle = path.join(tmp, 'site');
if (!fs.existsSync(path.join(quelle, 'index.html'))) {
  throw new Error(`Im Export fehlt site/index.html (${zip}). Ist das der Website-Export?`);
}
console.log(`Export: ${path.basename(zip)}  (${new Date(fs.statSync(zip).mtimeMs).toLocaleString('de-DE')})`);
console.log(`Entpackt nach: ${quelle}\n`);

// --- 2. Alte Export-Dateien entfernen, neue Fotos übernehmen ----------------
for (const d of fs.readdirSync(WEBSITE)) {
  if (d.endsWith('.html')) fs.rmSync(path.join(WEBSITE, d));
}
for (const d of fs.readdirSync(ASSETS)) {
  if (!EIGENE_ASSETS.has(d)) fs.rmSync(path.join(ASSETS, d), { recursive: true });
}

const hatSips = (() => { try { execFileSync('which', ['sips']); return true; } catch { return false; } })();

function bildInfo(datei) {
  const out = execFileSync('sips', ['-g', 'format', '-g', 'pixelWidth', '-g', 'pixelHeight', datei]).toString();
  return {
    format: out.match(/format: (\w+)/)[1],
    breite: Number(out.match(/pixelWidth: (\d+)/)[1]),
    hoehe: Number(out.match(/pixelHeight: (\d+)/)[1]),
  };
}

for (const d of fs.readdirSync(path.join(quelle, 'assets'))) {
  const gross = path.join(FOTOS_GROSS, d);
  const von = fs.existsSync(gross) ? gross : path.join(quelle, 'assets', d);
  const nach = path.join(ASSETS, d);
  fs.copyFileSync(von, nach);
  if (von === gross) console.log(`  Große Fassung verwendet: ${d} (aus fotos-gross/)`);
  if (!hatSips) continue;

  if (/\.jpe?g$/i.test(d)) {
    const info = bildInfo(nach);
    const kb = fs.statSync(nach).size / 1024;
    const zuGross = Math.max(info.breite, info.hoehe) > MAX_FOTO_PX;
    if (info.format !== 'jpeg' || kb > MAX_FOTO_KB || zuGross) {
      const args = ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82'];
      if (zuGross) args.push('-Z', String(MAX_FOTO_PX));
      const zwischen = path.join(tmp, `opt-${d}`);
      execFileSync('sips', [...args, nach, '--out', zwischen], { stdio: 'ignore' });
      // Nur übernehmen, wenn es etwas bringt (falsches Format, zu groß oder wirklich kleiner)
      if (info.format !== 'jpeg' || zuGross || fs.statSync(zwischen).size < fs.statSync(nach).size) {
        fs.renameSync(zwischen, nach);
        console.log(`  Foto optimiert: ${d}  ${Math.round(kb)} KB → ${Math.round(fs.statSync(nach).size / 1024)} KB`);
      } else {
        fs.rmSync(zwischen);
      }
    }
  } else if (/^logo.*\.png$/i.test(d)) {
    if (bildInfo(nach).breite > LOGO_BREITE) {
      execFileSync('sips', ['--resampleWidth', String(LOGO_BREITE), nach], { stdio: 'ignore' });
      console.log(`  Logo verkleinert: ${d}`);
    }
  }
}
if (!hatSips) console.warn('  ⚠ `sips` fehlt (kein macOS?) — Fotos wurden unverändert übernommen.');

// Basis-Stile: Google-Fonts-@import entfernen
fs.mkdirSync(path.join(WEBSITE, 'ds'), { recursive: true });
const ds = fs.readFileSync(path.join(quelle, 'ds', 'styles.css'), 'utf8')
  .replace(/^@import url\(['"]?https:\/\/fonts\.googleapis\.com[^\n]*\n/m, '');
if (/https?:\/\//.test(ds.replace(/\/\*[\s\S]*?\*\//g, ''))) throw new Error('ds/styles.css: externer Link übrig');
fs.writeFileSync(path.join(WEBSITE, 'ds', 'styles.css'), ds);

// --- 3. Seiten umbauen ------------------------------------------------------
function zwischen(text, start, ende) {
  const a = text.indexOf(start);
  const b = text.indexOf(ende, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Marker nicht gefunden: ${start} … ${ende}`);
  return text.slice(a + start.length, b);
}

function titelAusH1(body) {
  const m = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) return 'Berlinando';
  return `${m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()} · Berlinando`;
}

function umbauen(datei, roh) {
  let head = zwischen(roh, '<helmet>', '</helmet>');
  let body = zwischen(roh, '</helmet>', '</x-dc>');

  head = head
    .replace(/\s*<script src="\.\/image-slot\.js"><\/script>/g, '')
    .replace(/\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/g, '')
    // technischer Rest aus dem Claude-Design-Werkzeug, gehört nicht auf die Seite
    .replace(/\s*<meta name="omelette-[^>]*>/g, '');
  if (/https?:\/\//.test(head)) throw new Error(`${datei}: externer Link im Kopf übrig`);
  // Überschriften-Schrift muss eine der selbst gehosteten sein (assets/fonts.css)
  const titelSchrift = head.match(/--font-heading:\s*'([^']+)'/)?.[1];
  if (!['Baloo 2', 'Cormorant Garamond', 'Nunito Sans'].includes(titelSchrift)) {
    throw new Error(`${datei}: Schrift-Variablen fehlen oder Schrift „${titelSchrift}" nicht selbst gehostet — Seite würde falsche Schrift zeigen`);
  }

  body = body
    .replace(/<template id="__bundler_thumbnail">[\s\S]*?<\/template>\s*/g, '')
    .replace(/\s(?:onClick|onScroll|ref)="\{\{\s*\w+\s*\}\}"/g, '')
    .replace(/\sdisabled="\{\{\s*qStart\s*\}\}"/g, ' disabled')
    .replace(/\sdisabled="\{\{\s*qEnd\s*\}\}"/g, '')
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (treffer, name) => {
      if (!(name in STARTWERTE)) {
        throw new Error(`${datei}: neuer Platzhalter {{ ${name} }} — assets/site.js muss erweitert werden`);
      }
      return STARTWERTE[name];
    })
    .replace(/<image-slot\b([^>]*)><\/image-slot>/g, (treffer, attr) => {
      const src = attr.match(/\ssrc="([^"]*)"/)?.[1];
      const ph = attr.match(/\splaceholder="([^"]*)"/)?.[1] ?? '';
      if (!src) throw new Error(`${datei}: Bild-Platzhalter ohne Foto (${ph})`);
      const alt = ph.replace(/^(Foto|Retrato):\s*/i, '');
      return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;max-width:none;object-fit:cover">`;
    });

  if (/\{\{|image-slot|x-dc/.test(body)) throw new Error(`${datei}: Vorlagen-Reste übrig`);

  // Hat sich die Seiten-Logik im Export geändert? Dann muss site.js evtl. mitziehen.
  const logik = roh.match(/data-dc-script>([\s\S]*?)<\/script>/)?.[1] ?? '';
  const abdruck = createHash('sha1').update(logik.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12);
  if (!GEPRUEFTE_LOGIK.has(abdruck)) {
    console.warn(`  ⚠ ${datei}: Logik im Export geändert (${abdruck}) — Verhalten gegen Original prüfen, ggf. assets/site.js anpassen und Abdruck in GEPRUEFTE_LOGIK eintragen`);
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITEL[datei] ?? titelAusH1(body)}</title>
<link rel="icon" href="assets/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="stylesheet" href="assets/fonts.css">
${head.trim()}
<script src="assets/site.js" defer></script>
</head>
<body>
${body.trim()}
</body>
</html>
`;
}

const seiten = fs.readdirSync(quelle).filter((d) => d.endsWith('.html')).sort();
const html = {};
for (const datei of seiten) {
  html[datei] = umbauen(datei, fs.readFileSync(path.join(quelle, datei), 'utf8'));
}

// --- 4. Feste Korrekturen ---------------------------------------------------
for (const k of KORREKTUREN) {
  if (!html[k.datei]) { console.warn(`  ⚠ Korrektur „${k.name}": Seite ${k.datei} fehlt im Export`); continue; }
  if (html[k.datei].includes(k.suche)) {
    html[k.datei] = html[k.datei].replace(k.suche, k.ersetze);
    console.log(`  Korrektur angewendet: ${k.name}`);
  } else {
    console.warn(`  ⚠ Korrektur „${k.name}" nicht angewendet — Text in ${k.datei} hat sich geändert. Bitte prüfen (evtl. schon in Claude Design korrigiert → Korrektur löschen).`);
  }
}

for (const [datei, inhalt] of Object.entries(html)) {
  fs.writeFileSync(path.join(WEBSITE, datei), inhalt);
}
// --- 5. Fotos fürs Handy: passende Größen erzeugen und eintragen ------------
await responsiveBilder(WEBSITE);

// --- 6. SEO: Beschreibung, Teilen-Vorschau, Sitemap -------------------------
await seoEinbauen(WEBSITE);

console.log(`\n✓ ${seiten.length} Seiten nach website/ übernommen.`);
console.log(`Original-Export zum Vergleichen: ${quelle}`);
