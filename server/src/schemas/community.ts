import { z } from "zod";

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
export type PaginationQuery = z.output<typeof paginationQuerySchema>;

export const castApprovalSchema = z.object({
  approved: z.boolean(),
  reason: z.string().trim().min(1).max(500).optional(),
});
export type CastApprovalInput = z.output<typeof castApprovalSchema>;

export const voteQuestionSchema = z.object({
  direction: z.number().int().min(-1).max(1),
  cameOnExam: z.boolean().optional(),
});
export type VoteQuestionInput = z.output<typeof voteQuestionSchema>;

export const markCameOnExamSchema = z.object({
  cameOnExam: z.boolean(),
});
export type MarkCameOnExamInput = z.output<typeof markCameOnExamSchema>;

export const verifiedPoolQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
export type VerifiedPoolQuery = z.output<typeof verifiedPoolQuerySchema>;

const reportedTopicSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  frequency: z.enum(["once", "few", "many"]),
  difficulty: z.number().int().min(1).max(5),
});

export const postExamReportSchema = z.object({
  professorId: z.string().min(1),
  courseId: z.string().min(1).nullable().optional(),
  examDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  reportedTopics: z.array(reportedTopicSchema).min(1).max(20),
  notes: z.string().trim().max(2000).nullable().optional(),
  selfReportedGrade: z.number().int().min(0).max(100).nullable().optional(),
  selfReportedLetter: z
    .string()
    .trim()
    .max(3)
    .nullable()
    .optional(),
});
export type PostExamReportInput = z.output<typeof postExamReportSchema>;

export const aggregatedReportQuerySchema = z.object({
  windowMonths: z.coerce.number().int().min(1).max(24).optional(),
});
export type AggregatedReportQuery = z.output<typeof aggregatedReportQuerySchema>;

export const joinMatchmakingSchema = z.object({
  professorId: z.string().min(1),
  courseId: z.string().min(1).nullable().optional(),
  examDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .nullable()
    .optional(),
});
export type JoinMatchmakingInput = z.output<typeof joinMatchmakingSchema>;

export const submitLinkSchema = z.object({
  url: z.string().url().max(300),
});
export type SubmitLinkInput = z.output<typeof submitLinkSchema>;
