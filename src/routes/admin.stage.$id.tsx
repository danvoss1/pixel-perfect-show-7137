import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { AdminShell, Field, TextInput } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { stageById } from "@/game/data";

const blockTypes = [
  "TEXT",
  "BILD",
  "VIDEO",
  "KARTE",
  "ORT",
  "CODE",
  "WORTRÄTSEL",
  "SCHIEBEPUZZLE",
  "FLUGSPIEL",
  "3D-RAUM",
  "GEGENSTAND",
  "QR-CODE",
  "HINWEIS",
  "EIGENES HTML",
];

export const Route = createFileRoute("/admin/stage/$id")({
  head: () => ({
    meta: [
      { title: "Etappe bearbeiten — Verwaltung" },
      { name: "description", content: "Geschichte, Ziel und Inhaltsblöcke einer Etappe bearbeiten." },
      { property: "og:title", content: "Etappe bearbeiten — Verwaltung" },
      { property: "og:description", content: "Geschichte, Ziel und Inhaltsblöcke." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StageEditor,
});

function StageEditor() {
  const { id } = Route.useParams();
  const stage = stageById(id);
  const [blocks, setBlocks] = useState<string[]>(["TEXT", "ORT", "CODE"]);
  const [menu, setMenu] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);
  const move = (from: number, to: number) => setBlocks((current) => {
    const copy = [...current];
    const [block] = copy.splice(from, 1);
    if (block) copy.splice(to, 0, block);
    return copy;
  });

  return (
    <AdminShell
      title={stage ? `Etappe ${String(stage.number).padStart(2, "0")} — ${stage.title}` : "Etappe bearbeiten"}
      lead="Die Inhaltsblöcke lassen sich hier für die Vorschau sortieren; Änderungen am Abenteuer werden noch nicht gespeichert."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Titel">
          <TextInput defaultValue={stage?.title ?? ""} />
        </Field>
        <Field label="Typ">
          <TextInput defaultValue={stage?.kind ?? ""} />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Einleitung">
            <textarea
              defaultValue={stage?.intro ?? ""}
              rows={3}
              className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Ziel">
            <TextInput defaultValue={stage?.objective ?? ""} />
          </Field>
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Inhaltsblöcke</h2>
      <ul className="mt-3 space-y-2">
        {blocks.map((b, i) => (
          <li
            key={`${b}-${i}`}
            draggable
            onDragStart={() => setDragged(i)}
            onDragEnd={() => setDragged(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (dragged !== null) move(dragged, i); setDragged(null); }}
            className="flex min-h-[48px] items-center gap-3 rounded-md border border-border bg-surface px-4"
          >
            <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="label-mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 truncate text-sm">{b}</span>
            <Button
              variant="ghost"
              aria-label="Block entfernen"
              onClick={() => setBlocks((arr) => arr.filter((_, idx) => idx !== i))}
              className="size-11 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="relative mt-3">
        <Button
          variant="outline"
          onClick={() => setMenu((m) => !m)}
          className="flex min-h-[44px] items-center gap-2 rounded-md border border-dashed border-border px-4 text-sm"
        >
          <Plus className="size-4" /> Inhalt hinzufügen
        </Button>
        {menu ? (
          <div className="mt-2 grid max-w-md grid-cols-2 gap-1.5 rounded-md border border-border bg-surface p-2 sm:grid-cols-3">
            {blockTypes.map((t) => (
              <Button
                variant="ghost"
                key={t}
                onClick={() => {
                  setBlocks((arr) => [...arr, t]);
                  setMenu(false);
                }}
                className="min-h-[44px] justify-start px-2 text-left text-xs"
              >
                {t}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
