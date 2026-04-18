import api from './api';
import type { Payment, PaymentInitResult } from '../types/b2b';

export const paymentService = {
  async init(payload: {
    kind: 'subscription' | 'marketplace' | 'tutoring';
    amountKurus: number;
    callbackUrl: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentInitResult> {
    const res = await api.post('/payments/init', payload);
    return res.data.data as PaymentInitResult;
  },

  async mine(): Promise<Payment[]> {
    const res = await api.get('/payments/me');
    return (res.data.data ?? []) as Payment[];
  },
};
