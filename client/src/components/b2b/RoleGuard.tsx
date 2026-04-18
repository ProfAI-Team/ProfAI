import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/b2b';

interface Props {
  roles: UserRole[];
  children: React.ReactNode;
}

/**
 * Client-side wrapper that renders its children only when the signed-in
 * user's role is in the allow-list. Mirrors the server RBAC guard so
 * the UI doesn't briefly flash restricted content before the API 403s.
 *
 * `SUPER_ADMIN` always passes. Falls back to an "access denied" panel
 * with a link home — the user learns why the link is blocked instead
 * of hitting a 403 toast after clicking.
 */
export const RoleGuard: React.FC<Props> = ({ roles, children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const allowed =
    user?.role === 'SUPER_ADMIN' ||
    (user?.role ? roles.includes(user.role) : false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground" />
        <h1 className="font-display text-xl font-semibold">Giriş gerekli</h1>
        <p className="text-sm text-muted-foreground">
          Bu sayfayı görüntülemek için hesabına giriş yap.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="btn-primary text-sm"
        >
          Giriş yap
        </button>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground" />
        <h1 className="font-display text-xl font-semibold">
          Bu bölüm senin için değil
        </h1>
        <p className="text-sm text-muted-foreground">
          Farklı bir hesapla giriş yapmak gerekebilir. Sorunu çözemezsen destek ekibine yaz.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary text-sm"
        >
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
