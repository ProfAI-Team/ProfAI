import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';

import type { StyleProfileTopTopic } from '../services/professorService';
import { cn } from '../lib/utils';

interface Props {
  topics: StyleProfileTopTopic[];
  limit?: number;
}

// Frequency (percent) → Tailwind utility classes. Higher frequency = more
// saturated primary color, stronger border.
function intensityFor(frequency: number): string {
  if (frequency >= 20) {
    return 'bg-primary text-primary-foreground border-primary shadow-soft';
  }
  if (frequency >= 10) {
    return 'bg-primary-soft text-primary border-primary/40';
  }
  return 'bg-secondary text-foreground border-border';
}

const TopicBadges: React.FC<Props> = ({ topics, limit = 10 }) => {
  const { t } = useTranslation();

  if (topics.length === 0) return null;

  const visible = topics.slice(0, limit);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-base p-6 sm:p-8"
    >
      <header className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <h2 className="section-title text-lg sm:text-xl">
            {t('professor.style.topTopicsLabel')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('professor.style.topTopicsSubtitle', { count: visible.length })}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {visible.map((topic, i) => (
          <motion.span
            key={topic.topic}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-transform hover:-translate-y-0.5',
              intensityFor(topic.frequency)
            )}
          >
            <span>{topic.topic}</span>
            <span
              className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                topic.frequency >= 20
                  ? 'bg-primary-foreground/20'
                  : 'bg-background/60'
              )}
            >
              %{Math.round(topic.frequency)}
            </span>
          </motion.span>
        ))}
      </div>
    </motion.section>
  );
};

export const TopicBadgesSkeleton: React.FC = () => (
  <div className="card-base p-6 sm:p-8 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-secondary" />
      <div className="space-y-2">
        <div className="h-4 w-40 bg-secondary rounded" />
        <div className="h-3 w-24 bg-secondary rounded" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-8 bg-secondary rounded-full"
          style={{ width: `${60 + (i % 4) * 30}px` }}
        />
      ))}
    </div>
  </div>
);

export default TopicBadges;
