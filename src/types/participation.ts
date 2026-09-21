/** One completed (or in-progress) kiosk participation, sent to the backend at the end of the game. */
export interface Participation {
  /** Format "123-456" — see idService for generation/validation. */
  id: string;
  name: string;
  email: string;
  points: number;
  attempts: number;
  matchedProducts: string[];
  /** ISO 8601 */
  startedAt: string;
  /** ISO 8601 */
  finishedAt: string;
  /** From VITE_KIOSK_ID (see .env). */
  kioskId: string;
}

/**
 * Cross-experience result event, equivalent to the catalog's
 * PARTICIPATION_RESULT. Emitted once per session at the end of the game and
 * fanned out to Evius and the shared Supabase ranking store.
 */
export interface ParticipationResultEvent {
  name: string;
  email: string;
  /** Session/kiosk code, or null if this experience has no equivalent. */
  code: string | null;
  /** 0-100, reflecting actual game performance (unlike the catalog's fixed 100). */
  points: number;
  /** Whatever result/product this session produced, or null if not applicable. */
  productId: string | null;
  /** Unique per session so a retry never double-records the same participation. */
  idempotencyKey: string;
  /** ISO 8601 */
  ts: string;
}
