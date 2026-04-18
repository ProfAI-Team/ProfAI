import api from './api';
import type { PushConfig, PushDevice } from '../types/multimodal';

export interface RegisterPushDevicePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}

export const pushService = {
  async getConfig(): Promise<PushConfig> {
    const res = await api.get<PushConfig>('/push/config');
    return res.data;
  },
  async register(payload: RegisterPushDevicePayload): Promise<void> {
    await api.post('/push/devices', payload);
  },
  async listDevices(): Promise<{ devices: PushDevice[] }> {
    const res = await api.get<{ devices: PushDevice[] }>('/push/devices');
    return res.data;
  },
  async deleteDevice(id: string): Promise<void> {
    await api.delete(`/push/devices/${id}`);
  },
  async setOptIn(optIn: boolean): Promise<void> {
    await api.patch('/push/opt-in', { optIn });
  },
  async test(): Promise<{ attempted: number; delivered: number; pruned: number }> {
    const res = await api.post<{
      attempted: number;
      delivered: number;
      pruned: number;
    }>('/push/test');
    return res.data;
  },
};
