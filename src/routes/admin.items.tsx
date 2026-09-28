import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { items } from "@/game/data";
import type { InventoryItem } from "@/game/types";

export const Route = createFileRoute("/admin/items")({ head: () => ({ meta: [
  { title: "Gegenstände — Verwaltung" }, { name: "description", content: "Beweisstücke, Schlüssel und Belohnungen für die Expedition verwalten." },
  { property: "og:title", content: "Gegenstände — Verwaltung" }, { property: "og:description", content: "Beweisstücke, Schlüssel und Belohnungen der Expedition verwalten." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
] }), component: ItemsAdmin });

function ItemsAdmin() {
  const [entries, setEntries] = useState<InventoryItem[]>(items);
  const [selected, setSelected] = useState(entries[0]?.id ?? "");
  const [draft, setDraft] = useState<InventoryItem>(items[0] ?? { id: "", number: 1, name: "", kind: "", foundAtStage: 1, description: "", detail: "" });
  const [saved, setSaved] = useState(false);
  const choose = (item: InventoryItem) => { setSelected(item.id); setDraft({ ...item }); setSaved(false); };
  return <AdminShell title="Gegenstände" lead="Fundstücke, Vorräte und rätselhafte Objekte der Expedition." action={<Button onClick={() => { const item = { id: `neu-${Date.now()}`, number: entries.length + 1, name: "Neuer Gegenstand", kind: "Beweisstück", foundAtStage: 1, description: "", detail: "" }; setEntries((old) => [...old, item]); choose(item); }}>Gegenstand erstellen</Button>}>
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]"><div className="space-y-1">{entries.map((item) => <Button key={item.id} variant={selected === item.id ? "secondary" : "ghost"} onClick={() => choose(item)} className="min-h-[44px] w-full justify-start text-left">{String(item.number).padStart(2, "0")} · {item.name}</Button>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); setEntries((old) => old.map((item) => item.id === draft.id ? draft : item)); setSaved(true); }} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
        <Field label="Kategorie"><select value={draft.category ?? "Dokument"} onChange={(e) => setDraft({ ...draft, category: e.target.value as NonNullable<InventoryItem["category"]> })} className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm">{["Dokument", "Schlüssel", "Hinweis", "Kartenfragment", "Codefragment", "Werkzeug", "Quest-Gegenstand", "Joker", "Trinkspiel-Karte", "Essens-Token", "Getränke-Token", "Bonus", "Debuff", "Mystery-Gegenstand"].map((kind) => <option key={kind}>{kind}</option>)}</select></Field>
        <Field label="Beschreibung"><TextInput value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
        <Field label="Etappe"><TextInput type="number" min={1} max={8} value={draft.foundAtStage} onChange={(e) => setDraft({ ...draft, foundAtStage: Number(e.target.value) })} /></Field>
        <div className="sm:col-span-2"><Field label="Details"><textarea value={draft.detail} onChange={(e) => setDraft({ ...draft, detail: e.target.value })} className="min-h-24 w-full rounded-md border border-border bg-surface p-3 text-sm" /></Field></div>
        <div className="flex flex-wrap gap-3 sm:col-span-2">{(["mystery", "physical", "consumable"] as const).map((key) => <label key={key} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(draft[key])} onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })} />{key === "mystery" ? "Verwendung unbekannt" : key === "physical" ? "Physisch" : "Verbrauchbar"}</label>)}</div>
        <div className="sm:col-span-2"><Button type="submit">Gegenstand speichern</Button>{saved && <span role="status" className="ml-3 text-xs text-success">Für diese Vorschau gespeichert.</span>}</div>
      </form></div>
  </AdminShell>;
}