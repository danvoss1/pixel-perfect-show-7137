import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adventure, storyFragmentById, storyFragments } from "./data";
import type {
  HeumarktFlowPhase,
  InventoryItemState,
  JournalEntry,
} from "./types";
import { fieldEvents } from "./events";

interface PlayerState {
  started: boolean;
  startTime: number | null;
  currentStageId: string;
  completedStages: string[];
  completedPuzzles: string[];
  inventory: string[];
  itemStates: Record<string, InventoryItemState>;
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
  heumarktFlowPhase: HeumarktFlowPhase;
  storyIntroSeen: boolean;
  acknowledgeStoryIntro: () => void;
  scannedQrMarks: string[];
  registerQrMark: (id: string) => void;
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
  setItemState: (id: string, patch: InventoryItemState) => void;
  sendMessage: (text: string) => void;
  dismissMessage: (id: string) => void;
  advanceStage: () => void;
  resetPuzzle: (id: string) => void;
  setHeumarktTrianglePoints: (ids: string[]) => void;
  solveHeumarktTriangle: () => void;
  resetHeumarktTriangle: () => void;
  setHeumarktFlowPhase: (phase: HeumarktFlowPhase) => void;
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
  itemStates: {} as Record<string, InventoryItemState>,
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
  heumarktFlowPhase: "triangle" as HeumarktFlowPhase,
  storyIntroSeen: false,
  scannedQrMarks: [] as string[],
};

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      ...initial,
      begin: () =>
        set((state) =>
          state.started
            ? state
            : {
                started: true,
                startTime: Date.now(),
                journal: [entry("EXPEDITION GESTARTET", adventure.title), ...state.journal],
              },
        ),
      reset: () => set({ ...initial }),
      acknowledgeStoryIntro: () => set({ storyIntroSeen: true }),
      registerQrMark: (id) =>
        set((state) => ({
          scannedQrMarks: state.scannedQrMarks.includes(id)
            ? state.scannedQrMarks
            : [...state.scannedQrMarks, id],
          journal: state.scannedQrMarks.includes(id)
            ? state.journal
            : [entry("MARKIERUNG GESCANNT", id), ...state.journal],
        })),
      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
      startEvent: (id) =>
        set((state) =>
          fieldEvents.some((event) => event.id === id)
            ? {
                activeEventId: id,
                seenEvents: state.seenEvents.includes(id)
                  ? state.seenEvents
                  : [...state.seenEvents, id],
                journal: [
                  entry(
                    "EREIGNISKARTE",
                    fieldEvents.find((event) => event.id === id)?.title ?? "Ereignis",
                  ),
                  ...state.journal,
                ],
              }
            : state,
        ),
      dismissEvent: () => set({ activeEventId: null }),
      sendMessage: (text) =>
        set((state) => ({
          messages: [{ id: `${Date.now()}`, text, time: stamp() }, ...state.messages],
        })),
      dismissMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        })),
      advanceStage: () =>
        set((state) => {
          const index = adventure.stages.findIndex(
            (stage) => stage.id === state.currentStageId,
          );
          const next = adventure.stages[index + 1];
          return next
            ? {
                currentStageId: next.id,
                journal: [entry("ETAPPE FREIGEGEBEN", next.title), ...state.journal],
              }
            : state;
        }),
      resetPuzzle: (id) =>
        set((state) => ({
          completedPuzzles: state.completedPuzzles.filter(
            (puzzleId) => puzzleId !== id,
          ),
        })),
      setHeumarktTrianglePoints: (ids) =>
        set({ heumarktTrianglePoints: [...ids] }),
      solveHeumarktTriangle: () =>
        set((state) =>
          state.heumarktTriangleSolved
            ? state
            : {
                heumarktTriangleSolved: true,
                heumarktFlowPhase: "target-revealed",
                journal: [
                  entry(
                    "HEUMARKT REKONSTRUIERT",
                    "Drei Archivpunkte verbunden. Ziel in die Gegenwart übertragen.",
                  ),
                  ...state.journal,
                ],
              },
        ),
      resetHeumarktTriangle: () =>
        set({
          heumarktTrianglePoints: [],
          heumarktTriangleSolved: false,
          heumarktFlowPhase: "triangle",
        }),
      setHeumarktFlowPhase: (phase) => set({ heumarktFlowPhase: phase }),
      visitLocation: (id, name) =>
        set((state) =>
          state.visitedLocations.includes(id)
            ? state
            : {
                visitedLocations: [...state.visitedLocations, id],
                ...(state.seenEvents.includes("field-navigator")
                  ? {}
                  : {
                      activeEventId: "field-navigator",
                      seenEvents: [...state.seenEvents, "field-navigator"],
                    }),
                journal: [
                  entry(`${name.toUpperCase()} ENTDECKT`, "Ort bestätigt."),
                  ...state.journal,
                ],
              },
        ),
      verifyEnvelope: (id, num) =>
        set((state) =>
          state.verifiedEnvelopes.includes(id)
            ? state
            : {
                verifiedEnvelopes: [...state.verifiedEnvelopes, id],
                journal: [
                  entry(`UMSCHLAG NR. 0${num} GEFUNDEN`, "Code bestätigt."),
                  ...state.journal,
                ],
              },
        ),
      unlockHint: (id) =>
        set((state) =>
          state.unlockedHints.includes(id)
            ? state
            : {
                unlockedHints: [...state.unlockedHints, id],
                journal: [
                  entry("HINWEIS FREIGESCHALTET", id),
                  ...state.journal,
                ],
              },
        ),
      unlockFeature: (id, label) =>
        set((state) =>
          state.unlockedFeatures.includes(id)
            ? state
            : {
                unlockedFeatures: [...state.unlockedFeatures, id],
                journal: [
                  entry("NEUER BEREICH FREIGESCHALTET", label ?? id.toUpperCase()),
                  ...state.journal,
                ],
              },
        ),
      unlockStoryFragment: (id) =>
        set((state) => {
          if (state.unlockedStoryFragments.includes(id)) return state;
          const fragment = storyFragmentById(id);
          return {
            unlockedStoryFragments: [...state.unlockedStoryFragments, id],
            journal: [
              entry(
                fragment?.title.toUpperCase() ?? "ARCHIVFRAGMENT",
                fragment?.archiveCode
                  ? `${fragment.archiveCode} · Archivfragment wiederhergestellt.`
                  : "Archivfragment wiederhergestellt.",
              ),
              ...state.journal,
            ],
          };
        }),
      solvePuzzle: (id, title) =>
        set((state) =>
          state.completedPuzzles.includes(id)
            ? state
            : {
                completedPuzzles: [...state.completedPuzzles, id],
                ...(state.seenEvents.includes("field-supply")
                  ? {}
                  : {
                      activeEventId: "field-supply",
                      seenEvents: [...state.seenEvents, "field-supply"],
                    }),
                journal: [
                  entry(`${title.toUpperCase()} GELÖST`, "Rätsel gelöst."),
                  ...state.journal,
                ],
              },
        ),
      addItem: (id, name) =>
        set((state) =>
          state.inventory.includes(id)
            ? state
            : {
                inventory: [...state.inventory, id],
                ...(state.seenEvents.includes("field-pitch")
                  ? {}
                  : {
                      activeEventId: "field-pitch",
                      seenEvents: [...state.seenEvents, "field-pitch"],
                    }),
                journal: [
                  entry(`${name.toUpperCase()} GESAMMELT`, "Zum Inventar hinzugefügt."),
                  ...state.journal,
                ],
              },
        ),
      setItemState: (id, patch) =>
        set((state) => ({
          itemStates: {
            ...state.itemStates,
            [id]: {
              ...(state.itemStates[id] ?? {}),
              ...patch,
            },
          },
        })),
      completeStage: (id) => {
        const state = get();
        if (state.completedStages.includes(id)) return;
        const index = adventure.stages.findIndex((stage) => stage.id === id);
        const stage = adventure.stages[index];
        if (!stage) return;
        const next = adventure.stages[index + 1];
        const recoveredFragments = storyFragments.filter(
          (fragment) =>
            fragment.stageId === id &&
            !state.unlockedStoryFragments.includes(fragment.id),
        );

        set({
          completedStages: [...state.completedStages, id],
          currentStageId: next ? next.id : id,
          unlockedStoryFragments: [
            ...state.unlockedStoryFragments,
            ...recoveredFragments.map((fragment) => fragment.id),
          ],
          journal: [
            ...recoveredFragments.map((fragment) =>
              entry(
                fragment.title.toUpperCase(),
                `${fragment.archiveCode ?? "ARCHIV"} · Archivfragment wiederhergestellt.`,
              ),
            ),
            entry(
              `ETAPPE ${String(stage.number).padStart(2, "0")} ABGESCHLOSSEN`,
              stage.title,
            ),
            ...(next ? [entry("ETAPPE FREIGEGEBEN", next.title)] : []),
            ...state.journal,
          ],
        });
      },
    }),
    {
      name: "hidden-path-progress",
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as Partial<PlayerState> | undefined;
        const triangleSolved = state?.heumarktTriangleSolved ?? false;
        return {
          ...initial,
          ...state,
          itemStates: state?.itemStates ?? {},
          unlockedFeatures: state?.unlockedFeatures ?? [],
          unlockedStoryFragments: state?.unlockedStoryFragments ?? [],
          heumarktTrianglePoints: state?.heumarktTrianglePoints ?? [],
          heumarktTriangleSolved: triangleSolved,
          heumarktFlowPhase:
            state?.heumarktFlowPhase ??
            (triangleSolved ? "target-revealed" : "triangle"),
        };
      },
    },
  ),
);

export function useStageStatus(stageId: string) {
  const completed = usePlayer((state) => state.completedStages);
  const current = usePlayer((state) => state.currentStageId);
  if (completed.includes(stageId)) return "completed" as const;
  if (current === stageId) return "active" as const;
  return "locked" as const;
}

export function useElapsed() {
  const startTime = usePlayer((state) => state.startTime);
  if (!startTime) return "00:00:00";
  const total = Math.floor((Date.now() - startTime) / 1000);
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
