/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "./CologneMap";

type Point = { lat: number; lng: number };

export function GooglePointPicker({
  point,
  onChange,
  target,
  zoom = 19,
}: {
  point?: Point;
  onChange: (point: Point) => void;
  target?: Point;
  zoom?: number;
}) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const targetMarker = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let alive = true;
    loadGoogleMaps()
      .then(() => {
        if (!alive || !node.current) return;
        const center = point ?? target ?? { lat: 50.936955, lng: 6.960379 };
        map.current = new google.maps.Map(node.current, {
          center,
          zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          clickableIcons: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        map.current.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;
          onChangeRef.current({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
        setReady(true);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
      marker.current?.setMap(null);
      targetMarker.current?.setMap(null);
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !point) return;
    marker.current?.setMap(null);
    marker.current = new google.maps.Marker({
      map: map.current,
      position: point,
      draggable: true,
      title: "Kalibrierpunkt",
    });
    marker.current.addListener("dragend", () => {
      const p = marker.current?.getPosition();
      if (p) onChangeRef.current({ lat: p.lat(), lng: p.lng() });
    });
    map.current.panTo(point);
  }, [point?.lat, point?.lng, ready]);

  useEffect(() => {
    if (!map.current || !target) return;
    targetMarker.current?.setMap(null);
    targetMarker.current = new google.maps.Marker({
      map: map.current,
      position: target,
      title: "Heumarkt Herz",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#D76A32",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
  }, [target?.lat, target?.lng, ready]);

  return (
    <div className="relative h-full min-h-[360px] w-full bg-surface">
      <div ref={node} className="absolute inset-0" />
      {error ? <div className="absolute inset-0 grid place-items-center bg-surface p-5 text-center text-sm">{error}</div> : null}
    </div>
  );
}
