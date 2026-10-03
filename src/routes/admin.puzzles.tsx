import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { adventure, heumarktLocationHints, heumarktTransition, puzzles } from "@/game/data";
import { puzzleTypeLabel } from "@/game/labels";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/game/store";
import { hintCodeFor } from "@/game/hintCodes";
import type { CircuitConfig, CodeConfig, FlappyConfig, MastermindConfig, MinesweeperConfig, MorseConfig, SimonConfig, SlidingConfig, WordleConfig } from "@/game/types";

export const Route = createFileRoute("/admin/puzzles")({
  head: () => ({
    meta: [
      { title: "Rätsel — Verwaltung" },
      { name: "description", content: "Worträtsel, Schiebepuzzles, Flugspiele und Codeschlösser konfigurieren." },
      { property: "og:title", content: "Rätsel — Verwaltung" },
      { property: "og:description", content: "Chiffren, Schiebepuzzles, Flugspiele und Codeschlösser konfigurieren." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungRätsel,
});

const tabs = ["Worträtsel", "Schiebepuzzle", "Flugspiel", "Code", "Codeknacker", "Signalfolge", "Morsezeichen", "Minenfeld", "Schaltkreis"] as const;

function VerwaltungRätsel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Worträtsel");
  const [type, setType] = useState("");
  const [saved, setSaved] = useState(false);
  const progress = usePlayer((state) => state);

  const hintGroups = [
    ...puzzles
      .filter((puzzle) => puzzle.stageId !== "demo" && puzzle.hints.length > 0)
      .map((puzzle) => ({
        puzzleId: puzzle.id,
        title: puzzle.title,
        stageId: puzzle.stageId,
        hints: puzzle.hints,
      })),
    {
      puzzleId: heumarktTransition.locationRiddleId,
      title: heumarktTransition.locationRiddle.title,
      stageId: "s4",
      hints: heumarktLocationHints,
    },
  ].sort((a, b) => {
    const aStage = adventure.stages.find((stage) => stage.id === a.stageId)?.number ?? 999;
    const bStage = adventure.stages.find((stage) => stage.id === b.stageId)?.number ?? 999;
    return aStage - bStage;
  });

  const wordle = puzzles.find((p) => p.type === "wordle")!.config as WordleConfig;
  const sliding = puzzles.find((p) => p.type === "sliding")!.config as SlidingConfig;
  const flappy = puzzles.find((p) => p.type === "flappy")!.config as FlappyConfig;
  const code = puzzles.find((p) => p.type === "code")!.config as CodeConfig;
  const mastermind = puzzles.find((p) => p.type === "mastermind")!.config as MastermindConfig;
  const simon = puzzles.find((p) => p.type === "simon")!.config as SimonConfig;
  const morse = puzzles.find((p) => p.type === "morse")!.config as MorseConfig;
  const mines = puzzles.find((p) => p.type === "minesweeper")!.config as MinesweeperConfig;
  const circuit = puzzles.find((p) => p.type === "circuit")!.config as CircuitConfig;

  return (
    <AdminShell
      title="Rätsel & Hinweiscodes"
      lead="Alle Freischaltcodes für die echte Expedition. Jeder Code gilt nur für genau einen Hinweis."
    >
      <section className="field-panel p-5">
        <div>
          <p className="label-mono text-gold">Live-Hinweise</p>
          <h2 className="mt-1 font-display text-xl font-bold uppercase">
            Codes für die Spielleitung
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Wenn die Gruppe anruft, sucht hier das aktuelle Rätsel und den gewünschten Hinweis.
            Ihr könnt den Code vorlesen oder als Spielnachricht einfügen.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {hintGroups.map((group) => {
            const stage = adventure.stages.find((entry) => entry.id === group.stageId);

            return (
              <div key={group.puzzleId} className="rounded-md border border-border bg-background/35 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="label-mono">
                      {stage ? `Etappe ${String(stage.number).padStart(2, "0")}` : group.stageId}
                    </p>
                    <h3 className="mt-1 font-display font-bold uppercase">{group.title}</h3>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{group.puzzleId}</span>
                </div>

                <div className="mt-4 space-y-2">
                  {group.hints.map((hint) => {
                    const code = hintCodeFor(group.puzzleId, hint.id);

                    return (
                      <div
                        key={hint.id}
                        className="grid gap-3 rounded-md border border-border/70 bg-surface/60 p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold uppercase">{hint.label}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{hint.text}</p>
                          <p className="mt-2 font-mono text-lg font-bold tracking-[0.12em] text-gold">
                            {code}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-2 sm:flex-col sm:items-stretch sm:justify-end">
                          <Button
                            variant="outline"
                            onClick={() => navigator.clipboard?.writeText(code)}
                          >
                            Code kopieren
                          </Button>
                          <Button
                            onClick={() =>
                              progress.sendMessage(`${group.title} · ${hint.label}: ${code}`)
                            }
                          >
                            Als Nachricht senden
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-8 border-t border-border pt-8">
        <p className="label-mono">Konfigurationsvorschau</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Der folgende Bereich ist weiterhin nur eine lokale Vorschau und verändert die aktiven Rätsel nicht.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><Field label="Rätseltyp hinzufügen"><select className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}><option value="">Typ auswählen</option>{Object.entries(puzzleTypeLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field><Button disabled={!type} onClick={() => setSaved(true)}>Rätsel hinzufügen</Button></div>
      {saved && <p role="status" className="mb-4 text-sm text-muted-foreground">In der Vorschau ausgewählt. Neue Rätsel werden noch nicht gespeichert.</p>}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <Button variant={tab === t ? "secondary" : "outline"}
            key={t}
            onClick={() => setTab(t)}
            className="min-h-[44px] shrink-0"
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {tab === "Worträtsel" ? (
          <>
            <Field label="Lösungswort">
              <TextInput defaultValue={wordle.word} />
            </Field>
            <Field label="Wortlänge">
              <TextInput type="number" defaultValue={wordle.word.length} />
            </Field>
            <Field label="Maximale Versuche">
              <TextInput type="number" defaultValue={wordle.maxAttempts} />
            </Field>
            <Field label="Hinweis">
              <TextInput defaultValue={wordle.clue} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Erfolgsmeldung">
                <TextInput defaultValue="CODE ENTSCHLÜSSELT" />
              </Field>
            </div>
          </>
        ) : null}

        {tab === "Schiebepuzzle" ? (
          <>
            <Field label="Bild-URL">
              <TextInput placeholder="https://" />
            </Field>
            <Field label="Rastergröße">
              <TextInput type="number" defaultValue={sliding.grid} />
            </Field>
            <Field label="Maximale Züge (0 = unbegrenzt)">
              <TextInput type="number" defaultValue={0} />
            </Field>
            <Toggle label="Zeitmessung aktiv" defaultChecked />
          </>
        ) : null}

        {tab === "Flugspiel" ? (
          <>
            <Field label="Symbol (PNG / SVG / WEBP)">
              <TextInput placeholder="Hochladen oder URL einfügen" />
            </Field>
            <Field label="Hintergrundmotiv">
              <TextInput defaultValue="Nächtliche Stadtsilhouette" />
            </Field>
            <Field label="Geschwindigkeit">
              <TextInput type="number" step="0.1" defaultValue={flappy.speed} />
            </Field>
            <Field label="Schwerkraft">
              <TextInput type="number" step="0.05" defaultValue={flappy.gravity} />
            </Field>
            <Field label="Abstand zwischen Hindernissen">
              <TextInput type="number" defaultValue={flappy.gap} />
            </Field>
            <Field label="Benötigte Punktzahl">
              <TextInput type="number" defaultValue={flappy.targetScore} />
            </Field>
          </>
        ) : null}

        {tab === "Code" ? (
          <>
            <Field label="Richtiger Code">
              <TextInput defaultValue={code.code} />
            </Field>
            <Field label="Zeichenanzahl">
              <TextInput type="number" defaultValue={code.length} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Hinweis">
                <TextInput defaultValue="Die Ziffern stehen unten rechts auf dem ersten Brief." />
              </Field>
            </div>
          </>
        ) : null}
        {tab === "Codeknacker" && <><Field label="Geheimkombination"><TextInput defaultValue={mastermind.secret} /></Field><Field label="Maximale Versuche"><TextInput type="number" defaultValue={mastermind.attempts} /></Field></>}
        {tab === "Signalfolge" && <Field label="Signalreihenfolge (0–3, kommagetrennt)"><TextInput defaultValue={simon.sequence.join(", ")} /></Field>}
        {tab === "Morsezeichen" && <><Field label="Funksignal"><TextInput defaultValue={morse.code} /></Field><Field label="Lösungswort"><TextInput defaultValue={morse.answer} /></Field></>}
        {tab === "Minenfeld" && <><Field label="Rastergröße"><TextInput type="number" defaultValue={mines.grid} /></Field><Field label="Minenpositionen (nullbasiert, kommagetrennt)"><TextInput defaultValue={mines.mines.join(", ")} /></Field></>}
        {tab === "Schaltkreis" && <><Field label="Rastergröße"><TextInput type="number" defaultValue={circuit.grid} /></Field><Field label="Wegpositionen (nullbasiert, kommagetrennt)"><TextInput defaultValue={circuit.path.join(", ")} /></Field></>}
      </div>

      <Button onClick={() => setSaved(true)} className="mt-6 min-h-[44px]">
        Konfiguration als Entwurf übernehmen
      </Button>
      {saved && <p role="status" className="mt-2 text-xs text-success">Nur in dieser Ansicht übernommen; das aktive Spiel bleibt unverändert.</p>}
    </AdminShell>
  );
}
