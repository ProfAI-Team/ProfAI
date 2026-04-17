import { z } from "zod";

export const generateMockExamSchema = z.object({
  professorId: z.string().min(1, "professorId is required"),
  studyPackId: z.string().min(1).nullable().optional(),
  noteIds: z.array(z.string().min(1)).optional(),
  questionCount: z.number().int().min(5).max(50).optional(),
  durationMin: z.number().int().min(15).max(240).optional(),
});
export type GenerateMockExamInput = z.output<typeof generateMockExamSchema>;

export const submitMockExamSchema = z.object({
  answers: z.array(
    z.object({
      qIdx: z.number().int().min(0),
      answer: z.string().default(""),
      timeSpentSec: z.number().int().min(0).optional(),
      flagged: z.boolean().default(false),
    })
  ),
  autoSubmitted: z.boolean().default(false),
});
export type SubmitMockExamInput = z.output<typeof submitMockExamSchema>;

export const panicPlanSchema = z.object({
  professorId: z.string().min(1),
  hoursUntilExam: z.number().positive().max(168),
  mockExamSessionId: z.string().min(1).optional(),
});
export type PanicPlanInput = z.output<typeof panicPlanSchema>;
