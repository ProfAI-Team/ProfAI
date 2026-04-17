import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlarmClockCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  Loader2,
  Lightbulb,
  Target,
  HeartHandshake,
} from 'lucide-react';

import CourseCombobox from '../components/CourseCombobox';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { mockExamService } from '../services/mockExamService';
import type { PanicPlanResponse } from '../types/mockExam';
import { cn } from '../lib/utils';
import { track, AnalyticsEvents } from '../lib/analytics';

const PanicModePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [hours, setHours] = useState<number>(4);
  const [plan, setPlan] = useState<PanicPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(course?.professor?.id) && hours > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const professorId = course?.professor?.id;
    if (!professorId) {
      setError(t('panic.errors.noCourse'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await mockExamService.panicPlan({
        hoursUntilExam: hours,
        professorId,
      });
      setPlan(res);
      track(AnalyticsEvents.PanicModeUsed, {
        hours_to_exam: hours,
        step_count: res.steps.length,
      });
    } catch (err) {
      setError(
        t('panic.errors.generic', {
          message: (err as Error).message || '—',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold mb-3">
          <AlarmClockCheck className="w-3.5 h-3.5" />
          {t('panic.badge')}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold">
          {t('panic.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('panic.subtitle')}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card-base p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('panic.form.course')}
            </label>
            <CourseCombobox
              value={course}
              onChange={setCourse}
              defaultUniversity={user?.university || undefined}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {t('panic.form.hours')}
              </label>
              <span className="font-mono text-sm tabular-nums">
                {t('panic.form.hoursValue', { hours })}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={72}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('panic.form.hoursHint')}
            </p>
          </div>
        </div>

        {error && (
          <div className="card-base p-4 border-destructive/40 bg-destructive/5">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'btn-primary w-full py-3 text-base',
            !canSubmit && 'opacity-50 pointer-events-none'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('panic.form.submitting')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t('panic.form.submit')}
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-5"
          >
            <div className="card-base p-5 bg-primary/5 border-primary/30">
              <div className="flex items-start gap-2">
                <HeartHandshake className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display font-semibold">
                    {t('panic.plan.title', { hours: plan.hoursUntilExam })}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('panic.plan.summary', {
                      minutes: plan.totalMinutes,
                      steps: plan.steps.length,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {plan.advice.length > 0 && (
              <ul className="card-base p-4 space-y-2">
                {plan.advice.map((a, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2 text-foreground"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}

            {plan.steps.length === 0 ? (
              <div className="card-base p-4 text-sm text-muted-foreground">
                {t('panic.plan.emptySteps')}
              </div>
            ) : (
              <ol className="space-y-3">
                {plan.steps.map((s, i) => (
                  <li
                    key={i}
                    className="card-base p-4 flex items-start gap-3"
                  >
                    <span className="font-mono text-sm font-semibold text-primary w-6 shrink-0">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-display font-semibold">{s.topic}</h3>
                        <span className="font-mono text-xs tabular-nums px-2 py-0.5 rounded-full bg-secondary">
                          {t('panic.plan.step.minutes', { minutes: s.minutes })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {s.reason}
                      </p>
                      <p className="text-xs text-foreground mt-1.5 flex items-start gap-1.5">
                        <Target className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        {s.suggestion}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="text-xs text-muted-foreground">
              {t('panic.plan.disclaimer')}
            </div>

            <div className="flex items-center justify-center">
              <Link
                to="/mock-exam/generate"
                className="btn-secondary gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {t('panic.plan.practiceCta')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PanicModePage;
