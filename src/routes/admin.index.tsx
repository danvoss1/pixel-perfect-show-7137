import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { adventure, puzzles } from "@/game/data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Adventure Control — Admin" },
      { name: "description", content: "Game master dashboard: players, active games and live event control." },
      { property: "og:title", content: "Adventure Control — Admin" },
      { property: "og:description", content: "Players, active games and live event control." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

const livePlayers = [
  { name: "Daniel", stage: "5 / 8", location: "Forest checkpoint", puzzle: "3D Room active" },
  { name: "Mira", stage: "3 / 8", location: "Old Railway Bridge", puzzle: "Envelope #03 pending" },
  { name: "Jonas", stage: "7 / 8", location: "Unmarked door", puzzle: "Word cipher solved" },
];

function AdminOverview() {
  const stats = [
    ["Players", "18"],
    ["Active games", "3"],
    ["Avg. completion", "03:12:40"],
    ["Stages", String(adventure.stages.length)],
    ["Puzzles", String(puzzles.length)],
  ];

  return (
    <AdminShell title="Adventure control" lead="Live overview of running expeditions.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-surface p-4">
            <span className="label-mono">{k}</span>
            <p className="mt-1 font-display text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-9 font-display text-lg font-bold">Game master — live</h2>
      <p className="text-sm text-muted-foreground">
        Trigger events for players currently on the trail.
      </p>
      <div className="mt-4">
        <AdminTable
          head={["Player", "Stage", "Location", "Puzzle status", "Actions"]}
          rows={livePlayers.map((p) => [
            <Link key="n" to="/admin/players" className="font-medium hover:text-primary">
              {p.name}
            </Link>,
            p.stage,
            p.location,
            p.puzzle,
            <div key="a" className="flex flex-wrap gap-1.5">
              {["Send message", "Unlock hint", "Unlock stage", "Display alert"].map((a) => (
                <button
                  key={a}
                  className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent"
                >
                  {a}
                </button>
              ))}
            </div>,
          ])}
        />
      </div>
    </AdminShell>
  );
}
