export type EventTrigger = "checkpoint" | "puzzle" | "hint" | "item" | "manual";
export type FieldEvent = { id: string; category: "FIELD EVENT" | "SUPPLY DROP" | "PITCH" | "BONUS RUN"; title: string; description: string; trigger: EventTrigger; consequence: string };

export const fieldEvents: FieldEvent[] = [
  { id: "field-navigator", category: "FIELD EVENT", title: "Navigatorwechsel", description: "Bestimmt freiwillig eine neue Person für die Navigation bis zum nächsten Kontrollpunkt.", trigger: "checkpoint", consequence: "Keine" },
  { id: "field-supply", category: "SUPPLY DROP", title: "Versorgungspause", description: "Legt eine Pause ein. Alle Getränke, auch alkoholfreie, sind gleichwertig.", trigger: "puzzle", consequence: "Getränke freischalten" },
  { id: "field-pitch", category: "PITCH", title: "Die Entdeckung", description: "Erzählt einander, was ihr gerade über den verborgenen Pfad gelernt habt.", trigger: "item", consequence: "Keine" },
  { id: "field-bonus", category: "BONUS RUN", title: "Eine Spur mehr", description: "Sucht gemeinsam nach dem nächsten Wegzeichen. Ihr könnt diese Aufgabe jederzeit überspringen.", trigger: "manual", consequence: "Keine" },
];