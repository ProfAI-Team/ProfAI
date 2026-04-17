import { z } from "zod";

export const learningStyleSchema = z.object({
  learningStyle: z
    .enum(["reading", "kinesthetic", "visual", "auditory", "mixed"])
    .nullable(),
});

export const addGradeSchema = z.object({
  courseId: z.string().uuid().optional(),
  courseName: z.string().min(1).max(200),
  grade: z.number().min(0).max(100),
  credit: z.number().int().min(1).max(20),
  semester: z.string().min(1).max(40),
  letterGrade: z.string().max(4).optional(),
  university: z.enum(["aydin", "bogazici", "odtu"]).optional(),
});

export const simulateGradeSchema = z.object({
  courseName: z.string().min(1).max(200),
  hypotheticalGrade: z.number().min(0).max(100),
  credit: z.number().int().min(1).max(20),
  university: z.enum(["aydin", "bogazici", "odtu"]).optional(),
});

export const whatIfTargetSchema = z.object({
  targetGPA: z.number().min(0).max(4),
  courseName: z.string().min(1).max(200),
  credit: z.number().int().min(1).max(20),
  university: z.enum(["aydin", "bogazici", "odtu"]).optional(),
});

export const completeReviewSchema = z.object({
  correct: z.boolean(),
});

export const reviewFrequencySchema = z.object({
  reviewFrequency: z.enum(["daily", "weekly", "off"]),
});
