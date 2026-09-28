import { createFileRoute, Link } from "@tanstack/react-router";
import { VerwaltungShell, VerwaltungTable } from "@/components/admin/VerwaltungShell";
import { adventure } from "@/game/data";

export const Route = createFileRoute("/admin/adventures")({
  head: () => ({
    meta: [
      { title: "Abenteuer — Verwaltung" },
      { name: "description", content: "Alle angelegten Abenteuer und ihre Etappenanzahl." },
      { property: "og:title", content: "Abenteuer — Verwaltung" },
      { property: "og:description", content: "Alle angelegten Abenteuer und ihre Etappenanzahl." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungAbenteuer,
});

function VerwaltungAbenteuer() {
  return (
    <VerwaltungShell
      title="Abenteuer"
      lead="Alle Abenteuer für diese Stadt."
      action={
        <button className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Neues Abenteuer
        </button>
      }
    >
      <VerwaltungTable
        head={["Abenteuer", "Stadt", "Etappen", "Status", ""]}
        rows={[
          [
            adventure.title,
            adventure.city,
            String(adventure.stages.length),
            "Veröffentlicht",
            <Link
              key="e"
              to="/admin/adventure/$id"
              params={{ id: adventure.id }}
              className="text-primary hover:underline"
            >
              Edit
            </Link>,
          ],
          ["Nachtschicht", "Köln", "6", "Entwurf", <span key="d" className="text-muted-foreground">Bearbeiten</span>],
        ]}
      />
    </VerwaltungShell>
  );
}
