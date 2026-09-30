import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adventure, storyFragmentById } from "./data";
import type { JournalEntry } from "./types";
import { fieldEvents } from "./events";

interface PlayerState {
  started: boolean;
  startTime: number | null;
  currentStageId: string;
  completedStages: string[];
  completedPuzzles: string[];
  inventory: string[];
  unlockedHints: string[];
  unlockedFeatures: string[];
  unlockedStoryFragments: string[];
  visitedLocations: string[];
  verifiedEnvelopes: string[];
  journal: JournalEntry[];
  soundOn: boolean;
  messages: { id: string; text: string; time: string }[];
  activeEventId: string | null;
  seenEvents: string[];
  heumarktTrianglePoints: string[];
  heumarktTriangleSolved: boolean;
  startEvent: (id: string) => void;
  dismissEvent: () => void;
  begin: () => void;
  reset: () => void;
  toggleSound: () => void;
  visitLocation: (id: string, name: string) => void;
  verifyEnvelope: (id: string, num: number) => void;
  unlockHint: (id: string) => void;
  unlockFeature: (id: string, label?: string) => void;
  unlockStoryFragment: (id: string) => void;
  solvePuzzle: (id: string, title: string) => void;
  completeStage: (id: string) => void;
  addItem: (id: string, name: string) => void;
  sendMessage: (text: string) => void;
  dismissMessage: (id: string) => void;
  advanceStage: () => void;
  resetPuzzle: (id: string) => void;
  setHeumarktTrianglePoints: (ids: string[]) => void;
  solveHeumarktTriangle: () => void;
  resetHeumarktTriangle: () => void;
}

const stamp = () =>
  new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

const entry = (title: string, detail: string): JournalEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  time: stamp(),
  title,
  detail,
});

