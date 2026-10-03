import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { adventure, locations, puzzles } from "@/game/data";
import { usePlayer } from "@/game/store";
import { Button } from "@/components/ui/button";
import { eventCategoryLabel, fieldEvents } from "@/game/events";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Spielleitung — Verwaltung" },
      { name: "description", content: "Spielleitung: Spielende, laufende Partien und Live-Steuerung." },
      { property: "og:title", content: "Spielleitung — Verwaltung" },
      { property: "og:description", content: "Spielende, laufende Partien und Live-Steuerung." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const [message, setMessage] = useState("");
  const progress = usePlayer((s) => s);
  const stage = adventure.stages.find((s) => s.id === progress.currentStageId);
  const nextPuzzle = puzzles.find((p) => p.stageId === stage?.id);
  const lastLocation = locations.find((loc) => loc.id === progress.visitedLocations.at(-1));
  const stats = [
    ["Lokaler Spielstand", progress.started ? "Aktiv" : "Nicht gestartet"],
    ["Gesammelte Gegenstände", String(progress.inventory.length)],
    ["Verwendete Hinweise", String(progress.unlockedHints.length)],
    ["Etappen", String(adventure.stages.length)],
    ["Rätsel", String(puzzles.length)],
  ];

  return (
    <AdminShell
      title="Spielleitung"
      lead="Live-Steuerung dieses Browser-Spielstands. Hinweis-Codes sind geräteunabhängig; Live-Nachrichten verwenden aktuell weiterhin den lokalen Spielstand."
      action={
        <Link
          to="/admin/puzzles"
          className="rounded-md border border-gold/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold"
        >
          Hinweiscodes
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-surface p-4">
            <span className="label-mono">{k}</span>
            <p className="mt-1 font-display text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-9 font-display text-lg font-bold">Aktueller Testspielstand</h2>
      <div className="mt-4">
        <AdminTable
          head={["Etappe", "Letzter Kontrollpunkt", "Rätselstatus", "Hinweise", "Gegenstände"]}
          rows={[[stage ? `${stage.number} / ${adventure.stages.length} · ${stage.title}` : "—", lastLocation?.name ?? "Noch keiner", nextPuzzle ? progress.completedPuzzles.includes(nextPuzzle.id) ? "Gelöst" : "Offen" : "Kein Rätsel", String(progress.unlockedHints.length), String(progress.inventory.length)]]}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Geheimnisvolle Nachricht verfassen" aria-label="Nachricht an den aktuellen Spielstand" className="min-h-[44px] w-full rounded-md border border-border bg-surface px-4 text-sm" /><Button disabled={!message.trim()} onClick={() => { progress.sendMessage(message.trim()); setMessage(""); }}>Nachricht senden</Button></div>
      <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" disabled={!nextPuzzle?.hints[0]} onClick={() => { if (nextPuzzle?.hints[0]) progress.unlockHint(`${nextPuzzle.id}:${nextPuzzle.hints[0].id}`); }}>Hinweis freigeben</Button><Button variant="outline" onClick={progress.advanceStage}>Etappe freigeben</Button><Button variant="outline" disabled={!nextPuzzle} onClick={() => { if (nextPuzzle) progress.resetPuzzle(nextPuzzle.id); }}>Rätsel zurücksetzen</Button><Button variant="outline" onClick={() => progress.sendMessage("Achtung: Neue Nachricht aus der Spielleitung.")}>Warnung anzeigen</Button></div>
      <div className="mt-8 field-panel p-5"><h2 className="font-display text-lg font-bold uppercase">Ereigniskarte auslösen</h2><p className="mt-1 text-sm text-muted-foreground">Die Karte erscheint beim nächsten Aufruf der Spieleransicht in diesem Browser.</p><div className="mt-4 flex flex-wrap gap-2">{fieldEvents.map((event) => <Button key={event.id} variant="outline" onClick={() => progress.startEvent(event.id)}>{eventCategoryLabel[event.category]} · {event.title}</Button>)}</div></div>
    </AdminShell>
  );
}
