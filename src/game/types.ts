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
  | "morse"
  | "minesweeper"
  | "circuit"
  | "geometry"
  | "ordering"
  | "reveal"
  | "dna";

export type MarkerState =
  | "unknown"
  | "discovered"
  | "active"
  | "completed"
  | "locked"
  | "food"
  | "drink"
  | "envelope"
  | "puzzle"
  | "bonus";

export type HintCost =
  | "none"
  | "drink"
  | "video"
  | "minigame"
  | "token"
  | "time"
  | "team"
  | "custom";

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
  label?: string;
  helperText?: string;
  submitLabel?: string;
  successText?: string;
  errorText?: string;
}

export interface GeometryConfig {
  answers: string[];
  prompt: string;
  helperText?: string;
  submitLabel?: string;
  errorText?: string;
  shapeName: string;
  faces: number;
  dimension: number;
  archiveReference?: string;
}

export interface OrderingItem {
  id: string;
  text: string;
  order: number;
}

export interface OrderingConfig {
  items: OrderingItem[];
  extraction?: "first-letter";
  answer: string;
  instruction?: string;
  successTitle?: string;
  revealText?: string;
  showExtraction?: boolean;
}

export interface RevealConfig {
  eyebrow?: string;
  body: string[];
  confirmLabel?: string;
  successText?: string;
}

export interface DnaConfig {
  strand: string;
  directionTop?: "5to3" | "3to5";
  prompt?: string;
  helperText?: string;
  revealText: string;
  successTitle?: string;
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

export interface MastermindConfig {
  secret: string;
  attempts: number;
}

export interface SimonConfig {
  sequence: number[];
}

export interface MorseConfig {
  code: string;
  answer: string;
}

export interface MinesweeperConfig {
  grid: number;
  mines: number[];
}

export interface CircuitConfig {
  path: number[];
  grid: number;
}

export interface Puzzle {
  id: string;
  type: PuzzleType;
  title: string;
  tagline: string;
  stageId: string;
  hints: Hint[];
  rewardItemIds?: string[];
  requiredItemIds?: string[];
  unlockFeatureIds?: string[];
  storyFragmentIds?: string[];
  completeStageOnSolve?: boolean;
  config:
    | WordleConfig
    | SlidingConfig
    | FlappyConfig
    | CodeConfig
    | GeometryConfig
    | OrderingConfig
    | RevealConfig
    | DnaConfig
    | RouteConfig
    | SymbolsConfig
    | MastermindConfig
    | SimonConfig
    | MorseConfig
    | MinesweeperConfig
    | CircuitConfig
    | Record<string, never>;
}

export interface StoryFragment {
  id: string;
  title: string;
  text: string;
  stageId: string;
  author?: string;
  archiveCode?: string;
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
  category?:
    | "Dokument"
    | "Schlüssel"
    | "Hinweis"
    | "Kartenfragment"
    | "Codefragment"
    | "Werkzeug"
    | "Quest-Gegenstand"
    | "Joker"
    | "Trinkspiel-Karte"
    | "Essens-Token"
    | "Getränke-Token"
    | "Bonus"
    | "Debuff"
    | "Mystery-Gegenstand";
  mystery?: boolean;
  physical?: boolean;
  consumable?: boolean;
  requiredLater?: boolean;
  sourceStageId?: string;
  tags?: string[];
}

export interface InventoryItemState {
  used?: boolean;
  damaged?: boolean;
  destroyed?: boolean;
  hiddenDetailUnlocked?: boolean;
}

export type StageCompletionMode = "manual" | "external";

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
  pickupItemId?: string;
  pickupTitle?: string;
  pickupDescription?: string;
  requireLocationVisit?: boolean;
  specialRoute?: string;
  specialRouteLabel?: string;
  completionMode?: StageCompletionMode;
  hidePuzzleLink?: boolean;
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

export type HeumarktFlowPhase =
  | "triangle"
  | "target-revealed"
  | "heart-reached"
  | "story-revealed"
  | "location-riddle"
  | "ai-identified";
