// Shared palette for Recharts across the app.
//
// Prefer hex colors here rather than `hsl(var(--...))` because Recharts
// forwards stroke/fill straight to SVG and a CSS variable reference can
// resolve to `undefined` during the first client paint, producing black
// slices. These hex values match the violet-anchored edu-premium palette
// used in AnalysisCard.
export const CHART_COLORS = [
  '#8B5CF6', // primary violet
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
] as const;

export function colorAt(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Neutral accents read from the theme, safe when the chart mounts after
// first paint (axis/tick/border callouts live in CSS tokens that have
// resolved by then).
export const CHART_NEUTRAL = {
  axis: 'hsl(var(--muted-foreground))',
  grid: 'hsl(var(--border))',
  cursor: 'hsl(var(--secondary))',
};
