# fotos-gross/ – große Fassungen der Website-Fotos

Claude Design verkleinert Fotos beim Export offenbar auf 1600 px. Für Bilder,
die über die ganze Bildschirmbreite laufen, ist das zu wenig.

**So funktioniert es:** Liegt hier eine Datei mit **genau demselben Namen** wie
ein Foto im Claude-Design-Export (z. B. `foto-sachsenhausen.jpg`), nimmt
`werkzeuge/design-uebernehmen.mjs` bei jeder Übernahme diese große Fassung.

**Wichtig:** Nur für das **gleiche Motiv** verwenden. Soll an einer Stelle ein
anderes Foto erscheinen, das in Claude Design tauschen – und die Datei hier
löschen, sonst setzt sich das alte Motiv wieder durch.

Größe: längste Kante max. 2600 px, JPEG. Quelle: Fotoarchiv
„Berlinando Fotos Webseite" (Stand 17.09.2026).

## Stand 21.09.2026 — neu dazugekommen

Aus dem Fotoarchiv (`~/Desktop/Berlinando Fotos Webseite`) in hoher Auflösung
nachgezogen, weil der Claude-Design-Export sie zu klein liefert:

| Datei | Export | hier | Quelle im Archiv |
| --- | --- | --- | --- |
| `foto-t1-marta-quiosque.jpg` | 1800 px | 2600 px | `01 Marta & Gäste/marta-erklaerend-4887px.jpg` |
| `foto-cf-privado.webp` | 1200 px | 2000 px | `01 Marta & Gäste/Portão de Brandenburgo passeio-4928px.jpg` |
| `foto-t7-mid.webp` | 1200 px | 2000 px | `01 Marta & Gäste/gaeste-mit-kameras-ACHTUNG-sachsenhausen-4928px.jpg` |

Gleicher Bildausschnitt wie im Export (automatisch abgeglichen), nur schärfer.

`foto-sachsenhausen.jpg` weicht bewusst ab: unsere Fassung ist 2600 px und
farblich zurückhaltender, der Export liefert nur 657 px. Deshalb steht die
Datei in `MOTIV_BEKANNT` in `werkzeuge/design-uebernehmen.mjs` und löst keine
Warnung mehr aus.
