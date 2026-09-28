import { useState } from "react";
import { motion } from "motion/react";

/**
 * Placeholder mount point for the existing custom 3D room.
 * Replace the inner <RoomPlaceholder /> with the real Three.js / R3F scene.
 * Props are kept stable so the swap does not touch the surrounding page.
 */
export interface InteractiveRoomProps {
  onObjectFound?: (id: string) => void;
  resetSignal?: number;
}

const hotspots = [
  { id: "desk", label: "Schreibtischschublade", x: 26, y: 62, note: "Eine Schublade mit doppeltem Boden. Leer." },
  { id: "clock", label: "Wanduhr", x: 52, y: 26, note: "Um 4:29 Uhr stehen geblieben. Zwei Stunden vorgestellt." },
  { id: "map", label: "Gerahmte Karte", x: 76, y: 44, note: "Hinter dem Rahmen klebt ein USB-Stick." },
];

export function InteractiveRoom({ onObjectFound, resetSignal }: InteractiveRoomProps) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div
      key={resetSignal}
      className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-surface"
    >
      <div className="absolute inset-0 topo opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 60%)",
        }}
      />
      <div className="absolute inset-x-0 top-6 text-center">
        <p className="label-mono">Platzhalter für den 3D-Raum</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hier wird die vorhandene Raumszene eingebunden.
        </p>
      </div>

      {hotspots.map((h) => (
        <button
          key={h.id}
          onClick={() => {
            setOpen(h.id);
            onObjectFound?.(h.id);
          }}
          aria-label={h.label}
          className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/60 bg-background/60"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
        >
          <span className="absolute inset-0 rounded-full border border-gold/40 marker-pulse" />
          <span className="font-display text-sm text-gold">?</span>
        </button>
      ))}

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-4 bottom-4 field-panel p-4"
        >
          <p className="font-display text-sm font-bold uppercase tracking-wide">
            {hotspots.find((h) => h.id === open)?.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hotspots.find((h) => h.id === open)?.note}
          </p>
          <button
            onClick={() => setOpen(null)}
            className="mt-3 label-mono text-primary"
          >
            Close
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}
