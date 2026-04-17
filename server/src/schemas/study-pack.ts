import { z } from "zod";

export const generateStudyPackSchema = z.object({
  professorId: z.string().min(1, "professorId is required"),
  noteIds: z
    .array(z.string().min(1))
    .min(1, "noteIds must be a non-empty array"),
});
export type GenerateStudyPackInput = z.infer<typeof generateStudyPackSchema>;
