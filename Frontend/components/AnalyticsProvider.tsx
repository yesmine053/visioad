// components/AnalyticsProvider.tsx
// Ajoutez ce composant dans app/layout.tsx pour tracker toutes les pages publiques

'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}