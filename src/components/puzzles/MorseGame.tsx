import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MorseConfig } from "@/game/types";

export function MorseGame({ config, solved, onSolved }: { config: MorseConfig; solved: boolean; onSolved: () => void }) {
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  return <div className="field-panel mx-auto max-w-lg p-5"><p className="label-mono">Empfangene Übertragung</p><p className="my-8 text-center font-display text-3xl text-gold sm:text-5xl">{config.code}</p><p className="text-xs text-muted-foreground">Morsealphabet: S ··· · O ––– · R ·–· · N –· · T –</p><form onSubmit={(e) => { e.preventDefault(); if (answer.trim().toUpperCase() === config.answer) { setWrong(false); onSolved(); } else setWrong(true); }} className="mt-5 flex gap-2"><input value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label="Entschlüsselter Funkspruch" disabled={solved} className="min-h-[48px] min-w-0 flex-1 rounded-md border border-border bg-surface px-4 uppercase" /><Button type="submit" disabled={solved || !answer.trim()}>Entschlüsseln</Button></form>{wrong && <p role="alert" className="mt-3 text-sm text-destructive">Die Übertragung ist noch nicht richtig entschlüsselt.</p>}</div>;
}