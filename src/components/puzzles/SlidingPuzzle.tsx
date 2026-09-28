import { useEffect, useMemo, useState } from "react";
import { Label } from "../game/primitives";

function shuffled(n: number) {
  const size = n * n;
  let arr = [...Array(size).keys()];
  // simple legal shuffle: random legal moves from solved state
  let blank = size - 1;
  for (let i = 0; i < 300; i++) {
    const moves: number[] = [];
    const r = Math.floor(blank / n);
    const c = blank % n;
    if (r > 0) moves.push(blank - n);
    if (r < n - 1) moves.push(blank + n);
    if (c > 0) moves.push(blank - 1);
    if (c < n - 1) moves.push(blank + 1);
    const m = moves[Math.floor(Math.random() * moves.length)] as number;
    arr = arr.map((v, idx) => (idx === blank ? (arr[m] as number) : idx === m ? (arr[blank] as number) : v));
    blank = m;
  }
  return arr;
}

export function SlidingPuzzle({
  grid,
  image,
  onSolved,
  solved,
}: {
  grid: number;
  image: string;
  onSolved: () => void;
  solved: boolean;
}) {
  const [tiles, setTiles] = useState<number[]>(() => shuffled(grid));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState(false);
  const size = grid * grid;
  const isSolved = useMemo(() => tiles.every((v, i) => v === i), [tiles]);

  useEffect(() => {
    if (isSolved || solved) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isSolved, solved]);

  useEffect(() => {
    if (isSolved && moves > 0) onSolved();
  }, [isSolved, moves, onSolved]);

  const move = (idx: number) => {
    const blank = tiles.indexOf(size - 1);
    const r1 = Math.floor(idx / grid);
    const c1 = idx % grid;
    const r2 = Math.floor(blank / grid);
    const c2 = blank % grid;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    const next = [...tiles];
    next[blank] = tiles[idx] as number;
    next[idx] = tiles[blank] as number;
    setTiles(next);
    setMoves((m) => m + 1);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label>Moves</Label>
          <p className="font-display text-xl font-bold">{String(moves).padStart(3, "0")}</p>
        </div>
        <div className="text-right">
          <Label>Time</Label>
          <p className="font-display text-xl font-bold">
            {mm}:{ss}
          </p>
        </div>
      </div>

      <div
        className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg border border-border"
        style={{ aspectRatio: "1 / 1" }}
      >
        <div
          className="grid h-full w-full gap-[2px] bg-border/40"
          style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}
        >
          {tiles.map((tile, idx) => {
            const isBlank = tile === size - 1 && !isSolved && !preview;
            const r = Math.floor(tile / grid);
            const c = tile % grid;
            return (
              <button
                key={idx}
                onClick={() => move(idx)}
                aria-label={`Tile ${tile + 1}`}
                className="relative bg-background/70"
                style={
                  isBlank
                    ? undefined
                    : {
                        backgroundImage: `url(${image})`,
                        backgroundSize: `${grid * 100}% ${grid * 100}%`,
                        backgroundPosition: `${(c / (grid - 1)) * 100}% ${(r / (grid - 1)) * 100}%`,
                      }
                }
              />
            );
          })}
        </div>
        {preview ? (
          <img
            src={image}
            alt="Original photograph"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setTiles(shuffled(grid));
            setMoves(0);
            setSeconds(0);
          }}
          className="min-h-[48px] flex-1 rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:bg-accent"
        >
          Reset
        </button>
        <button
          onMouseDown={() => setPreview(true)}
          onMouseUp={() => setPreview(false)}
          onMouseLeave={() => setPreview(false)}
          onTouchStart={() => setPreview(true)}
          onTouchEnd={() => setPreview(false)}
          className="min-h-[48px] flex-1 rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:bg-accent"
        >
          Hold to preview
        </button>
      </div>
    </div>
  );
}
