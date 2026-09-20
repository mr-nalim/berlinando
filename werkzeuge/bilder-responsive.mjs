// ============================================================================
// Fotos fürs Handy: passende Größen erzeugen (WebP) und in die Seiten eintragen
// ----------------------------------------------------------------------------
// Problem vorher: Jedes Foto lag in EINER großen Fassung (bis 2600 Bildpunkte,
// bis ~1 MB). Ein Handy zeigt dasselbe Foto 328 Punkte breit — und lud trotzdem
// die volle Datei. Auf „passeios" waren das 5,2 MB beim Durchscrollen.
//
// Was dieses Werkzeug macht:
//   1. Es öffnet jede fertige Seite in einem echten Browser, einmal in
//      Handy-Breite (390) und einmal in Laptop-Breite (1440), und MISST, wie
//      breit jedes Foto dort wirklich angezeigt wird.
//   2. Daraus errechnet es, wie viele Bildpunkte das Foto höchstens braucht
//      (angezeigte Breite × 2 für scharfe Retina-Bildschirme) — nie mehr, als
//      das Original hergibt.
//   3. Es erzeugt die nötigen Größen als WebP (modernes Format, etwa halb so
//      groß wie JPEG bei gleichem Aussehen).
//   4. Es trägt sie als `srcset`/`sizes` in die Seiten ein. Der Browser sucht
//      sich dann selbst die passende Größe aus — Handys laden die kleine.
//   5. Nicht mehr benötigte Originalfotos werden aus website/assets entfernt.
//
// Aufgerufen wird das automatisch am Ende von design-uebernehmen.mjs.
// Erzeugte Größen werden in werkzeuge/.bild-cache zwischengespeichert, damit
// eine erneute Übernahme schnell ist (der Ordner darf jederzeit gelöscht werden).
// ============================================================================

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(REPO, 'werkzeuge', '.bild-cache');

// Bildschirmbreiten, in denen gemessen wird
const MESSBREITEN = { handy: 390, laptop: 1440 };
// Für scharfe Darstellung auf Retina-Bildschirmen: angezeigte Breite × 2
const SCHAERFE = 2;
// Angebotene Größen (Bildpunkte). Erzeugt werden nur die wirklich nötigen.
const LEITER = [400, 640, 900, 1200, 1600, 2000, 2600];
const QUALITAET = 78;         // WebP-Qualität; 78 ist optisch verlustfrei genug
const MIN_BREITE = 400;       // kleiner lohnt sich nicht

// Dateien, die NICHT angefasst werden (Logo, Favicon — PNG mit Transparenz)
const AUSNAHMEN = /^(logo|favicon|apple-touch-icon)/i;

const istFoto = (datei) => /\.(jpe?g|webp)$/i.test(datei) && !AUSNAHMEN.test(path.basename(datei));

// --- kleiner Webserver, damit der Browser die Seiten laden kann -------------
const TYPEN = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function server(dir) {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const datei = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!datei.startsWith(dir) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': TYPEN[path.extname(datei)] ?? 'application/octet-stream' });
      fs.createReadStream(datei).pipe(res);
    }).listen(0, () => ok(s));
  });
}

// --- Messen: wie breit wird jedes Foto auf jeder Seite angezeigt? -----------
async function messen(website, seiten) {
  const srv = await server(website);
  const port = srv.address().port;
  const browser = await chromium.launch();
  const messung = {};   // seite → [{ src, handy, laptop }, …] in Reihenfolge der <img> im Quelltext

  for (const [name, breite] of Object.entries(MESSBREITEN)) {
    const page = await browser.newPage({ viewport: { width: breite, height: 900 } });
    for (const seite of seiten) {
      await page.goto(`http://localhost:${port}/${seite}`, { waitUntil: 'load' });
      // Aufklappbares öffnen, damit auch verborgene Fotos eine Breite haben
      await page.evaluate(() => {
        document.querySelectorAll('details').forEach((d) => (d.open = true));
        document.querySelectorAll('input[type=checkbox]').forEach((c) => { if (!c.checked) c.click(); });
      });
      await page.waitForTimeout(250);
      const werte = await page.$$eval('img', (imgs) => imgs.map((i) => ({
        src: i.getAttribute('src'),
        breite: Math.round(i.getBoundingClientRect().width),
      })));
      messung[seite] ??= werte.map((w) => ({ src: w.src }));
      werte.forEach((w, i) => { if (messung[seite][i]) messung[seite][i][name] = w.breite; });
    }
    await page.close();
  }
  await browser.close();
  srv.close();
  return messung;
}

