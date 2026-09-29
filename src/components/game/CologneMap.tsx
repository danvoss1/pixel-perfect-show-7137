/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { locations } from "@/game/data";
import type { GameLocation, MarkerState } from "@/game/types";
import { Button } from "@/components/ui/button";

const center = { lat: 50.9375, lng: 6.9603 };
const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
let mapsPromise: Promise<void> | undefined;

function loadMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("Karte nur im Browser verfügbar"));
  if (window.google?.maps?.Map) return Promise.resolve();
  if (!key) return Promise.reject(new Error("Die Kartenverbindung ist nicht verfügbar."));
  if (!mapsPromise) {
    mapsPromise = new Promise<void>((resolve, reject) => {
      const callback = `initExpeditionMap${Date.now()}`;
      const timer = window.setTimeout(() => reject(new Error("Die Karte konnte nicht geladen werden.")), 16000);
      Object.assign(window, { [callback]: () => { window.clearTimeout(timer); resolve(); delete (window as unknown as Record<string, unknown>)[callback]; } });
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=${callback}&channel=${encodeURIComponent(channel ?? "expedition")}`;
      script.async = true;
      script.onerror = () => { window.clearTimeout(timer); mapsPromise = undefined; reject(new Error("Die Karte konnte nicht geladen werden.")); };
      document.head.append(script);
    });
  }
  return mapsPromise;
}

const tones: Record<MarkerState, string> = {
  active: "#D76A32", completed: "#74A678", discovered: "#D6B36A", locked: "#7F9A79",
  unknown: "#A9B2A8", food: "#D6B36A", drink: "#7F9A79", envelope: "#D76A32", puzzle: "#D6B36A", bonus: "#74A678",
};

export function CologneMap({ selectedId, onSelect, stateOf, editable, onMove }: {
  selectedId?: string;
  onSelect?: (id: string) => void;
  stateOf?: (location: GameLocation) => MarkerState;
  editable?: boolean;
  onMove?: (lat: number, lng: number) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const overlays = useRef<google.maps.MVCObject[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let alive = true;
    const authFailure = () => { if (alive) { setDenied(true); setError("Google Maps ist für diese Adresse nicht freigegeben. Die Orte bleiben unten auswählbar."); } };
    Object.assign(window, { gm_authFailure: authFailure });
    loadMaps().then(() => {
      if (!alive || !node.current || denied) return;
      map.current = new google.maps.Map(node.current, {
        center, zoom: 13, clickableIcons: false, mapTypeControl: false, streetViewControl: false,
        fullscreenControl: false, gestureHandling: "greedy",
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#526058" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#E8E3D6" }] },
          { featureType: "landscape", stylers: [{ color: "#2C3931" }] },
          { featureType: "water", stylers: [{ color: "#283F49" }] },
          { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#CBC8B6" }] },
          { featureType: "transit", stylers: [{ saturation: -70 }] },
        ],
      });
      setReady(true);
    }).catch((cause: Error) => { if (alive) setError(cause.message); });
    return () => { alive = false; if ((window as unknown as Record<string, unknown>)["gm_authFailure"] === authFailure) delete (window as unknown as Record<string, unknown>)["gm_authFailure"]; markers.current.forEach((m) => m.setMap(null)); overlays.current.forEach((o) => (o as google.maps.Polyline).setMap(null)); map.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    markers.current.forEach((m) => m.setMap(null));
    overlays.current.forEach((o) => (o as google.maps.Polyline).setMap(null));
    const visible = locations.filter((loc) => editable || stateOf?.(loc) !== "locked");
    markers.current = visible.map((loc) => {
      const state = stateOf?.(loc) ?? "discovered";
      const marker = new google.maps.Marker({
        map: map.current, position: { lat: loc.lat, lng: loc.lng },
        title: state === "locked" ? "Unbekannter Ort" : loc.name,
        draggable: Boolean(editable && loc.id === selectedId),
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: loc.id === selectedId ? 13 : 10,
          fillColor: tones[state], fillOpacity: state === "locked" ? 0.45 : 1,
          strokeColor: "#101713", strokeWeight: 3 },
      });
      marker.addListener("click", () => onSelect?.(loc.id));
      if (editable && loc.id === selectedId) marker.addListener("dragend", () => {
        const point = marker.getPosition();
        if (point) onMove?.(point.lat(), point.lng());
      });
      return marker;
    });
    const visited = visible.filter((loc) => stateOf?.(loc) === "completed");
    const target = visible.find((loc) => loc.id === selectedId && stateOf?.(loc) !== "locked");
    const origin = visited.at(-1);
    if (!editable && origin && target && origin.id !== target.id) {
      const route = new google.maps.DirectionsService();
      route.route({ origin: { lat: origin.lat, lng: origin.lng }, destination: { lat: target.lat, lng: target.lng }, travelMode: google.maps.TravelMode.WALKING }, (result, status) => {
        if (!map.current || status !== google.maps.DirectionsStatus.OK || !result) return;
        const renderer = new google.maps.DirectionsRenderer({ map: map.current, directions: result, suppressMarkers: true, preserveViewport: true, polylineOptions: { strokeColor: tones.active, strokeOpacity: 0.85, strokeWeight: 4 } });
        overlays.current.push(renderer);
      });
    }
  }, [selectedId, stateOf, onSelect, editable, onMove, ready]);

  useEffect(() => {
    const selected = locations.find((loc) => loc.id === selectedId);
    if (selected && map.current) map.current.panTo({ lat: selected.lat, lng: selected.lng });
  }, [selectedId, ready]);

  return <div className="absolute inset-0 bg-surface" role="region" aria-label="Interaktive Karte von Köln">
    <div ref={node} className="h-full w-full" />
     {error && <div className="absolute inset-0 z-10 flex flex-col bg-surface px-5 pb-5 pt-20 text-center" role="alert"><div className="mx-auto w-full max-w-md"><p className="font-display text-base font-semibold">Karte derzeit nicht verfügbar</p><p className="mt-2 text-sm text-muted-foreground">{error}</p><div className="mt-3 max-h-[25vh] space-y-2 overflow-y-auto">{locations.filter((loc) => editable || stateOf?.(loc) !== "locked").map((loc) => <Button variant="outline" key={loc.id} onClick={() => onSelect?.(loc.id)} className={`min-h-[44px] w-full justify-start text-left text-sm ${selectedId === loc.id ? "border-primary bg-accent" : "border-border"}`}>{loc.name}</Button>)}</div></div></div>}
  </div>;
}