import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { KeyRound, Lock, Lightbulb, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/game/store";
import type { Hint } from "@/game/types";
import { isHintCodeValid } from "@/game/hintCodes";
import { Label } from "./primitives";

export function HintPanel({
  puzzleId,
  hints,
}: {
  puzzleId: string;
  hints: Hint[];
}) {
  const unlocked = usePlayer((state) => state.unlockedHints);
  const unlockHint = usePlayer((state) => state.unlockHint);

  const [pending, setPending] = useState<Hint | null>(null);
  const [code, setCode] = useState("");
  const [denied, setDenied] = useState(false);

  const close = () => {
    setPending(null);
    setCode("");
    setDenied(false);
  };

  const reveal = () => {
    if (!pending) return;

    if (!isHintCodeValid(puzzleId, pending.id, code)) {
      setDenied(true);
      window.setTimeout(() => setDenied(false), 900);
      return;
    }

    unlockHint(`${puzzleId}:${pending.id}`);
    close();
  };

  return (
    <div className="field-panel p-5">
      <Label>Hinweise</Label>

      <div className="mt-4 space-y-2">
        {hints.map((hint, index) => {
          const key = `${puzzleId}:${hint.id}`;
          const isOpen = unlocked.includes(key);
          const previousOpen =
            index === 0 ||
            unlocked.includes(`${puzzleId}:${hints[index - 1]?.id}`);

          return (
            <div
              key={hint.id}
              className="rounded-md border border-border bg-background/40"
            >
              <button
                disabled={!previousOpen || isOpen}
                onClick={() => {
                  setPending(hint);
                  setCode("");
                  setDenied(false);
                }}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left disabled:cursor-not-allowed"
              >
                <span className="font-display text-sm font-semibold uppercase tracking-wide">
                  {hint.label}
                </span>

                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {isOpen
                    ? "Aufgedeckt"
                    : previousOpen
                      ? "Code nötig"
                      : "Gesperrt"}
                  {isOpen ? (
                    <Lightbulb className="size-4 text-gold" />
                  ) : previousOpen ? (
                    <KeyRound className="size-4" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden px-4 pb-4 font-hand text-xl text-paper"
                  >
                    {hint.text}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Für jeden Hinweis existiert ein eigener Freischaltcode der Spielleitung.
      </p>

      {pending ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Hinweis freischalten"
        >
          <div className="field-panel w-full max-w-lg p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-md border border-gold/40 bg-gold/10">
                <Phone className="size-4 text-gold" />
              </div>
              <div>
                <Label>{pending.label}</Label>
                <h2 className="mt-1 font-display text-xl font-bold uppercase">
                  Spielleitung kontaktieren
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Wenn ihr diesen Hinweis benötigt, ruft die Spielleitung an.
              Ihr bekommt einen Code, der ausschließlich diesen Hinweis
              freischaltet.
            </p>

            <label className="mt-5 block">
              <span className="label-mono">Freischaltcode</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") reveal();
                }}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder="HP-XXX-XXX"
                className={`mt-2 h-12 w-full rounded-md border bg-background/60 px-4 font-mono uppercase tracking-[0.12em] outline-none focus:border-primary ${
                  denied ? "border-destructive" : "border-border"
                }`}
              />
            </label>

            {denied ? (
              <p className="mt-3 text-sm text-destructive">
                Dieser Code gehört nicht zu diesem Hinweis.
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={close}>
                Abbrechen
              </Button>
              <Button disabled={!code.trim()} onClick={reveal}>
                Code prüfen
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
