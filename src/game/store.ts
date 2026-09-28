import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adventure } from "./data";
import type { JournalEntry } from "./types";

interface PlayerState {
  started: boolean;
  startTime: number | null;
  currentStageId: string;
  completedStages: string[];
  completedPuzzles: string[];
  inventory: string[];
  unlockedHints: string[];
  visitedLocations: string[];
  verifiedEnvelopes: string[];
  journal: JournalEntry[];
  soundOn: boolean;
  begin: () => void;
  reset: () => void;
  toggleSound: () => void;
  visitLocation: (id: string, name: string) => void;
  verifyEnvelope: (id: string, num: number) => void;
  unlockHint: (id: string) => void;
  solvePuzzle: (id: string, title: string) => void;
  completeStage: (id: string) => void;
  addItem: (id: string, name: string) => void;
}

const stamp = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const entry = (title: string, detail: string): JournalEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  time: stamp(),
  title,
  detail,
});

const initial = {
  started: false,
  startTime: null as number | null,
  currentStageId: adventure.stages[0].id,
  completedStages: [] as string[],
  completedPuzzles: [] as string[],
  inventory: [] as string[],
  unlockedHints: [] as string[],
  visitedLocations: [] as string[],
  verifiedEnvelopes: [] as string[],
  journal: [] as JournalEntry[],
  soundOn: false,
};

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      ...initial,
      begin: () =>
        set((s) =>
          s.started
            ? s
            : {
                started: true,
                startTime: Date.now(),
                journal: [
                  entry("EXPEDITION STARTED", adventure.title),
                  ...s.journal,
                ],
              },
        ),
      reset: () => set({ ...initial }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      visitLocation: (id, name) =>
        set((s) =>
          s.visitedLocations.includes(id)
            ? s
            : {
                visitedLocations: [...s.visitedLocations, id],
                journal: [entry(`${name.toUpperCase()} DISCOVERED`, "Location confirmed."), ...s.journal],
              },
        ),
      verifyEnvelope: (id, num) =>
        set((s) =>
          s.verifiedEnvelopes.includes(id)
            ? s
            : {
                verifiedEnvelopes: [...s.verifiedEnvelopes, id],
                journal: [entry(`ENVELOPE #0${num} FOUND`, "Code verified."), ...s.journal],
              },
        ),
      unlockHint: (id) =>
        set((s) =>
          s.unlockedHints.includes(id) ? s : { unlockedHints: [...s.unlockedHints, id] },
        ),
      solvePuzzle: (id, title) =>
        set((s) =>
          s.completedPuzzles.includes(id)
            ? s
            : {
                completedPuzzles: [...s.completedPuzzles, id],
                journal: [entry(`${title.toUpperCase()} SOLVED`, "Puzzle completed."), ...s.journal],
              },
        ),
      addItem: (id, name) =>
        set((s) =>
          s.inventory.includes(id)
            ? s
            : {
                inventory: [...s.inventory, id],
                journal: [entry(`${name.toUpperCase()} COLLECTED`, "Added to inventory."), ...s.journal],
              },
        ),
      completeStage: (id) => {
        const s = get();
        if (s.completedStages.includes(id)) return;
        const idx = adventure.stages.findIndex((st) => st.id === id);
        const stage = adventure.stages[idx];
        const next = adventure.stages[idx + 1];
        set({
          completedStages: [...s.completedStages, id],
          currentStageId: next ? next.id : id,
          journal: [
            entry(`STAGE ${String(stage.number).padStart(2, "0")} COMPLETE`, stage.title),
            ...s.journal,
          ],
        });
      },
    }),
    { name: "hidden-path-progress" },
  ),
);

export function useStageStatus(stageId: string) {
  const completed = usePlayer((s) => s.completedStages);
  const current = usePlayer((s) => s.currentStageId);
  if (completed.includes(stageId)) return "completed" as const;
  if (current === stageId) return "active" as const;
  return "locked" as const;
}

export function useElapsed() {
  const startTime = usePlayer((s) => s.startTime);
  if (!startTime) return "00:00:00";
  const total = Math.floor((Date.now() - startTime) / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const sec = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
