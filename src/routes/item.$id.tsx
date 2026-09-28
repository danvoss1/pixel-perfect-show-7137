import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, LockedContent, Panel, Reveal } from "@/components/game/primitives";
import { itemById } from "@/game/data";
import photo from "@/assets/photo-bridge.jpg";

export const Route = createFileRoute("/item/$id")({
  head: ({ params }) => {
    const item = itemById(params.id);
    const title = item ? `${item.name} — Evidence` : "Item";
    const description = item?.description ?? "An item recovered during the expedition.";
    return {
      meta: [
        { title: `${title} — The Hidden Path` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const item = itemById(id);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hotspot, setHotspot] = useState(false);

  if (!item) {
    return (
      <GameShell>
        <LockedContent note="This item is not in your inventory." />
      </GameShell>
    );
  }

  return (
    <GameShell>
      <Reveal>
        <Label>Item #{String(item.number).padStart(2, "0")} · {item.kind}</Label>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase sm:text-5xl">{item.name}</h1>
      </Reveal>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
          <motion.img
            src={photo}
            alt={item.name}
            width={912}
            height={912}
            loading="lazy"
            animate={{ rotate: rotation, scale: zoom }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="aspect-square w-full cursor-grab object-cover"
            drag
            dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
          />
          <button
            onClick={() => setHotspot(true)}
            aria-label="Inspect detail"
            className="absolute left-[62%] top-[46%] size-11 rounded-full border border-gold/60"
          >
            <span className="absolute inset-0 rounded-full border border-gold/40 marker-pulse" />
          </button>
          <div className="absolute bottom-3 right-3 flex gap-2">
            {[
              [RotateCw, () => setRotation((r) => r + 90), "Rotate"],
              [ZoomIn, () => setZoom((z) => Math.min(2.5, z + 0.25)), "Zoom in"],
              [ZoomOut, () => setZoom((z) => Math.max(1, z - 0.25)), "Zoom out"],
            ].map(([Icon, fn, label], i) => {
              const I = Icon as typeof RotateCw;
              return (
                <button
                  key={i}
                  aria-label={label as string}
                  onClick={fn as () => void}
                  className="grid size-11 place-items-center rounded-md border border-border bg-background/70 backdrop-blur"
                >
                  <I className="size-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Panel>
            <Label>Description</Label>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </Panel>
          <Panel>
            <Label>Field notes</Label>
            <p className="mt-2 font-hand text-2xl leading-snug text-paper">{item.detail}</p>
          </Panel>
          {hotspot ? (
            <Panel glow>
              <Label>Hidden detail</Label>
              <p className="mt-2 text-sm">
                Scratched into the emulsion, barely visible: <span className="text-gold">47 — 29</span>
              </p>
            </Panel>
          ) : null}
          <Link to="/inventory" className="block text-center label-mono text-primary">
            Back to inventory
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
