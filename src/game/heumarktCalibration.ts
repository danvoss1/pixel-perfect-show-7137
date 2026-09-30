export type HeumarktMapPoint = { lat: number; lng: number };
export type HeumarktScenePoint = { x: number; z: number; objectId?: string; label?: string };
export type HeumarktControlPoint = {
  id: string;
  label: string;
  scene?: HeumarktScenePoint;
  map?: HeumarktMapPoint;
};

export type HeumarktAffine = {
  latX: number;
  latZ: number;
  latC: number;
  lngX: number;
  lngZ: number;
  lngC: number;
};

export type HeumarktPuzzlePoint = {
  id: "A" | "B" | "C";
  objectId: string;
  clue: string;
};

export type HeumarktChoicePoint = {
  id: string;
  objectId: string;
  label: string;
};

export const HEUMARKT_CHOICE_POINTS: HeumarktChoicePoint[] = [
  { id: "P1", objectId: "statue-heumarkt", label: "Reiterstatue" },
  { id: "P2", objectId: "bridge-central", label: "Brücke" },
  { id: "P3", objectId: "gate-heumarkt", label: "Eingang Heumarkt" },
  { id: "P4", objectId: "zunfthaus", label: "Zunfthaus" },
  { id: "P5", objectId: "stapelhaus", label: "Stapelhaus" },
  { id: "P6", objectId: "carousel", label: "Karussell" },
  { id: "P7", objectId: "stall-left-23", label: "Stand 23" },
  { id: "P8", objectId: "wc", label: "WC-Haus" },
  { id: "P9", objectId: "gate-wattogasse", label: "Eingang Wattogasse" },
  { id: "P10", objectId: "south-pavilion", label: "Pavillon im Süden" },
];

export type HeumarktCalibrationState = {
  version: 1;
  target: HeumarktMapPoint & { name: string; radius: number };
  controls: HeumarktControlPoint[];
  affine?: HeumarktAffine;
  targetScene?: HeumarktScenePoint;
  puzzlePoints: HeumarktPuzzlePoint[];
};

export const HEUMARKT_CALIBRATION_KEY = "hidden-path-heumarkt-calibration-v1";

export const DEFAULT_HEUMARKT_CALIBRATION: HeumarktCalibrationState = {
  version: 1,
  target: {
    name: "Heumarkt Herz",
    lat: 50.936955,
    lng: 6.960379,
    radius: 10,
  },
  controls: [
    {
      id: "cp-statue",
      label: "Reiterstatue",
      scene: { x: 26, z: 28, objectId: "statue-heumarkt", label: "Reiterstatue Heumarkt" },
      map: { lat: 50.93626, lng: 6.96068 },
    },
    { id: "cp-2", label: "Kontrollpunkt 2" },
    { id: "cp-3", label: "Kontrollpunkt 3" },
  ],
  puzzlePoints: [
    {
      id: "A",
      objectId: "statue-heumarkt",
      clue: "Das Eis zieht seine Kreise um ihn, doch er selbst bewegt sich nie.",
    },
    {
      id: "B",
      objectId: "gate-heumarkt",
      clue: "Jede vergangene Welt hatte einen Eingang. Findet den Beginn des Winterpfads.",
    },
    {
      id: "C",
      objectId: "stall-left-23",
      clue: "Eine Zahl begleitet euch seit dem Beginn der Expedition. Findet sie auch in dieser vergangenen Welt.",
    },
  ],
};

export function loadHeumarktCalibration(): HeumarktCalibrationState {
  if (typeof window === "undefined") return DEFAULT_HEUMARKT_CALIBRATION;
  try {
    const raw = window.localStorage.getItem(HEUMARKT_CALIBRATION_KEY);
    if (!raw) return structuredClone(DEFAULT_HEUMARKT_CALIBRATION);
    const parsed = JSON.parse(raw) as HeumarktCalibrationState;
    return {
      ...structuredClone(DEFAULT_HEUMARKT_CALIBRATION),
      ...parsed,
      target: { ...DEFAULT_HEUMARKT_CALIBRATION.target, ...parsed.target },
      controls: parsed.controls?.length === 3 ? parsed.controls : structuredClone(DEFAULT_HEUMARKT_CALIBRATION.controls),
      puzzlePoints: parsed.puzzlePoints?.length === 3 ? parsed.puzzlePoints : structuredClone(DEFAULT_HEUMARKT_CALIBRATION.puzzlePoints),
    };
  } catch {
    return structuredClone(DEFAULT_HEUMARKT_CALIBRATION);
  }
}

export function saveHeumarktCalibration(value: HeumarktCalibrationState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HEUMARKT_CALIBRATION_KEY, JSON.stringify(value));
}

function solve3x3(matrix: number[][], values: number[]) {
  const a = matrix.map((row, i) => [...row, values[i]!]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(a[row]![col]!) > Math.abs(a[pivot]![col]!)) pivot = row;
    }
    if (Math.abs(a[pivot]![col]!) < 1e-12) throw new Error("Kontrollpunkte sind geometrisch nicht geeignet.");
    [a[col], a[pivot]] = [a[pivot]!, a[col]!];
    const div = a[col]![col]!;
    for (let k = col; k < 4; k++) a[col]![k] /= div;
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = a[row]![col]!;
      for (let k = col; k < 4; k++) a[row]![k] -= factor * a[col]![k]!;
    }
  }
  return [a[0]![3]!, a[1]![3]!, a[2]![3]!] as const;
}

export function calculateAffine(controls: HeumarktControlPoint[]): HeumarktAffine {
  if (controls.length !== 3 || controls.some((c) => !c.scene || !c.map)) {
    throw new Error("Es werden drei vollständige Kontrollpunkte benötigt.");
  }
  const m = controls.map((c) => [c.scene!.x, c.scene!.z, 1]);
  const lat = solve3x3(m, controls.map((c) => c.map!.lat));
  const lng = solve3x3(m, controls.map((c) => c.map!.lng));
  return { latX: lat[0], latZ: lat[1], latC: lat[2], lngX: lng[0], lngZ: lng[1], lngC: lng[2] };
}

export function sceneToMap(point: HeumarktScenePoint, affine: HeumarktAffine): HeumarktMapPoint {
  return {
    lat: affine.latX * point.x + affine.latZ * point.z + affine.latC,
    lng: affine.lngX * point.x + affine.lngZ * point.z + affine.lngC,
  };
}

export function mapToScene(point: HeumarktMapPoint, affine: HeumarktAffine): HeumarktScenePoint {
  const lat = point.lat - affine.latC;
  const lng = point.lng - affine.lngC;
  const det = affine.latX * affine.lngZ - affine.latZ * affine.lngX;
  if (Math.abs(det) < 1e-14) throw new Error("Kalibrierung kann nicht invertiert werden.");
  return {
    x: (lat * affine.lngZ - affine.latZ * lng) / det,
    z: (affine.latX * lng - lat * affine.lngX) / det,
  };
}

export function triangleCentroid(points: HeumarktScenePoint[]): HeumarktScenePoint {
  if (points.length !== 3) throw new Error("Für den Schwerpunkt werden genau drei Punkte benötigt.");
  return {
    x: (points[0]!.x + points[1]!.x + points[2]!.x) / 3,
    z: (points[0]!.z + points[1]!.z + points[2]!.z) / 3,
  };
}

export function metersBetween(a: HeumarktMapPoint, b: HeumarktMapPoint) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
