import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput, Toggle } from "@/components/admin/AdminShell";
import { locations } from "@/game/data";
import { CologneMap } from "@/components/game/CologneMap";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({
    meta: [
      { title: "Orte — Verwaltung" },
      { name: "description", content: "Markierungen, Koordinaten und Freischaltradius je Ort festlegen." },
      { property: "og:title", content: "Orte — Verwaltung" },
      { property: "og:description", content: "Koordinaten, Freischaltradius und Prüfregeln." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerwaltungOrte,
});

function VerwaltungOrte() {
  const [selected, setSelected] = useState(locations[0]!.id);
  const [pos, setPos] = useState({ lat: locations[0]!.lat, lng: locations[0]!.lng });
  const [notice, setNotice] = useState("");
  const loc = locations.find((l) => l.id === selected)!;

  return (
    <AdminShell title="Orte" lead="Ziehe die Markierung auf der Karte an die gewünschte Stelle.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-[4/3] min-h-[300px] overflow-hidden rounded-md border border-border bg-surface"><CologneMap editable selectedId={selected} onSelect={(id) => { const next = locations.find((l) => l.id === id); if (next) { setSelected(id); setPos({ lat: next.lat, lng: next.lng }); } }} onMove={(lat, lng) => setPos({ lat, lng })} /></div>

        <div className="space-y-4">
          <Field label="Ort">
            <select
              value={selected}
              onChange={(e) => {
                const l = locations.find((x) => x.id === e.target.value)!;
                setSelected(l.id);
                setPos({ lat: l.lat, lng: l.lng });
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
          <Field label="Name des Ortes">
            <TextInput key={loc.id} defaultValue={loc.name} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Breitengrad">
              <TextInput type="number" step="any" value={pos.lat} onChange={(e) => setPos((old) => ({ ...old, lat: Number(e.target.value) }))} />
            </Field>
            <Field label="Längengrad">
              <TextInput type="number" step="any" value={pos.lng} onChange={(e) => setPos((old) => ({ ...old, lng: Number(e.target.value) }))} />
            </Field>
          </div>
          <Field label="Freischaltradius (m)">
            <TextInput key={`${loc.id}-r`} type="number" defaultValue={loc.radius} />
          </Field>
          <div className="space-y-2">
            <Toggle label="GPS-Bestätigung erforderlich" defaultChecked={loc.requireGps} />
            <Toggle label="Code erforderlich" defaultChecked={loc.requireCode} />
            <Toggle label="QR-Scan erforderlich" defaultChecked={loc.requireQr} />
          </div>
          <Button className="min-h-[44px] w-full" onClick={() => { setNotice("Änderungen sind in dieser Vorschau noch nicht gespeichert."); }}>Ort speichern</Button>
          {notice && <p role="status" className="text-xs text-muted-foreground">{notice}</p>}
        </div>
      </div>
    </AdminShell>
  );
}
