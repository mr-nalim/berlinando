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
