/**
 * Single source of truth for the board size and game rules. Changing
 * PAIRS_COUNT reconfigures the grid, shuffle, and scoring ceiling with no
 * other file needing to change (acceptance criterion from the spec).
 */

/**
 * Number of matching pairs on the board. Confirmed against Figma node
 * 209:862 ("inicio Juego", COLOMBIA section): 8 products, 16 cards, 4x4 grid.
 */
export const PAIRS_COUNT = 8;

/** How long both cards of a wrong guess stay face-up before flipping back. */
export const MISMATCH_DELAY_MS = 800;

/** How long one card's drop-into-place animation takes, on intro. */
export const CARD_DROP_DURATION_MS = 500;

/** Stagger between each card's drop start, so they fall in one after another instead of all at once. */
export const CARD_DROP_STAGGER_MS = 40;

/** How long the board stays face-up, showing every product, before the intro ends and cards flip back down to start play. */
export const INTRO_REVEAL_DURATION_MS = 1200;

/** Total time budget for one game session; hitting 0 ends the game with whatever score was earned. */
export const GAME_DURATION_MS = 90_000;

/**
 * Scaled so a perfect board (all matches, no mismatches) hits 100, matching
 * Catalogo's 0-100 range: both feed the same `ranking_combined` average in
 * Supabase, so their ceilings have to line up or one experience is
 * structurally worth less than the other in the combined ranking.
 */
export const POINTS_PER_MATCH = 100 / PAIRS_COUNT;

/**
 * A wrong guess costs points again (reinstated - a run with zero mismatches
 * was otherwise indistinguishable in difficulty from one with a dozen,
 * making a perfect score too easy to reach by just brute-forcing pairs).
 * Set to roughly a third of a match's value: enough to reward genuine
 * memory over guessing, not so harsh that a couple of early misses tank
 * the run.
 */
export const PENALTY_PER_MISMATCH = 4;

export const MAX_SCORE = PAIRS_COUNT * POINTS_PER_MATCH;

/**
 * Derives a near-square column count from the card total instead of
 * hardcoding it, so PAIRS_COUNT alone drives the grid shape. This formula
 * reproduces both grid shapes seen in the Figma file: 20 cards -> 4x5,
 * 16 cards -> 4x4, 12 cards -> 3x4.
 */
export function getGridColumns(totalCards: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalCards)));
}
