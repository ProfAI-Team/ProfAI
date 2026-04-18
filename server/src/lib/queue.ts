import { Queue, Worker, type JobsOptions, type WorkerOptions } from "bullmq";
import IORedis, { type Redis } from "ioredis";
import { featureLogger } from "./logger";

const queueLog = featureLogger("queue");

/**
 * Queue + worker registry backed by BullMQ + Redis.
 *
 * Why this abstraction instead of calling BullMQ directly in each caller:
 * - single Redis connection (`getConnection`) — BullMQ requires
 *   `maxRetriesPerRequest: null` for Workers, easy to forget.
 * - test-mode inline executor (`RUN_INLINE_QUEUE=1`) so unit tests
 *   don't need a live Redis — the handler runs synchronously when the
 *   job is enqueued.
 * - graceful shutdown (`closeAll`) — wired to `process.on("SIGTERM")`
 *   in the job runner so in-flight jobs drain.
 *
 * Workers are typically started by `src/jobs/runner.ts` when
 * `RUN_JOBS=1`. Web processes enqueue without registering workers, so
 * job execution can scale independently in production.
 */

let connection: Redis | null = null;

function getConnection(): Redis {
  if (!connection) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    connection = new IORedis(url, {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();
const inlineHandlers = new Map<string, (data: unknown) => Promise<void>>();

function isInlineMode(): boolean {
  return process.env.RUN_INLINE_QUEUE === "1";
}

export function getQueue<T = unknown>(name: string): Queue<T> {
  let q = queues.get(name);
  if (!q) {
    q = new Queue<T>(name, { connection: getConnection() });
    queues.set(name, q);
  }
  return q as Queue<T>;
}

/**
 * Enqueue a job. In inline mode the registered handler runs on the same
 * tick and the returned promise resolves when the handler completes.
 */
export async function enqueue<T>(
  queueName: string,
  data: T,
  options?: JobsOptions
): Promise<void> {
  if (isInlineMode()) {
    const handler = inlineHandlers.get(queueName);
    if (!handler) {
      throw new Error(
        `Inline queue: no handler registered for queue "${queueName}". ` +
          "Call registerWorker() before enqueue() in tests."
      );
    }
    await handler(data);
    return;
  }
  await getQueue(queueName).add(queueName, data, options);
}

/**
 * Register a worker. In inline mode the handler is stored in-process
 * and invoked by `enqueue`. In live mode a BullMQ Worker subscribes
 * to the queue.
 */
export function registerWorker<T>(
  queueName: string,
  handler: (data: T) => Promise<void>,
  options?: Omit<WorkerOptions, "connection">
): Worker | null {
  if (isInlineMode()) {
    inlineHandlers.set(queueName, handler as (data: unknown) => Promise<void>);
    return null;
  }
  if (workers.has(queueName)) {
    return workers.get(queueName)!;
  }
  const worker = new Worker<T>(
    queueName,
    async (job) => {
      await handler(job.data);
    },
    { connection: getConnection(), ...options }
  );
  worker.on("failed", (job, err) => {
    queueLog.error(
      { queue: queueName, jobId: job?.id, err },
      "job failed"
    );
  });
  workers.set(queueName, worker);
  return worker;
}

/**
 * Repeat-schedule a job using BullMQ cron syntax. No-op in inline mode
 * (tests that want to exercise the handler call `enqueue` directly).
 */
export async function scheduleRepeating<T>(
  queueName: string,
  jobName: string,
  data: T,
  cron: string
): Promise<void> {
  if (isInlineMode()) {
    return;
  }
  await getQueue(queueName).add(jobName, data, {
    repeat: { pattern: cron },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
  });
}

export async function closeAll(): Promise<void> {
  for (const worker of workers.values()) {
    await worker.close();
  }
  for (const queue of queues.values()) {
    await queue.close();
  }
  if (connection) {
    connection.disconnect();
    connection = null;
  }
  workers.clear();
  queues.clear();
  inlineHandlers.clear();
}
