import { env } from "../config/env";
import { enqueue, registerQueueRunner } from "./retryQueue";
import type { ParticipationResultEvent } from "../types/participation";

const ATTENDEES_QUEUE = "evius:attendees";
const EXPERIENCES_QUEUE = "evius:experiences";

interface AttendeePayload {
  fullName: string;
  email: string;
  checkInAt: string;
  country: string;
}

interface ExperiencePayload {
  email: string;
  play_timestamp: string;
  score: number;
  bonusScore: number;
  data: Record<string, unknown>;
}

function eviusHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.evius.token}`,
  };
}

async function postJson(path: string, body: unknown): Promise<void> {
  if (!env.evius.url || !env.evius.token) {
    throw new Error("Evius is not configured (VITE_EVIUS_URL/VITE_EVIUS_TOKEN missing)");
  }
  const response = await fetch(`${env.evius.url}${path}`, {
    method: "POST",
    headers: eviusHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Evius ${path} failed: ${response.status}`);
  }
}

async function runAttendeeJob(payload: unknown): Promise<void> {
  const record = payload as AttendeePayload;
  await postJson("/attendees", {
    eventId: env.evius.eventId,
    source: env.evius.experienceName,
    records: [record],
  });
}

async function postActivityFallback(record: ExperiencePayload): Promise<void> {
  await postJson("/activities", {
    eventId: env.evius.eventId,
    experienceId: env.evius.experienceId,
    records: [
      {
        email: record.email,
        longDescription: JSON.stringify({
          score: record.score,
          bonusScore: record.bonusScore,
          play_timestamp: record.play_timestamp,
          ...record.data,
        }),
      },
    ],
  });
}

async function runExperienceJob(payload: unknown): Promise<void> {
  const record = payload as ExperiencePayload;
  try {
    await postJson("/experiences", {
      eventId: env.evius.eventId,
      experienceId: env.evius.experienceId,
      records: [record],
    });
  } catch {
    // /experiences is unconfirmed in the official Evius API — fall back to
    // the documented /activities endpoint with the score embedded as JSON.
    // Re-thrown on failure so the job stays queued and retries the whole thing.
    await postActivityFallback(record);
  }
}

registerQueueRunner(ATTENDEES_QUEUE, runAttendeeJob);
registerQueueRunner(EXPERIENCES_QUEUE, runExperienceJob);

/**
 * Registers/dedupes the attendee in Evius by email + eventId. Skipped
 * silently if there is no email (Evius dedupe key) or Evius isn't configured
 * for this deployment yet.
 */
export function sendAttendee(params: { name: string; email: string; checkInAt: string }): void {
  if (!params.email) return;
  enqueue(ATTENDEES_QUEUE, {
    fullName: params.name,
    email: params.email,
    checkInAt: params.checkInAt,
    country: env.country,
  } satisfies AttendeePayload);
}

/** Records the experience result in Evius, always (independent of attendee registration). */
export function sendExperienceResult(result: ParticipationResultEvent): void {
  enqueue(EXPERIENCES_QUEUE, {
    email: result.email,
    play_timestamp: result.ts,
    score: result.points,
    bonusScore: 0,
    data: {
      name: result.name,
      code: result.code,
      productId: result.productId,
      idempotencyKey: result.idempotencyKey,
    },
  } satisfies ExperiencePayload);
}
