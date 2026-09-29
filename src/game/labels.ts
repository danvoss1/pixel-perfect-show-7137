import type { PuzzleType } from "./types";

export const puzzleTypeLabel: Record<PuzzleType, string> = {
  wordle: "Worträtsel",
  sliding: "Schiebepuzzle",
  flappy: "Flugspiel",
  code: "Codeschloss",
  route: "Routenrätsel",
  symbols: "Symbolrätsel",
  room: "3D-Raum",
  evidence: "Beweisstück",
  mastermind: "Codeknacker",
  simon: "Signalfolge",
  morse: "Morsezeichen",
  minesweeper: "Minenfeld",
  circuit: "Schaltkreis",
};
