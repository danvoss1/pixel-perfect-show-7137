import { useState } from "react";
import { Label } from "../game/primitives";
import type { SymbolsConfig } from "@/game/types";

export function SymbolPuzzle({
  config,
  onSolved,
  solved,
}: {
  config: SymbolsConfig;
  onSolved: () => void;
  solved: boolean;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong" | "ok">(solved ? "ok" : "idle");

  return (
    <div className="field-panel p-5">
      <Label>Entschlüsselungstabelle</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(config.table).map(([sym, letter]) => (
          <span
            key={sym}
            className="rounded-md border border-border bg-background/50 px-3 py-2 font-display text-sm"
          >
            <span className="text-gold">{sym}</span> = {letter}
          </span>
        ))}
      </div>

      <Label className="mt-6">Verschlüsselte Zeile</Label>
      <p className="mt-2 font-display text-3xl tracking-[0.3em] text-gold">{config.encoded}</p>

      <input
        aria-label="Entschlüsselte Nachricht"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Entschlüsselte Nachricht"
        className="mt-5 h-14 w-full rounded-md border border-border bg-background/60 px-4 font-display uppercase tracking-[0.2em] outline-none focus:border-primary"
      />
      <button
        onClick={() => {
          if (value.trim().toUpperCase() === config.answer.toUpperCase()) {
            setStatus("ok");
            onSolved();
          } else setStatus("wrong");
        }}
        className="mt-3 min-h-[48px] w-full rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground"
      >
        Entschlüsseln
      </button>
      {status === "wrong" ? (
        <p className="mt-3 text-center text-sm text-destructive">Das ist nicht die gesuchte Nachricht.</p>
      ) : null}
      {status === "ok" ? (
        <p className="mt-3 text-center font-display text-sm uppercase tracking-[0.2em] text-success">
          Nachricht entschlüsselt
        </p>
      ) : null}
    </div>
  );
}
