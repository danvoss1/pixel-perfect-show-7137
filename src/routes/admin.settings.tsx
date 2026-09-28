import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Einstellungen — Verwaltung" },
      { name: "description", content: "Allgemeine Einstellungen für das Abenteuerspiel." },
      { property: "og:title", content: "Einstellungen — Verwaltung" },
      { property: "og:description", content: "Allgemeine Einstellungen für das Abenteuerspiel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungEinstellungen,
});

function VerwaltungEinstellungen() {
  return (
    <AdminShell title="Einstellungen" lead="Gilt für alle Abenteuer in diesem Bereich.">
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

      <button className="mt-6 min-h-[44px] rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Einstellungen speichern
      </button>
    </AdminShell>
  );
}
