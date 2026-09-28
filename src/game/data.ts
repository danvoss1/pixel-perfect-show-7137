import type {
  Adventure,
  Envelope,
  GameLocation,
  InventoryItem,
  Puzzle,
} from "./types";

export const adventure: Adventure = {
  id: "hidden-path",
  title: "The Hidden Path",
  subtitle: "Eine Stadtexpedition durch Köln.",
  description:
    "Acht Etappen führen durch verborgene Winkel Kölns. Umschläge warten an echten Orten; der Rest geschieht hier.",
  city: "Köln",
  stages: [
    {
      id: "s1",
      number: 1,
      title: "Die Nachricht",
      kind: "Einführung",
      intro:
        "Sie kam ohne Absender. Ein einzelnes Blatt, eine Koordinate und die Anweisung, dort zu beginnen, wo das Wasser eine Biegung macht.",
      objective: "Lies die erste Nachricht und bestätige, dass du bereit bist.",
      puzzleId: "p-code-1",
      rewardItemId: "i1",
      reward: "Gefalteter Brief",
    },
    {
      id: "s2",
      number: 2,
      title: "Die erste Spur",
      kind: "Kartenort",
      intro:
        "Die erste Markierung liegt dort, wo die alten Hafenkräne noch immer über den Rhein wachen. Jemand hat ein Zeichen auf den Stein gemalt.",
      objective: "Erreiche die Kranhäuser am Rheinauhafen und bestätige die Markierung.",
      locationId: "l1",
      rewardItemId: "i2",
      reward: "Kreideabdruck",
    },
    {
      id: "s3",
      number: 3,
      title: "Der Umschlag",
      kind: "Physischer Umschlag",
      intro:
        "Unter der dritten Bank, festgeklebt an einer Stelle, an der niemand nachsieht, wartet seit heute Morgen ein Umschlag.",
      objective: "Finde Umschlag Nr. 03 und gib den darin abgedruckten Code ein.",
      locationId: "l2",
      envelopeId: "e3",
      rewardItemId: "i3",
      reward: "Zerrissenes Foto",
    },
    {
      id: "s4",
      number: 4,
      title: "Entschlüsselung",
      kind: "Worträtsel",
      intro:
        "Die Tagebuchseiten sind vom Wasser beschädigt. Nur ein Wort ist erhalten geblieben – es hat zwölf Buchstaben.",
      objective: "Entschlüsselung the word from the journal.",
      requiredItem: "Zerrissenes Foto",
      puzzleId: "p-wordle",
      rewardItemId: "i4",
      reward: "Codefragment A",
    },
    {
      id: "s5",
      number: 5,
      title: "Das Foto",
      kind: "Bildrekonstruktion",
      intro:
        "Das Foto wurde zerschnitten, bevor es versteckt wurde. Wer auch immer das tat, wollte diesen Ort vergessen machen.",
      objective: "Setze das Foto zusammen und lies, was darunter steht.",
      puzzleId: "p-sliding",
      rewardItemId: "i5",
      reward: "Kartenausschnitt",
    },
    {
      id: "s6",
      number: 6,
      title: "Der Pfad",
      kind: "Navigation",
      intro:
        "Ab hier gibt es keine Straßennamen mehr. Nur Himmelsrichtungen und Schritte, wie bei den alten Landvermessern.",
      objective: "Zeichne die Route ab Kontrollpunkt A ein und bestätige sie.",
      puzzleId: "p-route",
      rewardItemId: "i6",
      reward: "Messingschlüssel",
    },
    {
      id: "s7",
      number: 7,
      title: "Der Raum",
      kind: "3D-Raum",
      intro:
        "Die Tür war nicht verschlossen. Drinnen ist alles unverändert – bis auf eine Sache.",
      objective: "Durchsuche den Raum und finde, was nicht hierhergehört.",
      requiredItem: "Messingschlüssel",
      puzzleId: "p-room",
      rewardItemId: "i7",
      reward: "USB-Stick",
    },
    {
      id: "s8",
      number: 8,
      title: "Die Flucht",
      kind: "Letzte Prüfung",
      intro:
        "Die letzte Strecke führt über die Dächer. Bleib in Bewegung, halte die Bahn frei und sieh nicht nach unten.",
      objective: "Erreiche beim letzten Flug 20 Punkte, um die Expedition abzuschließen.",
      puzzleId: "p-flappy",
      rewardItemId: "i8",
      reward: "Expeditionssiegel",
    },
  ],
};

