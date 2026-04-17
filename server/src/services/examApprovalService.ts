import { Prisma } from "@prisma/client";

import prisma from "../lib/prisma";
import * as creditService from "./creditService";
import { invalidateStyleProfile } from "./professorStyleService";
import { invalidateDNA } from "./dnaService";
import { invalidateStudyPacksForProfessor } from "./studyPackService";
import { invalidateMockExamsForProfessor } from "./mockExamService";

export const APPROVAL_THRESHOLD = 3;
export const FLAG_THRESHOLD = 3;

export class ApprovalError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export type ApprovalOutcome = {
  exam: {
    id: string;
    verified: boolean;
    flagged: boolean;
    verifiedAt: Date | null;
  };
  approvalCount: number;
  rejectionCount: number;
  justVerified: boolean;
  justFlagged: boolean;
};

/**
 * Cast (or update) an approval vote.
 *
 * - Uploader cannot vote on their own exam.
 * - One row per (exam, user); toggling direction updates the existing row.
 * - When the positive count crosses ≥ APPROVAL_THRESHOLD and the exam is
 *   not yet verified, flips `verified = true`, rewards the uploader with
 *   credits, and invalidates every cache (style profile, study pack, mock
 *   exam) that might have seen the exam in its pre-verified state.
 * - Symmetrically, ≥ FLAG_THRESHOLD rejections flip `flagged = true`. The
 *   row is NOT hidden — moderation UI surfaces it, and Phase 5 adds the
 *   real removal flow.
 */
export async function castApproval(params: {
  examId: string;
  userId: string;
  approved: boolean;
  reason?: string;
}): Promise<ApprovalOutcome> {
  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    select: {
      id: true,
      uploadedById: true,
      course: { select: { professorId: true } },
      verified: true,
      verifiedAt: true,
      flagged: true,
    },
  });
  if (!exam) {
    throw new ApprovalError("NOT_FOUND", "Exam not found.");
  }
  if (exam.uploadedById === params.userId) {
    throw new ApprovalError(
      "OWN_UPLOAD",
      "You cannot vote on your own upload."
    );
  }

  const professorId = exam.course.professorId;
  let justVerified = false;
  let justFlagged = false;

  const result = await prisma.$transaction(async (tx) => {
    await tx.examApproval.upsert({
      where: {
        examId_userId: { examId: params.examId, userId: params.userId },
      },
      create: {
        examId: params.examId,
        userId: params.userId,
        approved: params.approved,
        reason: params.reason,
      },
      update: {
        approved: params.approved,
        reason: params.reason,
      },
    });

    const [approvalCount, rejectionCount] = await Promise.all([
      tx.examApproval.count({
        where: { examId: params.examId, approved: true },
      }),
      tx.examApproval.count({
        where: { examId: params.examId, approved: false },
      }),
    ]);

    let verified = exam.verified;
    let verifiedAt: Date | null = exam.verifiedAt;
    let flagged = exam.flagged;

    if (!verified && approvalCount >= APPROVAL_THRESHOLD) {
      const now = new Date();
      await tx.exam.update({
        where: { id: params.examId },
        data: { verified: true, verifiedAt: now },
      });
      verified = true;
      verifiedAt = now;
      justVerified = true;
      // Reward the uploader exactly once — the exam.verified flag is our
      // idempotency guard.
      await creditService.earn({
        userId: exam.uploadedById,
        reason: "ExamApproved",
        refId: exam.id,
        tx,
      });
    }

    if (!flagged && rejectionCount >= FLAG_THRESHOLD) {
      await tx.exam.update({
        where: { id: params.examId },
        data: { flagged: true },
      });
      flagged = true;
      justFlagged = true;
    }

    return {
      exam: { id: exam.id, verified, flagged, verifiedAt },
      approvalCount,
      rejectionCount,
      justVerified,
      justFlagged,
    } satisfies ApprovalOutcome;
  });

  // Invalidate downstream caches only after the transaction commits —
  // doing it inside the tx risks a dirty state if a later step throws.
  if (result.justVerified && professorId) {
    // Uploader + every approver who pushed this exam past the threshold
    // now have new source data that could shift their DNA — mark their
    // academic_dna rows stale so the next read recomputes.
    const approvers = await prisma.examApproval.findMany({
      where: { examId: params.examId, approved: true },
      select: { userId: true },
    });
    const dnaUserIds = [
      ...new Set([
        exam.uploadedById,
        ...approvers.map((a) => a.userId),
      ]),
    ];

    await Promise.all([
      invalidateStyleProfile(professorId),
      invalidateStudyPacksForProfessor(professorId),
      invalidateMockExamsForProfessor(professorId),
      invalidateDNA(dnaUserIds),
    ]);
  }

  return result;
}

/**
 * Pending approvals queue for a user: exams they haven't voted on and
 * haven't uploaded, verified or not. Newest first, paged.
 */
export async function listPending(
  userId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<{
  total: number;
  exams: Array<{
    id: string;
    year: number;
    semester: string;
    examType: string;
    createdAt: Date;
    verified: boolean;
    flagged: boolean;
    course: { id: string; name: string; code: string };
    professor: { id: string; name: string };
  }>;
}> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const offset = Math.max(opts.offset ?? 0, 0);

  const where: Prisma.ExamWhereInput = {
    uploadedById: { not: userId },
    approvals: { none: { userId } },
  };

  const [total, rows] = await Promise.all([
    prisma.exam.count({ where }),
    prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        course: { include: { professor: true } },
      },
    }),
  ]);

  return {
    total,
    exams: rows.map((e) => ({
      id: e.id,
      year: e.year,
      semester: e.semester,
      examType: e.examType,
      createdAt: e.createdAt,
      verified: e.verified,
      flagged: e.flagged,
      course: {
        id: e.course.id,
        name: e.course.name,
        code: e.course.code,
      },
      professor: {
        id: e.course.professor.id,
        name: e.course.professor.name,
      },
    })),
  };
}

/** Snapshot of current approval state for an exam (used by the UI). */
export async function getApprovalStats(examId: string): Promise<{
  approvalCount: number;
  rejectionCount: number;
  verified: boolean;
  flagged: boolean;
}> {
  const [approvalCount, rejectionCount, exam] = await Promise.all([
    prisma.examApproval.count({ where: { examId, approved: true } }),
    prisma.examApproval.count({ where: { examId, approved: false } }),
    prisma.exam.findUnique({
      where: { id: examId },
      select: { verified: true, flagged: true },
    }),
  ]);
  return {
    approvalCount,
    rejectionCount,
    verified: exam?.verified ?? false,
    flagged: exam?.flagged ?? false,
  };
}
