import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/admin/stages")({
  head: () => ({
    meta: [
      { title: "Stages — Admin" },
      { name: "description", content: "Order and edit the stages of the adventure." },
      { property: "og:title", content: "Stages — Admin" },
      { property: "og:description", content: "Order and edit the stages of the adventure." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminStages,
});

function AdminStages() {
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
      title="Stages"
      lead="Drag to reorder. Each stage holds its own content blocks."
      action={
        <button className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Add stage
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
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
