import React from 'react';

// Pure-CSS skeleton kept out of EvolutionChart.tsx so we can lazy-load
// the Recharts-heavy chart without dragging its fallback into the
// shared bundle.
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

export default EvolutionChartSkeleton;
