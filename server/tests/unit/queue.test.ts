import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("queue inline mode", () => {
  beforeEach(() => {
    process.env.RUN_INLINE_QUEUE = "1";
    // Reset module cache so the in-process registry starts clean per
    // test. Singleton state leaking across tests masked a real bug
    // the first time we ran this.
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.RUN_INLINE_QUEUE;
  });

  it("runs the registered handler synchronously when a job is enqueued", async () => {
    const { registerWorker, enqueue, closeAll } = await import(
      "../../src/lib/queue"
    );
    const seen: string[] = [];

    registerWorker<{ note: string }>("test-queue", async (data) => {
      seen.push(data.note);
    });

    await enqueue("test-queue", { note: "hello" });
    await enqueue("test-queue", { note: "world" });

    expect(seen).toEqual(["hello", "world"]);

    await closeAll();
  });

  it("throws if enqueue is called before the worker is registered", async () => {
    const { enqueue, closeAll } = await import("../../src/lib/queue");

    await expect(enqueue("unregistered", { x: 1 })).rejects.toThrow(
      /no handler registered/
    );

    await closeAll();
  });

  it("scheduleRepeating is a no-op in inline mode", async () => {
    const { scheduleRepeating, closeAll } = await import(
      "../../src/lib/queue"
    );

    // Should resolve without hitting Redis.
    await expect(
      scheduleRepeating("any", "name", {}, "0 2 * * *")
    ).resolves.toBeUndefined();

    await closeAll();
  });

  it("propagates handler errors to the enqueue caller", async () => {
    const { registerWorker, enqueue, closeAll } = await import(
      "../../src/lib/queue"
    );

    registerWorker<unknown>("boom", async () => {
      throw new Error("planned failure");
    });

    await expect(enqueue("boom", {})).rejects.toThrow("planned failure");

    await closeAll();
  });
});
