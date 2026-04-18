import { z } from "zod";

/**
 * Zod schemas for Phase 7 endpoints. Mirrored in the client types so
 * both halves of the request shape stay in sync.
 */

export const specializationSchema = z.object({
  subject: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.array(z.string()).max(12).optional(),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
});

export const createTutorSchema = z.object({
  bio: z.string().min(20).max(2000),
  hourlyRate: z.number().int().positive().max(10_000),
  specializations: z.array(specializationSchema).min(1).max(10),
  availability: z.array(availabilitySchema).max(20),
});

export const matchTutorSchema = z.object({
  subject: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  priceMinTl: z.number().int().min(0).optional(),
  priceMaxTl: z.number().int().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const bookSessionSchema = z.object({
  tutorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().min(15).max(180),
});

export const completeSessionSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(2000).optional(),
});

export const createMarketplaceItemSchema = z.object({
  type: z.enum(["notes", "study_guide"]),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  priceTl: z.number().int().min(5).max(10_000),
  fileUrl: z.string().min(1),
  previewText: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
});

export const marketplaceSearchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["notes", "study_guide"]).optional(),
  priceMinTl: z.coerce.number().int().min(0).optional(),
  priceMaxTl: z.coerce.number().int().min(0).optional(),
  sort: z
    .enum(["recent", "popular", "price_asc", "price_desc"])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const initPaymentSchema = z.object({
  kind: z.enum(["subscription", "marketplace", "tutoring"]),
  amountKurus: z.number().int().positive(),
  callbackUrl: z.string().url(),
  metadata: z
    .object({
      marketplaceItemId: z.string().uuid().optional(),
      tutoringSessionId: z.string().uuid().optional(),
      subscriptionPlan: z.enum(["premium", "premium-plus"]).optional(),
    })
    .optional(),
});

export const hocaVerifySchema = z.object({
  universityEmail: z.string().email(),
});

export const universitySeatAddSchema = z.object({
  userEmail: z.string().email(),
});

export const universitySsoSchema = z.object({
  samlMetadata: z.string().min(100),
});
