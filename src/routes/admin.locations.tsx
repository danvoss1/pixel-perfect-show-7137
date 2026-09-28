import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { locations } from "@/game/data";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({
    meta: [
      { title: "Locations — Admin" },
      { name: "description", content: "Place markers, set coordinates and unlock radius for each location." },
      { property: "og:title", content: "Locations — Admin" },
      { property: "og:description", content: "Coordinates, unlock radius and verification rules." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLocations,
});

function AdminLocations() {
  const [selected, setSelected] = useState(locations[0].id);
  const [pos, setPos] = useState({ x: locations[0].x, y: locations[0].y });
  const loc = locations.find((l) => l.id === selected)!;

  return (
    <AdminShell title="Locations" lead="Drag the marker on the map to reposition it.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div
          className="topo relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPos({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }}
        >
          <span
            className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/30"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
          <span className="absolute bottom-3 left-3 label-mono">
            Click the map to move the marker
          </span>
        </div>

        <div className="space-y-4">
          <Field label="Location">
            <select
              value={selected}
              onChange={(e) => {
                const l = locations.find((x) => x.id === e.target.value)!;
                setSelected(l.id);
                setPos({ x: l.x, y: l.y });
              }}
              className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location name">
            <TextInput key={loc.id} defaultValue={loc.name} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <TextInput key={`${loc.id}-lat`} defaultValue={loc.lat} />
            </Field>
            <Field label="Longitude">
              <TextInput key={`${loc.id}-lng`} defaultValue={loc.lng} />
            </Field>
          </div>
          <Field label="Unlock radius (m)">
            <TextInput key={`${loc.id}-r`} type="number" defaultValue={loc.radius} />
          </Field>
          <div className="space-y-2">
            <Toggle label="Require GPS verification" defaultChecked={loc.requireGps} />
            <Toggle label="Require code" defaultChecked={loc.requireCode} />
            <Toggle label="Require QR scan" defaultChecked={loc.requireQr} />
          </div>
          <button className="min-h-[44px] w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            Save location
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
