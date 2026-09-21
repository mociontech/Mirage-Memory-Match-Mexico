import { submitParticipation } from "./api";
import type { Participation } from "../types/participation";

const OUTBOX_KEY = "kam:outbox";
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000] as const; // 4 delays -> 5 total attempts

function readOutbox(): Participation[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as Participation[]) : [];
  } catch {
    return [];
  }
}

function writeOutbox(entries: Participation[]): void {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
}

function removeFromOutbox(id: string): void {
  writeOutbox(readOutbox().filter((entry) => entry.id !== id));
}

/**
 * Persists a finished game's result locally so the UI can move on to Result
 * immediately, then kicks off a background flush. Never awaited by callers.
 */
export function enqueueParticipation(participation: Participation): void {
  const outbox = readOutbox();
  if (!outbox.some((entry) => entry.id === participation.id)) {
    writeOutbox([...outbox, participation]);
  }
  void flushOutbox();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetries(participation: Participation): Promise<boolean> {
  for (let attempt = 0; ; attempt++) {
    try {
      await submitParticipation(participation);
      return true;
    } catch {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) return false; // exhausted the 5 attempts
      await sleep(delay);
    }
  }
}

let isFlushing = false;

/**
 * Retries every pending outbox entry (1s/2s/4s/8s backoff, 5 attempts each).
 * An entry that still fails after that stays in the outbox and is retried
 * on the next flush — triggered again on `online`, or the next enqueue.
 */
export async function flushOutbox(): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;
  try {
    for (const participation of readOutbox()) {
      const sent = await sendWithRetries(participation);
      if (sent) removeFromOutbox(participation.id);
    }
  } finally {
    isFlushing = false;
  }
}

/** Wires the outbox to retry automatically when the kiosk regains connectivity. Call once at app startup. */
export function initOutboxFlush(): () => void {
  const handleOnline = () => void flushOutbox();
  window.addEventListener("online", handleOnline);
  void flushOutbox();
  return () => window.removeEventListener("online", handleOnline);
}
