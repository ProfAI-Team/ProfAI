import React from 'react';

// Pure-CSS skeleton kept out of StyleHero.tsx so we can lazy-load the
// Recharts-heavy hero without dragging its fallback into the shared
// bundle.
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

export default StyleHeroSkeleton;
