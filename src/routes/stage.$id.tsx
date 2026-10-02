import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Box, MapPin, PackageCheck, Puzzle as PuzzleIcon } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, LockedContent, Panel, Reveal } from "@/components/game/primitives";
import { PuzzleSuccess } from "@/components/game/PuzzleSuccess";
import { adventure, itemById, locationById, stageById } from "@/game/data";
import { requiredQrMarkForPuzzle } from "@/game/qrMarks";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/stage/$id")({
  head: ({ params }) => {
    const stage = stageById(params.id);
    const title = stage
      ? `Etappe ${String(stage.number).padStart(2, "0")} — ${stage.title}`
      : "Etappe — Der verborgene Pfad";
    const description = stage?.objective ?? "Eine Etappe der Expedition „Der verborgene Pfad“.";
    return {
      meta: [
        { title: `${title} — Der verborgene Pfad` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: StagePage,
});

function StagePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const stage = stageById(id);
  const completed = usePlayer((state) => state.completedStages);
  const currentId = usePlayer((state) => state.currentStageId);
  const solvedPuzzles = usePlayer((state) => state.completedPuzzles);
  const inventory = usePlayer((state) => state.inventory);
  const scannedQrMarks = usePlayer((state) => state.scannedQrMarks);
  const completeStage = usePlayer((state) => state.completeStage);
  const addItem = usePlayer((state) => state.addItem);
  const [granted, setGranted] = useState(false);

  if (!stage) {
    return (
      <GameShell>
        <LockedContent note="Diese Etappe gehört nicht zur aktuellen Expedition." />
      </GameShell>
    );
  }

  const status = completed.includes(stage.id)
    ? "completed"
    : stage.id === currentId
      ? "active"
      : "locked";

  if (status === "locked") {
    const previous = adventure.stages.find((entry) => entry.number === stage.number - 1);
    return (
      <GameShell>
        <LockedContent
          note={`Von Etappe ${String(previous?.number ?? 1).padStart(2, "0")} fehlt noch etwas.`}
        />
        <Link to="/adventure" className="mt-6 block text-center label-mono text-primary">
          Zurück zur Etappenübersicht
        </Link>
      </GameShell>
    );
  }

  const location = locationById(stage.locationId);
  const reward = stage.rewardItemId ? itemById(stage.rewardItemId) : undefined;
  const pickup = stage.pickupItemId ? itemById(stage.pickupItemId) : undefined;
  const puzzleOk = stage.puzzleId ? solvedPuzzles.includes(stage.puzzleId) : true;
  // Locations are navigation/context only. Progress never depends on browser GPS.
  const locationOk = true;
  const pickupOk = !pickup || inventory.includes(pickup.id);
  const canFinish =
    puzzleOk &&
    locationOk &&
    pickupOk &&
    status !== "completed" &&
    stage.completionMode !== "external";

  const collectPickup = () => {
    if (!pickup) return;
    addItem(pickup.id, pickup.name);
  };

  const finish = () => {
    if (reward) addItem(reward.id, reward.name);
    completeStage(stage.id);
    setGranted(true);
  };

  const next = adventure.stages.find((entry) => entry.number === stage.number + 1);

  return (
    <GameShell>
      <Reveal>
        <Label>Etappe {String(stage.number).padStart(2, "0")}</Label>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
          {stage.title}
        </h1>
        <p className="mt-5 max-w-prose text-base text-muted-foreground">{stage.intro}</p>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Panel>
            <Label>Ziel</Label>
            <p className="mt-2 text-sm">{stage.objective}</p>
          </Panel>
          <Panel>
            <Label>Ort</Label>
            <p className="mt-2 text-sm">{location ? location.name : "Kein fester Ort"}</p>
          </Panel>
          <Panel>
            <Label>Benötigter Gegenstand</Label>
            <p className="mt-2 text-sm">{stage.requiredItem ?? "Keiner"}</p>
          </Panel>
          <Panel>
            <Label>Aktueller Status</Label>
            <p className="mt-2 text-sm capitalize text-primary">
              {status === "completed" ? "Abgeschlossen" : "Aktiv"}
            </p>
          </Panel>
        </div>
      </Reveal>

      {stage.puzzleId &&
      requiredQrMarkForPuzzle[stage.puzzleId] &&
      !scannedQrMarks.includes(requiredQrMarkForPuzzle[stage.puzzleId]!) ? (
        <Panel className="mt-6 border-gold/40 bg-gold/5">
          <Label>Physische Markierung</Label>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Das zugehörige Rätsel ist noch nicht digital freigeschaltet. Sucht vor Ort nach einem QR-Code und verwendet den zentralen Scanner.
          </p>
          <Link
            to="/scan"
            className="mt-4 flex min-h-[48px] items-center justify-center rounded-md border border-gold/40 px-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-gold"
          >
            Markierung scannen
          </Link>
        </Panel>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {location ? (
          <Link
            to="/map"
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md border border-border px-5 font-display text-xs font-bold uppercase tracking-[0.18em] hover:bg-accent"
          >
            <MapPin className="size-4" /> Karte ansehen
          </Link>
        ) : null}

        {stage.puzzleId &&
        (!stage.hidePuzzleLink ||
          (requiredQrMarkForPuzzle[stage.puzzleId] &&
            scannedQrMarks.includes(requiredQrMarkForPuzzle[stage.puzzleId]!))) ? (
          <Link
            to="/puzzle/$id"
            params={{ id: stage.puzzleId }}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md border border-border px-5 font-display text-xs font-bold uppercase tracking-[0.18em] hover:bg-accent"
          >
            <PuzzleIcon className="size-4" /> Rätsel öffnen
          </Link>
        ) : null}

        {stage.specialRoute ? (
          <a
            href={stage.specialRoute}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 font-display text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground"
          >
            <Box className="size-4" /> {stage.specialRouteLabel ?? "Sonderbereich öffnen"}
          </a>
        ) : null}
      </div>


      {pickup ? (
        <Panel className="mt-6" glow={pickupOk}>
          <div className="flex items-start gap-3">
            <PackageCheck className="mt-0.5 size-5 shrink-0 text-gold" />
            <div>
              <Label>{stage.pickupTitle ?? "Physischer Fund"}</Label>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {stage.pickupDescription ?? pickup.description}
              </p>
            </div>
          </div>

          {pickupOk ? (
            <p className="mt-4 font-display text-sm uppercase tracking-[0.16em] text-success">
              {pickup.name} · im Inventar
            </p>
          ) : (
            <button
              onClick={collectPickup}
              className="mt-4 min-h-[48px] w-full rounded-md bg-primary px-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground"
            >
              Objekt gefunden
            </button>
          )}
        </Panel>
      ) : null}

      <div className="mt-8">
        {status === "completed" ? (
          <p className="text-center font-display text-sm uppercase tracking-[0.2em] text-success">
            Etappe abgeschlossen · {stage.reward}
          </p>
        ) : stage.completionMode === "external" ? (
          <p className="text-center text-sm text-muted-foreground">
            Diese Etappe wird innerhalb des zugehörigen Spiels automatisch abgeschlossen.
          </p>
        ) : (
          <button
            disabled={!canFinish}
            onClick={finish}
            className="min-h-[56px] w-full rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {canFinish ? "Etappe abschließen" : "Voraussetzungen fehlen"}
          </button>
        )}
      </div>

      <PuzzleSuccess
        show={granted}
        title="Etappe abgeschlossen"
        message={`${stage.reward} wurde bestätigt.`}
        continueLabel="Der Spur folgen"
        onContinue={() => {
          setGranted(false);
          navigate(
            next
              ? { to: "/stage/$id", params: { id: next.id } }
              : { to: "/complete" },
          );
        }}
      />
    </GameShell>
  );
}
