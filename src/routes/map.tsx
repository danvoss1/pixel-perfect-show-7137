import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lock, HelpCircle, ChevronUp } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label } from "@/components/game/primitives";
import { adventure, locations } from "@/game/data";
import { usePlayer } from "@/game/store";
import type { GameLocation, MarkerState } from "@/game/types";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Expeditionskarte — Der verborgene Pfad" },
      {
        name: "description",
        content: "Entdecke Orte, Kontrollpunkte und Hinweismarkierungen in der Stadt.",
      },
      { property: "og:title", content: "Expeditionskarte — Der verborgene Pfad" },
      { property: "og:description", content: "Entdeckte Orte, Kontrollpunkte und Hinweismarkierungen." },
    ],
  }),
  component: MapPage,
});

/**
 * Mocked map canvas. A Leaflet / Mapbox / Google Maps layer can replace the
 * <MapCanvas /> body; markers already carry lat/lng and state.
 */
function MapPage() {
  const visited = usePlayer((s) => s.visitedLocations);
  const currentId = usePlayer((s) => s.currentStageId);
  const visitLocation = usePlayer((s) => s.visitLocation);
  const currentStage = adventure.stages.find((s) => s.id === currentId);
  const [selectedId, setSelectedId] = useState<string>(
    currentStage?.locationId ?? locations[0]!.id,
  );
  const [open, setOpen] = useState(true);
  const selected = locations.find((l) => l.id === selectedId)!;

  const stateOf = (loc: GameLocation): MarkerState => {
    if (visited.includes(loc.id)) return "completed";
    if (currentStage?.locationId === loc.id) return "active";
    const stageForLoc = adventure.stages.find((s) => s.locationId === loc.id);
    if (!stageForLoc) return "unknown";
    return stageForLoc.number < (currentStage?.number ?? 1) ? "discovered" : "locked";
  };

  return (
    <GameShell bare>
      <div className="relative h-[calc(100vh-56px)] w-full overflow-hidden lg:h-screen">
        <div className="topo absolute inset-0 bg-surface" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={locations.map((l) => `${l.x},${l.y}`).join(" ")}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.35"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />
        </svg>

        {locations.map((loc) => {
          const state = stateOf(loc);
          return (
            <button
              key={loc.id}
              onClick={() => {
                setSelectedId(loc.id);
                setOpen(true);
              }}
              aria-label={state === "locked" ? "Unbekannte Markierung" : loc.name}
              className="absolute size-12 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              {state === "active" ? (
                <span className="absolute inset-0 rounded-full border-2 border-primary marker-pulse" />
              ) : null}
              <span
                className={`grid size-10 place-items-center rounded-full border-2 ${
                  state === "completed"
                    ? "border-success/70 bg-success/20 text-success"
                    : state === "active"
                      ? "border-primary bg-primary/25 text-primary"
                      : state === "discovered"
                        ? "border-gold/60 bg-background/70 text-gold"
                        : state === "locked"
                          ? "border-border bg-background/40 text-muted-foreground opacity-50"
                          : "border-border bg-background/60 text-muted-foreground"
                }`}
              >
                {state === "completed" ? (
                  <Check className="size-4" />
                ) : state === "locked" ? (
                  <Lock className="size-4" />
                ) : state === "unknown" ? (
                  <HelpCircle className="size-4" />
                ) : (
                  <span className="size-2.5 rounded-full bg-current" />
                )}
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute left-4 top-4">
          <Label>Sektor 04 · {selected.lat.toFixed(4)} N / {selected.lng.toFixed(4)} E</Label>
        </div>

        {/* Mission panel */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:max-w-md">
          <div className="field-panel overflow-hidden">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 px-5"
            >
              <span className="min-w-0 text-left">
                <Label>Zielort</Label>
                <span className="mt-0.5 block truncate font-display text-base font-semibold uppercase">
                  {selected.name}
                </span>
              </span>
              <ChevronUp
                className={`size-4 shrink-0 transition-transform ${open ? "" : "rotate-180"}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden px-5 pb-5"
                >
                  <div className="flex gap-6">
                    <div>
                      <Label>Entfernung</Label>
                      <p className="mt-1 font-display text-lg">{selected.distance}</p>
                    </div>
                    <div>
                      <Label>Freischaltradius</Label>
                      <p className="mt-1 font-display text-lg">{selected.radius} m</p>
                    </div>
                  </div>
                  <Label className="mt-4">Hinweis</Label>
                  <p className="mt-2 font-hand text-2xl leading-tight text-paper">
                    “{selected.clue}”
                  </p>
                  {visited.includes(selected.id) ? (
                    <p className="mt-4 text-center font-display text-xs uppercase tracking-[0.2em] text-success">
                      Ort bestätigt
                    </p>
                  ) : (
                    <button
                      onClick={() => visitLocation(selected.id, selected.name)}
                      className="mt-4 min-h-[48px] w-full rounded-md bg-primary font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
                    >
                      Ort gefunden
                    </button>
                  )}
                  <Link
                    to="/puzzle/$id"
                    params={{ id: "p-route" }}
                    className="mt-2 block text-center label-mono text-primary"
                  >
                    Navigationsrätsel öffnen
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
