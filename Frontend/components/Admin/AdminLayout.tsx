'use client';

import React, { useState, useEffect } from 'react';

import Sidebar from './components/Sidebar';
import Header  from './components/Header';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState<boolean|null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);


  useEffect(() => {
    const token   = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) { window.location.href = '/login'; return; }
    try {
      const user = JSON.parse(userRaw);
      if (user.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setAuthenticated(true);
    } catch { window.location.href = '/login'; }
  }, []); // ← exécuté une seule fois au montage

  if (authenticated === null) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fixe à gauche */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      {/* Contenu principal — pousse à droite de la sidebar */}
      <div className="flex-1 min-w-0 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="pt-16 min-h-screen">
          <div className="p-4 md:p-6">{children}</div>
        </main>
        <footer className="border-t bg-white py-3 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} VisioAD — Tous droits réservés.</p>
            <div className="flex items-center gap-3 mt-1 md:mt-0">
              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">v1.0.0</span>
              <span>Panneau d'administration</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;