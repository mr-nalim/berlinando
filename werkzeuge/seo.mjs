// ============================================================================
// SEO: Google-Beschreibung, Teilen-Vorschau (WhatsApp/Instagram), Sitemap
// ----------------------------------------------------------------------------
// Claude Design liefert keine dieser Angaben mit. Dieses Werkzeug ergänzt sie
// beim Übernehmen automatisch in jede fertige Seite:
//
//   • <meta name="description">  → der Text unter dem Treffer bei Google
//   • <link rel="canonical">     → sagt Google, welche Adresse die richtige ist
//   • Open Graph / Twitter       → Bild + Titel + Text, wenn jemand den Link
//                                  per WhatsApp verschickt oder auf Instagram teilt
//   • Vorschaubild               → assets/og-<seite>.jpg, 1200×630, aus dem
//                                  ersten Foto der Seite geschnitten (JPEG, weil
//                                  WhatsApp WebP in der Vorschau oft nicht zeigt)
//   • Strukturierte Daten        → erklärt Google, dass es um eine Stadtführerin
//                                  in Berlin und einzelne Touren geht
//   • sitemap.xml + robots.txt   → Liste aller Seiten für Suchmaschinen
//
// Texte ändern: werkzeuge/seo-texte.mjs
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { BESCHREIBUNGEN, TEILEN_TITEL } from './seo-texte.mjs';

// ⚠ Die Adresse der Website steht NUR hier. Ändert sie sich, reicht diese Zeile
// (danach einmal `npm run uebernehmen`): Sitemap, Teilen-Vorschau, die Angaben
// für Google und die Datei website/CNAME stellen sich mit um.
export const SEITE_BASIS = 'https://berlinando.de';

const NAME = 'Berlinando';
const TELEFON = '+4915785568432';
// Profile wie auf der Seite verlinkt (Fußbereich) — nicht raten, sonst zeigt
// Google auf ein fremdes Konto.
const INSTAGRAM = 'https://www.instagram.com/berlinando_tours/';
const FACEBOOK = 'https://facebook.com/guiaemberlim';
// Preise laut Tabelle auf „Como funciona" (pro Stunde und pro Gruppe).
// Kleinste Gruppe (bis 10 Personen) je Tourdauer — nur als „ab"-Preis.
const AB_PREIS = { '4': 400, '4h30': 450, '6': 600 };
const PREIS_SPANNE = '€100–€140 por hora, por grupo';
const WHATSAPP = `https://wa.me/${TELEFON.replace('+', '')}`;

const OG_BREITE = 1200, OG_HOEHE = 630;

const adresse = (datei) => (datei === 'index.html' ? `${SEITE_BASIS}/` : `${SEITE_BASIS}/${datei}`);
const entschaerfen = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Vorschaubild: erstes Foto der Seite auf 1200×630 beschneiden -----------
async function vorschaubild(website, datei, html) {
  const assets = path.join(website, 'assets');
  // erstes Foto, das kein Logo ist (nach dem Bilder-Schritt zeigt src auf eine WebP-Größe)
  const treffer = [...html.matchAll(/<img\b[^>]*\ssrc="assets\/([^"]+)"/g)]
    .map((m) => m[1]).find((d) => !/^(logo|favicon|apple-touch-icon)/i.test(d));
  if (!treffer || !fs.existsSync(path.join(assets, treffer))) return null;

  const name = `og-${datei.replace(/\.html$/, '')}.jpg`;
  await sharp(path.join(assets, treffer))
    .resize({ width: OG_BREITE, height: OG_HOEHE, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82 })
    .toFile(path.join(assets, name));
  return `assets/${name}`;
}

// --- Strukturierte Daten ----------------------------------------------------
// Liest die Dauer, die auf der Tourseite sichtbar steht („4 horas", „~4h30",
// „6 horas"), und macht daraus den „ab"-Preis aus Martas Tabelle.
function angebot(html) {
  const text = html.replace(/<[^>]+>/g, '\n');
  const m = text.match(/DURAÇÃO E RESERVA\s*\n+\s*~?\s*(4h30|4|6)\s*(?:horas?)?/i);
  const ab = m && AB_PREIS[m[1]];
  if (!ab) return undefined;
  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: ab,
    description: 'Preço por grupo, conforme a duração e o número de pessoas.',
    url: `${SEITE_BASIS}/como-funciona.html#valores`,
  };
}