export const locations: GameLocation[] = [
  {
    id: "l1",
    name: "Kranhäuser am Rheinauhafen",
    lat: 50.9282,
    lng: 6.9631,
    radius: 60,
    distance: "1.2 km",
    x: 28,
    y: 62,
    clue: "Wo drei Riesen über das Wasser ragen, zähle die Fenster des zweiten.",
    requireGps: true,
  },
  {
    id: "l2",
    name: "Alte Eisenbahnbrücke",
    lat: 50.9412,
    lng: 6.9694,
    radius: 50,
    distance: "840 m",
    x: 52,
    y: 38,
    clue: "Wo Eisen das Wasser überquert, suche unter dem, was sich nicht mehr bewegt.",
    requireCode: true,
  },
  {
    id: "l3",
    name: "Nordtor des Stadtwalds",
    lat: 50.9271,
    lng: 6.9012,
    radius: 80,
    distance: "3.4 km",
    x: 18,
    y: 22,
    clue: "Am Tor ohne Laterne lässt der Pfad die Straßen hinter sich.",
  },
  {
    id: "l4",
    name: "Kontrollpunkt A — Wasserturm",
    lat: 50.9345,
    lng: 6.9585,
    radius: 40,
    distance: "2.1 km",
    x: 70,
    y: 68,
    clue: "Zähle deine Schritte ab dem Mittagsschatten des Turms.",
  },
  {
    id: "l5",
    name: "Tür ohne Nummer",
    lat: 50.9388,
    lng: 6.9448,
    radius: 30,
    distance: "Unbekannt",
    x: 84,
    y: 30,
    clue: "Keine Nummer, keine Klingel. Nur ein blank geriebenes Messingschild.",
    requireQr: true,
  },
];

export const puzzles: Puzzle[] = [
  {
    id: "p-code-1",
    type: "code",
    title: "Die versiegelte Anweisung",
    tagline: "Vier Ziffern stehen in der Ecke des Briefs.",
    stageId: "s1",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Die Ziffern stehen unten rechts auf dem ersten Brief." },
      { id: "h2", label: "Hinweis 2", text: "Zwei davon wiederholen das Jahr, in dem der Hafen geschlossen wurde." },
      { id: "h3", label: "Letzter Hinweis", text: "Es beginnt mit 4 und endet mit 9." },
    ],
    config: { code: "4729", length: 4, kind: "pin" },
  },
  {
    id: "p-wordle",
    type: "wordle",
    title: "Entschlüsselung The Word",
    tagline: "Das Tagebuch enthielt nur ein Wort.",
    stageId: "s4",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Ein Ort, an dem Wege verschwinden." },
      { id: "h2", label: "Hinweis 2", text: "Es ist ein zusammengesetztes Wort mit zwölf Buchstaben." },
      { id: "h3", label: "Letzter Hinweis", text: "Es endet auf -HAUS." },
    ],
    config: { word: "WÄCHTERHAUS", maxAttempts: 8, clue: "Ein Ort, an dem Wege verschwinden." },
  },
  {
    id: "p-sliding",
    type: "sliding",
    title: "Setze das Bild zusammen",
    tagline: "Jemand hat dieses Foto absichtlich zerschnitten.",
    stageId: "s5",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Löse zuerst die obere Reihe und arbeite dich nach unten vor." },
      { id: "h2", label: "Hinweis 2", text: "Die letzten beiden Teile lassen sich nur über die Ecke tauschen." },
      { id: "h3", label: "Letzter Hinweis", text: "Nutze die Vorschau – sie kostet nur Zeit." },
    ],
    config: { grid: 3, image: "", reveal: "Unter der Brücke, dritter Pfeiler vom Ufer aus." },
  },
  {
    id: "p-route",
    type: "route",
    title: "Zeichne die Route",
    tagline: "Himmelsrichtungen und Schritte, sonst nichts.",
    stageId: "s6",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Der erste Abschnitt führt vom Fluss weg." },
      { id: "h2", label: "Hinweis 2", text: "Die Route hat insgesamt vier Abschnitte." },
      { id: "h3", label: "Letzter Hinweis", text: "Der letzte Abschnitt ist der kürzeste und führt nach Westen." },
    ],
    config: {
      start: "Kontrollpunkt A — Wasserturm",
      steps: [
        { direction: "NORTH", distance: 240 },
        { direction: "EAST", distance: 180 },
        { direction: "SOUTH", distance: 90 },
        { direction: "WEST", distance: 60 },
      ],
    },
  },
  {
    id: "p-symbols",
    type: "symbols",
    title: "Die markierten Steine",
    tagline: "Drei Symbole, flach in die Wand geritzt.",
    stageId: "s6",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Die Tabelle ist vollständig – nichts fehlt." },
      { id: "h2", label: "Hinweis 2", text: "Die Nachricht besteht aus einem Wort." },
      { id: "h3", label: "Letzter Hinweis", text: "Man kann hindurchgehen." },
    ],
    config: {
      table: { "△": "G", "○": "A", "◇": "T", "□": "E" },
      encoded: "□ △ △ ◇ ○",
      answer: "TOR",
    },
  },
  {
    id: "p-room",
    type: "room",
    title: "Search Der Raum",
    tagline: "Etwas gehört hier nicht hin.",
    stageId: "s7",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Beginne mit der Schreibtischschublade links." },
      { id: "h2", label: "Hinweis 2", text: "Die Uhr zeigt absichtlich die falsche Stunde an." },
      { id: "h3", label: "Letzter Hinweis", text: "Sieh hinter der gerahmten Karte nach." },
    ],
    config: {},
  },
  {
    id: "p-flappy",
    type: "flappy",
    title: "Über den Dächern",
    tagline: "Halte die Bahn bis zur anderen Seite frei.",
    stageId: "s8",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Tippe kurz. Langes Drücken befördert dich an die Decke." },
      { id: "h2", label: "Hinweis 2", text: "Ziele auf das untere Drittel jeder Lücke." },
      { id: "h3", label: "Letzter Hinweis", text: "Warte zwischen den Lücken, statt mitten im Flug zu korrigieren." },
    ],
    config: { targetScore: 20, gravity: 0.45, speed: 2.4, gap: 150, icon: "compass" },
  },
];

