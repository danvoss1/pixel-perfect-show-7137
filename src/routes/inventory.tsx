import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";
import { Label, Reveal, SectionTitle } from "@/components/game/primitives";
import { items } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — The Hidden Path" },
      {
        name: "description",
        content: "Everything collected on the expedition: documents, evidence, keys and code fragments.",
      },
      { property: "og:title", content: "Inventory — The Hidden Path" },
      { property: "og:description", content: "Documents, evidence, keys and code fragments collected so far." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const owned = usePlayer((s) => s.inventory);

  return (
    <GameShell>
      <Reveal>
        <SectionTitle
          eyebrow={`${owned.length} of ${items.length} recovered`}
          title="Inventory"
          lead="Items collected along the trail. Open one to inspect it closely."
        />
      </Reveal>

      {owned.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nothing collected yet. The first stage always leaves something behind.
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter((i) => owned.includes(i.id))
          .map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.04}>
              <Link
                to="/item/$id"
                params={{ id: item.id }}
                className="block h-full rounded-lg border border-border bg-surface/60 p-5 transition-colors hover:bg-accent/50"
              >
                <Label>Item #{String(item.number).padStart(2, "0")}</Label>
                <h2 className="mt-3 font-display text-lg font-bold uppercase">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-4 label-mono">Found · Stage {String(item.foundAtStage).padStart(2, "0")}</p>
              </Link>
            </Reveal>
          ))}
      </div>
    </GameShell>
  );
}
