import { normalizeEmail } from "./idService";
import type { Participation } from "../types/participation";

/**
 * The single outbound interface the rest of the app talks to — outbox.ts
 * retries whatever this throws on, screens never call fetch directly.
 *
 * Fans out to Evius (attendee + experience result, shared with "Mirage
 * Colombia/Mexico" per-country events) and to the shared Supabase ranking
 * store (same project as the Catalogo experience, table `participations`,
 * deduped by participant_id + country + experience).
 */
const COUNTRY = import.meta.env.VITE_COUNTRY;
const EXPERIENCE_NAME = import.meta.env.VITE_EXPERIENCE_NAME || "Mirage - Memory Match";

const EVIUS_URL = import.meta.env.VITE_EVIUS_URL;
const EVIUS_TOKEN = import.meta.env.VITE_EVIUS_TOKEN;
const EVIUS_EVENT_ID = import.meta.env.VITE_EVIUS_EVENT_ID;
const EVIUS_EXPERIENCE_ID = import.meta.env.VITE_EVIUS_EXPERIENCE_ID;

const RANKING_DB_URL = import.meta.env.VITE_RANKING_DB_URL;
const RANKING_DB_API_KEY = import.meta.env.VITE_RANKING_DB_API_KEY;
const RANKING_DB_TABLE = import.meta.env.VITE_RANKING_DB_TABLE || "participations";

export interface RankingEntry {
  name: string;
  points: number;
}

async function postEvius(path: string, body: unknown): Promise<Response> {
  return fetch(`${EVIUS_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${EVIUS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
}

/** POST /attendees — only if there's an email, deduped by email + eventId. */
async function submitAttendee(participation: Participation): Promise<void> {
  if (!participation.email) return;
  const res = await postEvius("/attendees", {
    eventId: EVIUS_EVENT_ID,
    source: EXPERIENCE_NAME,
    records: [
      {
        fullName: participation.name,
        email: normalizeEmail(participation.email),
        checkInAt: participation.startedAt,
        country: COUNTRY,
      },
    ],
  });
  if (!res.ok) throw new Error(`Evius /attendees failed: ${res.status}`);
}

/** POST /experiences, falling back to /activities (score embedded as JSON) if that fails. */
async function submitExperienceResult(participation: Participation): Promise<void> {
  const record = {
    email: normalizeEmail(participation.email),
    play_timestamp: participation.finishedAt,
    score: participation.points,
    bonusScore: 0,
    data: {
      name: participation.name,
      code: participation.id,
      productId: participation.matchedProducts[0] ?? null,
      idempotencyKey: `memory-match:${COUNTRY}:${participation.id}`,
    },
  };

  const res = await postEvius("/experiences", {
    eventId: EVIUS_EVENT_ID,
    experienceId: EVIUS_EXPERIENCE_ID,
    records: [record],
  });
  if (res.ok) return;

  // /experiences is unconfirmed in the official Evius API — fall back to
  // the documented /activities endpoint with the score embedded as JSON.
  const fallbackRes = await postEvius("/activities", {
    eventId: EVIUS_EVENT_ID,
    experienceId: EVIUS_EXPERIENCE_ID,
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
  if (!fallbackRes.ok) throw new Error(`Evius /experiences and /activities both failed`);
}

/** POST to the shared Supabase ranking table, deduped by (participant_id, country, experience). */
async function submitRanking(participation: Participation): Promise<void> {
  const res = await fetch(`${RANKING_DB_URL}/rest/v1/${RANKING_DB_TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: RANKING_DB_API_KEY,
      Authorization: `Bearer ${RANKING_DB_API_KEY}`,
      // Plain insert, not an upsert: the anon key only has INSERT on this
      // table (no UPDATE/SELECT), so `resolution=merge-duplicates` would
      // make Postgres reject every insert with 42501 while planning the
      // ON CONFLICT DO UPDATE it implies - see docs/supabase-schema.sql in
      // the Catalogo project for the RLS policies. A genuine retry of the
      // same participation is rejected with 409 by the unique constraint,
      // which is fine: the client already guards against replay via
      // hasEmailPlayedLocally.
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      participant_id: normalizeEmail(participation.email),
      participant_name: participation.name,
      country: COUNTRY,
      experience: "memory_match",
      score: participation.points,
      submitted_at: participation.finishedAt,
    }),
  });
  if (!res.ok) throw new Error(`Ranking DB submit failed: ${res.status}`);
}

/**
 * Sends one participation to every destination that has its own env vars
 * configured — Evius and the ranking DB are independent deployments, so one
 * being unset (e.g. Evius credentials not issued yet) must not block the
 * other. Throws if a *configured* destination's request fails; outbox.ts is
 * what decides what to do about that (retry later), this function never
 * swallows a real request failure.
 */
export async function submitParticipation(participation: Participation): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (EVIUS_URL && EVIUS_TOKEN && COUNTRY) {
    tasks.push(submitAttendee(participation), submitExperienceResult(participation));
  }
  if (RANKING_DB_URL && RANKING_DB_API_KEY) {
    tasks.push(submitRanking(participation));
  }

  if (tasks.length === 0) {
    throw new Error(
      "submitParticipation: neither Evius (VITE_EVIUS_URL/VITE_EVIUS_TOKEN/VITE_COUNTRY) nor the ranking DB (VITE_RANKING_DB_URL/VITE_RANKING_DB_API_KEY) are configured",
    );
  }
  await Promise.all(tasks);
}

/**
 * Top 10 for the Ranking screen. Returns an empty list if unconfigured or
 * unreachable — never throws.
 *
 * Reads participant_name off ranking_by_experience (added alongside
 * participant_id — see the migration note in .env.example). Falls back to
 * participant_id (the email) for rows submitted before that column existed.
 */
export async function fetchRanking(): Promise<RankingEntry[]> {
  if (!RANKING_DB_URL || !RANKING_DB_API_KEY) return [];
  try {
    const query = new URLSearchParams({
      country: `eq.${COUNTRY}`,
      experience: "eq.memory_match",
      order: "score.desc",
      limit: "10",
    });
    const res = await fetch(`${RANKING_DB_URL}/rest/v1/ranking_by_experience?${query}`, {
      headers: {
        apikey: RANKING_DB_API_KEY,
        Authorization: `Bearer ${RANKING_DB_API_KEY}`,
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      participant_id: string;
      participant_name?: string | null;
      score: number;
    }>;
    return rows.map((row) => ({ name: row.participant_name || row.participant_id, points: row.score }));
  } catch {
    return [];
  }
}

/**
 * This participant's rank in ranking_by_experience (1 = highest score),
 * read straight off the view's own `position` column instead of
 * recomputing it client-side. Returns null if unconfigured/unreachable, or
 * if the row hasn't synced into the ranking DB yet (the submission goes
 * through the outbox and can lag a few seconds) - the caller shows nothing
 * in that case rather than a wrong or stale position.
 */
export async function fetchMyPosition(email: string): Promise<number | null> {
  if (!RANKING_DB_URL || !RANKING_DB_API_KEY) return null;
  try {
    const query = new URLSearchParams({
      participant_id: `eq.${normalizeEmail(email)}`,
      country: `eq.${COUNTRY}`,
      experience: "eq.memory_match",
      select: "position",
    });
    const res = await fetch(`${RANKING_DB_URL}/rest/v1/ranking_by_experience?${query}`, {
      headers: {
        apikey: RANKING_DB_API_KEY,
        Authorization: `Bearer ${RANKING_DB_API_KEY}`,
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ position: number }>;
    return rows[0]?.position ?? null;
  } catch {
    return null;
  }
}
