import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { GameShell } from "@/components/game/GameShell";
import { Label } from "@/components/game/primitives";
import { adventure, puzzles } from "@/game/data";
import { useElapsed, usePlayer } from "@/game/store";

export const Route = createFileRoute("/complete")({
  head: () => ({
    meta: [
      { title: "Expedition Complete — The Hidden Path" },
      { name: "description", content: "The closing record of your expedition: time, puzzles solved and distance walked." },
      { property: "og:title", content: "Expedition Complete — The Hidden Path" },
      { property: "og:description", content: "Time, puzzles solved, hints used and distance walked." },
    ],
  }),
  component: CompletePage,
});

function CompletePage() {
  const elapsed = useElapsed();
  const solved = usePlayer((s) => s.completedPuzzles.length);
  const hints = usePlayer((s) => s.unlockedHints.length);
  const visited = usePlayer((s) => s.visitedLocations.length);
  const reset = usePlayer((s) => s.reset);

  const stats = [
    ["Completed in", elapsed],
    ["Puzzles solved", `${solved} / ${puzzles.length}`],
    ["Hints used", String(hints)],
    ["Locations discovered", String(visited)],
    ["Distance travelled", "7.2 km"],
    ["Stages", `${adventure.stages.length} / ${adventure.stages.length}`],
  ];

  return (
    <GameShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-6 text-center"
      >
        <Label>Expedition complete</Label>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,9vw,4.5rem)] font-bold uppercase leading-none text-gold">
          The Hidden Path
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The last envelope is open. What was left behind is yours to keep.
        </p>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="field-panel p-4"
          >
            <Label>{k}</Label>
            <p className="mt-1 font-display text-xl font-bold">{v}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/journal"
          className="grid min-h-[52px] flex-1 place-items-center rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground"
        >
          View journal
        </Link>
        <Link
          to="/adventure"
          className="grid min-h-[52px] flex-1 place-items-center rounded-md border border-border font-display text-sm font-bold uppercase tracking-[0.2em]"
        >
          Review journey
        </Link>
      </div>

      <button
        onClick={reset}
        className="mt-6 block w-full text-center label-mono hover:text-destructive"
      >
        Reset expedition
      </button>
    </GameShell>
  );
}
