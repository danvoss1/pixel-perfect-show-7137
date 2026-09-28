import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/admin/adventures")({
  head: () => ({
    meta: [
      { title: "Adventures — Admin" },
      { name: "description", content: "All configured adventures and their stage counts." },
      { property: "og:title", content: "Adventures — Admin" },
      { property: "og:description", content: "All configured adventures and their stage counts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAdventures,
});

function AdminAdventures() {
  return (
    <AdminShell
      title="Adventures"
      lead="Every experience configured for this city."
      action={
        <button className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          New adventure
        </button>
      }
    >
      <AdminTable
        head={["Adventure", "City", "Stages", "Status", ""]}
        rows={[
          [
            adventure.title,
            adventure.city,
            String(adventure.stages.length),
            "Published",
            <Link
              key="e"
              to="/admin/adventure/$id"
              params={{ id: adventure.id }}
              className="text-primary hover:underline"
            >
              Edit
            </Link>,
          ],
          ["Nachtschicht", "Cologne", "6", "Draft", <span key="d" className="text-muted-foreground">Edit</span>],
        ]}
      />
    </AdminShell>
  );
}
