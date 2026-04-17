import { describe, expect, it, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  submitReport,
  getAggregatedReport,
  listReportsForHighPerformers,
  K_ANONYMITY,
  HIGH_PERFORMER_K,
} from "../../src/services/postExamReportService";
import * as creditService from "../../src/services/creditService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `report-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Report Tester",
    },
  });
}

async function makeProfessor(suffix: string) {
  return prisma.professor.create({
    data: {
      name: `Prof Report ${suffix}`,
      department: "CS",
      university: "Test U",
    },
  });
}

describeIfDb("postExamReportService", () => {
  beforeEach(async () => {
    await prisma.postExamReport.deleteMany({
      where: { user: { email: { contains: "report-" } } },
    });
    await prisma.userCredit.deleteMany({
      where: { user: { email: { contains: "report-" } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: "report-" } },
    });
    await prisma.professor.deleteMany({
      where: { name: { contains: "Prof Report" } },
    });
  });

  it("rewards +5 credit on first submit but not on resubmit of the same exam", async () => {
    const user = await makeUser("credit");
    const prof = await makeProfessor("credit");
    const examDate = new Date("2026-01-15");

    const first = await submitReport({
      userId: user.id,
      professorId: prof.id,
      examDate,
      reportedTopics: [{ topic: "Scrum", frequency: "many", difficulty: 3 }],
    });
    expect(first.isNew).toBe(true);

    const second = await submitReport({
      userId: user.id,
      professorId: prof.id,
      examDate,
      reportedTopics: [{ topic: "Scrum", frequency: "many", difficulty: 4 }],
    });
    expect(second.isNew).toBe(false);

    const balance = await creditService.getBalance(user.id);
    expect(balance.balance).toBe(5);
  });

  it("refuses to disclose aggregates below the k-anonymity threshold", async () => {
    const prof = await makeProfessor("k-anon");
    for (let i = 0; i < K_ANONYMITY - 1; i++) {
      const u = await makeUser(`ka-${i}`);
      await submitReport({
        userId: u.id,
        professorId: prof.id,
        examDate: new Date("2026-02-01"),
        reportedTopics: [{ topic: "Hash", frequency: "few", difficulty: 3 }],
      });
    }
    const agg = await getAggregatedReport(prof.id);
    expect(agg.status).toBe("insufficient");
    if (agg.status === "insufficient") {
      expect(agg.count).toBe(K_ANONYMITY - 1);
    }
  });

  it("aggregates topic frequency mode + median difficulty at ≥K reports", async () => {
    const prof = await makeProfessor("ready");
    for (let i = 0; i < K_ANONYMITY; i++) {
      const u = await makeUser(`ready-${i}`);
      await submitReport({
        userId: u.id,
        professorId: prof.id,
        examDate: new Date(`2026-03-${10 + i}`),
        reportedTopics: [
          { topic: "Scrum Roles", frequency: "many", difficulty: 4 },
          { topic: "Graph", frequency: i < 3 ? "once" : "few", difficulty: 2 },
        ],
      });
    }
    const agg = await getAggregatedReport(prof.id);
    expect(agg.status).toBe("ready");
    if (agg.status === "ready") {
      const scrum = agg.topics.find((t) => t.topic === "Scrum Roles");
      expect(scrum?.frequencyMode).toBe("many");
      expect(scrum?.medianDifficulty).toBe(4);
      const graph = agg.topics.find((t) => t.topic === "Graph");
      expect(graph?.frequencyMode).toBe("few");
    }
  });

  it("listReportsForHighPerformers filters on self-reported grade", async () => {
    const prof = await makeProfessor("high-perf");
    for (let i = 0; i < HIGH_PERFORMER_K + 2; i++) {
      const u = await makeUser(`hp-${i}`);
      await submitReport({
        userId: u.id,
        professorId: prof.id,
        examDate: new Date(`2026-04-${5 + i}`),
        reportedTopics: [
          {
            topic: "Agile",
            frequency: "many",
            difficulty: 3,
          },
        ],
        selfReportedGrade: i < HIGH_PERFORMER_K ? 90 : 70,
      });
    }
    const rows = await listReportsForHighPerformers(prof.id);
    expect(rows).toHaveLength(HIGH_PERFORMER_K);
  });

  it("anonymizedHash does not equal the userId", async () => {
    const user = await makeUser("hash");
    const prof = await makeProfessor("hash");
    await submitReport({
      userId: user.id,
      professorId: prof.id,
      examDate: new Date("2026-01-01"),
      reportedTopics: [{ topic: "x", frequency: "once", difficulty: 1 }],
    });
    const row = await prisma.postExamReport.findFirst({
      where: { userId: user.id },
      select: { anonymizedHash: true },
    });
    expect(row?.anonymizedHash).toBeDefined();
    expect(row?.anonymizedHash).not.toBe(user.id);
    // sha256 hex string.
    expect(row?.anonymizedHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
