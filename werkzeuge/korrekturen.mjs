// ============================================================================
// Feste Korrekturen — werden bei JEDER Übernahme aus Claude Design angewendet
// ----------------------------------------------------------------------------
// Für Texte, die im Repo stimmen müssen, in Claude Design aber (noch) anders
// stehen. `suche` muss exakt so im umgewandelten HTML vorkommen.
// Sobald der Text in Claude Design selbst korrigiert ist, meldet das Skript
// „nicht angewendet" → dann den Eintrag hier löschen.
// ============================================================================

export const KORREKTUREN = [
  {
    name: 'Datenschutz: Hosting (GitHub Pages)',
    datei: 'informacoes-legais.html',
    suche: '<p class="rowp">Wird ergänzt, sobald der Hoster feststeht — hier gehören Angaben zu Server-Logfiles, Cookies und, falls eingesetzt, zur Statistik hin.</p>',
    ersetze:
      '<p class="rowp">Diese Website wird über GitHub Pages ausgeliefert, einen Dienst der GitHub, Inc. (USA, Tochter der Microsoft Corporation). ' +
      'Beim Aufruf verarbeitet GitHub technisch notwendige Daten, insbesondere Ihre IP-Adresse, um die Seiten auszuliefern und den Dienst abzusichern ' +
      '(Art. 6 Abs. 1 lit. f DSGVO). Dabei können Daten in die USA übermittelt werden; GitHub ist nach dem EU-US Data Privacy Framework zertifiziert. ' +
      'Näheres im <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener" class="lnk">Datenschutzhinweis von GitHub</a>.<br><br>' +
      'Diese Website setzt keine Cookies und verwendet keine Statistik- oder Tracking-Werkzeuge. Schriften werden von dieser Website selbst geladen, nicht von Drittanbietern. ' +
      'WhatsApp, Instagram und Facebook sind nur verlinkt: Erst wenn Sie einen dieser Links anklicken, werden Daten an den jeweiligen Anbieter übertragen.</p>',
  },
];
