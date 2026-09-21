import { env, RANKING_EXPERIENCE } from "../config/env";
import { enqueue, registerQueueRunner } from "./retryQueue";
import type { ParticipationResultEvent } from "../types/participation";

const RANKING_QUEUE = "ranking:submit";

interface RankingEntryPayload {
  participant_id: string;
  country: string;
  experience: string;
  score: number;
  submitted_at: string;
}

async function runRankingJob(payload: unknown): Promise<void> {
  if (!env.rankingDb.url || !env.rankingDb.apiKey) {
    // Ranking DB isn't provisioned yet for this deployment — leave the job
    // queued so it flushes automatically once VITE_RANKING_DB_URL/KEY are set.
    throw new Error("Ranking DB is not configured yet");
  }

  const record = payload as RankingEntryPayload;
  const response = await fetch(`${env.rankingDb.url}/rest/v1/${env.rankingDb.table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.rankingDb.apiKey,
      Authorization: `Bearer ${env.rankingDb.apiKey}`,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(record),
  });
  if (!response.ok) {
    throw new Error(`Ranking DB submit failed: ${response.status}`);
  }
}

registerQueueRunner(RANKING_QUEUE, runRankingJob);

/**
 * Submits this session's score to the shared cross-experience ranking store.
 * Deduped server-side by (participant_id/email, country, experience). Safe
 * to call even before the ranking DB is provisioned — the job just queues
 * until VITE_RANKING_DB_URL/VITE_RANKING_DB_API_KEY are configured.
 */
export function submitRankingEntry(result: ParticipationResultEvent): void {
  enqueue(RANKING_QUEUE, {
    participant_id: result.email,
    country: env.country,
    experience: RANKING_EXPERIENCE,
    score: result.points,
    submitted_at: result.ts,
  } satisfies RankingEntryPayload);
}