function strukturierteDaten(datei, titel, beschreibung, bildAdresse, angebotDaten) {
  const anbieter = {
    '@type': 'TravelAgency',
    '@id': `${SEITE_BASIS}/#berlinando`,
    name: NAME,
    url: `${SEITE_BASIS}/`,
    telephone: TELEFON,
    image: bildAdresse,
    areaServed: { '@type': 'City', name: 'Berlin', address: { '@type': 'PostalAddress', addressCountry: 'DE' } },
    availableLanguage: [{ '@type': 'Language', name: 'Portuguese', alternateName: 'pt-BR' }],
    sameAs: [INSTAGRAM, FACEBOOK],
    priceRange: PREIS_SPANNE,
    founder: {
      '@type': 'Person',
      name: 'Marta Ruth Ribeiro Rocha',
      jobTitle: 'Guia de turismo',
      knowsLanguage: ['pt-BR', 'de', 'en'],
    },
  };

  if (datei === 'index.html') return [anbieter];

  if (datei === 'quem-sou.html') {
    return [{
      '@type': 'ProfilePage',
      url: adresse(datei),
      mainEntity: { ...anbieter.founder, description: beschreibung, image: bildAdresse, worksFor: { '@id': anbieter['@id'] } },
    }];
  }

  if (datei.startsWith('tour-')) {
    return [
      {
        '@type': 'TouristTrip',
        name: titel.replace(/ · Berlinando$/, ''),
        description: beschreibung,
        url: adresse(datei),
        image: bildAdresse,
        inLanguage: 'pt-BR',
        touristType: 'Viajantes de língua portuguesa',
        provider: anbieter,
        ...(angebotDaten ? { offers: angebotDaten } : {}),
        itinerary: { '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, item: { '@type': 'City', name: 'Berlin' } }] },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Berlinando', item: `${SEITE_BASIS}/` },
          { '@type': 'ListItem', position: 2, name: 'Passeios', item: `${SEITE_BASIS}/passeios.html` },
          { '@type': 'ListItem', position: 3, name: titel.replace(/ · Berlinando$/, '') },
        ],
      },
    ];
  }

  return [{ '@type': 'WebPage', url: adresse(datei), name: titel, description: beschreibung, isPartOf: { '@id': anbieter['@id'] } }];
}

