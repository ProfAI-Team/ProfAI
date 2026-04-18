import axios, { AxiosError } from 'axios';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    issues?: unknown;
  };
}

export type ApiAxiosError = AxiosError<ApiErrorBody>;

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: ApiAxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Avoid redirect loops during auth flows — the login/register pages
      // surface the error themselves.
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const body = (error as ApiAxiosError).response?.data;
    return body?.error?.code ?? null;
  }
  return null;
}

export function getApiErrorMessage(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const body = (error as ApiAxiosError).response?.data;
    return body?.error?.message ?? null;
  }
  return null;
}

export default api;
