import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  X,
  Loader2,
  AlertTriangle,
  ListChecks,
  Menu as MenuIcon,
} from 'lucide-react';

import { mockExamService } from '../services/mockExamService';
import type {
  MockExam,
  MockExamClientQuestion,
  StudentAnswer,
} from '../types/mockExam';
import Timer from '../components/Timer';
import QuestionNavigator from '../components/QuestionNavigator';
import ExamQuestionCard from '../components/ExamQuestionCard';
import { useCountdown } from '../hooks/useCountdown';
import { cn } from '../lib/utils';
import { track, AnalyticsEvents } from '../lib/analytics';

type DraftAnswer = {
  answer: string;
  flagged: boolean;
  touchedAt: number;
};

type DraftState = Record<number, DraftAnswer>;

const draftKey = (examId: string) => `mockExamDraft:${examId}`;

function loadDraft(examId: string): { state: DraftState; startedAt: number } | null {
  try {
    const raw = localStorage.getItem(draftKey(examId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state: DraftState; startedAt: number };
    if (typeof parsed.startedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistDraft(
  examId: string,
  state: DraftState,
  startedAt: number
): void {
  try {
    localStorage.setItem(
      draftKey(examId),
      JSON.stringify({ state, startedAt })
    );
  } catch {
    // Storage full / disabled — silent; the in-memory state still works.
  }
}

function clearDraft(examId: string): void {
  try {
    localStorage.removeItem(draftKey(examId));
  } catch {
    // noop
  }
}

const MockExamSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<'not_found' | 'generic' | null>(null);
  const [draft, setDraft] = useState<DraftState>({});
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track whether submission succeeded — used to bypass beforeunload + nav
  // guards during the success redirect.
  const completedRef = useRef(false);

  const questions: MockExamClientQuestion[] = exam?.questions ?? [];
  const total = questions.length;
  const plannedSec = (exam?.durationMin ?? 90) * 60;

  const onExpire = useCallback(() => {
    if (completedRef.current || !exam) return;
    // Auto-submit path — bypass the confirm dialog.
    handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  const countdown = useCountdown({
    durationSec: plannedSec,
    autoStart: false,
    onExpire,
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    mockExamService
      .getById(id)
      .then((data) => {
        setExam(data);
        const savedDraft = loadDraft(data.id);
        if (savedDraft) {
          setDraft(savedDraft.state);
          setStartedAt(savedDraft.startedAt);
          const elapsed = Math.max(
            0,
            Math.round((Date.now() - savedDraft.startedAt) / 1000)
          );
          const remaining = Math.max(1, data.durationMin * 60 - elapsed);
          countdown.reset(remaining);
          countdown.start();
        } else {
          const now = Date.now();
          setStartedAt(now);
          countdown.reset(data.durationMin * 60);
          countdown.start();
          track(AnalyticsEvents.MockExamStarted, {
            mock_exam_id: data.id,
            question_count: data.questions.length,
            duration_min: data.durationMin,
          });
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        setLoadError(status === 404 ? 'not_found' : 'generic');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!exam || completedRef.current) return;
    persistDraft(exam.id, draft, startedAt);
  }, [exam, draft, startedAt]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (completedRef.current) return;
      if (!exam) return;
      // Any touched answers → warn. If the student hasn't started they can
      // still leave silently.
      if (Object.keys(draft).length === 0) return;
      e.preventDefault();
      e.returnValue = t('mockExam.session.exitWarning');
      return t('mockExam.session.exitWarning');
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [exam, draft, t]);

  const setAnswer = useCallback((qIdx: number, answer: string) => {
    setDraft((prev) => ({
      ...prev,
      [qIdx]: {
        answer,
        flagged: prev[qIdx]?.flagged ?? false,
        touchedAt: Date.now(),
      },
    }));
  }, []);

  const toggleFlag = useCallback((qIdx: number) => {
    setDraft((prev) => ({
      ...prev,
      [qIdx]: {
        answer: prev[qIdx]?.answer ?? '',
        flagged: !(prev[qIdx]?.flagged ?? false),
        touchedAt: Date.now(),
      },
    }));
  }, []);

  const navItems = useMemo(
    () =>
      questions.map((_, i) => ({
        qIdx: i,
        answered: Boolean(draft[i]?.answer?.trim()),
        flagged: Boolean(draft[i]?.flagged),
      })),
    [questions, draft]
  );

  const answeredCount = navItems.filter((i) => i.answered).length;
  const flaggedCount = navItems.filter((i) => i.flagged).length;

  const buildSubmitPayload = useCallback((): StudentAnswer[] => {
    return questions.map((_, qIdx) => ({
      qIdx,
      answer: draft[qIdx]?.answer ?? '',
      flagged: draft[qIdx]?.flagged ?? false,
    }));
  }, [questions, draft]);

  const handleSubmit = useCallback(
    async (autoSubmitted: boolean) => {
      if (!exam || submitting) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await mockExamService.submit(exam.id, {
          answers: buildSubmitPayload(),
          autoSubmitted,
        });
        completedRef.current = true;
        clearDraft(exam.id);
        track(
          autoSubmitted
            ? AnalyticsEvents.MockExamAutoSubmitted
            : AnalyticsEvents.MockExamSubmitted,
          {
            mock_exam_id: exam.id,
            score: Math.round(res.score),
            answered_count: answeredCount,
          }
        );
        navigate(`/mock-exam/session/${res.sessionId}/result`);
      } catch (err) {
        setSubmitError(
          t('mockExam.session.submitError', {
            message: (err as Error).message || '—',
          })
        );
        setSubmitting(false);
      }
    },
    [exam, submitting, buildSubmitPayload, answeredCount, t, navigate]
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
        <p className="mt-3 text-sm text-muted-foreground">
          {t('mockExam.session.loading')}
        </p>
      </div>
    );
  }

  if (loadError === 'not_found' || !exam) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">
          {t('mockExam.session.notFound.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('mockExam.session.notFound.body')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/mock-exam/generate')}
          className="btn-primary mt-6"
        >
          {t('mockExam.session.notFound.cta')}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const currentDraft = draft[currentIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold truncate">
            {exam.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('mockExam.session.progressLine', {
              answered: answeredCount,
              total,
              flagged: flaggedCount,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="lg:hidden btn-secondary text-xs gap-1"
            aria-label={t('mockExam.session.openNav')}
          >
            <MenuIcon className="w-4 h-4" />
            {currentIdx + 1}/{total}
          </button>
          <Timer
            remainingSec={countdown.remainingSec}
            totalSec={plannedSec}
            state={countdown.state === 'expired' ? 'idle' : countdown.state}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-4">
        <aside className="hidden lg:block card-base p-4 sticky top-20 self-start">
          <QuestionNavigator
            items={navItems}
            currentIdx={currentIdx}
            onSelect={(n) => setCurrentIdx(n)}
          />
          <button
            type="button"
            onClick={() => setSubmitConfirm(true)}
            className="btn-primary w-full mt-4 text-sm"
            disabled={submitting}
          >
            <Send className="w-4 h-4" />
            {t('mockExam.session.submit')}
          </button>
        </aside>

        <section>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExamQuestionCard
                qIdx={currentIdx}
                total={total}
                question={currentQuestion}
                answer={currentDraft?.answer ?? ''}
                flagged={Boolean(currentDraft?.flagged)}
                onAnswerChange={(v) => setAnswer(currentIdx, v)}
                onFlagToggle={() => toggleFlag(currentIdx)}
              />
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className={cn(
                'btn-secondary text-sm gap-1.5',
                currentIdx === 0 && 'opacity-50 pointer-events-none'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              {t('mockExam.session.prev')}
            </button>
            {currentIdx < total - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
                className="btn-primary text-sm gap-1.5"
              >
                {t('mockExam.session.next')}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitConfirm(true)}
                disabled={submitting}
                className="btn-primary text-sm gap-1.5"
              >
                <Send className="w-4 h-4" />
                {t('mockExam.session.submit')}
              </button>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setNavOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold">
                  {t('mockExam.session.nav.title')}
                </h2>
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  aria-label={t('mockExam.session.closeNav')}
                  className="p-1 rounded-md hover:bg-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <QuestionNavigator
                items={navItems}
                currentIdx={currentIdx}
                onSelect={(n) => {
                  setCurrentIdx(n);
                  setNavOpen(false);
                }}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {submitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-base p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <ListChecks className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg">
                    {t('mockExam.session.confirm.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('mockExam.session.confirm.body', {
                      unanswered: total - answeredCount,
                      flagged: flaggedCount,
                    })}
                  </p>
                  {submitError && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-destructive">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitConfirm(false)}
                  disabled={submitting}
                  className="btn-secondary text-sm"
                >
                  {t('mockExam.session.confirm.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="btn-primary text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('mockExam.session.confirm.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('mockExam.session.confirm.submit')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {countdown.state === 'expired' && submitting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card-base p-6 max-w-sm w-full text-center">
            <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
            <p className="mt-3 text-sm text-foreground">
              {t('mockExam.session.autoSubmitting')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockExamSessionPage;
