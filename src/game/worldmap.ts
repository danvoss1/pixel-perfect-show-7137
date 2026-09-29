import bridge from "@/assets/photo-bridge.jpg";
import path from "@/assets/hero-path.jpg";

export type WorldKind = "story" | "envelope" | "puzzle" | "mystery" | "supply" | "checkpoint";
export interface Hotspot { id: string; x: number; y: number; label: string; text: string }
export interface WorldPoint { id: string; name: string; lat: number; lng: number; kind: WorldKind; locationId?: string; locked?: boolean; teaser: string; image: string; hotspots: Hotspot[] }

/** Stylised game-world points; share IDs with real locations where locationId is set. */
export const worldPoints: WorldPoint[] = [
  { id: "w-dom", name: "Der Schatten der Türme", lat: 50.9413, lng: 6.9583, kind: "story", teaser: "Zwei Spitzen, die seit Jahrhunderten über die Stadt wachen.", image: path,
    hotspots: [{ id: "h1", x: 32, y: 58, label: "Eingeritztes Zeichen", text: "Ein Kompass, dessen Nadel nach Osten zeigt — zum Wasser." }, { id: "h2", x: 70, y: 40, label: "Verblasste Notiz", text: "„Folge den Schlössern über den Strom.“" }] },
  { id: "w-l2", name: "Brücke der Schlösser", lat: 50.9413, lng: 6.9658, kind: "envelope", locationId: "l2", teaser: "Tausende Versprechen hängen hier aus Metall.", image: bridge,
    hotspots: [{ id: "h1", x: 24, y: 66, label: "Dritter Pfeiler", text: "Unter dem dritten Pfeiler vom Ufer aus schimmert etwas Messing." }, { id: "h2", x: 62, y: 35, label: "Goldenes Schloss", text: "Eingraviert: E·03 — die Nummer eines Umschlags." }, { id: "h3", x: 84, y: 72, label: "Kreidepfeil", text: "Der Pfeil zeigt stromabwärts." }] },
  { id: "w-l1", name: "Die Kräne am Hafen", lat: 50.9255, lng: 6.9660, kind: "checkpoint", locationId: "l1", teaser: "Drei eiserne Riesen beugen sich über das Wasser.", image: path, hotspots: [{ id: "h1", x: 50, y: 50, label: "Rostiger Bolzen", text: "Eine Zahlenfolge ist eingeschlagen: 4 · 7 · 2 · 9." }] },
  { id: "w-l3", name: "Das grüne Tor", lat: 50.9340, lng: 6.8850, kind: "supply", locationId: "l3", teaser: "Wo die Stadt endet, beginnt der Wald.", image: path, hotspots: [{ id: "h1", x: 45, y: 60, label: "Proviantkiste", text: "Eine Rast für das Team — Versorgung freigeschaltet." }] },
  { id: "w-l4", name: "Der alte Wasserwächter", lat: 50.9290, lng: 6.9440, kind: "puzzle", locationId: "l4", teaser: "Ein Turm, der einst Wasser hütete.", image: path, hotspots: [{ id: "h1", x: 55, y: 40, label: "Symbolreihe", text: "Fremde Zeichen ringsum an der Mauer." }] },
  { id: "w-l5", name: "Ufer im Osten", lat: 50.9390, lng: 6.9750, kind: "checkpoint", locationId: "l5", teaser: "Von hier sieht man die Stadt als Ganzes.", image: path, hotspots: [{ id: "h1", x: 50, y: 50, label: "Fernglas", text: "Durch das Glas: ein Licht in einem Turmfenster." }] },
  { id: "w-mystery", name: "Unbekanntes Signal", lat: 50.9560, lng: 6.9900, kind: "mystery", locked: true, teaser: "", image: path, hotspots: [] },
];

export const kindLabel: Record<WorldKind, string> = { story: "Story-Punkt", envelope: "Umschlag", puzzle: "Rätsel", mystery: "Mysterium", supply: "Versorgung", checkpoint: "Kontrollpunkt" };

/** Projects lat/lng into the 1000×1000 world map canvas. */
export function project(lat: number, lng: number) {
  return { x: ((lng - 6.86) / 0.18) * 1000, y: ((50.99 - lat) / 0.1) * 1000 };
}
