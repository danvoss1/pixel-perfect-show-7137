import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, Panel, ProgressRing, Reveal, StatusChip } from "@/components/game/primitives";
import { adventure, locationById } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/adventure")({
  head: () => ({
    meta: [
      { title: "Adventure — The Hidden Path" },
      {
        name: "description",
        content: "Your expedition home: current objective, stage timeline and progress through The Hidden Path.",
      },
      { property: "og:title", content: "Adventure — The Hidden Path" },
      { property: "og:description", content: "Current objective, stage timeline and expedition progress." },
    ],
  }),
  component: AdventureHome,
});

function AdventureHome() {
  const completed = usePlayer((s) => s.completedStages);
  const currentId = usePlayer((s) => s.currentStageId);
  const current = adventure.stages.find((s) => s.id === currentId) ?? adventure.stages[0];
  const location = locationById(current.locationId);

  return (
    <GameShell>
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Label>{adventure.city} · Expedition 01</Label>
            <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-none sm:text-5xl">
              {adventure.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{adventure.subtitle}</p>
          </div>
          <ProgressRing value={completed.length} total={adventure.stages.length} />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <Panel className="mt-7" glow>
          <Label>Current objective</Label>
          <p className="mt-3 font-display text-xl font-semibold">{current.objective}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <Label>Distance</Label>
              <p className="mt-1 font-display text-lg">{location?.distance ?? "—"}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="mt-1 font-display text-lg text-primary">
                Stage {String(current.number).padStart(2, "0")} active
              </p>
            </div>
          </div>
          <Link
            to="/stage/$id"
            params={{ id: current.id }}
            className="mt-6 flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open current stage <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </Reveal>

      <div className="mt-10">
        <Label>Expedition timeline</Label>
        <ol className="mt-4 space-y-2">
          {adventure.stages.map((stage, i) => {
            const status = completed.includes(stage.id)
              ? "completed"
              : stage.id === currentId
                ? "active"
                : "locked";
            const locked = status === "locked";
            return (
              <Reveal key={stage.id} delay={0.04 * i}>
                <li>
                  <Link
                    to="/stage/$id"
                    params={{ id: stage.id }}
                    disabled={locked}
                    className={`flex items-center gap-4 rounded-lg border px-4 py-4 transition-colors ${
                      locked
                        ? "pointer-events-none border-border/60 bg-surface/30"
                        : "border-border bg-surface/60 hover:bg-accent/50"
                    }`}
                  >
                    <span className="font-display text-2xl font-bold text-muted-foreground">
                      {String(stage.number).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-display text-base font-semibold uppercase ${
                          locked ? "locked-blur" : ""
                        }`}
                      >
                        {locked ? "Unknown" : stage.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {!locked && stage.locationId ? <MapPin className="size-3" /> : null}
                        {locked ? "Sealed until the trail continues" : stage.kind}
                      </span>
                    </span>
                    <StatusChip status={status} />
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>

      {completed.length === adventure.stages.length ? (
        <Link
          to="/complete"
          className="mt-8 flex min-h-[52px] items-center justify-center rounded-md border border-gold/50 font-display text-sm font-bold uppercase tracking-[0.2em] text-gold"
        >
          View expedition summary
        </Link>
      ) : null}
    </GameShell>
  );
}
