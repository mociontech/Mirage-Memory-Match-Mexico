import { env } from "../config/env";
import { sendAttendee, sendExperienceResult } from "./eviusService";
import { submitRankingEntry } from "./rankingService";
import { normalizeEmail, rememberUsedEmail } from "./idService";
import type { Participation, ParticipationResultEvent } from "../types/participation";

/** One idempotency key per participation session — stable across retries. */
function buildIdempotencyKey(participation: Participation): string {
  return `memory-match:${env.country}:${participation.id}`;
}

function toResultEvent(participation: Participation): ParticipationResultEvent {
  return {
    name: participation.name,
    email: normalizeEmail(participation.email),
    code: participation.id || null,
    points: participation.points,
    productId: participation.matchedProducts[0] ?? null,
    idempotencyKey: buildIdempotencyKey(participation),
    ts: participation.finishedAt,
  };
}

/**
 * Fans a finished session out to Evius (attendee + experience result) and to
 * the shared Supabase ranking store, and marks the email as played locally
 * so the kiosk can reject a repeat attempt before it ever hits the network.
 * Fire-and-forget: every downstream call is queued and retried on its own,
 * so this never blocks or throws on the caller's click path.
 */
export function submitParticipation(participation: Participation): void {
  const result = toResultEvent(participation);

  sendAttendee({
    name: participation.name,
    email: normalizeEmail(participation.email),
    checkInAt: participation.startedAt,
  });
  sendExperienceResult(result);
  submitRankingEntry(result);

  if (participation.email) {
    rememberUsedEmail(participation.email);
  }
}
