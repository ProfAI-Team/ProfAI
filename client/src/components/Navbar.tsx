import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Home,
  Users,
  Upload as UploadIcon,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import ProfAvatar from './Avatar';
import { cn } from '../lib/utils';

interface NavLink {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/professors', labelKey: 'nav.professors', icon: Users },
  { to: '/upload', labelKey: 'nav.upload', icon: UploadIcon, authRequired: true },
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, authRequired: true },
];

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const visibleLinks = NAV_LINKS.filter((l) => !l.authRequired || isAuthenticated);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-chart-5 to-chart-2 flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-lg font-display font-bold tracking-tight">
              <span className="text-foreground">Prof</span>
              <span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(link.labelKey)}
                  {active && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 bg-secondary rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ProfAvatar name={user.name} size={28} variant="beam" />
                  <span className="text-sm font-medium text-foreground">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label={t('nav.signOut')}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-2 pl-3 border-l border-border">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t('nav.menu')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 space-y-1 border-t border-border">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-border">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <ProfAvatar name={user.name} size={32} variant="beam" />
                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.signOut')}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 px-1">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="btn-secondary"
                      >
                        {t('nav.signIn')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="btn-primary"
                      >
                        {t('nav.signUp')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
