import { useState } from "react";
import { motion } from "motion/react";
import { Label } from "../game/primitives";

export function CodeInput({
  length,
  kind,
  expected,
  onSolved,
}: {
  length: number;
  kind: "pin" | "word" | "coordinates";
  expected: string;
  onSolved: () => void;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "denied" | "granted">("idle");

  const submit = () => {
    if (value.trim().toUpperCase() === expected.toUpperCase()) {
      setState("granted");
      onSolved();
    } else {
      setState("denied");
      setTimeout(() => setState("idle"), 900);
    }
  };

  const digits = kind === "pin";

  return (
    <div className="field-panel p-5">
      <Label>Code eingeben</Label>
      <motion.div className={state === "denied" ? "shake mt-4" : "mt-4"}>
        {digits ? (
          <div className="flex gap-2">
            {Array.from({ length }).map((_, i) => (
              <div
                key={i}
                className="grid h-14 flex-1 place-items-center rounded-md border border-border bg-background/60 font-display text-2xl font-bold"
              >
                {value[i] ?? ""}
              </div>
            ))}
            <input
              aria-label="Code"
              inputMode="numeric"
              autoComplete="off"
              className="sr-only"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, length))}
            />
          </div>
        ) : (
          <input
            aria-label="Code"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={kind === "coordinates" ? "50.9412, 6.9694" : "Wort eingeben"}
            className="h-14 w-full rounded-md border border-border bg-background/60 px-4 font-display text-lg uppercase tracking-[0.2em] outline-none focus:border-primary"
          />
        )}
      </motion.div>

      {digits ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "DEL"].map((k) => (
            <button
              key={k === "CLR" ? "LEER" : k}
              onClick={() => {
                if (k === "CLR") setValue("");
                else if (k === "DEL") setValue((v) => v.slice(0, -1));
                else setValue((v) => (v.length < length ? v + k : v));
              }}
              className="min-h-[52px] rounded-md border border-border bg-background/40 font-display text-lg font-semibold transition-colors hover:bg-accent"
            >
              {k === "CLR" ? "LEER" : k}
            </button>
          ))}
        </div>
      ) : null}

      <button
        onClick={submit}
        className="mt-4 min-h-[48px] w-full rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        Entsperren
      </button>

      {state === "denied" ? (
        <p className="mt-3 text-center font-display text-sm uppercase tracking-[0.2em] text-destructive">
          Zugriff verweigert
        </p>
      ) : null}
      {state === "granted" ? (
        <p className="mt-3 text-center font-display text-sm uppercase tracking-[0.2em] text-success">
          Schloss geöffnet
        </p>
      ) : null}
    </div>
  );
}
