/**
 * Reset the demo user's community-layer state back to a clean slate.
 *
 * Phase 4 retro found that every fixture-seed run topped up the demo
 * user's credit ledger (`+10 for ExamApproved`, `+5 for post-exam report`
 * each time), and the approval/vote/report/study-group tables grew
 * indefinitely. This script wipes the demo user's rows from those tables
 * so a fresh fixture seed starts from zero.
 *
 * Does NOT touch the user row itself or their auth credentials.
 * Idempotent — running it multiple times is safe.
 *
 * Usage:
 *   cd server && DATABASE_URL=... npx tsx scripts/reset-demo-user.ts
 *   cd server && npm run reset:demo
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "erdemacar1@stu.aydin.edu.tr";

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      console.log(`[reset-demo] no user with email ${DEMO_EMAIL} — nothing to do.`);
      return;
    }

    console.log(`[reset-demo] resetting state for ${user.email} (${user.id})`);

    // Remove community-layer rows. We leave the user, their uploaded
    // exams, and their mock-exam attempts alone — those are the real
    // artifacts we demo; only the credit ledger and voting/reporting
    // noise accumulates.
    const [credit, approvals, votes, reports, groupLinks] = await Promise.all([
      prisma.userCredit.deleteMany({ where: { userId: user.id } }),
      prisma.examApproval.deleteMany({ where: { userId: user.id } }),
      prisma.questionVote.deleteMany({ where: { userId: user.id } }),
      prisma.postExamReport.deleteMany({ where: { userId: user.id } }),
      // StudyGroup has an implicit many-to-many via the `members` field;
      // remove the membership link by disconnecting on each group.
      (async () => {
        const groups = await prisma.studyGroup.findMany({
          where: { members: { some: { id: user.id } } },
          select: { id: true },
        });
        for (const g of groups) {
          await prisma.studyGroup.update({
            where: { id: g.id },
            data: { members: { disconnect: { id: user.id } } },
          });
        }
        return groups.length;
      })(),
    ]);

    console.log(`[reset-demo] cleared:`);
    console.log(`   credits: ${credit.count}`);
    console.log(`   approvals: ${approvals.count}`);
    console.log(`   question votes: ${votes.count}`);
    console.log(`   post-exam reports: ${reports.count}`);
    console.log(`   study group memberships: ${groupLinks}`);
    console.log(`[reset-demo] done.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[reset-demo] failed:", err);
  process.exit(1);
});
