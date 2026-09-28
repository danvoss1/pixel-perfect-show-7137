import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { InteractiveRoom } from "@/components/game/InteractiveRoom";
import { PuzzleSuccess } from "@/components/game/PuzzleSuccess";
import { usePlayer } from "@/game/store";
import { puzzleById } from "@/game/data";

export const Route = createFileRoute("/room")({
  head: () => ({
    meta: [
      { title: "Search The Room — The Hidden Path" },
      { name: "description", content: "An escape-room search: something in this room does not belong." },
      { property: "og:title", content: "Search The Room — The Hidden Path" },
      { property: "og:description", content: "Something in this room does not belong. Find it." },
    ],
  }),
  component: RoomPage,
});

function RoomPage() {
  const [resetSignal, setResetSignal] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const solvePuzzle = usePlayer((s) => s.solvePuzzle);
  const puzzle = puzzleById("p-room")!;

  return (
    <GameShell bare>
      <div className="relative flex h-[calc(100vh-56px)] flex-col lg:h-screen">
        <header className="px-5 pt-5">
          <h1 className="font-display text-2xl font-bold uppercase">Search the room</h1>
          <p className="text-sm text-muted-foreground">Something here does not belong.</p>
        </header>

        <div className="flex-1 p-3 sm:p-5">
          <InteractiveRoom
            resetSignal={resetSignal}
            onObjectFound={(objectId) => {
              if (objectId === "map") {
                solvePuzzle(puzzle.id, puzzle.title);
                setDone(true);
              }
            }}
          />
        </div>

        <div className="flex gap-2 px-3 pb-4 sm:px-5">
          <button
            onClick={() => setResetSignal((n) => n + 1)}
            className="min-h-[48px] flex-1 rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.18em]"
          >
            Reset view
          </button>
          <button
            onClick={() => setShowHint((h) => !h)}
            className="min-h-[48px] flex-1 rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.18em]"
          >
            Hint
          </button>
          <Link
            to="/inventory"
            className="grid min-h-[48px] flex-1 place-items-center rounded-md border border-border font-display text-xs font-bold uppercase tracking-[0.18em]"
          >
            Inventory
          </Link>
        </div>

        {showHint ? (
          <p className="px-5 pb-5 text-center font-hand text-xl text-paper">
            {puzzle.hints[0]?.text}
          </p>
        ) : null}
      </div>

      <PuzzleSuccess
        show={done}
        title="Object recovered"
        message="A USB stick was taped behind the framed map."
        continueLabel="Back to the stage"
        onContinue={() => setDone(false)}
      />
    </GameShell>
  );
}
