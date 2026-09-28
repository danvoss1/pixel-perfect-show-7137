import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Puzzle as PuzzleIcon, Mail } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, LockedContent, Panel, Reveal } from "@/components/game/primitives";
import { PuzzleSuccess } from "@/components/game/PuzzleSuccess";
import {
  adventure,
  envelopeById,
  itemById,
  locationById,
  stageById,
} from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/stage/$id")({
  head: ({ params }) => {
    const stage = stageById(params.id);
    const title = stage
      ? `Stage ${String(stage.number).padStart(2, "0")} — ${stage.title}`
      : "Stage — The Hidden Path";
    const description = stage?.objective ?? "A stage of The Hidden Path expedition.";
    return {
      meta: [
        { title: `${title} — The Hidden Path` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: StagePage,
});

function StagePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const stage = stageById(id);
  const completed = usePlayer((s) => s.completedStages);
  const currentId = usePlayer((s) => s.currentStageId);
  const verified = usePlayer((s) => s.verifiedEnvelopes);
  const verifyEnvelope = usePlayer((s) => s.verifyEnvelope);
  const completeStage = usePlayer((s) => s.completeStage);
  const addItem = usePlayer((s) => s.addItem);
  const solvedPuzzles = usePlayer((s) => s.completedPuzzles);
  const [code, setCode] = useState("");
  const [denied, setDenied] = useState(false);
  const [granted, setGranted] = useState(false);

  if (!stage) {
    return (
      <GameShell>
        <LockedContent note="This stage does not exist in the current expedition." />
      </GameShell>
    );
  }

  const status = completed.includes(stage.id)
    ? "completed"
    : stage.id === currentId
      ? "active"
      : "locked";

  if (status === "locked") {
    const prev = adventure.stages.find((s) => s.number === stage.number - 1);
    return (
      <GameShell>
        <LockedContent
          note={`Something from Stage ${String(prev?.number ?? 1).padStart(2, "0")} is still missing.`}
        />
        <Link to="/adventure" className="mt-6 block text-center label-mono text-primary">
          Back to the timeline
        </Link>
      </GameShell>
    );
  }

  const location = locationById(stage.locationId);
  const envelope = envelopeById(stage.envelopeId);
  const reward = stage.rewardItemId ? itemById(stage.rewardItemId) : undefined;
  const envelopeOk = envelope ? verified.includes(envelope.id) : true;
  const puzzleOk = stage.puzzleId ? solvedPuzzles.includes(stage.puzzleId) : true;
  const canFinish = envelopeOk && puzzleOk && status !== "completed";

  const finish = () => {
    if (reward) addItem(reward.id, reward.name);
    completeStage(stage.id);
    setGranted(true);
  };

  return (
    <GameShell>
      <Reveal>
        <Label>Stage {String(stage.number).padStart(2, "0")}</Label>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
          {stage.title}
        </h1>
        <p className="mt-5 max-w-prose text-base text-muted-foreground">{stage.intro}</p>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Panel>
            <Label>Objective</Label>
            <p className="mt-2 text-sm">{stage.objective}</p>
          </Panel>
          <Panel>
            <Label>Location</Label>
            <p className="mt-2 text-sm">{location ? location.name : "No fixed location"}</p>
          </Panel>
          <Panel>
            <Label>Required item</Label>
            <p className="mt-2 text-sm">{stage.requiredItem ?? "None"}</p>
          </Panel>
          <Panel>
            <Label>Current status</Label>
            <p className="mt-2 text-sm capitalize text-primary">{status}</p>
          </Panel>
        </div>
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2">
        {location ? (
          <Link
            to="/map"
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md border border-border px-5 font-display text-xs font-bold uppercase tracking-[0.18em] hover:bg-accent"
          >
            <MapPin className="size-4" /> View map
          </Link>
        ) : null}
        {stage.puzzleId ? (
          <Link
            to="/puzzle/$id"
            params={{ id: stage.puzzleId }}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md border border-border px-5 font-display text-xs font-bold uppercase tracking-[0.18em] hover:bg-accent"
          >
            <PuzzleIcon className="size-4" /> Open puzzle
          </Link>
        ) : null}
      </div>

      {envelope ? (
        <Panel className="mt-6">
          <div className="flex items-center gap-3">
            <Mail className="size-5 shrink-0 text-gold" />
            <div className="min-w-0">
              <Label>Envelope #0{envelope.number}</Label>
              <p className="mt-1 text-sm">
                {envelopeOk ? "Verified" : `Expected location: ${envelope.expectedLocation}`}
              </p>
            </div>
          </div>

          {envelopeOk ? (
            <p className="mt-4 rounded-md border border-border bg-paper p-4 font-hand text-xl text-paper-foreground">
              {envelope.contents}
            </p>
          ) : (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                Find Envelope #0{envelope.number} before continuing.
              </p>
              <motion.input
                aria-label="Envelope code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code from envelope"
                className={`mt-3 h-14 w-full rounded-md border border-border bg-background/60 px-4 font-display uppercase tracking-[0.2em] outline-none focus:border-primary ${
                  denied ? "shake" : ""
                }`}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    if (code.trim().toUpperCase() === envelope.code) {
                      verifyEnvelope(envelope.id, envelope.number);
                      setDenied(false);
                    } else {
                      setDenied(true);
                      setTimeout(() => setDenied(false), 800);
                    }
                  }}
                  className="min-h-[48px] flex-1 rounded-md bg-primary font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
                >
                  Verify
                </button>
                <Link
                  to="/scan"
                  className="grid min-h-[48px] flex-1 place-items-center rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.2em]"
                >
                  Scan QR
                </Link>
              </div>
              {denied ? (
                <p className="mt-3 text-center text-sm text-destructive">Access denied</p>
              ) : null}
            </>
          )}
        </Panel>
      ) : null}

      <div className="mt-8">
        {status === "completed" ? (
          <p className="text-center font-display text-sm uppercase tracking-[0.2em] text-success">
            Stage complete · {stage.reward} collected
          </p>
        ) : (
          <button
            disabled={!canFinish}
            onClick={finish}
            className="min-h-[56px] w-full rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {canFinish ? "Complete stage" : "Requirements not met"}
          </button>
        )}
      </div>

      <PuzzleSuccess
        show={granted}
        title="Access granted"
        message={`${stage.reward} added to your inventory.`}
        continueLabel="Continue the trail"
        onContinue={() => {
          setGranted(false);
          const next = adventure.stages.find((s) => s.number === stage.number + 1);
          navigate(next ? { to: "/stage/$id", params: { id: next.id } } : { to: "/complete" });
        }}
      />
    </GameShell>
  );
}
