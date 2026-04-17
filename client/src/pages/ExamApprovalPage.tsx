import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from 'lucide-react';

import { examApprovalService } from '../services/examApprovalService';
import type {
  PendingExam,
  ApprovalOutcome,
  PendingExamList,
} from '../types/community';
import { creditKeys } from '../components/CreditBadge';
import VerifiedBadge from '../components/VerifiedBadge';

const approvalKeys = {
  pending: () => ['approval', 'pending'] as const,
};

const ExamApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeReason, setActiveReason] = React.useState<
    Record<string, string>
  >({});

  const pending = useQuery({
    queryKey: approvalKeys.pending(),
    queryFn: () => examApprovalService.listPending({ limit: 20 }),
  });

  const castMutation = useMutation({
    mutationFn: (p: {
      examId: string;
      approved: boolean;
      reason?: string;
    }) =>
      examApprovalService.cast(p.examId, {
        approved: p.approved,
        reason: p.reason,
      }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: approvalKeys.pending() });
      const prev = qc.getQueryData<PendingExamList>(approvalKeys.pending());
      if (prev) {
        qc.setQueryData<PendingExamList>(approvalKeys.pending(), {
          total: Math.max(0, prev.total - 1),
          exams: prev.exams.filter((e) => e.id !== vars.examId),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(approvalKeys.pending(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.pending() });
      // Balance can change via the uploader's credit earn; refresh ours too
      // because a third 'verified' approval may have triggered downstream
      // cache invalidation that affects what we see.
      qc.invalidateQueries({ queryKey: creditKeys.balance() });
    },
  });

  const handleCast = (exam: PendingExam, approved: boolean) => {
    castMutation.mutate({
      examId: exam.id,
      approved,
      reason: approved ? undefined : activeReason[exam.id],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 text-success border border-success/30 px-2.5 py-0.5 text-[11px] font-medium">
          <ShieldCheck className="w-3 h-3" />
          {t('community.approval.eyebrow')}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('community.approval.title')}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {t('community.approval.subtitle')}
        </p>
      </header>

      {pending.isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
        </div>
      ) : !pending.data || pending.data.exams.length === 0 ? (
        <div className="card-base p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {t('community.approval.empty.title')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('community.approval.empty.body')}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {pending.data.exams.map((exam) => (
              <motion.li
                key={exam.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="card-base p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-lg truncate">
                      {exam.course.code} · {exam.course.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {exam.professor.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(`community.approval.examType.${exam.examType}`, {
                        defaultValue: exam.examType,
                      })}{' '}
                      · {exam.year} · {exam.semester}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {exam.verified && <VerifiedBadge />}
                    {exam.flagged && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive border border-destructive/30 px-2 py-0.5 text-[11px] font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        {t('community.approval.flagged')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground max-w-md">
                    {t('community.approval.reasonHint')}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder={t('community.approval.reasonPlaceholder')}
                      value={activeReason[exam.id] ?? ''}
                      onChange={(e) =>
                        setActiveReason((s) => ({
                          ...s,
                          [exam.id]: e.target.value,
                        }))
                      }
                      className="input-field text-sm w-full sm:w-64"
                      aria-label={t('community.approval.reasonLabel')}
                    />
                    <button
                      type="button"
                      onClick={() => handleCast(exam, false)}
                      className="btn-secondary text-sm gap-1.5"
                      disabled={castMutation.isPending}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {t('community.approval.reject')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCast(exam, true)}
                      className="btn-primary text-sm gap-1.5"
                      disabled={castMutation.isPending}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {t('community.approval.approve')}
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {castMutation.isError && (
        <div className="card-base p-4 border-destructive/50 bg-destructive/5 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {t('community.approval.error', {
              defaultValue: 'Oy kaydedilirken bir sorun oldu. Tekrar dene.',
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default ExamApprovalPage;
