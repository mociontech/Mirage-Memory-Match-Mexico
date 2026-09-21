import { describe, expect, it } from "vitest";
import { computeScore } from "./scoring";
import { MAX_SCORE, PAIRS_COUNT, PENALTY_PER_MISMATCH, POINTS_PER_MATCH } from "./game.config";

describe("computeScore", () => {
  it("gives 0 points for no matches or mismatches", () => {
    expect(computeScore(0, 0)).toBe(0);
  });

  it("awards POINTS_PER_MATCH per match", () => {
    expect(computeScore(3, 0)).toBe(3 * POINTS_PER_MATCH);
  });

  it("deducts PENALTY_PER_MISMATCH per mismatch", () => {
    expect(computeScore(3, 2)).toBe(3 * POINTS_PER_MATCH - 2 * PENALTY_PER_MISMATCH);
  });

  it("clamps at 0, never goes negative", () => {
    expect(computeScore(0, 50)).toBe(0);
  });

  it("a full board (PAIRS_COUNT matches, no mismatches) hits exactly MAX_SCORE (100)", () => {
    expect(computeScore(PAIRS_COUNT, 0)).toBe(MAX_SCORE);
    expect(MAX_SCORE).toBe(100);
  });

  it("clamps at MAX_SCORE even past a full board", () => {
    expect(computeScore(50, 0)).toBe(MAX_SCORE);
  });
});
