import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, User, Mail, Lock, Building2, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Object.values(form).some((v) => !v.trim())) {
      setError(t('auth.errors.generic'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('auth.errors.generic'));
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.errors.emailExists'));
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{
    name: keyof typeof form;
    labelKey: string;
    type: string;
    icon: React.ComponentType<{ className?: string }>;
    placeholder?: string;
  }> = [
    { name: 'name', labelKey: 'auth.register.name', type: 'text', icon: User, placeholder: 'Ada Lovelace' },
    { name: 'email', labelKey: 'auth.register.email', type: 'email', icon: Mail, placeholder: 'you@university.edu' },
    { name: 'password', labelKey: 'auth.register.password', type: 'password', icon: Lock, placeholder: '••••••••' },
    { name: 'university', labelKey: 'auth.register.university', type: 'text', icon: Building2 },
    { name: 'department', labelKey: 'auth.register.department', type: 'text', icon: GraduationCap },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-primary/[0.06] rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-chart-5 to-chart-2 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="text-foreground">Prof</span>
              <span className="text-gradient">AI</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {t('auth.register.title')}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">{t('auth.register.subtitle')}</p>
        </div>

        <div className="card-base p-7">
          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t(field.labelKey)}
                  </label>
                  <div className="relative">
                    <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="input-field pl-10"
                      autoComplete={field.type === 'password' ? 'new-password' : undefined}
                    />
                  </div>
                </div>
              );
            })}

            <button
              type="submit"
              disabled={loading}
              className={cn('btn-primary w-full py-3 mt-2', loading && 'opacity-50 pointer-events-none')}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('auth.register.loading')}
                </>
              ) : (
                t('auth.register.submit')
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:opacity-80">
            {t('auth.register.signInLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
