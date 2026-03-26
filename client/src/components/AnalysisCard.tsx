import React from 'react';
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
import { ExamAnalysis } from '../types';

interface Props {
  analysis: ExamAnalysis;
}

const COLORS = ['#4A90D9', '#00D2FF', '#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

const AnalysisCard: React.FC<Props> = ({ analysis }) => {
  const getDifficultyBadge = (score: number) => {
    if (score < 4)
      return { className: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Easy' };
    if (score <= 7)
      return { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Medium' };
    return { className: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Hard' };
  };

  const badge = getDifficultyBadge(analysis.difficultyScore);

  return (
    <div className="bg-navy-light border border-accent/20 rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h3 className="text-lg font-semibold text-white">Exam Analysis</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {analysis.questionCount} Questions
          </span>
          <span className={`text-sm px-3 py-1 rounded-full border ${badge.className}`}>
            {badge.label} ({analysis.difficultyScore.toFixed(1)}/10)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Question Types */}
        {analysis.questionTypes && analysis.questionTypes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Question Types</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analysis.questionTypes}
                  dataKey="percentage"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                >
                  {analysis.questionTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #0F3460',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - Topic Distribution */}
        {analysis.topicDistribution && analysis.topicDistribution.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Topic Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analysis.topicDistribution}>
                <XAxis
                  dataKey="topic"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #0F3460',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="frequency" fill="#4A90D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {analysis.summary && (
        <div className="bg-navy/50 rounded-lg p-4 border border-accent/10">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Summary</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;
