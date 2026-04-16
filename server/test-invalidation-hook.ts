import "dotenv/config";
import prisma from "./src/lib/prisma";
import {
  getOrBuildStyleProfile,
  invalidateStyleProfile,
} from "./src/services/professorStyleService";

async function main() {
  const prof = await prisma.professor.findFirst({
    where: { name: "Prof. Dr. Zehra Tan" },
  });
  if (!prof) throw new Error("Zehra Tan not seeded");

  console.log(`Professor: ${prof.name} (${prof.id})`);

  console.log(`\n1. Ensure profile exists and is fresh`);
  await getOrBuildStyleProfile(prof.id);
  let row = await prisma.professorStyleProfile.findUnique({
    where: { professorId: prof.id },
  });
  console.log(`   isStale=${row?.isStale} generatedAt=${row?.generatedAt.toISOString()}`);
  if (row?.isStale) throw new Error("Expected fresh profile");

  console.log(`\n2. Create a new Exam + ExamAnalysis (simulates upload)`);
  const course = await prisma.course.findFirst({ where: { professorId: prof.id } });
  if (!course) throw new Error("Prof has no course");
  const uploader = await prisma.user.findFirst();
  if (!uploader) throw new Error("No user seeded");

  const newExam = await prisma.exam.create({
    data: {
      courseId: course.id,
      examType: "MIDTERM",
      year: 2027,
      semester: "Bahar",
      fileUrl: "/uploads/__smoke_invalidation.pdf",
      uploadedById: uploader.id,
    },
  });
  await prisma.examAnalysis.create({
    data: {
      examId: newExam.id,
      questionCount: 20,
      questionTypes: { "Multiple Choice": 100, "Classic/Open-ended": 0, "True/False": 0 },
      topicDistribution: { "Test Topic": 100 },
      difficultyScore: 5.0,
      summary: "smoke test analysis",
    },
  });
  console.log(`   Created exam ${newExam.id}`);

  console.log(`\n3. Run invalidation hook (what examController does)`);
  await invalidateStyleProfile(prof.id);
  row = await prisma.professorStyleProfile.findUnique({
    where: { professorId: prof.id },
  });
  console.log(`   isStale=${row?.isStale}`);
  if (!row?.isStale) throw new Error("Invalidation failed — isStale should be true");

  console.log(`\n4. Next getOrBuild should rebuild (isStale back to false, new generatedAt)`);
  const before = row.generatedAt.getTime();
  const rebuilt = await getOrBuildStyleProfile(prof.id);
  if (rebuilt.status !== "ready") throw new Error("Expected ready after rebuild");
  const after = rebuilt.profile.generatedAt.getTime();
  console.log(
    `   isStale=${rebuilt.profile.isStale} generatedAt advanced by ${after - before}ms`
  );
  if (rebuilt.profile.isStale) throw new Error("Rebuild should clear isStale");
  if (after <= before) throw new Error("generatedAt should move forward");
  console.log(`   examSourceCount=${rebuilt.profile.examSourceCount} (was 6, now should be 7)`);

  console.log(`\n5. Cleanup — remove the fake exam so DB stays clean`);
  await prisma.examAnalysis.deleteMany({ where: { examId: newExam.id } });
  await prisma.exam.delete({ where: { id: newExam.id } });
  // Re-invalidate so subsequent runs rebuild with the original 6 exams.
  await invalidateStyleProfile(prof.id);
  console.log(`   Done. Invalidation hook verified end-to-end.`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
