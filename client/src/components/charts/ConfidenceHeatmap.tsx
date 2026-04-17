import React from 'react';
import type { ConfidenceEntry } from '../../types/dna';

interface Props {
  entries: ConfidenceEntry[];
  onCellClick?: (topic: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200';
  if (score >= 40) return 'bg-amber-500/20 border-amber-500/40 text-amber-900 dark:text-amber-200';
  return 'bg-rose-500/20 border-rose-500/40 text-rose-900 dark:text-rose-200';
}

/**
 * Simple CSS grid heatmap — one cell per topic colored by confidence
 * score. No Recharts here (Recharts doesn't ship a heatmap primitive),
 * but we keep this in charts/ alongside the radar so the lazy-loading
 * story is consistent.
 */
const ConfidenceHeatmap: React.FC<Props> = ({ entries, onCellClick }) => {
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {entries.map((e) => (
        <button
          key={e.topic}
          type="button"
          onClick={() => onCellClick?.(e.topic)}
          className={`text-left p-3 rounded-xl border transition-colors hover:ring-2 hover:ring-primary/40 ${scoreColor(
            e.score
          )}`}
        >
          <div className="text-xs font-medium opacity-70 truncate">
            {e.topic}
          </div>
          <div className="text-xl font-display font-semibold">
            {e.score}
          </div>
          <div className="text-[10px] opacity-70">
            N = {e.lastQuestionCount}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConfidenceHeatmap;
