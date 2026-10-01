import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dna,
  FlaskConical,
  Microscope,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import type {
  DnaConfig,
  DnaLabRead,
  DnaReference,
} from "@/game/types";

type Base = "A" | "T" | "G" | "C";
type QcDecision = "keep" | "discard" | undefined;

type QcReason = "low-q" | "too-many-n" | "wrong-direction" | "too-short";

const baseClass: Record<Base, string> = {
  A: "border-success/40 bg-success/10 text-success",
  T: "border-primary/40 bg-primary/10 text-primary",
  G: "border-gold/40 bg-gold/10 text-gold",
  C: "border-sky-400/40 bg-sky-400/10 text-sky-300",
};

const reasonLabels: Record<QcReason, string> = {
  "low-q": "Mittlere Phred-Qualität unterschreitet den Grenzwert",
  "too-many-n": "Zu hoher Anteil ambiger Basen",
  "wrong-direction": "Falsche Leserichtung",
  "too-short": "Sequenz zu kurz",
};

function cleanSequence(sequence: string) {
  return sequence.replace(/\?/g, "N").replace(/[^ATGCN]/gi, "").toUpperCase();
}

function normalizeDnaInput(sequence: string) {
  return sequence.replace(/[^ATGCN]/gi, "").toUpperCase();
}

