'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/Admin/Dashboard';

export default function AdminDashboardPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token   = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      window.location.href = '/login?redirect=/admin/dashboard';
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      if (user.role !== 'admin') {
        window.location.href = '/';        
        return;
      }
      setReady(true);
    } catch {
      window.location.href = '/login';
    }
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 mx-auto mb-4"
            style={{ borderTopColor: '#d12127' }}
          />
          <p className="text-gray-500 text-sm">Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}