import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShieldCheck, AlertCircle, Users } from 'lucide-react';

import { hocaService } from '../services/hocaService';
import RoleGuard from '../components/b2b/RoleGuard';

const HocaDashboardPage: React.FC = () => {
  const query = useQuery({
    queryKey: ['hoca', 'dashboard'],
    queryFn: () => hocaService.dashboard([]),
  });

  return (
    <RoleGuard roles={['HOCA']}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <header className="card-base p-6 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="font-display text-2xl font-bold">
              Hoca paneli
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Öğrencilerinin ProfAI metriklerindeki aggregate görünümü.
              Her ölçüm k≥5 öğrenci üstünde hesaplanır.
            </p>
          </div>
        </header>

        {query.isLoading && (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
          </div>
        )}

        {query.data?.status === 'insufficient' && (
          <div className="card-base p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <p className="font-display font-semibold">
                  Henüz yeterli veri yok
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Raporlar için en az 5 öğrenci gerekli. Derslerini ekle,
                  mock sınav çözüldükçe veriler burada görünmeye başlayacak.
                </p>
              </div>
            </div>
          </div>
        )}

        {query.data?.status === 'ready' &&
          query.data.professors.map((prof) => (
            <section
              key={prof.professorId}
              className="card-base p-6"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-display font-semibold">{prof.name}</h2>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {prof.studentCount} öğrenci
                </span>
              </div>
              {prof.strugglingTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-3">
                  Konu bazlı yeterli örnek yok (k≥5 şartı).
                </p>
              ) : (
                <>
                  <h3 className="text-sm font-medium mt-4 mb-2">
                    En çok zorlanılan konular
                  </h3>
                  <ul className="space-y-2">
                    {prof.strugglingTopics.map((t) => (
                      <li
                        key={t.topic}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <span className="text-sm">{t.topic}</span>
                        <span className="text-xs font-medium text-red-500">
                          %{t.avgScore} doğru · {t.sampleSize} örnek
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ))}
      </div>
    </RoleGuard>
  );
};

export default HocaDashboardPage;
