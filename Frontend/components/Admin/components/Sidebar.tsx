'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, FileText, Home, LogOut, PanelLeftClose } from 'lucide-react';

interface SidebarProps {
  isOpen:   boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const router = useRouter();
  const [username, setUsername] = useState('Admin');
  const [email,    setEmail]    = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUsername(u.username || u.name || 'Admin');
        setEmail(u.email || '');
      }
    } catch { }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    router.push('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`
        flex-shrink-0 bg-white border-r border-gray-100 z-50 flex flex-col
        transition-all duration-300 ease-in-out
        fixed top-0 left-0 h-full shadow-xl
        lg:relative lg:shadow-none lg:h-auto lg:translate-x-0
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-0 lg:overflow-hidden lg:border-0'}
      `}>
        <div className={`flex flex-col h-full w-64 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

          <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#d12127] rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="text-white" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-none">VisioAD</p>
                <p className="text-xs text-gray-400">Administration</p>
              </div>
            </Link>
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden">
              <PanelLeftClose size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Site public</p>
            <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
              <Globe size={18} className="text-gray-400 flex-shrink-0" /> Voir le site
            </Link>
            <Link href="/blog" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
              <FileText size={18} className="text-gray-400 flex-shrink-0" /> Voir le blog
            </Link>
          </nav>

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
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-[#d12127] rounded-xl hover:bg-red-100 transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;