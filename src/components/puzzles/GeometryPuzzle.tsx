import { useMemo, useState } from "react";
import { Boxes, Check, ScanLine } from "lucide-react";
import { motion } from "motion/react";
import { Label } from "@/components/game/primitives";
import type { GeometryConfig } from "@/game/types";

const normalize = (value: string) =>
  value
    .trim()
    .toLocaleUpperCase("de-DE")
    .replace(/Ä/g, "AE")
    .replace(/Ö/g, "OE")
    .replace(/Ü/g, "UE")
    .replace(/ß/g, "SS")
    .replace(/[^A-Z0-9]/g, "");

export function GeometryPuzzle({
  config,
  solved,
  onSolved,
}: {
  config: GeometryConfig;
  solved: boolean;
  onSolved: () => void;
}) {
  const [value, setValue] = useState("");
  const [denied, setDenied] = useState(false);
  const accepted = useMemo(
    () => config.answers.map(normalize),
    [config.answers],
  );

  const submit = () => {
    if (accepted.includes(normalize(value))) {
      if (!solved) onSolved();
      setDenied(false);
      return;
    }

    setDenied(true);
    window.setTimeout(() => setDenied(false), 900);
  };

  return (
    <div className="field-panel p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-background/50">
          <ScanLine className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <Label>Geometrische Analyse</Label>
          <h2 className="mt-1 font-display text-xl font-bold uppercase">
            {config.prompt}
          </h2>
          {config.helperText ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {config.helperText}
            </p>
          ) : null}
        </div>
      </div>

      {!solved ? (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <motion.div className={denied ? "shake" : ""}>
            <input
              aria-label="Name des geometrischen Körpers"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Körper eingeben"
              className="h-14 w-full rounded-md border border-border bg-background/60 px-4 font-display text-lg uppercase tracking-[0.12em] outline-none transition-colors focus:border-primary"
            />
          </motion.div>

          <button
            type="submit"
            className="mt-3 min-h-[50px] w-full rounded-md bg-primary px-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            {config.submitLabel ?? "Analyse starten"}
          </button>

          {denied ? (
            <p className="mt-3 text-center font-display text-xs uppercase tracking-[0.16em] text-destructive">
              {config.errorText ?? "Form nicht erkannt"}
            </p>
          ) : null}
        </form>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-success/40 bg-success/5">
          <div className="flex items-center gap-3 border-b border-success/30 px-4 py-4">
            <div className="grid size-10 place-items-center rounded-full border border-success/40">
              <Check className="size-5 text-success" />
            </div>
            <div>
              <Label>Objekt erkannt</Label>
              <p className="mt-1 font-display text-xl font-bold uppercase text-success">
                {config.shapeName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-4 text-center">
              <span className="label-mono">Flächen</span>
              <p className="mt-1 font-display text-2xl font-bold">{config.faces}</p>
            </div>
            <div className="p-4 text-center">
              <span className="label-mono">Dimension</span>
              <p className="mt-1 font-display text-2xl font-bold">{config.dimension}D</p>
            </div>
            <div className="p-4 text-center">
              <span className="label-mono">Referenz</span>
              <p className="mt-1 font-display text-2xl font-bold">
                {config.archiveReference ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <Boxes className="size-4 shrink-0 text-primary" />
            Dritte Dimension bestätigt. Ein neuer Bereich wurde freigegeben.
          </div>
        </div>
      )}
    </div>
  );
}