function SequenceText({
  sequence,
  numbered = false,
}: {
  sequence: string;
  numbered?: boolean;
}) {
  const clean = cleanSequence(sequence);

  return (
    <div className="flex flex-wrap gap-1 font-mono text-xs sm:text-sm">
      {clean.split("").map((base, index) => (
        <span
          key={`${base}-${index}`}
          title={numbered ? `Position ${index + 1}` : undefined}
          className={`relative grid size-7 place-items-center rounded border ${
            base === "N"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : baseClass[base as Base] ??
                "border-border bg-background/40 text-paper"
          }`}
        >
          {base}
          {numbered && (index + 1) % 5 === 0 ? (
            <span className="absolute -bottom-4 text-[8px] text-muted-foreground">
              {index + 1}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

function Progress({
  phase,
  complete,
}: {
  phase: number;
  complete: boolean;
}) {
  const steps = ["QC", "Reverse", "Assembly", "Taxonomie"];

  return (
    <div className="mb-6 grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const done = complete || index < phase;
        const active = !complete && index === phase;

        return (
          <div
            key={step}
            className={`rounded-md border px-2 py-3 text-center ${
              done
                ? "border-success/40 bg-success/10"
                : active
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-background/20"
            }`}
          >
            <div
              className={`font-display text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs ${
                done
                  ? "text-success"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {index + 1}. {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QualityReadCard({
  read,
  decision,
  reasons,
  disabled,
  onDecision,
  onReason,
}: {
  read: DnaLabRead;
  decision: QcDecision;
  reasons: QcReason[];
  disabled: boolean;
  onDecision: (decision: Exclude<QcDecision, undefined>) => void;
  onReason: (reason: QcReason) => void;
}) {
  return (
    <div
      className={`rounded-md border p-4 ${
        decision === "discard"
          ? "border-destructive/35 bg-destructive/5"
          : decision === "keep"
            ? "border-success/35 bg-success/5"
            : "border-border bg-background/30"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-paper">
            {read.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{read.note}</p>
        </div>

        <div className="flex gap-2">
          <span className="rounded border border-border px-2 py-1 font-mono text-xs text-paper">
            Q̄ {read.meanQ}
          </span>
          <span className="rounded border border-border px-2 py-1 font-mono text-xs text-paper">
            N {read.ambiguousPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <SequenceText sequence={read.sequence} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDecision("keep")}
          className={`min-h-[44px] rounded-md border font-display text-xs font-bold uppercase tracking-[0.12em] ${
            decision === "keep"
              ? "border-success bg-success/10 text-success"
              : "border-border bg-background/40 text-muted-foreground hover:bg-accent"
          }`}
        >
          Keep
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDecision("discard")}
          className={`min-h-[44px] rounded-md border font-display text-xs font-bold uppercase tracking-[0.12em] ${
            decision === "discard"
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-border bg-background/40 text-muted-foreground hover:bg-accent"
          }`}
        >
          Discard
        </button>
      </div>

      {decision === "discard" ? (
        <div className="mt-4 rounded-md border border-border/70 bg-background/30 p-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Begründung
          </p>
          <div className="mt-3 grid gap-2">
            {(Object.keys(reasonLabels) as QcReason[]).map((reason) => {
              const active = reasons.includes(reason);
              return (
                <label
                  key={reason}
                  className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={active}
                    onChange={() => onReason(reason)}
                    className="mt-0.5 size-4 accent-[var(--primary)]"
                  />
                  <span className={active ? "text-paper" : undefined}>
                    {reasonLabels[reason]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReferenceTable({
  references,
  positions,
}: {
  references: DnaReference[];
  positions: number[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-display text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Referenz
            </th>
            {positions.map((position) => (
              <th
                key={position}
                className="p-3 text-center font-mono text-xs text-muted-foreground"
              >
                Pos. {position}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {references.map((reference) => (
            <tr
              key={reference.id}
              className="border-b border-border/70"
            >
              <td className="p-3">
                <p className="font-display text-sm font-bold text-paper">
                  {reference.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reference.note}
                </p>
              </td>
              {positions.map((position) => {
                const base =
                  reference.diagnosticBases[String(position)] as Base;
                return (
                  <td key={position} className="p-3 text-center">
                    <span
                      className={`inline-grid size-8 place-items-center rounded border font-mono font-bold ${
                        baseClass[base]
                      }`}
                    >
                      {base}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CooldownNotice({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-md border border-gold/40 bg-gold/10 p-4">
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold" />
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-gold">
          Analyse instabil
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Zu viele unmittelbare Fehlversuche. Prüft eure Daten erneut. Neue
          Einreichung in {seconds}s.
        </p>
      </div>
    </div>
  );
}

export function DnaPuzzle({
  config,
  solved,
  onSolved,
}: {
  config: DnaConfig;
  solved: boolean;
  onSolved: () => void;
}) {
  const [phase, setPhase] = useState(solved ? 4 : 0);
  const [feedback, setFeedback] = useState("");
  const [wrong, setWrong] = useState(false);

  const [qcDecisions, setQcDecisions] = useState<Record<string, QcDecision>>({});
  const [qcReasons, setQcReasons] = useState<Record<string, QcReason[]>>({});

  const [reverseInput, setReverseInput] = useState("");

  const minOffset = Math.max(0, config.correctOverlapOffset - 8);
  const maxOffset = config.correctOverlapOffset + 8;
  const [offset, setOffset] = useState(minOffset);
  const [consensusInput, setConsensusInput] = useState("");

  const [diagnosticInput, setDiagnosticInput] = useState<Record<string, string>>(
    {},
  );
  const [referenceInput, setReferenceInput] = useState("");

  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const forwardRead = useMemo(
    () => config.reads.find((read) => read.id === config.forwardReadId),
    [config.forwardReadId, config.reads],
  );
  const reverseRead = useMemo(
    () => config.reads.find((read) => read.id === config.reverseReadId),
    [config.reads, config.reverseReadId],
  );
  const expectedReverse = useMemo(
    () =>
      config.reverseOptions.find(
        (option) => option.id === config.correctReverseOptionId,
      )?.sequence ?? "",
    [config.correctReverseOptionId, config.reverseOptions],
  );

  const inCooldown = cooldownSeconds > 0;

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
      if (remaining === 0) {
        setCooldownUntil(0);
      }
    };

    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const registerFailure = (message: string) => {
    setWrong(true);
    setFeedback(message);

    setAttempts((current) => {
      const nextCount = (current[phase] ?? 0) + 1;
      if (nextCount % 3 === 0) {
        setCooldownUntil(Date.now() + 12_000);
      }
      return { ...current, [phase]: nextCount };
    });

    window.setTimeout(() => setWrong(false), 900);
  };

  const pass = (message: string, nextPhase: number) => {
    setWrong(false);
    setFeedback(message);
    window.setTimeout(() => {
      setFeedback("");
      setPhase(nextPhase);
    }, 650);
  };

  const toggleReason = (readId: string, reason: QcReason) => {
    setQcReasons((current) => {
      const existing = current[readId] ?? [];
      const next = existing.includes(reason)
        ? existing.filter((entry) => entry !== reason)
        : [...existing, reason];
      return { ...current, [readId]: next };
    });
  };

  const submitQc = () => {
    if (inCooldown) return;

    const allClassified = config.reads.every(
      (read) => qcDecisions[read.id] === "keep" || qcDecisions[read.id] === "discard",
    );

    if (!allClassified) {
      registerFailure("Die QC-Einreichung ist unvollständig.");
      return;
    }

    const classificationsCorrect = config.reads.every((read) => {
      const expectedDecision =
        read.id === config.discardReadId ? "discard" : "keep";
      return qcDecisions[read.id] === expectedDecision;
    });

    const discardReasons = qcReasons[config.discardReadId] ?? [];
    const reasonsCorrect =
      discardReasons.includes("low-q") &&
      discardReasons.includes("too-many-n") &&
      !discardReasons.includes("wrong-direction") &&
      !discardReasons.includes("too-short");

    if (!classificationsCorrect || !reasonsCorrect) {
      registerFailure(
        "Die eingereichte Read-Klassifikation erfüllt die QC-Kriterien noch nicht.",
      );
      return;
    }

    pass("QC bestanden · Read-Set für die Assembly freigegeben.", 1);
  };

  const submitReverse = () => {
    if (inCooldown) return;

    const normalized = normalizeDnaInput(reverseInput);
    const expected = normalizeDnaInput(expectedReverse);

    if (!normalized || normalized !== expected) {
      registerFailure(
        "Die eingereichte Sequenz ist nicht korrekt in 5′→3′ orientiert.",
      );
      return;
    }

    pass("Reverse-Read korrekt normalisiert.", 2);
  };

  const shiftOffset = (delta: number) => {
    setOffset((current) =>
      Math.min(maxOffset, Math.max(minOffset, current + delta)),
    );
  };

  const submitAssembly = () => {
    if (inCooldown) return;

    const consensus = normalizeDnaInput(consensusInput);
    const expectedConsensus = normalizeDnaInput(config.consensusSequence);

    if (offset !== config.correctOverlapOffset || consensus !== expectedConsensus) {
      registerFailure(
        "Das eingereichte Alignment oder der Konsensus enthält noch mindestens einen Widerspruch.",
      );
      return;
    }

    pass("Assembly bestätigt · Konsensus für die Referenzsuche freigegeben.", 3);
  };

  const submitTaxonomy = () => {
    if (inCooldown) return;

    const profileCorrect = config.diagnosticPositions.every((position) => {
      const entered = (diagnosticInput[String(position)] ?? "")
        .trim()
        .toUpperCase();
      const expected = config.consensusSequence[position - 1]?.toUpperCase();
      return entered === expected;
    });

    const correctReference = config.references.find(
      (reference) => reference.id === config.correctReferenceId,
    );
    const normalizedReference = referenceInput
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const acceptedReferenceNames = [
      correctReference?.name ?? "",
      config.correctReferenceId,
      "c",
      "morphospezies c",
    ]
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    const referenceCorrect = acceptedReferenceNames.includes(
      normalizedReference,
    );

    if (!profileCorrect || !referenceCorrect) {
      registerFailure(
        "Das diagnostische Profil stimmt noch nicht vollständig mit der eingereichten Referenzzuordnung überein.",
      );
      return;
    }

    setFeedback("");
    setPhase(4);
    onSolved();
  };

  const resetLocal = () => {
    if (solved) return;
    setPhase(0);
    setFeedback("");
    setWrong(false);
    setQcDecisions({});
    setQcReasons({});
    setReverseInput("");
    setOffset(minOffset);
    setConsensusInput("");
    setDiagnosticInput({});
    setReferenceInput("");
    setAttempts({});
    setCooldownUntil(0);
  };

  const displayedForward = cleanSequence(forwardRead?.sequence ?? "");
  const displayedReverse = cleanSequence(expectedReverse);

  return (
    <div className="field-panel overflow-hidden">
      <div className="border-b border-border bg-background/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10">
              <Microscope className="size-5 text-primary" />
            </div>
            <div>
              <Label>{config.caseId}</Label>
              <h2 className="mt-1 font-display text-xl font-bold uppercase text-paper">
                {config.marker}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {config.specimen}
              </p>
            </div>
          </div>

          {!solved && phase < 4 ? (
            <button
              type="button"
              onClick={resetLocal}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-paper"
            >
              <RotateCcw className="size-3.5" />
              Analyse zurücksetzen
            </button>
          ) : null}
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {config.intro}
        </p>
      </div>

      <div className="p-5">
        <Progress phase={phase} complete={solved || phase === 4} />

        {phase === 0 && !solved ? (
          <section>
            <div className="flex items-start gap-3">
              <FlaskConical className="mt-1 size-5 shrink-0 text-gold" />
              <div>
                <Label>Phase 1 · Qualitätskontrolle</Label>
                <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
                  Klassifiziert das komplette Read-Set
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Für diese Analyse gelten: mittlere Phred-Qualität ≥{" "}
                  <strong className="text-paper">
                    {config.qualityThreshold.minMeanQ}
                  </strong>{" "}
                  und ambige Basen ≤{" "}
                  <strong className="text-paper">
                    {config.qualityThreshold.maxAmbiguousPercent}%
                  </strong>
                  . Jeder Read muss als KEEP oder DISCARD klassifiziert werden.
                  Für verworfene Reads ist zusätzlich eine Begründung erforderlich.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {config.reads.map((read) => (
                <QualityReadCard
                  key={read.id}
                  read={read}
                  decision={qcDecisions[read.id]}
                  reasons={qcReasons[read.id] ?? []}
                  disabled={inCooldown}
                  onDecision={(decision) =>
                    setQcDecisions((current) => ({
                      ...current,
                      [read.id]: decision,
                    }))
                  }
                  onReason={(reason) => toggleReason(read.id, reason)}
                />
              ))}
            </div>

            <Button
              className="mt-5 min-h-[48px] w-full"
              disabled={inCooldown}
              onClick={submitQc}
            >
              Gesamte QC einreichen
            </Button>
          </section>
        ) : null}

        {phase === 1 && !solved ? (
          <section>
            <div className="flex items-start gap-3">
              <Dna className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <Label>Phase 2 · Read-Orientierung</Label>
                <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
                  Reverse Complement selbst rekonstruieren
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Der Sequencer exportiert REV-02 in 5′→3′. Gebt die Sequenz
                  ein, die ihr für einen direkten Vergleich mit dem Forward-Read
                  benötigt. Es gibt keine Auswahlmöglichkeiten.
                </p>
              </div>
            </div>

            {reverseRead ? (
              <div className="mt-5 rounded-md border border-border bg-background/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label>Rohread · {reverseRead.label}</Label>
                  <span className="font-mono text-xs text-muted-foreground">
                    5′ → 3′
                  </span>
                </div>
                <div className="mt-3 overflow-x-auto pb-1">
                  <SequenceText sequence={reverseRead.sequence} />
                </div>
              </div>
            ) : null}

            <label className="mt-5 block">
              <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Normalisierte Sequenz · 5′ → 3′
              </span>
              <textarea
                value={reverseInput}
                disabled={inCooldown}
                onChange={(event) =>
                  setReverseInput(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^ATGC\s'-]/g, ""),
                  )
                }
                rows={3}
                spellCheck={false}
                placeholder="A/T/G/C …"
                className="mt-2 w-full resize-none rounded-md border border-border bg-background/50 p-4 font-mono text-sm uppercase tracking-[0.08em] text-paper outline-none focus:border-primary"
              />
            </label>

            <p className="mt-2 text-xs text-muted-foreground">
              Leerzeichen und 5′/3′-Zeichen werden bei der Prüfung ignoriert.
              Einzelne falsche Positionen werden nicht verraten.
            </p>

            <Button
              className="mt-5 min-h-[48px] w-full"
              disabled={inCooldown}
              onClick={submitReverse}
            >
              Sequenz einreichen
            </Button>
          </section>
        ) : null}

        {phase === 2 && !solved ? (
          <section>
            <div className="flex items-start gap-3">
              <ScanSearch className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <Label>Phase 3 · Assembly</Label>
                <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
                  Reads ausrichten und Konsensus schreiben
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Verschiebt den normalisierten Reverse-Read gegen den
                  Forward-Read, bis die Überlappung plausibel ist. Anschließend
                  gebt ihr die vollständige Konsensussequenz selbst ein. Erst
                  die gemeinsame Einreichung wird geprüft.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-md border border-border bg-[#101713] p-4">
              <div className="min-w-[880px] font-mono text-xs leading-7">
                <div className="whitespace-pre text-paper">
                  FWD 5′  {displayedForward} 3′
                </div>
                <div
                  className="whitespace-pre text-primary"
                  style={{ paddingLeft: `${7 + offset}ch` }}
                >
                  REV 5′  {displayedReverse} 3′
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={inCooldown || offset <= minOffset}
                onClick={() => shiftOffset(-1)}
                className="grid size-11 place-items-center rounded-md border border-border bg-background/40 text-paper hover:bg-accent disabled:opacity-30"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="min-w-32 rounded-md border border-border bg-background/30 px-4 py-3 text-center">
                <p className="font-display text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Offset
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-paper">
                  +{offset}
                </p>
              </div>

              <button
                type="button"
                disabled={inCooldown || offset >= maxOffset}
                onClick={() => shiftOffset(1)}
                className="grid size-11 place-items-center rounded-md border border-border bg-background/40 text-paper hover:bg-accent disabled:opacity-30"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Vollständige Konsensussequenz · 5′ → 3′
              </span>
              <textarea
                value={consensusInput}
                disabled={inCooldown}
                onChange={(event) =>
                  setConsensusInput(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^ATGCN\s'-]/g, ""),
                  )
                }
                rows={4}
                spellCheck={false}
                placeholder="Rekonstruiert die vollständige Sequenz …"
                className="mt-2 w-full resize-none rounded-md border border-border bg-background/50 p-4 font-mono text-sm uppercase tracking-[0.08em] text-paper outline-none focus:border-primary"
              />
            </label>

            <p className="mt-2 text-xs text-muted-foreground">
              Hinweis: Im Forward-Read liegt eine ambige Base N im
              Überlappungsbereich. Sie muss im Konsensus aufgelöst werden.
            </p>

            <Button
              className="mt-5 min-h-[48px] w-full"
              disabled={inCooldown}
              onClick={submitAssembly}
            >
              Alignment + Konsensus einreichen
            </Button>
          </section>
        ) : null}

        {phase === 3 && !solved ? (
          <section>
            <div className="flex items-start gap-3">
              <Microscope className="mt-1 size-5 shrink-0 text-gold" />
              <div>
                <Label>Phase 4 · Taxonomische Zuordnung</Label>
                <h3 className="mt-1 font-display text-xl font-bold uppercase text-paper">
                  Diagnostisches Profil selbst extrahieren
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Lest die angegebenen Positionen selbst aus eurem Konsensus
                  aus. Tragt anschließend den Namen der Referenzlinie ein, die
                  vollständig zum Profil passt.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-success/30 bg-success/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label>Konsensus · Positionsnummern 1-basiert</Label>
                <span className="font-mono text-xs text-muted-foreground">
                  5′ → 3′
                </span>
              </div>
              <div className="mt-4 overflow-x-auto pb-5">
                <SequenceText sequence={config.consensusSequence} numbered />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {config.diagnosticPositions.map((position) => (
                <label
                  key={position}
                  className="rounded-md border border-border bg-background/30 p-3 text-center"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    Pos. {position}
                  </span>
                  <input
                    value={diagnosticInput[String(position)] ?? ""}
                    disabled={inCooldown}
                    onChange={(event) => {
                      const value = event.target.value
                        .toUpperCase()
                        .replace(/[^ATGC]/g, "")
                        .slice(-1);
                      setDiagnosticInput((current) => ({
                        ...current,
                        [String(position)]: value,
                      }));
                    }}
                    maxLength={1}
                    inputMode="text"
                    className="mt-2 h-11 w-full rounded-md border border-border bg-background/50 text-center font-mono text-xl font-bold uppercase text-paper outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-border bg-background/20">
              <ReferenceTable
                references={config.references}
                positions={config.diagnosticPositions}
              />
            </div>

            <label className="mt-5 block">
              <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Referenzzuordnung
              </span>
              <input
                value={referenceInput}
                disabled={inCooldown}
                onChange={(event) => setReferenceInput(event.target.value)}
                placeholder="z. B. Morphospezies …"
                className="mt-2 h-12 w-full rounded-md border border-border bg-background/50 px-4 font-display text-sm text-paper outline-none focus:border-primary"
              />
            </label>

            <Button
              className="mt-5 min-h-[48px] w-full"
              disabled={inCooldown}
              onClick={submitTaxonomy}
            >
              Profil + Taxonomie einreichen
            </Button>
          </section>
        ) : null}

        {phase === 4 || solved ? (
          <section>
            <div className="rounded-md border border-success/50 bg-success/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-6 shrink-0 text-success" />
                <div>
                  <Label>{config.successTitle ?? "Analyse abgeschlossen"}</Label>
                  <h3 className="mt-2 font-display text-2xl font-bold uppercase text-success">
                    {config.references.find(
                      (reference) =>
                        reference.id === config.correctReferenceId,
                    )?.name ?? "Referenz bestätigt"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Read-QC, Reverse-Orientierung, Assembly und diagnostisches
                    Referenzprofil sind konsistent.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-gold/50 bg-gold/10 p-5">
              <Label>Laboretikett freigegeben</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-mono text-3xl font-bold tracking-[0.12em] text-gold">
                    {config.specimenLabel}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Archivierte Locality-Kennung der Probe
                  </p>
                </div>
                <ChevronRight className="hidden size-6 text-gold sm:block" />
              </div>
              <div className="mt-4 border-t border-gold/20 pt-4">
                <p className="font-display text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Nächste Adresse
                </p>
                <p className="mt-2 font-display text-xl font-bold uppercase text-paper">
                  {config.revealText}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {feedback ? (
          <div
            className={`mt-5 flex items-center gap-3 rounded-md border p-3 text-sm ${
              wrong
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-success/40 bg-success/10 text-success"
            }`}
          >
            {wrong ? (
              <X className="size-4 shrink-0" />
            ) : (
              <Check className="size-4 shrink-0" />
            )}
            {feedback}
          </div>
        ) : null}

        <CooldownNotice seconds={cooldownSeconds} />
      </div>
    </div>
  );
}
