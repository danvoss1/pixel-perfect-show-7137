import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VerwaltungShell, VerwaltungTable } from "@/components/admin/VerwaltungShell";

export const Route = createFileRoute("/admin/players")({
  head: () => ({
    meta: [
      { title: "Spielende — Verwaltung" },
      { name: "description", content: "Fortschritt, Spielzeit und Hinweisnutzung der Spielenden verfolgen." },
      { property: "og:title", content: "Spielende — Verwaltung" },
      { property: "og:description", content: "Fortschritt, Spielzeit und Hinweisnutzung pro Person." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungSpielende,
});

const players = [
  {
    name: "Daniel",
    stage: "5 / 8",
    started: "18:04",
    elapsed: "01:42",
    hints: 2,
    last: "vor 2 Min.",
    location: "Kontrollpunkt im Wald",
    puzzles: ["Worträtsel ✓", "Schiebepuzzle ✓", "Umschlag Nr. 03 ✓", "3D-Raum aktiv"],
  },
  {
    name: "Mira",
    stage: "3 / 8",
    started: "18:20",
    elapsed: "01:26",
    hints: 0,
    last: "gerade eben",
    location: "Alte Eisenbahnbrücke",
    puzzles: ["Versiegelte Anweisung ✓", "Umschlag Nr. 03 offen"],
  },
  {
    name: "Jonas",
    stage: "7 / 8",
    started: "17:41",
    elapsed: "02:05",
    hints: 4,
    last: "vor 8 Min.",
    location: "Tür ohne Nummer",
    puzzles: ["Worträtsel ✓", "Route ✓", "3D-Raum ✓"],
  },
];

function VerwaltungSpielende() {
  const [open, setOpen] = useState<string | null>(null);
  const selected = players.find((p) => p.name === open);

  return (
    <VerwaltungShell title="Spielende" lead="Wähle eine Person, um ihren Fortschritt anzusehen.">
      <VerwaltungTable
        head={["Spieler/in", "Aktuelle Etappe", "Beginn", "Spielzeit", "Hinweise", "Letzte Aktivität"]}
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
                Etappe {selected.stage} · {selected.location}
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
            {["Etappe freigeben", "Rätsel zurücksetzen", "Hinweis hinzufügen", "Spielstand zurücksetzen"].map((a) => (
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
    </VerwaltungShell>
  );
}
