import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/admin/stages")({
  head: () => ({
    meta: [
      { title: "Etappen — Verwaltung" },
      { name: "description", content: "Etappen des Abenteuers sortieren und bearbeiten." },
      { property: "og:title", content: "Etappen — Verwaltung" },
      { property: "og:description", content: "Etappen des Abenteuers sortieren und bearbeiten." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungEtappen,
});

function VerwaltungEtappen() {
  const [order, setOrder] = useState(adventure.stages.map((s) => s.id));
  const [dragging, setDragging] = useState<string | null>(null);

  const stages = order.map((id) => adventure.stages.find((s) => s.id === id)!);

  const drop = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const next = order.filter((id) => id !== dragging);
    next.splice(next.indexOf(targetId), 0, dragging);
    setOrder(next);
    setDragging(null);
  };

  return (
    <AdminShell
      title="Etappen"
      lead="Zum Sortieren ziehen. Jede Etappe enthält eigene Inhaltsblöcke."
      action={
        <button className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Etappe hinzufügen
        </button>
      }
    >
      <ul className="space-y-2">
        {stages.map((stage, i) => (
          <li
            key={stage.id}
            draggable
            onDragStart={() => setDragging(stage.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(stage.id)}
            className={`flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 ${
              dragging === stage.id ? "opacity-50" : ""
            }`}
          >
            <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
            <span className="font-display text-sm text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{stage.title}</span>
              <span className="block text-xs text-muted-foreground">{stage.kind}</span>
            </span>
            <Link
              to="/admin/stage/$id"
              params={{ id: stage.id }}
              className="shrink-0 text-sm text-primary hover:underline"
            >
              Bearbeiten
            </Link>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
