import api from './api';
import type { CreditBalance, CreditHistory } from '../types/community';

export const creditService = {
  async getBalance(): Promise<CreditBalance> {
    const res = await api.get('/credits/balance');
    return res.data as CreditBalance;
  },

  async getHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<CreditHistory> {
    const res = await api.get('/credits/history', { params });
    return res.data as CreditHistory;
  },
};
