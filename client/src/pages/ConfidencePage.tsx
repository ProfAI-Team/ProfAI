import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Gauge } from 'lucide-react';

import { confidenceService } from '../services/confidenceService';
import ConfidenceHeatmap from '../components/charts/ConfidenceHeatmap';

const ConfidencePage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['confidence', 'me'],
    queryFn: () => confidenceService.getMap(),
    staleTime: 60_000,
  });

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Gauge className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {t('confidence.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('confidence.subtitle')}
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="card-base h-64 animate-pulse bg-secondary/40" />
      ) : !data || data.length === 0 ? (
        <div className="card-base p-8 text-center">
          <p className="text-foreground font-medium">{t('confidence.empty.title')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('confidence.empty.hint')}
          </p>
        </div>
      ) : (
        <section className="card-base p-5 sm:p-6">
          <ConfidenceHeatmap entries={data} />
          <p className="text-xs text-muted-foreground mt-4">
            {t('confidence.legend')}
          </p>
        </section>
      )}
    </div>
  );
};

export default ConfidencePage;
