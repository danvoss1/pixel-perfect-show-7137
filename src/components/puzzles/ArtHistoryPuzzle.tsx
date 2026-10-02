import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  Landmark,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import type { ArtHistoryConfig, ArtWorkConfig } from "@/game/types";

type Assignment = {
  artist: string;
  year: string;
};

type Phase = 0 | 1 | 2 | 3;

function initialChronology(works: ArtWorkConfig[]) {
  if (works.length !== 6) return [...works].reverse();

  const order = [5, 2, 0, 4, 1, 3];
  return order
    .map((index) => works[index])
    .filter((work): work is ArtWorkConfig => Boolean(work));
}

function normalizeText(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/Ä/g, "AE")
    .replace(/Ö/g, "OE")
    .replace(/Ü/g, "UE")
    .replace(/ß/g, "SS")
    .replace(/[^A-Z0-9]/g, "");
}

function CooldownNotice({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-md border border-gold/40 bg-gold/10 p-4">
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold" />
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-gold">
          Archivprüfung gesperrt
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Zu viele unmittelbare Fehlversuche. Prüft eure Rekonstruktion erneut.
          Neue Einreichung in {seconds}s.
        </p>
      </div>
    </div>
  );
}

function PhaseBar({
  phase,
  solved,
}: {
  phase: Phase;
  solved: boolean;
}) {
  const labels = ["Katalog", "Chronologie", "Übersetzung"];

  return (
    <div className="mb-6 grid grid-cols-3 gap-2">
      {labels.map((label, index) => {
        const completed = solved || phase > index;
        const active = !solved && phase === index;

        return (
          <div
            key={label}
            className={`rounded-md border px-2 py-3 text-center ${
              completed
                ? "border-success/40 bg-success/10 text-success"
                : active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-background/20 text-muted-foreground"
            }`}
          >
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] sm:text-xs">
              {index + 1} · {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ArtHistoryPuzzle({
  config,
  solved,
  onSolved,
}: {
  config: ArtHistoryConfig;
  solved: boolean;
  onSolved: () => void;
}) {
  const chronological = useMemo(
    () => [...config.works].sort((a, b) => a.yearOrder - b.yearOrder),
    [config.works],
  );

  const [phase, setPhase] = useState<Phase>(solved ? 3 : 0);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(
    () =>
      Object.fromEntries(
        config.works.map((work) => [
          work.id,
          solved
            ? { artist: work.artist, year: work.yearLabel }
            : { artist: "", year: "" },
        ]),
      ),
  );
  const [orderedWorks, setOrderedWorks] = useState<ArtWorkConfig[]>(
    () => (solved ? chronological : initialChronology(config.works)),
  );
  const [draggingId, setDraggingId] = useState<string>();

  const [archiveNumberInputs, setArchiveNumberInputs] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        chronological.map((work) => [
          work.id,
          solved ? String(work.archiveNumber) : "",
        ]),
      ),
  );
  const [archiveSequenceAccepted, setArchiveSequenceAccepted] = useState(solved);

  const [decodedWord, setDecodedWord] = useState(
    solved ? config.decodeAnswer : "",
  );
  const [finalMarker, setFinalMarker] = useState(
    solved ? config.finalMarkerAnswer ?? "" : "",
  );
  const [wordAccepted, setWordAccepted] = useState(solved);

  const [feedback, setFeedback] = useState("");
  const [wrong, setWrong] = useState(false);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const inCooldown = cooldownSeconds > 0;

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((cooldownUntil - Date.now()) / 1000),
      );
      setCooldownSeconds(remaining);
      if (remaining === 0) setCooldownUntil(0);
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const registerFailure = (message: string) => {
    setWrong(true);
    setFeedback(message);

    setAttempts((current) => {
      const count = (current[phase] ?? 0) + 1;
      if (count % 3 === 0) setCooldownUntil(Date.now() + 12_000);
      return { ...current, [phase]: count };
    });

    window.setTimeout(() => setWrong(false), 900);
  };

  const selectedArtists = useMemo(
    () =>
      new Set(
        Object.values(assignments)
          .map((entry) => entry.artist)
          .filter(Boolean),
      ),
    [assignments],
  );

  const selectedYears = useMemo(
    () =>
      new Set(
        Object.values(assignments)
          .map((entry) => entry.year)
          .filter(Boolean),
      ),
    [assignments],
  );

  const setAssignment = (
    workId: string,
    field: keyof Assignment,
    value: string,
  ) => {
    setAssignments((current) => ({
      ...current,
      [workId]: {
        ...(current[workId] ?? { artist: "", year: "" }),
        [field]: value,
      },
    }));
    setFeedback("");
  };

  const submitCatalogue = () => {
    if (inCooldown) return;

    const complete = config.works.every((work) => {
      const assignment = assignments[work.id];
      return Boolean(assignment?.artist && assignment?.year);
    });

    if (!complete) {
      registerFailure(
        "Die Katalogisierung ist noch unvollständig. Jedes Werk braucht Künstler und Jahr.",
      );
      return;
    }

    const correct = config.works.every((work) => {
      const assignment = assignments[work.id];
      return (
        assignment?.artist === work.artist &&
        assignment?.year === work.yearLabel
      );
    });

    if (!correct) {
      registerFailure(
        "Die Katalogisierung enthält noch mindestens eine falsche Zuordnung. Einzelne Datensätze werden nicht markiert.",
      );
      return;
    }

    setFeedback("Katalogisierung bestätigt. Chronologie freigegeben.");
    window.setTimeout(() => {
      setFeedback("");
      setPhase(1);
    }, 650);
  };

  const move = (index: number, delta: number) => {
    if (inCooldown) return;

    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= orderedWorks.length) return;

    const next = [...orderedWorks];
    const [entry] = next.splice(index, 1);
    if (!entry) return;

    next.splice(nextIndex, 0, entry);
    setOrderedWorks(next);
    setFeedback("");
  };

  const dropOn = (targetId: string) => {
    if (!draggingId || draggingId === targetId || inCooldown) return;

    const next = [...orderedWorks];
    const from = next.findIndex((work) => work.id === draggingId);
    const to = next.findIndex((work) => work.id === targetId);

    if (from < 0 || to < 0) return;

    const [entry] = next.splice(from, 1);
    if (!entry) return;

    next.splice(to, 0, entry);
    setOrderedWorks(next);
    setDraggingId(undefined);
    setFeedback("");
  };

  const submitChronology = () => {
    if (inCooldown) return;

    const correct = orderedWorks.every(
      (work, index) => work.id === chronological[index]?.id,
    );

    if (!correct) {
      registerFailure(
        "Die historische Reihenfolge ist noch nicht korrekt. Es wird nicht angezeigt, welche Position falsch ist.",
      );
      return;
    }

    setOrderedWorks(chronological);
    setFeedback("Chronologie bestätigt. Archivsequenz kann jetzt erfasst werden.");
    window.setTimeout(() => {
      setFeedback("");
      setPhase(2);
    }, 650);
  };

  const submitArchiveSequence = () => {
    if (inCooldown) return;

    const complete = chronological.every(
      (work) => archiveNumberInputs[work.id]?.trim().length > 0,
    );

    if (!complete) {
      registerFailure(
        "Die Archivsequenz ist noch unvollständig. Übertragt die kleine Archivzahl jedes Werkes in chronologischer Reihenfolge.",
      );
      return;
    }

    const correct = chronological.every(
      (work) =>
        Number(archiveNumberInputs[work.id]?.trim()) === work.archiveNumber,
    );

    if (!correct) {
      registerFailure(
        "Mindestens eine Archivzahl wurde falsch übertragen. Es wird nicht angezeigt, welche Position betroffen ist.",
      );
      return;
    }

    setArchiveSequenceAccepted(true);
    setFeedback("Archivsequenz bestätigt. Übersetzung freigegeben.");
  };

  const submitDecodedWord = () => {
    if (inCooldown) return;

    if (normalizeText(decodedWord) !== normalizeText(config.decodeAnswer)) {
      registerFailure(
        "Die Übersetzung der Archivsequenz ist noch nicht korrekt.",
      );
      return;
    }

    setWordAccepted(true);
    setFeedback("Archivname erkannt. Ein letzter Marker fehlt.");
  };

  const submitFinalMarker = () => {
    if (inCooldown) return;

    const expected = config.finalMarkerAnswer ?? "";
    if (!expected || normalizeText(finalMarker) !== normalizeText(expected)) {
      registerFailure(
        "Der zusätzliche Marker stimmt noch nicht. Prüft das letzte Werk der korrekten Chronologie.",
      );
      return;
    }

    setFeedback("");
    setPhase(3);
    onSolved();
  };

  const resetLocal = () => {
    if (solved) return;

    setPhase(0);
    setAssignments(
      Object.fromEntries(
        config.works.map((work) => [
          work.id,
          { artist: "", year: "" },
        ]),
      ),
    );
    setOrderedWorks(initialChronology(config.works));
    setDraggingId(undefined);
    setArchiveNumberInputs(
      Object.fromEntries(
        chronological.map((work) => [work.id, ""]),
      ),
    );
    setArchiveSequenceAccepted(false);
    setDecodedWord("");
    setFinalMarker("");
    setWordAccepted(false);
    setFeedback("");
    setWrong(false);
    setAttempts({});
    setCooldownUntil(0);
  };

  return (
    <div className="field-panel overflow-hidden">
      <div className="border-b border-border bg-background/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-md border border-gold/40 bg-gold/10">
              <Landmark className="size-5 text-gold" />
            </div>
            <div>
              <Label>Kunstarchiv · Sammlung 08</Label>
              <h2 className="mt-1 font-display text-xl font-bold uppercase text-paper">
                Archiv der verlorenen Meister
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Sechs Werke · sechs Datensätze · eine verborgene Sequenz
              </p>
            </div>
          </div>

          {!solved && phase < 3 ? (
            <button
              type="button"
              onClick={resetLocal}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-paper"
            >
              <RotateCcw className="size-3.5" />
              Archiv zurücksetzen
            </button>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <PhaseBar phase={phase} solved={solved} />

        {phase === 0 && !solved ? (
          <section>
            <Label>Phase 1 · Katalogisierung</Label>
            <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
              Künstler und Entstehungszeit rekonstruieren
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {config.instruction ??
                "Ordnet jedem Werk Künstler und Entstehungszeit zu."}
            </p>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {config.works.map((work) => {
                const assignment =
                  assignments[work.id] ?? { artist: "", year: "" };

                return (
                  <div
                    key={work.id}
                    className={`rounded-md border bg-background/30 p-4 transition-colors ${
                      wrong ? "border-destructive/50" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-base font-bold uppercase text-paper">
                          {work.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Vergleicht dieses Kürzel mit dem entsprechenden Bild
                          auf eurem Sixpack-Kunstträger.
                        </p>
                      </div>
                      <span className="rounded border border-gold/30 bg-gold/10 px-2 py-1 font-mono text-[10px] text-gold">
                        ARCHIV
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Künstler
                        </span>
                        <select
                          value={assignment.artist}
                          disabled={inCooldown}
                          onChange={(event) =>
                            setAssignment(
                              work.id,
                              "artist",
                              event.target.value,
                            )
                          }
                          className="mt-2 h-12 w-full rounded-md border border-border bg-background/60 px-3 text-sm text-paper outline-none focus:border-primary"
                        >
                          <option value="">Auswählen …</option>
                          {config.artistOptions.map((artist) => (
                            <option
                              key={artist}
                              value={artist}
                              disabled={
                                artist !== assignment.artist &&
                                selectedArtists.has(artist)
                              }
                            >
                              {artist}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Jahr
                        </span>
                        <select
                          value={assignment.year}
                          disabled={inCooldown}
                          onChange={(event) =>
                            setAssignment(work.id, "year", event.target.value)
                          }
                          className="mt-2 h-12 w-full rounded-md border border-border bg-background/60 px-3 text-sm text-paper outline-none focus:border-primary"
                        >
                          <option value="">Auswählen …</option>
                          {config.yearOptions.map((year) => (
                            <option
                              key={year}
                              value={year}
                              disabled={
                                year !== assignment.year &&
                                selectedYears.has(year)
                              }
                            >
                              {year}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              className="mt-5 min-h-[48px] w-full"
              disabled={inCooldown}
              onClick={submitCatalogue}
            >
              Gesamten Katalog prüfen
            </Button>
          </section>
        ) : null}

        {phase === 1 && !solved ? (
          <section>
            <Label>Phase 2 · Chronologie</Label>
            <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
              Die Werke in ihre Zeit zurückbringen
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {config.chronologyInstruction ??
                "Ordnet die Werke vom ältesten zum jüngsten."}
            </p>

            <div className="mt-5 space-y-2">
              {orderedWorks.map((work, index) => (
                <div
                  key={work.id}
                  draggable={!inCooldown}
                  onDragStart={() => setDraggingId(work.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropOn(work.id)}
                  className={`flex min-h-[72px] items-center gap-3 rounded-md border bg-background/40 px-3 py-3 ${
                    wrong ? "border-destructive/60" : "border-border"
                  }`}
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-display text-sm font-bold uppercase text-gold">
                        {work.label}
                      </span>
                      <span className="font-display text-base font-semibold text-paper">
                        {work.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {work.artist} · {work.yearLabel}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9"
                      aria-label={`${work.label} nach oben`}
                      disabled={inCooldown || index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9"
                      aria-label={`${work.label} nach unten`}
                      disabled={
                        inCooldown || index === orderedWorks.length - 1
                      }
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="mt-5 min-h-[48px] w-full"
              disabled={inCooldown}
              onClick={submitChronology}
            >
              Chronologie prüfen
            </Button>
          </section>
        ) : null}

        {phase === 2 && !solved ? (
          <section>
            <Label>Phase 3 · Übersetzung</Label>
            <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
              Die Archivsequenz entschlüsseln
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {config.decodeInstruction ??
                "Lest die Archivmarkierungen in der richtigen Reihenfolge und entschlüsselt sie."}
            </p>

            {!archiveSequenceAccepted ? (
              <div className="mt-5">
                <div className="rounded-md border border-gold/40 bg-gold/10 p-5">
                  <Label>Archivsequenz erfassen</Label>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Die Chronologie steht. Schaut jetzt wieder auf den physischen
                    Sixpack-Karton. Jedes Werk trägt eine kleine Archivzahl.
                    Übertragt die Zahlen in exakt der Reihenfolge, die ihr gerade
                    rekonstruiert habt.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {chronological.map((work, index) => (
                      <label
                        key={work.id}
                        className="rounded-md border border-border bg-background/40 p-3 text-center"
                      >
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                          Position {index + 1}
                        </span>
                        <span className="mt-1 block text-xs text-paper">
                          {work.label}
                        </span>
                        <input
                          value={archiveNumberInputs[work.id] ?? ""}
                          disabled={inCooldown}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 2);
                            setArchiveNumberInputs((current) => ({
                              ...current,
                              [work.id]: value,
                            }));
                            setFeedback("");
                          }}
                          inputMode="numeric"
                          autoComplete="off"
                          aria-label={`Archivzahl Position ${index + 1}`}
                          placeholder="?"
                          className="mt-3 h-12 w-full rounded-md border border-border bg-background/60 text-center font-mono text-xl font-bold text-paper outline-none focus:border-primary"
                        />
                      </label>
                    ))}
                  </div>

                  <Button
                    className="mt-5 min-h-[48px] w-full"
                    disabled={inCooldown}
                    onClick={submitArchiveSequence}
                  >
                    Archivzahlen prüfen
                  </Button>
                </div>
              </div>
            ) : !wordAccepted ? (
              <>
                <div className="mt-5 rounded-md border border-success/40 bg-success/10 p-5 text-center">
                  <Label>Archivsequenz bestätigt</Label>
                  <p className="mt-3 font-mono text-xl font-bold tracking-[0.12em] text-paper">
                    {chronological
                      .map((work) => archiveNumberInputs[work.id])
                      .join(" · ")}
                  </p>

                  {config.decodeHint ? (
                    <p className="mx-auto mt-4 max-w-xl font-hand text-xl leading-relaxed text-muted-foreground">
                      {config.decodeHint}
                    </p>
                  ) : null}
                </div>

                <label className="mt-5 block">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Entschlüsselte Sequenz
                  </span>
                  <input
                    value={decodedWord}
                    disabled={inCooldown}
                    onChange={(event) => setDecodedWord(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="______"
                    className="mt-2 h-12 w-full rounded-md border border-border bg-background/60 px-4 font-display text-lg uppercase tracking-[0.18em] text-paper outline-none focus:border-primary"
                  />
                </label>

                <Button
                  className="mt-4 min-h-[48px] w-full"
                  disabled={inCooldown}
                  onClick={submitDecodedWord}
                >
                  Übersetzung prüfen
                </Button>
              </>
            ) : (
              <div className="mt-5">
                <div className="rounded-md border border-success/40 bg-success/10 p-4">
                  <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-success">
                    Archivname erkannt
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.16em] text-paper">
                    {config.decodeAnswer}
                  </p>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {config.finalMarkerPrompt ??
                    "Auf dem letzten Werk befindet sich ein zusätzlicher Marker."}
                </p>

                <label className="mt-4 block">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Zusätzlicher Marker
                  </span>
                  <input
                    value={finalMarker}
                    disabled={inCooldown}
                    onChange={(event) =>
                      setFinalMarker(event.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="__"
                    className="mt-2 h-12 w-full rounded-md border border-border bg-background/60 px-4 text-center font-mono text-xl font-bold text-paper outline-none focus:border-primary"
                  />
                </label>

                <Button
                  className="mt-4 min-h-[48px] w-full"
                  disabled={inCooldown}
                  onClick={submitFinalMarker}
                >
                  Marker prüfen
                </Button>
              </div>
            )}
          </section>
        ) : null}

        {phase === 3 || solved ? (
          <section>
            <div className="rounded-md border border-success/50 bg-success/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-6 shrink-0 text-success" />
                <div>
                  <Label>{config.successTitle ?? "Archiv rekonstruiert"}</Label>
                  <h3 className="mt-2 font-display text-xl font-bold uppercase text-success">
                    Der nächste Archivort wurde identifiziert.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Künstler, Zeitfolge und Archivsequenz ergeben gemeinsam
                    einen Namen. Der letzte Marker vervollständigt die Adresse.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-gold/50 bg-gold/10 p-5 text-center">
              <Label>Nächster Ort</Label>
              <p className="mt-3 font-display text-2xl font-bold uppercase tracking-[0.08em] text-paper">
                {config.finalDestination ??
                  `${config.decodeAnswer} ${config.finalMarkerAnswer ?? ""}`}
              </p>
            </div>
          </section>
        ) : null}

        {feedback ? (
          <div
            className={`mt-5 rounded-md border p-3 text-sm ${
              wrong
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-success/40 bg-success/10 text-success"
            }`}
          >
            {feedback}
          </div>
        ) : null}

        <CooldownNotice seconds={cooldownSeconds} />
      </div>
    </div>
  );
}
