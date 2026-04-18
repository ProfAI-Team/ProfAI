import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarDays, Loader2, BookOpen } from 'lucide-react';

import { tutorService, tutoringService } from '../services/tutorService';
import RatingStars from '../components/b2b/RatingStars';
import PriceTag from '../components/b2b/PriceTag';
import ApprovalBanner from '../components/b2b/ApprovalBanner';

const TutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMin, setDurationMin] = useState(60);

  const tutorQuery = useQuery({
    queryKey: ['tutors', 'byId', id],
    queryFn: () => tutorService.getById(id as string),
    enabled: Boolean(id),
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      tutoringService.book({
        tutorId: id as string,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMin,
      }),
    onSuccess: (session) => {
      navigate(`/tutoring/sessions/${session.id}`);
    },
  });

  if (tutorQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
      </div>
    );
  }

  if (tutorQuery.isError || !tutorQuery.data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-xl font-semibold">
          Tutor bulunamadı
        </h1>
      </div>
    );
  }

  const tutor = tutorQuery.data;
  const price = Math.round((tutor.hourlyRate * durationMin) / 60);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {tutor.status !== 'active' && (
        <ApprovalBanner status="pending" />
      )}

      <header className="card-base p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold">
              {tutor.specializations[0]?.subject ?? 'Tutor'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {tutor.bio}
            </p>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <RatingStars rating={tutor.rating} />
              <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                <BookOpen className="w-3 h-3" />
                {tutor.totalSessions} tamamlanan ders
              </span>
            </div>
          </div>
          <PriceTag priceTl={tutor.hourlyRate} hint="saatlik" size="lg" />
        </div>
      </header>

      <section className="card-base p-6">
        <h2 className="font-display font-semibold mb-3">Uzmanlık alanları</h2>
        <div className="flex flex-wrap gap-2">
          {tutor.specializations.map((s, i) => (
            <span
              key={`${s.subject}-${i}`}
              className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1"
            >
              {s.subject} · {s.level}
            </span>
          ))}
        </div>
      </section>

      <section className="card-base p-6">
        <h2 className="font-display font-semibold mb-3">Ders al</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs font-medium text-muted-foreground">
              Tarih + saat
            </span>
            <input
              type="datetime-local"
              className="input mt-1"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </label>
          <label>
            <span className="text-xs font-medium text-muted-foreground">
              Süre (dakika)
            </span>
            <input
              type="number"
              min={15}
              max={180}
              step={15}
              className="input mt-1"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <PriceTag priceTl={price} hint="toplam" />
          <button
            type="button"
            disabled={!scheduledAt || bookMutation.isPending}
            onClick={() => bookMutation.mutate()}
            className="btn-primary"
          >
            <CalendarDays className="w-4 h-4" />
            Rezerve et
          </button>
        </div>
        {bookMutation.isError && (
          <p className="text-sm text-red-500 mt-3">
            {(bookMutation.error as Error).message}
          </p>
        )}
      </section>
    </div>
  );
};

export default TutorDetailPage;
