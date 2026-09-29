export type EventTrigger = "checkpoint" | "puzzle" | "hint" | "item" | "manual";
export type FieldEvent = { id: string; category: "FIELD EVENT" | "SUPPLY DROP" | "PITCH" | "BONUS RUN" | "DOUBLE OR NOTHING" | "SILENT MODE"; title: string; description: string; trigger: EventTrigger; consequence: string };
export const eventCategoryLabel: Record<FieldEvent["category"], string> = {
  "FIELD EVENT": "Feldereignis",
  "SUPPLY DROP": "Versorgungslieferung",
  "PITCH": "Bericht aus dem Feld",
  "BONUS RUN": "Bonusspur",
  "DOUBLE OR NOTHING": "Doppelt oder nichts",
  "SILENT MODE": "Stille Etappe",
};

export const fieldEvents: FieldEvent[] = [
  { id: "field-navigator", category: "FIELD EVENT", title: "Navigatorwechsel", description: "Bestimmt freiwillig eine neue Person für die Navigation bis zum nächsten Kontrollpunkt.", trigger: "checkpoint", consequence: "Keine" },
  { id: "field-supply", category: "SUPPLY DROP", title: "Versorgungspause", description: "Legt eine Pause ein. Alle Getränke, auch alkoholfreie, sind gleichwertig.", trigger: "puzzle", consequence: "Getränke freischalten" },
  { id: "field-pitch", category: "PITCH", title: "Die Entdeckung", description: "Erzählt einander, was ihr gerade über den verborgenen Pfad gelernt habt.", trigger: "item", consequence: "Keine" },
  { id: "field-bonus", category: "BONUS RUN", title: "Eine Spur mehr", description: "Sucht gemeinsam nach dem nächsten Wegzeichen. Ihr könnt diese Aufgabe jederzeit überspringen.", trigger: "manual", consequence: "Keine" },
  { id: "field-double", category: "DOUBLE OR NOTHING", title: "Doppelte Chance", description: "Versucht freiwillig das nächste Rätsel ohne Hinweis. Eine Verdopplung von Jokern ist in dieser Vorschau noch nicht verfügbar.", trigger: "manual", consequence: "Keine" },
  { id: "field-silent", category: "SILENT MODE", title: "Stille Stunde", description: "Wer möchte, darf die nächste Wegstrecke schweigend zurücklegen. Kommunikation bleibt jederzeit möglich.", trigger: "manual", consequence: "Keine" },
];