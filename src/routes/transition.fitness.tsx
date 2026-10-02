import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  PackageSearch,
  ShieldAlert,
} from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { HintPanel } from "@/components/game/HintPanel";
import { Label, LockedContent, Panel } from "@/components/game/primitives";
import { Button } from "@/components/ui/button";
import {
  heumarktLocationHints,
  heumarktTransition,
} from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/transition/fitness")({
  head: () => ({
    meta: [
      { title: "Versuch 05 — Der verborgene Pfad" },
      {
        name: "description",
        content: "Rekonstruiere die frühere Kennung von Versuch 05.",
      },
    ],
  }),
  component: FitnessTransitionPage,
});

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/Ä/g, "AE")
    .replace(/Ö/g, "OE")
    .replace(/Ü/g, "UE")
    .replace(/ß/g, "SS")
    .replace(/[^A-Z0-9]/g, "");
}

function FitnessTransitionPage() {
  const navigate = useNavigate();

  const scannedQrMarks = usePlayer((state) => state.scannedQrMarks);
  const completedStages = usePlayer((state) => state.completedStages);
  const completeStage = usePlayer((state) => state.completeStage);
  const setFlowPhase = usePlayer((state) => state.setHeumarktFlowPhase);

  const [carrierFound, setCarrierFound] = useState(false);
  const [answer, setAnswer] = useState("");
  const [denied, setDenied] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const authorized =
    scannedQrMarks.includes("heumarkt-heart") ||
    completedStages.includes("s4");

  const accepted = useMemo(
    () =>
      heumarktTransition.locationRiddle.acceptedAnswers.map(normalizeAnswer),
    [],
  );

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((cooldownUntil - Date.now()) / 1000),
      );
      setCooldownSeconds(remaining);
      if (remaining === 0) setCooldownUntil(0);
    };

    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  if (!authorized) {
    return (
      <GameShell>
        <LockedContent note="Versuch 05 ist noch versiegelt. Findet zuerst das Herz am Heumarkt und scannt die Markierung auf seiner Rückseite." />
        <Link
          to="/stage/$id"
          params={{ id: "s4" }}
          className="mt-6 block text-center label-mono text-primary"
        >
          Zurück zu Etappe 04
        </Link>
      </GameShell>
    );
  }

  const solve = () => {
    if (cooldownSeconds > 0) return;

    if (!accepted.includes(normalizeAnswer(answer))) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setDenied(true);
      window.setTimeout(() => setDenied(false), 900);

      if (nextAttempts % 3 === 0) {
        setCooldownUntil(Date.now() + 10_000);
      }
      return;
    }

    setFlowPhase("ai-identified");
    if (!completedStages.includes("s4")) {
      completeStage("s4");
    }
    navigate({ to: "/stage/$id", params: { id: "s5" } });
  };

  return (
    <GameShell>
      <div className="relative mx-auto max-w-4xl">
        <div className="topo pointer-events-none absolute inset-0 -z-10 opacity-30" />

        <p className="label-mono text-gold">Übergangsprotokoll · 04 → 05</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
          Versuch 05
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Das Herz war nicht nur der Abschluss der Rekonstruktion. Direkt bei
          ihm wurde ein weiterer Versuchsträger hinterlegt. Der heutige Aufdruck
          darauf ist echt – aber für dieses Archiv die falsche Antwort.
        </p>

        {!carrierFound ? (
          <Panel className="mt-7 border-gold/40 bg-gold/5">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-md border border-gold/40 bg-gold/10">
                <PackageSearch className="size-5 text-gold" />
              </div>
              <div className="min-w-0">
                <Label>Phase 1 · Versuchsträger</Label>
                <h2 className="mt-2 font-display text-xl font-bold uppercase">
                  Ein Gegenstand fehlt
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Er befindet sich unmittelbar bei dem Herz, das ihr gerade
                  gefunden habt. Nehmt ihn mit. Achtet darauf, wofür er benutzt
                  wird – nicht nur darauf, welcher Name heute darauf steht.
                </p>
              </div>
            </div>

            <Button
              className="mt-5 min-h-[48px] w-full gap-2"
              onClick={() => setCarrierFound(true)}
            >
              <Dumbbell className="size-4" />
              Versuchsträger gefunden
            </Button>
          </Panel>
        ) : (
          <>
            <Panel className="mt-7">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10">
                  <Activity className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label>Phase 2 · Archivkennung</Label>
                  <h2 className="mt-2 font-display text-xl font-bold uppercase">
                    Belastungsprotokoll rekonstruieren
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Der aktuelle Markenname auf dem Band ist eine spätere
                    Überschreibung. Gesucht wird die frühere Kennung, unter der
                    ihr diesen Ort kanntet.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-md border border-border bg-background/45">
                {heumarktTransition.locationRiddle.protocol.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 last:border-0"
                  >
                    <span className="label-mono">{key}</span>
                    <span className="text-right font-display font-semibold text-gold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-md border border-gold/30 bg-gold/5 p-4">
                <p className="label-mono text-gold">Archivnotiz</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  CURRENT IDENTIFIER: <span className="text-paper">VALID TODAY</span>
                  <br />
                  REQUESTED IDENTIFIER: <span className="text-paper">LEGACY</span>
                </p>
              </div>

              <label className="mt-5 block">
                <span className="label-mono">
                  {heumarktTransition.locationRiddle.prompt}
                </span>
                <input
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") solve();
                  }}
                  disabled={cooldownSeconds > 0}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Alte Kennung eingeben"
                  className={`mt-2 h-14 w-full rounded-md border bg-background/60 px-4 font-display text-base uppercase tracking-[0.08em] outline-none focus:border-primary ${
                    denied ? "shake border-destructive" : "border-border"
                  }`}
                />
              </label>

              <Button
                className="mt-3 min-h-[48px] w-full"
                disabled={cooldownSeconds > 0 || !answer.trim()}
                onClick={solve}
              >
                Archivkennung prüfen
              </Button>

              {denied ? (
                <p className="mt-3 text-center text-sm text-destructive">
                  Diese Kennung gehört nicht zum historischen Datensatz.
                </p>
              ) : null}

              {cooldownSeconds > 0 ? (
                <div className="mt-4 flex items-start gap-3 rounded-md border border-gold/40 bg-gold/10 p-4">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold" />
                  <p className="text-sm text-muted-foreground">
                    Archivprüfung kurz gesperrt. Neuer Versuch in{" "}
                    {cooldownSeconds}s.
                  </p>
                </div>
              ) : null}
            </Panel>

            <div className="mt-6">
              <HintPanel
                puzzleId={heumarktTransition.locationRiddleId}
                hints={heumarktLocationHints}
              />
            </div>
          </>
        )}

        {completedStages.includes("s4") ? (
          <div className="mt-6 flex items-center gap-3 rounded-md border border-success/40 bg-success/10 p-4">
            <CheckCircle2 className="size-5 text-success" />
            <p className="text-sm text-success">
              Versuch 05 wurde bereits rekonstruiert.
            </p>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}
