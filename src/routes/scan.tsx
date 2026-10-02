import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, QrCode, ScanLine } from "lucide-react";
import { GameShell } from "@/components/game/GameShell";
import { usePlayer } from "@/game/store";
import { qrMarkByToken, type QrMarkDefinition } from "@/game/qrMarks";
import { Button } from "@/components/ui/button";
import jsQR from "jsqr";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Markierung scannen — Der verborgene Pfad" },
      {
        name: "description",
        content: "Scanne eine physische Hidden-Path-Markierung.",
      },
    ],
  }),
  component: ScanPage,
});

type DetectorResult = { rawValue?: string };
type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<DetectorResult[]>;
};

function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const registerQrMark = usePlayer((state) => state.registerQrMark);
  const setFlowPhase = usePlayer((state) => state.setHeumarktFlowPhase);

  const [status, setStatus] = useState<"idle" | "scanning" | "found">("idle");
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [found, setFound] = useState<QrMarkDefinition | null>(null);

  const stopCamera = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => () => stopCamera(), []);

  const acceptMark = (rawValue: string) => {
    const mark = qrMarkByToken(rawValue);
    if (!mark) {
      setError("Diese Markierung gehört nicht zu dieser Expedition.");
      return false;
    }

    stopCamera();
    registerQrMark(mark.id);

    if (mark.id === "heumarkt-heart") {
      setFlowPhase("heart-reached");
    }

    setFound(mark);
    setStatus("found");
    setError("");
    return true;
  };

  const startScanner = async () => {
    setError("");

    if (!window.isSecureContext) {
      setError(
        "Die Kamera ist nur über HTTPS oder localhost verfügbar. Öffnet die VS-Code-Forward-URL über HTTPS oder testet über das spätere Vercel-Deployment.",
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Dieser Browser stellt keinen Kamerazugriff bereit. Nutzt einen aktuellen Browser oder den Ersatzcode.",
      );
      return;
    }

    const Detector = (window as unknown as {
      BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
    }).BarcodeDetector;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();
      setStatus("scanning");

      const nativeDetector = Detector
        ? new Detector({ formats: ["qr_code"] })
        : null;

      timerRef.current = window.setInterval(async () => {
        const currentVideo = videoRef.current;
        if (
          !currentVideo ||
          currentVideo.readyState < 2 ||
          currentVideo.videoWidth === 0
        ) {
          return;
        }

        try {
          // First use the browser-native QR decoder when it exists.
          if (nativeDetector) {
            const results = await nativeDetector.detect(currentVideo);
            const value = results.find((result) => result.rawValue)?.rawValue;
            if (value && acceptMark(value)) return;
          }

          // Cross-browser fallback: decode the video frame ourselves with jsQR.
          const canvas = canvasRef.current;
          if (!canvas) return;

          const maxWidth = 720;
          const scale = Math.min(1, maxWidth / currentVideo.videoWidth);
          const width = Math.max(
            1,
            Math.round(currentVideo.videoWidth * scale),
          );
          const height = Math.max(
            1,
            Math.round(currentVideo.videoHeight * scale),
          );

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d", {
            willReadFrequently: true,
          });
          if (!context) return;

          context.drawImage(currentVideo, 0, 0, width, height);
          const imageData = context.getImageData(0, 0, width, height);

          const result = jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
            { inversionAttempts: "attemptBoth" },
          );

          if (result?.data) {
            acceptMark(result.data);
          }
        } catch {
          // A single unreadable frame is harmless; retry on the next frame.
        }
      }, 300);
    } catch (cause) {
      stopCamera();
      setStatus("idle");

      const errorName = cause instanceof DOMException ? cause.name : "";

      if (errorName === "NotAllowedError") {
        setError(
          "Der Kamerazugriff wurde blockiert. Erlaubt der Seite die Kamera in den Browser-Einstellungen und versucht es erneut.",
        );
      } else if (errorName === "NotFoundError") {
        setError("Auf diesem Gerät wurde keine verwendbare Kamera gefunden.");
      } else {
        setError(
          "Die Kamera konnte nicht geöffnet werden. Prüft HTTPS und die Kameraberechtigung oder nutzt den Ersatzcode.",
        );
      }
    }
  };

  const submitManual = () => {
    if (!manualCode.trim()) return;
    if (!acceptMark(manualCode)) {
      setStatus("idle");
    }
  };

  const continueFromMark = () => {
    if (!found) return;

    if (found.target.type === "puzzle") {
      navigate({ to: "/puzzle/$id", params: { id: found.target.puzzleId } });
      return;
    }

    if (found.target.type === "stage") {
      navigate({ to: "/stage/$id", params: { id: found.target.stageId } });
      return;
    }

    navigate({ to: found.target.route });
  };

  return (
    <GameShell bare>
      <div className="relative mx-auto min-h-[calc(100vh-56px)] max-w-2xl px-5 py-10 lg:min-h-screen">
        <div className="topo pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative">
          <p className="label-mono">Zentraler Scanner</p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">
            Markierung scannen
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Physische QR-Markierungen schalten Hinweise und Rätsel frei. Falls der Browser keinen eigenen QR-Decoder besitzt, verwendet der Scanner automatisch einen eingebauten Fallback. Haltet den Code vollständig in den Suchrahmen.
          </p>

          {status !== "found" ? (
            <>
              <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-lg border border-border bg-black/60">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${status === "scanning" ? "opacity-100" : "opacity-25"}`}
                />
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                {status !== "scanning" ? (
                  <div className="absolute inset-0 grid place-items-center">
                    <QrCode className="size-16 text-muted-foreground" />
                  </div>
                ) : null}

                <div className="pointer-events-none absolute inset-[12%]">
                  {[
                    "left-0 top-0 border-l-2 border-t-2",
                    "right-0 top-0 border-r-2 border-t-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                  ].map((classes) => (
                    <span
                      key={classes}
                      className={`absolute size-12 border-primary ${classes}`}
                    />
                  ))}
                  {status === "scanning" ? (
                    <span className="absolute inset-x-2 top-1/2 h-px bg-primary shadow-[0_0_14px_currentColor]" />
                  ) : null}
                </div>
              </div>

              <Button
                onClick={status === "scanning" ? stopCamera : startScanner}
                className="mt-5 min-h-[52px] w-full gap-2 font-display text-xs font-bold uppercase tracking-[0.18em]"
              >
                {status === "scanning" ? (
                  <>
                    <ScanLine className="size-4" /> Scanner stoppen
                  </>
                ) : (
                  <>
                    <Camera className="size-4" /> Kamera öffnen
                  </>
                )}
              </Button>

              <div className="mt-7 border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <Keyboard className="size-4 text-gold" />
                  <p className="label-mono text-gold">Ersatzcode</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Falls die Kamera oder der Browser den QR-Code nicht lesen kann, steht derselbe kurze Code unter der gedruckten Markierung.
                </p>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitManual();
                  }}
                >
                  <input
                    aria-label="Ersatzcode"
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                    placeholder="HP-…"
                    autoComplete="off"
                    spellCheck={false}
                    className="min-h-[48px] min-w-0 flex-1 rounded-md border border-border bg-surface px-3 font-mono text-sm uppercase"
                  />
                  <Button type="submit" disabled={!manualCode.trim()}>
                    Prüfen
                  </Button>
                </form>
              </div>

              {error ? (
                <p role="alert" className="mt-4 rounded-md border border-gold/40 bg-gold/10 p-3 text-sm text-gold">
                  {error}
                </p>
              ) : null}
            </>
          ) : found ? (
            <div className="mt-7 rounded-lg border border-success/40 bg-success/10 p-5">
              <p className="label-mono text-success">{found.eyebrow}</p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase">
                {found.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-paper">
                {found.text}
              </p>
              <Button
                className="mt-6 min-h-[52px] w-full"
                onClick={continueFromMark}
              >
                {found.continueLabel}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setFound(null);
                  setStatus("idle");
                  setManualCode("");
                }}
                className="mt-3 w-full text-center text-xs text-muted-foreground"
              >
                Andere Markierung scannen
              </button>
            </div>
          ) : null}

          <Link to="/adventure" className="mt-6 block text-center label-mono text-primary">
            Zur Expedition
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
