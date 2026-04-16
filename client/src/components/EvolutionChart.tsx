import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

import type { StyleProfileEvolutionPoint } from '../services/professorService';
import { CHART_COLORS, CHART_NEUTRAL } from '../lib/chartColors';

interface Props {
  evolution: StyleProfileEvolutionPoint[];
}

// Minimum distinct years required to show a trend. Below this the chart
// would be misleading (1 point is not a trend).
const MIN_YEARS_FOR_TREND = 2;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    color?: string;
    name?: string;
    dataKey?: string;
  }>;
  label?: string | number;
}

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-elevated text-sm min-w-[140px]">
      {label !== undefined && (
        <p className="font-medium text-foreground mb-1">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
          <span style={{ color: entry.color }}>●</span>
          <span className="flex-1">{entry.name}</span>
          <span className="text-foreground font-medium">
            {entry.dataKey === 'difficulty'
              ? `${entry.value.toFixed(1)}/10`
              : `${Math.round(entry.value)}%`}
          </span>
        </p>
      ))}
    </div>
  );
};

const EvolutionChart: React.FC<Props> = ({ evolution }) => {
  const { t } = useTranslation();

  if (evolution.length < MIN_YEARS_FOR_TREND) {
    return null;
  }

  // Flatten nested questionTypes into sibling keys so Recharts can plot
  // them directly.
  const data = evolution.map((point) => ({
    year: point.year,
    multipleChoice: point.questionTypes['Multiple Choice'],
    openEnded: point.questionTypes['Classic/Open-ended'],
    trueFalse: point.questionTypes['True/False'],
    difficulty: point.difficulty,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-base p-6 sm:p-8"
    >
      <header className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          <LineChartIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="section-title text-lg sm:text-xl">
            {t('professor.style.evolutionLabel')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('professor.style.evolutionSubtitle', { count: evolution.length })}
          </p>
        </div>
      </header>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid stroke={CHART_NEUTRAL.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fill: CHART_NEUTRAL.axis, fontSize: 12 }}
            axisLine={{ stroke: CHART_NEUTRAL.grid }}
            tickLine={{ stroke: CHART_NEUTRAL.grid }}
          />
          <YAxis
            yAxisId="pct"
            domain={[0, 100]}
            tick={{ fill: CHART_NEUTRAL.axis, fontSize: 11 }}
            axisLine={{ stroke: CHART_NEUTRAL.grid }}
            tickLine={{ stroke: CHART_NEUTRAL.grid }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            yAxisId="difficulty"
            orientation="right"
            domain={[0, 10]}
            tick={{ fill: CHART_NEUTRAL.axis, fontSize: 11 }}
            axisLine={{ stroke: CHART_NEUTRAL.grid }}
            tickLine={{ stroke: CHART_NEUTRAL.grid }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, color: CHART_NEUTRAL.axis }}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="multipleChoice"
            name={t('analysis.types.multipleChoice')}
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLORS[0] }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="openEnded"
            name={t('analysis.types.openEnded')}
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLORS[1] }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="trueFalse"
            name={t('analysis.types.trueFalse')}
            stroke={CHART_COLORS[2]}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLORS[2] }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="difficulty"
            type="monotone"
            dataKey="difficulty"
            name={t('professor.style.metrics.avgDifficulty')}
            stroke={CHART_COLORS[3]}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 4, fill: CHART_COLORS[3] }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.section>
  );
};

export const EvolutionChartSkeleton: React.FC = () => (
  <div className="card-base p-6 sm:p-8 animate-pulse">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-secondary" />
      <div className="space-y-2">
        <div className="h-4 w-40 bg-secondary rounded" />
        <div className="h-3 w-24 bg-secondary rounded" />
      </div>
    </div>
    <div className="h-[280px] bg-secondary/70 rounded-xl" />
  </div>
);

export default EvolutionChart;
