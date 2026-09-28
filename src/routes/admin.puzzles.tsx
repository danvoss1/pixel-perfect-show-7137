import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { puzzles } from "@/game/data";
import type { CodeConfig, FlappyConfig, SlidingConfig, WordleConfig } from "@/game/types";

export const Route = createFileRoute("/admin/puzzles")({
  head: () => ({
    meta: [
      { title: "Puzzles — Admin" },
      { name: "description", content: "Configure word ciphers, sliding puzzles, arcade runs and code locks." },
      { property: "og:title", content: "Puzzles — Admin" },
      { property: "og:description", content: "Configure ciphers, sliding puzzles, arcade runs and code locks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPuzzles,
});

const tabs = ["Wordle", "Sliding", "Flappy", "Code"] as const;

function AdminPuzzles() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Wordle");
  const wordle = puzzles.find((p) => p.type === "wordle")!.config as WordleConfig;
  const sliding = puzzles.find((p) => p.type === "sliding")!.config as SlidingConfig;
  const flappy = puzzles.find((p) => p.type === "flappy")!.config as FlappyConfig;
  const code = puzzles.find((p) => p.type === "code")!.config as CodeConfig;

  return (
    <AdminShell title="Puzzles" lead="Every puzzle type is configurable per stage.">
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
        {tab === "Wordle" ? (
          <>
            <Field label="Target word">
              <TextInput defaultValue={wordle.word} />
            </Field>
            <Field label="Word length">
              <TextInput type="number" defaultValue={wordle.word.length} />
            </Field>
            <Field label="Maximum attempts">
              <TextInput type="number" defaultValue={wordle.maxAttempts} />
            </Field>
            <Field label="Hint">
              <TextInput defaultValue={wordle.clue} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Success message">
                <TextInput defaultValue="CODE DECRYPTED" />
              </Field>
            </div>
          </>
        ) : null}

        {tab === "Sliding" ? (
          <>
            <Field label="Image URL">
              <TextInput placeholder="https://" />
            </Field>
            <Field label="Grid size">
              <TextInput type="number" defaultValue={sliding.grid} />
            </Field>
            <Field label="Maximum moves (0 = unlimited)">
              <TextInput type="number" defaultValue={0} />
            </Field>
            <Toggle label="Timer enabled" defaultChecked />
          </>
        ) : null}

        {tab === "Flappy" ? (
          <>
            <Field label="Icon (PNG / SVG / WEBP)">
              <TextInput placeholder="Upload or paste URL" />
            </Field>
            <Field label="Background theme">
              <TextInput defaultValue="City skyline at night" />
            </Field>
            <Field label="Speed">
              <TextInput type="number" step="0.1" defaultValue={flappy.speed} />
            </Field>
            <Field label="Gravity">
              <TextInput type="number" step="0.05" defaultValue={flappy.gravity} />
            </Field>
            <Field label="Obstacle gap">
              <TextInput type="number" defaultValue={flappy.gap} />
            </Field>
            <Field label="Required score">
              <TextInput type="number" defaultValue={flappy.targetScore} />
            </Field>
          </>
        ) : null}

        {tab === "Code" ? (
          <>
            <Field label="Correct code">
              <TextInput defaultValue={code.code} />
            </Field>
            <Field label="Number of characters">
              <TextInput type="number" defaultValue={code.length} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Hint">
                <TextInput defaultValue="The digits are in the opening letter, bottom right." />
              </Field>
            </div>
          </>
        ) : null}
      </div>

      <button className="mt-6 min-h-[44px] rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Save configuration
      </button>
    </AdminShell>
  );
}
