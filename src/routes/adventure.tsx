import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ArrowRight, FileWarning, UserRoundSearch } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, Panel, ProgressRing, Reveal, StatusChip } from "@/components/game/primitives";
import { Button } from "@/components/ui/button";
import { adventure, locationById } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/adventure")({
  head: () => ({
    meta: [
      { title: "Abenteuer — Der verborgene Pfad" },
      {
        name: "description",
        content: "Deine Expedition: aktuelles Ziel, Etappenübersicht und Fortschritt auf dem verborgenen Pfad.",
      },
      { property: "og:title", content: "Abenteuer — Der verborgene Pfad" },
      { property: "og:description", content: "Aktuelles Ziel, Etappenübersicht und Expeditionsfortschritt." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdventureHome,
});

function AdventureHome() {
  const completed = usePlayer((s) => s.completedStages);
  const storyIntroSeen = usePlayer((s) => s.storyIntroSeen);
  const acknowledgeStoryIntro = usePlayer((s) => s.acknowledgeStoryIntro);
  const currentId = usePlayer((s) => s.currentStageId);
  const current = adventure.stages.find((s) => s.id === currentId) ?? adventure.stages[0]!;
  const location = locationById(current.locationId);

  return (
    <GameShell>
      {!storyIntroSeen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Szenario"
        >
          <div className="field-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-md border border-gold/40 bg-gold/10">
                <FileWarning className="size-6 text-gold" />
              </div>
              <div>
                <Label>LPDP // Akte 00</Label>
                <h1 className="mt-2 font-display text-3xl font-bold uppercase">
                  Szenario
                </h1>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-paper sm:text-base">
              <p>
                Vor euch hat bereits jemand versucht, eine Reihe miteinander
                verbundener Dateien und Orte in Köln zu rekonstruieren. In den
                Notizen nennt er sich nur <strong>M.</strong>
              </p>
              <p>
                M. bezeichnet das System als <strong>LPDP</strong>. Er wusste
                weder, wer es ursprünglich angelegt hatte, noch warum darin
                ausgerechnet Orte auftauchten, die mit eurer Gruppe verbunden
                sind. Seine eigenen Aufzeichnungen brechen ab, bevor er eine
                Antwort findet.
              </p>
              <p>
                Ihr folgt jetzt seiner Spur. Ihr seid nicht auf der Suche nach
                einem Schatz, sondern nach einer Erklärung:
              </p>
            </div>

            <div className="mt-5 rounded-md border border-gold/30 bg-gold/5 p-4">
              <div className="flex items-start gap-3">
                <UserRoundSearch className="mt-0.5 size-5 shrink-0 text-gold" />
                <div className="space-y-2 text-sm">
                  <p><strong>Was ist LPDP?</strong></p>
                  <p><strong>Wer hat das Archiv begonnen?</strong></p>
                  <p><strong>Warum kennt es eure Orte und Erinnerungen?</strong></p>
                  <p><strong>Und wer ist das „wir“, von dem M. später schreibt?</strong></p>
                </div>
              </div>
            </div>

            <p className="mt-5 font-hand text-xl leading-relaxed text-muted-foreground">
              „Wenn ihr meinen Aufzeichnungen folgt, behaltet alles. Manche
              Gegenstände ergeben erst viel später Sinn.“ — M.
            </p>

            <Button
              className="mt-6 min-h-[52px] w-full"
              onClick={acknowledgeStoryIntro}
            >
              Akte 00 übernehmen
            </Button>
          </div>
        </div>
      ) : null}
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
          <Label>Aktuelles Ziel</Label>
          <p className="mt-3 font-display text-xl font-semibold">{current.objective}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <Label>Entfernung</Label>
              <p className="mt-1 font-display text-lg">{location?.distance ?? "—"}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="mt-1 font-display text-lg text-primary">
                Etappe {String(current.number).padStart(2, "0")} aktiv
              </p>
            </div>
          </div>
          <Link
            to="/stage/$id"
            params={{ id: current.id }}
            className="mt-6 flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Aktuelle Etappe öffnen <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </Reveal>

      <div className="mt-10">
        <Label>Etappenübersicht</Label>
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
                        {locked ? "Unbekannt" : stage.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {!locked && stage.locationId ? <MapPin className="size-3" /> : null}
                        {locked ? "Versiegelt, bis die Spur weiterführt" : stage.kind}
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
          Zusammenfassung ansehen
        </Link>
      ) : null}
    </GameShell>
  );
}
