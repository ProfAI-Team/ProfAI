import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Gauge, BookMarked } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { PracticeQuestion } from '../types/studyPack';
import { cn } from '../lib/utils';
import VoteButtons from './VoteButtons';

interface Props {
  question: PracticeQuestion;
  index: number;
  /** Synthetic question id for the community vote service. */
  voteQuestionId?: string;
}

const typeColor: Record<string, string> = {
  MC: 'bg-primary-soft text-primary',
  CLASSIC: 'bg-chart-2/15 text-chart-2',
  TF: 'bg-chart-5/15 text-chart-5',
};

const PracticeQuestionCard: React.FC<Props> = ({
  question,
  index,
  voteQuestionId,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const typeLabel = t(`studyPack.practice.typeLabels.${question.type}`, {
    defaultValue: question.type,
  });

  const difficultyTone =
    question.difficulty < 4
      ? 'text-success'
      : question.difficulty <= 7
        ? 'text-warning'
        : 'text-destructive';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card-base p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              typeColor[question.type] ?? 'bg-secondary text-muted-foreground'
            )}
          >
            {typeLabel}
          </span>
          {question.topic && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
              <BookMarked className="w-3 h-3" />
              {question.topic}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary',
              difficultyTone
            )}
          >
            <Gauge className="w-3 h-3" />
            {question.difficulty}/10
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
          #{index + 1}
        </span>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {question.question}
        </ReactMarkdown>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="inline-flex"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
        {open ? t('studyPack.practice.hideAnswer') : t('studyPack.practice.showAnswer')}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border space-y-3">
              <div>
                <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.answer}
                  </ReactMarkdown>
                </div>
              </div>
              {question.rationale && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {t('studyPack.practice.rationaleLabel')}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {question.rationale}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {voteQuestionId && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {t('community.vote.promptPractice')}
          </span>
          <VoteButtons questionId={voteQuestionId} compact />
        </div>
      )}
    </motion.div>
  );
};

export default PracticeQuestionCard;
