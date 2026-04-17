import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Send, Loader2, AlertTriangle } from 'lucide-react';

import { postExamReportService } from '../services/postExamReportService';
import ReportedTopicsEditor from '../components/ReportedTopicsEditor';
import type { ReportedTopic } from '../types/community';

const PostExamReportFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialProfessor = params.get('professorId') ?? '';

  const [professorId, setProfessorId] = React.useState(initialProfessor);
  const [courseId, setCourseId] = React.useState('');
  const [examDate, setExamDate] = React.useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [reportedTopics, setReportedTopics] = React.useState<ReportedTopic[]>(
    [{ topic: '', frequency: 'few', difficulty: 3 }]
  );
  const [selfGrade, setSelfGrade] = React.useState<string>('');
  const [notes, setNotes] = React.useState('');

  const submit = useMutation({
    mutationFn: () =>
      postExamReportService.submit({
        professorId,
        courseId: courseId || null,
        examDate,
        reportedTopics: reportedTopics
          .filter((r) => r.topic.trim())
          .map((r) => ({ ...r, topic: r.topic.trim() })),
        notes: notes.trim() || null,
        selfReportedGrade: selfGrade.trim() ? Number(selfGrade) : null,
      }),
    onSuccess: (res) => {
      // Route back to the professor detail where the aggregation shows.
      if (professorId) {
        navigate(`/professors/${professorId}?reportedAt=${res.reportId}`);
      } else {
        navigate('/credits');
      }
    },
  });

  const canSubmit =
    !!professorId.trim() &&
    !!examDate &&
    reportedTopics.some((r) => r.topic.trim()) &&
    !submit.isPending;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 text-[11px] font-medium">
          <ShieldCheck className="w-3 h-3" />
          {t('community.postExam.eyebrow')}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('community.postExam.title')}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {t('community.postExam.subtitle')}
        </p>
      </header>

      <div className="card-base p-4 text-sm bg-primary/5 border-primary/30">
        <p className="flex items-start gap-2 text-foreground">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span>{t('community.postExam.kvkkNotice')}</span>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) submit.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">
              {t('community.postExam.fields.professorId')}
            </span>
            <input
              type="text"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              required
              className="input-field"
              placeholder={t('community.postExam.fields.professorPlaceholder')}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">
              {t('community.postExam.fields.courseId')}
            </span>
            <input
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="input-field"
              placeholder={t('community.postExam.fields.courseIdPlaceholder')}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">
              {t('community.postExam.fields.examDate')}
            </span>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="input-field"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">
              {t('community.postExam.fields.selfGrade')}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={selfGrade}
              onChange={(e) => setSelfGrade(e.target.value)}
              className="input-field"
              placeholder={t('community.postExam.fields.selfGradePlaceholder')}
            />
          </label>
        </div>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">
            {t('community.postExam.topicsHeading')}
          </h2>
          <ReportedTopicsEditor
            value={reportedTopics}
            onChange={setReportedTopics}
          />
        </section>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-foreground">
            {t('community.postExam.fields.notes')}
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="input-field resize-y"
            placeholder={t('community.postExam.fields.notesPlaceholder')}
          />
        </label>

        {submit.isError && (
          <div className="card-base p-4 border-destructive/50 bg-destructive/5 text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t('community.postExam.error')}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary text-sm gap-1.5"
          >
            {submit.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('community.postExam.submitting')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('community.postExam.submit')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostExamReportFormPage;
