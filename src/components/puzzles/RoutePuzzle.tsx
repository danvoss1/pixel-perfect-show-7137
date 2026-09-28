import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Label } from "../game/primitives";
import type { RouteConfig, RouteStep } from "@/game/types";

const dirs: RouteStep["direction"][] = ["NORTH", "EAST", "SOUTH", "WEST"];
const icon = {
  NORTH: ArrowUp,
  EAST: ArrowRight,
  SOUTH: ArrowDown,
  WEST: ArrowLeft,
};

export function RoutePuzzle({
  config,
  onSolved,
  solved,
}: {
  config: RouteConfig;
  onSolved: () => void;
  solved: boolean;
}) {
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [direction, setDirection] = useState<RouteStep["direction"]>("NORTH");
  const [distance, setDistance] = useState("200");
  const [status, setStatus] = useState<"idle" | "wrong" | "ok">(solved ? "ok" : "idle");

  const check = () => {
    const ok =
      steps.length === config.steps.length &&
      steps.every(
        (s, i) => s.direction === config.steps[i]?.direction && s.distance === config.steps[i]?.distance,
      );
    if (ok) {
      setStatus("ok");
      onSolved();
    } else {
      setStatus("wrong");
    }
  };

  return (
    <div className="space-y-4">
      <div className="field-panel p-5">
        <Label>Deine Route</Label>
        <p className="mt-2 text-sm text-muted-foreground">Start: {config.start}</p>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select
            aria-label="Richtung"
            value={direction}
            onChange={(e) => setDirection(e.target.value as RouteStep["direction"])}
            className="min-h-[48px] rounded-md border border-border bg-background/60 px-3 font-display text-sm uppercase tracking-wider outline-none focus:border-primary"
          >
            {dirs.map((d) => (
              <option key={d} value={d}>
                {({ NORTH: "Norden", EAST: "Osten", SOUTH: "Süden", WEST: "Westen" } as const)[d]}
              </option>
            ))}
          </select>
          <input
            aria-label="Entfernung in Metern"
            inputMode="numeric"
            value={distance}
            onChange={(e) => setDistance(e.target.value.replace(/\D/g, ""))}
            className="min-h-[48px] rounded-md border border-border bg-background/60 px-3 font-display text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => {
              if (!distance) return;
              setSteps((s) => [...s, { direction, distance: Number(distance) }]);
              setStatus("idle");
            }}
            className="col-span-2 min-h-[48px] rounded-md border border-primary/50 px-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-primary sm:col-span-1"
          >
            Abschnitt hinzufügen
          </button>
        </div>

        <ul className="mt-5 space-y-2">
          {steps.length === 0 ? (
            <li className="text-sm text-muted-foreground">Noch keine Abschnitte eingezeichnet.</li>
          ) : null}
          {steps.map((s, i) => {
            const Icon = icon[s.direction];
            return (
              <li
                key={i}
                className="flex min-h-[48px] items-center gap-3 rounded-md border border-border bg-background/40 px-4"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 font-display text-sm uppercase tracking-wide">
                  {({ NORTH: "Norden", EAST: "Osten", SOUTH: "Süden", WEST: "Westen" } as const)[s.direction]} — {s.distance} m
                </span>
                <button
                  aria-label="Abschnitt entfernen"
                  onClick={() => setSteps((arr) => arr.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={check}
          className="mt-5 min-h-[48px] w-full rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground"
        >
          Route überprüfen
        </button>

        {status === "wrong" ? (
          <p className="mt-3 text-center text-sm text-destructive">Etwas stimmt noch nicht.</p>
        ) : null}
        {status === "ok" ? (
          <p className="mt-3 text-center font-display text-sm uppercase tracking-[0.2em] text-success">
            Route bestätigt
          </p>
        ) : null}
      </div>
    </div>
  );
}
