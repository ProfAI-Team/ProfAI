import { useEffect, useState } from 'react';

import { pushService } from '../../services/pushService';

// Phase 6 (6.17 / 6.23). Encapsulates the "ask browser for permission
// + subscribe via VAPID + POST to /api/push/devices" dance so any
// page can drop it in. Shows three states: "disabled by browser",
// "ready to enable", and "active".

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = typeof window !== 'undefined' ? window.atob(base64) : '';
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export interface PushPermissionCardProps {
  onStatusChange?: (active: boolean) => void;
}

export function PushPermissionCard({ onStatusChange }: PushPermissionCardProps) {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'prompt' | 'active' | 'blocked' | 'not-configured'>(
    'loading'
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    (async () => {
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        setStatus('unsupported');
        return;
      }
      try {
        const config = await pushService.getConfig();
        if (!config.configured || !config.vapidPublicKey) {
          setStatus('not-configured');
          return;
        }
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        const sub = await reg?.pushManager.getSubscription().catch(() => null);
        if (sub) {
          setStatus('active');
          return;
        }
        setStatus(Notification.permission === 'denied' ? 'blocked' : 'prompt');
      } catch {
        setStatus('unsupported');
      }
    })();
  }, []);

  useEffect(() => {
    onStatusChange?.(status === 'active');
  }, [status, onStatusChange]);

  async function enable() {
    setPending(true);
    try {
      const config = await pushService.getConfig();
      if (!config.configured || !config.vapidPublicKey) {
        setStatus('not-configured');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'prompt');
        return;
      }
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;
      const appServerKey = urlBase64ToUint8Array(config.vapidPublicKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer.slice(
          appServerKey.byteOffset,
          appServerKey.byteOffset + appServerKey.byteLength
        ) as ArrayBuffer,
      });
      const json = sub.toJSON();
      await pushService.register({
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
        },
        userAgent: navigator.userAgent,
      });
      await pushService.setOptIn(true);
      setStatus('active');
    } catch {
      setStatus('blocked');
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setPending(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await pushService.setOptIn(false);
      setStatus('prompt');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="font-display text-base font-semibold text-text-base">
        Günlük tekrar bildirimleri
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        Açarsan sadece sabah 9'da günün tekrar listesi için bildirim
        gönderiyoruz. İstediğin zaman kapatabilirsin.
      </p>
      <div className="mt-3 text-sm">
        {status === 'loading' && (
          <p className="text-text-muted">Durum kontrol ediliyor…</p>
        )}
        {status === 'unsupported' && (
          <p className="text-text-muted">
            Tarayıcın push bildirimlerini desteklemiyor. Chrome, Firefox
            veya Safari 17+ önerilir.
          </p>
        )}
        {status === 'not-configured' && (
          <p className="text-text-muted">
            Bildirim altyapısı şu an yapılandırılmamış. Lütfen daha sonra
            tekrar dene.
          </p>
        )}
        {status === 'blocked' && (
          <p className="text-text-muted">
            Tarayıcı izni engellendi. Adres çubuğundaki kilit ikonundan
            izin ver ve bu sayfayı yenile.
          </p>
        )}
        {status === 'prompt' && (
          <button
            type="button"
            onClick={enable}
            disabled={pending}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? 'Açılıyor…' : 'Bildirimleri aç'}
          </button>
        )}
        {status === 'active' && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Aktif
            </span>
            <button
              type="button"
              onClick={disable}
              disabled={pending}
              className="text-text-muted underline-offset-2 hover:underline"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PushPermissionCard;
