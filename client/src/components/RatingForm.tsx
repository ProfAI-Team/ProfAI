import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onSubmit: (data: { difficulty: number; fairness: number; comment: string }) => Promise<void>;
}

const RatingForm: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(3);
  const [fairness, setFairness] = useState(3);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    setSubmitting(true);
    try {
      await onSubmit({ difficulty, fairness, comment: comment.trim() });
      setComment('');
      setDifficulty(3);
      setFairness(3);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setErrors({ form: t('common.error') });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
  }> = ({ label, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}{' '}
        <span className="text-muted-foreground font-normal text-xs">{value}/5</span>
      </label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors group"
            aria-label={`${label} ${n}/5`}
          >
            <Star
              className={cn(
                'w-6 h-6 transition-all',
                n <= value
                  ? 'text-warning fill-warning'
                  : 'text-muted-foreground/40 group-hover:text-warning'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="card-base p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-5">
        {t('rating.title')}
      </h3>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {t('rating.success')}
        </motion.div>
      )}

      {errors.form && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <StarRating label={t('rating.difficulty')} value={difficulty} onChange={setDifficulty} />
        <StarRating label={t('rating.fairness')} value={fairness} onChange={setFairness} />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">
          {t('rating.comment')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className={cn(
            'w-full input-field resize-none',
            errors.comment && 'border-destructive focus:ring-destructive/40'
          )}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary disabled:opacity-50 disabled:pointer-events-none"
      >
        {submitting ? t('rating.loading') : t('rating.submit')}
      </button>
    </form>
  );
};

export default RatingForm;
