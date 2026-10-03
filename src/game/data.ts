import type {
  Adventure,
  Envelope,
  GameLocation,
  Hint,
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
        "Findet insgesamt sechs Zahlen. Untersucht jeden Fund vollständig und ermittelt daraus den Zugangswert.",
      puzzleId: "p-code-1",
      reward: "Zahlensatz",
    },
    {
      id: "s2",
      number: 2,
      title: "Der Schlüssel",
      kind: "Physischer Fund · Pantaleonswall",
      intro:
        "Nur knapp ein Jahr dort, aber viele Erlebnisse. Vom verklebten Tisch bis hin zu Chipstüten, die auf dem Boden verteilt lagen. Findet den Ort, an dem Strohhalme regiert haben – den aber noch nicht alle eurer jetzigen Mitspieler gesehen haben. Dort wartet kein digitales Rätsel, sondern ein physischer Gegenstand.",
      objective:
        "Findet den relevanten Gegenstand und merkt euch genau, worin ihr ihn gefunden habt. Beides müsst ihr anschließend bestätigen.",
      rewardItemId: "heart-key",
      reward: "Schlüssel",
    },
    {
      id: "s3",
      number: 3,
      title: "Die dritte Dimension",
      kind: "Physisches Geometrierätsel · Rheinauhafen",
      intro:
        "Fünf transparente Fragmente tragen nur einzelne Linien. Erst am Rheinauhafen wird klar, dass sie nicht getrennt gelesen werden sollen.",
      objective:
        "Öffnet die Karte zur Orientierung und sucht am Rheinauhafen die physische Markierung. Ihr Scan liefert die letzte Anweisung für die fünf Folien und aktiviert die Eingabe des Körpers.",
      locationId: "loc-rheinauhafen",
      puzzleId: "p-geometry-dodecahedron",
      hidePuzzleLink: true,
      requireLocationVisit: false,
      reward: "Zugang zur dritten Dimension",
    },
    {
      id: "s4",
      number: 4,
      title: "Die Archivszene",
      kind: "3D-Rekonstruktion · Heumarkt",
      intro:
        "Die dritte Dimension ist freigeschaltet. Zehn Positionen wurden in einer vergangenen Winterwelt markiert. Nur drei davon gehören zur Spur.",
      objective:
        "Findet die drei richtigen Markierungen, übertragt den Mittelpunkt in die Gegenwart, bergt das Herz und entschlüsselt den nächsten Ort.",
      specialRoute: "/3d",
      specialRouteLabel: "3D-Rekonstruktion öffnen",
      completionMode: "external",
      reward: "Versuch 05",
    },
    {
      id: "s5",
      number: 5,
      title: "Versuch 05",
      kind: "Realer Kontrollpunkt · AI Fitness",
      intro:
        "Der entschlüsselte Versuchsbericht führt in die Weißhausstraße. Dort soll ein physischer Gegenstand für euch hinterlegt sein.",
      objective:
        "Öffnet die Karte zur Orientierung und findet die für euch hinterlassene Flasche.",
      locationId: "loc-ai-fitness",
      requireLocationVisit: false,
      pickupItemId: "meridiano-riserva-xii",
      pickupTitle: "Objekt 05",
      pickupDescription:
        "An diesem Ort wurde etwas für euch hinterlassen. Untersucht nicht nur den Inhalt. Untersucht die Verpackung.",
      reward: "Meridiano · Riserva XII",
    },
    {
      id: "s6",
      number: 6,
      title: "Meridiano",
      kind: "Objekträtsel",
      intro:
        "Die Flasche wirkt wie ein italienisches Produkt. Auf dem Etikett stimmt jedoch etwas mit der Reihenfolge nicht.",
      objective:
        "Ordnet die sechs Begriffe richtig und extrahiert daraus den Namen der nächsten Station.",
      requiredItem: "Meridiano · Riserva XII",
      puzzleId: "p-meridiano",
      completionMode: "external",
      reward: "Totino",
    },
    {
      id: "s7",
      number: 7,
      title: "Versorgungsstation",
      kind: "Checkpoint · Pizzeria Totino",
      intro:
        "TOTINO ist entschlüsselt. Die nächste Station ist eine echte Pause – aber nicht alles, was dort wichtig ist, steht direkt in der Etappenbeschreibung.",
      objective:
        "Geht zu Totino, holt eure Pizza ab und behaltet die physische Rechnung. Falls ihr danach nicht wisst, wie es weitergeht, schaut euch euer Inventar noch einmal genauer an.",
      locationId: "loc-totino",
      puzzleId: "p-totino-qr",
      hidePuzzleLink: true,
      completionMode: "external",
      reward: "Biozentrum freigeschaltet",
    },
    {
      id: "s8",
      number: 8,
      title: "Zurück zum Ursprung",
      kind: "Biozentrum · Universität zu Köln",
      intro:
        "Der QR-Code unter der Pizza verweist direkt auf das Biozentrum. Die physische Rechnung liefert den Zusatz zum Zugang. Am Seiteneingang wartet die nächste Markierung – erst sie aktiviert die genetische Analyse.",
      objective:
        "Geht zum Seiteneingang des Biozentrums und findet dort die physische Markierung. Erst ihr Scan aktiviert die genetische Analyse.",
      locationId: "loc-biozentrum",
      puzzleId: "p-dna-bio",
      hidePuzzleLink: true,
      completionMode: "external",
      reward: "Zülpicher Straße 40",
    },
    {
      id: "s9",
      number: 9,
      title: "Nach der Abgabe",
      kind: "Kiosk · Zülpicher Straße",
      intro:
        "Die DNA-Analyse führt zu dem Ort, an dem damals nach der Abgabe angestoßen wurde.",
      objective:
        "Geht zum Kiosk in der Zülpicher Straße 40 und fragt nach dem für euch hinterlegten Getränk mit Sonderetikett.",
      locationId: "loc-kiosk",
      pickupItemId: "kiosk-beer-label",
      pickupTitle: "Flasche 07",
      pickupDescription:
        "Das Getränk trägt ein eigenes Etikett. Mehrere persönliche Referenzen wirken wie eine Ortsbeschreibung.",
      reward: "Etikett der Erinnerung",
    },
    {
      id: "s10",
      number: 10,
      title: "Etikett der Erinnerung",
      kind: "Persönliches Ortsrätsel",
      intro:
        "Auf dem Sonderetikett treffen Spielplatz, Sport und zwei Erinnerungen aufeinander. Eine davon war offenbar besonders schmerzhaft.",
      objective:
        "Entschlüsselt, welcher Ort auf dem Etikett gemeint ist.",
      requiredItem: "Flasche 07 · Sonderetikett",
      puzzleId: "p-kiosk-label",
      completionMode: "external",
      reward: "Spielplatz am Aachener Weiher",
    },
    {
      id: "s11",
      number: 11,
      title: "Wo Geschichte geschrieben wurde",
      kind: "Uniwiesen · Aachener Weiher",
      intro:
        "Das Etikett führt zu einem Spielplatz im Inneren Grüngürtel. Dort wartet die nächste physische Spur.",
      objective:
        "Öffnet die Karte zum markierten Spielplatz und findet den vorbereiteten Sixpack-Träger mit den Kunstwerken.",
      locationId: "loc-uni-playground",
      pickupItemId: "art-sixpack",
      pickupTitle: "Archivträger 08",
      pickupDescription:
        "Ein Sixpack-Träger wurde mit sechs Kunstwerken versehen. Die Motive stammen aus sehr unterschiedlichen Jahrhunderten.",
      reward: "Kunstarchiv",
    },
    {
      id: "s12",
      number: 12,
      title: "Kunstgeschichte",
      kind: "Kunstarchiv · Katalogisierung",
      intro:
        "Sechs Werke wurden aus ihren Datensätzen gelöst. Künstler, Entstehungszeit und Archivordnung müssen rekonstruiert werden, bevor die verborgene Sequenz lesbar wird.",
      objective:
        "Ordnet jedem Werk Künstler und Jahr zu, bringt anschließend alle sechs Werke in die richtige Chronologie und entschlüsselt danach die Archivzahlen.",
      requiredItem: "Sixpack · Kunstarchiv",
      puzzleId: "p-art-history",
      completionMode: "external",
      reward: "Richard-Wagner-Straße 55",
    },
    {
      id: "s13",
      number: 13,
      title: "Der Briefkasten",
      kind: "Physischer Fund · Richard-Wagner-Straße",
      intro:
        "Die Kunstchronologie endet an einer Adresse im Komponistenviertel. Im Briefkasten wartet der letzte physische Schlüssel des Pfades.",
      objective:
        "Öffnet die Karte zur Richard-Wagner-Straße 55 und findet die vorbereiteten Spielwürfel.",
      locationId: "loc-richard-wagner",
      pickupItemId: "cocktail-dice",
      pickupTitle: "Der letzte Wurf",
      pickupDescription:
        "Zwei Würfel und ein kurzer Satz: Der letzte Wurf entscheidet nicht, was ihr trinkt, sondern wo.",
      reward: "Spielwürfel",
    },
    {
      id: "s14",
      number: 14,
      title: "Der letzte Wurf",
      kind: "Finales Erinnerungsrätsel",
      intro:
        "Die Würfel erinnern an einen Ort, an dem nicht nur Getränke bestellt, sondern Cocktails dem Zufall überlassen wurden.",
      objective:
        "Findet den Namen des Ortes, an dem dieser Pfad endet.",
      requiredItem: "Spielwürfel",
      puzzleId: "p-final-dice",
      completionMode: "external",
      reward: "Enchilada",
    },
    {
      id: "s15",
      number: 15,
      title: "Der Meridian",
      kind: "Finale · Enchilada",
      intro:
        "Alle Spuren führen zusammen. Das Ziel ist kein weiteres Versteck, sondern der Ort, an dem die Geschichte vollständig wird.",
      objective:
        "Öffnet die Karte zum Enchilada und beendet dort die Expedition. Das endgültige Story-Finale kann später noch ausgetauscht werden.",
      locationId: "loc-enchilada",
      reward: "Expedition abgeschlossen",
    },
  ],
};

