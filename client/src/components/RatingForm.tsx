import React, { useState } from 'react';

interface Props {
  onSubmit: (data: { difficulty: number; fairness: number; comment: string }) => Promise<void>;
}

const RatingForm: React.FC<Props> = ({ onSubmit }) => {
  const [difficulty, setDifficulty] = useState(3);
  const [fairness, setFairness] = useState(3);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (comment.trim().length < 10) {
      errs.comment = 'Comment must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ difficulty, fairness, comment: comment.trim() });
      setComment('');
      setDifficulty(3);
      setFairness(3);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setErrors({ form: 'Failed to submit rating. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-navy-light border border-accent/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Rate This Professor</h3>

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Rating submitted successfully!
        </div>
      )}

      {errors.form && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Difficulty: {difficulty}/5
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Easy</span>
            <span>Hard</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Fairness: {fairness}/5
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={fairness}
            onChange={(e) => setFairness(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Unfair</span>
            <span>Very Fair</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this professor's exams..."
          rows={4}
          className="w-full bg-navy border border-accent/30 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 resize-none transition-colors"
        />
        {errors.comment && (
          <p className="text-red-400 text-xs mt-1">{errors.comment}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
};

export default RatingForm;
