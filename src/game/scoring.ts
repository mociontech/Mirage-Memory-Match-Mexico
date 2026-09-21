import { MAX_SCORE, PENALTY_PER_MISMATCH, POINTS_PER_MATCH } from "./game.config";

/**
 * Points per match found, minus a penalty per mismatch, clamped to
 * [0, MAX_SCORE]. Isolated here so the formula can change without touching
 * useMemoryGame.
 */
export function computeScore(matches: number, mismatches: number): number {
  const raw = matches * POINTS_PER_MATCH - mismatches * PENALTY_PER_MISMATCH;
  return Math.min(MAX_SCORE, Math.max(0, raw));
}
