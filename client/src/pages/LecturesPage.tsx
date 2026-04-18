import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { lectureService } from '../services/lectureService';
import { getApiErrorCode, getApiErrorMessage } from '../services/api';
import type { LectureDetail, LectureTopic } from '../types/multimodal';

function formatMinutes(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function normalizeTopics(detail: LectureDetail): {
  keyTopics: LectureTopic[];
  examHints: string[];
} {
  const raw = detail.topics as {
    keyTopics?: LectureTopic[];
    examHints?: string[];
  };
  return {
    keyTopics: Array.isArray(raw?.keyTopics) ? raw.keyTopics : [],
    examHints: Array.isArray(raw?.examHints) ? raw.examHints : [],
  };
}

export default function LecturesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(
    null
  );
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const listQuery = useQuery<{ lectures: LectureDetail[] }>({
    queryKey: ['lectures', 'list'],
    queryFn: () => lectureService.listMine(),
    refetchInterval: (q) => {
      // Poll faster while there is a pending upload — the worker flips
      // durationSec > 0 once processing finishes.
      const anyPending = q.state.data?.lectures.some(
        (l) => (l.durationSec ?? 0) === 0
      );
      return anyPending ? 5_000 : 60_000;
    },
  });

  const detailQuery = useQuery<{ lecture: LectureDetail }>({
    queryKey: ['lectures', 'detail', selectedLectureId],
    queryFn: () =>
      selectedLectureId
        ? lectureService.get(selectedLectureId)
        : Promise.reject(new Error('no-lecture')),
    enabled: !!selectedLectureId,
    staleTime: 30_000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => lectureService.upload(file),
    onSuccess: (res) => {
      setSelectedFile(null);
      setErrorBanner(null);
      qc.invalidateQueries({ queryKey: ['lectures'] });
      if (res.status === 'duplicate') {
        setErrorBanner(t('lectures.duplicateNotice'));
      }
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      setErrorBanner(
        code === 'PREMIUM_REQUIRED'
          ? t('lectures.errors.premium')
          : code === 'RATE_LIMITED'
            ? t('lectures.errors.rateLimit')
            : getApiErrorMessage(err) ?? t('lectures.errors.generic')
      );
    },
  });

  const selectedLecture = detailQuery.data?.lecture ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-text-base">
          {t('lectures.heading')}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {t('lectures.subheading')}
        </p>
      </header>

      {errorBanner && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
          {errorBanner}
        </div>
      )}

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">
          {t('lectures.uploadHeading')}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {t('lectures.uploadHelper')}
        </p>
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="mt-4 block w-full text-sm"
        />
        {selectedFile && (
          <button
            type="button"
            onClick={() => uploadMutation.mutate(selectedFile)}
            disabled={uploadMutation.isPending}
            className="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {uploadMutation.isPending
              ? t('lectures.uploading')
              : t('lectures.upload')}
          </button>
        )}
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
        <aside className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            {t('lectures.historyHeading')}
          </h2>
          {listQuery.isLoading && (
            <p className="text-sm text-text-muted">{t('lectures.loading')}</p>
          )}
          {listQuery.data?.lectures.length === 0 && (
            <p className="text-sm text-text-muted">{t('lectures.empty')}</p>
          )}
          <ul className="space-y-2">
            {listQuery.data?.lectures.map((lecture) => {
              const pending = (lecture.durationSec ?? 0) === 0;
              const isActive = selectedLectureId === lecture.id;
              return (
                <li key={lecture.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLectureId(lecture.id)}
                    className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface hover:bg-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {new Date(lecture.createdAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                      {pending ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                          {t('lectures.processing')}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">
                          {formatMinutes(lecture.durationSec)}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section>
          {!selectedLecture && (
            <p className="text-sm text-text-muted">
              {t('lectures.pickHelper')}
            </p>
          )}
          {selectedLecture && (
            <div className="space-y-6">
              {(() => {
                const { keyTopics, examHints } = normalizeTopics(selectedLecture);
                return (
                  <>
                    {examHints.length > 0 && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                        <h3 className="font-display text-base font-semibold text-primary">
                          {t('lectures.examHints')}
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                          {examHints.map((hint, idx) => (
                            <li key={idx}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {keyTopics.length > 0 && (
                      <div>
                        <h3 className="font-display text-base font-semibold">
                          {t('lectures.keyTopics')}
                        </h3>
                        <ul className="mt-2 space-y-2 text-sm">
                          {keyTopics.map((topic, idx) => (
                            <li
                              key={`${topic.topic}-${idx}`}
                              className="rounded-lg border border-border bg-surface px-3 py-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {topic.topic}
                                </span>
                                <span className="text-xs text-text-muted">
                                  {formatMinutes(topic.timestampSec)}
                                </span>
                              </div>
                              {topic.quote && (
                                <p className="mt-1 text-xs italic text-text-muted">
                                  "{topic.quote}"
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-base font-semibold">
                        {t('lectures.transcriptHeading')}
                      </h3>
                      <pre className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 text-sm">
                        {selectedLecture.transcript ||
                          t('lectures.transcriptPending')}
                      </pre>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
