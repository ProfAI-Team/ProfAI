import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sparkles } from 'lucide-react';

import type { StyleProfileReady } from '../services/professorService';
import { CHART_COLORS, CHART_NEUTRAL, colorAt } from '../lib/chartColors';

interface Props {
  profile: StyleProfileReady['profile'];
}

// Maps the raw backend keys ("Multiple Choice" etc.) to i18n-ready labels.
const QUESTION_TYPE_KEYS: Record<string, string> = {
  'Multiple Choice': 'analysis.types.multipleChoice',
  'Classic/Open-ended': 'analysis.types.openEnded',
  'True/False': 'analysis.types.trueFalse',
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; color?: string; fill?: string; name?: string }>;
  label?: string;
}

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-elevated text-sm">
      {label && <p className="font-medium text-foreground mb-0.5">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: entry.color || entry.fill }}>●</span>{' '}
          <span className="text-foreground font-medium">{Math.round(entry.value)}%</span>
          {entry.name && <span className="ml-1">{entry.name}</span>}
        </p>
      ))}
    </div>
  );
};

const StyleHero: React.FC<Props> = ({ profile }) => {
  const { t } = useTranslation();

  const qt = profile.aggregated.questionTypes;
  const pieData = [
    {
      key: 'Multiple Choice',
      name: t(QUESTION_TYPE_KEYS['Multiple Choice']),
      value: qt['Multiple Choice'],
    },
    {
      key: 'Classic/Open-ended',
      name: t(QUESTION_TYPE_KEYS['Classic/Open-ended']),
      value: qt['Classic/Open-ended'],
    },
    {
      key: 'True/False',
      name: t(QUESTION_TYPE_KEYS['True/False']),
      value: qt['True/False'],
    },
  ].filter((entry) => entry.value > 0);

  const barData = profile.topTopics.slice(0, 6).map((t) => ({
    topic: t.topic,
    frequency: t.frequency,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-base p-6 sm:p-8 space-y-6"
    >
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="section-title text-xl sm:text-2xl">
            {t('professor.style.title')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('professor.style.subtitle', {
              count: profile.examSourceCount,
            })}
          </p>
        </div>
      </header>

      {/* Gemini summary */}
      <div className="rounded-xl bg-primary-soft/60 border border-primary/20 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          {t('professor.style.summaryLabel')}
        </h3>
        <p className="text-sm sm:text-base text-foreground leading-relaxed">
          {profile.styleSummary}
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t('professor.style.questionTypesLabel')}
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={colorAt(i)} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: CHART_NEUTRAL.axis }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">
              {t('professor.style.noData')}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t('professor.style.topTopicsLabel')}
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={barData}
                margin={{ top: 5, right: 5, left: -20, bottom: 40 }}
              >
                <XAxis
                  dataKey="topic"
                  tick={{ fill: CHART_NEUTRAL.axis, fontSize: 11 }}
                  axisLine={{ stroke: CHART_NEUTRAL.grid }}
                  tickLine={{ stroke: CHART_NEUTRAL.grid }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: CHART_NEUTRAL.axis, fontSize: 11 }}
                  axisLine={{ stroke: CHART_NEUTRAL.grid }}
                  tickLine={{ stroke: CHART_NEUTRAL.grid }}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: CHART_NEUTRAL.cursor }}
                />
                <Bar dataKey="frequency" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[(i + 1) % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">
              {t('professor.style.noData')}
            </p>
          )}
        </div>
      </div>

      {profile.isStale && (
        <p className="text-xs text-muted-foreground italic">
          {t('professor.style.staleNote')}
        </p>
      )}
    </motion.section>
  );
};

export const StyleHeroSkeleton: React.FC = () => (
  <div className="card-base p-6 sm:p-8 space-y-6 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-secondary" />
      <div className="space-y-2">
        <div className="h-5 w-48 bg-secondary rounded" />
        <div className="h-3 w-32 bg-secondary rounded" />
      </div>
    </div>
    <div className="h-24 rounded-xl bg-secondary/70" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-60 rounded-xl bg-secondary/70" />
      <div className="h-60 rounded-xl bg-secondary/70" />
    </div>
  </div>
);

export default StyleHero;
