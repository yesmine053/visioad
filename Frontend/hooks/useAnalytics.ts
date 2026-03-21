// hooks/useAnalytics.ts
// Ajouter dans chaque page : useAnalytics()
// OU mieux : l'ajouter dans app/layout.tsx pour tracker toutes les pages

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const TRACK_URL = 'http://localhost:8089/visioad/backend/api/track.php';

// Génère ou récupère un session_id unique par onglet
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('visioad_sid');
  if (!sid) {
    sid = 'sid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('visioad_sid', sid);
  }
  return sid;
}

export function useAnalytics() {
  const pathname  = usePathname();
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    const track = () => {
      const session_id = getSessionId();
      if (!session_id) return;

      // Ne pas tracker les pages admin
      if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) return;

      navigator.sendBeacon(TRACK_URL, JSON.stringify({
        session_id,
        page:       pathname || '/',
        referrer:   document.referrer || '',
        user_agent: navigator.userAgent,
        time_spent: 0,
      }));
    };

    // Tracker à l'arrivée sur la page
    track();

    // Tracker le temps passé quand on quitte
    const onLeave = () => {
      const session_id = getSessionId();
      if (!session_id || pathname?.startsWith('/admin')) return;
      const time_spent = Math.round((Date.now() - startTime.current) / 1000);
      navigator.sendBeacon(TRACK_URL, JSON.stringify({
        session_id,
        page:       pathname || '/',
        referrer:   document.referrer || '',
        user_agent: navigator.userAgent,
        time_spent,
      }));
    };

    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [pathname]);
}