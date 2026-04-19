import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Home,
  Users,
  Upload as UploadIcon,
  Wand2,
  ClipboardCheck,
  AlarmClockCheck,
  ShieldCheck,
  UsersRound,
  LayoutDashboard,
  Brain,
  GraduationCap,
  ListChecks,
  Mic,
  ScanLine,
  Headphones,
  Camera,
  Menu,
  X,
  LogOut,
  UserRoundCheck,
  ShoppingBag,
  Briefcase,
  Building2,
  BookOpen,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import ProfAvatar from './Avatar';
import CreditBadge from './CreditBadge';
import NavDropdown from './NavDropdown';
import { cn } from '../lib/utils';

type UserRole =
  | 'STUDENT'
  | 'HOCA'
  | 'TUTOR'
  | 'UNIVERSITY_ADMIN'
  | 'SUPER_ADMIN';

type NavGroup = 'top' | 'study' | 'tools';

interface NavLink {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
  roles?: UserRole[]; // Phase 7 (7.27) — only show when user has this role.
  group?: NavGroup; // default: 'top'. Phase 7 retro — dropdown grouping to stop overflow at 1440px.
}

const NAV_LINKS: NavLink[] = [
  // Top-level — always visible in the main nav row.
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/professors', labelKey: 'nav.professors', icon: Users },
  { to: '/tutors', labelKey: 'nav.tutors', icon: UserRoundCheck },
  { to: '/marketplace', labelKey: 'nav.marketplace', icon: ShoppingBag },
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, authRequired: true },

  // Hazırlık / Study — core learner workflow.
  { to: '/upload', labelKey: 'nav.upload', icon: UploadIcon, authRequired: true, group: 'study' },
  { to: '/upload-notes', labelKey: 'nav.uploadNotes', icon: Wand2, authRequired: true, group: 'study' },
  { to: '/mock-exam/generate', labelKey: 'nav.mockExam', icon: ClipboardCheck, authRequired: true, group: 'study' },
  { to: '/panic', labelKey: 'nav.panic', icon: AlarmClockCheck, authRequired: true, group: 'study' },
  { to: '/approve-exams', labelKey: 'nav.approveExams', icon: ShieldCheck, authRequired: true, group: 'study' },
  { to: '/study-groups', labelKey: 'nav.studyGroups', icon: UsersRound, authRequired: true, group: 'study' },
  { to: '/me/profile', labelKey: 'nav.dnaProfile', icon: Brain, authRequired: true, group: 'study' },
  { to: '/me/grades', labelKey: 'nav.grades', icon: GraduationCap, authRequired: true, group: 'study' },
  { to: '/me/reviews', labelKey: 'nav.reviews', icon: ListChecks, authRequired: true, group: 'study' },

  // AI araçları — premium-gated creative tooling.
  { to: '/tutor', labelKey: 'nav.voiceTutor', icon: Mic, authRequired: true, group: 'tools' },
  { to: '/me/ocr', labelKey: 'nav.ocr', icon: ScanLine, authRequired: true, group: 'tools' },
  { to: '/me/lectures', labelKey: 'nav.lectures', icon: Headphones, authRequired: true, group: 'tools' },
  { to: '/search/multimodal', labelKey: 'nav.multimodalSearch', icon: Camera, authRequired: true, group: 'tools' },

  // Phase 7 (7.27) — role-scoped entries stay top-level since roles filter the number of visible items.
  {
    to: '/hoca/dashboard',
    labelKey: 'nav.hocaDashboard',
    icon: Briefcase,
    authRequired: true,
    roles: ['HOCA'],
  },
  {
    to: '/admin/university',
    labelKey: 'nav.universityAdmin',
    icon: Building2,
    authRequired: true,
    roles: ['UNIVERSITY_ADMIN'],
  },
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

  const userRole = (user?.role ?? 'STUDENT') as UserRole;
  const visibleLinks = NAV_LINKS.filter((l) => {
    if (l.authRequired && !isAuthenticated) return false;
    if (l.roles && !l.roles.includes(userRole) && userRole !== 'SUPER_ADMIN') {
      return false;
    }
    return true;
  });

  const topLinks = visibleLinks.filter((l) => (l.group ?? 'top') === 'top');
  const studyLinks = visibleLinks.filter((l) => l.group === 'study');
  const toolsLinks = visibleLinks.filter((l) => l.group === 'tools');

  const toDropdownItems = (links: NavLink[]) =>
    links.map((l) => ({ to: l.to, label: t(l.labelKey), icon: l.icon }));

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
            {topLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap',
                    active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
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
            {studyLinks.length > 0 && (
              <NavDropdown
                label={t('nav.groups.study')}
                icon={BookOpen}
                items={toDropdownItems(studyLinks)}
              />
            )}
            {toolsLinks.length > 0 && (
              <NavDropdown
                label={t('nav.groups.tools')}
                icon={Wrench}
                items={toDropdownItems(toolsLinks)}
              />
            )}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border">
                <CreditBadge />
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
                {(() => {
                  const renderLink = (link: NavLink) => {
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
                  };
                  const section = (titleKey: string, links: NavLink[]) =>
                    links.length === 0 ? null : (
                      <div key={titleKey} className="pt-2">
                        <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                          {t(titleKey)}
                        </div>
                        {links.map(renderLink)}
                      </div>
                    );
                  return (
                    <>
                      {topLinks.map(renderLink)}
                      {section('nav.groups.study', studyLinks)}
                      {section('nav.groups.tools', toolsLinks)}
                    </>
                  );
                })()}
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
