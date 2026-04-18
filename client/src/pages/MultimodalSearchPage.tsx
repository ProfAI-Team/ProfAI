import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { multimodalSearchService } from '../services/multimodalSearchService';
import CameraCapture from '../components/ocr/CameraCapture';
import { getApiErrorCode, getApiErrorMessage } from '../services/api';
import type { MultimodalSearchResponse } from '../types/multimodal';

export default function MultimodalSearchPage() {
  const { t } = useTranslation();
  const [pending, setPending] = useState<File | null>(null);
  const [result, setResult] = useState<MultimodalSearchResponse | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: (file: File) => multimodalSearchService.search(file, 10),
    onSuccess: (data) => {
      setResult(data);
      setPending(null);
      setErrorBanner(null);
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      setErrorBanner(
        code === 'PREMIUM_REQUIRED'
          ? t('multimodal.errors.premium')
          : code === 'RATE_LIMITED'
            ? t('multimodal.errors.rateLimit')
            : getApiErrorMessage(err) ?? t('multimodal.errors.generic')
      );
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-text-base">
          {t('multimodal.heading')}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {t('multimodal.subheading')}
        </p>
      </header>

      {errorBanner && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {errorBanner}
        </div>
      )}

      <section className="rounded-lg border border-border bg-surface p-6">
        <CameraCapture
          label={t('multimodal.pickLabel')}
          helperText={t('multimodal.pickHelper')}
          onSelect={(file) => setPending(file)}
          onError={(msg) => setErrorBanner(msg)}
        />
        {pending && (
          <button
            type="button"
            onClick={() => searchMutation.mutate(pending)}
            disabled={searchMutation.isPending}
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {searchMutation.isPending
              ? t('multimodal.searching')
              : t('multimodal.search')}
          </button>
        )}
      </section>

      {result && result.status === 'empty' && (
        <section className="mt-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">
            {t('multimodal.emptyHeading')}
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {t('multimodal.emptyHelper')}
          </p>
          <p className="mt-4 text-xs text-text-muted">
            {t('multimodal.detectedKeywords', {
              list: result.keywords.join(', ') || '—',
            })}
          </p>
        </section>
      )}

      {result && result.status === 'ready' && (
        <section className="mt-6 space-y-4">
          <header>
            <h2 className="font-display text-lg font-semibold">
              {t('multimodal.resultsHeading', { count: result.results.length })}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{result.description}</p>
            <p className="mt-1 text-xs text-text-muted">
              {t('multimodal.detectedKeywords', {
                list: result.keywords.join(', ') || '—',
              })}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {t('multimodal.disclaimer')}
            </p>
          </header>
          <ul className="grid gap-3 md:grid-cols-2">
            {result.results.map((hit) => (
              <li
                key={`${hit.source}-${hit.id}`}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>
                    {hit.source === 'exam-analysis'
                      ? t('multimodal.sourceExam')
                      : t('multimodal.sourceMock')}
                    {hit.year ? ` · ${hit.year}` : null}
                  </span>
                  <span>{Math.round(hit.similarity * 100)}%</span>
                </div>
                {hit.professor && (
                  <Link
                    to={`/professors/${hit.professor.id}`}
                    className="mt-2 block text-sm font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {hit.professor.name}
                    <span className="text-text-muted">
                      {' · '}
                      {hit.professor.university}
                    </span>
                  </Link>
                )}
                <p className="mt-2 line-clamp-3 text-sm text-text-base">
                  {hit.snippet}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
