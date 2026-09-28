import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SimonConfig } from "@/game/types";

export function SimonGame({ config, solved, onSolved }: { config: SimonConfig; solved: boolean; onSolved: () => void }) {
  const [round, setRound] = useState(1);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(-1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!playing) return; let index = 0; const timer = window.setInterval(() => { setLit(-1); window.setTimeout(() => setLit(config.sequence[index] ?? -1), 130); index++; if (index >= round) { window.clearInterval(timer); window.setTimeout(() => { setLit(-1); setPlaying(false); }, 800); } }, 850); return () => window.clearInterval(timer); }, [round, playing, config.sequence]);
  const press = (index: number) => {
    if (playing || solved) return;
    if (config.sequence[step] !== index) { setStep(0); setRound(1); return; }
    if (step + 1 === round) { setStep(0); if (round === config.sequence.length) onSolved(); else setRound(round + 1); }
    else setStep(step + 1);
  };
  return <div className="field-panel mx-auto max-w-md p-5"><p className="label-mono">Signalfolge · Runde {round} / {config.sequence.length}</p><div className="mt-5 grid grid-cols-2 gap-3">{["Nord", "Ost", "Süd", "West"].map((name, i) => <Button key={name} variant="outline" disabled={playing || solved} onClick={() => press(i)} className={`min-h-[96px] border-2 text-lg ${lit === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"}`}>{name}</Button>)}</div><Button onClick={() => { setStep(0); setPlaying(true); }} disabled={playing || solved} className="mt-4 min-h-[48px] w-full">{round === 1 ? "Signal abspielen" : "Nächste Folge abspielen"}</Button>{solved && <p className="mt-3 text-center text-success">Signal entschlüsselt.</p>}</div>;
}