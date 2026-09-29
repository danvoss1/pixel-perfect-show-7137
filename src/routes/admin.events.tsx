import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell, Field, TextInput } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/events")({ head: () => ({ meta: [
  { title: "Ereignisse — Verwaltung" }, { name: "description", content: "Ereigniskarten und freiwillige Aufgaben gestalten." },
  { property: "og:title", content: "Ereignisse — Verwaltung" }, { property: "og:description", content: "Ereigniskarten und freiwillige Aufgaben gestalten." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
] }), component: EventsAdmin });

type EventCard = { id: number; title: string; trigger: string; consequence: string; text: string };
const initial: EventCard[] = [{ id: 1, title: "Stille Route", trigger: "Kontrollpunkt erreicht", consequence: "Keine", text: "Der Navigator darf bis zum nächsten Kontrollpunkt keine Karte ansehen." }, { id: 2, title: "Versorgung", trigger: "Rätsel abgeschlossen", consequence: "Getränke freischalten", text: "Eine Pause für alle. Wählt ein Getränk eurer Wahl." }];
function EventsAdmin() {
  const [events, setEvents] = useState(initial);
  const [selected, setSelected] = useState(events[0]?.id ?? 0);
  const [saved, setSaved] = useState(false);
  const event = events.find((item) => item.id === selected);
  const change = (key: keyof EventCard, value: string) => setEvents((old) => old.map((item) => item.id === selected ? { ...item, [key]: value } : item));
  return <AdminShell title="Ereignisse" lead="Karten, Belohnungen und freiwillige Herausforderungen." action={<Button onClick={() => { const item = { id: Date.now(), title: "Neues Ereignis", trigger: "Manuell", consequence: "Keine", text: "" }; setEvents((old) => [...old, item]); setSelected(item.id); setSaved(false); }}>Ereignis erstellen</Button>}>
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]"><div className="space-y-1">{events.map((item) => <Button key={item.id} variant={selected === item.id ? "secondary" : "ghost"} className="min-h-[44px] w-full justify-start" onClick={() => setSelected(item.id)}>{item.title}</Button>)}</div>
      {event && <div className="grid gap-4 sm:grid-cols-2"><Field label="Titel"><TextInput value={event.title} onChange={(e) => change("title", e.target.value)} /></Field><Field label="Auslöser"><select value={event.trigger} onChange={(e) => change("trigger", e.target.value)} className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3">{["Kontrollpunkt erreicht", "Rätsel abgeschlossen", "Rätsel verloren", "Hinweis benutzt", "Gegenstand gefunden", "Zeit vergangen", "Manuell", "Zufällig"].map((name) => <option key={name}>{name}</option>)}</select></Field>
        <Field label="Konsequenz"><select value={event.consequence} onChange={(e) => change("consequence", e.target.value)} className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3">{["Keine", "1 Schluck", "2 Schlücke", "3 Schlücke", "Verteile 2", "Verteile 3", "Alle Spielenden", "Joker verlieren", "Hinweis-Token verlieren", "Bonusaufgabe", "Minispiel", "Essen freischalten", "Getränke freischalten", "Eigenes Ereignis"].map((name) => <option key={name}>{name}</option>)}</select></Field>
        <div className="sm:col-span-2"><Field label="Nachricht"><textarea value={event.text} onChange={(e) => change("text", e.target.value)} className="min-h-24 w-full rounded-md border border-border bg-surface p-3" /></Field><p className="mt-2 text-xs text-muted-foreground">Alkohol ist niemals erforderlich. Für jede Trinkaufgabe ist ein alkoholfreies Getränk gleichwertig.</p></div>
        <div><Button onClick={() => setSaved(true)}>Entwurf übernehmen</Button>{saved && <p role="status" className="mt-2 text-xs text-success">Nur bis zum Neuladen in dieser Ansicht übernommen. Im Spiel noch nicht aktiv.</p>}</div>
      </div>}</div>
  </AdminShell>;
}