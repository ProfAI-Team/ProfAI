import { describe, expect, it, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import { submitReport } from "../../src/services/postExamReportService";
import { getHighPerformerStrategy } from "../../src/services/highPerformerInsightService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `hp-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "HP Tester",
    },
  });
}
async function makeProfessor(suffix: string) {
  return prisma.professor.create({
    data: {
      name: `Prof HP ${suffix} ${Date.now()}`,
      department: "CS",
      university: "Test U",
    },
  });
}

describeIfDb("getHighPerformerStrategy", () => {
  beforeEach(async () => {
    await prisma.postExamReport.deleteMany({
      where: { user: { email: { contains: "hp-" } } },
    });
    await prisma.userCredit.deleteMany({
      where: { user: { email: { contains: "hp-" } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: "hp-" } } });
    await prisma.professor.deleteMany({
      where: { name: { contains: "Prof HP" } },
    });
  });

  it("returns insufficient when fewer than K high-performer reports exist", async () => {
    const prof = await makeProfessor("insuff");
    for (let i = 0; i < 3; i++) {
      const u = await makeUser(`hp-${i}`);
      await submitReport({
        userId: u.id,
        professorId: prof.id,
        examDate: new Date(`2026-04-${1 + i}`),
        reportedTopics: [{ topic: "x", frequency: "many", difficulty: 3 }],
        selfReportedGrade: 95,
      });
    }
    const res = await getHighPerformerStrategy(prof.id);
    expect(res.status).toBe("insufficient");
  });

  it("ranks topics by coverage and filters under-60% topics", async () => {
    const prof = await makeProfessor("ranked");
    // 5 high performers. 5/5 cover "Scrum Roles". 2/5 cover "Noise".
    for (let i = 0; i < 5; i++) {
      const u = await makeUser(`ranked-${i}`);
      const topics: Array<{
        topic: string;
        frequency: "once" | "few" | "many";
        difficulty: number;
      }> = [
        { topic: "Scrum Roles", frequency: "many", difficulty: 4 },
      ];
      if (i < 2) {
        topics.push({ topic: "Noise", frequency: "once", difficulty: 2 });
      }
      await submitReport({
        userId: u.id,
        professorId: prof.id,
        examDate: new Date(`2026-04-${10 + i}`),
        reportedTopics: topics,
        selfReportedGrade: 90 + i,
      });
    }
    const res = await getHighPerformerStrategy(prof.id);
    expect(res.status).toBe("ready");
    if (res.status === "ready") {
      expect(res.topics.map((t) => t.topic)).toEqual(["Scrum Roles"]);
      expect(res.topics[0].coveragePct).toBe(100);
      expect(res.topics[0].dominantFrequency).toBe("many");
    }
  });
});
