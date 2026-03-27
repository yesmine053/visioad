'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, ChevronDown, LogOut, User, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode,     setDarkMode]     = useState(false);
  const [username,     setUsername]     = useState('Admin');
  const [role,         setRole]         = useState('admin');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUsername(u.username || u.name || 'Admin');
        setRole(u.role || 'admin');
      }
    } catch { /* ignore */ }

    // Fermer dropdown si clic extérieur
    const handleClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-30">

      {/* ── Gauche : bouton hamburger ── */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        title="Ouvrir/Fermer le menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Droite : actions ── */}
      <div className="flex items-center gap-2">

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          title="Thème"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d12127] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-[#d12127] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{username}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => { setDropdownOpen(false); router.push('/admin/profile'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={15} className="text-gray-400" /> Mon profil
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#d12127] hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} /> Déconnexion
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;