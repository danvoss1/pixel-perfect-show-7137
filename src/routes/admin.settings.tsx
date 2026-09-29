import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { useState } from "react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Einstellungen — Verwaltung" },
      { name: "description", content: "Allgemeine Einstellungen für das Abenteuerspiel." },
      { property: "og:title", content: "Einstellungen — Verwaltung" },
      { property: "og:description", content: "Allgemeine Einstellungen für das Abenteuerspiel." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungEinstellungen,
});

function VerwaltungEinstellungen() {
  const [saved, setSaved] = useState(false);
  return (
    <AdminShell title="Einstellungen" lead="Einstellungen als Vorschau. Es besteht noch keine Speicherung oder serverseitige Verwaltung.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Organisation">
          <TextInput defaultValue="Der verborgene Pfad Expeditionen" />
        </Field>
        <Field label="Kontakt für Fragen">
          <TextInput defaultValue="team@hiddenpath.example" />
        </Field>
        <Field label="Standardstadt">
          <TextInput defaultValue="Köln" />
        </Field>
        <Field label="Hinweisabzug (Minuten)">
          <TextInput type="number" defaultValue={5} />
        </Field>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Toggle label="Toneffekte für Spielende verfügbar" defaultChecked />
        <Toggle label="Reduzierte Bewegung als Standard" />
        <Toggle label="Live-Spielleitung" defaultChecked />
        <Toggle label="Bestenliste anzeigen" />
      </div>
      <div className="mt-7 field-panel p-5"><h2 className="font-display text-lg font-bold uppercase">Hinweis-Kosten</h2><p className="mt-2 text-sm text-muted-foreground">Mögliche Aufgaben für künftige Hinweise; aktuelle Spielhinweise sind in den Mockdaten festgelegt.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Standard-Aufgabe"><select className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm">{["Keine Kosten", "Trinkaufgabe", "Videoaufgabe", "Minispiel", "Token verbrauchen", "Zeitstrafe", "Teamchallenge", "Eigene Aufgabe"].map((cost) => <option key={cost}>{cost}</option>)}</select></Field><Field label="Video-Aufbewahrung"><select className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm">{["Keine Speicherung (Vorschau)", "Nach Prüfung löschen", "Nur Spielleitung"].map((option) => <option key={option}>{option}</option>)}</select></Field></div><p className="mt-3 text-xs text-muted-foreground">Keine dieser Einstellungen lädt Videos hoch oder ändert die Regeln des laufenden Spiels.</p></div>

      <button onClick={() => setSaved(true)} className="mt-6 min-h-[44px] rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Einstellungen als Entwurf übernehmen
      </button>
      {saved && <p role="status" className="mt-2 text-xs text-success">Entwurf in dieser Ansicht übernommen; noch nicht gespeichert.</p>}
    </AdminShell>
  );
}
