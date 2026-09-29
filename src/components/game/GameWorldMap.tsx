import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Search, Navigation, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import { worldPoints, kindLabel, project, type WorldPoint } from "@/game/worldmap";

const tone: Record<string, string> = { story: "var(--color-gold)", envelope: "var(--color-primary)", puzzle: "var(--color-gold)", mystery: "var(--color-muted-foreground)", supply: "var(--color-sage)", checkpoint: "var(--color-primary)" };
const RHINE = "M722,1000 C690,850 640,760 630,700 S595,560 600,500 S640,380 645,300 S700,120 730,0";

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
  const revealed = worldPoints.filter((p) => !isLocked(p));
  const origin = diving ? project(diving.lat, diving.lng) : null;

  const enter = (p: WorldPoint) => { setCard(null); setDiving(p); window.setTimeout(() => { setScene(p); setDiving(null); }, reduce ? 0 : 1100); };

  return <div className="absolute inset-0 overflow-hidden bg-background" role="region" aria-label="Stilisierte Spielkarte von Köln">
    <motion.div className="absolute inset-0 flex items-center justify-center"
      animate={diving && origin ? { scale: 5, opacity: 0.2 } : { scale: 1, opacity: 1 }}
      style={{ transformOrigin: origin ? `${origin.x / 10}% ${origin.y / 10}%` : "50% 50%" }}
      transition={{ duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.3, 1] }}>
      <svg viewBox="0 0 1000 1000" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="gw-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.5" /></pattern>
          <mask id="gw-fog"><rect width="1000" height="1000" fill="white" />{revealed.map((p) => { const c = project(p.lat, p.lng); return <circle key={p.id} cx={c.x} cy={c.y} r="120" fill="black" filter="url(#gw-blur)" />; })}</mask>
          <filter id="gw-blur"><feGaussianBlur stdDeviation="30" /></filter>
        </defs>
        <rect width="1000" height="1000" fill="var(--color-background)" />
        <rect width="1000" height="1000" fill="url(#gw-grid)" />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx="520" cy="500" rx={180 + i * 70} ry={140 + i * 60} fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity={0.18} strokeDasharray="4 6" />)}
        <path d="M60,380 C120,300 230,330 250,420 S210,600 120,610 S20,470 60,380Z" fill="var(--color-sage)" opacity="0.22" />
        <path d="M780,520 C850,470 960,500 960,600 S860,720 800,680 S730,560 780,520Z" fill="var(--color-sage)" opacity="0.18" />
        <path d="M600,500 C560,380 470,360 420,420 S400,580 470,620 S620,600 600,500Z" fill="var(--color-secondary)" opacity="0.8" />
        <path d={RHINE} fill="none" stroke="var(--rhine, oklch(0.4 0.05 210))" strokeWidth="46" strokeLinecap="round" opacity="0.9" />
        <path d={RHINE} fill="none" stroke="var(--color-foreground)" strokeWidth="1" opacity="0.15" strokeDasharray="2 10" />
        {[[560, 470, 660, 470], [575, 540, 665, 545], [590, 620, 680, 630], [610, 330, 690, 320]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="var(--color-paper)" strokeWidth="5" opacity="0.55" />)}
        <g transform={`translate(${project(50.9413, 6.9583).x - 12},${project(50.9413, 6.9583).y - 40})`} fill="var(--color-muted-foreground)" opacity="0.7"><path d="M0 40 L4 8 L8 40Z M14 40 L18 4 L22 40Z" /></g>
        <text x="30" y="970" fill="var(--color-muted-foreground)" fontSize="14" fontFamily="var(--font-display)" letterSpacing="3">50°56′N · 6°57′O</text>
        <g transform="translate(920,80)" stroke="var(--color-gold)" fill="none" opacity="0.8"><circle r="34" /><path d="M0 -30 L6 0 L0 30 L-6 0Z" fill="var(--color-gold)" /><text y="-40" textAnchor="middle" fill="var(--color-gold)" stroke="none" fontSize="14">N</text></g>
        <rect width="1000" height="1000" fill="var(--color-background)" opacity="0.72" mask="url(#gw-fog)" />
        {worldPoints.map((p) => { const c = project(p.lat, p.lng); const locked = isLocked(p); const sel = p.id === selectedId;
          return <g key={p.id} transform={`translate(${c.x},${c.y})`} className="cursor-pointer" role="button" tabIndex={0} aria-label={locked ? "Gesperrter Ort" : p.name}
            onClick={() => { onSelect(p); setCard(p); }} onKeyDown={(e) => { if (e.key === "Enter") { onSelect(p); setCard(p); } }}>
            <circle r="30" fill="transparent" />
            {sel && <circle r="22" fill="none" stroke="var(--color-primary)" strokeWidth="2" className="marker-pulse" />}
            <path d="M0 -16 L12 0 L0 16 L-12 0Z" fill={locked ? "var(--color-muted)" : tone[p.kind]} stroke="var(--color-background)" strokeWidth="3" opacity={locked ? 0.6 : 1} />
            {locked && <text y="5" textAnchor="middle" fontSize="12" fill="var(--color-muted-foreground)">?</text>}
          </g>; })}
      </svg>
    </motion.div>

    <AnimatePresence>{card && <motion.div key={card.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="absolute inset-x-3 bottom-20 z-20 field-panel p-5 shadow-lg sm:inset-x-auto sm:left-4 sm:w-96 lg:bottom-4">
      <button onClick={() => setCard(null)} aria-label="Schließen" className="absolute right-2 top-2 flex size-11 items-center justify-center text-muted-foreground"><X className="size-4" /></button>
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
      {scene.hotspots.map((h) => { const k = `${scene.id}:${h.id}`; return <button key={h.id} aria-label={h.label} onClick={() => { setSpot(k); setFound((f) => f.includes(k) ? f : [...f, k]); }}
        className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-background/40" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
        <span className={`size-3 rounded-full ${found.includes(k) ? "bg-success" : "bg-gold marker-pulse"}`} /></button>; })}
      <AnimatePresence>{spot && (() => { const h = scene.hotspots.find((x) => `${scene.id}:${x.id}` === spot); return h && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-3 bottom-20 field-panel p-5 sm:left-4 sm:w-96 lg:bottom-4">
        <Label>Spur entdeckt</Label><p className="mt-1 font-display text-base font-semibold uppercase">{h.label}</p><p className="mt-2 font-hand text-xl text-paper">„{h.text}“</p>
        <Button variant="ghost" onClick={() => setSpot(null)} className="mt-2 min-h-[44px] w-full">Weiter suchen</Button></motion.div>; })()}</AnimatePresence>
    </motion.div>}</AnimatePresence>
  </div>;
}
