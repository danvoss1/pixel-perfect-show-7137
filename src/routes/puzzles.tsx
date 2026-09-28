import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";
import { Label, Reveal, SectionTitle, StatusChip } from "@/components/game/primitives";
import { adventure, puzzles, stageById } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/puzzles")({
  head: () => ({
    meta: [
      { title: "Clues & Puzzles — The Hidden Path" },
      {
        name: "description",
        content: "Every cipher, code and challenge in the expedition: active, solved and still sealed.",
      },
      { property: "og:title", content: "Clues & Puzzles — The Hidden Path" },
      { property: "og:description", content: "Active, solved and sealed challenges of the expedition." },
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
          eyebrow="Field log"
          title="Clues & Puzzles"
          lead="Each challenge belongs to a stage. Sealed entries reveal themselves as the trail continues."
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
                    {stage ? `Stage ${String(stage.number).padStart(2, "0")}` : "Side entry"} ·{" "}
                    {puzzle.type}
                  </Label>
                  <StatusChip status={status} />
                </div>
                <h2
                  className={`mt-3 font-display text-lg font-bold uppercase ${locked ? "locked-blur" : ""}`}
                >
                  {locked ? "Unknown signal" : puzzle.title}
                </h2>
                <p className={`mt-1 text-sm text-muted-foreground ${locked ? "locked-blur" : ""}`}>
                  {locked ? "No transmission yet." : puzzle.tagline}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </GameShell>
  );
}
