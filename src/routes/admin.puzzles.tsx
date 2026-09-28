import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { puzzles } from "@/game/data";
import type { CodeConfig, FlappyConfig, SlidingConfig, WordleConfig } from "@/game/types";

export const Route = createFileRoute("/admin/puzzles")({
  head: () => ({
    meta: [
      { title: "Rätsel — Verwaltung" },
      { name: "description", content: "Worträtsel, Schiebepuzzles, Flugspiele und Codeschlösser konfigurieren." },
      { property: "og:title", content: "Rätsel — Verwaltung" },
      { property: "og:description", content: "Chiffren, Schiebepuzzles, Flugspiele und Codeschlösser konfigurieren." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungRätsel,
});

const tabs = ["Worträtsel", "Schiebepuzzle", "Flugspiel", "Code"] as const;

function VerwaltungRätsel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Worträtsel");
  const wordle = puzzles.find((p) => p.type === "wordle")!.config as WordleConfig;
  const sliding = puzzles.find((p) => p.type === "sliding")!.config as SlidingConfig;
  const flappy = puzzles.find((p) => p.type === "flappy")!.config as FlappyConfig;
  const code = puzzles.find((p) => p.type === "code")!.config as CodeConfig;

  return (
    <AdminShell title="Rätsel" lead="Jeder Rätseltyp lässt sich je Etappe konfigurieren.">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-md border px-4 py-2 text-sm ${
              tab === t ? "border-primary bg-accent" : "border-border text-muted-foreground"
            }`}
          >
            {t}
          </button>
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

      <button className="mt-6 min-h-[44px] rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Konfiguration speichern
      </button>
    </AdminShell>
  );
}
