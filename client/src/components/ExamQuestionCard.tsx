import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { cn } from '../lib/utils';
import type { MockExamClientQuestion } from '../types/mockExam';

import VoteButtons from './VoteButtons';

export interface ExamQuestionCardProps {
  qIdx: number;
  total: number;
  question: MockExamClientQuestion;
  answer: string;
  flagged: boolean;
  onAnswerChange: (value: string) => void;
  onFlagToggle: () => void;
  readOnly?: boolean;
  /**
   * When provided, renders the community VoteButtons beneath the answer
   * area. Intentionally off by default: during a live session we don't
   * want to distract with voting UI — only on review / read-only views.
   */
  voteQuestionId?: string;
}

const TYPE_LABELS: Record<MockExamClientQuestion['type'], string> = {
  MC: 'MC',
  CLASSIC: 'CLASSIC',
  TF: 'TF',
};

const DIFFICULTY_COLORS = [
  'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  'text-amber-600 bg-amber-500/10 border-amber-500/30',
  'text-red-600 bg-red-500/10 border-red-500/30',
];

function difficultyTone(d: number): string {
  if (d <= 4) return DIFFICULTY_COLORS[0];
  if (d <= 7) return DIFFICULTY_COLORS[1];
  return DIFFICULTY_COLORS[2];
}

export const ExamQuestionCard: React.FC<ExamQuestionCardProps> = ({
  qIdx,
  total,
  question,
  answer,
  flagged,
  onAnswerChange,
  onFlagToggle,
  readOnly,
  voteQuestionId,
}) => {
  const { t, i18n } = useTranslation();
  const typeKey = `mockExam.session.types.${question.type}`;
  const typeLabel = i18n.exists(typeKey) ? t(typeKey) : TYPE_LABELS[question.type];

  return (
    <div className="card-base p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {t('mockExam.session.card.indexLabel', {
              index: qIdx + 1,
              total,
            })}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wide">
            {typeLabel}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full border text-[11px] font-semibold',
              difficultyTone(question.difficulty)
            )}
          >
            {t('mockExam.session.card.difficulty', {
              value: question.difficulty,
            })}
          </span>
          {question.topic && (
            <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[11px]">
              {question.topic}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onFlagToggle}
          disabled={readOnly}
          aria-pressed={flagged}
          aria-label={t('mockExam.session.card.flag')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
            flagged
              ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-border bg-surface text-muted-foreground hover:bg-secondary',
            readOnly && 'opacity-50 pointer-events-none'
          )}
        >
          <Flag className={cn('w-3.5 h-3.5', flagged && 'fill-current')} />
          {flagged
            ? t('mockExam.session.card.flagged')
            : t('mockExam.session.card.flag')}
        </button>
      </div>

      <MarkdownRenderer
        className="prose prose-sm dark:prose-invert max-w-none text-foreground"
        markdown={question.q}
      />

      {question.type === 'MC' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <label
              key={i}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 cursor-pointer transition-colors',
                answer === opt
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-secondary',
                readOnly && 'pointer-events-none'
              )}
            >
              <input
                type="radio"
                name={`q-${qIdx}`}
                value={opt}
                checked={answer === opt}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={readOnly}
                className="mt-0.5 accent-primary"
              />
              <span className="text-sm text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'TF' && (
        <div className="flex gap-3">
          {['Doğru', 'Yanlış'].map((val) => (
            <label
              key={val}
              className={cn(
                'flex-1 flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 cursor-pointer transition-colors',
                answer === val
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-secondary',
                readOnly && 'pointer-events-none'
              )}
            >
              <input
                type="radio"
                name={`q-${qIdx}`}
                value={val}
                checked={answer === val}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={readOnly}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">
                {val === 'Doğru'
                  ? t('mockExam.session.tf.true')
                  : t('mockExam.session.tf.false')}
              </span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'CLASSIC' && (
        <div>
          <textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={readOnly}
            placeholder={t('mockExam.session.classic.placeholder')}
            rows={6}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {t('mockExam.session.classic.hint', { count: answer.length })}
          </p>
        </div>
      )}

      {voteQuestionId && readOnly && (
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {t('community.vote.promptExam')}
          </span>
          <VoteButtons questionId={voteQuestionId} compact />
        </div>
      )}
    </div>
  );
};

export default ExamQuestionCard;
