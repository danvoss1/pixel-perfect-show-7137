import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Search, Navigation, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import { worldPoints, kindLabel, type WorldPoint } from "@/game/worldmap";
import mapArtwork from "@/assets/koeln-spielkarte.png.asset.json";

const MAP_WIDTH = 1024;
const MAP_HEIGHT = 768;

export function GameWorldMap({ isLocked, selectedId, onSelect, onNavigate }: {
  isLocked: (p: WorldPoint) => boolean;
  selectedId?: string | undefined;
  onSelect: (p: WorldPoint) => void;
  onNavigate: (p: WorldPoint) => void;
}) {
  const reduce = useReducedMotion();
  const [card, setCard] = useState<WorldPoint | null>(null);
  const [diving, setDiving] = useState<WorldPoint | null>(null);
  const [scene, setScene] = useState<WorldPoint | null>(null);
  const [spot, setSpot] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const viewport = useRef<HTMLDivElement>(null);
  const origin = diving ? { x: diving.x, y: diving.y } : null;

  useEffect(() => {
    const element = viewport.current;
    if (element) element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
  }, []);

  const enter = (p: WorldPoint) => { setCard(null); setDiving(p); window.setTimeout(() => { setScene(p); setDiving(null); }, reduce ? 0 : 1100); };

  return <div className="absolute inset-0 overflow-hidden bg-background" role="region" aria-label="Spielkarte von Köln">
    <div ref={viewport} className="absolute inset-0 overflow-auto overscroll-contain">
      <motion.div className="relative mx-auto aspect-[4/3] w-full min-w-[960px] max-w-[calc(100dvh*1.3333)]"
        animate={diving && origin ? { scale: 5, opacity: 0.2 } : { scale: 1, opacity: 1 }}
        style={{ transformOrigin: origin ? `${origin.x / MAP_WIDTH * 100}% ${origin.y / MAP_HEIGHT * 100}%` : "50% 50%" }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.3, 1] }}>
        <img src={mapArtwork.url} alt="Illustrierte Karte von Köln mit Rhein, Straßen, Parks und neun markierten Orten" className="block h-full w-full select-none" draggable={false} />
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full overflow-visible" aria-label="Orte auf der Spielkarte">
          {worldPoints.map((p) => <g key={p.id} transform={`translate(${p.x},${p.y})`}>
            {p.id === selectedId && <circle r="23" fill="none" stroke="var(--color-primary)" strokeWidth="2" className="marker-pulse" pointerEvents="none" />}
            <circle role="button" tabIndex={0} aria-label={isLocked(p) ? "Gesperrter Ort" : p.name} aria-disabled={isLocked(p)}
              cx="0" cy="0" r="34" fill="transparent" stroke="transparent" className="cursor-pointer focus:outline-none focus-visible:stroke-primary"
              onClick={() => { onSelect(p); setCard(p); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(p); setCard(p); } }} />
          </g>)}
        </svg>
      </motion.div>
    </div>

    <AnimatePresence>{card && <motion.div key={card.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="absolute inset-x-3 bottom-20 z-20 field-panel p-5 shadow-lg sm:inset-x-auto sm:left-4 sm:w-96 lg:bottom-4">
      <Button variant="ghost" size="icon" onClick={() => setCard(null)} aria-label="Schließen" className="absolute right-2 top-2 size-11 text-muted-foreground"><X className="size-4" /></Button>
      {isLocked(card) ? <><Label>Unbekannter Ort</Label><p className="mt-1 flex items-center gap-2 font-display text-base font-semibold uppercase"><Lock className="size-4" /> Noch nicht entdeckt</p><p className="mt-2 text-sm text-muted-foreground">Dieser Bereich liegt noch im Nebel.</p></> : <>
        <Label>{kindLabel[card.kind]}</Label>
        <p className="mt-1 font-display text-base font-semibold uppercase">{card.name}</p>
        <p className="mt-2 font-hand text-xl leading-tight text-paper">„{card.teaser}“</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => enter(card)} className="min-h-[48px] gap-2"><Search className="size-4" /> Untersuchen</Button>
          <Button variant="outline" onClick={() => onNavigate(card)} className="min-h-[48px] gap-2"><Navigation className="size-4" /> Real navigieren</Button>
        </div></>}
    </motion.div>}</AnimatePresence>

    <AnimatePresence>{scene && <motion.div key={scene.id} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: reduce ? 0 : 0.5 }} className="absolute inset-0 z-30 bg-background">
      <img src={scene.image} alt={scene.name} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/60" />
      <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
        <Button variant="outline" onClick={() => { setScene(null); setSpot(null); }} className="min-h-[44px] gap-2 bg-background/80"><ArrowLeft className="size-4" /> Zur Karte</Button>
        <div className="rounded-md bg-background/80 px-3 py-2 text-right"><Label>{kindLabel[scene.kind]}</Label><p className="font-display text-sm font-semibold uppercase">{scene.name}</p><p className="text-xs text-muted-foreground">{scene.hotspots.filter((h) => found.includes(`${scene.id}:${h.id}`)).length} / {scene.hotspots.length} Spuren</p></div>
      </div>
      {scene.hotspots.map((h) => { const k = `${scene.id}:${h.id}`; return <Button key={h.id} variant="outline" size="icon" aria-label={h.label} onClick={() => { setSpot(k); setFound((f) => f.includes(k) ? f : [...f, k]); }}
        className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-background/40" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
        <span className={`size-3 rounded-full ${found.includes(k) ? "bg-success" : "bg-gold marker-pulse"}`} /></Button>; })}
      <AnimatePresence>{spot && (() => { const h = scene.hotspots.find((x) => `${scene.id}:${x.id}` === spot); return h && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-3 bottom-20 field-panel p-5 sm:left-4 sm:w-96 lg:bottom-4">
        <Label>Spur entdeckt</Label><p className="mt-1 font-display text-base font-semibold uppercase">{h.label}</p><p className="mt-2 font-hand text-xl text-paper">„{h.text}“</p>
        <Button variant="ghost" onClick={() => setSpot(null)} className="mt-2 min-h-[44px] w-full">Weiter suchen</Button></motion.div>; })()}</AnimatePresence>
    </motion.div>}</AnimatePresence>
  </div>;
}
