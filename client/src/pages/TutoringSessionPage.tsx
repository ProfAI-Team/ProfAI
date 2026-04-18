import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Star,
  ExternalLink,
  MessageCircle,
  Calendar,
} from 'lucide-react';

import { tutoringService } from '../services/tutorService';
import type { TutoringSession } from '../types/b2b';
import PaymentBadge from '../components/b2b/PaymentBadge';
import { cn } from '../lib/utils';

const statusLabel: Record<TutoringSession['status'], string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal edildi',
  disputed: 'İtirazlı',
  no_show: 'Katılım yok',
};

const TutoringSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tutoring', 'session', id],
    queryFn: () => tutoringService.get(id as string),
    enabled: Boolean(id),
  });

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const completeMutation = useMutation({
    mutationFn: () =>
      tutoringService.complete(id as string, { rating, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tutoring', 'session', id],
      });
    },
  });

  if (query.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
      </div>
    );
  }
  if (query.isError || !query.data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-xl font-semibold">
          Oturum bulunamadı
        </h1>
      </div>
    );
  }

  const session = query.data;
  const scheduledDate = new Date(session.scheduledAt);
  const canComplete =
    session.status === 'scheduled' &&
    scheduledDate.getTime() < Date.now();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="card-base p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-xl font-bold">
              Tutoring oturumu
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {session.id.slice(0, 8)}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              session.status === 'completed'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : session.status === 'cancelled' ||
                    session.status === 'disputed'
                  ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300'
                  : 'border-primary/20 bg-primary/10 text-primary'
            )}
          >
            {statusLabel[session.status]}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Tarih + saat</p>
            <p className="font-medium mt-0.5">
              <Calendar className="inline w-4 h-4 mr-1" />
              {scheduledDate.toLocaleString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Süre</p>
            <p className="font-medium mt-0.5">{session.durationMin} dakika</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ücret</p>
            <p className="font-medium mt-0.5">₺{session.price}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ödeme</p>
            <PaymentBadge
              status={session.paymentId ? 'succeeded' : 'pending'}
            />
          </div>
        </div>
      </header>

      <section className="card-base p-6">
        <h2 className="font-display font-semibold mb-3">Görüşme</h2>
        {session.meetingUrl ? (
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary w-full"
          >
            <ExternalLink className="w-4 h-4" />
            Google Meet'e git
          </a>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground flex items-start gap-2">
            <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Meet linki oturum saatinden 30 dakika önce tutor tarafından
              paylaşılacak. Süre geldiğinde bu bölüm güncellenecek.
            </p>
          </div>
        )}
      </section>

      {session.status === 'completed' && session.rating !== null && (
        <section className="card-base p-6">
          <h2 className="font-display font-semibold mb-3">
            Değerlendirmen
          </h2>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                className={cn(
                  'w-5 h-5',
                  v <= (session.rating ?? 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground/40'
                )}
              />
            ))}
          </div>
          {session.feedback && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {session.feedback}
            </p>
          )}
        </section>
      )}

      {canComplete && session.status === 'scheduled' && (
        <section className="card-base p-6 space-y-3">
          <h2 className="font-display font-semibold">
            Derste nasıl gitti?
          </h2>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                aria-label={`${v} yıldız`}
                className="p-1"
              >
                <Star
                  className={cn(
                    'w-6 h-6',
                    v <= rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground/40'
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            className="input min-h-[120px]"
            placeholder="Neler iyi gittiğini / geliştirilebilecekleri yaz (isteğe bağlı)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="button"
            disabled={rating === 0 || completeMutation.isPending}
            onClick={() => completeMutation.mutate()}
            className="btn-primary"
          >
            Değerlendirmeyi gönder
          </button>
          {completeMutation.isError && (
            <p className="text-sm text-red-500">
              Gönderilemedi: {(completeMutation.error as Error).message}
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default TutoringSessionPage;
