import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "../game/primitives";

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export function FlappyGame({
  targetScore,
  gravity,
  speed,
  gap,
  onSolved,
  solved,
}: {
  targetScore: number;
  gravity: number;
  speed: number;
  gap: number;
  onSolved: () => void;
  solved: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);
  const stateRef = useRef({ y: 160, v: 0, pipes: [] as Pipe[], frame: 0, score: 0 });

  const reset = useCallback(() => {
    stateRef.current = { y: 160, v: 0, pipes: [], frame: 0, score: 0 };
    setScore(0);
    setDead(false);
  }, []);

  const flap = useCallback(() => {
    if (!running) {
      reset();
      setRunning(true);
    }
    stateRef.current.v = -7.2;
  }, [reset, running]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.width = canvas.clientWidth * 2);
    const H = (canvas.height = canvas.clientHeight * 2);
    const S = 2;
    let raf = 0;

    const css = getComputedStyle(document.documentElement);
    const col = (n: string, fb: string) => css.getPropertyValue(n).trim() || fb;

    const draw = () => {
      const s = stateRef.current;
      if (running && !dead) {
        s.frame++;
        s.v += gravity;
        s.y += s.v;
        if (s.frame % Math.round(110 / speed) === 0) {
          s.pipes.push({ x: W / S + 40, gapY: 80 + Math.random() * (H / S - gap - 160), passed: false });
        }
        s.pipes.forEach((p) => (p.x -= speed * 1.6));
        s.pipes = s.pipes.filter((p) => p.x > -80);
        const birdX = 70;
        s.pipes.forEach((p) => {
          if (!p.passed && p.x + 26 < birdX) {
            p.passed = true;
            s.score++;
            setScore(s.score);
            if (s.score >= targetScore) {
              setRunning(false);
              onSolved();
            }
          }
          const hitX = birdX + 14 > p.x && birdX - 14 < p.x + 52;
          const hitY = s.y - 14 < p.gapY || s.y + 14 > p.gapY + gap;
          if (hitX && hitY) {
            setDead(true);
            setRunning(false);
          }
        });
        if (s.y > H / S - 20 || s.y < 0) {
          setDead(true);
          setRunning(false);
        }
      }

      ctx.setTransform(S, 0, 0, S, 0, 0);
      const w = W / S;
      const h = H / S;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, col("--surface", "#17201A"));
      grad.addColorStop(1, col("--background", "#101713"));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // skyline silhouette
      ctx.fillStyle = col("--panel", "#1D2921");
      for (let i = 0; i < 14; i++) {
        const bw = 34;
        const bh = 40 + ((i * 37) % 70);
        ctx.fillRect(i * bw, h - bh - 18, bw - 4, bh);
      }
      ctx.fillStyle = col("--accent", "#2A3A2F");
      ctx.fillRect(0, h - 18, w, 18);

      // pipes as canyon columns
      stateRef.current.pipes.forEach((p) => {
        ctx.fillStyle = col("--accent", "#2A3A2F");
        ctx.fillRect(p.x, 0, 52, p.gapY);
        ctx.fillRect(p.x, p.gapY + gap, 52, h - p.gapY - gap - 18);
        ctx.fillStyle = col("--sage", "#7F9A79");
        ctx.globalAlpha = 0.5;
        ctx.fillRect(p.x, p.gapY - 5, 52, 5);
        ctx.fillRect(p.x, p.gapY + gap, 52, 5);
        ctx.globalAlpha = 1;
      });

      // compass marker
      const s2 = stateRef.current;
      ctx.save();
      ctx.translate(70, s2.y);
      ctx.rotate(Math.max(-0.5, Math.min(0.8, s2.v / 14)));
      ctx.fillStyle = col("--primary", "#D76A32");
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = col("--gold", "#D6B36A");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, 6);
      ctx.lineTo(8, -6);
      ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [dead, gap, gravity, onSolved, running, speed, targetScore]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <Label>Ziel</Label>
          <p className="font-display text-lg font-bold">Erreiche {targetScore} Punkte</p>
        </div>
        <div className="text-right">
          <Label>Aktuell</Label>
          <p className="font-display text-3xl font-bold text-primary">{score}</p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Tippen zum Fliegen"
        onPointerDown={flap}
        onKeyDown={(e) => e.key === "Enter" && flap()}
        className="relative overflow-hidden rounded-lg border border-border"
      >
        <canvas ref={canvasRef} className="block h-[380px] w-full touch-none" />
        {!running && !solved ? (
          <div className="absolute inset-0 grid place-items-center bg-background/70 text-center">
            <div className="px-6">
              <p className="font-display text-xl font-bold uppercase">
                {dead ? "Du hast die Bahn verlassen" : "Über den Dächern"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tippe auf den Bildschirm oder drücke die Leertaste zum Steigen.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
