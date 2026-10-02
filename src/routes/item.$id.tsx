import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { QrCode, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { Label, LockedContent, Panel, Reveal } from "@/components/game/primitives";
import { itemById } from "@/game/data";
import { usePlayer } from "@/game/store";
import { Button } from "@/components/ui/button";
import photo from "@/assets/photo-bridge.jpg";

export const Route = createFileRoute("/item/$id")({
  head: ({ params }) => {
    const item = itemById(params.id);
    const title = item ? `${item.name} — Beweisstück` : "Gegenstand";
    const description =
      item?.description ?? "Ein während der Expedition gefundener Gegenstand.";
    return {
      meta: [
        { title: `${title} — Der verborgene Pfad` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const item = itemById(id);
  const owned = usePlayer((s) => s.inventory.includes(id));
  const itemState = usePlayer((s) => s.itemStates[id]);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hotspot, setHotspot] = useState(false);

  if (!item || !owned) {
    return (
      <GameShell>
        <LockedContent note="Dieser Gegenstand ist nicht in deinem Inventar." />
      </GameShell>
    );
  }

  const isNumberObject = item.kind === "Zahlenobjekt";
  const numberValue = item.name.replace("Zahl ", "");

  return (
    <GameShell>
      <Reveal>
        <Label>
          Gegenstand Nr. {String(item.number).padStart(2, "0")} · {item.kind}
        </Label>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase sm:text-5xl">
          {item.name}
        </h1>
      </Reveal>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
          {isNumberObject ? (
            <div className="grid aspect-square w-full place-items-center bg-[radial-gradient(circle_at_center,hsl(var(--accent))_0%,hsl(var(--surface))_58%,hsl(var(--background))_100%)]">
              <motion.div
                animate={{ rotate: rotation, scale: zoom }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="grid size-[58%] place-items-center rounded-[2rem] border border-gold/40 bg-background/55 shadow-2xl backdrop-blur-sm"
              >
                <span className="font-display text-[7rem] font-black leading-none text-gold sm:text-[10rem]">
                  {numberValue}
                </span>
              </motion.div>
              <div className="absolute bottom-5 left-5 rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur">
                <Label>Physisches Fundstück · Aufbewahren</Label>
              </div>
            </div>
          ) : (
            <>
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
              <Button
                variant="ghost"
                onClick={() => setHotspot(true)}
                aria-label="Detail untersuchen"
                className="absolute left-[62%] top-[46%] size-11 rounded-full border border-gold/60"
              >
                <span className="absolute inset-0 rounded-full border border-gold/40 marker-pulse" />
              </Button>
            </>
          )}

          <div className="absolute bottom-3 right-3 flex gap-2">
            {[
              [RotateCw, () => setRotation((r) => r + 90), "Drehen"],
              [ZoomIn, () => setZoom((z) => Math.min(2.5, z + 0.25)), "Vergrößern"],
              [ZoomOut, () => setZoom((z) => Math.max(1, z - 0.25)), "Verkleinern"],
            ].map(([Icon, fn, label], i) => {
              const I = Icon as typeof RotateCw;
              return (
                <Button
                  variant="ghost"
                  key={i}
                  aria-label={label as string}
                  onClick={fn as () => void}
                  className="grid size-11 place-items-center rounded-md border border-border bg-background/70 backdrop-blur"
                >
                  <I className="size-4" />
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Panel>
            <Label>Beschreibung</Label>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </Panel>

          <Panel>
            <Label>Feldnotizen</Label>
            <p className="mt-2 font-hand text-2xl leading-snug text-paper">
              {item.detail}
            </p>
          </Panel>

          {item.id === "totino-pizza" ? (
            <Panel glow>
              <div className="flex items-start gap-3">
                <QrCode className="mt-0.5 size-5 shrink-0 text-gold" />
                <div>
                  <Label>Unterseite prüfen</Label>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Holt zuerst die echte Pizza bei Totino. Unter dem Pizzakarton befindet sich die Hidden-Path-Markierung für den nächsten Übergang.
                  </p>
                </div>
              </div>
              <Link
                to="/scan"
                className="mt-4 flex min-h-[48px] items-center justify-center rounded-md bg-primary px-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground"
              >
                QR-Code der Pizza scannen
              </Link>
            </Panel>
          ) : null}

          {item.physical ? (
            <Panel glow>
              <Label>Expeditionsregel</Label>
              <p className="mt-2 text-sm">
                Diesen Gegenstand in der echten Welt aufbewahren und mitnehmen.
                Gefundene Objekte können in späteren Etappen erneut benötigt werden.
              </p>
            </Panel>
          ) : null}

          {itemState?.used || itemState?.damaged || itemState?.destroyed ? (
            <Panel>
              <Label>Objektstatus</Label>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {itemState.used ? <span className="rounded border border-success/40 px-2 py-1 text-success">Benutzt</span> : null}
                {itemState.damaged ? <span className="rounded border border-gold/40 px-2 py-1 text-gold">Beschädigt</span> : null}
                {itemState.destroyed ? <span className="rounded border border-destructive/40 px-2 py-1 text-destructive">Geöffnet / zerstört</span> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Auch benutzte Gegenstände bleiben im Inventar, solange die Expedition sie noch benötigt.</p>
            </Panel>
          ) : null}

          {!isNumberObject && hotspot ? (
            <Panel glow>
              <Label>Verborgenes Detail</Label>
              <p className="mt-2 text-sm">
                In die Emulsion geritzt, kaum zu erkennen:{" "}
                <span className="text-gold">47 — 29</span>
              </p>
            </Panel>
          ) : null}

          <Link
            to="/inventory"
            className="block text-center label-mono text-primary"
          >
            Zurück zum Inventar
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
