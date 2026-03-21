'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps { onMenuClick: () => void; }

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen,  setNotifsOpen]  = useState(false);
  const [darkMode,    setDarkMode]    = useState(false);
  const [userInfo,    setUserInfo]    = useState({ username: 'Admin', email: 'admin@visioad.com' });

  // ── Charger préférences au montage ───────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) { try { setUserInfo(JSON.parse(raw)); } catch {} }

    const saved = localStorage.getItem('admin_dark_mode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // ── Toggle dark mode ──────────────────────────────────────────────────────
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('admin_dark_mode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    document.documentElement.classList.remove('dark');
    router.push('/login');
  };

  const notifications = [
    { id: 1, text: 'Nouveau message de contact', time: '10 min', read: false },
    { id: 2, text: 'Abonné newsletter',           time: '1h',    read: true  },
    { id: 3, text: 'Nouvel utilisateur inscrit',  time: '2h',    read: false },
  ];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 z-30 shadow-sm transition-colors duration-200">
      <div className="px-4 py-3 flex items-center justify-between">

        {/* Burger mobile — seul élément à gauche */}
        <button onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden">
          <Menu size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* Espace vide à gauche sur desktop */}
        <div className="hidden lg:block" />

        {/* Droite */}
        <div className="flex items-center gap-2">

          {/* ── Dark mode ── */}
          <button onClick={toggleDark}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {darkMode
              ? <Sun  size={19} className="text-amber-400" />
              : <Moon size={19} className="text-gray-500 dark:text-gray-400" />}
          </button>

          {/* ── Notifications ── */}
          <div className="relative">
            <button onClick={() => setNotifsOpen(!notifsOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Bell size={19} className="text-gray-500 dark:text-gray-400" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d12127] rounded-full" />}
            </button>

            {notifsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifsOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                    {unread > 0 && <span className="text-xs bg-red-50 text-[#d12127] px-2 py-0.5 rounded-full">{unread} nouvelles</span>}
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => setNotifsOpen(false)}
                      className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-start justify-between gap-2 ${!n.read ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Profile ── */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="w-7 h-7 bg-[#d12127] text-white rounded-full flex items-center justify-center text-xs font-bold">
                {(userInfo.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{userInfo.username}</p>
                <p className="text-xs text-gray-400">admin</p>
              </div>
              <ChevronDown size={14} className="hidden md:block text-gray-400" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{userInfo.username}</p>
                    <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setProfileOpen(false); router.push('/admin/dashboard'); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                      <User size={15} className="text-gray-400" /> Mon profil
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#d12127] flex items-center gap-2 text-sm transition-colors">
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;