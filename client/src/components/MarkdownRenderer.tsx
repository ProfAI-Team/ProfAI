import React, { Suspense, lazy } from 'react';

/**
 * Lazy-loaded markdown renderer (Phase 7 task 7.7). Before this split,
 * every page that rendered student-authored markdown pulled
 * react-markdown + remark-gfm into the initial entry chunk — that chunk
 * weighed ~47 KB gzipped and named itself after VoteButtons because it
 * was the smallest consumer Vite picked for the chunk label.
 *
 * Breaking react-markdown into its own lazy chunk buys us:
 *   - ~40 KB off the initial client entry (VoteButtons + ExamQuestion +
 *     StudyPack + MockExamResult + PracticeQuestion no longer ship the
 *     renderer on first paint).
 *   - A single place to tune plugin behaviour (remark-gfm always on for
 *     now; Phase 8 may add rehype-katex for tutoring review math).
 *   - A safe render fallback — children are shown as a plain
 *     `<div>` until the chunk loads so slow connections don't see a
 *     layout shift.
 */

const LazyMarkdown = lazy(async () => {
  const [mod, gfm] = await Promise.all([
    import('react-markdown'),
    import('remark-gfm'),
  ]);
  const ReactMarkdown = mod.default;
  const remarkGfm = gfm.default;

  const Wrapped: React.FC<{ markdown: string }> = ({ markdown }) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
  );
  return { default: Wrapped };
});

interface Props {
  markdown: string;
  className?: string;
  fallbackClassName?: string;
}

const MarkdownRenderer: React.FC<Props> = ({
  markdown,
  className,
  fallbackClassName,
}) => {
  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className={fallbackClassName}>{markdown}</div>
        }
      >
        <LazyMarkdown markdown={markdown} />
      </Suspense>
    </div>
  );
};

export default MarkdownRenderer;
