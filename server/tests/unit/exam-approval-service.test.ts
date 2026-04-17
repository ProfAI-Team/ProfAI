import { describe, expect, it, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  castApproval,
  getApprovalStats,
  listPending,
  ApprovalError,
  APPROVAL_THRESHOLD,
} from "../../src/services/examApprovalService";
import * as creditService from "../../src/services/creditService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `approval-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Approval Tester",
    },
  });
}

async function makeExamForUploader(uploader: { id: string }) {
  const prof = await prisma.professor.create({
    data: {
      name: `Prof Approval ${Date.now()}`,
      department: "CS",
      university: "Test U",
    },
  });
  const course = await prisma.course.create({
    data: {
      name: "Test Course",
      code: "TST101",
      professorId: prof.id,
    },
  });
  const exam = await prisma.exam.create({
    data: {
      courseId: course.id,
      examType: "MIDTERM",
      year: 2024,
      semester: "Spring",
      fileUrl: "/dev/null",
      uploadedById: uploader.id,
    },
  });
  return { exam, course, prof };
}

describeIfDb("examApprovalService", () => {
  beforeEach(async () => {
    await prisma.examApproval.deleteMany({
      where: { user: { email: { contains: "approval-" } } },
    });
    await prisma.userCredit.deleteMany({
      where: { user: { email: { contains: "approval-" } } },
    });
    const users = await prisma.user.findMany({
      where: { email: { contains: "approval-" } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length > 0) {
      await prisma.exam.deleteMany({ where: { uploadedById: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  });

  it("blocks the uploader from voting on their own exam", async () => {
    const uploader = await makeUser("owner");
    const { exam } = await makeExamForUploader(uploader);
    await expect(
      castApproval({ examId: exam.id, userId: uploader.id, approved: true })
    ).rejects.toBeInstanceOf(ApprovalError);
  });

  it("flips verified after the third approval and rewards the uploader once", async () => {
    const uploader = await makeUser("uploader");
    const { exam } = await makeExamForUploader(uploader);
    const voters = await Promise.all([
      makeUser("v1"),
      makeUser("v2"),
      makeUser("v3"),
    ]);

    for (let i = 0; i < APPROVAL_THRESHOLD - 1; i++) {
      const outcome = await castApproval({
        examId: exam.id,
        userId: voters[i].id,
        approved: true,
      });
      expect(outcome.exam.verified).toBe(false);
    }
    const third = await castApproval({
      examId: exam.id,
      userId: voters[2].id,
      approved: true,
    });
    expect(third.exam.verified).toBe(true);
    expect(third.justVerified).toBe(true);

    const balance = await creditService.getBalance(uploader.id);
    expect(balance.balance).toBe(10);

    // A fourth approval (by the same user toggling, or by someone else) must
    // not double-credit the uploader.
    const v4 = await makeUser("v4");
    await castApproval({ examId: exam.id, userId: v4.id, approved: true });
    const balanceAfter = await creditService.getBalance(uploader.id);
    expect(balanceAfter.balance).toBe(10);
  });

  it("listPending excludes your own uploads and exams you already voted on", async () => {
    const uploader = await makeUser("list-owner");
    const voter = await makeUser("list-voter");
    const { exam: a } = await makeExamForUploader(uploader);
    const { exam: b } = await makeExamForUploader(uploader);
    await castApproval({ examId: a.id, userId: voter.id, approved: true });

    const pendingForVoter = await listPending(voter.id);
    const ids = pendingForVoter.exams.map((e) => e.id);
    expect(ids).toContain(b.id);
    expect(ids).not.toContain(a.id);

    const pendingForOwner = await listPending(uploader.id);
    expect(pendingForOwner.exams.map((e) => e.id)).not.toContain(a.id);
    expect(pendingForOwner.exams.map((e) => e.id)).not.toContain(b.id);
  });

  it("getApprovalStats returns live counts", async () => {
    const uploader = await makeUser("stats-owner");
    const { exam } = await makeExamForUploader(uploader);
    const v1 = await makeUser("stats-v1");
    const v2 = await makeUser("stats-v2");
    await castApproval({ examId: exam.id, userId: v1.id, approved: true });
    await castApproval({ examId: exam.id, userId: v2.id, approved: false });
    const stats = await getApprovalStats(exam.id);
    expect(stats.approvalCount).toBe(1);
    expect(stats.rejectionCount).toBe(1);
    expect(stats.verified).toBe(false);
    expect(stats.flagged).toBe(false);
  });
});
