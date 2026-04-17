import { Suspense, type ReactNode } from 'react';

interface RouteSuspenseProps {
  children: ReactNode;
}

const RouteFallback = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
    <div className="h-8 w-64 rounded-lg bg-muted" />
    <div className="h-4 w-96 max-w-full rounded bg-muted/70" />
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-40 rounded-2xl bg-muted/50 border border-border" />
      <div className="h-40 rounded-2xl bg-muted/50 border border-border" />
    </div>
    <div className="h-64 rounded-2xl bg-muted/40 border border-border" />
  </div>
);

export const RouteSuspense = ({ children }: RouteSuspenseProps) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

export default RouteSuspense;