export const locations: GameLocation[] = [
  {
    id: "loc-rheinauhafen",
    name: "Rheinauhafen",
    lat: 50.9282,
    lng: 6.9631,
    radius: 60,
    description:
      "Am Rheinauhafen werden die fünf transparenten Fragmente zum ersten Mal gemeinsam lesbar.",
    stageId: "s3",
    distance: "—",
    x: 38,
    y: 67,
    clue: "Ihr habt bereits alles, was ihr braucht. Eine Fläche ist nur der Anfang.",
    requireGps: false,
  },
  {
    id: "loc-ai-fitness",
    name: "all inclusive Fitness Köln Sülz",
    lat: 50.9195,
    lng: 6.93621,
    radius: 25,
    description:
      "Der Ort aus Versuch 05: all inclusive Fitness Köln Sülz, Weißhausstraße 20–22.",
    stageId: "s5",
    distance: "—",
    x: 34,
    y: 79,
    clue: "VERSUCH 05 · BELASTUNG · LOCATION: WEISS · UNIT: 20–22",
    requireGps: false,
  },
  {
    id: "loc-totino",
    name: "Pizzeria Totino",
    lat: 50.91522,
    lng: 6.92773,
    radius: 25,
    kind: "food",
    description: "Pizzeria Totino, Siebengebirgsallee 3, 50939 Köln.",
    stageId: "s7",
    distance: "—",
    x: 29,
    y: 84,
    clue: "Die Versorgungsstation wurde auf dem Etikett identifiziert.",
    requireGps: false,
  },
  {
    id: "loc-biozentrum",
    name: "Biozentrum · Universität zu Köln",
    lat: 50.927692,
    lng: 6.934876,
    radius: 30,
    description: "Biozentrum Köln, Zülpicher Straße 47a/47b, 50674 Köln.",
    stageId: "s8",
    distance: "—",
    x: 25,
    y: 71,
    clue: "Dort, wo BIO nicht nur auf einer Rechnung steht.",
    requireGps: false,
  },
  {
    id: "loc-kiosk",
    name: "24H Kiosk · Zülpicher Straße 40",
    lat: 50.92921,
    lng: 6.93716,
    radius: 25,
    description: "Kiosk, Zülpicher Straße 40, 50674 Köln.",
    stageId: "s9",
    distance: "—",
    x: 28,
    y: 66,
    clue: "Dort wurde nach der Abgabe angestoßen.",
    requireGps: false,
  },
  {
    id: "loc-uni-playground",
    name: "Spielplatz · Uniwiesen / Aachener Weiher",
    lat: 50.9325625,
    lng: 6.9296875,
    radius: 30,
    description:
      "Spielplatz beim Aachener Weiher / Inneren Grüngürtel. Plus Code: WWMH+2V, 50674 Köln.",
    stageId: "s11",
    distance: "—",
    x: 20,
    y: 57,
    clue: "Wo Geschichte geschrieben und Arme zerstört wurden.",
    requireGps: false,
  },
  {
    id: "loc-richard-wagner",
    name: "Richard-Wagner-Straße 55",
    lat: 50.93555,
    lng: 6.9312,
    radius: 30,
    description:
      "Richard-Wagner-Straße 55, 50674 Köln. Die Koordinate ist als editierbare Planungsposition hinterlegt.",
    stageId: "s13",
    distance: "—",
    x: 21,
    y: 47,
    clue: "Die Chronologie der Kunst endet im Komponistenviertel.",
    requireGps: false,
  },
  {
    id: "loc-enchilada",
    name: "Enchilada Köln",
    lat: 50.9408,
    lng: 6.9402,
    radius: 35,
    kind: "food",
    description: "Enchilada Köln, Friesenstraße 80, 50672 Köln.",
    stageId: "s15",
    distance: "—",
    x: 32,
    y: 38,
    clue: "Der letzte Wurf führt zum Finale.",
    requireGps: false,
  },
];

