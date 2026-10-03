import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  FileText,
  LockKeyhole,
  ScanLine,
} from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, Reveal, SectionTitle } from "@/components/game/primitives";
import { adventure, storyFragments } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Archiv — Der verborgene Pfad" },
      {
        name: "description",
        content: "Wiederhergestellte Fragmente des LPDP-Archivs.",
      },
    ],
  }),
  component: ArchivePage,
});

function redactedLines(index: number) {
  const patterns = [
    ["████████ ██████", "████ ████████████ ███ ██████"],
    ["█████ // █████████", "██████████ ████ █████"],
    ["████████████", "████ ██████ ███████ ████"],
  ];
  return patterns[index % patterns.length]!;
}

function ArchivePage() {
  const unlocked = usePlayer((state) => state.unlockedStoryFragments);
  const completed = usePlayer((state) => state.completedStages);

  const recoveredCount = storyFragments.filter((fragment) =>
    unlocked.includes(fragment.id),
  ).length;

  return (
    <GameShell>
      <Reveal>
        <SectionTitle
          eyebrow="LPDP // Wiederherstellung"
          title="Archiv"
          lead="Nicht jede Datei ist ein Hinweis. Manche erklären erst im Rückblick, warum der Pfad überhaupt existiert."
        />
      </Reveal>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="field-panel p-4">
          <Label>Wiederhergestellt</Label>
          <p className="mt-1 font-display text-2xl font-bold">
            {recoveredCount}/{storyFragments.length}
          </p>
        </div>
        <div className="field-panel p-4">
          <Label>Etappen rekonstruiert</Label>
          <p className="mt-1 font-display text-2xl font-bold">
            {completed.length}/{adventure.stages.length}
          </p>
        </div>
        <div className="field-panel p-4">
          <Label>Status</Label>
          <p className="mt-1 font-display text-2xl font-bold uppercase text-gold">
            {recoveredCount === storyFragments.length
              ? "Recovered"
              : "Fragmentiert"}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {storyFragments.map((fragment, index) => {
          const isUnlocked = unlocked.includes(fragment.id);
          const stage = adventure.stages.find(
            (entry) => entry.id === fragment.stageId,
          );

          return (
            <Reveal key={fragment.id} delay={index * 0.025}>
              <article
                className={`field-panel overflow-hidden ${
                  isUnlocked ? "border-gold/30" : "opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-border bg-background/25 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Label>
                        {stage
                          ? `Etappe ${String(stage.number).padStart(2, "0")}`
                          : "Archiv"}
                      </Label>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-success">
                          <CheckCircle2 className="size-3.5" />
                          recovered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          <LockKeyhole className="size-3.5" />
                          encrypted
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 font-display text-xl font-bold uppercase">
                      {isUnlocked ? fragment.title : `Datei ${String(index + 1).padStart(2, "0")}`}
                    </h2>
                  </div>

                  <div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-surface">
                    {isUnlocked ? (
                      <FileText className="size-4 text-gold" />
                    ) : (
                      <ScanLine className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {isUnlocked ? (
                    <>
                      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <span>CODE: {fragment.archiveCode ?? "—"}</span>
                        <span>SOURCE: {fragment.author ?? "UNKNOWN"}</span>
                      </div>
                      <p className="whitespace-pre-line font-hand text-xl leading-relaxed text-paper sm:text-2xl">
                        {fragment.text}
                      </p>
                    </>
                  ) : (
                    <div aria-label="Datei noch verschlüsselt">
                      {redactedLines(index).map((line) => (
                        <p
                          key={line}
                          className="mb-3 font-mono text-sm tracking-wider text-muted-foreground/50"
                        >
                          {line}
                        </p>
                      ))}
                      <p className="mt-5 text-xs text-muted-foreground">
                        Diese Datei wird durch eine spätere Etappe rekonstruiert.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-md border border-gold/30 bg-gold/5 p-5">
        <Archive className="mt-0.5 size-5 shrink-0 text-gold" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Das Archiv ist keine Aufgabenliste. Einige Einträge verändern nur die
          Bedeutung von Dingen, die ihr schon gesehen habt.
        </p>
      </div>
    </GameShell>
  );
}
