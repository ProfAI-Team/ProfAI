import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ocrService } from '../services/ocrService';
import CameraCapture from '../components/ocr/CameraCapture';
import LatexRenderer from '../components/ocr/LatexRenderer';
import { getApiErrorCode, getApiErrorMessage } from '../services/api';
import type { OCRResult, OCRUploadResponse } from '../types/multimodal';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function OCRPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [pending, setPending] = useState<File | null>(null);
  const [lastResponse, setLastResponse] = useState<OCRUploadResponse | null>(
    null
  );
  const [editedText, setEditedText] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const historyQuery = useQuery<{ results: OCRResult[] }>({
    queryKey: ['ocr', 'list'],
    queryFn: () => ocrService.listMine(),
    staleTime: 30_000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => ocrService.upload(file),
    onSuccess: (res) => {
      setLastResponse(res);
      setEditedText(res.result.extractedText);
      setPending(null);
      setErrorBanner(null);
      qc.invalidateQueries({ queryKey: ['ocr'] });
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === 'PREMIUM_REQUIRED') {
        setErrorBanner(t('ocr.errors.premium'));
      } else if (code === 'RATE_LIMITED') {
        setErrorBanner(t('ocr.errors.rateLimit'));
      } else {
        setErrorBanner(getApiErrorMessage(err) ?? t('ocr.errors.generic'));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ocrService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['ocr', 'list'] });
      const previous = qc.getQueryData<{ results: OCRResult[] }>([
        'ocr',
        'list',
      ]);
      qc.setQueryData<{ results: OCRResult[] }>(['ocr', 'list'], (old) =>
        old ? { results: old.results.filter((r) => r.id !== id) } : old
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['ocr', 'list'], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['ocr'] });
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-text-base">
          {t('ocr.heading')}
        </h1>
        <p className="mt-2 text-sm text-text-muted">{t('ocr.subheading')}</p>
      </header>

      {errorBanner && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {errorBanner}
        </div>
      )}

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">
          {t('ocr.uploadHeading')}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {t('ocr.uploadHelper')}
        </p>
        <div className="mt-4">
          <CameraCapture
            label={t('ocr.pickLabel')}
            helperText={t('ocr.pickHelper')}
            onSelect={(file) => setPending(file)}
            onError={(msg) => setErrorBanner(msg)}
          />
        </div>
        {pending && (
          <button
            type="button"
            onClick={() => uploadMutation.mutate(pending)}
            disabled={uploadMutation.isPending}
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {uploadMutation.isPending
              ? t('ocr.uploading')
              : t('ocr.upload')}
          </button>
        )}
      </section>

      {lastResponse && (
        <section className="mt-6 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">
              {t('ocr.resultHeading')}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                lastResponse.lowConfidence
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {t('ocr.confidence', {
                value: Math.round(lastResponse.result.confidence * 100),
              })}
            </span>
          </div>
          {lastResponse.lowConfidence && (
            <p className="mt-2 text-sm text-text-muted">
              {t('ocr.lowConfidenceHelp')}
            </p>
          )}
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={8}
            className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-sm"
          />
          {lastResponse.result.latexFormulas.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold">
                {t('ocr.latexHeading')}
              </h3>
              <ul className="mt-2 space-y-2">
                {lastResponse.result.latexFormulas.map((f, idx) => (
                  <li
                    key={`${f.latex}-${idx}`}
                    className="flex items-center gap-3"
                  >
                    <LatexRenderer latex={f.latex} />
                    <span className="text-xs text-text-muted">
                      {Math.round(f.confidence * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              to="/upload-notes"
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-border"
            >
              {t('ocr.sendToNotes')}
            </Link>
            <Link
              to="/mock-exam/generate"
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-border"
            >
              {t('ocr.useForStudyPack')}
            </Link>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">
          {t('ocr.historyHeading')}
        </h2>
        {historyQuery.isLoading && (
          <p className="mt-3 text-sm text-text-muted">
            {t('ocr.loadingHistory')}
          </p>
        )}
        {historyQuery.data?.results.length === 0 && (
          <p className="mt-3 text-sm text-text-muted">
            {t('ocr.emptyHistory')}
          </p>
        )}
        <ul className="mt-3 space-y-3">
          {historyQuery.data?.results.map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="text-xs text-text-muted">
                  {formatDate(r.createdAt)} · {r.provider}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-text-base">
                  {r.extractedText || t('ocr.emptyText')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(r.id)}
                disabled={deleteMutation.isPending}
                className="text-xs text-text-muted underline-offset-2 hover:underline disabled:opacity-50"
              >
                {t('ocr.delete')}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
