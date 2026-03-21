'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, FileText, Home, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps { isOpen: boolean; onToggle: () => void; }

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    router.push('/login');
  };

  const raw      = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const userInfo = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
  const username = userInfo?.username || 'Admin';
  const email    = userInfo?.email    || '';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle}/>
      )}

      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50
        shadow-lg transition-all duration-300
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        lg:translate-x-0 lg:static lg:h-screen lg:w-64
      `}>
        <div className="h-full flex flex-col">

          {/* Logo */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#d12127] rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="text-white" size={16}/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-none">VisioAD</p>
                <p className="text-xs text-gray-400">Administration</p>
              </div>
            </Link>
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden flex-shrink-0">
              <ChevronLeft size={18}/>
            </button>
          </div>

          {/* Site public seulement */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Site public
            </p>
            <Link href="/" target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
              <Globe size={18} className="text-gray-400"/> Voir le site
            </Link>
            <Link href="/blog" target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
              <FileText size={18} className="text-gray-400"/> Voir le blog
            </Link>
          </nav>

          {/* Utilisateur + Déconnexion */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#d12127] font-bold text-sm">{username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
                {email && <p className="text-xs text-gray-400 truncate">{email}</p>}
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-[#d12127] rounded-xl hover:bg-red-100 transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4"/> Déconnexion
            </button>
          </div>

        </div>
      </aside>

      {!isOpen && (
        <button onClick={onToggle}
          className="fixed top-4 left-4 z-40 p-2 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 lg:hidden">
          <ChevronRight size={18}/>
        </button>
      )}
    </>
  );
};

export default Sidebar;