export const heumarktLocationHints: Hint[] = [
  {
    id: "ai-h1",
    label: "Hinweis 1",
    text:
      "Der Name auf dem Band gehört zur Gegenwart. Das Archiv sucht ausdrücklich eine ältere Kennung desselben Ortes.",
  },
  {
    id: "ai-h2",
    label: "Hinweis 2",
    text:
      "Zu jedem Stundenschlag spielte motivierende Musik mit eigener Marke.",
  },
  {
    id: "ai-h3",
    label: "Letzter Hinweis",
    text:
      "Gesucht ist der frühere Name des Studios, unter dem ihr selbst dort wart. Der erste Teil beginnt mit F und endet nach der Revision mit zwei X.",
  },
];

export const heumarktTransition = {
  heartItemId: "heart-key",
  storyFragmentId: "story-heumarkt-04",
  locationRiddleId: "heumarkt-ai-location",
  locationRiddle: {
    title: "Versuch 05 — Belastung",
    protocol: [
      ["SUBJECT", "05"],
      ["CARRIER", "ELASTIC"],
      ["ACTION", "POSE"],
      ["LOAD", "RESISTANCE"],
      ["REVISION", "DOUBLE FINAL"],
      ["CATEGORY", "FITNESS"],
      ["ARCHIVE STATUS", "LEGACY ID"],
      ["LOCATION", "WEISS"],
      ["UNIT", "20–22"],
    ] as const,
    prompt: "Wie lautete die frühere Kennung dieses Ortes?",
    acceptedAnswers: ["FLEXX FITNESS"],
    destinationStageId: "s5",
    destinationLocationId: "loc-ai-fitness",
  },
};

