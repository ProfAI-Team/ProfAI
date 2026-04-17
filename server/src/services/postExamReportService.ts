import { createHash } from "node:crypto";

import prisma from "../lib/prisma";
import * as creditService from "./creditService";

/**
 * k-anonymity threshold for aggregated views. Fewer than K reports and
 * the service refuses to disclose aggregated fields (returns status
 * "insufficient" with the current count). Spec calls out 10.
 */
export const K_ANONYMITY = 10;
export const HIGH_PERFORMER_GRADE = 85;
export const HIGH_PERFORMER_K = 5;

type TopicFrequency = "once" | "few" | "many";

export interface ReportedTopic {
  topic: string;
  frequency: TopicFrequency;
  difficulty: number; // 1..5
}

export class PostExamReportError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function salt(): string {
  const s = process.env.POST_EXAM_SALT;
  if (!s || s.length < 8) {
    // Pinned sentinel for dev — production must set POST_EXAM_SALT, and
    // rotating it after launch will break aggregation consistency.
    return "profai-dev-post-exam-salt-rotate-before-launch";
  }
  return s;
}

function anonymize(userId: string, examDate: Date): string {
  return createHash("sha256")
    .update(`${userId}:${examDate.toISOString().slice(0, 10)}:${salt()}`)
    .digest("hex");
}

/**
 * Upsert a post-exam report. Awards +5 credit on the initial submission
 * (unique index enforces one row per user+professor+examDate, so an
 * update path does not double-reward).
 */
export async function submitReport(params: {
  userId: string;
  professorId: string;
  courseId?: string | null;
  examDate: Date;
  reportedTopics: ReportedTopic[];
  notes?: string | null;
  selfReportedGrade?: number | null;
  selfReportedLetter?: string | null;
}): Promise<{ reportId: string; isNew: boolean; balance: number | null }> {
  const hash = anonymize(params.userId, params.examDate);

  const existing = await prisma.postExamReport.findUnique({
    where: {
      userId_professorId_examDate: {
        userId: params.userId,
        professorId: params.professorId,
        examDate: params.examDate,
      },
    },
  });

  const row = await prisma.postExamReport.upsert({
    where: {
      userId_professorId_examDate: {
        userId: params.userId,
        professorId: params.professorId,
        examDate: params.examDate,
      },
    },
    create: {
      userId: params.userId,
      professorId: params.professorId,
      courseId: params.courseId ?? null,
      examDate: params.examDate,
      reportedTopics: params.reportedTopics as unknown as object,
      notes: params.notes ?? null,
      selfReportedGrade: params.selfReportedGrade ?? null,
      selfReportedLetter: params.selfReportedLetter ?? null,
      anonymizedHash: hash,
    },
    update: {
      courseId: params.courseId ?? null,
      reportedTopics: params.reportedTopics as unknown as object,
      notes: params.notes ?? null,
      selfReportedGrade: params.selfReportedGrade ?? null,
      selfReportedLetter: params.selfReportedLetter ?? null,
    },
  });

  let balance: number | null = null;
  if (!existing) {
    const { balance: next } = await creditService.earn({
      userId: params.userId,
      reason: "PostExamReport",
      refId: row.id,
    });
    balance = next;
  }

  return { reportId: row.id, isNew: !existing, balance };
}

type AggregatedTopic = {
  topic: string;
  reportedCount: number;
  frequencyMode: TopicFrequency;
  medianDifficulty: number;
};

export type AggregatedReport =
  | { status: "insufficient"; count: number; threshold: number }
  | {
      status: "ready";
      count: number;
      windowStart: Date;
      windowEnd: Date;
      topics: AggregatedTopic[];
    };

/**
 * Returns a k-anonymized aggregate for a professor. Fewer than K reports
 * (within the configurable window, default 6 months) → `insufficient`
 * and no topic data is disclosed. ≥K reports → topic frequency mode +
 * median difficulty per topic.
 */
export async function getAggregatedReport(
  professorId: string,
  opts: { windowMonths?: number } = {}
): Promise<AggregatedReport> {
  const windowMonths = Math.max(1, opts.windowMonths ?? 6);
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd);
  windowStart.setMonth(windowStart.getMonth() - windowMonths);

  const rows = await prisma.postExamReport.findMany({
    where: {
      professorId,
      examDate: { gte: windowStart, lte: windowEnd },
    },
    select: { reportedTopics: true, anonymizedHash: true },
  });

  const count = rows.length;
  if (count < K_ANONYMITY) {
    return { status: "insufficient", count, threshold: K_ANONYMITY };
  }

  const byTopic = new Map<
    string,
    { freqCounts: Record<TopicFrequency, number>; difficulties: number[] }
  >();
  for (const row of rows) {
    const topics = (row.reportedTopics as unknown as ReportedTopic[]) ?? [];
    for (const t of topics) {
      if (!byTopic.has(t.topic)) {
        byTopic.set(t.topic, {
          freqCounts: { once: 0, few: 0, many: 0 },
          difficulties: [],
        });
      }
      const entry = byTopic.get(t.topic)!;
      if (t.frequency in entry.freqCounts) {
        entry.freqCounts[t.frequency]++;
      }
      if (typeof t.difficulty === "number") {
        entry.difficulties.push(t.difficulty);
      }
    }
  }

  const topics: AggregatedTopic[] = Array.from(byTopic.entries())
    .map(([topic, data]) => ({
      topic,
      reportedCount: Object.values(data.freqCounts).reduce((a, b) => a + b, 0),
      frequencyMode: (Object.entries(data.freqCounts) as [
        TopicFrequency,
        number
      ][]).sort((a, b) => b[1] - a[1])[0][0],
      medianDifficulty: median(data.difficulties),
    }))
    .sort((a, b) => b.reportedCount - a.reportedCount);

  return {
    status: "ready",
    count,
    windowStart,
    windowEnd,
    topics,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Exposed for the high-performer insight service (4.11). */
export async function listReportsForHighPerformers(
  professorId: string
): Promise<
  Array<{
    anonymizedHash: string;
    selfReportedGrade: number | null;
    reportedTopics: ReportedTopic[];
  }>
> {
  const rows = await prisma.postExamReport.findMany({
    where: {
      professorId,
      selfReportedGrade: { gte: HIGH_PERFORMER_GRADE },
    },
    select: {
      anonymizedHash: true,
      selfReportedGrade: true,
      reportedTopics: true,
    },
  });
  return rows.map((r) => ({
    anonymizedHash: r.anonymizedHash,
    selfReportedGrade: r.selfReportedGrade,
    reportedTopics: (r.reportedTopics as unknown as ReportedTopic[]) ?? [],
  }));
}
