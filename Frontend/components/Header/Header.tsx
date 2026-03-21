'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Shield } from 'lucide-react';

interface UserData {
  name?: string;
  email?: string;
  role?: string;
}

const Header = () => {
  const [isMenuOpen,   setIsMenuOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [user,         setUser]         = useState<UserData | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin';

  const getUserInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return '?';
    const parts = nameOrEmail.split(/[\s@]/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  };

  const checkUserStatus = useCallback(() => {
    try {
      const stored = localStorage.getItem('user');
      const token  = localStorage.getItem('access_token');
      if (stored && token) setUser(JSON.parse(stored));
      else setUser(null);
    } catch { setUser(null); }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 30000);
    const handleDocumentClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.user-menu')) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      clearInterval(interval);
    };
  }, [checkUserStatus]);

  useEffect(() => { checkUserStatus(); }, [pathname, checkUserStatus]);

  const navItems = [
    { label: 'Accueil',     href: '#hero'       },
    { label: 'Services',    href: '#Services'   },
    { label: 'À propos',    href: '#a-propos'   },
    { label: 'Témoignages', href: '#temoignages'},
    { label: 'FAQ',         href: '#FAQ'        },
    { label: 'Contact',     href: '#Contact'    },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setUserMenuOpen(false);
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  const showAvatar = !!user && scrolled;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center">
              <div className="relative w-44 h-12">
                <Image src="/images/logo.png" alt="VisioAD" fill className="object-contain" priority />
              </div>
            </Link>
          </motion.div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div key={item.href} initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <a href={item.href} onClick={(e) => scrollToSection(e, item.href)}
                  className="text-gray-800 hover:text-primary font-medium transition-colors relative group">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </a>
              </motion.div>
            ))}
          </nav>

          {/* Avatar desktop */}
          <div className="hidden lg:block w-44 flex justify-end">
            <AnimatePresence>
              {showAvatar && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}
                  className="relative user-menu flex justify-end"
                >
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {getUserInitials(user?.name || user?.email || '')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0] || 'Utilisateur'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="font-semibold text-gray-900">{user?.name || 'Utilisateur'}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
                            <span className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isAdmin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {isAdmin ? 'Administrateur' : 'Visiteur'}
                            </span>
                          </div>
                          {isAdmin && (
                            <div className="py-1">
                              <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span className="text-red-600 font-medium text-sm">Tableau de bord Admin</span>
                              </Link>
                            </div>
                          )}
                          <div className="border-t border-gray-100 pt-1">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 w-full transition-colors text-sm">
                              <LogOut className="w-4 h-4" /> Déconnexion
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Burger mobile */}
          <motion.button className="lg:hidden text-gray-700 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu" whileTap={{ scale: 0.9 }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </motion.button>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="lg:hidden overflow-hidden">
              <div className="py-4 border-t border-gray-200 mt-2">
                {user && (
                  <div className="px-4 py-3 mb-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {getUserInitials(user.name || user.email || '')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name?.split(' ')[0] || 'Utilisateur'}</div>
                      <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isAdmin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {isAdmin ? 'Administrateur' : 'Visiteur'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col space-y-1">
                  {navItems.map((item, index) => (
                    <motion.a key={item.href} href={item.href}
                      onClick={(e) => scrollToSection(e, item.href)}
                      className="block py-2 px-4 rounded-lg text-gray-800 hover:text-primary font-medium hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}>
                      {item.label}
                    </motion.a>
                  ))}
                  {user && (
                    <div className="pt-4 border-t border-gray-200 space-y-1 mt-2">
                      {isAdmin && (
                        <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 text-red-600 font-medium py-2 px-4 rounded-lg hover:bg-red-50 transition-colors">
                          <Shield className="w-5 h-5" /> Tableau de bord Admin
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 text-red-600 font-medium py-2 px-4 rounded-lg hover:bg-red-50 transition-colors w-full">
                        <LogOut className="w-5 h-5" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;