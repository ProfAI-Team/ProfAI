import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import type { ReportedTopic, TopicFrequency } from '../types/community';

interface Props {
  value: ReportedTopic[];
  onChange: (next: ReportedTopic[]) => void;
}

const frequencyOptions: TopicFrequency[] = ['once', 'few', 'many'];

export const ReportedTopicsEditor: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const update = (idx: number, patch: Partial<ReportedTopic>) => {
    const next = value.map((row, i) => (i === idx ? { ...row, ...patch } : row));
    onChange(next);
  };
  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };
  const add = () => {
    onChange([
      ...value,
      { topic: '', frequency: 'few', difficulty: 3 },
    ]);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('community.postExam.editor.empty')}
        </p>
      )}
      {value.map((row, idx) => (
        <div
          key={idx}
          className="card-base p-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto] items-center"
        >
          <input
            type="text"
            value={row.topic}
            onChange={(e) => update(idx, { topic: e.target.value })}
            placeholder={t('community.postExam.editor.topicPlaceholder')}
            className="input-field text-sm"
            aria-label={t('community.postExam.editor.topicLabel')}
          />
          <select
            value={row.frequency}
            onChange={(e) =>
              update(idx, { frequency: e.target.value as TopicFrequency })
            }
            className="input-field text-sm"
            aria-label={t('community.postExam.editor.frequencyLabel')}
          >
            {frequencyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {t(`community.postExam.frequency.${opt}`)}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 min-w-[140px]">
            <input
              type="range"
              min={1}
              max={5}
              value={row.difficulty}
              onChange={(e) =>
                update(idx, { difficulty: Number(e.target.value) })
              }
              className="flex-1 accent-primary"
              aria-label={t('community.postExam.editor.difficultyLabel')}
            />
            <span className="text-sm font-medium tabular-nums w-6 text-right">
              {row.difficulty}
            </span>
          </div>
          <button
            type="button"
            onClick={() => remove(idx)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            aria-label={t('community.postExam.editor.remove')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="btn-ghost text-sm gap-1.5"
      >
        <Plus className="w-4 h-4" />
        {t('community.postExam.editor.addTopic')}
      </button>
    </div>
  );
};

export default ReportedTopicsEditor;
