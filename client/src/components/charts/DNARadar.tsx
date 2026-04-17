import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: Array<{ topic: string; score: number }>;
}

/**
 * Lazy-loaded radar chart for the DNA profile page. Wrapping this in
 * React.lazy keeps Recharts off the initial bundle (≈ 97KB gzipped).
 */
const DNARadar: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart
        data={data}
        margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
      >
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fill: 'var(--foreground)', fontSize: 12 }}
        />
        <Radar
          name="DNA"
          dataKey="score"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default DNARadar;
