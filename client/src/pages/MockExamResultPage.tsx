import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  Trophy,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ListChecks,
  ShieldCheck,
  Wand2,
} from 'lucide-react';

import { Tabs, TabPanel, useTabListId } from '../components/Tabs';
import ScoreGauge from '../components/ScoreGauge';
import PredictionBand from '../components/PredictionBand';
import TopicGapCard from '../components/TopicGapCard';
import type {
  MockExamResultResponse,
  SectionScore,
  QuestionFeedback,
} from '../types/mockExam';
import { useMockExamResult } from '../hooks/useMockExam';
import VoteButtons from '../components/VoteButtons';
import { cn } from '../lib/utils';

type TabId = 'overview' | 'sections' | 'questions';

function deriveSectionScores(
  exam: MockExamResultResponse['exam'],
  feedback: QuestionFeedback[]
): SectionScore[] {
  const sections = exam.sectionBreakdown ?? [
    { title: 'Bölüm 1', startIdx: 0, endIdx: exam.questions.length },
  ];
  return sections.map((s) => {
    const range = feedback.slice(s.startIdx, s.endIdx);
    const sum = range.reduce((acc, f) => acc + f.scoreOutOf100, 0);
    const count = range.length;
    return {
      title: s.title,
      startIdx: s.startIdx,
      endIdx: s.endIdx,
      avgScore: count > 0 ? sum / count : 0,
      questionCount: count,
    };
  });
}

const MockExamResultPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t, i18n } = useTranslation();
  const tabListId = useTabListId('mock-exam-result');

  const query = useMockExamResult(sessionId);
  const data = query.data;
  const loading = query.isLoading;
  const error: 'not_found' | 'generic' | null = query.error
    ? ((query.error as { response?: { status?: number } })?.response?.status ===
      404
        ? 'not_found'
        : 'generic')
    : null;
  const [active, setActive] = useState<TabId>('overview');

  const feedback = data?.session.feedback ?? [];
  const prediction = data?.session.prediction ?? null;
  const topicGaps = data?.session.topicGaps ?? [];
  const score = data?.session.score ?? 0;

  const sectionScores = useMemo(
    () => (data ? deriveSectionScores(data.exam, feedback) : []),
    [data, feedback]
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
        <p className="mt-3 text-sm text-muted-foreground">
          {t('mockExam.result.loading')}
        </p>
      </div>
    );
  }

  if (error === 'not_found' || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">
          {t('mockExam.result.notFound.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('mockExam.result.notFound.body')}
        </p>
        <Link to="/mock-exam/generate" className="btn-primary mt-6 inline-flex">
          {t('mockExam.result.notFound.cta')}
        </Link>
      </div>
    );
  }

  const exam = data.exam;
  const session = data.session;
  const completedWhen = session.completedAt
    ? new Intl.DateTimeFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(session.completedAt))
    : '';

  const minutesSpent = session.timeSpentSec
    ? Math.round(session.timeSpentSec / 60)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          to="/mock-exam/generate"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('mockExam.result.back')}
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2">
          <Trophy className="w-3.5 h-3.5" />
          {t('mockExam.result.badge')}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
          {exam.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {completedWhen && (
            <span className="inline-flex items-center gap-1">
              <ListChecks className="w-3 h-3" />
              {t('mockExam.result.completedAt', { when: completedWhen })}
            </span>
          )}
          {minutesSpent > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t('mockExam.result.minutesSpent', { minutes: minutesSpent })}
            </span>
          )}
          {session.autoSubmitted && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              {t('mockExam.result.autoSubmitted')}
            </span>
          )}
        </p>
      </motion.div>

      <div className="card-base p-4 mb-6 flex items-start gap-2 bg-primary/5 border-primary/30">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          {t('mockExam.result.disclaimer')}
        </p>
      </div>

      <Tabs<TabId>
        activeId={active}
        onChange={setActive}
        ariaLabel={t('mockExam.result.tabs.ariaLabel')}
        tabs={[
          { id: 'overview', label: t('mockExam.result.tabs.overview') },
          { id: 'sections', label: t('mockExam.result.tabs.sections') },
          { id: 'questions', label: t('mockExam.result.tabs.questions') },
        ]}
      />

      <div className="mt-4">
        <TabPanel tabListId={tabListId} tabId="overview" active={active === 'overview'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-base p-6 flex flex-col items-center justify-center text-center">
              <ScoreGauge score={score} />
              <p className="mt-4 text-xs text-muted-foreground">
                {t('mockExam.result.scoreExplainer')}
              </p>
            </div>
            {prediction && (
              <PredictionBand prediction={prediction} mockScore={score} />
            )}
          </div>
          {topicGaps.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display font-semibold text-base mb-3">
                {t('mockExam.result.topicGaps.title')}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t('mockExam.result.topicGaps.subtitle')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topicGaps
                  .filter((g) => g.accuracy < 0.8)
                  .slice(0, 6)
                  .map((gap) => (
                    <TopicGapCard
                      key={gap.topic}
                      gap={gap}
                      studyPackHref={
                        exam.studyPackId
                          ? `/study-pack/${exam.studyPackId}`
                          : undefined
                      }
                    />
                  ))}
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel tabListId={tabListId} tabId="sections" active={active === 'sections'}>
          {sectionScores.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('mockExam.result.sections.empty')}
            </p>
          ) : (
            <div className="space-y-3">
              {sectionScores.map((s) => (
                <div key={s.title} className="card-base p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-display font-semibold">{s.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t('mockExam.result.sections.questionRange', {
                          start: s.startIdx + 1,
                          end: s.endIdx,
                          count: s.questionCount,
                        })}
                      </p>
                    </div>
                    <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
                      %{Math.round(s.avgScore)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        s.avgScore >= 70
                          ? 'bg-emerald-500'
                          : s.avgScore >= 40
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(100, s.avgScore)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel tabListId={tabListId} tabId="questions" active={active === 'questions'}>
          <div className="space-y-4">
            {exam.questions.map((q, i) => {
              const f = feedback[i];
              const correct = f?.correct ?? false;
              const score100 = f?.scoreOutOf100 ?? 0;
              return (
                <div key={i} className="card-base p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {t('mockExam.result.questions.indexLabel', {
                          index: i + 1,
                        })}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold uppercase">
                        {q.type}
                      </span>
                      {q.topic && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[11px]">
                          {q.topic}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-sm font-semibold',
                        correct ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {correct ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {score100}/100
                    </span>
                  </div>
                  <MarkdownRenderer
                    className="prose prose-sm dark:prose-invert max-w-none"
                    markdown={q.q}
                  />
                  {f?.feedback && (
                    <div className="rounded-lg bg-secondary/60 border border-border p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                        {t('mockExam.result.questions.feedbackLabel')}
                      </p>
                      <MarkdownRenderer
                        className="prose prose-sm dark:prose-invert max-w-none"
                        markdown={f.feedback}
                      />
                    </div>
                  )}
                  {f?.rubricHits && f.rubricHits.length > 0 && (
                    <ul className="text-xs space-y-1">
                      {f.rubricHits.map((h, j) => (
                        <li
                          key={j}
                          className={cn(
                            'flex items-start gap-1.5',
                            h.met ? 'text-emerald-600' : 'text-muted-foreground'
                          )}
                        >
                          {h.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          )}
                          <span>{h.criterion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {t('community.vote.promptExam')}
                    </span>
                    <VoteButtons
                      questionId={`mockExam:${exam.id}:q${i}`}
                      compact
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabPanel>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <Link
          to="/mock-exam/generate"
          className="btn-secondary gap-2 text-sm"
        >
          <Wand2 className="w-4 h-4" />
          {t('mockExam.result.newMock')}
        </Link>
      </div>
    </div>
  );
};

export default MockExamResultPage;
