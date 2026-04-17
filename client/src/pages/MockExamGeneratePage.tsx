import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Loader2,
  AlertTriangle,
  Clock,
  ListChecks,
  BookOpen,
  ShieldCheck,
  Settings2,
} from 'lucide-react';

import CourseCombobox from '../components/CourseCombobox';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import type { StudyPack } from '../types/studyPack';
import { studyPackService } from '../services/studyPackService';
import { mockExamService } from '../services/mockExamService';
import { cn } from '../lib/utils';
import { track, AnalyticsEvents } from '../lib/analytics';

type Step = 'idle' | 'generating' | 'error';

const DEFAULT_QUESTION_COUNT = 20;
const MIN_QUESTION_COUNT = 15;
const MAX_QUESTION_COUNT = 30;
const DEFAULT_DURATION_MIN = 90;
const MIN_DURATION_MIN = 30;
const MAX_DURATION_MIN = 180;

const MockExamGeneratePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [myPacks, setMyPacks] = useState<StudyPack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | ''>('');
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [durationMin, setDurationMin] = useState(DEFAULT_DURATION_MIN);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    studyPackService
      .listMine(1, 50)
      .then((res) => setMyPacks(res.packs))
      .catch(() => setMyPacks([]));
  }, []);

  const professorId = selectedCourse?.professor?.id;
  const availablePacks = useMemo(
    () => (professorId ? myPacks.filter((p) => p.professorId === professorId) : []),
    [myPacks, professorId]
  );

  useEffect(() => {
    // Reset pack choice when the professor changes.
    setSelectedPackId('');
  }, [professorId]);

  const canSubmit = Boolean(professorId) && step !== 'generating';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorId) {
      setErrorMessage(t('mockExam.generate.errors.noCourse'));
      return;
    }
    setErrorMessage(null);
    setStep('generating');
    try {
      const result = await mockExamService.generate({
        professorId,
        studyPackId: selectedPackId || null,
        questionCount,
        durationMin,
      });

      if (result.status === 'insufficient_data') {
        const msg =
          result.reason === 'style_profile_missing'
            ? t('mockExam.generate.errors.styleMissing')
            : result.reason === 'study_pack_not_found'
              ? t('mockExam.generate.errors.packNotFound')
              : result.reason === 'notes_not_found'
                ? t('mockExam.generate.errors.notesNotFound')
                : result.message;
        setErrorMessage(msg);
        setStep('error');
        return;
      }

      track(AnalyticsEvents.MockExamGenerated, {
        professor_id: professorId,
        question_count: questionCount,
        duration_min: durationMin,
        cache_hit: result.cacheHit,
      });

      navigate(`/mock-exam/${result.exam.id}/session`);
    } catch (err) {
      setErrorMessage(
        t('mockExam.generate.errors.generic', {
          message: (err as Error).message || '—',
        })
      );
      setStep('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t('mockExam.generate.badge')}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('mockExam.generate.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('mockExam.generate.subtitle')}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-base p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('mockExam.generate.selectCourse')}
            </label>
            <CourseCombobox
              value={selectedCourse}
              onChange={setSelectedCourse}
              defaultUniversity={user?.university || undefined}
            />
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              {t('mockExam.generate.selectCourseHint')}
              {selectedCourse?.professor && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary text-foreground">
                  {selectedCourse.professor.name}
                </span>
              )}
            </p>
          </div>

          {professorId && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('mockExam.generate.selectPack')}
              </label>
              {availablePacks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t('mockExam.generate.noPacks')}
                </p>
              ) : (
                <select
                  value={selectedPackId}
                  onChange={(e) => setSelectedPackId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">
                    {t('mockExam.generate.packOptionNone')}
                  </option>
                  {availablePacks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {t('mockExam.generate.packOption', {
                        topicCount: p.topicSummaries.length,
                        date: new Date(p.generatedAt).toLocaleDateString(),
                      })}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {advancedOpen
              ? t('mockExam.generate.advancedHide')
              : t('mockExam.generate.advancedShow')}
          </button>

          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                      {t('mockExam.generate.questionCount')}
                    </label>
                    <span className="font-mono text-sm tabular-nums text-foreground">
                      {questionCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_QUESTION_COUNT}
                    max={MAX_QUESTION_COUNT}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {t('mockExam.generate.duration')}
                    </label>
                    <span className="font-mono text-sm tabular-nums text-foreground">
                      {t('mockExam.generate.durationValue', {
                        minutes: durationMin,
                      })}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_DURATION_MIN}
                    max={MAX_DURATION_MIN}
                    step={5}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>{t('mockExam.generate.disclaimer')}</span>
          </div>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-4 border-destructive/40 bg-destructive/5"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'btn-primary w-full py-3.5 text-base',
            !canSubmit && 'opacity-50 pointer-events-none'
          )}
        >
          {step === 'generating' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('mockExam.generate.submitting')}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {t('mockExam.generate.submit')}
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {step === 'generating' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 card-base p-5"
          >
            <div className="flex items-start gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('mockExam.generate.generating')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('mockExam.generate.generatingEta')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockExamGeneratePage;
