import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { parseOrRespond } from "../../src/lib/validation";
import { generateMockExamSchema } from "../../src/schemas/mock-exam";
import { generateStudyPackSchema } from "../../src/schemas/study-pack";

function mockRes() {
  const res: { statusCode?: number; body?: unknown } = {};
  return {
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return {
        json: vi.fn((body: unknown) => {
          res.body = body;
        }),
      };
    }),
    _inspect: () => res,
  } as unknown as Response & { _inspect: () => typeof res };
}

describe("parseOrRespond", () => {
  it("returns parsed output with defaults applied", () => {
    const schema = z.object({
      name: z.string(),
      admin: z.boolean().default(false),
    });
    const res = mockRes();
    const result = parseOrRespond(schema, { name: "ada" }, res as any);
    expect(result).toEqual({ name: "ada", admin: false });
  });

  it("returns null and sends 400 with VALIDATION_FAILED on bad input", () => {
    const schema = z.object({ count: z.number().int() });
    const res = mockRes();
    const result = parseOrRespond(schema, { count: "three" }, res as any);
    expect(result).toBeNull();
    const inspected = (res as any)._inspect();
    expect(inspected.statusCode).toBe(400);
    expect(inspected.body.error.code).toBe("VALIDATION_FAILED");
  });
});

describe("generateMockExamSchema", () => {
  it("requires professorId", () => {
    const result = generateMockExamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects durationMin below 15", () => {
    const result = generateMockExamSchema.safeParse({
      professorId: "p",
      durationMin: 10,
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal valid payload", () => {
    const result = generateMockExamSchema.safeParse({ professorId: "p" });
    expect(result.success).toBe(true);
  });
});

describe("generateStudyPackSchema", () => {
  it("rejects empty noteIds", () => {
    const result = generateStudyPackSchema.safeParse({
      professorId: "p",
      noteIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts non-empty noteIds", () => {
    const result = generateStudyPackSchema.safeParse({
      professorId: "p",
      noteIds: ["a", "b"],
    });
    expect(result.success).toBe(true);
  });
});
