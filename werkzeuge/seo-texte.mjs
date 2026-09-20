// ============================================================================
// SEO-Texte: was Google im Suchergebnis zeigt und was beim Teilen erscheint
// ----------------------------------------------------------------------------
// Für JEDE Seite ein kurzer Beschreibungstext (pt-BR), höchstens ~160 Zeichen.
// Google zeigt ihn unter dem blauen Titel; beim Verschicken per WhatsApp steht
// er unter dem Vorschaubild.
//
// WICHTIG: Die Texte sind aus Martas eigenen Seitentexten zusammengezogen —
// nichts Erfundenes. Wer sie ändert, bleibt bitte bei ihren Formulierungen.
// Die Adresse der Seite steht in SEITE_BASIS (siehe seo.mjs).
// ============================================================================

// Drei Dinge sollen in möglichst vielen Texten vorkommen, weil genau danach
// gesucht wird und weil sie Marta von den Mitbewerbern unterscheiden:
//   „guia brasileira" · „Berlim" · „em português"
// Dazu ihr eigenes Wort „profundidade" statt austauschbarer Werbesprache.
export const BESCHREIBUNGEN = {
  'index.html':
    'Guia brasileira em Berlim: passeios privados de história e cidade, em português. Só você e o seu grupo, sem roteiro engessado, com tempo para profundidade.',
  'passeios.html':
    'Dez passeios privados em Berlim, em português: por temas ou por área da cidade. Você escolhe por onde começar — com guia brasileira, no ritmo do seu grupo.',
  'como-funciona.html':
    'Como funcionam os tours privados em Berlim: 4 a 6 horas, em português, no ritmo do grupo e com profundidade. Valores por hora e por grupo, de forma simples.',
  'quem-sou.html':
    'Marta Ruth Ribeiro Rocha, guia brasileira em Berlim desde 2012: passeios em português, na Alemanha desde 1986 e apaixonada pela cidade desde 1989.',
  'catalogo.html':
    'Dez tours privados em Berlim, guiados em português por guia brasileira — catálogo para agências e operadoras do Brasil e de Portugal.',
  'informacoes-legais.html':
    'Informações legais e política de privacidade do site Berlinando — passeios privados em Berlim com a guia brasileira Marta Rocha.',

  // --- Touren: Untertitel der Seite + wie der Tour abläuft -------------------
  'tour-1-eixo-historico.html':
    'Do Reichstag ao Checkpoint Charlie, a pé: o arco de tensão da história alemã no século XX. Tour privado em Berlim, em português e com profundidade.',
  'tour-2-coracao-da-prussia.html':
    'Do Gendarmenmarkt à Catedral de Berlim: a cidade dos reis, o avesso luminoso do século das catástrofes. Tour privado em português com guia brasileira.',
  'tour-3-eixo-das-3-berlins.html':
    'Berlim em um dia, do Oeste capitalista ao Leste socialista: uma linha reta que conta a história da cidade. Passeio privado em português, no seu ritmo.',
  'tour-4-berlim-ocidental.html':
    'A vitrine do capitalismo, do Jardim Zoológico ao Fórum Cultural: o lado ocidental da Berlim dividida. Guia brasileira, tour privado em português.',
  'tour-5-berlim-oriental.html':
    'A cidade operária que se tornou capital socialista: a Berlim de quem trabalhava, antes e depois do Muro. Tour privado em português, com profundidade.',
  'tour-6-potsdam.html':
    'Potsdam, o refúgio dos reis: da terra eslava ao jardim de Frederico e à divisão da Alemanha. Dia inteiro, tour privado em português a partir de Berlim.',
  'tour-7-sachsenhausen.html':
    'Sachsenhausen, a geometria do terror: o campo-modelo da SS em Oranienburg, visitado por necessidade de compreensão. Em português, saindo de Berlim.',
  'tour-8-guerra-fria.html':
    'A Guerra Fria em Berlim: a guerra que só terminou quando o Muro caiu, do bloqueio ao Checkpoint Charlie. Tour privado em português com guia brasileira.',
  'tour-9-alemanha-nazista.html':
    'A capital do 3º Reich, da chegada ao poder à ruína: o chão de Berlim onde tudo aconteceu. Tour privado em português, com profundidade e sem pressa.',
  'tour-10-berlim-judaica.html':
    'Séculos de presença, e o retorno: a comunidade que ajudou a construir Berlim e quase foi dizimada. Passeio privado em português, com profundidade.',
};

// Seitentitel für die Teilen-Vorschau (kürzer als der Browser-Titel).
// Fehlt hier ein Eintrag, wird der normale Seitentitel genommen.
export const TEILEN_TITEL = {
  'index.html': 'Berlinando — Guia brasileira em Berlim',
};
