import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/admin/adventure/$id")({
  head: () => ({
    meta: [
      { title: "Abenteuer bearbeiten — Verwaltung" },
      { name: "description", content: "Abenteuer mit Titel, Thema, Regeln und Startanweisungen konfigurieren." },
      { property: "og:title", content: "Abenteuer bearbeiten — Verwaltung" },
      { property: "og:description", content: "Titel, Thema, Regeln und Startanweisungen." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdventureEditor,
});

function AdventureEditor() {
  return (
    <AdminShell
      title="Abenteuer bearbeiten"
      lead="Vorschau der Abenteuerfelder. Änderungen werden noch nicht gespeichert."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Name des Abenteuers">
          <TextInput defaultValue={adventure.title} />
        </Field>
        <Field label="Untertitel">
          <TextInput defaultValue={adventure.subtitle} />
        </Field>
        <Field label="Thema">
          <TextInput defaultValue="Expedition — dunkler Wald" />
        </Field>
        <Field label="Titelbild-URL">
          <TextInput placeholder="https://" />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Beschreibung">
            <textarea
              defaultValue={adventure.description}
              rows={3}
              className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Startanweisungen">
            <textarea
              defaultValue="Trefft euch an den Hafentreppen. Bringt einen Stift, ein Handy und bequeme Schuhe für sieben Kilometer mit."
              rows={3}
              className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Regeln</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Toggle label="Hinweise erlauben" defaultChecked />
        <Toggle label="Zeitmessung" defaultChecked />
        <Toggle label="Punkte zählen" />
        <Toggle label="Etappen nacheinander spielen" defaultChecked />
        <Toggle label="Etappen überspringen erlauben" />
      </div>
    </AdminShell>
  );
}
