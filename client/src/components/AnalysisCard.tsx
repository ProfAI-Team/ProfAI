import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FileText, Gauge, ListChecks, BookMarked } from 'lucide-react';
import { ExamAnalysis } from '../types';
import { cn } from '../lib/utils';

interface Props {
  analysis: ExamAnalysis;
  index?: number;
}

// Chart palette — works well in both light and dark themes
const CHART_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#F97316'];

const QUESTION_TYPE_KEYS: Record<string, string> = {
  'Multiple Choice': 'analysis.types.multipleChoice',
  'Classic/Open-ended': 'analysis.types.openEnded',
  'True/False': 'analysis.types.trueFalse',
};

const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-elevated text-sm">
      {label && <p className="font-medium text-foreground mb-0.5">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: entry.color || entry.fill }}>●</span>{' '}
          <span className="text-foreground font-medium">{entry.value}%</span>
        </p>
      ))}
    </div>
  );
};

const AnalysisCard: React.FC<Props> = ({ analysis, index = 0 }) => {
  const { t } = useTranslation();

  const getDifficulty = (score: number) => {
    if (score < 4) return { color: 'text-success bg-success/10', label: 'Easy' };
    if (score <= 7) return { color: 'text-warning bg-warning/10', label: 'Medium' };
    return { color: 'text-destructive bg-destructive/10', label: 'Hard' };
  };

  const diff = getDifficulty(analysis.difficultyScore);

  // Translate question type names if known
  const translatedTypes = analysis.questionTypes.map((q) => ({
    ...q,
    displayType: QUESTION_TYPE_KEYS[q.type] ? t(QUESTION_TYPE_KEYS[q.type]) : q.type,
  }));

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card-base p-6 sm:p-8"
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{t('analysis.title')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('analysis.questionCount')}: {analysis.questionCount}
            </p>
          </div>
        </div>
        <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', diff.color)}>
          <Gauge className="w-3.5 h-3.5" />
          {analysis.difficultyScore.toFixed(1)}/10
        </div>
      </header>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        {translatedTypes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">{t('analysis.questionTypes')}</h4>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={translatedTypes}
                  dataKey="percentage"
                  nameKey="displayType"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  isAnimationActive
                >
                  {translatedTypes.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {analysis.topicDistribution && analysis.topicDistribution.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookMarked className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">{t('analysis.topicDistribution')}</h4>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={analysis.topicDistribution}
                margin={{ top: 5, right: 5, left: -20, bottom: 30 }}
              >
                <XAxis
                  dataKey="topic"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                <Bar dataKey="frequency" radius={[6, 6, 0, 0]}>
                  {analysis.topicDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="rounded-xl bg-secondary/60 border border-border p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {t('analysis.summary')}
          </h4>
          <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
        </div>
      )}
    </motion.article>
  );
};

export default AnalysisCard;
