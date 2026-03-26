import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    university: string;
    department: string;
  }): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  logout(): void {
    localStorage.removeItem('token');
  },
};
