import type {
  Adventure,
  Envelope,
  GameLocation,
  InventoryItem,
  Puzzle,
  StoryFragment,
} from "./types";

export const adventure: Adventure = {
  id: "hidden-path",
  title: "Der verborgene Pfad",
  subtitle: "Eine Stadtexpedition durch Köln.",
  description:
    "Eine Stadtexpedition durch Köln, in der reale Fundstücke, digitale Rätsel und verborgene Archive ineinandergreifen.",
  city: "Köln",
  stages: [
    {
      id: "s1",
      number: 1,
      title: "Die Zahlen",
      kind: "Wohnungsrätsel",
      intro:
        "Fünf Zahlen wurden in diesem Raum zurückgelassen. Die sechste gehört zum Ort, an dem die Expedition begonnen hat. Findet alle sechs und achtet auf alles, was ihnen beigefügt wurde.",
      objective:
        "Findet die Zahlen 4, 8, 15, 16, 23 und 42. Untersucht jeden Fund vollständig und ermittelt daraus den Zugangswert.",
      puzzleId: "p-code-1",
      reward: "Zahlensatz",
    },
    {
      id: "s2",
      number: 2,
      title: "Die dritte Dimension",
      kind: "Physisches Geometrierätsel",
      intro:
        "Mehrere transparente Fragmente tragen nur einzelne Linien. Erst am Rheinauhafen wird klar, dass sie nicht getrennt gelesen werden sollen.",
      objective:
        "Bringt die fünf Folien in Deckung, identifiziert den entstehenden geometrischen Körper und gebt seinen Namen ein.",
      locationId: "l1",
      puzzleId: "p-geometry-dodecahedron",
      reward: "Zugang zur dritten Dimension",
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
      objective: "Entschlüssele das Wort aus dem Tagebuch.",
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
    description: "Am südlichen Rheinauhafen stehen die drei markanten Kranhäuser direkt am Fluss.",
    stageId: "s2",
    distance: "1.2 km",
    x: 28,
    y: 62,
    clue: "Wo drei Riesen über das Wasser ragen, zähle die Fenster des zweiten.",
    requireGps: true,
  },
  {
    id: "l2",
    name: "Hohenzollernbrücke",
    lat: 50.9412,
    lng: 6.9694,
    radius: 50,
    description: "Die Hohenzollernbrücke verbindet das Rheinufer mit Deutz.",
    stageId: "s3",
    kind: "envelope",
    envelopeId: "e3",
    distance: "840 m",
    x: 52,
    y: 38,
    clue: "Wo Eisen das Wasser überquert, suche unter dem, was sich nicht mehr bewegt.",
    requireCode: true,
  },
  {
    id: "l3",
    name: "Stadtwald, Eingang Aachener Straße",
    lat: 50.9404,
    lng: 6.8844,
    radius: 80,
    kind: "food",
    description: "Ein Halt am Stadtwald. Die Expedition braucht neue Energie.",
    distance: "3.4 km",
    x: 18,
    y: 22,
    clue: "Am Tor ohne Laterne lässt der Pfad die Straßen hinter sich.",
  },
  {
    id: "l4",
    name: "Kontrollpunkt A — Wasserturm Köln",
    lat: 50.9249,
    lng: 6.9449,
    radius: 40,
    stageId: "s6",
    description: "Der historische Wasserturm an der Kaygasse ist Ausgangspunkt der Vermessung.",
    distance: "2.1 km",
    x: 70,
    y: 68,
    clue: "Zähle deine Schritte ab dem Mittagsschatten des Turms.",
  },
  {
    id: "l5",
    name: "Rheinboulevard Deutz",
    lat: 50.9388,
    lng: 6.9733,
    radius: 30,
    kind: "drink",
    description: "Eine Pause am Rhein. Jede Getränkewahl ist gleichwertig.",
    distance: "Unbekannt",
    x: 84,
    y: 30,
    clue: "Keine Nummer, keine Klingel. Nur ein blank geriebenes Messingschild.",
    requireQr: true,
  },
];

export const puzzles: Puzzle[] = [
  {
    id: "p-minesweeper", type: "minesweeper", title: "Das Minenfeld", tagline: "Nicht jeder Schritt trägt dich weiter.", stageId: "s5",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Eine Zahl zählt die Minen in allen acht angrenzenden Feldern." }],
    config: { grid: 5, mines: [3, 7, 12, 19, 21] },
  },
  {
    id: "p-circuit", type: "circuit", title: "Die Leitung", tagline: "Ein durchgehender Weg bringt Licht ins Dunkel.", stageId: "s6",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Beginne oben links. Jede Verbindung braucht einen Eingang und einen Ausgang." }],
    config: { grid: 4, path: [0, 1, 5, 9, 10, 11, 15] },
  },
  {
    id: "p-mastermind", type: "mastermind", title: "Das Zahlenschloss", tagline: "Vier Stellen. Zehn Möglichkeiten. Kein Zufall.", stageId: "s4",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Ein richtiger Platz zählt anders als eine richtige Zahl am falschen Platz." }],
    config: { secret: "4729", attempts: 10 },
  },
  {
    id: "p-simon", type: "simon", title: "Die Signalfolge", tagline: "Merke dir die Abfolge der Leuchtzeichen.", stageId: "s6",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Beginne jede Runde wieder beim ersten Signal." }],
    config: { sequence: [0, 2, 1, 3, 2] },
  },
  {
    id: "p-morse", type: "morse", title: "Funkspruch", tagline: "Ein kurzes Signal aus Punkten und Strichen.", stageId: "s7",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Drei kurze Signale stehen für S." }],
    config: { code: "··· / ––– / ···", answer: "SOS" },
  },
  {
    id: "p-code-1",
    type: "code",
    title: "Die versiegelte Anweisung",
    tagline: "Sechs Zahlen. Zwei physische Hinweise. Ein Zugangswert.",
    stageId: "s1",
    rewardItemIds: ["i1", "num-4", "num-8", "num-15", "num-16", "num-23", "num-42"],
    hints: [
      {
        id: "h1",
        label: "Hinweis 1",
        text: "Habt ihr wirklich alle sechs Zahlen gefunden und jeden Fund vollständig untersucht?",
      },
      {
        id: "h2",
        label: "Hinweis 2",
        text: "Nicht jede Information befindet sich auf der Vorderseite eines Fundstücks.",
        cost: "video",
        costDescription:
          "Sendet ein kurzes Video, in dem eine volljährige, freiwillig teilnehmende Person einen Schluck aus Flasche 01 nimmt. Ein alkoholfreies Getränk ist jederzeit gleichwertig.",
      },
      {
        id: "h3",
        label: "Letzter Hinweis",
        text: "Zwei der Zahlen enthalten zusätzliche Regeln für die Lösung.",
      },
    ],
    config: {
      code: "1380",
      length: 4,
      kind: "pin",
      label: "Zugangswert eingeben",
      helperText:
        "Die Website gibt euch an dieser Stelle keine Rechenregel vor. Nutzt alle Hinweise, die ihr zusammen mit den Zahlen gefunden habt.",
      submitLabel: "Anweisung prüfen",
      successText: "Sequenz bestätigt",
      errorText: "Der Zugangswert ist noch nicht korrekt",
    },
  },
  {
    id: "p-geometry-dodecahedron",
    type: "geometry",
    title: "Die Projektion",
    tagline: "Fünf Fragmente. Eine Form. Eine Dimension mehr.",
    stageId: "s2",
    rewardItemIds: ["dodecahedron-projection"],
    unlockFeatureIds: ["3d"],
    storyFragmentIds: ["story-03"],
    hints: [
      {
        id: "geo-h1",
        label: "Hinweis 1",
        text: "Die fünf transparenten Fragmente sind keine fünf getrennten Rätsel.",
      },
      {
        id: "geo-h2",
        label: "Hinweis 2",
        text: "Legt die Folien deckungsgleich übereinander. Achtet auf eure Ausrichtungsmarken.",
      },
      {
        id: "geo-h3",
        label: "Letzter Hinweis",
        text: "Der gesuchte Körper besitzt zwölf fünfeckige Flächen.",
      },
    ],
    config: {
      answers: ["DODEKAEDER", "DODECAHEDRON", "PENTAGONDODEKAEDER"],
      prompt: "Welcher geometrische Körper ist entstanden?",
      helperText:
        "Die Lösung befindet sich nicht auf dem Bildschirm. Nutzt die fünf physischen Fragmente, die ihr mit euch tragt.",
      submitLabel: "Körper analysieren",
      errorText: "Geometrische Form nicht erkannt",
      shapeName: "Dodekaeder",
      faces: 12,
      dimension: 3,
      archiveReference: "XII",
    },
  },
  {
    id: "p-wordle",
    type: "wordle",
    title: "Entschlüssele das Wort",
    tagline: "Das Tagebuch enthielt nur ein Wort.",
    stageId: "s4",
    hints: [
      { id: "h1", label: "Hinweis 1", text: "Ein Ort, an dem Wege verschwinden." },
      { id: "h2", label: "Hinweis 2", text: "Es ist ein zusammengesetztes Wort mit zwölf Buchstaben." },
      { id: "h3", label: "Letzter Hinweis", text: "Es endet auf -HAUS." },
    ],
    config: { word: "WAECHTERHAUS", maxAttempts: 8, clue: "Ein Ort, an dem Wege verschwinden." },
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
      table: { "△": "T", "○": "O", "◇": "R" },
      encoded: "△ ○ ◇",
      answer: "TOR",
    },
  },
  {
    id: "p-room",
    type: "room",
    title: "Durchsuche den Raum",
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

export const storyFragments: StoryFragment[] = [
  {
    id: "story-03",
    title: "Notiz 03",
    text:
      "Dasselbe Symbol taucht in den Unterlagen immer wieder auf. Zwölf Flächen. Zwölf Positionen. Zwölf Personen? Ich glaube inzwischen nicht mehr, dass ich nach einer einzelnen Person suche.",
    author: "M.",
    archiveCode: "XII",
    stageId: "s2",
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
    expectedLocation: "Unbekannt",
    contents: "Ein Messingschlüssel in Wachspapier und ein handgezeichneter Grundriss eines einzelnen Zimmers.",
  },
];

export const items: InventoryItem[] = [
  {
    id: "num-4",
    number: 4,
    name: "Zahl 4",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines von sechs massiven Zahlenobjekten aus der Wohnung.",
    detail:
      "Die 4 gehört zum ursprünglichen Zahlensatz: 4 · 8 · 15 · 16 · 23 · 42. Das physische Objekt bleibt Teil der Expedition und muss aufbewahrt werden.",
    physical: true,
    consumable: false,
  },
  {
    id: "num-8",
    number: 8,
    name: "Zahl 8",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines von sechs massiven Zahlenobjekten aus der Wohnung.",
    detail:
      "Die 8 gehört zum ursprünglichen Zahlensatz: 4 · 8 · 15 · 16 · 23 · 42. Auch wenn sie im ersten Rätsel gestrichen wurde, bleibt das physische Objekt wichtig und muss mitgenommen werden.",
    physical: true,
    consumable: false,
  },
  {
    id: "num-15",
    number: 15,
    name: "Zahl 15",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines von sechs massiven Zahlenobjekten aus der Wohnung.",
    detail:
      "Die 15 gehört zum ursprünglichen Zahlensatz: 4 · 8 · 15 · 16 · 23 · 42. Das physische Objekt bleibt Teil der Expedition und muss aufbewahrt werden.",
    physical: true,
    consumable: false,
  },
  {
    id: "num-16",
    number: 16,
    name: "Zahl 16",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines von sechs massiven Zahlenobjekten aus der Wohnung.",
    detail:
      "Die 16 gehört zum ursprünglichen Zahlensatz: 4 · 8 · 15 · 16 · 23 · 42. Auch wenn sie im ersten Rätsel gestrichen wurde, bleibt das physische Objekt wichtig und muss mitgenommen werden.",
    physical: true,
    consumable: false,
  },
  {
    id: "num-23",
    number: 23,
    name: "Zahl 23",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines von sechs massiven Zahlenobjekten aus der Wohnung.",
    detail:
      "Die 23 gehört zum ursprünglichen Zahlensatz: 4 · 8 · 15 · 16 · 23 · 42. Das physische Objekt bleibt Teil der Expedition und muss aufbewahrt werden.",
    physical: true,
    consumable: false,
  },
  {
    id: "num-42",
    number: 42,
    name: "Zahl 42",
    kind: "Umgebungszahl",
    category: "Hinweis",
    foundAtStage: 1,
    description: "Die sechste Zahl der ursprünglichen Folge. Sie wurde nicht als verstecktes Zahlenobjekt gefunden.",
    detail:
      "Die 42 war von Anfang an Teil des Startortes. Sie ergibt sich aus der Hausnummer des Gebäudes, in dem die Expedition begonnen hat.",
    physical: false,
    consumable: false,
  },
  {
    id: "i1",
    number: 1,
    name: "Versiegelte Anweisung",
    kind: "Dokument",
    category: "Dokument",
    foundAtStage: 1,
    description: "Die erste Anweisung der Expedition und der Ausgangspunkt des Zahlenspiels.",
    detail:
      "Die Anweisung fordert dazu auf, alle Zahlen zu finden und jeden Fund vollständig zu untersuchen. Sie bleibt Teil der Expedition und sollte zusammen mit den übrigen Gegenständen aufbewahrt werden.",
    physical: true,
    consumable: false,
  },
  {
    id: "dodecahedron-projection",
    number: 20,
    name: "Dodekaeder-Projektion",
    kind: "Entschlüsseltes Fragment",
    category: "Hinweis",
    foundAtStage: 2,
    description: "Fünf transparente Fragmente ergeben gemeinsam die Projektion eines Dodekaeders.",
    detail:
      "Der Körper besitzt zwölf Flächen. Nach der Identifikation wurde die Archivreferenz XII sichtbar und der Bereich 3D freigeschaltet.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s2",
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
  "KOORDINATEN WERDEN GEPRÜFT …",
  "ENTSCHLÜSSELUNG LÄUFT …",
  "ARCHIVE WERDEN DURCHSUCHT …",
  "ORT WIRD ÜBERPRÜFT …",
  "EXPEDITION WIRD VORBEREITET …",
];

export const stageById = (id: string) => adventure.stages.find((s) => s.id === id);
export const puzzleById = (id: string) => puzzles.find((p) => p.id === id);
export const locationById = (id?: string) =>
  id ? locations.find((l) => l.id === id) : undefined;
export const itemById = (id: string) => items.find((i) => i.id === id);
export const envelopeById = (id?: string) =>
  id ? envelopes.find((e) => e.id === id) : undefined;
export const storyFragmentById = (id: string) =>
  storyFragments.find((fragment) => fragment.id === id);
