import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AdminShell, Field, TextInput } from "@/components/admin/AdminShell";
import { stageById } from "@/game/data";

const blockTypes = [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "MAP",
  "LOCATION",
  "CODE",
  "WORDLE",
  "SLIDING PUZZLE",
  "FLAPPY GAME",
  "3D ROOM",
  "ITEM",
  "QR CODE",
  "HINT",
  "CUSTOM HTML",
];

export const Route = createFileRoute("/admin/stage/$id")({
  head: () => ({
    meta: [
      { title: "Stage editor — Admin" },
      { name: "description", content: "Edit a stage: story text, objective and content blocks." },
      { property: "og:title", content: "Stage editor — Admin" },
      { property: "og:description", content: "Story text, objective and content blocks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StageEditor,
});

function StageEditor() {
  const { id } = Route.useParams();
  const stage = stageById(id);
  const [blocks, setBlocks] = useState<string[]>(["TEXT", "LOCATION", "CODE"]);
  const [menu, setMenu] = useState(false);

  return (
    <AdminShell
      title={stage ? `Stage ${String(stage.number).padStart(2, "0")} — ${stage.title}` : "Stage editor"}
      lead="Blocks render top to bottom on the player's stage screen."
      action={
        <button className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Save
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Title">
          <TextInput defaultValue={stage?.title ?? ""} />
        </Field>
        <Field label="Type">
          <TextInput defaultValue={stage?.kind ?? ""} />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Intro text">
            <textarea
              defaultValue={stage?.intro ?? ""}
              rows={3}
              className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Objective">
            <TextInput defaultValue={stage?.objective ?? ""} />
          </Field>
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Content blocks</h2>
      <ul className="mt-3 space-y-2">
        {blocks.map((b, i) => (
          <li
            key={`${b}-${i}`}
            className="flex min-h-[48px] items-center gap-3 rounded-md border border-border bg-surface px-4"
          >
            <span className="label-mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 truncate text-sm">{b}</span>
            <button
              aria-label="Remove block"
              onClick={() => setBlocks((arr) => arr.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative mt-3">
        <button
          onClick={() => setMenu((m) => !m)}
          className="flex min-h-[44px] items-center gap-2 rounded-md border border-dashed border-border px-4 text-sm"
        >
          <Plus className="size-4" /> Add content
        </button>
        {menu ? (
          <div className="mt-2 grid max-w-md grid-cols-2 gap-1.5 rounded-md border border-border bg-surface p-2 sm:grid-cols-3">
            {blockTypes.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setBlocks((arr) => [...arr, t]);
                  setMenu(false);
                }}
                className="rounded px-2 py-2 text-left text-xs hover:bg-accent"
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