const initial = {
  started: false,
  startTime: null as number | null,
  currentStageId: adventure.stages[0]!.id,
  completedStages: [] as string[],
  completedPuzzles: [] as string[],
  inventory: [] as string[],
  unlockedHints: [] as string[],
  unlockedFeatures: [] as string[],
  unlockedStoryFragments: [] as string[],
  visitedLocations: [] as string[],
  verifiedEnvelopes: [] as string[],
  journal: [] as JournalEntry[],
  soundOn: false,
  messages: [] as { id: string; text: string; time: string }[],
  activeEventId: null as string | null,
  seenEvents: [] as string[],
  heumarktTrianglePoints: [] as string[],
  heumarktTriangleSolved: false,
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
                  entry("EXPEDITION GESTARTET", adventure.title),
                  ...s.journal,
                ],
              },
        ),
      reset: () => set({ ...initial }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      startEvent: (id) =>
        set((s) =>
          fieldEvents.some((event) => event.id === id)
            ? {
                activeEventId: id,
                seenEvents: s.seenEvents.includes(id)
                  ? s.seenEvents
                  : [...s.seenEvents, id],
                journal: [
                  entry(
                    "EREIGNISKARTE",
                    fieldEvents.find((event) => event.id === id)?.title ?? "Ereignis",
                  ),
                  ...s.journal,
                ],
              }
            : s,
        ),
      dismissEvent: () => set({ activeEventId: null }),
      sendMessage: (text) =>
        set((s) => ({
          messages: [{ id: `${Date.now()}`, text, time: stamp() }, ...s.messages],
        })),
      dismissMessage: (id) =>
        set((s) => ({ messages: s.messages.filter((message) => message.id !== id) })),
      advanceStage: () =>
        set((s) => {
          const index = adventure.stages.findIndex(
            (stage) => stage.id === s.currentStageId,
          );
          const next = adventure.stages[index + 1];
          return next
            ? {
                currentStageId: next.id,
                journal: [entry("ETAPPE FREIGEGEBEN", next.title), ...s.journal],
              }
            : s;
        }),
      resetPuzzle: (id) =>
        set((s) => ({
          completedPuzzles: s.completedPuzzles.filter(
            (puzzleId) => puzzleId !== id,
          ),
        })),
      setHeumarktTrianglePoints: (ids) =>
        set({ heumarktTrianglePoints: [...ids] }),
      solveHeumarktTriangle: () =>
        set((s) =>
          s.heumarktTriangleSolved
            ? s
            : {
                heumarktTriangleSolved: true,
                journal: [
                  entry("HEUMARKT REKONSTRUIERT", "Drei Archivpunkte verbunden. Ziel in die Gegenwart übertragen."),
                  ...s.journal,
                ],
              },
        ),
      resetHeumarktTriangle: () =>
        set({ heumarktTrianglePoints: [], heumarktTriangleSolved: false }),
      visitLocation: (id, name) =>
        set((s) =>
          s.visitedLocations.includes(id)
            ? s
            : {
                visitedLocations: [...s.visitedLocations, id],
                ...(s.seenEvents.includes("field-navigator")
                  ? {}
                  : {
                      activeEventId: "field-navigator",
                      seenEvents: [...s.seenEvents, "field-navigator"],
                    }),
                journal: [
                  entry(`${name.toUpperCase()} ENTDECKT`, "Ort bestätigt."),
                  ...s.journal,
                ],
              },
        ),
      verifyEnvelope: (id, num) =>
        set((s) =>
          s.verifiedEnvelopes.includes(id)
            ? s
            : {
                verifiedEnvelopes: [...s.verifiedEnvelopes, id],
                journal: [
                  entry(`UMSCHLAG NR. 0${num} GEFUNDEN`, "Code bestätigt."),
                  ...s.journal,
                ],
              },
        ),
      unlockHint: (id) =>
        set((s) =>
          s.unlockedHints.includes(id)
            ? s
            : { unlockedHints: [...s.unlockedHints, id] },
        ),
      unlockFeature: (id, label) =>
        set((s) =>
          s.unlockedFeatures.includes(id)
            ? s
            : {
                unlockedFeatures: [...s.unlockedFeatures, id],
                journal: [
                  entry("NEUER BEREICH FREIGESCHALTET", label ?? id.toUpperCase()),
                  ...s.journal,
                ],
              },
        ),
      unlockStoryFragment: (id) =>
        set((s) => {
          if (s.unlockedStoryFragments.includes(id)) return s;
          const fragment = storyFragmentById(id);
          return {
            unlockedStoryFragments: [...s.unlockedStoryFragments, id],
            journal: [
              entry(
                fragment?.title.toUpperCase() ?? "ARCHIVFRAGMENT",
                fragment?.archiveCode
                  ? `${fragment.archiveCode} · Archivfragment wiederhergestellt.`
                  : "Archivfragment wiederhergestellt.",
              ),
              ...s.journal,
            ],
          };
        }),
      solvePuzzle: (id, title) =>
        set((s) =>
          s.completedPuzzles.includes(id)
            ? s
            : {
                completedPuzzles: [...s.completedPuzzles, id],
                ...(s.seenEvents.includes("field-supply")
                  ? {}
                  : {
                      activeEventId: "field-supply",
                      seenEvents: [...s.seenEvents, "field-supply"],
                    }),
                journal: [
                  entry(`${title.toUpperCase()} GELÖST`, "Rätsel gelöst."),
                  ...s.journal,
                ],
              },
        ),
      addItem: (id, name) =>
        set((s) =>
          s.inventory.includes(id)
            ? s
            : {
                inventory: [...s.inventory, id],
                ...(s.seenEvents.includes("field-pitch")
                  ? {}
                  : {
                      activeEventId: "field-pitch",
                      seenEvents: [...s.seenEvents, "field-pitch"],
                    }),
                journal: [
                  entry(`${name.toUpperCase()} GESAMMELT`, "Zum Inventar hinzugefügt."),
                  ...s.journal,
                ],
              },
        ),
      completeStage: (id) => {
        const s = get();
        if (s.completedStages.includes(id)) return;
        const idx = adventure.stages.findIndex((st) => st.id === id);
        const stage = adventure.stages[idx];
        if (!stage) return;
        const next = adventure.stages[idx + 1];
        set({
          completedStages: [...s.completedStages, id],
          currentStageId: next ? next.id : id,
          journal: [
            entry(
              `ETAPPE ${String(stage.number).padStart(2, "0")} ABGESCHLOSSEN`,
              stage.title,
            ),
            ...s.journal,
          ],
        });
      },
    }),
    {
      name: "hidden-path-progress",
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as Partial<PlayerState> | undefined;
        return {
          ...initial,
          ...state,
          unlockedFeatures: state?.unlockedFeatures ?? [],
          unlockedStoryFragments: state?.unlockedStoryFragments ?? [],
          heumarktTrianglePoints: state?.heumarktTrianglePoints ?? [],
          heumarktTriangleSolved: state?.heumarktTriangleSolved ?? false,
        };
      },
    },
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
