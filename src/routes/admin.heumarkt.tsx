import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell, Field, TextInput } from "@/components/admin/AdminShell";
import { GooglePointPicker } from "@/components/game/GooglePointPicker";
import { Button } from "@/components/ui/button";
import {
  calculateAffine,
  HEUMARKT_CHOICE_POINTS,
  loadHeumarktCalibration,
  mapToScene,
  metersBetween,
  saveHeumarktCalibration,
  sceneToMap,
  triangleCentroid,
  type HeumarktCalibrationState,
  type HeumarktScenePoint,
} from "@/game/heumarktCalibration";

type SceneObject = {
  id: string;
  kind: string;
  position: [number, number];
  label?: string;
};

type SelectionMessage = {
  event?: string;
  id?: string;
  objectId?: string;
  kind?: string;
  label?: string;
  position?: [number, number];
};

export const Route = createFileRoute("/admin/heumarkt")({
  head: () => ({
    meta: [
      { title: "Heumarkt-Kalibrierung — Verwaltung" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HeumarktCalibrationAdmin,
});

function HeumarktCalibrationAdmin() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<HeumarktCalibrationState>(() => loadHeumarktCalibration());
  const [activeControl, setActiveControl] = useState(0);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/heumarkt-3d/model-data.json")
      .then((r) => r.json())
      .then((data) => setObjects(Array.isArray(data.objects) ? data.objects : []))
      .catch(() => setNotice("3D-Objektliste konnte nicht geladen werden."));
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent<SelectionMessage>) => {
      if (event.origin !== window.location.origin || !event.data?.position) return;

      const isFreePoint = event.data.event === "heumarkt-map:selection";
      const isChoicePoint = event.data.event === "heumarkt-map:choice-point";
      if (!isFreePoint && !isChoicePoint) return;

      const [x, z] = event.data.position;
      const objectId = event.data.objectId ?? event.data.id;

      setState((old) => {
        const next = structuredClone(old);
        next.controls[activeControl] = {
          ...next.controls[activeControl]!,
          scene: {
            x,
            z,
            objectId,
            label: event.data.label ?? objectId,
          },
        };
        return next;
      });

      setNotice(
        isChoicePoint
          ? `${event.data.id ?? "Punkt"} als 3D-Kontrollpunkt ${activeControl + 1} übernommen.`
          : `Freier 3D-Kontrollpunkt ${activeControl + 1} gesetzt.`,
      );
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [activeControl]);

  const complete = state.controls.every((c) => c.scene && c.map);
  const affine = useMemo(() => {
    if (!complete) return undefined;
    try {
      return calculateAffine(state.controls);
    } catch {
      return undefined;
    }
  }, [state.controls, complete]);

  const targetScene = useMemo(() => {
    if (!affine) return undefined;
    try {
      return mapToScene(state.target, affine);
    } catch {
      return undefined;
    }
  }, [affine, state.target.lat, state.target.lng]);

  const objectById = (id: string) => objects.find((o) => o.id === id);
  const puzzleScenePoints = state.puzzlePoints
    .map((p) => objectById(p.objectId))
    .filter(Boolean)
    .map((o) => ({ x: o!.position[0], z: o!.position[1], objectId: o!.id, label: o!.label }));

  const centroid = puzzleScenePoints.length === 3 ? triangleCentroid(puzzleScenePoints) : undefined;
  const centroidMap = centroid && affine ? sceneToMap(centroid, affine) : undefined;
  const targetDistance = centroidMap ? metersBetween(centroidMap, state.target) : undefined;

  const save = () => {
    let next = structuredClone(state);
    if (affine) next.affine = affine;
    if (targetScene) next.targetScene = targetScene;
    saveHeumarktCalibration(next);
    setState(next);
    setNotice("Heumarkt-Kalibrierung gespeichert.");
  };

  const recommendThird = () => {
    if (!targetScene || objects.length === 0) {
      setNotice("Zuerst drei Kontrollpunkte kalibrieren.");
      return;
    }
    const a = objectById(state.puzzlePoints[0]!.objectId);
    const b = objectById(state.puzzlePoints[1]!.objectId);
    if (!a || !b) return;
    const desired: HeumarktScenePoint = {
      x: 3 * targetScene.x - a.position[0] - b.position[0],
      z: 3 * targetScene.z - a.position[1] - b.position[1],
    };
    const candidateIds = new Set(HEUMARKT_CHOICE_POINTS.map((point) => point.objectId));
    const allowed = objects.filter((o) => candidateIds.has(o.id) && ![a.id, b.id].includes(o.id));
    const nearest = allowed
      .map((o) => ({ o, d: Math.hypot(o.position[0] - desired.x, o.position[1] - desired.z) }))
      .sort((x, y) => x.d - y.d)[0]?.o;
    if (!nearest) return;
    setState((old) => ({
      ...old,
      puzzlePoints: old.puzzlePoints.map((p) => p.id === "C" ? { ...p, objectId: nearest.id } : p),
    }));
    setNotice(`Nächstes geeignetes Objekt für Punkt C: ${nearest.label ?? nearest.id}.`);
  };

  const choicePoints = HEUMARKT_CHOICE_POINTS
    .map((point) => {
      const object = objects.find((o) => o.id === point.objectId);
      if (!object) return undefined;
      return {
        id: point.id,
        objectId: point.objectId,
        label: point.label,
        x: object.position[0],
        z: object.position[1],
      };
    })
    .filter(Boolean);

  const sendChoicePointsToFrame = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        event: "heumarkt-map:render-choice-points",
        points: choicePoints,
        attemptObjectIds: state.puzzlePoints.map((point) => point.objectId),
        successObjectIds: [],
        wrongObjectIds: [],
        adminPreview: true,
      },
      window.location.origin,
    );
  };

  useEffect(() => {
    if (objects.length === 0) return;
    const timer = window.setTimeout(sendChoicePointsToFrame, 120);
    return () => window.clearTimeout(timer);
  }, [
    objects.length,
    state.puzzlePoints[0]?.objectId,
    state.puzzlePoints[1]?.objectId,
    state.puzzlePoints[2]?.objectId,
  ]);

  const active = state.controls[activeControl]!;

  return (
    <AdminShell
      title="Heumarkt · 3D ↔ Google Maps"
      lead="Kalibriere die historische 3D-Szene mit dem heutigen Heumarkt und plane danach das Dreieck für das Herz."
      action={<Button onClick={save}>Kalibrierung speichern</Button>}
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap gap-2">
            {state.controls.map((c, i) => (
              <Button key={c.id} variant={activeControl === i ? "default" : "outline"} onClick={() => setActiveControl(i)}>
                {i + 1}. {c.label}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Wähle einen Kontrollpunkt. Klicke links das entsprechende Objekt in der 3D-Szene und rechts exakt dieselbe reale Stelle auf Google Maps. Drei Punkte bestimmen Verschiebung, Rotation, Maßstab und Scherung der Szene.
          </p>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <p className="label-mono">3D · {active.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {active.scene ? `${active.scene.label ?? active.scene.objectId} · X ${active.scene.x.toFixed(2)} / Z ${active.scene.z.toFixed(2)}` : "Noch kein 3D-Punkt gewählt"}
              </p>
            </div>
            <iframe
              ref={iframeRef}
              onLoad={() => window.setTimeout(sendChoicePointsToFrame, 120)}
              src="/heumarkt-3d/index.html?mode=calibration&rev=12"
              title="Heumarkt 3D Kalibrierung"
              className="block h-[560px] w-full border-0"
            />
          </section>

          <section className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <p className="label-mono">Google Maps · {active.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {active.map ? `${active.map.lat.toFixed(6)}, ${active.map.lng.toFixed(6)}` : "Klicke die reale Position auf der Karte"}
              </p>
            </div>
            <div className="h-[560px]">
              <GooglePointPicker
                point={active.map}
                target={state.target}
                onChange={(map) => setState((old) => {
                  const next = structuredClone(old);
                  next.controls[activeControl] = { ...next.controls[activeControl]!, map };
                  return next;
                })}
              />
            </div>
          </section>
        </div>

        <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 lg:grid-cols-3">
          <Field label="Ziel · Breitengrad">
            <TextInput type="number" step="any" value={state.target.lat} onChange={(e) => setState((old) => ({ ...old, target: { ...old.target, lat: Number(e.target.value) } }))} />
          </Field>
          <Field label="Ziel · Längengrad">
            <TextInput type="number" step="any" value={state.target.lng} onChange={(e) => setState((old) => ({ ...old, target: { ...old.target, lng: Number(e.target.value) } }))} />
          </Field>
          <Field label="GPS-Radius (m)">
            <TextInput type="number" value={state.target.radius} onChange={(e) => setState((old) => ({ ...old, target: { ...old.target, radius: Number(e.target.value) } }))} />
          </Field>
          <div className="lg:col-span-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Heumarkt Herz:</strong> {state.target.lat.toFixed(6)}, {state.target.lng.toFixed(6)}
            {targetScene ? <> · 3D-Ziel: <strong className="text-foreground">X {targetScene.x.toFixed(2)} / Z {targetScene.z.toFixed(2)}</strong></> : <> · 3D-Ziel wird nach vollständiger Kalibrierung berechnet.</>}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label-mono">Dreiecksplaner</p>
              <p className="mt-1 text-sm text-muted-foreground">Wähle die drei Objekte, die die Spieler finden sollen. Der Schwerpunkt soll möglichst genau auf dem Herz-Baum landen.</p>
            </div>
            <Button variant="outline" onClick={recommendThird}>Punkt C automatisch vorschlagen</Button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {state.puzzlePoints.map((puzzlePoint, index) => (
              <div key={puzzlePoint.id} className="rounded-md border border-border bg-background/40 p-3">
                <p className="font-display text-lg font-bold">Punkt {puzzlePoint.id}</p>
                <select
                  value={puzzlePoint.objectId}
                  onChange={(e) => setState((old) => ({
                    ...old,
                    puzzlePoints: old.puzzlePoints.map((p) => p.id === puzzlePoint.id ? { ...p, objectId: e.target.value } : p),
                  }))}
                  className="mt-2 min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm"
                >
                  {HEUMARKT_CHOICE_POINTS.map((point) => {
                    const object = objectById(point.objectId);
                    return (
                      <option key={point.id} value={point.objectId}>
                        {point.id} · {point.label}{object ? ` · X ${object.position[0].toFixed(1)} / Z ${object.position[1].toFixed(1)}` : ""}
                      </option>
                    );
                  })}
                </select>
                <textarea
                  value={puzzlePoint.clue}
                  onChange={(e) => setState((old) => ({
                    ...old,
                    puzzlePoints: old.puzzlePoints.map((p) => p.id === puzzlePoint.id ? { ...p, clue: e.target.value } : p),
                  }))}
                  className="mt-2 min-h-24 w-full rounded-md border border-border bg-surface p-3 text-sm"
                />
                {objectById(puzzlePoint.objectId) ? <p className="mt-2 text-xs text-muted-foreground">X {objectById(puzzlePoint.objectId)!.position[0].toFixed(2)} · Z {objectById(puzzlePoint.objectId)!.position[1].toFixed(2)}</p> : null}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-border bg-background/40 p-4 text-sm">
            {centroid ? <>
              <p>Schwerpunkt 3D: <strong>X {centroid.x.toFixed(2)} / Z {centroid.z.toFixed(2)}</strong></p>
              {centroidMap ? <p className="mt-1">Übertragen auf Google Maps: <strong>{centroidMap.lat.toFixed(6)}, {centroidMap.lng.toFixed(6)}</strong></p> : null}
              {typeof targetDistance === "number" ? <p className={`mt-1 ${targetDistance <= state.target.radius ? "text-success" : "text-destructive"}`}>Abstand zum Herz-Baum: <strong>{targetDistance.toFixed(1)} m</strong></p> : null}
            </> : <p>Die drei ausgewählten Objekte konnten noch nicht berechnet werden.</p>}
          </div>
        </section>

        {notice ? <p role="status" className="text-sm text-paper">{notice}</p> : null}
      </div>
    </AdminShell>
  );
}
