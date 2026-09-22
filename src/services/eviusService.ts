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

interface BatchResponse {
  received: number;
  processed: number;
  failed: number;
  errors?: string[];
}

/**
 * Datahub's batch endpoints answer 200/201 even when the individual record
 * inside failed server-side (failed:1, the real error in errors[]) - HTTP
 * status alone isn't enough to know the job actually landed. Without this,
 * a per-record failure got treated as delivered and silently dropped
 * instead of staying queued for retry.
 */
async function postJson(path: string, body: unknown): Promise<void> {
  if (!env.evius.url || !env.evius.token) {
    throw new Error("Evius is not configured (VITE_EVIUS_URL/VITE_EVIUS_TOKEN missing)");
  }
  // VITE_EVIUS_URL is sometimes configured with a trailing slash - strip it
  // so this never sends a double slash (some backends 404 on //attendees).
  const base = env.evius.url.replace(/\/+$/, "");
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: eviusHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Evius ${path} failed: ${response.status}`);
  }
  const result = (await response.json()) as BatchResponse;
  if (result.failed > 0) {
    throw new Error(`Evius ${path} rejected the record: ${result.errors?.join("; ") ?? "unknown error"}`);
  }
}

async function runAttendeeJob(payload: unknown): Promise<void> {
  const record = payload as AttendeePayload;
  await postJson("/attendees", {
    eventId: env.evius.eventId,
    source: env.evius.experienceName,
    sentAt: new Date().toISOString(),
    records: [record],
  });
}

async function postActivityFallback(record: ExperiencePayload): Promise<void> {
  await postJson("/activities", {
    eventId: env.evius.eventId,
    source: env.evius.experienceName,
    sentAt: new Date().toISOString(),
    // Per Datahub's own docs, /activities only accepts
    // name/shortDescription/longDescription/startDate/endDate/capacity -
    // no email/experienceId field exists there, so those go inside the
    // JSON blob in longDescription instead. `name` is the one required
    // field; without it the whole record is rejected server-side.
    records: [
      {
        name: env.evius.experienceName,
        shortDescription: record.email,
        longDescription: JSON.stringify({
          email: record.email,
          experienceId: env.evius.experienceId,
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
      source: env.evius.experienceName,
      sentAt: new Date().toISOString(),
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
