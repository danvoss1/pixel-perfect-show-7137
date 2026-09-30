import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, ScanLine } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, LockedContent, Panel, Reveal } from "@/components/game/primitives";
import { storyFragmentById } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/3d")({
  head: () => ({
    meta: [
      { title: "3D — Der verborgene Pfad" },
      {
        name: "description",
        content: "Ein verborgener Bereich der Expedition.",
      },
    ],
  }),
  component: ThreeDArchive,
});

function ThreeDArchive() {
  const unlocked = usePlayer((s) => s.unlockedFeatures.includes("3d"));
  const storyUnlocked = usePlayer((s) =>
    s.unlockedStoryFragments.includes("story-03"),
  );
  const fragment = storyFragmentById("story-03");

  if (!unlocked) {
    return (
      <GameShell>
        <LockedContent note="Für diesen Bereich fehlt noch die dritte Dimension." />
        <Link
          to="/adventure"
          className="mt-6 block text-center label-mono text-primary"
        >
          Zurück zur Expedition
        </Link>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <Reveal>
        <Label>Verborgener Bereich · 3D</Label>
        <div className="mt-3 flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/5">
            <Box className="size-7 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
              Archivierte Szene
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Die geometrische Projektion hat einen zuvor unsichtbaren Bereich des
              Archivs freigegeben. Die Rekonstruktion kann nun geladen werden.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <Panel className="mt-7" glow>
          <div className="flex items-center gap-3">
            <ScanLine className="size-5 text-primary" />
            <div>
              <Label>Rekonstruktionsschnittstelle</Label>
              <p className="mt-1 font-display text-lg font-semibold uppercase">
                Szene 01 · Heumarkt
              </p>
            </div>
          </div>

          <div className="mt-5 grid min-h-[300px] place-items-center rounded-lg border border-dashed border-border bg-background/30 p-6 text-center">
            <div className="max-w-md">
              <Box className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.18em]">
                3D-Schnittstelle aktiv
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Dieser Bereich ist für die Heumarkt-Rekonstruktion reserviert. Dein
                bestehendes 3D-Modell kann hier im nächsten Schritt direkt eingebunden
                werden.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {storyUnlocked && fragment ? (
        <Reveal delay={0.12}>
          <Panel className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <Label>{fragment.title}</Label>
              {fragment.archiveCode ? (
                <span className="label-mono text-primary">
                  {fragment.archiveCode}
                </span>
              ) : null}
            </div>
            <p className="mt-4 font-hand text-2xl leading-relaxed text-paper">
              {fragment.text}
            </p>
            {fragment.author ? (
              <p className="mt-4 label-mono text-muted-foreground">
                — {fragment.author}
              </p>
            ) : null}
          </Panel>
        </Reveal>
      ) : null}
    </GameShell>
  );
}
