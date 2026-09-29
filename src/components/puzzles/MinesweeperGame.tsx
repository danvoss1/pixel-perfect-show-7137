import { useState } from "react";
import { Flag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MinesweeperConfig } from "@/game/types";

export function MinesweeperGame({ config, solved, onSolved }: { config: MinesweeperConfig; solved: boolean; onSolved: () => void }) {
  const [open, setOpen] = useState<number[]>([]);
  const [flags, setFlags] = useState<number[]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [lost, setLost] = useState(false);
  const count = config.grid * config.grid;
  const mines = new Set(config.mines);
  const neighbors = (index: number) => {
    const row = Math.floor(index / config.grid), col = index % config.grid;
    return Array.from({ length: 9 }, (_, offset) => {
      const dr = Math.floor(offset / 3) - 1, dc = offset % 3 - 1;
      const r = row + dr, c = col + dc;
      return r >= 0 && r < config.grid && c >= 0 && c < config.grid && (dr !== 0 || dc !== 0) ? r * config.grid + c : -1;
    }).filter((value) => value >= 0);
  };
  const reveal = (index: number) => {
    if (solved || lost || open.includes(index)) return;
    if (flagMode) { setFlags((current) => current.includes(index) ? current.filter((n) => n !== index) : [...current, index]); return; }
    if (flags.includes(index)) return;
    if (mines.has(index)) { setLost(true); return; }
    const next = new Set(open), queue = [index];
    while (queue.length) {
      const cell = queue.pop();
      if (cell === undefined || next.has(cell) || mines.has(cell) || flags.includes(cell)) continue;
      next.add(cell);
      if (neighbors(cell).every((n) => !mines.has(n))) queue.push(...neighbors(cell));
    }
    setOpen([...next]);
    if (next.size === count - mines.size) onSolved();
  };
  return <div className="field-panel mx-auto max-w-lg p-5"><p className="label-mono">Minenfeld · {open.length} / {count - mines.size} sichere Felder</p>
    <div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Öffne alle sicheren Felder. Im Markierungsmodus setzt du Fähnchen.</p><Button variant={flagMode ? "secondary" : "outline"} onClick={() => setFlagMode((value) => !value)} aria-pressed={flagMode} aria-label="Markierungsmodus" title="Markierungsmodus" className="size-11 shrink-0 p-0"><Flag className="size-4" /></Button></div>
    <div className="mx-auto mt-5 grid max-w-[360px] gap-1" style={{ gridTemplateColumns: `repeat(${config.grid}, minmax(0, 1fr))` }} role="group" aria-label="Minenfeld">
      {Array.from({ length: count }, (_, index) => {
        const revealed = open.includes(index) || (lost && mines.has(index));
        const value = neighbors(index).filter((neighbor) => mines.has(neighbor)).length;
        return <Button key={index} type="button" variant="outline" onClick={() => reveal(index)} onContextMenu={(event) => { event.preventDefault(); if (!solved && !lost && !open.includes(index)) setFlags((current) => current.includes(index) ? current.filter((n) => n !== index) : [...current, index]); }} aria-label={`Feld ${index + 1}${revealed ? mines.has(index) ? ", Mine" : `, ${value} benachbarte Minen` : flags.includes(index) ? ", markiert" : ", verdeckt"}`} className={`aspect-square h-auto min-h-[44px] min-w-0 p-0 text-base ${revealed ? "bg-accent" : "bg-surface"}`}>{revealed ? mines.has(index) ? "✕" : value || "·" : flags.includes(index) ? <Flag className="size-4 text-gold" /> : ""}</Button>;
      })}
    </div>
    {lost && <div role="status" className="mt-4 flex items-center justify-between gap-2 text-sm"><span>Mine getroffen. Versuch es erneut.</span><Button variant="outline" onClick={() => { setOpen([]); setFlags([]); setLost(false); }} aria-label="Neustart" title="Neustart" className="size-11 p-0"><RotateCcw className="size-4" /></Button></div>}
    {solved && <p role="status" className="mt-4 text-success">Alle sicheren Felder gefunden.</p>}
  </div>;
}