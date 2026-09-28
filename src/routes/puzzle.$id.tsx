import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { Label, LockedContent, Panel, Reveal } from "@/components/game/primitives";
import { HintPanel } from "@/components/game/HintPanel";
import { PuzzleSuccess } from "@/components/game/PuzzleSuccess";
import { CodeInput } from "@/components/puzzles/CodeInput";
import { WordleGame } from "@/components/puzzles/WordleGame";
import { SlidingPuzzle } from "@/components/puzzles/SlidingPuzzle";
import { FlappyGame } from "@/components/puzzles/FlappyGame";
import { RoutePuzzle } from "@/components/puzzles/RoutePuzzle";
import { SymbolPuzzle } from "@/components/puzzles/SymbolPuzzle";
import { puzzleById, stageById } from "@/game/data";
import { usePlayer } from "@/game/store";
import type {
  CodeConfig,
  FlappyConfig,
  RouteConfig,
  SlidingConfig,
  SymbolsConfig,
  WordleConfig,
} from "@/game/types";
import photo from "@/assets/photo-bridge.jpg";

export const Route = createFileRoute("/puzzle/$id")({
  head: ({ params }) => {
    const p = puzzleById(params.id);
    const title = p?.title ?? "Puzzle";
    const description = p?.tagline ?? "A challenge from The Hidden Path expedition.";
    return {
      meta: [
        { title: `${title} — The Hidden Path` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PuzzlePage,
});

function PuzzlePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const puzzle = puzzleById(id);
  const solvePuzzle = usePlayer((s) => s.solvePuzzle);
  const solvedList = usePlayer((s) => s.completedPuzzles);
  const [celebrate, setCelebrate] = useState(false);

  const solved = puzzle ? solvedList.includes(puzzle.id) : false;

  const onSolved = useCallback(() => {
    if (!puzzle) return;
    solvePuzzle(puzzle.id, puzzle.title);
    setCelebrate(true);
  }, [puzzle, solvePuzzle]);

  if (!puzzle) {
    return (
      <GameShell>
        <LockedContent note="No such transmission exists." />
      </GameShell>
    );
  }

  const stage = stageById(puzzle.stageId);

  return (
    <GameShell>
      <Reveal>
        <Label>
          {stage ? `Stage ${String(stage.number).padStart(2, "0")}` : "Side entry"} · {puzzle.type}
        </Label>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-none sm:text-5xl">
          {puzzle.title}
        </h1>
        <p className="mt-3 font-hand text-2xl text-paper">“{puzzle.tagline}”</p>
      </Reveal>

      <div className="mt-8">
        {puzzle.type === "wordle" ? (
          <WordleGame
            {...(puzzle.config as WordleConfig)}
            solved={solved}
            onSolved={onSolved}
          />
        ) : null}

        {puzzle.type === "sliding" ? (
          <SlidingPuzzle
            grid={(puzzle.config as SlidingConfig).grid}
            image={photo}
            solved={solved}
            onSolved={onSolved}
          />
        ) : null}

        {puzzle.type === "flappy" ? (
          <FlappyGame
            {...(puzzle.config as FlappyConfig)}
            solved={solved}
            onSolved={onSolved}
          />
        ) : null}

        {puzzle.type === "code" ? (
          <CodeInput
            length={(puzzle.config as CodeConfig).length}
            kind={(puzzle.config as CodeConfig).kind}
            expected={(puzzle.config as CodeConfig).code}
            onSolved={onSolved}
          />
        ) : null}

        {puzzle.type === "route" ? (
          <RoutePuzzle config={puzzle.config as RouteConfig} solved={solved} onSolved={onSolved} />
        ) : null}

        {puzzle.type === "symbols" ? (
          <SymbolPuzzle
            config={puzzle.config as SymbolsConfig}
            solved={solved}
            onSolved={onSolved}
          />
        ) : null}

        {puzzle.type === "room" ? (
          <Panel className="text-center">
            <p className="text-sm text-muted-foreground">
              This challenge takes place inside the room itself.
            </p>
            <Link
              to="/room"
              className="mt-4 grid min-h-[48px] place-items-center rounded-md bg-primary font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
            >
              Enter the room
            </Link>
          </Panel>
        ) : null}
      </div>

      {solved && puzzle.type === "sliding" ? (
        <Panel className="mt-6">
          <Label>Hidden beneath the image</Label>
          <p className="mt-2 font-hand text-2xl text-paper">
            {(puzzle.config as SlidingConfig).reveal}
          </p>
        </Panel>
      ) : null}

      <div className="mt-6">
        <HintPanel puzzleId={puzzle.id} hints={puzzle.hints} />
      </div>

      {stage ? (
        <Link
          to="/stage/$id"
          params={{ id: stage.id }}
          className="mt-6 block text-center label-mono text-primary"
        >
          Back to Stage {String(stage.number).padStart(2, "0")}
        </Link>
      ) : null}

      <PuzzleSuccess
        show={celebrate}
        title={puzzle.type === "wordle" ? "Code decrypted" : "Mission complete"}
        message="The trail continues."
        continueLabel={stage ? "Return to the stage" : "Continue"}
        onContinue={() => {
          setCelebrate(false);
          if (stage) navigate({ to: "/stage/$id", params: { id: stage.id } });
        }}
      />
    </GameShell>
  );
}
