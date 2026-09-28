import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { adventure, puzzles } from "@/game/data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Spielleitung — Admin" },
      { name: "description", content: "Spielleitung: Spielende, laufende Partien und Live-Steuerung." },
      { property: "og:title", content: "Spielleitung — Admin" },
      { property: "og:description", content: "Spielende, laufende Partien und Live-Steuerung." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

const livePlayers = [
  { name: "Daniel", stage: "5 / 8", location: "Kontrollpunkt im Wald", puzzle: "3D-Raum aktiv" },
  { name: "Mira", stage: "3 / 8", location: "Alte Eisenbahnbrücke", puzzle: "Umschlag Nr. 03 offen" },
  { name: "Jonas", stage: "7 / 8", location: "Tür ohne Nummer", puzzle: "Worträtsel gelöst" },
];

function AdminOverview() {
  const stats = [
    ["Spielende", "18"],
    ["Laufende Spiele", "3"],
    ["Ø Spielzeit", "03:12:40"],
    ["Etappen", String(adventure.stages.length)],
    ["Rätsel", String(puzzles.length)],
  ];

  return (
    <AdminShell title="Spielleitung" lead="Live-Übersicht laufender Expeditionen.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-surface p-4">
            <span className="label-mono">{k}</span>
            <p className="mt-1 font-display text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-9 font-display text-lg font-bold">Spielleitung — live</h2>
      <p className="text-sm text-muted-foreground">
        Ereignisse für Spielende auslösen, die gerade unterwegs sind.
      </p>
      <div className="mt-4">
        <AdminTable
          head={["Spieler/in", "Etappe", "Ort", "Rätselstatus", "Aktionen"]}
          rows={livePlayers.map((p) => [
            <Link key="n" to="/admin/players" className="font-medium hover:text-primary">
              {p.name}
            </Link>,
            p.stage,
            p.location,
            p.puzzle,
            <div key="a" className="flex flex-wrap gap-1.5">
              {["Nachricht senden", "Hinweis freigeben", "Etappe freigeben", "Meldung anzeigen"].map((a) => (
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
