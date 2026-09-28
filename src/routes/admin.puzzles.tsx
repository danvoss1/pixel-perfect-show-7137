import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { puzzles } from "@/game/data";
import { puzzleTypeLabel } from "@/game/labels";
import { Button } from "@/components/ui/button";
import type { CodeConfig, FlappyConfig, SlidingConfig, WordleConfig } from "@/game/types";

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

const tabs = ["Worträtsel", "Schiebepuzzle", "Flugspiel", "Code"] as const;

function VerwaltungRätsel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Worträtsel");
  const [type, setType] = useState("");
  const [saved, setSaved] = useState(false);
  const wordle = puzzles.find((p) => p.type === "wordle")!.config as WordleConfig;
  const sliding = puzzles.find((p) => p.type === "sliding")!.config as SlidingConfig;
  const flappy = puzzles.find((p) => p.type === "flappy")!.config as FlappyConfig;
  const code = puzzles.find((p) => p.type === "code")!.config as CodeConfig;

  return (
    <AdminShell title="Rätsel" lead="Jeder Rätseltyp lässt sich je Etappe konfigurieren.">
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><Field label="Rätseltyp hinzufügen"><select className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}><option value="">Typ auswählen</option>{Object.entries(puzzleTypeLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field><Button disabled={!type} onClick={() => setSaved(true)}>Rätsel hinzufügen</Button></div>
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
      </div>

      <Button onClick={() => setSaved(true)} className="mt-6 min-h-[44px]">
        Konfiguration speichern
      </Button>
    </AdminShell>
  );
}
