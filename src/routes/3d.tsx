import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Box,
  ExternalLink,
  KeyRound,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GooglePointPicker } from "@/components/game/GooglePointPicker";
import { HintPanel } from "@/components/game/HintPanel";
import { LockedContent } from "@/components/game/primitives";
import { Button } from "@/components/ui/button";
import {
  adventure,
  heumarktLocationHints,
  heumarktTransition,
  storyFragmentById,
} from "@/game/data";
import { usePlayer } from "@/game/store";
import {
  HEUMARKT_CHOICE_POINTS,
  loadHeumarktCalibration,
  triangleCentroid,
} from "@/game/heumarktCalibration";

const normalizeAnswer = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ö/g, "O")
    .replace(/Ü/g, "U")
    .replace(/Ä/g, "A")
    .replace(/ß/g, "SS")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

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
      {
        name: "description",
        content: "Die freigeschaltete 3D-Rekonstruktion der Expedition.",
      },
    ],
  }),
  component: ThreeDArchive,
});

function ThreeDArchive() {
  const navigate = useNavigate();
  const unlocked = usePlayer((state) => state.unlockedFeatures.includes("3d"));
  const currentStageId = usePlayer((state) => state.currentStageId);
  const completedStages = usePlayer((state) => state.completedStages);
  const savedPoints = usePlayer((state) => state.heumarktTrianglePoints);
  const solved = usePlayer((state) => state.heumarktTriangleSolved);
  const flowPhase = usePlayer((state) => state.heumarktFlowPhase);
  const inventory = usePlayer((state) => state.inventory);
  const setSavedPoints = usePlayer((state) => state.setHeumarktTrianglePoints);
  const solveTriangle = usePlayer((state) => state.solveHeumarktTriangle);
  const resetTriangle = usePlayer((state) => state.resetHeumarktTriangle);
  const setFlowPhase = usePlayer((state) => state.setHeumarktFlowPhase);
  const unlockStoryFragment = usePlayer((state) => state.unlockStoryFragment);
  const setItemState = usePlayer((state) => state.setItemState);
  const completeStage = usePlayer((state) => state.completeStage);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [notice, setNotice] = useState("");
  const [attemptObjectIds, setAttemptObjectIds] = useState<string[]>([]);
  const [failedAttemptIds, setFailedAttemptIds] = useState<string[]>([]);
  const [gpsMessage, setGpsMessage] = useState("");
  const [locationAnswer, setLocationAnswer] = useState("");
  const [locationDenied, setLocationDenied] = useState(false);

  const calibration = useMemo(() => loadHeumarktCalibration(), []);
  const puzzle = calibration.puzzlePoints;
  const story = storyFragmentById(heumarktTransition.storyFragmentId);

  const currentStage = adventure.stages.find((stage) => stage.id === currentStageId);
  const heumarktStage = adventure.stages.find((stage) => stage.id === "s4");
  const stageReady =
    Boolean(currentStage && heumarktStage) &&
    (currentStage!.number >= heumarktStage!.number || completedStages.includes("s4"));

  useEffect(() => {
    fetch("/heumarkt-3d/model-data.json")
      .then((response) => response.json())
      .then((data) => setObjects(Array.isArray(data.objects) ? data.objects : []))
      .catch(() => setNotice("Die Archivszene konnte nicht vollständig gelesen werden."));
  }, []);

  const correctObjectIds = puzzle.map((point) => point.objectId);
  const scenePoints = correctObjectIds
    .map((id) => objects.find((object) => object.id === id))
    .filter(Boolean)
    .map((object) => ({ x: object!.position[0], z: object!.position[1] }));

  const center =
    calibration.targetScene ??
    (scenePoints.length === 3 ? triangleCentroid(scenePoints) : undefined);

  const choicePoints = HEUMARKT_CHOICE_POINTS.map((point) => {
    const object = objects.find((candidate) => candidate.id === point.objectId);
    if (!object) return undefined;
    return {
      id: point.id,
      objectId: point.objectId,
      label: point.label,
      x: object.position[0],
      z: object.position[1],
    };
  }).filter(Boolean);

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
        failedAttemptIds.length > 0 ||
        flowPhase !== "triangle"
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
  }, [
    attemptObjectIds,
    correctObjectIds.join("|"),
    failedAttemptIds.length,
    flowPhase,
    solved,
  ]);

  const onFrameLoad = () => {
    window.setTimeout(
      () => renderChoicePoints(attemptObjectIds, failedAttemptIds, solved),
      120,
    );
  };

  useEffect(() => {
    if (objects.length === 0) return;
    renderChoicePoints(attemptObjectIds, failedAttemptIds, solved);
  }, [objects, attemptObjectIds, failedAttemptIds, solved]);

  if (!unlocked) {
    return (
      <GameShell>
        <LockedContent note="Für diesen Bereich fehlt noch die dritte Dimension." />
        <Link to="/adventure" className="mt-6 block text-center label-mono text-primary">
          Zurück zur Expedition
        </Link>
      </GameShell>
    );
  }

  if (!stageReady) {
    return (
      <GameShell>
        <LockedContent note="Die 3D-Archivszene wurde zwar entschlüsselt, aber die vorherige Etappe ist noch nicht abgeschlossen." />
        <Link to="/adventure" className="mt-6 block text-center label-mono text-primary">
          Zur aktuellen Etappe
        </Link>
      </GameShell>
    );
  }

  const verifyHeartLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Standort auf diesem Gerät nicht verfügbar.");
      return;
    }
    setGpsMessage("Standort wird ermittelt …");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current = { lat: coords.latitude, lng: coords.longitude };
        const distance = metersBetween(current, calibration.target);
        const effectiveRadius = calibration.target.radius + Math.min(coords.accuracy, 12);
        if (distance <= effectiveRadius) {
          setGpsMessage("Zielposition erreicht. Sucht jetzt nach dem physischen Zeichen.");
          setFlowPhase("heart-reached");
        } else {
          setGpsMessage(
            `Noch nicht im Zielbereich · ca. ${distance} m entfernt (GPS ±${Math.round(coords.accuracy)} m).`,
          );
        }
      },
      () => setGpsMessage("Standort nicht verfügbar. Bitte erlaube den Standortzugriff."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const confirmHeartOpened = () => {
    if (!inventory.includes(heumarktTransition.heartItemId)) {
      setNotice(
        "Der passende Schlüssel fehlt im digitalen Inventar. Prüft eure Fundstücke vom Pantaleonswall.",
      );
      return;
    }
    setItemState(heumarktTransition.heartItemId, { used: true });
    unlockStoryFragment(heumarktTransition.storyFragmentId);
    setFlowPhase("story-revealed");
    setNotice("Das Herz wurde geöffnet. Ein neues Archivfragment wurde geborgen.");
  };

  const solveLocationRiddle = () => {
    const answer = normalizeAnswer(locationAnswer);
    const accepted = heumarktTransition.locationRiddle.acceptedAnswers.map(normalizeAnswer);
    if (!accepted.includes(answer)) {
      setLocationDenied(true);
      window.setTimeout(() => setLocationDenied(false), 900);
      return;
    }

    setFlowPhase("ai-identified");
    if (!completedStages.includes("s4")) completeStage("s4");
    setNotice("Ziel identifiziert · AI Fitness · Weißhausstraße 20–22.");
  };

  const resetLocalPuzzle = () => {
    resetTriangle();
    setNotice("");
    setGpsMessage("");
    setLocationAnswer("");
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

  const targetMap = (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="h-[320px]">
        <GooglePointPicker target={calibration.target} onChange={() => {}} zoom={20} />
      </div>
      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        Zielbereich · Suchradius {calibration.target.radius} m
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/adventure"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Expedition</span>
          </Link>
          <div className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/5">
            <Box className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="label-mono truncate text-primary">3D · Archivszene</p>
            <h1 className="truncate font-display text-sm font-bold uppercase sm:text-base">
              Heumarkt · Winterrekonstruktion
            </h1>
          </div>
        </div>
        <a
          href="/heumarkt-3d/index.html?mode=game&rev=ai-transition-1"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          <span className="hidden sm:inline">Vollbild</span>
        </a>
      </header>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-h-[65vh] bg-background">
          <iframe
            ref={iframeRef}
            onLoad={onFrameLoad}
            src="/heumarkt-3d/index.html?mode=game&rev=ai-transition-1"
            title="Heumarkt 3D-Rekonstruktion"
            className="block h-[calc(100dvh-3.5rem)] min-h-[650px] w-full border-0"
            allow="fullscreen"
          />
        </div>

        <aside className="border-l border-border bg-surface p-5">
          {flowPhase === "triangle" && !solved ? (
            <>
              <p className="label-mono text-primary">
                Dreieckssuche · {attemptObjectIds.length}/3 gewählt
              </p>
              <h2 className="mt-2 font-display text-xl font-bold uppercase">
                Wählt drei Markierungen
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Zehn Punkte sind in der Archivszene markiert. Drei davon gehören zum gesuchten Dreieck.
              </p>

              <div className="mt-5 space-y-3">
                {puzzle.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-md border border-border bg-background/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid size-7 place-items-center rounded-full border border-primary/60 font-display text-xs font-bold text-primary">
                        {point.id}
                      </div>
                      <p className="text-sm font-semibold text-foreground">Hinweis</p>
                    </div>
                    <p className="mt-2 font-hand text-xl leading-snug text-paper">
                      „{point.clue}“
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Erst wenn alle drei Punkte in einem Versuch stimmen, werden sie grün. Eine falsche Dreierkombination wird gemeinsam zurückgesetzt.
              </p>
            </>
          ) : null}

          {flowPhase === "target-revealed" ? (
            <>
              <p className="label-mono text-success">Rekonstruktion vollständig</p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase">
                In die Gegenwart übertragen
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Die Szene existiert nicht mehr. Der berechnete Punkt schon.
              </p>
              <div className="mt-5">{targetMap}</div>
              <Button className="mt-4 min-h-[48px] w-full gap-2" onClick={verifyHeartLocation}>
                <LocateFixed className="size-4" /> Zielposition bestätigen
              </Button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${calibration.target.lat},${calibration.target.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-xs text-primary"
              >
                Ziel in Google Maps öffnen
              </a>
              {gpsMessage ? (
                <p className="mt-3 rounded-md border border-border bg-background/40 p-3 text-sm text-paper">
                  {gpsMessage}
                </p>
              ) : null}
            </>
          ) : null}

          {flowPhase === "heart-reached" ? (
            <>
              <p className="label-mono text-gold">Physischer Fund erforderlich</p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase">
                Der berechnete Punkt ist erreicht
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Sucht an dieser Stelle nach dem Zeichen, das euch bereits früher begegnet ist.
                Ein Gegenstand aus eurem bisherigen Inventar könnte hier erneut relevant werden.
              </p>
              <Link
                to="/inventory"
                className="mt-5 flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.18em]"
              >
                <Search className="size-4" /> Inventar öffnen
              </Link>
              <Button className="mt-3 min-h-[48px] w-full gap-2" onClick={confirmHeartOpened}>
                <KeyRound className="size-4" /> Das Herz wurde geöffnet
              </Button>
            </>
          ) : null}

          {flowPhase === "story-revealed" ? (
            <>
              <p className="label-mono text-gold">Archivfragment geborgen</p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase">
                {story?.title ?? "Notiz 04"}
              </h2>
              <div className="mt-5 rounded-md border border-gold/35 bg-paper p-5 text-paper-foreground">
                <p className="whitespace-pre-line font-hand text-2xl leading-snug">
                  {story?.text}
                </p>
                <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.18em]">
                  — {story?.author ?? "M."}
                </p>
              </div>
              <Button
                className="mt-5 min-h-[48px] w-full gap-2"
                onClick={() => setFlowPhase("location-riddle")}
              >
                <BookOpen className="size-4" /> Nächste Spur lesen
              </Button>
            </>
          ) : null}

          {flowPhase === "location-riddle" ? (
            <>
              <p className="label-mono text-primary">Nächste Spur</p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase">
                {heumarktTransition.locationRiddle.title}
              </h2>
              <div className="mt-5 rounded-md border border-border bg-background/45 p-4">
                {heumarktTransition.locationRiddle.protocol.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0"
                  >
                    <span className="label-mono">{key}</span>
                    <span className="font-display font-semibold text-gold">{value}</span>
                  </div>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="label-mono">{heumarktTransition.locationRiddle.prompt}</span>
                <input
                  value={locationAnswer}
                  onChange={(event) => setLocationAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") solveLocationRiddle();
                  }}
                  className={`mt-2 h-14 w-full rounded-md border bg-background/60 px-4 font-display text-base uppercase tracking-[0.08em] outline-none focus:border-primary ${
                    locationDenied ? "shake border-destructive" : "border-border"
                  }`}
                  placeholder="Ort eingeben"
                />
              </label>
              <Button className="mt-3 min-h-[48px] w-full" onClick={solveLocationRiddle}>
                Ort bestimmen
              </Button>
              {locationDenied ? (
                <p className="mt-3 text-center text-sm text-destructive">
                  Dieser Ort passt noch nicht zum Versuchsprotokoll.
                </p>
              ) : null}

              <div className="mt-5">
                <HintPanel
                  puzzleId={heumarktTransition.locationRiddleId}
                  hints={heumarktLocationHints}
                />
              </div>
            </>
          ) : null}

          {flowPhase === "ai-identified" ? (
            <>
              <p className="label-mono text-success">Ziel identifiziert</p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase">
                AI Fitness
              </h2>
              <div className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-4">
                <p className="font-display text-lg font-semibold uppercase">
                  Weißhausstraße 20–22
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Die Archivszene ist abgeschlossen. Ab hier übernimmt wieder die reguläre Expedition.
                </p>
              </div>
              <Button
                className="mt-5 min-h-[48px] w-full gap-2"
                onClick={() => navigate({ to: "/stage/$id", params: { id: "s5" } })}
              >
                <MapPin className="size-4" /> Zur nächsten Etappe
              </Button>
            </>
          ) : null}

          {notice ? (
            <p
              role="status"
              className="mt-5 rounded-md border border-border bg-background/40 p-3 text-sm text-paper"
            >
              {notice}
            </p>
          ) : null}

          <Button
            variant="ghost"
            className="mt-6 w-full gap-2 text-xs text-muted-foreground"
            onClick={resetLocalPuzzle}
          >
            <RotateCcw className="size-3.5" /> Heumarkt-Spiel zurücksetzen
          </Button>
        </aside>
      </div>
    </div>
  );
}
