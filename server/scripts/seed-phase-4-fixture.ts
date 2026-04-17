/**
 * Phase 4 smoke fixture — seeds the demo user with community state so
 * the visual smoke pages (/credits, /approve-exams, /study-groups, the
 * ProfessorDetail aggregation panels) have something to render.
 *
 * Idempotent-ish: deletes anything with the "phase4fixture-" prefix in
 * user email or professor name, then re-creates it.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/seed-phase-4-fixture.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import * as creditService from "../src/services/creditService";
import { submitReport } from "../src/services/postExamReportService";
import { joinMatchmaking, submitExternalLink } from "../src/services/studyGroupService";

const prisma = new PrismaClient();

const DEMO_EMAIL = "erdemacar1@stu.aydin.edu.tr";

async function wipe() {
  // Anything we previously seeded here.
  const users = await prisma.user.findMany({
    where: { email: { contains: "phase4fixture-" } },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  if (userIds.length > 0) {
    await prisma.postExamReport.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.examApproval.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.userCredit.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.exam.deleteMany({ where: { uploadedById: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
  const profs = await prisma.professor.findMany({
    where: { name: { contains: "phase4fixture-" } },
    select: { id: true },
  });
  for (const p of profs) {
    // Study groups use implicit M2M so they auto-clean via the join table.
    await prisma.studyGroup.deleteMany({ where: { professorId: p.id } });
  }
  await prisma.professor.deleteMany({
    where: { name: { contains: "phase4fixture-" } },
  });
}

async function main() {
  await wipe();
  const password = await bcrypt.hash("phase4", 4);

  // Demo user must exist already (prod seed handles that). If not, bail.
  const demo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demo) {
    throw new Error(`Demo user ${DEMO_EMAIL} missing — run the main seed first.`);
  }

  // Fixture professor so we don't muddy real seeded ones.
  const professor = await prisma.professor.create({
    data: {
      name: "Peri Güneş (phase4fixture-demo)",
      department: "Bilgisayar Mühendisliği",
      university: "İstanbul Aydın Üniversitesi",
    },
  });
  const course = await prisma.course.create({
    data: {
      name: "Yazılım Proje Yönetimi",
      code: "UYG338",
      professorId: professor.id,
    },
  });

  // Uploaded exam (not by the demo user) so the approval wall has
  // something to render.
  const uploader = await prisma.user.create({
    data: {
      email: `phase4fixture-uploader-${Date.now()}@test.profai`,
      password,
      name: "Uploader",
    },
  });
  const exam = await prisma.exam.create({
    data: {
      courseId: course.id,
      examType: "MIDTERM",
      year: 2025,
      semester: "Güz",
      fileUrl: "/uploads/phase4fixture-demo.pdf",
      uploadedById: uploader.id,
    },
  });

  // Give the demo user a starter balance with a short history so the
  // credit dashboard has something to show.
  await creditService.earn({
    userId: demo.id,
    reason: "ExamApproved",
    refId: "phase4fixture-seed-1",
  });
  await creditService.earn({
    userId: demo.id,
    reason: "PostExamReport",
    refId: "phase4fixture-seed-2",
  });
  await creditService.spend({
    userId: demo.id,
    reason: "MockExamGenerate",
    refId: "phase4fixture-seed-3",
  });

  // Post-exam reports — enough to cross k-anonymity (10).
  for (let i = 0; i < 10; i++) {
    const reporter = await prisma.user.create({
      data: {
        email: `phase4fixture-reporter-${i}-${Date.now()}@test.profai`,
        password,
        name: `Reporter ${i}`,
      },
    });
    await submitReport({
      userId: reporter.id,
      professorId: professor.id,
      courseId: course.id,
      examDate: new Date(`2026-01-${10 + i}`),
      reportedTopics: [
        { topic: "Scrum Rolleri", frequency: "many", difficulty: 4 },
        {
          topic: "Proje Planlama",
          frequency: i < 4 ? "once" : "few",
          difficulty: 3,
        },
      ],
      notes: null,
      selfReportedGrade: i < 5 ? 92 + i : 72 + i,
    });
  }

  // Study group with demo user + a handful of other seekers so the
  // banner + index page have content.
  const joinRes = await joinMatchmaking({
    userId: demo.id,
    professorId: professor.id,
    examDate: new Date("2026-06-15"),
  });
  const members: string[] = [];
  for (let i = 0; i < 3; i++) {
    const seeker = await prisma.user.create({
      data: {
        email: `phase4fixture-seeker-${i}-${Date.now()}@test.profai`,
        password,
        name: `Seeker ${i}`,
      },
    });
    members.push(seeker.id);
    await joinMatchmaking({
      userId: seeker.id,
      professorId: professor.id,
      examDate: new Date("2026-06-14"),
    });
  }
  await submitExternalLink({
    groupId: joinRes.group.id,
    userId: demo.id,
    url: "https://chat.whatsapp.com/ABCDEFGHIJKLMNOP",
  });

  console.log("Phase 4 fixture seeded:");
  console.log("  demo user           :", demo.email);
  console.log("  professor           :", professor.name);
  console.log("  exam pending        :", exam.id);
  console.log("  study group         :", joinRes.group.id);
  console.log("  reporters/seekers   :", 10, "/", members.length);
}

main()
  .catch((err) => {
    console.error("Phase 4 fixture seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
