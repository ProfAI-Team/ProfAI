import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

import { paymentService } from '../services/paymentService';
import api from '../services/api';
import PaymentBadge from '../components/b2b/PaymentBadge';

/**
 * Phase 7 task 7.26 — /checkout + /checkout/callback.
 *
 * Entry:  /checkout?type=marketplace&refId=<itemId>&amount=<kuruş>
 * Exit:   /checkout/callback?status=success|fail&paymentId=<id>
 */

const CheckoutPage: React.FC = () => {
  const [params] = useSearchParams();
  const kind = params.get('type') as
    | 'subscription'
    | 'marketplace'
    | 'tutoring'
    | null;
  const refId = params.get('refId') ?? undefined;
  const amount = Number(params.get('amount') ?? '0');

  const initMutation = useMutation({
    mutationFn: () =>
      paymentService.init({
        kind: kind ?? 'marketplace',
        amountKurus: amount,
        callbackUrl: `${window.location.origin}/checkout/callback`,
        metadata: refId
          ? kind === 'marketplace'
            ? { marketplaceItemId: refId }
            : kind === 'tutoring'
              ? { tutoringSessionId: refId }
              : { subscriptionPlan: refId }
          : undefined,
      }),
  });

  useEffect(() => {
    if (!kind || amount <= 0) return;
    initMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, amount]);

  if (!kind || amount <= 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-3">
        <h1 className="font-display text-xl font-semibold">
          Ödeme parametreleri eksik
        </h1>
        <p className="text-sm text-muted-foreground">
          Bu sayfaya ilgili ürün sayfasından ulaşman gerek.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="card-base p-6 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-primary mt-1" />
        <div>
          <h1 className="font-display text-xl font-bold">
            Ödeme ekranı
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            iyzico 3D Secure. Kart bilgileri bizde saklanmaz.
          </p>
        </div>
      </header>

      <section className="card-base p-6">
        {initMutation.isPending && (
          <div className="text-center py-6">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-2">
              Ödeme oturumu hazırlanıyor…
            </p>
          </div>
        )}
        {initMutation.isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
            {(initMutation.error as Error).message}
          </div>
        )}
        {initMutation.data && (
          <iframe
            title="iyzico checkout"
            src={initMutation.data.checkoutUrl}
            className="w-full h-[540px] rounded-lg border border-border"
          />
        )}
      </section>

      <p className="text-xs text-muted-foreground text-center">
        Ödeme tamamlanınca otomatik olarak hesabına yönlendirileceksin.
        Faturan e-posta ile gelir.
      </p>
    </div>
  );
};

export const CheckoutCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get('status') ?? 'success';
  const paymentId = params.get('paymentId');

  const [tries, setTries] = useState(0);

  const query = useQuery({
    queryKey: ['payment', 'status', paymentId, tries],
    queryFn: async () => {
      const res = await api.get(`/payments/me`);
      const rows = res.data.data as Array<{
        id: string;
        status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
      }>;
      return rows.find((r) => r.id === paymentId) ?? null;
    },
    enabled: Boolean(paymentId) && status !== 'fail',
    refetchInterval: (q) => (q.state.data?.status === 'succeeded' ? false : 2000),
  });

  useEffect(() => {
    const t = setInterval(() => setTries((x) => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  if (status === 'fail') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-3">
        <XCircle className="w-10 h-10 mx-auto text-red-500" />
        <h1 className="font-display text-xl font-semibold">
          Ödeme tamamlanamadı
        </h1>
        <p className="text-sm text-muted-foreground">
          Paran güvende. Tekrar denemek ister misin?
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Geri dön
        </button>
      </div>
    );
  }

  const paymentStatus = query.data?.status ?? 'pending';

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-3">
      {paymentStatus === 'succeeded' ? (
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
      ) : (
        <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
      )}
      <h1 className="font-display text-xl font-semibold">
        {paymentStatus === 'succeeded'
          ? 'Ödeme tamamlandı'
          : 'Doğrulanıyor…'}
      </h1>
      <PaymentBadge status={paymentStatus} />
      {paymentStatus === 'succeeded' && (
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn-primary mt-4"
        >
          Dashboard'a git
        </button>
      )}
    </div>
  );
};

export default CheckoutPage;
