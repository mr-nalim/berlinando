// ============================================================================
// QA: Original-Export aus Claude Design gegen website/ vergleichen
// ----------------------------------------------------------------------------
// Startet beide Versionen auf lokalen Ports und prüft je Seite (Desktop + Handy):
//   - Seitenhöhe identisch?          → sonst ist Layout/Umbruch verrutscht
//   - Anfragen an fremde Server?     → DSGVO: website/ darf KEINE haben
//   - JavaScript-Fehler?
//   - bewegliche Teile (Aufklappen, Karussell, Logo, Filter) → gleiche Messwerte?
// Ganzseitige Screenshots landen im Ausgabe-Ordner (…-orig.png / …-neu.png)
// und sollten zusätzlich mit eigenen Augen angesehen werden.
//
// Einmalig vorher:  npm install && npx playwright install chromium
// Aufruf:           node werkzeuge/qa-vergleich.mjs <export>/site <ausgabe-ordner>
// Der Original-Export braucht Internet (lädt React von unpkg.com).
// ============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { KORREKTUREN } from './korrekturen.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [origDir, aus] = process.argv.slice(2);
if (!origDir || !aus) {
  console.error('Aufruf: node werkzeuge/qa-vergleich.mjs <export>/site <ausgabe-ordner>');
  process.exit(1);
}
fs.mkdirSync(aus, { recursive: true });

const TYPEN = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
const sOrig = await server(path.resolve(origDir));
const sNeu = await server(path.join(REPO, 'website'));
const PORT = { orig: sOrig.address().port, neu: sNeu.address().port };

const seiten = fs.readdirSync(path.join(REPO, 'website')).filter((d) => d.endsWith('.html')).sort();
// Seiten mit festen Korrekturen weichen absichtlich vom Original ab
const KORRIGIERT = new Set(KORREKTUREN.map((k) => k.datei));
const browser = await chromium.launch();
let probleme = 0;
const melde = (text) => { probleme++; console.log('  ✗ ' + text); };

async function laden(page, quelle, seite) {
  await page.goto(`http://localhost:${PORT[quelle]}/${seite}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(quelle === 'orig' ? 2500 : 400);
}

// --- 1. Ganzseiten-Vergleich ------------------------------------------------
console.log('Seiten (Höhe, fremde Server, Fehler):');
for (const [vpName, viewport] of [['desk', { width: 1280, height: 800 }], ['mob', { width: 390, height: 844 }]]) {
  for (const seite of seiten) {
    const hoehe = {};
    for (const quelle of ['orig', 'neu']) {
      const page = await browser.newPage({ viewport });
      const fremd = new Set();
      const fehler = [];
      page.on('request', (r) => { const h = new URL(r.url()).hostname; if (h !== 'localhost') fremd.add(h); });
      page.on('pageerror', (e) => fehler.push(e.message));
      await laden(page, quelle, seite);
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 50)); }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(1000);
      hoehe[quelle] = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.screenshot({ path: path.join(aus, `${seite.replace('.html', '')}-${vpName}-${quelle}.png`), fullPage: true });
      if (quelle === 'neu') {
        if (fremd.size) melde(`${seite} (${vpName}): Anfragen an fremde Server: ${[...fremd].join(', ')}`);
        if (fehler.length) melde(`${seite} (${vpName}): JS-Fehler: ${fehler.join(' | ')}`);
      }
      await page.close();
    }
    if (hoehe.orig !== hoehe.neu && KORRIGIERT.has(seite)) console.log(`  ~ ${seite} (${vpName}) ${hoehe.orig} → ${hoehe.neu} px (feste Korrektur, gewollt — Screenshot ansehen)`);
    else if (hoehe.orig !== hoehe.neu) melde(`${seite} (${vpName}): Höhe ${hoehe.orig} px (Original) ≠ ${hoehe.neu} px (neu)`);
    else console.log(`  ✓ ${seite} (${vpName}) ${hoehe.neu} px`);
  }
}

// --- 2. Bewegliche Teile ----------------------------------------------------
async function messen(quelle) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const w = {};
  const versuch = async (name, fn) => { try { w[name] = await fn(); } catch (e) { w[name] = `FEHLER: ${e.message.split('\n')[0]}`; } };

  await laden(page, quelle, 'index.html');
  await versuch('Logo nach 900 px Scroll', async () => {
    await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(600);
    return page.$eval('#nav-logo', (e) => Math.round(e.getBoundingClientRect().height));
  });
  await versuch('Tour-Gruppe öffnen', async () => {
    await page.click('.gx >> nth=0 >> .grow'); await page.waitForTimeout(900);
    return `${await page.$$eval('.gx.is-open', (e) => e.length)} Gruppe / ${await page.$$eval('.trowx.is-open', (e) => e.length)} Zeile offen`;
  });
  await versuch('Zweite Tour öffnen', async () => {
    await page.click('.trowx >> nth=1 >> .trow'); await page.waitForTimeout(900);
    return page.$$eval('.trowx', (rs) => rs.map((r, i) => (r.classList.contains('is-open') ? i : -1)).filter((i) => i >= 0).join(','));
  });
  await versuch('Karussell weiter', async () => {
    await page.$eval('.qrow', (e) => e.scrollIntoView({ block: 'center' }));
    await page.click('.qbtn >> nth=1'); await page.waitForTimeout(900);
    return `${await page.$eval('.qrow', (e) => e.scrollLeft)} px, zurück aktiv: ${!(await page.$eval('.qbtn', (e) => e.disabled))}`;
  });
  await versuch('Sprung zu Kontakt', async () => {
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.click('nav a.navcta'); await page.waitForTimeout(700);
    return page.$eval('#kontakt', (e) => Math.round(e.getBoundingClientRect().top));
  });

  const tour = seiten.find((s) => s.startsWith('tour-'));
  await laden(page, quelle, tour);
  await versuch(`Akkordeon (${tour})`, async () => {
    await page.click('.acc-btn >> nth=0'); await page.waitForTimeout(800);
    const auf = await page.$eval('.acc >> nth=0 >> .acc-pan', (e) => Math.round(e.getBoundingClientRect().height));
    await page.click('.acc-btn >> nth=0'); await page.waitForTimeout(900);
    const zu = await page.$eval('.acc >> nth=0 >> .acc-pan', (e) => Math.round(e.getBoundingClientRect().height));
    return `auf ${auf} px / zu ${zu} px`;
  });

  await laden(page, quelle, 'catalogo.html');
  await versuch('Katalog-Filter', async () => {
    await page.click('.filter >> nth=1'); await page.waitForTimeout(300);
    return `${await page.$$eval('.card:not(.hidden)', (e) => e.length)} Karten sichtbar`;
  });
  await versuch('Katalog-Details', async () => {
    await page.click('.toggle >> nth=0'); await page.waitForTimeout(300);
    return page.$eval('.toggle', (e) => e.textContent);
  });
  await page.close();
  return w;
}

console.log('\nBewegliche Teile (Original → neu):');
const mo = await messen('orig');
const mn = await messen('neu');
for (const k of Object.keys(mo)) {
  if (mo[k] === mn[k]) console.log(`  ✓ ${k}: ${mn[k]}`);
  else melde(`${k}: ${mo[k]} → ${mn[k]}`);
}

await browser.close();
sOrig.close(); sNeu.close();
console.log(probleme ? `\n${probleme} Abweichung(en) — bitte prüfen.` : '\n✓ Keine Abweichungen. Screenshots trotzdem ansehen:');
console.log(`  ${aus}`);
process.exit(probleme ? 1 : 0);
