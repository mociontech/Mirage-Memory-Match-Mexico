import { fetchMyCombinedPosition, fetchMyPosition, fetchRanking, type RankingEntry } from "./api";

export type { RankingEntry };

/**
 * Ranking screen never blocks on the network (hard constraint #5): an
 * unreachable/unconfigured backend just means an empty board, not a stuck
 * spinner — fetchRanking() already resolves to [] instead of throwing.
 */
export async function getTop10(): Promise<RankingEntry[]> {
  return fetchRanking();
}

/**
 * Cache en memoria del ultimo Top 10 pedido - permite que Ranking.tsx pinte
 * la lista de inmediato al montar (sin esperar el round-trip) si alguien ya
 * disparo prefetchTop10() antes, en vez de arrancar siempre en [] mientras
 * carga. Se sigue pidiendo de nuevo al montar Ranking por si el cache quedo
 * desactualizado (otro jugador entro entre el prefetch y esta pantalla) -
 * esto solo evita el parpadeo inicial, no reemplaza ese fetch.
 */
let cachedTop10: RankingEntry[] | null = null;

/** Lee el cache sin disparar ningun fetch - null si nunca se prefeteo. */
export function getCachedTop10(): RankingEntry[] | null {
  return cachedTop10;
}

/**
 * Dispara el fetch del ranking por adelantado (apenas se conoce el puntaje
 * final, antes de llegar a la pantalla Ranking) para que el round-trip a
 * Supabase ya este en curso o resuelto cuando el visitante llegue ahi.
 */
export function prefetchTop10(): void {
  getTop10().then((rows) => {
    cachedTop10 = rows;
  });
}

/** This participant's rank within memory_match only (1 = highest score), or null if not available yet — same never-block contract as getTop10. */
export async function getMyPosition(email: string): Promise<number | null> {
  return fetchMyPosition(email);
}

/** This participant's rank in the general/combined ranking (the one that decides the prize). */
export async function getMyCombinedPosition(email: string): Promise<number | null> {
  return fetchMyCombinedPosition(email);
}
