/**
 * The kiosk flow is linear and closed (no browser back button, no manipulable
 * URLs), so screens are modeled as a state machine instead of routes.
 * "Advertencia" (ID already used) is intentionally NOT a screen here — it is
 * a modal rendered on top of RegisterId, since the design shows it as an
 * overlay with no exit into the game, not a navigable destination.
 */
export type Screen =
  | "welcome"
  | "register"
  | "registerId"
  | "idGenerated"
  | "instructions"
  | "game"
  | "felicidades"
  | "result"
  | "ranking";

/**
 * Participant data collected across Register/RegisterId, plus the game
 * result once played. This is the working draft of a Participation
 * (see types/participation.ts) — Fase 5 reads it to build the final payload.
 */
export interface Session {
  id: string;
  name: string;
  email: string;
  score: number;
  attempts: number;
  matchedProducts: string[];
  /** ISO 8601, set when the Game screen mounts. */
  startedAt: string;
  /** ISO 8601, set when the game ends (match complete or time out). */
  finishedAt: string;
}

export const EMPTY_SESSION: Session = {
  id: "",
  name: "",
  email: "",
  score: 0,
  attempts: 0,
  matchedProducts: [],
  startedAt: "",
  finishedAt: "",
};

/** Outcome of the game itself, set once the board finishes and read by Result to submit. */
export interface GameResult {
  points: number;
  attempts: number;
  matchedProducts: string[];
  /** ISO 8601 */
  startedAt: string;
  /** ISO 8601 */
  finishedAt: string;
}

export interface FlowState {
  screen: Screen;
  session: Session;
  result: GameResult | null;
}

export type FlowAction =
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "SET_SESSION"; session: Partial<Session> }
  | { type: "SET_RESULT"; result: GameResult }
  | { type: "RESET" };

export const INITIAL_FLOW_STATE: FlowState = {
  screen: "welcome",
  session: EMPTY_SESSION,
  result: null,
};
