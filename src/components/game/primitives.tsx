import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("label-mono block", className)}>{children}</span>;
}

export function Panel({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn("field-panel p-5", className)}
      style={glow ? { boxShadow: "var(--glow-primary)" } : undefined}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <Label>{eyebrow}</Label> : null}
      <h1 className="text-3xl font-bold uppercase leading-none sm:text-4xl">{title}</h1>
      {lead ? <p className="max-w-prose text-sm text-muted-foreground">{lead}</p> : null}
    </div>
  );
}

export function StatusChip({ status }: { status: "completed" | "active" | "locked" }) {
  const map = {
    completed: "border-success/40 text-success",
    active: "border-primary/50 text-primary",
    locked: "border-border text-muted-foreground",
  } as const;
  const text = { completed: "Abgeschlossen", active: "Aktiv", locked: "Gesperrt" };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
        map[status],
      )}
    >
      {text[status]}
    </span>
  );
}

export function ProgressRing({
  value,
  total,
  size = 92,
}: {
  value: number;
  total: number;
  size?: number;
}) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * pct }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-lg font-bold">{value}</span>
        <span className="label-mono absolute bottom-3 text-[9px]">von {total}</span>
      </div>
    </div>
  );
}

export function LockedContent({ note }: { note: string }) {
  return (
    <Panel className="text-center">
      <Label>Gesperrte Etappe</Label>
      <p className="mt-3 font-display text-lg uppercase">Hier endet die Spur.</p>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </Panel>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