// --- Hauptarbeit ------------------------------------------------------------
export async function seoEinbauen(website, log = console.log) {
  const seiten = fs.readdirSync(website).filter((d) => d.endsWith('.html')).sort();
  const fehlend = [];

  for (const datei of seiten) {
    const pfad = path.join(website, datei);
    let html = fs.readFileSync(pfad, 'utf8');
    const titel = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? NAME;
    const beschreibung = BESCHREIBUNGEN[datei];
    if (!beschreibung) { fehlend.push(datei); continue; }

    const bild = await vorschaubild(website, datei, html);
    const bildAdresse = bild ? `${SEITE_BASIS}/${bild}` : undefined;
    const teilenTitel = TEILEN_TITEL[datei] ?? titel;

    const daten = { '@context': 'https://schema.org', '@graph': strukturierteDaten(datei, titel, beschreibung, bildAdresse, angebot(html)) };

    const bloecke = [
      `<meta name="description" content="${entschaerfen(beschreibung)}">`,
      `<link rel="canonical" href="${adresse(datei)}">`,
      `<meta property="og:type" content="${datei === 'index.html' ? 'website' : 'article'}">`,
      `<meta property="og:site_name" content="${NAME}">`,
      `<meta property="og:locale" content="pt_BR">`,
      `<meta property="og:title" content="${entschaerfen(teilenTitel)}">`,
      `<meta property="og:description" content="${entschaerfen(beschreibung)}">`,
      `<meta property="og:url" content="${adresse(datei)}">`,
      ...(bildAdresse ? [
        `<meta property="og:image" content="${bildAdresse}">`,
        `<meta property="og:image:width" content="${OG_BREITE}">`,
        `<meta property="og:image:height" content="${OG_HOEHE}">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:image" content="${bildAdresse}">`,
      ] : []),
      `<meta name="twitter:title" content="${entschaerfen(teilenTitel)}">`,
      `<meta name="twitter:description" content="${entschaerfen(beschreibung)}">`,
      `<script type="application/ld+json">${JSON.stringify(daten)}</script>`,
    ];

    html = html.replace('</head>', bloecke.map((b) => `${b}\n`).join('') + '</head>');
    fs.writeFileSync(pfad, html);
  }

  // --- sitemap.xml: Liste aller Seiten für Google ---------------------------
  const heute = new Date().toISOString().slice(0, 10);
  const wichtig = { 'index.html': '1.0', 'passeios.html': '0.9', 'como-funciona.html': '0.8' };
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seiten.map((d) => `  <url>
    <loc>${adresse(d)}</loc>
    <lastmod>${heute}</lastmod>
    <priority>${wichtig[d] ?? (d.startsWith('tour-') ? '0.8' : '0.5')}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(website, 'sitemap.xml'), sitemap);

  // --- robots.txt: alles erlaubt, plus Hinweis auf die Sitemap --------------
  fs.writeFileSync(path.join(website, 'robots.txt'),
    `# Suchmaschinen dürfen die ganze Seite lesen.\nUser-agent: *\nAllow: /\n\nSitemap: ${SEITE_BASIS}/sitemap.xml\n`);

  // --- 404: eigene Fehlerseite statt der nackten GitHub-Seite ---------------
  // Wer sich vertippt oder einem alten Link folgt, soll zurück zu den Touren
  // finden. Bewusst schlicht: nur Schrift und Farben der Website.
  fs.writeFileSync(path.join(website, '404.html'), `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página não encontrada · ${NAME}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/favicon.png" type="image/png">
<link rel="stylesheet" href="/assets/fonts.css">
<style>
  :root { --papel:#FBF7EE; --tinta:#33302B; --terra:#B45B3E; }
  body { margin:0; background:var(--papel); color:var(--tinta);
         font-family:'Nunito Sans', system-ui, sans-serif; line-height:1.6;
         display:flex; min-height:100vh; align-items:center; justify-content:center; padding:28px; }
  main { max-width:520px; }
  img { width:190px; height:auto; margin-bottom:34px; }
  h1 { font-family:'Cormorant Garamond', Georgia, serif; font-weight:500;
       font-size:clamp(30px,6vw,44px); line-height:1.15; margin:0 0 14px; }
  p { margin:0 0 26px; color:color-mix(in srgb, var(--tinta) 78%, transparent); }
  ul { list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:14px 26px; }
  a { color:var(--tinta); text-decoration:none; border-bottom:1px solid var(--terra);
      padding-bottom:3px; transition:color .15s; }
  a:hover, a:focus-visible { color:var(--terra); }
  a:focus-visible { outline:2px solid var(--terra); outline-offset:4px; }
</style>
</head>
<body>
<main>
  <img src="/assets/logo-rose-inkdot.png" alt="${NAME}">
  <h1>Esta página não existe.</h1>
  <p>Talvez o endereço tenha mudado. Você pode continuar por aqui:</p>
  <ul>
    <li><a href="/">Início</a></li>
    <li><a href="/passeios.html">Todos os passeios</a></li>
    <li><a href="/como-funciona.html">Como funciona</a></li>
    <li><a href="${WHATSAPP}">Falar com a Marta</a></li>
  </ul>
</main>
</body>
</html>
`);

  // --- CNAME: sagt GitHub Pages, unter welcher Domain die Seite läuft -------
  fs.writeFileSync(path.join(website, 'CNAME'), `${new URL(SEITE_BASIS).host}\n`);

  log(`  SEO: ${seiten.length - fehlend.length} Seiten mit Beschreibung + Teilen-Vorschau, sitemap.xml, robots.txt, 404.html`);
  if (fehlend.length) log(`  ⚠ Ohne Beschreibungstext (in werkzeuge/seo-texte.mjs ergänzen): ${fehlend.join(', ')}`);
}
