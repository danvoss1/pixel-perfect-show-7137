import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Lock, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoProof } from "./VideoProof";
import { usePlayer } from "@/game/store";
import type { Hint } from "@/game/types";
import { Label } from "./primitives";

export function HintPanel({ puzzleId, hints }: { puzzleId: string; hints: Hint[] }) {
  const unlocked = usePlayer((s) => s.unlockedHints);
  const unlockHint = usePlayer((s) => s.unlockHint);
  const [pending, setPending] = useState<Hint | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const reveal = () => {
    if (!pending) return;
    unlockHint(`${puzzleId}:${pending.id}`);
    setPending(null);
    setConfirmed(false);
  };

  return (
    <div className="field-panel p-5">
      <Label>Hinweise</Label>
      <div className="mt-4 space-y-2">
        {hints.map((hint, i) => {
          const key = `${puzzleId}:${hint.id}`;
          const isOpen = unlocked.includes(key);
          const prevOpen = i === 0 || unlocked.includes(`${puzzleId}:${hints[i - 1]?.id}`);
          return (
            <div key={hint.id} className="rounded-md border border-border bg-background/40">
              <button
                disabled={!prevOpen || isOpen}
                onClick={() => { setPending(hint); setConfirmed(false); }}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left disabled:cursor-not-allowed"
              >
                <span className="font-display text-sm font-semibold uppercase tracking-wide">
                  {hint.label}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {isOpen ? "Aufgedeckt" : prevOpen ? "Aufdecken" : "Gesperrt"}
                  {isOpen ? (
                    <Lightbulb className="size-4 text-gold" />
                  ) : prevOpen ? (
                    <Lightbulb className="size-4" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden px-4 pb-4 font-hand text-xl text-paper"
                  >
                    {hint.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Hinweise werden im Expeditionslog festgehalten.
      </p>
      {pending && <div className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-4" role="dialog" aria-modal="true" aria-label="Hinweis freischalten">
        <div className="field-panel w-full max-w-lg p-5 shadow-lg">
          <Label>Hinweis {pending.label}</Label><h2 className="mt-2 font-display text-xl font-bold uppercase">Hinweis freischalten</h2>
          <p className="mt-3 text-sm text-muted-foreground">{pending.costDescription ?? (pending.cost === "time" ? "Dieser Hinweis verlängert deine Spielzeit." : "Dieser Hinweis wird im Expeditionslog vermerkt.")}</p>
           {pending.cost === "video" && <div className="mt-4 space-y-3"><p className="text-sm text-gold">Keine Aufnahme und kein Getränk sind für diesen Hinweis erforderlich. Jede Teilnahme ist freiwillig.</p><VideoProof onConfirm={() => setConfirmed(true)} /><label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> Ohne Video und ohne Trinkaufgabe fortfahren</label></div>}
           <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setPending(null)}>Abbrechen</Button><Button disabled={pending.cost === "video" && !confirmed} onClick={reveal}>Hinweis öffnen</Button></div>
        </div>
      </div>}
    </div>
  );
}
