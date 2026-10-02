export type QrMarkId =
  | "start-42"
  | "rheinauhafen-window"
  | "heumarkt-heart"
  | "totino-pizza"
  | "biozentrum-entry";

export interface QrMarkDefinition {
  id: QrMarkId;
  token: string;
  eyebrow: string;
  title: string;
  text: string;
  continueLabel: string;
  target:
    | { type: "stage"; stageId: string }
    | { type: "puzzle"; puzzleId: string }
    | { type: "route"; route: "/3d" };
}

export const qrMarks: QrMarkDefinition[] = [
  {
    id: "start-42",
    token: "HP-M42-7F3K",
    eyebrow: "Markierung 01 · 42",
    title: "Die Zahl gehört zum Ort",
    text:
      "42 war nie nur eine Zahl aus dem Satz. Wenn ihr den Zugangswert geknackt habt, führt die nächste Spur dorthin, wo Daniel früher gewohnt hat: zum Pantaleonswall. Dort wartet kein weiterer Zahlencode, sondern ein Beutel voller Schlüssel.",
    continueLabel: "Zur aktuellen Etappe",
    target: { type: "stage", stageId: "s1" },
  },
  {
    id: "rheinauhafen-window",
    token: "HP-RH-9Q2M",
    eyebrow: "Markierung 03 · Rheinauhafen",
    title: "Fünf Fragmente. Eine Form.",
    text:
      "Legt die fünf transparenten Fragmente exakt übereinander. Getrennt sind es nur Linien. Gemeinsam entsteht kein Bild, sondern ein geometrischer Körper. Wenn ihr glaubt, ihn erkannt zu haben, gebt seinen Namen digital ein.",
    continueLabel: "Körper eingeben",
    target: { type: "puzzle", puzzleId: "p-geometry-dodecahedron" },
  },
  {
    id: "heumarkt-heart",
    token: "HP-HM-4X8P",
    eyebrow: "Markierung 04 · Herz",
    title: "Das Herz ist gefunden",
    text:
      "Die berechnete Position war richtig. Mit diesem Scan ist die Heumarkt-Etappe abgeschlossen und die nächste Etappe wird freigeschaltet.",
    continueLabel: "Weiter zu AI Fitness",
    target: { type: "stage", stageId: "s5" },
  },
  {
    id: "totino-pizza",
    token: "HP-PIZZA-8T4Q",
    eyebrow: "Markierung 07 · Totino",
    title: "Unter der Pizza",
    text:
      "Die Versorgungsstation war nur der Zwischenstopp. Diese Markierung aktiviert die nächste Übertragung. Der Zielort ist das Biozentrum der Universität zu Köln. Nehmt die Rechnung mit – ihr Zusatz verrät, welchen Eingang ihr dort suchen müsst.",
    continueLabel: "Übertragung öffnen",
    target: { type: "puzzle", puzzleId: "p-totino-qr" },
  },
  {
    id: "biozentrum-entry",
    token: "HP-BIO-6N5R",
    eyebrow: "Markierung 08 · Biozentrum",
    title: "Laborzugang aktiviert",
    text:
      "Der Seiteneingang ist bestätigt. Im Archiv wartet eine unvollständige COI-Barcoding-Auswertung. Erst jetzt ist die genetische Analyse freigeschaltet.",
    continueLabel: "Genetische Analyse öffnen",
    target: { type: "puzzle", puzzleId: "p-dna-bio" },
  },
];

export const qrMarkByToken = (value: string) => {
  const normalized = value.trim().toUpperCase();
  return qrMarks.find((mark) => mark.token === normalized);
};

export const qrMarkById = (id: string) =>
  qrMarks.find((mark) => mark.id === id);

export const requiredQrMarkForPuzzle: Record<string, QrMarkId | undefined> = {
  "p-geometry-dodecahedron": "rheinauhafen-window",
  "p-totino-qr": "totino-pizza",
  "p-dna-bio": "biozentrum-entry",
};
