import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Code2 } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-chart-5 to-chart-2 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-lg">
                <span className="text-foreground">Prof</span>
                <span className="text-gradient">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">{t('footer.explore')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/professors" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.professors')}
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.uploadExam')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.myDashboard')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">{t('footer.account')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.signIn')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.signUp')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t('footer.copyright', { year })}
          </p>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Code2 className="w-4 h-4" />
            {t('footer.sourceCode')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
