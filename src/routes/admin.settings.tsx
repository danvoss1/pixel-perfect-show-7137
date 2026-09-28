import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Admin" },
      { name: "description", content: "Global settings for the adventure platform." },
      { property: "og:title", content: "Settings — Admin" },
      { property: "og:description", content: "Global settings for the adventure platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <AdminShell title="Settings" lead="Applies to every adventure in this workspace.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Organisation">
          <TextInput defaultValue="Hidden Path Expeditions" />
        </Field>
        <Field label="Support contact">
          <TextInput defaultValue="team@hiddenpath.example" />
        </Field>
        <Field label="Default city">
          <TextInput defaultValue="Cologne" />
        </Field>
        <Field label="Hint penalty (minutes)">
          <TextInput type="number" defaultValue={5} />
        </Field>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Toggle label="Sound effects available to players" defaultChecked />
        <Toggle label="Reduced motion by default" />
        <Toggle label="Live game master mode" defaultChecked />
        <Toggle label="Show leaderboard" />
      </div>

      <button className="mt-6 min-h-[44px] rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Save settings
      </button>
    </AdminShell>
  );
}
