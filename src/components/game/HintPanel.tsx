import { AnimatePresence, motion } from "motion/react";
import { Lock, Lightbulb } from "lucide-react";
import { usePlayer } from "@/game/store";
import type { Hint } from "@/game/types";
import { Label } from "./primitives";

export function HintPanel({ puzzleId, hints }: { puzzleId: string; hints: Hint[] }) {
  const unlocked = usePlayer((s) => s.unlockedHints);
  const unlockHint = usePlayer((s) => s.unlockHint);

  return (
    <div className="field-panel p-5">
      <Label>Hints</Label>
      <div className="mt-4 space-y-2">
        {hints.map((hint, i) => {
          const key = `${puzzleId}:${hint.id}`;
          const isOpen = unlocked.includes(key);
          const prevOpen = i === 0 || unlocked.includes(`${puzzleId}:${hints[i - 1]?.id}`);
          return (
            <div key={hint.id} className="rounded-md border border-border bg-background/40">
              <button
                disabled={!prevOpen || isOpen}
                onClick={() => unlockHint(key)}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left disabled:cursor-not-allowed"
              >
                <span className="font-display text-sm font-semibold uppercase tracking-wide">
                  {hint.label}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {isOpen ? "Revealed" : prevOpen ? "Reveal" : "Locked"}
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
        Hints are recorded in your expedition log.
      </p>
    </div>
  );
}