// --- Größen erzeugen (mit Zwischenspeicher) ---------------------------------
async function erzeuge(quelle, breite, ziel) {
  const schluessel = createHash('sha1')
    .update(fs.readFileSync(quelle)).update(`|${breite}|${QUALITAET}`).digest('hex').slice(0, 16);
  const abgelegt = path.join(CACHE, `${schluessel}.webp`);
  if (!fs.existsSync(abgelegt)) {
    fs.mkdirSync(CACHE, { recursive: true });
    await sharp(quelle).resize({ width: breite, withoutEnlargement: true }).webp({ quality: QUALITAET }).toFile(abgelegt);
  }
  fs.copyFileSync(abgelegt, ziel);
  return fs.statSync(ziel).size;
}

export async function responsiveBilder(website, log = console.log) {
  const assets = path.join(website, 'assets');
  const seiten = fs.readdirSync(website).filter((d) => d.endsWith('.html')).sort();
  const messung = await messen(website, seiten);

  // 1. Pro Foto: welche Breite wird höchstens gebraucht?
  const noetig = {};      // dateiname → Bildpunkte
  for (const seite of seiten) {
    for (const m of messung[seite]) {
      const datei = m.src?.replace(/^assets\//, '');
      if (!datei || !istFoto(datei)) continue;
      // Fotos in noch geschlossenen Bereichen (Breite 0): sicherheitshalber volle Breite annehmen
      const handy = m.handy || MESSBREITEN.handy;
      const laptop = m.laptop || MESSBREITEN.laptop;
      const braucht = Math.max(handy, laptop) * SCHAERFE;
      noetig[datei] = Math.max(noetig[datei] ?? 0, Math.ceil(braucht));
    }
  }

  // 2. Größen erzeugen
  const varianten = {};   // dateiname → [{ breite, datei, bytes }]
  let vorher = 0, nachher = 0;
  for (const [datei, braucht] of Object.entries(noetig)) {
    const quelle = path.join(assets, datei);
    if (!fs.existsSync(quelle)) continue;
    const { width: echteBreite } = await sharp(quelle).metadata();
    vorher += fs.statSync(quelle).size;
    const grenze = Math.min(braucht, echteBreite);
    let breiten = LEITER.filter((b) => b <= grenze && b >= MIN_BREITE);
    // größte Stufe ergänzen, wenn die Leiter deutlich darunter bleibt
    if (!breiten.length || breiten.at(-1) < grenze * 0.9) breiten.push(Math.min(grenze, echteBreite));
    breiten = [...new Set(breiten)].sort((a, b) => a - b);

    const basis = datei.replace(/\.(jpe?g|webp)$/i, '');
    varianten[datei] = [];
    for (const b of breiten) {
      const name = `${basis}-${b}.webp`;
      const bytes = await erzeuge(quelle, b, path.join(assets, name));
      varianten[datei].push({ breite: b, datei: `assets/${name}`, bytes });
      nachher += bytes;
    }
  }

  // 3. In die Seiten eintragen
  for (const seite of seiten) {
    let inhalt = fs.readFileSync(path.join(website, seite), 'utf8');
    let nr = -1;
    inhalt = inhalt.replace(/<img\b[^>]*>/g, (tag) => {
      nr++;
      const m = messung[seite][nr];
      const datei = tag.match(/\ssrc="assets\/([^"]+)"/)?.[1];
      if (!datei || !varianten[datei]?.length) return tag;
      const v = varianten[datei];
      const srcset = v.map((x) => `${x.datei} ${x.breite}w`).join(', ');
      // „sizes" in vw, damit es auch auf sehr großen Bildschirmen stimmt
      const vw = (px, fenster) => Math.min(100, Math.ceil((px / fenster) * 100));
      const handy = m?.handy ? vw(m.handy, MESSBREITEN.handy) : 100;
      const laptop = m?.laptop ? vw(m.laptop, MESSBREITEN.laptop) : 100;
      const sizes = `(max-width: 900px) ${handy}vw, ${laptop}vw`;
      return tag
        .replace(/\ssrc="[^"]*"/, ` src="${v.at(-1).datei}"`)
        .replace(/<img/, `<img srcset="${srcset}" sizes="${sizes}"`);
    });
    fs.writeFileSync(path.join(website, seite), inhalt);
  }

  // 4. Nicht mehr verwendete Originalfotos entfernen
  const verwendet = new Set();
  for (const seite of seiten) {
    const inhalt = fs.readFileSync(path.join(website, seite), 'utf8');
    for (const t of inhalt.matchAll(/assets\/([\w.-]+\.(?:jpe?g|png|webp))/gi)) verwendet.add(t[1]);
  }
  let entfernt = 0;
  for (const datei of fs.readdirSync(assets)) {
    if (!istFoto(datei) || verwendet.has(datei)) continue;
    fs.rmSync(path.join(assets, datei));
    entfernt++;
  }

  const kb = (b) => Math.round(b / 1024);
  log(`  Fotos fürs Handy: ${Object.keys(varianten).length} Fotos → ${Object.values(varianten).flat().length} Größen als WebP`);
  log(`  Bilddaten gesamt: ${kb(vorher)} KB → ${kb(nachher)} KB (${entfernt} Originale entfernt)`);
}
