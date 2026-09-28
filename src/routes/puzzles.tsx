import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";
import { Label, Reveal, SectionTitle, StatusChip } from "@/components/game/primitives";
import { adventure, puzzles, stageById } from "@/game/data";
import { usePlayer } from "@/game/store";
import { puzzleTypeLabel } from "@/game/labels";

export const Route = createFileRoute("/puzzles")({
  head: () => ({
    meta: [
      { title: "Hinweise & Rätsel — Der verborgene Pfad" },
      {
        name: "description",
        content: "Alle Chiffren, Codes und Herausforderungen der Expedition: aktiv, gelöst oder noch versiegelt.",
      },
      { property: "og:title", content: "Hinweise & Rätsel — Der verborgene Pfad" },
      { property: "og:description", content: "Aktive, gelöste und versiegelte Herausforderungen der Expedition." },
    ],
  }),
  component: PuzzleHub,
});

function PuzzleHub() {
  const solved = usePlayer((s) => s.completedPuzzles);
  const currentId = usePlayer((s) => s.currentStageId);
  const currentNumber = adventure.stages.find((s) => s.id === currentId)?.number ?? 1;

  const withStatus = puzzles.map((p) => {
    const stage = stageById(p.stageId);
    const status = solved.includes(p.id)
      ? ("completed" as const)
      : (stage?.number ?? 99) <= currentNumber
        ? ("active" as const)
        : ("locked" as const);
    return { puzzle: p, stage, status };
  });

  return (
    <GameShell>
      <Reveal>
        <SectionTitle
          eyebrow="Feldnotizen"
          title="Hinweise & Rätsel"
          lead="Jedes Rätsel gehört zu einer Etappe. Versiegelte Einträge öffnen sich, wenn die Spur weiterführt."
        />
      </Reveal>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {withStatus.map(({ puzzle, stage, status }, i) => {
          const locked = status === "locked";
          return (
            <Reveal key={puzzle.id} delay={i * 0.04}>
              <Link
                to="/puzzle/$id"
                params={{ id: puzzle.id }}
                disabled={locked}
                className={`block h-full rounded-lg border p-5 transition-colors ${
                  locked
                    ? "pointer-events-none border-border/60 bg-surface/30"
                    : "border-border bg-surface/60 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Label>
                    {stage ? `Etappe ${String(stage.number).padStart(2, "0")}` : "Nebenspur"} ·{" "}
                    {puzzleTypeLabel[puzzle.type]}
                  </Label>
                  <StatusChip status={status} />
                </div>
                <h2
                  className={`mt-3 font-display text-lg font-bold uppercase ${locked ? "locked-blur" : ""}`}
                >
                  {locked ? "Unbekanntes Signal" : puzzle.title}
                </h2>
                <p className={`mt-1 text-sm text-muted-foreground ${locked ? "locked-blur" : ""}`}>
                  {locked ? "Noch kein Signal." : puzzle.tagline}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </GameShell>
  );
}
