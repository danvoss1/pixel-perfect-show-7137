import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CircuitConfig } from "@/game/types";

const sides = [1, 2, 4, 8] as const; // oben, rechts, unten, links
function turn(mask: number) { return ((mask << 1) & 15) | (mask >> 3); }

export function CircuitGame({ config, solved, onSolved }: { config: CircuitConfig; solved: boolean; onSolved: () => void }) {
  const count = config.grid * config.grid;
  const [rotation, setRotation] = useState(() => Array.from({ length: count }, (_, i) => (i * 3 + 1) % 4));
  const [moves, setMoves] = useState(0);
  const base = Array.from({ length: count }, (_, index) => {
    const at = config.path.indexOf(index);
    if (at < 0) return 0;
    const directions = [config.path[at - 1], config.path[at + 1]].filter((n): n is number => n !== undefined);
    return directions.reduce((mask, next) => mask | (next === index - config.grid ? sides[0] : next === index + 1 ? sides[1] : next === index + config.grid ? sides[2] : sides[3]), 0);
  });
  const maskAt = (index: number, state: number[]) => Array.from({ length: state[index] ?? 0 }).reduce<number>((mask) => turn(mask), base[index] ?? 0);
  const rotate = (index: number) => {
    if (solved) return;
    const next = [...rotation]; next[index] = ((next[index] ?? 0) + 1) % 4;
    setRotation(next); setMoves((n) => n + 1);
    if (config.path.every((cell) => maskAt(cell, next) === base[cell])) onSolved();
  };
  return <div className="field-panel mx-auto max-w-lg p-5"><p className="label-mono">Schaltkreis · {moves} Drehungen</p><p className="mt-3 text-sm text-muted-foreground">Drehe die Leitungen, bis der Strom vom Eingang zum Ausgang fließt.</p>
    <div className="mx-auto mt-5 grid max-w-[360px] gap-1" style={{ gridTemplateColumns: `repeat(${config.grid}, minmax(0, 1fr))` }} role="group" aria-label="Schaltkreis">
      {base.map((mask, index) => { const current = maskAt(index, rotation); return <Button key={index} variant="outline" disabled={!mask || solved} onClick={() => rotate(index)} aria-label={`Leitung ${index + 1} drehen`} className="relative aspect-square h-auto min-h-[44px] min-w-0 overflow-hidden bg-surface p-0">
        {mask ? sides.map((side, i) => current & side ? <span key={side} className={`absolute bg-primary ${i === 0 ? "left-[44%] top-0 h-1/2 w-[12%]" : i === 1 ? "left-1/2 top-[44%] h-[12%] w-1/2" : i === 2 ? "left-[44%] top-1/2 h-1/2 w-[12%]" : "left-0 top-[44%] h-[12%] w-1/2"}`} /> : null) : null}
        {mask ? <span className="relative z-10 grid size-3 place-items-center rounded-full bg-gold" /> : null}
      </Button>; })}
    </div>
    <div className="mt-4 flex items-center justify-between"><p className="text-xs text-muted-foreground">Start: Feld 1 · Ziel: letztes Feld</p><Button variant="outline" onClick={() => { setRotation(Array.from({ length: count }, (_, i) => (i * 3 + 1) % 4)); setMoves(0); }} disabled={solved} aria-label="Neustart" title="Neustart" className="size-11 p-0"><RotateCcw className="size-4" /></Button></div>
    {solved && <p role="status" className="mt-3 text-success">Verbindung hergestellt.</p>}
  </div>;
}