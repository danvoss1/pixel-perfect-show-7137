import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MastermindConfig } from "@/game/types";

export function MastermindGame({ config, solved, onSolved }: { config: MastermindConfig; solved: boolean; onSolved: () => void }) {
  const [guess, setGuess] = useState("");
  const [rows, setRows] = useState<{ value: string; exact: number; misplaced: number }[]>([]);
  const submit = () => {
    if (guess.length !== config.secret.length || solved) return;
    const exact = [...guess].filter((digit, i) => digit === config.secret[i]).length;
    const total = [...new Set(guess)].reduce((sum, digit) => sum + Math.min([...guess].filter((d) => d === digit).length, [...config.secret].filter((d) => d === digit).length), 0);
    setRows([...rows, { value: guess, exact, misplaced: total - exact }]);
    if (exact === config.secret.length) onSolved();
    setGuess("");
  };
  return <div className="field-panel mx-auto max-w-lg p-5"><p className="label-mono">Codeknacker · {rows.length} / {config.attempts} Versuche</p>
    <div className="mt-4 space-y-2">{rows.map((row, i) => <div key={i} className="flex items-center justify-between border-b border-border py-2 font-display"><span className="text-xl font-bold tracking-widest">{row.value}</span><span className="text-xs text-muted-foreground">{row.exact} richtig platziert · {row.misplaced} am falschen Platz</span></div>)}</div>
    {rows.length >= config.attempts && !solved ? <Button variant="outline" onClick={() => { setRows([]); setGuess(""); }} className="mt-5 min-h-[44px]">Erneut versuchen</Button> : !solved ? <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-5 flex gap-2"><input inputMode="numeric" pattern="[0-9]*" maxLength={config.secret.length} value={guess} onChange={(e) => setGuess(e.target.value.replace(/\D/g, ""))} aria-label="Zahlenkombination" className="min-h-[48px] min-w-0 flex-1 rounded-md border border-border bg-surface px-4 font-display text-xl tracking-widest" /><Button type="submit" disabled={guess.length !== config.secret.length}>Prüfen</Button></form> : <p className="mt-4 text-success">Schloss geöffnet.</p>}
  </div>;
}