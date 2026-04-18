import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { cn } from '../../lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Phase 7 task 7.30 — account deletion dialog.
 *
 * KVKK give-you-back-your-data path surfaced in the UI. Double-gate the
 * action:
 *   1. Confirm banner explains what's about to happen.
 *   2. Password re-entry (matches the server side check in 7.4).
 *   3. 10s cool-down on the confirm button — avoids an accidental
 *      tap destroying a user's work. Same idea GitHub uses on repo
 *      delete.
 */
const COUNTDOWN_SEC = 10;

const DeleteAccountDialog: React.FC<Props> = ({ open, onClose }) => {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCountdown(COUNTDOWN_SEC);
    setPassword('');
    setAcknowledged(false);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || !acknowledged) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [open, countdown, acknowledged]);

  if (!open) return null;

  const canSubmit =
    acknowledged && password.length >= 1 && countdown <= 0 && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.delete('/users/me/data', {
        data: { password },
      });
      // Successful purge — blow the session, navigate to /
      logout();
      window.location.href = '/';
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ?? 'Silme başarısız';
      setError(message);
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Kapat"
          className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-semibold">
                Hesabımı ve tüm verilerimi sil
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Bu işlem geri alınamaz. Hesabına bağlı her şey — voice
                transkriptleri, OCR görselleri, ders kayıtları, notlar,
                mock sınav sonuçları, marketplace ürünleri, ödemeler ve
                tutor oturumları — kalıcı olarak silinir.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={acknowledged}
              disabled={submitting}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>
              Tüm verilerimin silineceğini anlıyorum ve kabul ediyorum.
            </span>
          </label>

          {acknowledged && (
            <div className="space-y-2">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">
                  Parolanı tekrar gir
                </span>
                <input
                  type="password"
                  className="input mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={submitting}
                  autoFocus
                />
              </label>
              {countdown > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3" />
                  Onay butonu {countdown} saniye sonra aktifleşecek.
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary text-sm"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'text-sm px-4 py-2 rounded-lg font-medium transition-colors',
                canSubmit
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-500/40 text-white/80 cursor-not-allowed'
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1.5" />
                  Siliniyor…
                </>
              ) : (
                'Hesabımı sil'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteAccountDialog;
