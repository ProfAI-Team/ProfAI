import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';

import { universityService } from '../services/universityService';
import RoleGuard from '../components/b2b/RoleGuard';
import SeatCounter from '../components/b2b/SeatCounter';

const UniversityAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');

  const query = useQuery({
    queryKey: ['university', 'dashboard'],
    queryFn: () => universityService.getDashboard(),
  });

  const addMutation = useMutation({
    mutationFn: () => universityService.addSeat(email),
    onSuccess: () => {
      setEmail('');
      queryClient.invalidateQueries({
        queryKey: ['university', 'dashboard'],
      });
    },
  });

  return (
    <RoleGuard roles={['UNIVERSITY_ADMIN']}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Üniversite paneli
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Koltuklar, aggregate performans, SSO entegrasyonu.
          </p>
        </header>

        {query.isLoading && (
          <div className="py-10 text-center">
            <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
          </div>
        )}

        {query.data && (
          <>
            <SeatCounter
              used={query.data.tenant.seatsUsed}
              total={query.data.tenant.seats}
            />

            {query.data.status === 'insufficient' ? (
              <div className="card-base p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 text-amber-500" />
                  <div>
                    <p className="font-display font-semibold">
                      Aggregate veri için ≥5 aktif öğrenci gerekli
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Koltukları ekleyin; öğrenciler mock sınav çözdükçe
                      grafikler burada görünmeye başlar.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <section className="card-base p-6">
                  <h2 className="font-display font-semibold mb-3">
                    Genel bakış
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Aktif öğrenci
                      </p>
                      <p className="font-display text-2xl font-bold mt-1">
                        {query.data.activeStudents}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Tamamlanan mock sınav
                      </p>
                      <p className="font-display text-2xl font-bold mt-1">
                        {query.data.mockExamSessions.completed}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Ortalama skor
                      </p>
                      <p className="font-display text-2xl font-bold mt-1">
                        {query.data.mockExamSessions.avgScore?.toFixed(1) ??
                          '—'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="card-base p-6">
                  <h2 className="font-display font-semibold mb-3">
                    En çok zorlanılan konular
                  </h2>
                  {query.data.topStruggling.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Henüz yeterli örnek yok.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {query.data.topStruggling.map((t) => (
                        <li
                          key={t.topic}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <span className="text-sm">{t.topic}</span>
                          <span className="text-xs font-medium text-red-500">
                            %{t.avgScore} · {t.sampleSize}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}

            <section className="card-base p-6">
              <h2 className="font-display font-semibold mb-3">
                Koltuk ekle
              </h2>
              <form
                className="flex flex-wrap gap-3 items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  addMutation.mutate();
                }}
              >
                <label className="flex-1 min-w-[260px]">
                  <span className="text-xs font-medium text-muted-foreground">
                    Öğrenci e-postası
                  </span>
                  <input
                    type="email"
                    className="input mt-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ogrenci@aydin.edu.tr"
                  />
                </label>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!email || addMutation.isPending}
                >
                  <UserPlus className="w-4 h-4" />
                  Ekle
                </button>
              </form>
              {addMutation.isError && (
                <p className="text-sm text-red-500 mt-2">
                  {(addMutation.error as Error).message}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </RoleGuard>
  );
};

export default UniversityAdminPage;
