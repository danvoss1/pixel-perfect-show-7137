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
import { MastermindGame } from "@/components/puzzles/MastermindGame";
import { SimonGame } from "@/components/puzzles/SimonGame";
import { MorseGame } from "@/components/puzzles/MorseGame";
import { MinesweeperGame } from "@/components/puzzles/MinesweeperGame";
import { CircuitGame } from "@/components/puzzles/CircuitGame";
import { adventure, puzzleById, stageById } from "@/game/data";
import { usePlayer } from "@/game/store";
import { puzzleTypeLabel } from "@/game/labels";
import type {
  CodeConfig,
  FlappyConfig,
  MastermindConfig,
  SimonConfig,
  MorseConfig,
  MinesweeperConfig,
  CircuitConfig,
  RouteConfig,
  SlidingConfig,
  SymbolsConfig,
  WordleConfig,
} from "@/game/types";
import photo from "@/assets/photo-bridge.jpg";

export const Route = createFileRoute("/puzzle/$id")({
  head: ({ params }) => {
    const p = puzzleById(params.id);
    const title = p?.title ?? "Rätsel";
    const description = p?.tagline ?? "Eine Herausforderung der Expedition „Der verborgene Pfad“.";
    return {
      meta: [
        { title: `${title} — Der verborgene Pfad` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
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
  const currentStageId = usePlayer((s) => s.currentStageId);
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
        <LockedContent note="Diese Nachricht existiert nicht." />
      </GameShell>
    );
  }

  const stage = stageById(puzzle.stageId);
  const currentStage = adventure.stages.find((entry) => entry.id === currentStageId);
  if (stage && currentStage && stage.number > currentStage.number) {
    return <GameShell><LockedContent note="Diese Spur ist noch versiegelt. Folge zuerst der aktuellen Etappe." /><Link to="/adventure" className="mt-6 block text-center label-mono text-primary">Zur Etappenübersicht</Link></GameShell>;
  }

  return (
    <GameShell>
      <Reveal>
        <Label>
          {stage ? `Etappe ${String(stage.number).padStart(2, "0")}` : "Nebenspur"} · {puzzleTypeLabel[puzzle.type]}
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
              Diese Herausforderung wartet im Raum.
            </p>
            <Link
              to="/room"
              className="mt-4 grid min-h-[48px] place-items-center rounded-md bg-primary font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
            >
              Raum betreten
            </Link>
          </Panel>
        ) : null}
        {puzzle.type === "mastermind" && <MastermindGame config={puzzle.config as MastermindConfig} solved={solved} onSolved={onSolved} />}
        {puzzle.type === "simon" && <SimonGame config={puzzle.config as SimonConfig} solved={solved} onSolved={onSolved} />}
        {puzzle.type === "morse" && <MorseGame config={puzzle.config as MorseConfig} solved={solved} onSolved={onSolved} />}
        {puzzle.type === "minesweeper" && <MinesweeperGame config={puzzle.config as MinesweeperConfig} solved={solved} onSolved={onSolved} />}
        {puzzle.type === "circuit" && <CircuitGame config={puzzle.config as CircuitConfig} solved={solved} onSolved={onSolved} />}
      </div>

      {solved && puzzle.type === "sliding" ? (
        <Panel className="mt-6">
          <Label>Unter dem Bild verborgen</Label>
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
          Zurück zu Etappe {String(stage.number).padStart(2, "0")}
        </Link>
      ) : null}

      <PuzzleSuccess
        show={celebrate}
        title={puzzle.type === "wordle" ? "Code entschlüsselt" : "Auftrag abgeschlossen"}
        message="Die Spur führt weiter."
        continueLabel={stage ? "Zurück zur Etappe" : "Weiter"}
        onContinue={() => {
          setCelebrate(false);
          if (stage) navigate({ to: "/stage/$id", params: { id: stage.id } });
        }}
      />
    </GameShell>
  );
}
