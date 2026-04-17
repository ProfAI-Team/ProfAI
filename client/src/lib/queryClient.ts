import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide QueryClient. Kept thin so Phase 4 community mutations can
 * reuse the same defaults without fighting custom cache policies.
 *
 * Rationale for the defaults:
 * - `staleTime: 30s` — routing + nav will refetch often; 30s keeps quick
 *   back-nav cheap without hiding new community data for long.
 * - `retry: 1` — Gemini endpoints can 503; one retry is usually enough
 *   to ride out a transient blip.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
