import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMemoryGame, type Card } from "./useMemoryGame";
import { MAX_SCORE, MISMATCH_DELAY_MS, PAIRS_COUNT, POINTS_PER_MATCH } from "./game.config";

function findMatchingPair(cards: Card[]): [Card, Card] {
  for (const card of cards) {
    const partner = cards.find((c) => c.id !== card.id && c.productId === card.productId);
    if (partner) return [card, partner];
  }
  throw new Error("no matching pair found in deck");
}

function findMismatchedPair(cards: Card[]): [Card, Card] {
  const [first] = cards;
  const other = cards.find((c) => c.productId !== first!.productId);
  return [first!, other!];
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useMemoryGame", () => {
  it("deals PAIRS_COUNT*2 cards, all face down and unmatched", () => {
    const { result } = renderHook(() => useMemoryGame());
    expect(result.current.cards).toHaveLength(PAIRS_COUNT * 2);
    expect(result.current.cards.every((c) => !c.isFlipped && !c.isMatched)).toBe(true);
  });

  it("match: flipping two cards of the same product marks both matched and scores +POINTS_PER_MATCH", () => {
    const { result } = renderHook(() => useMemoryGame());
    const [a, b] = findMatchingPair(result.current.cards);

    act(() => result.current.flipCard(a.id));
    act(() => result.current.flipCard(b.id));

    const flippedA = result.current.cards.find((c) => c.id === a.id)!;
    const flippedB = result.current.cards.find((c) => c.id === b.id)!;
    expect(flippedA.isMatched).toBe(true);
    expect(flippedB.isMatched).toBe(true);
    expect(result.current.score).toBe(POINTS_PER_MATCH);
    expect(result.current.lastMatchedProduct?.id).toBe(a.productId);
  });

  it("mismatch: flipping two different products flips them back down after the delay and costs a penalty", () => {
    const { result } = renderHook(() => useMemoryGame());
    const [a, b] = findMismatchedPair(result.current.cards);

    act(() => result.current.flipCard(a.id));
    act(() => result.current.flipCard(b.id));

    // Both stay face up (but not matched) during the reveal window, and shake to signal the miss.
    expect(result.current.cards.find((c) => c.id === a.id)!.isFlipped).toBe(true);
    expect(result.current.phase).toBe("evaluating");
    expect(result.current.shakingIds).toEqual([a.id, b.id]);

    act(() => {
      vi.advanceTimersByTime(MISMATCH_DELAY_MS);
    });

    expect(result.current.cards.find((c) => c.id === a.id)!.isFlipped).toBe(false);
    expect(result.current.cards.find((c) => c.id === b.id)!.isFlipped).toBe(false);
    expect(result.current.phase).toBe("idle");
    expect(result.current.shakingIds).toEqual([]);
    expect(result.current.score).toBe(0); // clamped: 0 matches minus one penalty can't go negative
  });

  it("attempts: increments once per pair evaluated, not once per tap", () => {
    const { result } = renderHook(() => useMemoryGame());
    const [a, b] = findMatchingPair(result.current.cards);

    act(() => result.current.flipCard(a.id));
    expect(result.current.attempts).toBe(0); // first tap of a pair doesn't count yet

    act(() => result.current.flipCard(b.id));
    expect(result.current.attempts).toBe(1);
  });

  it("finished: reaches phase 'finished' once every pair has been matched", () => {
    const { result } = renderHook(() => useMemoryGame());

    while (result.current.matchedPairs < result.current.totalPairs) {
      const unmatched = result.current.cards.filter((c) => !c.isMatched);
      const [a, b] = findMatchingPair(unmatched);
      act(() => result.current.flipCard(a.id));
      act(() => result.current.flipCard(b.id));
      act(() => result.current.acknowledgeMatch());
    }

    expect(result.current.phase).toBe("finished");
    expect(result.current.score).toBe(MAX_SCORE);
  });

  it("finished: also reached when the countdown reaches zero, regardless of pairs left", () => {
    const { result } = renderHook(() => useMemoryGame());

    act(() => {
      vi.advanceTimersByTime(90_000);
    });

    expect(result.current.phase).toBe("finished");
    expect(result.current.timeRemainingMs).toBe(0);
  });
});
