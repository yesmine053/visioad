'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header  from './components/Header';

interface AdminLayoutProps { children: React.ReactNode; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen,   setIsSidebarOpen]   = useState(true);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); return; }
        const res  = await fetch('http://localhost:8089/visioad/backend/api/auth.php?action=check', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success || data.user?.role !== 'admin') {
          localStorage.removeItem('access_token');
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    };
    checkAuth();
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#d12127' }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar — flex-shrink-0, largeur 256px ou 0 */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(o => !o)} />

      {/* Zone droite — prend tout l'espace restant */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header avec hamburger ☰ */}
        <Header onMenuClick={() => setIsSidebarOpen(o => !o)} />

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t bg-white py-3 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-1">
            <p>© {new Date().getFullYear()} VisioAD. Tous droits réservés.</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">v1.0.0</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default AdminLayout;