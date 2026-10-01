import { useState } from "react";
import { Archive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/game/primitives";
import type { RevealConfig } from "@/game/types";

export function RevealPuzzle({
  config,
  solved,
  onSolved,
}: {
  config: RevealConfig;
  solved: boolean;
  onSolved: () => void;
}) {
  const [confirmed, setConfirmed] = useState(solved);

  const confirm = () => {
    if (confirmed || solved) return;
    setConfirmed(true);
    onSolved();
  };

  return (
    <div className="field-panel overflow-hidden">
      <div className="border-b border-border bg-background/30 p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md border border-gold/40 bg-gold/10">
            <Archive className="size-5 text-gold" />
          </div>
          <div>
            <Label>{config.eyebrow ?? "Archivübertragung"}</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Physischer Fund · digitale Fortsetzung
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {config.body.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 12)}`}
            className={
              index === 0
                ? "font-hand text-2xl leading-snug text-paper"
                : "text-sm leading-relaxed text-muted-foreground"
            }
          >
            {paragraph}
          </p>
        ))}

        {confirmed || solved ? (
          <div className="flex items-center gap-3 rounded-md border border-success/40 bg-success/10 p-4">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-success">
              {config.successText ?? "Spur übernommen"}
            </p>
          </div>
        ) : (
          <Button className="min-h-[48px] w-full" onClick={confirm}>
            {config.confirmLabel ?? "Spur übernehmen"}
          </Button>
        )}
      </div>
    </div>
  );
}
