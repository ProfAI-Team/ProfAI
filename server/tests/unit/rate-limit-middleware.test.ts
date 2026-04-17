import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";

import {
  studyPackHourlyLimiter,
  mockExamHourlyLimiter,
} from "../../src/middleware/rateLimitMiddleware";

const makeApp = (limiter: express.RequestHandler) => {
  const app = express();
  app.get("/limited", (req, _res, next) => {
    req.user = { id: "user-1", email: "t@t.co", name: "T" };
    next();
  }, limiter, (_req, res) => {
    res.json({ ok: true });
  });
  return app;
};

describe("rateLimitMiddleware", () => {
  it("allows requests under the study pack limit and blocks the sixth", async () => {
    const app = makeApp(studyPackHourlyLimiter);

    for (let i = 0; i < 5; i++) {
      const ok = await request(app).get("/limited");
      expect(ok.status).toBe(200);
    }

    const blocked = await request(app).get("/limited");
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
    expect(blocked.body.error.scope).toBe("study-pack:hourly");
    expect(blocked.body.error.retryAfterSec).toBeGreaterThan(0);
  });

  it("blocks the fourth mock exam request in the same hour", async () => {
    const app = makeApp(mockExamHourlyLimiter);

    for (let i = 0; i < 3; i++) {
      const ok = await request(app).get("/limited");
      expect(ok.status).toBe(200);
    }

    const blocked = await request(app).get("/limited");
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.scope).toBe("mock-exam:hourly");
  });
});
