import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { GameShell } from "@/components/game/GameShell";
import { usePlayer } from "@/game/store";
import { adventure, envelopes } from "@/game/data";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Markierung scannen — The Hidden Path" },
      { name: "description", content: "Scanne eine QR-Markierung oder gib einen Umschlagcode ein, um die nächste Etappe freizuschalten." },
      { property: "og:title", content: "Markierung scannen — The Hidden Path" },
      { property: "og:description", content: "Scanne eine Markierung oder gib einen Umschlagcode ein." },
    ],
  }),
  component: ScanPage,
});

/** Mocked scanner. A real camera QR decoder can replace the simulate handler. */
function ScanPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "scanning" | "found">("idle");
  const currentId = usePlayer((s) => s.currentStageId);
  const verifyEnvelope = usePlayer((s) => s.verifyEnvelope);
  const stage = adventure.stages.find((s) => s.id === currentId);

  const simulate = () => {
    setStatus("scanning");
    setTimeout(() => {
      setStatus("found");
      const env = envelopes.find((e) => e.id === stage?.envelopeId);
      if (env) verifyEnvelope(env.id, env.number);
      setTimeout(() => {
        if (stage) navigate({ to: "/stage/$id", params: { id: stage.id } });
      }, 1400);
    }, 1600);
  };

  return (
    <GameShell bare>
      <div className="relative grid h-[calc(100vh-56px)] place-items-center bg-background lg:h-screen">
        <div className="topo absolute inset-0 opacity-50" />
        <div className="relative w-full max-w-sm px-6 text-center">
          <p className="label-mono">
            {status === "idle"
              ? "Markierung scannen"
              : status === "scanning"
                ? "Ort wird überprüft ..."
                : "Markierung erkannt"}
          </p>

          <div className="relative mx-auto mt-6 aspect-square w-full max-w-xs rounded-lg border border-border bg-surface/60">
            {["top-0 left-0 border-l-2 border-t-2", "top-0 right-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map(
              (c) => (
                <span key={c} className={`absolute size-10 border-primary ${c}`} />
              ),
            )}
            {status === "scanning" ? (
              <motion.span
                initial={{ top: "8%" }}
                animate={{ top: "88%" }}
                transition={{ duration: 1.1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-x-6 h-0.5 bg-primary"
              />
            ) : null}
            {status === "found" ? (
              <div className="absolute inset-0 grid place-items-center">
                <p className="font-display text-sm uppercase tracking-[0.2em] text-success">
                  Etappe {String(stage?.number ?? 1).padStart(2, "0")} wird geöffnet ...
                </p>
              </div>
            ) : null}
          </div>

          <button
            onClick={simulate}
            disabled={status !== "idle"}
            className="mt-8 min-h-[52px] w-full rounded-md bg-primary font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
          >
            {status === "idle" ? "Scanner starten" : "Scan läuft"}
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            Der Kamerazugriff wird in diesem Prototyp simuliert.
          </p>
        </div>
      </div>
    </GameShell>
  );
}
