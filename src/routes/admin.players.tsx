import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/game/store";
import { adventure, puzzles } from "@/game/data";

export const Route = createFileRoute("/admin/players")({
  head: () => ({
    meta: [
      { title: "Spielende — Verwaltung" },
      { name: "description", content: "Fortschritt, Spielzeit und Hinweisnutzung der Spielenden verfolgen." },
      { property: "og:title", content: "Spielende — Verwaltung" },
      { property: "og:description", content: "Fortschritt, Spielzeit und Hinweisnutzung pro Person." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungSpielende,
});

const players = [
  {
    name: "Daniel",
    stage: "5 / 8",
    started: "18:04",
    elapsed: "01:42",
    hints: 2,
    last: "vor 2 Min.",
    location: "Kontrollpunkt im Wald",
    puzzles: ["Worträtsel ✓", "Schiebepuzzle ✓", "Umschlag Nr. 03 ✓", "3D-Raum aktiv"],
  },
  {
    name: "Mira",
    stage: "3 / 8",
    started: "18:20",
    elapsed: "01:26",
    hints: 0,
    last: "gerade eben",
    location: "Alte Eisenbahnbrücke",
    puzzles: ["Versiegelte Anweisung ✓", "Umschlag Nr. 03 offen"],
  },
  {
    name: "Jonas",
    stage: "7 / 8",
    started: "17:41",
    elapsed: "02:05",
    hints: 4,
    last: "vor 8 Min.",
    location: "Tür ohne Nummer",
    puzzles: ["Worträtsel ✓", "Route ✓", "3D-Raum ✓"],
  },
];

function VerwaltungSpielende() {
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const progress = usePlayer((s) => s);
  const selected = players.find((p) => p.name === open);

  return (
    <AdminShell title="Spielende" lead="Beispielprofile; nur der lokale Testspielstand ist steuerbar.">
      <div className="mb-5 border-b border-border pb-4"><p className="label-mono">Dieser Browser · Testspielstand</p><p className="mt-1 text-sm">Etappe {adventure.stages.find((stage) => stage.id === progress.currentStageId)?.number ?? 1} · {progress.completedPuzzles.length} Rätsel gelöst · {progress.unlockedHints.length} Hinweise verwendet</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => { progress.advanceStage(); setNotice("Nächste Etappe für diesen Testspielstand freigegeben."); }}>Etappe freigeben</Button><Button variant="outline" onClick={() => { const puzzle = puzzles.find((p) => p.stageId === progress.currentStageId); if (puzzle) { progress.resetPuzzle(puzzle.id); setNotice("Rätsel im aktuellen Testspielstand zurückgesetzt."); } else setNotice("In dieser Etappe gibt es kein Rätsel."); }}>Rätsel zurücksetzen</Button><Button variant="outline" onClick={() => { const puzzle = puzzles.find((p) => p.stageId === progress.currentStageId); const hint = puzzle?.hints[0]; if (hint && puzzle) { progress.unlockHint(`${puzzle.id}:${hint.id}`); setNotice("Erster Hinweis freigegeben."); } else setNotice("Hier gibt es keinen Hinweis."); }}>Hinweis freigeben</Button><Button variant="destructive" onClick={() => { if (window.confirm("Den lokalen Testspielstand wirklich zurücksetzen?")) { progress.reset(); setNotice("Testspielstand zurückgesetzt."); } }}>Spielstand zurücksetzen</Button></div>{notice && <p role="status" className="mt-2 text-sm text-success">{notice}</p>}</div>
      <AdminTable
        head={["Spieler/in", "Aktuelle Etappe", "Beginn", "Spielzeit", "Hinweise", "Letzte Aktivität"]}
        rows={players.map((p) => [
          <button key="n" onClick={() => setOpen(p.name)} className="font-medium hover:text-primary">
            {p.name}
          </button>,
          p.stage,
          p.started,
          p.elapsed,
          String(p.hints),
          p.last,
        ])}
      />

      {selected ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-bold uppercase">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">
                Etappe {selected.stage} · {selected.location}
              </p>
            </div>
            <button onClick={() => setOpen(null)} className="text-sm text-muted-foreground">
              Schließen
            </button>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm">
            {selected.puzzles.map((p) => (
              <li key={p} className="rounded-md border border-border bg-background/40 px-3 py-2">
                {p}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs text-muted-foreground">Beispielprofil ohne Verbindung zu einem echten Spielstand.</p>
        </div>
      ) : null}
    </AdminShell>
  );
}
