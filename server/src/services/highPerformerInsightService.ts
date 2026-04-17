import {
  HIGH_PERFORMER_K,
  listReportsForHighPerformers,
} from "./postExamReportService";

type TopicFrequency = "once" | "few" | "many";

interface HighPerformerTopic {
  topic: string;
  coveragePct: number;
  dominantFrequency: TopicFrequency;
}

export type HighPerformerStrategy =
  | { status: "insufficient"; count: number; threshold: number }
  | {
      status: "ready";
      count: number;
      topics: HighPerformerTopic[];
    };

/**
 * "A alanların stratejisi" — what do students who scored ≥85 say they
 * focused on? Returns top-5 topics that appear in ≥60% of high-performer
 * reports, ranked by coverage. Refuses to disclose anything below
 * HIGH_PERFORMER_K reports (k-anonymity).
 *
 * Rule-based — no Gemini call. The service intentionally stays thin so
 * Phase 5's AcademicDNA can subsume it without a breaking contract.
 */
export async function getHighPerformerStrategy(
  professorId: string
): Promise<HighPerformerStrategy> {
  const rows = await listReportsForHighPerformers(professorId);
  if (rows.length < HIGH_PERFORMER_K) {
    return {
      status: "insufficient",
      count: rows.length,
      threshold: HIGH_PERFORMER_K,
    };
  }

  const totalReports = rows.length;
  type Acc = { reports: Set<string>; frequencies: Record<TopicFrequency, number> };
  const byTopic = new Map<string, Acc>();

  for (const row of rows) {
    for (const t of row.reportedTopics) {
      if (!byTopic.has(t.topic)) {
        byTopic.set(t.topic, {
          reports: new Set(),
          frequencies: { once: 0, few: 0, many: 0 },
        });
      }
      const acc = byTopic.get(t.topic)!;
      acc.reports.add(row.anonymizedHash);
      if (t.frequency in acc.frequencies) {
        acc.frequencies[t.frequency]++;
      }
    }
  }

  const topics: HighPerformerTopic[] = Array.from(byTopic.entries())
    .map(([topic, acc]) => {
      const coverage = acc.reports.size / totalReports;
      const dominant = (
        Object.entries(acc.frequencies) as [TopicFrequency, number][]
      ).sort((a, b) => b[1] - a[1])[0][0];
      return {
        topic,
        coveragePct: Math.round(coverage * 100),
        dominantFrequency: dominant,
      };
    })
    // Only surface topics mentioned by at least 60% of high performers —
    // otherwise the list bloats with one-off topics.
    .filter((t) => t.coveragePct >= 60)
    .sort((a, b) => b.coveragePct - a.coveragePct)
    .slice(0, 5);

  return {
    status: "ready",
    count: totalReports,
    topics,
  };
}
