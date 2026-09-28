import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";
import { Label, Reveal, SectionTitle } from "@/components/game/primitives";
import { usePlayer } from "@/game/store";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Expedition Journal — The Hidden Path" },
      {
        name: "description",
        content: "A running log of locations discovered, envelopes found and puzzles solved.",
      },
      { property: "og:title", content: "Expedition Journal — The Hidden Path" },
      { property: "og:description", content: "Locations discovered, envelopes found and puzzles solved." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const journal = usePlayer((s) => s.journal);
  const completed = usePlayer((s) => s.completedStages.length);
  const hints = usePlayer((s) => s.unlockedHints.length);
  const found = usePlayer((s) => s.inventory.length);

  return (
    <GameShell>
      <Reveal>
        <SectionTitle
          eyebrow="Field log"
          title="Journal"
          lead="Everything the expedition has recorded so far, newest first."
        />
      </Reveal>

      <div className="mt-7 grid grid-cols-3 gap-3">
        {[
          ["Stages", `${completed}/${adventure.stages.length}`],
          ["Items", String(found)],
          ["Hints used", String(hints)],
        ].map(([k, v]) => (
          <div key={k} className="field-panel p-4">
            <Label>{k}</Label>
            <p className="mt-1 font-display text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <ol className="mt-8 border-l border-border pl-5">
        {journal.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            The log is empty. It fills itself as you walk.
          </li>
        ) : null}
        {journal.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.03}>
            <li className="relative pb-7">
              <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-primary" />
              <span className="label-mono">{e.time}</span>
              <p className="mt-1 font-display text-base font-semibold uppercase">{e.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{e.detail}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </GameShell>
  );
}
