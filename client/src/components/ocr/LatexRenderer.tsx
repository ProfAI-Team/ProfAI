import { useEffect, useRef, useState } from 'react';

// Phase 6 (6.17) — KaTeX wrapper with dynamic import. The KaTeX CSS is
// loaded lazily on first render so /me/ocr doesn't drag it into the
// initial bundle.

export interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

let cssLoaded = false;

async function ensureKatexCss(): Promise<void> {
  if (cssLoaded || typeof document === 'undefined') return;
  await import('katex/dist/katex.min.css');
  cssLoaded = true;
}

export function LatexRenderer({
  latex,
  displayMode = false,
  className,
}: LatexRendererProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureKatexCss();
        const katex = (await import('katex')).default;
        if (cancelled) return;
        const rendered = katex.renderToString(latex, {
          throwOnError: false,
          displayMode,
          output: 'html',
        });
        setHtml(rendered);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'LaTeX hatası');
        setHtml(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latex, displayMode]);

  if (error) {
    return (
      <code className="inline-block rounded bg-surface px-1 text-xs text-text-muted">
        {latex}
      </code>
    );
  }

  if (!html) {
    return (
      <span className="inline-block animate-pulse rounded bg-border/50 px-2 py-1 text-xs">
        {latex}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default LatexRenderer;
