import { Link } from "@tanstack/react-router";
import {
  Compass,
  Map as MapIcon,
  Puzzle as PuzzleIcon,
  Backpack,
  BookOpen,
  QrCode,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ReactNode } from "react";
import { usePlayer } from "@/game/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const tabs = [
  { to: "/adventure", label: "Abenteuer", icon: Compass },
  { to: "/map", label: "Karte", icon: MapIcon },
  { to: "/puzzles", label: "Rätsel", icon: PuzzleIcon },
  { to: "/inventory", label: "Inventar", icon: Backpack },
  { to: "/journal", label: "Logbuch", icon: BookOpen },
] as const;

export function GameShell({
  children,
  bare,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  const soundOn = usePlayer((s) => s.soundOn);
  const toggleSound = usePlayer((s) => s.toggleSound);
  const messages = usePlayer((s) => s.messages);
  const dismissMessage = usePlayer((s) => s.dismissMessage);
  const latestMessage = messages?.[0];

  return (
    <div className="topo grain min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface/70 px-4 py-6 backdrop-blur lg:flex">
        <Link to="/" className="mb-8 block">
          <span className="label-mono">50.9375 N / 6.9603 E</span>
          <span className="mt-1 block font-display text-lg font-bold uppercase leading-tight">
            Der verborgene
            <br />
            Pfad
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-accent text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60" }}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-border pt-4">
          <Link
            to="/scan"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60"
          >
            <QrCode className="size-4" /> Markierung scannen
          </Link>
          <button
            onClick={toggleSound}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60"
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            Ton {soundOn ? "an" : "aus"}
          </button>
        </div>
      </aside>

      <div className="lg:pl-56">
        {latestMessage && <div className="relative z-20 mx-auto flex max-w-5xl items-center justify-between gap-3 border-b border-gold bg-panel px-4 py-3" role="status"><div><span className="label-mono text-gold">Neue Nachricht · {latestMessage.time}</span><p className="text-sm">{latestMessage.text}</p></div><Button variant="ghost" size="icon" title="Nachricht schließen" aria-label="Nachricht schließen" onClick={() => dismissMessage(latestMessage.id)}><X className="size-4" /></Button></div>}
        <main
          className={cn(
            "relative z-10 mx-auto w-full pb-28 lg:pb-10",
            bare ? "max-w-none" : "max-w-5xl px-4 pt-6 sm:px-6 lg:pt-10",
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 pb-[env(safe-area-inset-bottom)] pt-2 text-[10px] font-semibold uppercase tracking-wider"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
