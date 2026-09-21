import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAME_DURATION_MS, MISMATCH_DELAY_MS, PAIRS_COUNT, getGridColumns } from "./game.config";
import { PRODUCTS, type Product } from "./products";
import { shuffle } from "./shuffle";
import { computeScore } from "./scoring";

export interface Card {
  id: string;
  productId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

/**
 * The spec names five phases (idle -> flippingFirst -> flippingSecond ->
 * evaluating -> match|mismatch -> ... -> finished). This hook collapses
 * flippingFirst/flippingSecond into "idle" (both allow tapping any
 * unflipped card — the only observable difference is `flippedCount`, which
 * callers can read off `cards`) since nothing behaviorally distinguishes
 * them: the 2nd card's flip is a CSS concern in the Card component, not a
 * gated JS state. "evaluating" is real: clicks are blocked while the pair's
 * outcome is being shown.
 */
export type GamePhase = "idle" | "evaluating" | "finished";

export interface UseMemoryGameResult {
  cards: Card[];
  phase: GamePhase;
  /** Incremented once per pair evaluated (not per tap). */
  attempts: number;
  score: number;
  gridColumns: number;
  timeRemainingMs: number;
  matchedPairs: number;
  totalPairs: number;
  matchedProductIds: string[];
  /** The two card ids currently shaking off a wrong guess, purely for visual feedback. */
  shakingIds: string[];
  /** Set right after a match resolves; screens use this to open ProductPopup. Cleared by acknowledgeMatch. */
  lastMatchedProduct: Product | null;
  flipCard: (cardId: string) => void;
  /** Call when ProductPopup has been dismissed, so the next flip is accepted again. */
  acknowledgeMatch: () => void;
}

function buildDeck(): Card[] {
  const products = PRODUCTS.slice(0, PAIRS_COUNT);
  const pairs = products.flatMap((product, index) => [
    { id: `${product.id}-a`, productId: product.id, isFlipped: false, isMatched: false },
    { id: `${product.id}-b-${index}`, productId: product.id, isFlipped: false, isMatched: false },
  ]);
  return shuffle(pairs);
}

/**
 * All memory-match game logic, isolated from JSX so it can be unit tested
 * directly (see useMemoryGame.test.ts).
 */
export function useMemoryGame(timerActive = true): UseMemoryGameResult {
  const [cards, setCards] = useState<Card[]>(buildDeck);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [timeRemainingMs, setTimeRemainingMs] = useState(GAME_DURATION_MS);
  const [lastMatchedProduct, setLastMatchedProduct] = useState<Product | null>(null);
  const [awaitingAcknowledge, setAwaitingAcknowledge] = useState(false);
  /** Card ids currently shaking off a wrong guess — cleared once they flip back down. */
  const [shakingIds, setShakingIds] = useState<string[]>([]);

  const gridColumns = useMemo(() => getGridColumns(cards.length), [cards.length]);
  const score = useMemo(() => computeScore(matches, mismatches), [matches, mismatches]);
  const totalPairs = PAIRS_COUNT;
  const matchedPairs = matches;
  const matchedProductIds = useMemo(
    () => [...new Set(cards.filter((c) => c.isMatched).map((c) => c.productId))],
    [cards],
  );

  // Countdown timer — ends the game at 0 regardless of pairs remaining.
  // `timerActive` lets the caller hold the clock during a pre-game intro
  // (cards dropping in + a preview flip) without touching game state.
  useEffect(() => {
    if (phase === "finished" || !timerActive) return;
    const tickMs = 250;
    const interval = setInterval(() => {
      setTimeRemainingMs((prev) => Math.max(0, prev - tickMs));
    }, tickMs);
    return () => clearInterval(interval);
  }, [phase, timerActive]);

  useEffect(() => {
    if (timeRemainingMs === 0) {
      setPhase("finished");
    }
  }, [timeRemainingMs]);

  useEffect(() => {
    if (matchedPairs === totalPairs) {
      setPhase("finished");
    }
  }, [matchedPairs, totalPairs]);

  const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
    };
  }, []);

  const flipCard = useCallback(
    (cardId: string) => {
      if (phase !== "idle" || awaitingAcknowledge) return;

      const flippedUnmatched = cards.filter((c) => c.isFlipped && !c.isMatched);
      const target = cards.find((c) => c.id === cardId);
      if (!target || target.isFlipped || target.isMatched) return;

      if (flippedUnmatched.length === 0) {
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
        return;
      }

      // Second card of the pair: flip it and evaluate.
      const first = flippedUnmatched[0]!;
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
      setAttempts((prev) => prev + 1);
      setPhase("evaluating");

      const isMatch = first.productId === target.productId;
      if (isMatch) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first.id || c.id === cardId ? { ...c, isMatched: true } : c,
          ),
        );
        setMatches((prev) => prev + 1);
        const product = PRODUCTS.find((p) => p.id === target.productId) ?? null;
        setLastMatchedProduct(product);
        setAwaitingAcknowledge(true);
        setPhase("idle");
      } else {
        setMismatches((prev) => prev + 1);
        setShakingIds([first.id, cardId]);
        mismatchTimeoutRef.current = setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === cardId ? { ...c, isFlipped: false } : c,
            ),
          );
          setShakingIds([]);
          // Don't downgrade a "finished" reached by the timer while this was pending.
          setPhase((prev) => (prev === "finished" ? prev : "idle"));
        }, MISMATCH_DELAY_MS);
      }
    },
    [cards, phase, awaitingAcknowledge],
  );

  const acknowledgeMatch = useCallback(() => {
    setLastMatchedProduct(null);
    setAwaitingAcknowledge(false);
  }, []);

  return {
    cards,
    phase,
    attempts,
    score,
    gridColumns,
    timeRemainingMs,
    matchedPairs,
    totalPairs,
    matchedProductIds,
    shakingIds,
    lastMatchedProduct,
    flipCard,
    acknowledgeMatch,
  };
}