export const puzzles: Puzzle[] = [
  {
    id: "p-code-1",
    type: "code",
    title: "Die versiegelte Anweisung",
    tagline: "Sechs Zahlen. Zwei physische Hinweise. Ein Zugangswert.",
    stageId: "s1",
    storyFragmentIds: ["story-01"],
    rewardItemIds: ["i1", "num-4", "num-8", "num-15", "num-16", "num-23", "num-42"],
    hints: [
      {
        id: "h1",
        label: "Hinweis 1",
        text:
          "Habt ihr wirklich alle sechs Zahlen gefunden? Falls euch diese Zahlenfolge seltsam vertraut vorkommt: Auf einer gewissen Insel war sie schon einmal alles andere als zufällig.",
      },
      {
        id: "h2",
        label: "Hinweis 2",
        text: "Nicht jede Information befindet sich auf der Vorderseite eines Fundstücks.",
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
    stageId: "s3",
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
    id: "p-meridiano",
    type: "ordering",
    title: "Meridiano · Riserva XII",
    tagline: "L'ordine cambia tutto.",
    stageId: "s6",
    storyFragmentIds: ["story-meridiano-05"],
    requiredItemIds: ["meridiano-riserva-xii"],
    rewardItemIds: ["totino-pizza"],
    completeStageOnSolve: true,
    hints: [
      {
        id: "mer-h1",
        label: "Hinweis 1",
        text:
          "Die Website gibt euch die Zutaten absichtlich nicht vor. Alle sechs gesuchten Begriffe stehen auf dem physischen Rücketikett der Flasche.",
      },
      {
        id: "mer-h2",
        label: "Hinweis 2",
        text:
          "Übertragt jeden Begriff genau einmal. Erst danach beginnt das eigentliche Sortieren.",
      },
      {
        id: "mer-h3",
        label: "Letzter Hinweis",
        text:
          "Wenn die sechs Begriffe richtig angeordnet sind, ergeben ihre Anfangsbuchstaben den Namen des nächsten Ortes.",
      },
    ],
    config: {
      items: [
        { id: "nocciola", text: "Nocciola", order: 5 },
        { id: "timo", text: "Timo", order: 3 },
        { id: "origano", text: "Origano", order: 6 },
        { id: "tartufo", text: "Tartufo", order: 1 },
        { id: "iris", text: "Iris", order: 4 },
        { id: "oliva", text: "Oliva", order: 2 },
      ],
      extraction: "first-letter",
      answer: "TOTINO",
      manualEntry: true,
      entryInstruction:
        "Untersucht die Flasche. Übertragt die sechs ungewöhnlichen Zutaten vom Rücketikett selbst in die Felder. Reihenfolge ist in diesem Schritt noch egal.",
      instruction:
        "Alle sechs Zutaten wurden erfasst. Ordnet sie nun selbst so an, dass aus ihren Anfangsbuchstaben eine sinnvolle nächste Station entsteht.",
      successTitle: "Versorgungsstation identifiziert",
    },
  },

  {
    id: "p-totino-qr",
    type: "reveal",
    title: "Übertragung 06",
    tagline: "Unter der Pizza beginnt die nächste Spur.",
    stageId: "s7",
    requiredItemIds: ["totino-pizza"],
    rewardItemIds: ["totino-receipt"],
    storyFragmentIds: ["story-totino-06"],
    completeStageOnSolve: true,
    hints: [],
    config: {
      eyebrow: "QR · Übertragung 06",
      body: [
        "Die Markierung unter der Pizza bestätigt den nächsten Zielort: BIOZENTRUM · UNIVERSITÄT ZU KÖLN.",
        "Die physische Rechnung gehört weiterhin zur Spur. Ein Zusatz auf ihr verrät, welchen Zugang ihr am Gebäude suchen müsst.",
        "Am richtigen Eingang wartet eine weitere Markierung. Erst ihr Scan öffnet die genetische Analyse.",
      ],
      confirmLabel: "Biozentrum übernehmen",
      successText: "Biozentrum als nächste Etappe freigeschaltet.",
    },
  },
  {
    id: "p-dna-bio",
    type: "dna",
    title: "COI · Probe ZUE-07",
    tagline: "Ein Read ist kein Befund.",
    stageId: "s8",
    storyFragmentIds: ["story-bio-07"],
    completeStageOnSolve: true,
    hints: [
      {
        id: "dna-h1",
        label: "Hinweis 1 · Qualitätskontrolle",
        text:
          "Bewertet jeden Read getrennt gegen beide Grenzwerte. Ein verworfener Read kann gleichzeitig mehr als ein Qualitätsproblem haben.",
      },
      {
        id: "dna-h2",
        label: "Hinweis 2 · Reverse Read",
        text:
          "Für ein direktes Alignment müssen beide Sequenzen in derselben 5′→3′-Orientierung vorliegen. Beim Reverse-Read sind deshalb Reihenfolge und Basenpaarung relevant.",
      },
      {
        id: "dna-h3",
        label: "Hinweis 3 · Assembly",
        text:
          "Verschiebt den Reverse-Read so, dass die längste sinnvolle Überlappung entsteht. Eine ambige Base im Forward-Read darf im finalen Konsensus nicht als N stehen bleiben.",
      },
      {
        id: "dna-h4",
        label: "Letzter Hinweis · Taxonomie",
        text:
          "Die Positionsangaben sind 1-basiert. Extrahiert die sechs Basen aus eurem Konsensus und sucht anschließend die eine Referenzzeile, die an allen sechs Stellen übereinstimmt.",
      },
    ],
    config: {
      caseId: "COI-ZUE-07",
      marker: "mtDNA COI · Barcode-Fragment",
      specimen: "Arthropoda · unbekannte Laborprobe",
      intro:
        "Vier Sequenzreads wurden aus derselben Barcoding-Serie exportiert. Eure Aufgabe ist es, aus den Rohdaten eine belastbare Konsensussequenz zu rekonstruieren und sie anschließend einer Referenzlinie zuzuordnen.",
      qualityThreshold: {
        minMeanQ: 25,
        maxAmbiguousPercent: 5,
      },
      reads: [
        {
          id: "FWD-01",
          label: "FWD-01",
          direction: "forward",
          sequence: "ATGGCTTTTGGATTTGGTTATGGAGCNGGATT",
          meanQ: 34,
          ambiguousPercent: 3.1,
          note: "Forward read · eine ambige Position im Überlappungsbereich",
        },
        {
          id: "REV-02",
          label: "REV-02",
          direction: "reverse",
          sequence: "TCCAAAAGCTGGAACTAATCCAGCTCCATAAC",
          meanQ: 32,
          ambiguousPercent: 0,
          note: "Reverse read · 5′→3′ wie vom Sequencer exportiert",
        },
        {
          id: "FWD-03",
          label: "FWD-03",
          direction: "forward",
          sequence: "NNNGCTNTTGGANNTGGNTANNGAGCNNNNAT",
          meanQ: 16,
          ambiguousPercent: 21.9,
          note: "Schwaches Signal / Peaküberlagerung",
        },
        {
          id: "FWD-04",
          label: "FWD-04",
          direction: "forward",
          sequence: "ATGGCTTTTGGATTTGGTTATGGAGCTGGATT",
          meanQ: 29,
          ambiguousPercent: 0,
          note: "Technische Wiederholung des Forward-Bereichs",
        },
      ],
      discardReadId: "FWD-03",

      forwardReadId: "FWD-01",
      reverseReadId: "REV-02",
      reverseOptions: [
        {
          id: "rev-only",
          label: "Nur Reihenfolge umkehren",
          sequence: "CAATACCTCGACCTAATCAAGGTCGAAAACCT",
        },
        {
          id: "complement-only",
          label: "Nur komplementieren",
          sequence: "AGGTTTTCGACCTTGATTAGGTCGAGGTATTG",
        },
        {
          id: "reverse-complement",
          label: "Reverse Complement",
          sequence: "GTTATGGAGCTGGATTAGTTCCAGCTTTTGGA",
        },
        {
          id: "forward-copy",
          label: "Forward-Sequenz übernehmen",
          sequence: "ATGGCTTTTGGATTTGGTTATGGAGCTGGATT",
        },
      ],
      correctReverseOptionId: "reverse-complement",

      overlapOffsets: [12, 14, 16, 18],
      correctOverlapOffset: 16,
      ambiguousConsensusPosition: 27,
      ambiguousConsensusBase: "T",
      consensusSequence: "ATGGCTTTTGGATTTGGTTATGGAGCTGGATTAGTTCCAGCTTTTGGA",

      diagnosticPositions: [10, 18, 24, 31, 40, 45],
      references: [
        {
          id: "ref-a",
          name: "Morphospezies A",
          diagnosticBases: {
            "10": "G",
            "18": "C",
            "24": "A",
            "31": "T",
            "40": "G",
            "45": "T",
          },
          note: "Referenzcluster A · COI Archiv",
        },
        {
          id: "ref-b",
          name: "Morphospezies B",
          diagnosticBases: {
            "10": "A",
            "18": "T",
            "24": "C",
            "31": "T",
            "40": "G",
            "45": "C",
          },
          note: "Referenzcluster B · COI Archiv",
        },
        {
          id: "ref-c",
          name: "Morphospezies C",
          diagnosticBases: {
            "10": "G",
            "18": "T",
            "24": "A",
            "31": "T",
            "40": "G",
            "45": "T",
          },
          note: "Referenzcluster C · COI Archiv",
        },
        {
          id: "ref-d",
          name: "Morphospezies D",
          diagnosticBases: {
            "10": "G",
            "18": "G",
            "24": "A",
            "31": "A",
            "40": "C",
            "45": "T",
          },
          note: "Referenzcluster D · COI Archiv",
        },
      ],
      correctReferenceId: "ref-c",

      specimenLabel: "ZUE-LP40",
      revealText: "ZÜLPICHER STRASSE 40",
      successTitle: "Taxonomische Zuordnung abgeschlossen",
    },
  },
  {
    id: "p-kiosk-label",
    type: "code",
    title: "Etikett der Erinnerung",
    tagline: "Wo Geschichte geschrieben und Arme zerstört wurden.",
    stageId: "s10",
    storyFragmentIds: ["story-kiosk-08"],
    requiredItemIds: ["kiosk-beer-label"],
    completeStageOnSolve: true,
    hints: [
      { id: "kiosk-label-h1", label: "Hinweis 1", text: "Die Symbole auf der Flasche beschreiben keinen neuen Laden." },
      { id: "kiosk-label-h2", label: "Hinweis 2", text: "Spielplatz + Sport + eure gemeinsame Erinnerung sind gemeinsam der Ortshinweis." },
      { id: "kiosk-label-h3", label: "Letzter Hinweis", text: "Gesucht ist ein Spielplatz bei den Uniwiesen / am Aachener Weiher." },
    ],
    config: {
      code: "SPIELPLATZ",
      length: 10,
      kind: "word",
      label: "Was für ein Ort ist gemeint?",
      helperText:
        "Das Sonderetikett enthält persönliche Referenzen. Die genaue Position wird nach der richtigen Antwort auf der Karte freigeschaltet.",
      submitLabel: "Etikett entschlüsseln",
      successText: "Spielplatz WWMH+2V identifiziert",
      errorText: "Diese Erinnerung führt noch nicht zum richtigen Ort",
    },
  },
  {
    id: "p-art-history",
    type: "art",
    title: "Archiv der verlorenen Meister",
    tagline: "Sechs Werke. Sechs Zeiten. Eine Spur.",
    stageId: "s12",
    requiredItemIds: ["art-sixpack"],
    storyFragmentIds: ["story-uni-08"],
    completeStageOnSolve: true,
    hints: [
      {
        id: "art-h1",
        label: "Hinweis 1 · Katalogisierung",
        text:
          "Die sechs Bilder gehören zu unterschiedlichen Künstlern und Entstehungszeiten. Ordnet zuerst jedem Werk den passenden Künstler und das passende Jahr zu.",
      },
      {
        id: "art-h2",
        label: "Hinweis 2 · Chronologie",
        text:
          "Zwei Werke liegen im 17. Jahrhundert nah beieinander. Die Renaissance steht am Anfang, die Moderne am Ende.",
      },
      {
        id: "art-h3",
        label: "Hinweis 3 · Übersetzung",
        text:
          "Nicht Morse Code oder Blindenschrift. Übersetzt werden muss es trotzdem. Zuerst müsst ihr die sechs kleinen Archivzahlen vom Karton in der richtigen Reihenfolge übertragen.",
      },
      {
        id: "art-h4",
        label: "Letzter Hinweis",
        text:
          "Nehmt die Archivzahlen in der richtigen zeitlichen Reihenfolge. Das einfachste Alphabet beginnt bei A = 1.",
      },
    ],
    config: {
      works: [
        {
          id: "venus",
          label: "Werk A",
          title: "Die Geburt der Venus",
          artist: "Sandro Botticelli",
          yearLabel: "ca. 1485",
          yearOrder: 1485,
          archiveNumber: 23,
        },
        {
          id: "mona",
          label: "Werk B",
          title: "Mona Lisa",
          artist: "Leonardo da Vinci",
          yearLabel: "ca. 1503",
          yearOrder: 1503,
          archiveNumber: 1,
        },
        {
          id: "meninas",
          label: "Werk C",
          title: "Las Meninas",
          artist: "Diego Velázquez",
          yearLabel: "1656",
          yearOrder: 1656,
          archiveNumber: 7,
        },
        {
          id: "pearl",
          label: "Werk D",
          title: "Das Mädchen mit dem Perlenohrring",
          artist: "Johannes Vermeer",
          yearLabel: "ca. 1665",
          yearOrder: 1665,
          archiveNumber: 14,
        },
        {
          id: "starry",
          label: "Werk E",
          title: "Die Sternennacht",
          artist: "Vincent van Gogh",
          yearLabel: "1889",
          yearOrder: 1889,
          archiveNumber: 5,
        },
        {
          id: "guernica",
          label: "Werk F",
          title: "Guernica",
          artist: "Pablo Picasso",
          yearLabel: "1937",
          yearOrder: 1937,
          archiveNumber: 18,
          finalMarker: "55",
        },
      ],
      artistOptions: [
        "Johannes Vermeer",
        "Vincent van Gogh",
        "Sandro Botticelli",
        "Pablo Picasso",
        "Leonardo da Vinci",
        "Diego Velázquez",
      ],
      yearOptions: [
        "1937",
        "ca. 1665",
        "1889",
        "ca. 1503",
        "1656",
        "ca. 1485",
      ],
      instruction:
        "Auf dem Sixpack-Kunstträger seht ihr sechs Werke ohne Künstlernamen und Jahreszahl. Ordnet jedem Werk den richtigen Künstler und die richtige Entstehungszeit zu. Erst die komplette Katalogisierung wird geprüft.",
      chronologyInstruction:
        "Alle Datensätze sind identifiziert. Bringt die sechs Werke jetzt vom ältesten zum jüngsten in die richtige Reihenfolge. Die kleinen Archivzahlen auf dem physischen Karton werden erst danach relevant.",
      decodeInstruction:
        "Die Chronologie steht. Übertragt nun selbst die kleinen Archivzahlen von den sechs Kunstwerken in die rekonstruierte Reihenfolge. Erst eine korrekt erfasste Sequenz kann übersetzt werden.",
      decodeHint:
        "Nicht Morse Code oder Blindenschrift. Übersetzt werden muss es trotzdem.",
      decodeAnswer: "WAGNER",
      finalMarkerPrompt:
        "Der Name allein reicht noch nicht. Auf dem letzten Werk der korrekten Chronologie befindet sich unten rechts eine zusätzliche kleine Zahl. Gebt sie ein.",
      finalMarkerAnswer: "55",
      finalDestination: "RICHARD-WAGNER-STRASSE 55",
      successTitle: "Archivsequenz vollständig rekonstruiert",
    },
  },
  {
    id: "p-final-dice",
    type: "code",
    title: "Der letzte Wurf",
    tagline: "Der Wurf entscheidet nicht, was ihr trinkt, sondern wo.",
    stageId: "s14",
    requiredItemIds: ["cocktail-dice"],
    storyFragmentIds: ["story-richard-09"],
    completeStageOnSolve: true,
    hints: [
      { id: "dice-h1", label: "Hinweis 1", text: "Denkt nicht an Monopoly oder Mensch ärgere dich nicht." },
      { id: "dice-h2", label: "Hinweis 2", text: "Die Würfel erinnern an eine gemeinsame Art, Cocktails auszuwählen." },
      { id: "dice-h3", label: "Letzter Hinweis", text: "Gesucht ist das mexikanische Restaurant in der Friesenstraße." },
    ],
    config: {
      code: "ENCHILADA",
      length: 9,
      kind: "word",
      label: "Wo endet der Pfad?",
      helperText:
        "Die beiden Spielwürfel sind kein Zahlencode. Sie sind eine Erinnerung an einen Ort.",
      submitLabel: "Letztes Ziel prüfen",
      successText: "Finale identifiziert",
      errorText: "Der letzte Wurf zeigt noch nicht an diesen Ort",
    },
  },

  // Demo-/Werkzeugrätsel bleiben für den Adminbereich erhalten, sind aber keiner aktiven Etappe zugeordnet.
  {
    id: "p-wordle-demo",
    type: "wordle",
    title: "Demo · Worträtsel",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { word: "WAECHTERHAUS", maxAttempts: 8, clue: "Demo" },
  },
  {
    id: "p-sliding-demo",
    type: "sliding",
    title: "Demo · Schiebepuzzle",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { grid: 3, image: "", reveal: "Demo" },
  },
  {
    id: "p-flappy-demo",
    type: "flappy",
    title: "Demo · Flugspiel",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { targetScore: 20, gravity: 0.45, speed: 2.4, gap: 150, icon: "compass" },
  },
  {
    id: "p-mastermind-demo",
    type: "mastermind",
    title: "Demo · Codeknacker",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { secret: "4729", attempts: 10 },
  },
  {
    id: "p-simon-demo",
    type: "simon",
    title: "Demo · Signalfolge",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { sequence: [0, 2, 1, 3, 2] },
  },
  {
    id: "p-morse-demo",
    type: "morse",
    title: "Demo · Morse",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { code: "··· / ––– / ···", answer: "SOS" },
  },
  {
    id: "p-minesweeper-demo",
    type: "minesweeper",
    title: "Demo · Minenfeld",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { grid: 5, mines: [3, 7, 12, 19, 21] },
  },
  {
    id: "p-circuit-demo",
    type: "circuit",
    title: "Demo · Schaltkreis",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { grid: 4, path: [0, 1, 5, 9, 10, 11, 15] },
  },
  {
    id: "p-route-demo",
    type: "route",
    title: "Demo · Route",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: {
      start: "Demo",
      steps: [
        { direction: "NORTH", distance: 240 },
        { direction: "EAST", distance: 180 },
      ],
    },
  },
  {
    id: "p-symbols-demo",
    type: "symbols",
    title: "Demo · Symbole",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: { table: { "△": "T", "○": "O", "◇": "R" }, encoded: "△ ○ ◇", answer: "TOR" },
  },
  {
    id: "p-room-demo",
    type: "room",
    title: "Demo · Raum",
    tagline: "Werkzeugvorschau",
    stageId: "demo",
    hints: [{ id: "h1", label: "Hinweis 1", text: "Demo-Hinweis" }],
    config: {},
  },
];

export const storyFragments: StoryFragment[] = [
  {
    id: "story-01",
    title: "Archivstart 01",
    text:
      "Wenn ihr das hier lesen könnt, ist der Pfad aktiv.\n\nIch bin M. Ich habe vor euch versucht, dieses Archiv zu rekonstruieren. Die Dateien nennen es nur LPDP. Ich weiß nicht, wer es begonnen hat — nur, dass es Orte kennt, die für eure Gruppe eine Bedeutung haben sollten.\n\nMeine Aufzeichnungen brechen später ab. Folgt ihnen weiter als ich. Findet heraus, was LPDP ist, warum es euch kennt und wer mit „wir“ gemeint ist.\n\nErste Regel: Nichts wegwerfen. Nichts für Dekoration halten. Orte, Gegenstände und Erinnerungen können später erneut relevant werden.",
    author: "LPDP // Quelle unbekannt",
    archiveCode: "LPDP-01",
    stageId: "s1",
  },
  {
    id: "story-02",
    title: "Fundprotokoll 02",
    text:
      "Der markierte Schlüssel wurde wiedergefunden.\n\nGut.\n\nDamals wurde zu viel aufgehoben und zu wenig beschriftet. Vielleicht war genau das der Anfang dieses Archivs. Bewahrt den Schlüssel auf. Seine Funktion liegt noch vor euch.",
    author: "M.",
    archiveCode: "KEY-02",
    stageId: "s2",
  },
  {
    id: "story-03",
    title: "Notiz 03",
    text:
      "Dasselbe Symbol taucht in den Unterlagen immer wieder auf. Zwölf Flächen. Zwölf Positionen. XII.\n\nIch dachte zuerst, es markiert Orte. Inzwischen glaube ich, es markiert Erinnerungen — Dinge, die nur dann vollständig werden, wenn mehrere Fragmente übereinanderliegen.",
    author: "M.",
    archiveCode: "XII",
    stageId: "s3",
  },
  {
    id: "story-heumarkt-04",
    title: "Notiz 04",
    text:
      "Ich kenne jetzt ihren Namen.\n\nLAS PAJITAS DEL PIJAMA\n\nXII war kein Zufall. Der Dodekaeder war ihre Signatur.\n\nWenn ihr das hier gefunden habt, seid ihr weiter gekommen als wir damals.\n\nUnd genau dieses „wir“ macht mir inzwischen mehr Sorgen als der Meridian.",
    author: "M.",
    archiveCode: "LPDP-XII",
    stageId: "s4",
  },
  {
    id: "story-meridiano-05",
    title: "Versuchsnotiz 05",
    text:
      "Das Archiv kennt Orte nicht so, wie sie heute heißen.\n\nEs speichert sie so, wie wir sie kannten.\n\nNamen ändern sich. Schilder werden ersetzt. Erinnerungen sind hartnäckiger. Wenn ein aktueller Name nicht passt, sucht nach seiner älteren Kennung.",
    author: "M.",
    archiveCode: "LEGACY-05",
    stageId: "s6",
  },
  {
    id: "story-totino-06",
    title: "Übertragung 06",
    text:
      "Manche Koordinaten verschwinden. Manche Namen ändern sich. Geschmack ist erstaunlich zuverlässig.\n\nTOTINO war nie nur Versorgung. Es war ein Übergang zwischen zwei Versionen derselben Geschichte: der abgeschlossenen Arbeit und dem Ort, an dem sie begonnen hatte.",
    author: "M.",
    archiveCode: "BIO-06",
    stageId: "s7",
  },
  {
    id: "story-bio-07",
    title: "Notiz 07",
    text:
      "SUBJECT GROUP: LPDP\nIDENTITY: UNRESOLVED\n\nIdentität ließ sich nicht aus Namen rekonstruieren. Nur aus Spuren.\n\nVielleicht ist das der Fehler, den ich die ganze Zeit mache: Ich suche nach dem Autor, obwohl das Archiv selbst immer wieder auf eine Gruppe zeigt.",
    author: "M.",
    archiveCode: "SEQ-07",
    stageId: "s8",
  },
  {
    id: "story-kiosk-08",
    title: "Erinnerungsrest 08",
    text:
      "2020.\n\nEin Etikett, ein Morgen danach und ein Ort, an dem Geschichten größer wurden, je öfter man sie erzählt hat.\n\nAb hier hört das Archiv auf, neutral zu wirken. Diese Daten wurden nicht gesammelt, weil sie wichtig waren. Sie wurden gesammelt, weil sie euch gehören.",
    author: "M.",
    archiveCode: "MEM-08",
    stageId: "s10",
  },
  {
    id: "story-uni-08",
    title: "Archivnotiz 09",
    text:
      "Sechs Werke. Sechs Zeiten.\n\nIhr habt sie nach ihrer Entstehung geordnet. Menschen funktionieren leider nicht so sauber.\n\nErinnerungen haben keine Chronologie. Sie haben Orte. Vielleicht ist deshalb jede Datei dieses Archivs an eine Straße, einen Tisch, eine Wiese oder einen Abend gebunden.",
    author: "M.",
    archiveCode: "ARC-09",
    stageId: "s12",
  },
  {
    id: "story-richard-09",
    title: "Notiz 10",
    text:
      "Es bleibt nur noch ein Wurf.\n\nIhr sucht immer noch danach, wer das alles hinterlassen hat. Vielleicht ist das inzwischen die falsche Frage.\n\nDanach endet die Karte. Und die letzte Erklärung beginnt.",
    author: "M.",
    archiveCode: "FINAL-10",
    stageId: "s14",
  },
  {
    id: "story-final-11",
    title: "Archivende 11",
    text:
      "LAS PAJITAS DEL PIJAMA war nie eine Organisation, die euch verfolgt hat.\n\nEs war der Name für das Archiv, das aus euren eigenen Orten, Gegenständen, schlechten Entscheidungen, guten Abenden und Geschichten gebaut wurde.\n\nWenn ihr wissen wollt, wer dahintersteckt, sucht nicht nach einer letzten Person.\n\nSchaut um den Tisch.",
    author: "LPDP",
    archiveCode: "RECOVERED",
    stageId: "s15",
  },
];

export const envelopes: Envelope[] = [];

export const items: InventoryItem[] = [
  {
    id: "num-4",
    number: 4,
    name: "Zahl 4",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines der physischen Zahlenobjekte aus der Wohnung.",
    detail:
      "Die 4 gehört zum ursprünglichen Zahlensatz: 4 · 8 · 15 · 16 · 23 · 42. Das Objekt bleibt Teil der Expedition.",
    physical: true,
    consumable: false,
    tags: ["number", "physical", "reusable"],
  },
  {
    id: "num-8",
    number: 8,
    name: "Zahl 8",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines der physischen Zahlenobjekte aus der Wohnung.",
    detail:
      "Die 8 bleibt trotz ihrer Rolle im ersten Rätsel ein reales Fundstück und muss mitgenommen werden.",
    physical: true,
    consumable: false,
    tags: ["number", "physical", "reusable"],
  },
  {
    id: "num-15",
    number: 15,
    name: "Zahl 15",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines der physischen Zahlenobjekte aus der Wohnung.",
    detail: "Die 15 bleibt Teil der Expedition und soll aufbewahrt werden.",
    physical: true,
    consumable: false,
    tags: ["number", "physical", "reusable"],
  },
  {
    id: "num-16",
    number: 16,
    name: "Zahl 16",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines der physischen Zahlenobjekte aus der Wohnung.",
    detail: "Die 16 bleibt Teil der Expedition und soll aufbewahrt werden.",
    physical: true,
    consumable: false,
    tags: ["number", "physical", "reusable"],
  },
  {
    id: "num-23",
    number: 23,
    name: "Zahl 23",
    kind: "Zahlenobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 1,
    description: "Eines der physischen Zahlenobjekte aus der Wohnung.",
    detail: "Die 23 bleibt Teil der Expedition und kann später erneut auftauchen.",
    physical: true,
    consumable: false,
    tags: ["number", "physical", "reusable"],
  },
  {
    id: "num-42",
    number: 42,
    name: "Zahl 42",
    kind: "Umgebungszahl",
    category: "Hinweis",
    foundAtStage: 1,
    description: "Die sechste Zahl der ursprünglichen Folge.",
    detail: "Die 42 war von Anfang an Teil des Startortes und existiert nicht als physisches Zahlenobjekt.",
    physical: false,
    consumable: false,
    tags: ["number", "environment"],
  },
  {
    id: "i1",
    number: 1,
    name: "Versiegelte Anweisung",
    kind: "Dokument",
    category: "Dokument",
    foundAtStage: 1,
    description: "Die erste Anweisung der Expedition.",
    detail: "Sie fordert dazu auf, alle Fundstücke aufzubewahren. Diese Regel gilt für die gesamte Expedition.",
    physical: true,
    consumable: false,
    tags: ["document", "physical", "reusable"],
  },
  {
    id: "heart-key",
    number: 19,
    name: "Schlüssel",
    kind: "Schlüssel",
    category: "Schlüssel",
    foundAtStage: 2,
    description: "Ein einzelner Schlüssel aus dem Fund am Pantaleonswall.",
    detail:
      "Bewahrt ihn auf. Seine eigentliche Funktion wird erst in einer späteren Etappe klar.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s2",
    tags: ["physical", "key", "heart", "reusable"],
  },
  {
    id: "dodecahedron-projection",
    number: 20,
    name: "Dodekaeder-Projektion",
    kind: "Entschlüsseltes Fragment",
    category: "Hinweis",
    foundAtStage: 3,
    description: "Fünf transparente Fragmente ergeben gemeinsam die Projektion eines Dodekaeders.",
    detail:
      "Der Körper besitzt zwölf Flächen. Nach der Identifikation wurde die Archivreferenz XII sichtbar und der Bereich 3D freigeschaltet.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s3",
    tags: ["physical", "geometry", "xii", "reusable"],
  },
  {
    id: "meridiano-riserva-xii",
    number: 22,
    name: "Meridiano · Riserva XII",
    kind: "Flasche",
    category: "Quest-Gegenstand",
    foundAtStage: 5,
    description: "Eine italienisch wirkende Flasche mit einem ungewöhnlichen Sonderetikett.",
    detail:
      "Das Label trägt die Bezeichnung „Meridiano · Riserva XII“. Mehrere Begriffe auf der Rückseite scheinen absichtlich angeordnet worden zu sein.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s5",
    tags: ["physical", "meridian", "xii", "reusable", "bottle"],
  },
  {
    id: "totino-pizza",
    number: 23,
    name: "Totino · Pizza",
    kind: "Versorgungsobjekt",
    category: "Quest-Gegenstand",
    foundAtStage: 7,
    description:
      "Die entschlüsselte Versorgungsstation ist jetzt als Gegenstand im Inventar vermerkt.",
    detail:
      "Eine Pizza ist selten nur von oben interessant. Wenn ihr die echte Pizza bei Totino habt, untersucht auch den Karton selbst.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s7",
    tags: ["physical", "pizza", "totino", "qr", "reusable"],
  },
  {
    id: "totino-receipt",
    number: 24,
    name: "Totino · Rechnung",
    kind: "Beleg",
    category: "Dokument",
    foundAtStage: 7,
    description: "Die physische Rechnung aus Totino. Ein handschriftlicher Zusatz gehört zur nächsten Spur.",
    detail:
      "B.Sc. BIO · SUBMISSION COMPLETE. Der entscheidende physische Zusatz lautet sinngemäß „SEITENEINGANG“ und hilft euch, am Biozentrum die richtige QR-Markierung zu finden.",
    physical: true,
    consumable: false,
    requiredLater: false,
    sourceStageId: "s7",
    tags: ["physical", "receipt", "bio", "reusable"],
  },
  {
    id: "kiosk-beer-label",
    number: 25,
    name: "Flasche 07 · Sonderetikett",
    kind: "Getränk mit Sonderetikett",
    category: "Quest-Gegenstand",
    foundAtStage: 9,
    description: "Eine am Kiosk hinterlegte Flasche mit einem eigens gestalteten Etikett.",
    detail:
      "Das Etikett zeigt Spielplatz- und Sportmotive sowie persönliche Formulierungen: „Wo Geschichte geschrieben und Arme zerstört wurden“ und „Wo der Morgen nur Kummer und Sorgen gebracht hat“.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s9",
    tags: ["physical", "label", "playground", "memory", "reusable"],
  },
  {
    id: "art-sixpack",
    number: 26,
    name: "Sixpack · Kunstarchiv",
    kind: "Bedruckter Sixpack-Träger",
    category: "Quest-Gegenstand",
    foundAtStage: 11,
    description: "Ein Sixpack-Träger mit sechs Kunstwerken aus unterschiedlichen Jahrhunderten.",
    detail:
      "Die Motive bilden gemeinsam ein Chronologierätsel. Ihre zeitliche Reihenfolge wird in der App geprüft.",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s11",
    tags: ["physical", "art", "chronology", "reusable"],
  },
  {
    id: "cocktail-dice",
    number: 26,
    name: "Spielwürfel",
    kind: "Zwei Würfel",
    category: "Quest-Gegenstand",
    foundAtStage: 13,
    description: "Zwei Würfel aus dem Briefkasten der Richard-Wagner-Straße.",
    detail:
      "Der beigefügte Satz lautet: „Der letzte Wurf entscheidet nicht, was ihr trinkt, sondern wo.“",
    physical: true,
    consumable: false,
    requiredLater: true,
    sourceStageId: "s13",
    tags: ["physical", "dice", "cocktail", "finale", "reusable"],
  },
];

export const loadingLines = [
  "KOORDINATEN WERDEN GEPRÜFT …",
  "ENTSCHLÜSSELUNG LÄUFT …",
  "ARCHIVE WERDEN DURCHSUCHT …",
  "ORT WIRD ÜBERPRÜFT …",
  "EXPEDITION WIRD VORBEREITET …",
];

export const stageById = (id: string) => adventure.stages.find((stage) => stage.id === id);
export const puzzleById = (id: string) => puzzles.find((puzzle) => puzzle.id === id);
export const locationById = (id?: string) =>
  id ? locations.find((location) => location.id === id) : undefined;
export const itemById = (id: string) => items.find((item) => item.id === id);
export const envelopeById = (id?: string) =>
  id ? envelopes.find((envelope) => envelope.id === id) : undefined;
export const storyFragmentById = (id: string) =>
  storyFragments.find((fragment) => fragment.id === id);
