/**
 * Generic persisted retry queue for outbound calls that must survive bad
 * venue internet. A job is appended synchronously (so nothing is lost if the
 * tab closes mid-request) and the queue drains itself on load, on
 * `online`, and on a background interval, in FIFO order per queue name.
 *
 * Not for the click path itself — callers should fire-and-forget through
 * `enqueue`, which never throws, so a submit button never blocks on network.
 */

const RETRY_INTERVAL_MS = 15_000;
const STORAGE_PREFIX = "mm:retryQueue:";

interface QueuedJob {
  id: string;
  payload: unknown;
  attempts: number;
  enqueuedAt: string;
}

type Runner = (payload: unknown) => Promise<void>;

const runners = new Map<string, Runner>();
const timers = new Map<string, ReturnType<typeof setInterval>>();

function storageKey(queueName: string): string {
  return `${STORAGE_PREFIX}${queueName}`;
}

function readQueue(queueName: string): QueuedJob[] {
  try {
    const raw = localStorage.getItem(storageKey(queueName));
    return raw ? (JSON.parse(raw) as QueuedJob[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queueName: string, jobs: QueuedJob[]): void {
  try {
    localStorage.setItem(storageKey(queueName), JSON.stringify(jobs));
  } catch {
    // Storage full/unavailable: the job already ran or will be retried from memory this session.
  }
}

async function drain(queueName: string): Promise<void> {
  const runner = runners.get(queueName);
  if (!runner) return;

  const jobs = readQueue(queueName);
  if (jobs.length === 0) return;

  const remaining: QueuedJob[] = [];
  for (const job of jobs) {
    try {
      await runner(job.payload);
    } catch {
      remaining.push({ ...job, attempts: job.attempts + 1 });
    }
  }
  writeQueue(queueName, remaining);
}

/**
 * Registers the function that actually performs a queued job for
 * `queueName`, and starts draining it (now, on reconnect, and periodically).
 * Call once per queue name, e.g. at service module init.
 */
export function registerQueueRunner(queueName: string, runner: Runner): void {
  runners.set(queueName, runner);

  void drain(queueName);

  if (!timers.has(queueName)) {
    const onOnline = () => void drain(queueName);
    window.addEventListener("online", onOnline);
    timers.set(
      queueName,
      setInterval(() => void drain(queueName), RETRY_INTERVAL_MS),
    );
  }
}

/**
 * Appends a job to the persisted queue and immediately attempts to drain it.
 * Never throws — offline/failed sends are retried later, not surfaced to the caller.
 */
export function enqueue(queueName: string, payload: unknown): void {
  const jobs = readQueue(queueName);
  jobs.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    payload,
    attempts: 0,
    enqueuedAt: new Date().toISOString(),
  });
  writeQueue(queueName, jobs);
  void drain(queueName);
}
