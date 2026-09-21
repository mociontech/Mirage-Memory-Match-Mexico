import { fetchMyPosition, fetchRanking, type RankingEntry } from "./api";

export type { RankingEntry };

/**
 * Ranking screen never blocks on the network (hard constraint #5): an
 * unreachable/unconfigured backend just means an empty board, not a stuck
 * spinner — fetchRanking() already resolves to [] instead of throwing.
 */
export async function getTop10(): Promise<RankingEntry[]> {
  return fetchRanking();
}

/** This participant's rank (1 = highest score), or null if not available yet — same never-block contract as getTop10. */
export async function getMyPosition(email: string): Promise<number | null> {
  return fetchMyPosition(email);
}
