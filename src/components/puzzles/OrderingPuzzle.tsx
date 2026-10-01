import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import type { OrderingConfig } from "@/game/types";

export function OrderingPuzzle({
  config,
  solved,
  onSolved,
}: {
  config: OrderingConfig;
  solved: boolean;
  onSolved: () => void;
}) {
  const sorted = useMemo(
    () => [...config.items].sort((a, b) => a.order - b.order),
    [config.items],
  );
  const [items, setItems] = useState(() => (solved ? sorted : [...config.items]));
  const [draggingId, setDraggingId] = useState<string>();
  const [wrong, setWrong] = useState(false);
  const [revealed, setRevealed] = useState(solved);

  const move = (index: number, delta: number) => {
    if (solved || revealed) return;
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const [entry] = next.splice(index, 1);
    if (!entry) return;
    next.splice(nextIndex, 0, entry);
    setItems(next);
    setWrong(false);
  };

  const dropOn = (targetId: string) => {
    if (!draggingId || draggingId === targetId || solved || revealed) return;
    const next = [...items];
    const from = next.findIndex((item) => item.id === draggingId);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [entry] = next.splice(from, 1);
    if (!entry) return;
    next.splice(to, 0, entry);
    setItems(next);
    setDraggingId(undefined);
    setWrong(false);
  };

  const check = () => {
    const correct = items.every((item, index) => item.id === sorted[index]?.id);
    if (!correct) {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 900);
      return;
    }
    setItems(sorted);
    setRevealed(true);
    onSolved();
  };

  const extraction = sorted.map((item) => item.text.charAt(0).toUpperCase()).join("");
  const showExtraction = config.showExtraction ?? config.extraction === "first-letter";
  const resultText = config.revealText ?? config.answer;

  return (
    <div className="field-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label>Etikettanalyse</Label>
          <p className="mt-2 font-hand text-2xl text-paper">L&apos;ordine cambia tutto.</p>
        </div>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-gold">
          Riserva XII
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {config.instruction ?? "Bringt die Einträge in die richtige Reihenfolge."}
      </p>

      <div className="mt-5 space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable={!solved && !revealed}
            onDragStart={() => setDraggingId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOn(item.id)}
            className={`flex min-h-[58px] items-center gap-3 rounded-md border bg-background/45 px-3 py-2 transition-colors ${
              wrong ? "border-destructive/70" : revealed ? "border-success/60" : "border-border"
            }`}
          >
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 font-display text-base font-semibold">{item.text}</span>
            <span className="font-display text-lg text-gold">{["①", "②", "③", "④", "⑤", "⑥"][item.order - 1]}</span>
            {!solved && !revealed ? (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9"
                  aria-label={`${item.text} nach oben`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9"
                  aria-label={`${item.text} nach unten`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {!revealed && !solved ? (
        <Button className="mt-5 min-h-[48px] w-full" onClick={check}>
          Reihenfolge prüfen
        </Button>
      ) : (
        <div className="mt-5 rounded-md border border-success/50 bg-success/10 p-5 text-center">
          <Label>Extraktion abgeschlossen</Label>
          {showExtraction ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {extraction.split("").map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="grid size-11 place-items-center rounded-md border border-gold/50 bg-background/60 font-display text-xl font-bold text-gold"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-4 font-display text-xl font-bold uppercase text-success">
            {config.successTitle ?? "Ziel identifiziert"}
          </p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-[0.08em] text-paper">
            {resultText}
          </p>
        </div>
      )}

      {wrong ? (
        <p className="mt-3 text-center text-sm text-destructive">
          Diese Reihenfolge ergibt noch keine gültige Spur.
        </p>
      ) : null}
    </div>
  );
}
