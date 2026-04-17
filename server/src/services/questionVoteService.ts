import prisma from "../lib/prisma";

export const VERIFIED_THRESHOLD = 10;

export class VoteError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Synthetic questionId format. Kept here so all callers (mockExam result
 * page, study pack practice list, approval wall) share the same namespace.
 */
export function questionIdFor(source: {
  kind: "studyPack" | "mockExam";
  sourceId: string;
  idx: number;
}): string {
  return `${source.kind}:${source.sourceId}:q${source.idx}`;
}

/**
 * Upsert a vote for an AI-generated question.
 *
 * - `direction` is -1 or +1 (we do not store 0; to "unvote", delete via
 *   passing direction: 0 which removes the row).
 * - `cameOnExam` is orthogonal to direction: a student can upvote a
 *   question AND say the real exam asked it later. Both signals feed
 *   different aggregations (verified pool vs. prediction accuracy).
 * - Rate limiting is handled by the route middleware (50/day); this
 *   service does not rate-limit itself so internal callers can also use
 *   it freely.
 */
export async function voteQuestion(params: {
  questionId: string;
  userId: string;
  direction: -1 | 0 | 1;
  cameOnExam?: boolean;
}): Promise<{
  direction: -1 | 0 | 1;
  upvotes: number;
  downvotes: number;
  cameOnExamCount: number;
  verified: boolean;
}> {
  if (params.direction === 0) {
    await prisma.questionVote
      .delete({
        where: {
          questionId_userId: {
            questionId: params.questionId,
            userId: params.userId,
          },
        },
      })
      .catch(() => {
        // Swallow "record not found" — idempotent unvote.
      });
  } else {
    await prisma.questionVote.upsert({
      where: {
        questionId_userId: {
          questionId: params.questionId,
          userId: params.userId,
        },
      },
      create: {
        questionId: params.questionId,
        userId: params.userId,
        direction: params.direction,
        cameOnExam: params.cameOnExam ?? null,
      },
      update: {
        direction: params.direction,
        ...(params.cameOnExam !== undefined
          ? { cameOnExam: params.cameOnExam }
          : {}),
      },
    });
  }

  return getQuestionStats(params.questionId);
}

/**
 * Flag a question as "I saw this on the real exam". Idempotent: calling
 * twice with the same boolean has no extra effect. Allowed without a
 * direction vote, in which case a direction:1 row is created to keep
 * the composite PK populated.
 */
export async function markCameOnExam(params: {
  questionId: string;
  userId: string;
  cameOnExam: boolean;
}): Promise<{ cameOnExamCount: number }> {
  await prisma.questionVote.upsert({
    where: {
      questionId_userId: {
        questionId: params.questionId,
        userId: params.userId,
      },
    },
    create: {
      questionId: params.questionId,
      userId: params.userId,
      direction: params.cameOnExam ? 1 : 0,
      cameOnExam: params.cameOnExam,
    },
    update: {
      cameOnExam: params.cameOnExam,
    },
  });
  const { cameOnExamCount } = await getQuestionStats(params.questionId);
  return { cameOnExamCount };
}

export async function getQuestionStats(questionId: string): Promise<{
  direction: -1 | 0 | 1;
  upvotes: number;
  downvotes: number;
  cameOnExamCount: number;
  verified: boolean;
}> {
  const votes = await prisma.questionVote.findMany({
    where: { questionId },
    select: { direction: true, cameOnExam: true },
  });
  const upvotes = votes.filter((v) => v.direction === 1).length;
  const downvotes = votes.filter((v) => v.direction === -1).length;
  const cameOnExamCount = votes.filter((v) => v.cameOnExam === true).length;
  const net = upvotes - downvotes;
  return {
    direction: 0,
    upvotes,
    downvotes,
    cameOnExamCount,
    verified: net >= VERIFIED_THRESHOLD,
  };
}

export async function getUserVote(params: {
  questionId: string;
  userId: string;
}): Promise<{ direction: -1 | 0 | 1; cameOnExam: boolean | null } | null> {
  const vote = await prisma.questionVote.findUnique({
    where: {
      questionId_userId: {
        questionId: params.questionId,
        userId: params.userId,
      },
    },
  });
  if (!vote) return null;
  return {
    direction: (vote.direction === 1 ? 1 : vote.direction === -1 ? -1 : 0) as
      | -1
      | 0
      | 1,
    cameOnExam: vote.cameOnExam,
  };
}

/**
 * Verified question pool — the signature Phase 4 UX surface. Returns
 * question IDs whose net score ≥ VERIFIED_THRESHOLD, newest first.
 *
 * We intentionally do not return the question body here: callers (study
 * pack page, mock exam review tab) already own the body and join on
 * questionId client-side. That keeps this endpoint cache-friendly (only
 * aggregates) and avoids re-exposing questions that may have been
 * expired from a mock exam.
 */
export async function getVerifiedPool(opts: {
  limit?: number;
  offset?: number;
} = {}): Promise<{
  total: number;
  questions: Array<{
    questionId: string;
    upvotes: number;
    downvotes: number;
    net: number;
    cameOnExamCount: number;
  }>;
}> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);

  const grouped = await prisma.questionVote.groupBy({
    by: ["questionId"],
    _sum: { direction: true },
    orderBy: { _sum: { direction: "desc" } },
  });

  const filtered = grouped.filter(
    (g) => (g._sum.direction ?? 0) >= VERIFIED_THRESHOLD
  );
  const slice = filtered.slice(offset, offset + limit);

  const detailed = await Promise.all(
    slice.map(async (g) => {
      const stats = await getQuestionStats(g.questionId);
      return {
        questionId: g.questionId,
        upvotes: stats.upvotes,
        downvotes: stats.downvotes,
        net: stats.upvotes - stats.downvotes,
        cameOnExamCount: stats.cameOnExamCount,
      };
    })
  );

  return { total: filtered.length, questions: detailed };
}
