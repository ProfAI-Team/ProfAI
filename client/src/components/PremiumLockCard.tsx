import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Sparkles } from 'lucide-react';

interface Props {
  featureKey: 'courseAdvisor' | 'examReconstruct';
  onUpgrade?: () => void;
}

/**
 * Empty state shown when the user hits a premium-gated feature without
 * a subscription. Non-aggressive by design — explains what the feature
 * does before asking for an upgrade.
 */
export const PremiumLockCard: React.FC<Props> = ({ featureKey, onUpgrade }) => {
  const { t } = useTranslation();
  return (
    <div className="card-base p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">
            {t(`premium.${featureKey}.title`)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('premium.lockBadge')}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t(`premium.${featureKey}.pitch`)}
      </p>
      <ul className="space-y-2 text-sm">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground">
              {t(`premium.${featureKey}.bullets.${i}`)}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onUpgrade}
        className="btn-primary w-full sm:w-auto"
      >
        {t('premium.upgradeCta')}
      </button>
      <p className="text-xs text-muted-foreground">{t('premium.trust')}</p>
    </div>
  );
};

export default PremiumLockCard;
