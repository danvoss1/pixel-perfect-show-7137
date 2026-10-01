import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Box, ExternalLink, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GooglePointPicker } from "@/components/game/GooglePointPicker";
import { LockedContent } from "@/components/game/primitives";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/game/store";
import {
  HEUMARKT_CHOICE_POINTS,
  loadHeumarktCalibration,
  triangleCentroid,
} from "@/game/heumarktCalibration";

type SceneObject = { id: string; position: [number, number]; label?: string };
type SelectionMessage = {
  event?: string;
  id?: string;
  objectId?: string;
};

export const Route = createFileRoute("/3d")({
  head: () => ({
    meta: [
      { title: "3D — Der verborgene Pfad" },
      { name: "description", content: "Die freigeschaltete 3D-Rekonstruktion der Expedition." },
    ],
  }),
  component: ThreeDArchive,
});

function ThreeDArchive() {
  const unlocked = usePlayer((s) => s.unlockedFeatures.includes("3d"));
  const savedPoints = usePlayer((s) => s.heumarktTrianglePoints);
  const solved = usePlayer((s) => s.heumarktTriangleSolved);
  const setSavedPoints = usePlayer((s) => s.setHeumarktTrianglePoints);
  const solveTriangle = usePlayer((s) => s.solveHeumarktTriangle);
  const resetTriangle = usePlayer((s) => s.resetHeumarktTriangle);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [notice, setNotice] = useState("");
  const [showToday, setShowToday] = useState(false);
  const [attemptObjectIds, setAttemptObjectIds] = useState<string[]>([]);
  const [failedAttemptIds, setFailedAttemptIds] = useState<string[]>([]);
  const calibration = useMemo(() => loadHeumarktCalibration(), []);
  const puzzle = calibration.puzzlePoints;

  useEffect(() => {
    fetch("/heumarkt-3d/model-data.json")
      .then((r) => r.json())
      .then((data) => setObjects(Array.isArray(data.objects) ? data.objects : []))
      .catch(() => setNotice("Die Archivszene konnte nicht vollständig gelesen werden."));
  }, []);

  const correctObjectIds = puzzle.map((point) => point.objectId);
  const scenePoints = correctObjectIds
    .map((id) => objects.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => ({ x: o!.position[0], z: o!.position[1] }));
  const center = calibration.targetScene
    ?? (scenePoints.length === 3 ? triangleCentroid(scenePoints) : undefined);

  const choicePoints = HEUMARKT_CHOICE_POINTS
    .map((point) => {
      const object = objects.find((o) => o.id === point.objectId);
      if (!object) return undefined;
      return {
        id: point.id,
        objectId: point.objectId,
        label: point.label,
        x: object.position[0],
        z: object.position[1],
      };
    })
    .filter(Boolean);

  const renderChoicePoints = (
    attemptIds = attemptObjectIds,
    failedIds = failedAttemptIds,
    completed = solved,
  ) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        event: "heumarkt-map:render-choice-points",
        points: choicePoints,
        attemptObjectIds: completed ? [] : attemptIds,
        successObjectIds: completed ? correctObjectIds : [],
        wrongObjectIds: completed ? [] : failedIds,
        solved: completed,
        center: completed && center ? center : null,
      },
      window.location.origin,
    );
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent<SelectionMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.data?.event !== "heumarkt-map:choice-point" ||
        !event.data.objectId ||
        solved ||
        failedAttemptIds.length > 0
      ) {
        return;
      }

      const objectId = event.data.objectId;

      if (attemptObjectIds.includes(objectId)) {
        const next = attemptObjectIds.filter((id) => id !== objectId);
        setAttemptObjectIds(next);
        setNotice(`Markierung zurückgenommen · ${next.length}/3 gewählt.`);
        return;
      }

      const next = [...attemptObjectIds, objectId];

      if (next.length < 3) {
        setAttemptObjectIds(next);
        setNotice(`Markierung gewählt · ${next.length}/3.`);
        return;
      }

      const correct =
        next.length === 3 &&
        next.every((id) => correctObjectIds.includes(id)) &&
        correctObjectIds.every((id) => next.includes(id));

      if (correct) {
        setAttemptObjectIds(next);
        setSavedPoints(next);
        setNotice("Alle drei Markierungen stimmen. Dreieck bestätigt.");
        solveTriangle();
        return;
      }

      setAttemptObjectIds([]);
      setFailedAttemptIds(next);
      setNotice("Diese Kombination ist nicht korrekt. Versucht drei andere Punkte.");
      window.setTimeout(() => setFailedAttemptIds([]), 1100);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [attemptObjectIds, correctObjectIds.join("|"), failedAttemptIds.length, solved]);

  const onFrameLoad = () => {
    window.setTimeout(() => renderChoicePoints(attemptObjectIds, failedAttemptIds, solved), 120);
  };

  useEffect(() => {
    if (objects.length === 0) return;
    renderChoicePoints(attemptObjectIds, failedAttemptIds, solved);
  }, [objects, attemptObjectIds, failedAttemptIds, solved]);

  if (!unlocked) {
    return (
      <GameShell>
        <LockedContent note="Für diesen Bereich fehlt noch die dritte Dimension." />
        <Link to="/adventure" className="mt-6 block text-center label-mono text-primary">Zurück zur Expedition</Link>
      </GameShell>
    );
  }

  const resetLocalPuzzle = () => {
    resetTriangle();
    setNotice("");
    setShowToday(false);
    setAttemptObjectIds([]);
    setFailedAttemptIds([]);
    iframeRef.current?.contentWindow?.postMessage(
      {
        event: "heumarkt-map:render-choice-points",
        points: choicePoints,
        attemptObjectIds: [],
        successObjectIds: [],
        wrongObjectIds: [],
        solved: false,
      },
      window.location.origin,
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/adventure" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ArrowLeft className="size-4" /><span className="hidden sm:inline">Expedition</span>
          </Link>
          <div className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/5"><Box className="size-5 text-primary" /></div>
          <div className="min-w-0"><p className="label-mono truncate text-primary">3D · Archivszene</p><h1 className="truncate font-display text-sm font-bold uppercase sm:text-base">Heumarkt · Winterrekonstruktion</h1></div>
        </div>
        <a href="/heumarkt-3d/index.html?mode=game&rev=121" target="_blank" rel="noreferrer" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ExternalLink className="size-4" /><span className="hidden sm:inline">Vollbild</span>
        </a>
      </header>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-[65vh] bg-[#101827]">
          <iframe ref={iframeRef} onLoad={onFrameLoad} src="/heumarkt-3d/index.html?mode=game&rev=121" title="Heumarkt 3D-Rekonstruktion" className="block h-[calc(100dvh-3.5rem)] min-h-[650px] w-full border-0" allow="fullscreen" />
        </div>

        <aside className="border-l border-border bg-surface p-5">
          {!solved ? <>
            <p className="label-mono text-primary">Dreieckssuche · {attemptObjectIds.length}/3 gewählt</p>
            <h2 className="mt-2 font-display text-xl font-bold uppercase">Wählt drei Markierungen</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Zehn Punkte sind in der Archivszene markiert. Drei davon gehören zum gesuchten Dreieck.
            </p>

            <div className="mt-5 space-y-3">
              {puzzle.map((point) => (
                <div key={point.id} className="rounded-md border border-border bg-background/30 p-3">
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-full border border-primary/60 font-display text-xs font-bold text-primary">
                      {point.id}
                    </div>
                    <p className="text-sm font-semibold text-foreground">Hinweis</p>
                  </div>
                  <p className="mt-2 font-hand text-xl leading-snug text-paper">„{point.clue}“</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Wählt genau drei nummerierte Markierungen. Während des Versuchs werden eure Auswahlpunkte nur markiert. Erst wenn alle drei zusammen korrekt sind, werden sie grün und das Dreieck erscheint. Eine falsche Dreierkombination wird kurz rot markiert und anschließend zurückgesetzt.
            </p>
          </> : <>
            <p className="label-mono text-success">Rekonstruktion vollständig</p>
            <h2 className="mt-2 font-display text-2xl font-bold uppercase">Dreieck bestätigt</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Die drei Archivpositionen sind verbunden. Im Schwerpunkt erscheint das Herz.</p>
            <div className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-4">
              <p className="font-display text-lg font-semibold uppercase">Die Szene existiert nicht mehr.</p>
              <p className="mt-1 text-sm text-muted-foreground">Der Punkt schon.</p>
            </div>
            <Button className="mt-5 min-h-[48px] w-full gap-2" onClick={() => setShowToday((v) => !v)}><MapPin className="size-4" /> {showToday ? "Archivszene anzeigen" : "In die Gegenwart übertragen"}</Button>
            {showToday ? <div className="mt-4 overflow-hidden rounded-md border border-border">
              <div className="h-[320px]"><GooglePointPicker target={calibration.target} onChange={() => {}} zoom={20} /></div>
              <div className="border-t border-border p-3 text-xs text-muted-foreground">Zielbereich: {calibration.target.name} · Suchradius {calibration.target.radius} m</div>
            </div> : null}
            <a href={`https://www.google.com/maps/search/?api=1&query=${calibration.target.lat},${calibration.target.lng}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-xs text-primary">Ziel in Google Maps öffnen</a>
          </>}
          {notice ? <p role="status" className="mt-5 rounded-md border border-border bg-background/40 p-3 text-sm text-paper">{notice}</p> : null}
          <Button variant="ghost" className="mt-6 w-full gap-2 text-xs text-muted-foreground" onClick={resetLocalPuzzle}><RotateCcw className="size-3.5" /> Markierungen zurücksetzen</Button>
        </aside>
      </div>
    </div>
  );
}
