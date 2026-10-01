import { useMemo, useState } from "react";
import { Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import type { DnaConfig } from "@/game/types";

const bases = ["A", "T", "G", "C"] as const;
type DnaBase = (typeof bases)[number];
type BaseChoice = DnaBase | "";

const complement: Record<DnaBase, DnaBase> = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

export function DnaPuzzle({
  config,
  solved,
  onSolved,
}: {
  config: DnaConfig;
  solved: boolean;
  onSolved: () => void;
}) {
  const top = useMemo(
    () =>
      config.strand
        .replace(/[^ATGC]/gi, "")
        .toUpperCase()
        .split("") as DnaBase[],
    [config.strand],
  );
  const expected = useMemo(() => top.map((base) => complement[base]), [top]);
  const [answer, setAnswer] = useState<BaseChoice[]>(() =>
    solved ? expected : top.map(() => ""),
  );
  const [wrong, setWrong] = useState(false);
  const [revealed, setRevealed] = useState(solved);

  const choose = (index: number, base: BaseChoice) => {
    if (revealed || solved) return;
    const next = [...answer];
    next[index] = base;
    setAnswer(next);
    setWrong(false);
  };

  const check = () => {
    const ok = answer.every((base, index) => base === expected[index]);
    if (!ok) {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 900);
      return;
    }
    setRevealed(true);
    onSolved();
  };

  return (
    <div className="field-panel p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10">
          <Dna className="size-5 text-primary" />
        </div>
        <div>
          <Label>Genetische Analyse</Label>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {config.prompt ?? "Erstellt den komplementären DNA-Strang."}
          </p>
        </div>
      </div>

      {config.helperText ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {config.helperText}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[720px] rounded-md border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center gap-2 font-display text-xs text-muted-foreground">
            <span className="w-8">5′</span>
            <div className="grid flex-1 grid-cols-12 gap-1">
              {top.map((base, index) => (
                <div
                  key={`top-${index}`}
                  className="grid h-10 place-items-center rounded border border-border bg-panel font-display text-base font-bold text-paper"
                >
                  {base}
                </div>
              ))}
            </div>
            <span className="w-8 text-right">3′</span>
          </div>

          <div className="my-2 grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-center text-xs text-muted-foreground">
            <span />
            <div className="grid grid-cols-12 gap-1">
              {top.map((_, index) => (
                <span key={`bond-${index}`}>│</span>
              ))}
            </div>
            <span />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 font-display text-xs text-muted-foreground">3′</span>
            <div className="grid flex-1 grid-cols-12 gap-1">
              {answer.map((base, index) => (
                <select
                  key={`answer-${index}`}
                  aria-label={`Komplementärbase ${index + 1}`}
                  value={base}
                  disabled={revealed || solved}
                  onChange={(event) =>
                    choose(index, event.target.value as BaseChoice)
                  }
                  className={`h-10 w-full appearance-none rounded border bg-background text-center font-display text-base font-bold outline-none ${
                    wrong
                      ? "border-destructive"
                      : revealed
                        ? "border-success text-success"
                        : "border-border text-primary"
                  }`}
                >
                  <option value="">·</option>
                  {bases.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <span className="w-8 text-right font-display text-xs text-muted-foreground">5′</span>
          </div>
        </div>
      </div>

      {!revealed && !solved ? (
        <Button className="mt-5 min-h-[48px] w-full" onClick={check}>
          Strang prüfen
        </Button>
      ) : (
        <div className="mt-5 rounded-md border border-success/50 bg-success/10 p-5 text-center">
          <Label>{config.successTitle ?? "Probe bestätigt"}</Label>
          <p className="mt-3 font-display text-xl font-bold uppercase text-success">
            {config.revealText}
          </p>
        </div>
      )}

      {wrong ? (
        <p className="mt-3 text-center text-sm text-destructive">
          Mindestens eine Basenpaarung ist noch nicht korrekt.
        </p>
      ) : null}
    </div>
  );
}
