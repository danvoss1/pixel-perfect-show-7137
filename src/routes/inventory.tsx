import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/game/GameShell";
import { Label, Reveal, SectionTitle } from "@/components/game/primitives";
import { items } from "@/game/data";
import { usePlayer } from "@/game/store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventar — Der verborgene Pfad" },
      {
        name: "description",
        content: "Alle auf der Expedition gesammelten Dokumente, Beweisstücke, Schlüssel und Codefragmente.",
      },
      { property: "og:title", content: "Inventar — Der verborgene Pfad" },
      { property: "og:description", content: "Bisher gesammelte Dokumente, Beweisstücke, Schlüssel und Codefragmente." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const owned = usePlayer((s) => s.inventory);
  const itemStates = usePlayer((s) => s.itemStates);

  return (
    <GameShell>
      <Reveal>
        <SectionTitle
          eyebrow={`${owned.length} von ${items.length} gefunden`}
          title="Inventar"
          lead="Alles, was ihr findet, bleibt Teil der Expedition. Bewahrt die echten Gegenstände auf – ein Fundstück kann deutlich später erneut wichtig werden."
        />
      </Reveal>

      {owned.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Noch nichts gesammelt. Die erste Etappe hinterlässt bestimmt eine Spur.
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
                 <Label>{item.category ?? item.kind} · Nr. {String(item.number).padStart(2, "0")}</Label>
                <h2 className="mt-3 font-display text-lg font-bold uppercase">{item.name}</h2>
                 <p className="mt-1 text-sm text-muted-foreground">{item.mystery ? "Verwendung unbekannt — weitere Hinweise folgen." : item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="label-mono">Gefunden · Etappe {String(item.foundAtStage).padStart(2, "0")}</span>
                  {itemStates[item.id]?.used ? <span className="label-mono text-success">Benutzt · weiterhin aufbewahren</span> : null}
                  {itemStates[item.id]?.damaged ? <span className="label-mono text-gold">Beschädigt</span> : null}
                  {itemStates[item.id]?.destroyed ? <span className="label-mono text-destructive">Geöffnet / zerstört</span> : null}
                </div>
              </Link>
            </Reveal>
          ))}
      </div>
    </GameShell>
  );
}
