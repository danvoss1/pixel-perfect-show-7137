import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/admin", label: "Übersicht" },
  { to: "/admin/adventures", label: "Abenteuer" },
  { to: "/admin/stages", label: "Etappen" },
  { to: "/admin/puzzles", label: "Rätsel / Codes" },
  { to: "/admin/locations", label: "Orte" },
  { to: "/admin/heumarkt", label: "Heumarkt 3D" },
  { to: "/admin/items", label: "Gegenstände" },
  { to: "/admin/events", label: "Ereignisse" },
  { to: "/admin/players", label: "Spielende" },
  { to: "/admin/settings", label: "Einstellungen" },
] as const;

export function AdminShell({
  title,
  lead,
  children,
  action,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 flex-col border-r border-border bg-surface px-3 py-6 md:flex">
        <Link to="/" className="mb-6 px-2">
          <span className="label-mono">Spielleitung</span>
          <span className="mt-1 block font-display text-base font-bold uppercase">Verwaltung</span>
        </Link>
        <nav className="flex flex-col gap-0.5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/admin" }}
              activeProps={{ className: "bg-accent text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60" }}
              className="rounded-md px-3 py-2 text-sm transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-border pt-3">
          <Link to="/adventure" className="block px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            ← Spieleransicht
          </Link>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/adventure";
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          >
            <LogOut className="size-3.5" /> Admin abmelden
          </button>
        </div>
      </aside>

      <div className="md:pl-52">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold">{title}</h1>
              {lead ? <p className="mt-1 text-sm text-muted-foreground">{lead}</p> : null}
            </div>
            {action}
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "bg-accent text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="shrink-0 rounded-md border border-border px-3 py-2 text-xs"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AdminTable({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-surface">
          <tr>
            {head.map((h) => (
              <th key={h} className="label-mono px-4 py-3 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
    />
  );
}

export function Toggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean | undefined;
}) {
  return (
    <label className="flex min-h-[44px] items-center justify-between gap-4 rounded-md border border-border bg-surface px-4">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-[var(--primary)]" />
    </label>
  );
}
