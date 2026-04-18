import type { Prisma } from "@prisma/client";
import { type ZodTypeAny, type z } from "zod";

import { featureLogger } from "./logger";

// Phase 6 task 6.5. Prisma's `Json` column returns `Prisma.JsonValue`,
// which TypeScript sees as a recursive `string | number | boolean |
// JsonObject | JsonArray | null`. Services reached for
// `value as unknown as X` to get a typed shape; a bad cast silently
// corrupts runtime behaviour. `parseJsonField<T>` swaps the cast for a
// Zod parse with a graceful empty-shape fallback + structured log, so
// malformed rows never crash callers.

const log = featureLogger("jsonField");

export function parseJsonField<S extends ZodTypeAny>(
  raw: Prisma.JsonValue | null | undefined,
  schema: S,
  fallback: z.output<S>,
  context?: { field?: string; userId?: string }
): z.output<S> {
  if (raw === null || raw === undefined) return fallback;

  const result = schema.safeParse(raw);
  if (!result.success) {
    log.warn(
      {
        field: context?.field,
        userId: context?.userId,
        issues: result.error.issues.slice(0, 3),
      },
      "malformed JSON field; using fallback shape"
    );
    return fallback;
  }

  return result.data;
}

/**
 * Callers that write back to Prisma go through `stringifyJsonField` so
 * the typed value gets widened to the loose `Prisma.InputJsonValue`
 * shape in exactly one place.
 */
export function stringifyJsonField<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}
