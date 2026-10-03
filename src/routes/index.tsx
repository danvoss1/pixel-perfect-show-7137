import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { usePlayer } from "@/game/store";
import { adventure, envelopes } from "@/game/data";
import hero from "@/assets/hero-path.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Der verborgene Pfad — Eine Stadtexpedition durch Köln" },
      {
        name: "description",
        content:
          "Eine Stadtexpedition durch Köln mit realen Fundstücken, QR-Markierungen, persönlichen Erinnerungen und einem fragmentierten Archiv.",
      },
      { property: "og:title", content: "Der verborgene Pfad — Eine Stadtexpedition" },
      {
        property: "og:description",
        content: "Eine Spur durch Köln aus Rätseln, realen Gegenständen und Fragmenten eines geheimnisvollen Archivs.",
      },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const started = usePlayer((s) => s.started);
  const begin = usePlayer((s) => s.begin);
  const completed = usePlayer((s) => s.completedStages.length);

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-background">
      <img
        src={hero}
        alt=""
        width={1600}
        height={1008}
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--background) 55%, transparent) 0%, color-mix(in oklab, var(--background) 85%, transparent) 55%, var(--background) 100%)",
        }}
      />
      <div className="topo absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-between px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <span className="label-mono">43°57&apos;07.3&quot;N / 69°20&apos;43.2&quot;W</span>
          <Link to="/admin" className="label-mono hover:text-foreground">
            Spielleitung
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="py-12"
        >
          <span className="label-mono">Expedition 01 · {adventure.city}</span>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,11vw,5.5rem)] font-bold uppercase leading-[0.92]">
            Der verborgene
            <br />
            Pfad
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            Folgt den abgebrochenen Aufzeichnungen von M. durch Köln. Reale
            Fundstücke, QR-Markierungen und persönliche Erinnerungen führen
            tiefer in ein Archiv, das eure Gruppe offenbar besser kennt, als
            es sollte.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/adventure"
              onClick={begin}
              className="grid min-h-[56px] place-items-center rounded-md bg-primary px-8 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Expedition beginnen
            </Link>
            {started ? (
              <Link
                to="/adventure"
                className="grid min-h-[56px] place-items-center rounded-md border border-border bg-background/40 px-8 font-display text-sm font-bold uppercase tracking-[0.2em] backdrop-blur transition-colors hover:bg-accent"
              >
                Weiter · Etappe {completed + 1}
              </Link>
            ) : null}
          </div>
        </motion.div>

        <footer className="grid grid-cols-3 gap-4 border-t border-border pt-5">
          {[
            ["Etappen", String(adventure.stages.length).padStart(2, "0")],
            ["Umschläge", String(envelopes.length).padStart(2, "0")],
            ["Dauer", "~3–4 Std."],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="label-mono">{k}</span>
              <p className="mt-1 font-display text-xl font-bold">{v}</p>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}
