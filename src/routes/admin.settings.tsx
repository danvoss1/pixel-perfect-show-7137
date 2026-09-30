import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Einstellungen — Verwaltung" },
      {
        name: "description",
        content: "Allgemeine Einstellungen für das Abenteuerspiel.",
      },
      { property: "og:title", content: "Einstellungen — Verwaltung" },
      {
        property: "og:description",
        content: "Allgemeine Einstellungen für das Abenteuerspiel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungEinstellungen,
});

function VerwaltungEinstellungen() {
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const resetGame = usePlayer((s) => s.reset);
  const started = usePlayer((s) => s.started);
  const completedStages = usePlayer((s) => s.completedStages.length);
  const completedPuzzles = usePlayer((s) => s.completedPuzzles.length);
  const inventoryCount = usePlayer((s) => s.inventory.length);

  const navigate = useNavigate();

  const handleReset = () => {
    resetGame();
    setConfirmReset(false);
    setResetDone(true);
  };

  return (
    <AdminShell
      title="Einstellungen"
      lead="Allgemeine Einstellungen und Verwaltung des lokalen Spielstands."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Organisation">
          <TextInput defaultValue="Der verborgene Pfad Expeditionen" />
        </Field>
        <Field label="Kontakt für Fragen">
          <TextInput defaultValue="team@hiddenpath.example" />
        </Field>
        <Field label="Standardstadt">
          <TextInput defaultValue="Köln" />
        </Field>
        <Field label="Hinweisabzug (Minuten)">
          <TextInput type="number" defaultValue={5} />
        </Field>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Toggle label="Toneffekte für Spielende verfügbar" defaultChecked />
        <Toggle label="Reduzierte Bewegung als Standard" />
        <Toggle label="Live-Spielleitung" defaultChecked />
        <Toggle label="Bestenliste anzeigen" />
      </div>

      <div className="mt-7 field-panel p-5">
        <h2 className="font-display text-lg font-bold uppercase">
          Hinweis-Kosten
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mögliche Aufgaben für künftige Hinweise; aktuelle Spielhinweise sind
          in den Mockdaten festgelegt.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Standard-Aufgabe">
            <select className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm">
              {[
                "Keine Kosten",
                "Trinkaufgabe",
                "Videoaufgabe",
                "Minispiel",
                "Token verbrauchen",
                "Zeitstrafe",
                "Teamchallenge",
                "Eigene Aufgabe",
              ].map((cost) => (
                <option key={cost}>{cost}</option>
              ))}
            </select>
          </Field>

          <Field label="Video-Aufbewahrung">
            <select className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm">
              {[
                "Keine Speicherung (Vorschau)",
                "Nach Prüfung löschen",
                "Nur Spielleitung",
              ].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Keine dieser Einstellungen lädt Videos hoch oder ändert die Regeln
          des laufenden Spiels.
        </p>
      </div>

      <button
        onClick={() => setSaved(true)}
        className="mt-6 min-h-[44px] rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        Einstellungen als Entwurf übernehmen
      </button>

      {saved ? (
        <p role="status" className="mt-2 text-xs text-success">
          Entwurf in dieser Ansicht übernommen; noch nicht gespeichert.
        </p>
      ) : null}

      <section
        id="spielstand"
        className="mt-10 rounded-lg border border-destructive/40 bg-destructive/5 p-5"
      >
        <span className="label-mono text-destructive">Spielstand</span>
        <h2 className="mt-1 font-display text-xl font-bold uppercase">
          Expedition neu starten
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Setzt den Spielstand dieses Browsers vollständig auf den Zustand vor
          Beginn der Expedition zurück. Gelöste Rätsel, gefundene Gegenstände,
          Story-Fragmente, freigeschaltete Bereiche, besuchte Orte, Hinweise,
          Nachrichten und die Startzeit werden gelöscht.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <div className="rounded-md border border-border bg-background/50 p-3">
            <span className="label-mono">Status</span>
            <p className="mt-1 text-sm font-semibold">
              {started ? "Gestartet" : "Nicht gestartet"}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-3">
            <span className="label-mono">Etappen</span>
            <p className="mt-1 text-sm font-semibold">{completedStages}</p>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-3">
            <span className="label-mono">Rätsel</span>
            <p className="mt-1 text-sm font-semibold">{completedPuzzles}</p>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-3">
            <span className="label-mono">Inventar</span>
            <p className="mt-1 text-sm font-semibold">{inventoryCount}</p>
          </div>
        </div>

        {!confirmReset ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="destructive"
              onClick={() => {
                setResetDone(false);
                setConfirmReset(true);
              }}
            >
              Spiel von vorne starten
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate({ to: "/adventure" })}
            >
              Zur Spieleransicht
            </Button>
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-destructive/40 bg-background/70 p-4">
            <p className="font-display text-sm font-bold uppercase text-destructive">
              Wirklich alles zurücksetzen?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Dieser Schritt kann in diesem Browser nicht rückgängig gemacht
              werden.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="destructive" onClick={handleReset}>
                Ja, Spielstand löschen
              </Button>
              <Button variant="outline" onClick={() => setConfirmReset(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {resetDone ? (
          <div className="mt-4 rounded-md border border-success/30 bg-success/5 p-4">
            <p role="status" className="text-sm font-semibold text-success">
              Spielstand zurückgesetzt.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Beim nächsten Start beginnt die Expedition wieder bei Etappe 1.
            </p>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
