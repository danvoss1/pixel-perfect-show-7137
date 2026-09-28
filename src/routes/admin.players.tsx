import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/players")({
  head: () => ({
    meta: [
      { title: "Players — Admin" },
      { name: "description", content: "Monitor player progress, elapsed time and hint usage." },
      { property: "og:title", content: "Players — Admin" },
      { property: "og:description", content: "Progress, elapsed time and hint usage per player." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPlayers,
});

const players = [
  {
    name: "Daniel",
    stage: "5 / 8",
    started: "18:04",
    elapsed: "01:42",
    hints: 2,
    last: "2 min ago",
    location: "Forest checkpoint",
    puzzles: ["Word Cipher ✓", "Sliding Puzzle ✓", "Envelope #03 ✓", "3D Room active"],
  },
  {
    name: "Mira",
    stage: "3 / 8",
    started: "18:20",
    elapsed: "01:26",
    hints: 0,
    last: "just now",
    location: "Old Railway Bridge",
    puzzles: ["Sealed Instruction ✓", "Envelope #03 pending"],
  },
  {
    name: "Jonas",
    stage: "7 / 8",
    started: "17:41",
    elapsed: "02:05",
    hints: 4,
    last: "8 min ago",
    location: "Unmarked door",
    puzzles: ["Word Cipher ✓", "Route ✓", "3D Room ✓"],
  },
];

function AdminPlayers() {
  const [open, setOpen] = useState<string | null>(null);
  const selected = players.find((p) => p.name === open);

  return (
    <AdminShell title="Players" lead="Click a player to open their progress overview.">
      <AdminTable
        head={["Player", "Current stage", "Started", "Elapsed", "Hints", "Last activity"]}
        rows={players.map((p) => [
          <button key="n" onClick={() => setOpen(p.name)} className="font-medium hover:text-primary">
            {p.name}
          </button>,
          p.stage,
          p.started,
          p.elapsed,
          String(p.hints),
          p.last,
        ])}
      />

      {selected ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-bold uppercase">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">
                Stage {selected.stage} · {selected.location}
              </p>
            </div>
            <button onClick={() => setOpen(null)} className="text-sm text-muted-foreground">
              Close
            </button>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm">
            {selected.puzzles.map((p) => (
              <li key={p} className="rounded-md border border-border bg-background/40 px-3 py-2">
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Unlock stage", "Reset puzzle", "Add hint", "Reset player"].map((a) => (
              <button
                key={a}
                className="min-h-[44px] rounded-md border border-border px-4 text-sm hover:bg-accent"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
