import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, LocateFixed, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/game/GameShell";
import { CologneMap } from "@/components/game/CologneMap";
import { Label } from "@/components/game/primitives";
import { adventure, locations } from "@/game/data";
import { usePlayer } from "@/game/store";
import type { GameLocation, MarkerState } from "@/game/types";
import { GameWorldMap } from "@/components/game/GameWorldMap";
import type { WorldPoint } from "@/game/worldmap";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "Expeditionskarte — Der verborgene Pfad" },
    { name: "description", content: "Entdecke die Kontrollpunkte der Stadtexpedition auf der Karte von Köln." },
    { property: "og:title", content: "Expeditionskarte — Der verborgene Pfad" },
    { property: "og:description", content: "Entdecke die Kontrollpunkte der Stadtexpedition auf der Karte von Köln." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: MapPage,
});

function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function MapPage() {
  const visited = usePlayer((s) => s.visitedLocations);
  const currentId = usePlayer((s) => s.currentStageId);
  const visitLocation = usePlayer((s) => s.visitLocation);
  const currentStage = adventure.stages.find((s) => s.id === currentId);
  const [selectedId, setSelectedId] = useState(currentStage?.locationId ?? locations.find((l) => l.stageId === currentId)?.id ?? locations.find((l) => l.kind === "food")?.id ?? locations[0]?.id ?? "");
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<"game" | "nav">("nav");
  const [worldId, setWorldId] = useState<string>();
  const [position, setPosition] = useState<{ lat: number; lng: number }>();
  const [gpsMessage, setGpsMessage] = useState("");
  const selected = locations.find((l) => l.id === selectedId) ?? locations[0];
  const stateOf = useCallback((loc: GameLocation): MarkerState => {
    if (visited.includes(loc.id)) return "completed";
    if (currentStage?.locationId === loc.id || currentStage?.id === loc.stageId) return "active";
    const stage = adventure.stages.find((s) => s.id === loc.stageId || s.locationId === loc.id);
    if (stage) return stage.number <= (currentStage?.number ?? 1) ? "discovered" : "locked";
    return loc.kind === "food" ? "food" : loc.kind === "drink" ? "drink" : "discovered";
  }, [visited, currentStage]);
  const choose = useCallback((id: string) => { setSelectedId(id); setOpen(true); setGpsMessage(""); }, []);
  const locate = () => {
    if (!selected || stateOf(selected) === "locked") { setGpsMessage("Dieser Ort ist noch nicht freigeschaltet."); return; }
    if (!navigator.geolocation) { setGpsMessage("Standort auf diesem Gerät nicht verfügbar."); return; }
    setGpsMessage("Standort wird ermittelt …");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude };
        setPosition(point);
        if (coords.accuracy > selected.radius) { setGpsMessage(`Standort zu ungenau (±${Math.round(coords.accuracy)} m). Bitte versuche es an einem freien Platz erneut.`); return; }
        if (selected && metersBetween(point, selected) <= selected.radius) {
          setGpsMessage("Kontrollpunkt erreicht.");
          if (!selected.requireCode && !selected.requireQr) visitLocation(selected.id, selected.name);
        } else setGpsMessage("Du bist noch nicht im Suchbereich des Kontrollpunkts.");
      }, () => setGpsMessage("Standort nicht verfügbar. Bitte erlaube den Standortzugriff."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };
  if (!selected) return null;
  const locked = stateOf(selected) === "locked";
  const distance = position ? metersBetween(position, selected) : null;
  const isLocked = (p: WorldPoint) => Boolean(p.locked) || (() => { const l = locations.find((x) => x.id === p.locationId); return l ? stateOf(l) === "locked" : false; })();
  const toggle = <div className="absolute left-1/2 top-4 z-40 flex -translate-x-1/2 rounded-md border border-border bg-background/90 p-1 backdrop-blur-sm" role="tablist">
    {(["game", "nav"] as const).map((m) => <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`relative min-h-[40px] px-4 label-mono ${mode === m ? "text-primary-foreground" : "text-muted-foreground"}`}>
      {mode === m && <motion.span layoutId="map-mode" className="absolute inset-0 rounded bg-primary" />}<span className="relative">{m === "game" ? "Spielkarte" : "Navigation"}</span></button>)}
  </div>;
  if (mode === "game") return <GameShell bare><div className="relative h-[calc(100dvh-56px)] min-h-[480px] w-full overflow-hidden lg:h-screen">
    {toggle}
    <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
      <GameWorldMap isLocked={isLocked} selectedId={worldId} onSelect={(p) => setWorldId(p.id)} onNavigate={(p) => {
        if (p.locationId) { choose(p.locationId); setMode("nav"); } else window.open(`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`, "_blank", "noopener");
      }} />
    </motion.div>
  </div></GameShell>;
  return <GameShell bare><div className="relative h-[calc(100dvh-56px)] min-h-[480px] w-full overflow-hidden lg:h-screen">
    {toggle}
    <CologneMap selectedId={selectedId} onSelect={choose} stateOf={stateOf} />
    <div className="absolute inset-x-0 bottom-0 z-20 p-3 pb-20 sm:p-4 lg:max-w-md lg:pb-4"><div className="field-panel overflow-hidden shadow-lg">
      <Button variant="ghost" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex h-auto min-h-[56px] w-full justify-between gap-3 px-5 text-left hover:bg-accent">
        <span className="min-w-0"><Label>{locked ? "Unbekannter Ort" : selected.kind === "food" ? "Versorgungsstation" : selected.kind === "drink" ? "Getränkestation" : "Nächstes Ziel"}</Label>
         <span className="mt-0.5 block font-display text-base font-semibold uppercase leading-tight">{locked ? "Noch nicht entdeckt" : selected.name}</span></span>
        <ChevronUp className={`size-4 shrink-0 transition-transform ${open ? "" : "rotate-180"}`} />
      </Button>
      <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-5">
         {locked ? <p className="text-sm text-muted-foreground">Weitere Informationen werden im Verlauf der Expedition freigeschaltet.</p> : <>
          <div className="flex gap-6"><div><Label>Entfernung</Label><p className="mt-1 font-display text-lg">{distance === null ? selected.distance : `${distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`}`}</p></div><div><Label>Suchradius</Label><p className="mt-1 font-display text-lg">{selected.radius} m</p></div></div>
          <p className="mt-3 text-sm text-muted-foreground">{selected.description}</p>
          <Label className="mt-4">Hinweis</Label><p className="mt-2 font-hand text-2xl leading-tight text-paper">„{selected.clue}“</p>
          {visited.includes(selected.id) ? <p className="mt-4 font-display text-xs uppercase text-success">Ort bestätigt</p> : selected.requireCode || selected.requireQr ? <p className="mt-4 text-xs text-muted-foreground">Hier ist zusätzlich der Umschlagcode oder QR-Code erforderlich.</p> : <Button onClick={locate} className="mt-4 min-h-[48px] w-full gap-2"><LocateFixed className="size-4" /> Standort bestätigen</Button>}
          {gpsMessage && <p role="status" className="mt-2 text-xs text-paper">{gpsMessage}</p>}
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-[44px] items-center justify-center gap-2 border-t border-border pt-2 text-xs text-primary"><Footprints className="size-4" /> Fußweg in Google Maps öffnen</a>
           {currentStage?.puzzleId === "p-route" && selected.stageId === currentStage.id && <Link to="/puzzle/$id" params={{ id: "p-route" }} className="mt-1 block text-center label-mono text-primary">Navigationsrätsel öffnen</Link>}
        </>}
      </motion.div>}</AnimatePresence>
    </div></div>
  </div></GameShell>;
}
