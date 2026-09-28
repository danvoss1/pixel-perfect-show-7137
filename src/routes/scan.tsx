import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { GameShell } from "@/components/game/GameShell";
import { usePlayer } from "@/game/store";
import { adventure, envelopes } from "@/game/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Markierung scannen — Der verborgene Pfad" },
      { name: "description", content: "Scanne eine QR-Markierung oder gib einen Umschlagcode ein, um die nächste Etappe freizuschalten." },
      { property: "og:title", content: "Markierung scannen — Der verborgene Pfad" },
      { property: "og:description", content: "Scanne eine Markierung oder gib einen Umschlagcode ein." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

/** Mocked scanner. A real camera QR decoder can replace the simulate handler. */
function ScanPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "scanning" | "found">("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const currentId = usePlayer((s) => s.currentStageId);
  const verifyEnvelope = usePlayer((s) => s.verifyEnvelope);
  const stage = adventure.stages.find((s) => s.id === currentId);
  const submitCode = () => {
    const envelope = envelopes.find((item) => item.id === stage?.envelopeId);
    if (!envelope || code.trim().toUpperCase() !== envelope.code) { setError("Code nicht erkannt. Prüfe den Umschlag und versuche es erneut."); return; }
    verifyEnvelope(envelope.id, envelope.number);
    setError(""); setStatus("found");
    navigate({ to: "/stage/$id", params: { id: stage?.id ?? "s1" } });
  };

  const simulate = () => {
    setStatus("scanning");
    setTimeout(() => {
      setStatus("found");
      const env = envelopes.find((e) => e.id === stage?.envelopeId);
      if (env) { setError("Dieser Scanner ist eine Vorschau. Bestätige den Umschlag mit seinem Code."); setStatus("idle"); return; }
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
                ? "Ort wird überprüft …"
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
                  Etappe {String(stage?.number ?? 1).padStart(2, "0")} wird geöffnet …
                </p>
              </div>
            ) : null}
          </div>

          <Button
            onClick={simulate}
            disabled={status !== "idle"}
            className="mt-8 min-h-[52px] w-full font-display text-sm font-bold uppercase"
          >
            {status === "idle" ? "Scanner starten" : "Scan läuft"}
          </Button>
          {stage?.envelopeId && <form onSubmit={(e) => { e.preventDefault(); submitCode(); }} className="mt-5 flex gap-2"><input aria-label="Umschlagcode" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Umschlagcode eingeben" className="min-h-[48px] min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm" /><Button type="submit" disabled={!code.trim()}>Bestätigen</Button></form>}
          {error && <p role="alert" className="mt-3 text-sm text-gold">{error}</p>}
          <p className="mt-4 text-xs text-muted-foreground">
            Der Kamerazugriff wird in diesem Prototyp simuliert.
          </p>
        </div>
      </div>
    </GameShell>
  );
}