export const envelopes: Envelope[] = [
  {
    id: "e3",
    number: 3,
    code: "NORDSTERN",
    expectedLocation: "Alte Eisenbahnbrücke",
    contents:
      "Ein gefalteter Kontaktbogen mit einem eingekreisten Bild und einer Bleistiftnotiz: 'Das Foto wurde nicht ohne Grund zerschnitten.'",
  },
  {
    id: "e5",
    number: 5,
    code: "HOLZWEG",
    expectedLocation: "Unknown",
    contents: "Ein Messingschlüssel in Wachspapier und ein handgezeichneter Grundriss eines einzelnen Zimmers.",
  },
];

export const items: InventoryItem[] = [
  {
    id: "i1",
    number: 1,
    name: "Gefalteter Brief",
    kind: "Dokument",
    foundAtStage: 1,
    description: "Die Nachricht, mit der alles begann.",
    detail:
      "Auf einer Schreibmaschine mit beschädigtem 'e' getippt. Unten rechts sind vier schwache Ziffern eingeprägt.",
  },
  {
    id: "i2",
    number: 2,
    name: "Kreideabdruck",
    kind: "Symbol",
    foundAtStage: 2,
    description: "Vom Stein am Hafen abgenommen.",
    detail: "Drei überlappende Dreiecke, das mittlere durchgestrichen. Dasselbe Zeichen ist auf dem Kartenausschnitt.",
  },
  {
    id: "i3",
    number: 3,
    name: "Zerrissenes Foto",
    kind: "Beweisstück",
    foundAtStage: 3,
    description: "Ein halbes Gebäude, eine halbe Person.",
    detail: "Im Winter aufgenommen. Die Fensterrahmen passen zu den Kranhäusern, aber der Himmel nicht zur Jahreszeit.",
  },
  {
    id: "i4",
    number: 4,
    name: "Codefragment A",
    kind: "Codefragment",
    foundAtStage: 4,
    description: "Teil einer längeren Folge.",
    detail: "Darauf steht '47 — ', der Rest fehlt. Es passt zu einem zweiten Fragment, das später gefunden wird.",
  },
  {
    id: "i5",
    number: 5,
    name: "Kartenausschnitt",
    kind: "Karte",
    foundAtStage: 5,
    description: "Ein Viertel eines größeren Vermessungsplans.",
    detail: "Höhenlinien und ein Bleistiftkreuz östlich des Wasserturms. Keine Legende, kein Maßstab.",
  },
  {
    id: "i6",
    number: 6,
    name: "Messingschlüssel",
    kind: "Schlüssel",
    foundAtStage: 6,
    description: "Der Griff ist glatt gerieben.",
    detail: "Auf einer Seite ist '07' eingeprägt. Öffnet eine Tür ohne Nummer.",
  },
  {
    id: "i7",
    number: 7,
    name: "USB-Stick",
    kind: "Seltsamer Gegenstand",
    foundAtStage: 7,
    description: "Hinter einer gerahmten Karte festgeklebt gefunden.",
    detail: "Eine einzelne Datei, datiert zwei Tage vor der Ankunft des Briefs. Sie wurde noch nicht geöffnet.",
  },
  {
    id: "i8",
    number: 8,
    name: "Expeditionssiegel",
    kind: "Belohnung",
    foundAtStage: 8,
    description: "Der Beweis, dass der Pfad begangen wurde.",
    detail: "Dunkelgrünes Wachs mit eingeprägter Windrose. Einmalig nach Abschluss der Expedition vergeben.",
  },
];

export const loadingLines = [
  "KOORDINATEN WERDEN GEPRÜFT...",
  "ENTSCHLÜSSELUNG LÄUFT...",
  "ARCHIVE WERDEN DURCHSUCHT...",
  "ORT WIRD ÜBERPRÜFT...",
  "EXPEDITION WIRD VORBEREITET...",
];

export const stageById = (id: string) => adventure.stages.find((s) => s.id === id);
export const puzzleById = (id: string) => puzzles.find((p) => p.id === id);
export const locationById = (id?: string) =>
  id ? locations.find((l) => l.id === id) : undefined;
export const itemById = (id: string) => items.find((i) => i.id === id);
export const envelopeById = (id?: string) =>
  id ? envelopes.find((e) => e.id === id) : undefined;
