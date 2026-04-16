import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Gauge, ListChecks, FileStack, Target } from 'lucide-react';

import type { StyleProfileMetrics } from '../services/professorService';
import { cn } from '../lib/utils';

interface Props {
  metrics: StyleProfileMetrics;
}

// Maps raw backend keys to i18n labels — must stay in sync with
// i18n/locales/*.json > analysis.types.
const QUESTION_TYPE_KEYS: Record<string, string> = {
  'Multiple Choice': 'analysis.types.multipleChoice',
  'Classic/Open-ended': 'analysis.types.openEnded',
  'True/False': 'analysis.types.trueFalse',
};

function difficultyTone(score: number): string {
  if (score < 4) return 'text-success bg-success/10 border-success/30';
  if (score <= 7) return 'text-warning bg-warning/10 border-warning/30';
  return 'text-destructive bg-destructive/10 border-destructive/30';
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: string;
  index: number;
}

const Card: React.FC<CardProps> = ({ icon, label, value, accent, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.04 }}
    className="card-base p-5 flex items-start gap-3"
  >
    <div
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
        accent ?? 'bg-primary-soft text-primary border-primary/20'
      )}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-lg sm:text-xl font-display font-semibold text-foreground mt-0.5 truncate">
        {value}
      </p>
    </div>
  </motion.div>
);

const MetricsCards: React.FC<Props> = ({ metrics }) => {
  const { t } = useTranslation();

  const dominantLabel =
    metrics.dominantType && QUESTION_TYPE_KEYS[metrics.dominantType]
      ? t(QUESTION_TYPE_KEYS[metrics.dominantType])
      : t('professor.style.metrics.noDominant');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <Card
        index={0}
        icon={<FileStack className="w-5 h-5" />}
        label={t('professor.style.metrics.totalExams')}
        value={metrics.totalExams}
      />
      <Card
        index={1}
        icon={<Gauge className="w-5 h-5" />}
        label={t('professor.style.metrics.avgDifficulty')}
        value={`${metrics.avgDifficulty.toFixed(1)}/10`}
        accent={cn(
          'border',
          difficultyTone(metrics.avgDifficulty)
        )}
      />
      <Card
        index={2}
        icon={<ListChecks className="w-5 h-5" />}
        label={t('professor.style.metrics.avgQuestionCount')}
        value={metrics.avgQuestionCount}
      />
      <Card
        index={3}
        icon={<Target className="w-5 h-5" />}
        label={t('professor.style.metrics.dominantType')}
        value={dominantLabel}
      />
    </div>
  );
};

export const MetricsCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card-base p-5 flex items-start gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-secondary" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 bg-secondary rounded" />
          <div className="h-5 w-16 bg-secondary rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default MetricsCards;
