export type StageStatus = "completed" | "active" | "locked";

export type PuzzleType =
  | "wordle"
  | "sliding"
  | "flappy"
  | "code"
  | "route"
  | "symbols"
  | "room"
  | "evidence"
  | "mastermind"
  | "simon"
  | "morse";

export type MarkerState = "unknown" | "discovered" | "active" | "completed" | "locked" | "food" | "drink" | "envelope" | "puzzle" | "bonus";

export type HintCost = "none" | "drink" | "video" | "minigame" | "token" | "time" | "team" | "custom";

export interface Hint {
  id: string;
  label: string;
  text: string;
  cost?: HintCost;
  costDescription?: string;
}

export interface GameLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  distance: string;
  /** relative position on the mocked map canvas, 0-100 */
  x: number;
  y: number;
  clue: string;
  description?: string;
  stageId?: string;
  kind?: "checkpoint" | "food" | "drink" | "envelope" | "bonus";
  image?: string;
  envelopeId?: string;
  rewardItemId?: string;
  requireGps?: boolean;
  requireCode?: boolean;
  requireQr?: boolean;
}

export interface WordleConfig {
  word: string;
  maxAttempts: number;
  clue: string;
}
export interface SlidingConfig {
  grid: number;
  image: string;
  reveal: string;
}
export interface FlappyConfig {
  targetScore: number;
  gravity: number;
  speed: number;
  gap: number;
  icon: string;
}
export interface CodeConfig {
  code: string;
  length: number;
  kind: "pin" | "word" | "coordinates";
}
export interface RouteStep {
  direction: "NORTH" | "EAST" | "SOUTH" | "WEST";
  distance: number;
}
export interface RouteConfig {
  start: string;
  steps: RouteStep[];
}
export interface SymbolsConfig {
  table: Record<string, string>;
  encoded: string;
  answer: string;
}
export interface MastermindConfig { secret: string; attempts: number; }
export interface SimonConfig { sequence: number[]; }
export interface MorseConfig { code: string; answer: string; }

export interface Puzzle {
  id: string;
  type: PuzzleType;
  title: string;
  tagline: string;
  stageId: string;
  hints: Hint[];
  config:
    | WordleConfig
    | SlidingConfig
    | FlappyConfig
    | CodeConfig
    | RouteConfig
    | SymbolsConfig
    | MastermindConfig
    | SimonConfig
    | MorseConfig
    | Record<string, never>;
}

export interface Envelope {
  id: string;
  number: number;
  code: string;
  expectedLocation: string;
  contents: string;
}

export interface InventoryItem {
  id: string;
  number: number;
  name: string;
  kind: string;
  foundAtStage: number;
  description: string;
  detail: string;
  category?: "Dokument" | "Schlüssel" | "Hinweis" | "Kartenfragment" | "Codefragment" | "Werkzeug" | "Quest-Gegenstand" | "Joker" | "Trinkspiel-Karte" | "Essens-Token" | "Getränke-Token" | "Bonus" | "Debuff" | "Mystery-Gegenstand";
  mystery?: boolean;
  physical?: boolean;
  consumable?: boolean;
}

export interface Stage {
  id: string;
  number: number;
  title: string;
  kind: string;
  intro: string;
  objective: string;
  requiredItem?: string;
  locationId?: string;
  puzzleId?: string;
  envelopeId?: string;
  rewardItemId?: string;
  reward: string;
}

export interface Adventure {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  city: string;
  stages: Stage[];
}

export interface JournalEntry {
  id: string;
  time: string;
  title: string;
  detail: string;
}
