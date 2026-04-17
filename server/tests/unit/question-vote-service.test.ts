import { describe, expect, it, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  voteQuestion,
  markCameOnExam,
  getQuestionStats,
  getUserVote,
  getVerifiedPool,
  questionIdFor,
  VERIFIED_THRESHOLD,
} from "../../src/services/questionVoteService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `vote-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Vote Tester",
    },
  });
}

describeIfDb("questionVoteService", () => {
  beforeEach(async () => {
    await prisma.questionVote.deleteMany({
      where: { user: { email: { contains: "vote-" } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: "vote-" } } });
  });

  it("builds stable synthetic question IDs", () => {
    expect(
      questionIdFor({ kind: "mockExam", sourceId: "abc", idx: 3 })
    ).toBe("mockExam:abc:q3");
    expect(
      questionIdFor({ kind: "studyPack", sourceId: "xyz", idx: 0 })
    ).toBe("studyPack:xyz:q0");
  });

  it("aggregates upvotes and downvotes per question", async () => {
    const qid = "mockExam:aggregate:q0";
    const users = await Promise.all([
      makeUser("a1"),
      makeUser("a2"),
      makeUser("a3"),
    ]);
    await voteQuestion({ questionId: qid, userId: users[0].id, direction: 1 });
    await voteQuestion({ questionId: qid, userId: users[1].id, direction: 1 });
    await voteQuestion({ questionId: qid, userId: users[2].id, direction: -1 });

    const stats = await getQuestionStats(qid);
    expect(stats.upvotes).toBe(2);
    expect(stats.downvotes).toBe(1);
    expect(stats.verified).toBe(false);
  });

  it("toggling direction updates the existing row (no duplicate votes)", async () => {
    const qid = "mockExam:toggle:q0";
    const user = await makeUser("toggle");
    await voteQuestion({ questionId: qid, userId: user.id, direction: 1 });
    await voteQuestion({ questionId: qid, userId: user.id, direction: -1 });

    const stats = await getQuestionStats(qid);
    expect(stats.upvotes).toBe(0);
    expect(stats.downvotes).toBe(1);
  });

  it("direction 0 removes the vote (unvote)", async () => {
    const qid = "mockExam:unvote:q0";
    const user = await makeUser("unvote");
    await voteQuestion({ questionId: qid, userId: user.id, direction: 1 });
    await voteQuestion({ questionId: qid, userId: user.id, direction: 0 });
    const row = await getUserVote({ questionId: qid, userId: user.id });
    expect(row).toBeNull();
  });

  it("cameOnExam is tracked independently from direction", async () => {
    const qid = "mockExam:came:q0";
    const user = await makeUser("came");
    const res = await markCameOnExam({
      questionId: qid,
      userId: user.id,
      cameOnExam: true,
    });
    expect(res.cameOnExamCount).toBe(1);

    const stats = await getQuestionStats(qid);
    expect(stats.cameOnExamCount).toBe(1);
  });

  it("getVerifiedPool returns only questions with net ≥ threshold", async () => {
    const qidVerified = "mockExam:verified:q0";
    const qidMeh = "mockExam:meh:q0";
    const voters = await Promise.all(
      Array.from({ length: VERIFIED_THRESHOLD + 1 }, (_, i) =>
        makeUser(`verified-${i}`)
      )
    );
    for (const v of voters) {
      await voteQuestion({
        questionId: qidVerified,
        userId: v.id,
        direction: 1,
      });
    }
    const single = await makeUser("meh");
    await voteQuestion({ questionId: qidMeh, userId: single.id, direction: 1 });

    const pool = await getVerifiedPool();
    const ids = pool.questions.map((q) => q.questionId);
    expect(ids).toContain(qidVerified);
    expect(ids).not.toContain(qidMeh);
  });
});
