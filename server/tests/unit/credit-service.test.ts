import { describe, expect, it, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  earn,
  spend,
  getBalance,
  getHistory,
  InsufficientCreditError,
} from "../../src/services/creditService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `credit-${suffix}-${Date.now()}@test.local`,
      password: "x",
      name: "Credit Tester",
    },
  });
}

describeIfDb("creditService", () => {
  beforeEach(async () => {
    // Clean slate — only our test users' rows.
    await prisma.userCredit.deleteMany({
      where: { user: { email: { contains: "credit-" } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: "credit-" } },
    });
  });

  it("earns 10 for an approved exam and records history", async () => {
    const user = await makeUser("earn");
    const res = await earn({
      userId: user.id,
      reason: "ExamApproved",
      refId: "exam-1",
    });
    expect(res.balance).toBe(10);

    const history = await getHistory(user.id);
    expect(history.entries).toHaveLength(1);
    expect(history.entries[0]).toMatchObject({
      type: "earn",
      amount: 10,
      reason: "ExamApproved",
      refId: "exam-1",
    });
  });

  it("spends 5 for a mock exam only when balance allows", async () => {
    const user = await makeUser("spend");
    await earn({ userId: user.id, reason: "ExamApproved" });
    await earn({ userId: user.id, reason: "ExamApproved" });

    const res = await spend({ userId: user.id, reason: "MockExamGenerate" });
    expect(res.balance).toBe(15);

    const balance = await getBalance(user.id);
    expect(balance.balance).toBe(15);
  });

  it("throws InsufficientCreditError when balance cannot cover spend", async () => {
    const user = await makeUser("insuff");
    await expect(
      spend({ userId: user.id, reason: "MockExamGenerate" })
    ).rejects.toBeInstanceOf(InsufficientCreditError);
  });

  it("history is returned newest-first with limit/offset", async () => {
    const user = await makeUser("hist");
    for (let i = 0; i < 3; i++) {
      await earn({ userId: user.id, reason: "PostExamReport", refId: `r${i}` });
      // Small delay so ISO timestamps differ (ms-level ordering).
      await new Promise((r) => setTimeout(r, 5));
    }
    const page = await getHistory(user.id, { limit: 2, offset: 0 });
    expect(page.total).toBe(3);
    expect(page.entries).toHaveLength(2);
    // Newest first.
    expect(page.entries[0].refId).toBe("r2");
  });

  it("parallel spends don't race past zero", async () => {
    const user = await makeUser("race");
    await earn({ userId: user.id, reason: "ExamApproved" }); // balance 10 → 2 mock exams

    const results = await Promise.allSettled([
      spend({ userId: user.id, reason: "MockExamGenerate" }),
      spend({ userId: user.id, reason: "MockExamGenerate" }),
      spend({ userId: user.id, reason: "MockExamGenerate" }),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const rejections = results.filter((r) => r.status === "rejected");
    expect(successes.length).toBeGreaterThanOrEqual(2);
    expect(rejections.length).toBeGreaterThanOrEqual(1);
    const balance = await getBalance(user.id);
    expect(balance.balance).toBeGreaterThanOrEqual(0);
  });
});
