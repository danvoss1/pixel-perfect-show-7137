import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/admin/adventure/$id")({
  head: () => ({
    meta: [
      { title: "Adventure editor — Admin" },
      { name: "description", content: "Configure an adventure: title, theme, rules and starting instructions." },
      { property: "og:title", content: "Adventure editor — Admin" },
      { property: "og:description", content: "Title, theme, rules and starting instructions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdventureEditor,
});

function AdventureEditor() {
  return (
    <AdminShell
      title="Adventure editor"
      lead="Changes are stored locally in this prototype."
      action={
        <button className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Save
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Adventure name">
          <TextInput defaultValue={adventure.title} />
        </Field>
        <Field label="Subtitle">
          <TextInput defaultValue={adventure.subtitle} />
        </Field>
        <Field label="Theme">
          <TextInput defaultValue="Expedition — dark forest" />
        </Field>
        <Field label="Cover image URL">
          <TextInput placeholder="https://" />
        </Field>
        <div className="lg:col-span-2">
          <Field label="Description">
            <textarea
              defaultValue={adventure.description}
              rows={3}
              className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Starting instructions">
            <textarea
              defaultValue="Meet at the harbour steps. Bring a pen, a phone, and shoes you can walk 7 km in."
              rows={3}
              className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Rules</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Toggle label="Allow hints" defaultChecked />
        <Toggle label="Timer" defaultChecked />
        <Toggle label="Track score" />
        <Toggle label="Require sequential stages" defaultChecked />
        <Toggle label="Allow stage skipping" />
      </div>
    </AdminShell>
  );
}
