import bcrypt from "bcrypt";

import prisma from "../lib/prisma";
import { featureLogger } from "../lib/logger";
import { AppError, notFound, unauthorized } from "../lib/AppError";
import { getStorage } from "../lib/storage";

const log = featureLogger("account");

/**
 * Account deletion (Phase 7 task 7.4). Exposed as
 * `DELETE /api/users/me/data` — the `password` query or body value is
 * re-verified before anything is touched so a stolen JWT can't use this
 * endpoint to destroy a user's data.
 *
 * KVKK trade-off:
 *   - Right to erasure (KVKK M.7)   → full record removal
 *   - Accounting retention obligation (Turkish commercial law) → keep
 *     payment records for 10 years.
 *
 * Phase 7 MVP picks the erasure side for everything. Payment rows are
 * deleted alongside the user — a stricter compliance pass in Phase 8
 * will flip this to "anonymise Payment, keep aggregate totals". We
 * document the position in the KVKK notice (7.29).
 *
 * File cleanup: any R2 / local-disk blob the user uploaded is dropped
 * after the DB cascade so storage doesn't leak.
 */

export interface PurgeInput {
  userId: string;
  passwordPlainText: string;
}

export interface PurgeReport {
  userId: string;
  deletedCounts: {
    voiceSessions: number;
    ocrResults: number;
    studentNotes: number;
    mockExamSessions: number;
    payments: number;
    marketplaceItems: number;
    tutoringSessions: number;
    pushDevices: number;
  };
}

export async function purgeUserData(
  input: PurgeInput
): Promise<PurgeReport> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      password: true,
    },
  });
  if (!user) throw notFound("User not found");

  const passwordOk = await bcrypt.compare(
    input.passwordPlainText,
    user.password
  );
  if (!passwordOk) throw unauthorized("Password does not match");

  // Gather file URLs BEFORE cascade so we can scrub storage after.
  const [ocrResults, marketplaceItems] = await Promise.all([
    prisma.oCRResult.findMany({
      where: { userId: input.userId },
      select: { fileUrl: true },
    }),
    prisma.marketplaceItem.findMany({
      where: { sellerId: input.userId },
      select: { fileUrl: true },
    }),
  ]);
  const filesToRemove = [
    ...ocrResults.map((r) => r.fileUrl),
    ...marketplaceItems.map((i) => i.fileUrl),
  ];

  // Count each table before cascading so we can return a receipt to
  // the UI ("33 records deleted across 6 categories" in the /privacy
  // success copy).
  const counts = await prisma.$transaction([
    prisma.voiceSession.count({ where: { userId: input.userId } }),
    prisma.oCRResult.count({ where: { userId: input.userId } }),
    prisma.studentNote.count({ where: { userId: input.userId } }),
    prisma.mockExamSession.count({ where: { userId: input.userId } }),
    prisma.payment.count({ where: { userId: input.userId } }),
    prisma.marketplaceItem.count({ where: { sellerId: input.userId } }),
    prisma.tutoringSession.count({
      where: { studentId: input.userId },
    }),
    prisma.pushDevice.count({ where: { userId: input.userId } }),
  ]);

  // The big hammer — Prisma cascade rules take out every owned row.
  // Phase 7 schema already declared onDelete: Cascade on the user-
  // owned relations, so this single call purges voiceSessions,
  // ocrResults, studentNotes, mockExamSessions, payments,
  // marketplaceItems (seller), tutoringSessions (student side),
  // pushDevices, and friends.
  await prisma.user.delete({ where: { id: input.userId } });

  // Belt-and-braces storage scrub. Local provider is idempotent (ENOENT
  // tolerated); R2 provider same.
  const storage = getStorage();
  for (const url of filesToRemove) {
    const key = normalizeKey(url);
    if (!key) continue;
    try {
      await storage.delete(key);
    } catch (err) {
      log.warn(
        { key, err: (err as Error).message },
        "storage scrub failed during purge"
      );
    }
  }

  const report: PurgeReport = {
    userId: input.userId,
    deletedCounts: {
      voiceSessions: counts[0],
      ocrResults: counts[1],
      studentNotes: counts[2],
      mockExamSessions: counts[3],
      payments: counts[4],
      marketplaceItems: counts[5],
      tutoringSessions: counts[6],
      pushDevices: counts[7],
    },
  };
  log.info({ userId: input.userId, counts: report.deletedCounts }, "account purged");
  return report;
}

function normalizeKey(fileUrl: string): string | null {
  if (!fileUrl) return null;
  // Local provider stores "/uploads/<key>", R2 stores "<key>".
  if (fileUrl.startsWith("/uploads/")) return fileUrl.slice("/uploads/".length);
  if (fileUrl.startsWith("http")) return null; // absolute URL — Phase 8 signed URL scrub
  return fileUrl;
}
