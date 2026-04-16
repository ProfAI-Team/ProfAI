import "dotenv/config";
import {
  aggregateFromExams,
  getOrBuildStyleProfile,
  invalidateStyleProfile,
} from "./src/services/professorStyleService";
import prisma from "./src/lib/prisma";

async function main() {
  // Professor with 6 analyzed exams — good aggregation sample.
  const prof = await prisma.professor.findFirst({
    where: { name: "Prof. Dr. Zehra Tan" },
  });
  if (!prof) throw new Error("Test professor not seeded");

  console.log(`\n── aggregateFromExams(${prof.name}) ──`);
  const agg = await aggregateFromExams(prof.id);
  console.log(JSON.stringify(agg, null, 2));

  console.log(`\n── getOrBuildStyleProfile — first call (miss) ──`);
  const t1 = Date.now();
  const first = await getOrBuildStyleProfile(prof.id);
  console.log(`took ${Date.now() - t1}ms; status=${first.status}`);
  if (first.status === "ready") {
    console.log(`summary=${first.profile.geminiSummary}`);
    console.log(`examSourceCount=${first.profile.examSourceCount}`);
    console.log(`generatedAt=${first.profile.generatedAt.toISOString()}`);
  }

  console.log(`\n── getOrBuildStyleProfile — second call (cache hit) ──`);
  const t2 = Date.now();
  const second = await getOrBuildStyleProfile(prof.id);
  console.log(`took ${Date.now() - t2}ms; status=${second.status}`);

  console.log(`\n── invalidate + rebuild ──`);
  await invalidateStyleProfile(prof.id);
  const t3 = Date.now();
  const third = await getOrBuildStyleProfile(prof.id);
  console.log(`took ${Date.now() - t3}ms; status=${third.status}`);

  console.log(`\n── insufficient data case (1-exam professor: Peri Güneş) ──`);
  const peri = await prisma.professor.findFirst({
    where: { name: { contains: "Peri Güneş" } },
  });
  if (peri) {
    const res = await getOrBuildStyleProfile(peri.id);
    console.log(`status=${res.status}`);
    if (res.status === "insufficient_data") {
      console.log(`examSourceCount=${res.examSourceCount}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
