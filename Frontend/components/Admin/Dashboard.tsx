'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout    from './AdminLayout';
import StatsCards     from './components/StatsCards';
import RecentActivity from './components/RecentActivity';
import UsersTable     from './components/UsersTable';
import PostsTable     from './components/PostsTable';
import ContactsTable  from './components/ContactsTable';
import ChartsSection  from './components/ChartsSection';
import NewsletterTable from './components/NewsletterTable';
import {
  RefreshCw, Download, Mail,
  BarChart3, Users as UsersIcon, FileText,
  MessageSquare, TrendingUp, Settings,
} from 'lucide-react';

const API = 'http://localhost:8089/visioad/backend/api';

interface DashboardStats {
  totalUsers: number; totalPosts: number; totalContacts: number;
  totalComments: number; newsletterSubscribers: number;
  monthlyGrowth: number; todaySessions: number;
}

const DEMO_STATS: DashboardStats = {
  totalUsers: 2, totalPosts: 8, totalContacts: 16,
  totalComments: 0, newsletterSubscribers: 6, monthlyGrowth: 12.5, todaySessions: 45,
};

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',    icon: BarChart3     },
  { id: 'newsletter', label: 'Newsletter',   icon: Mail          },
  { id: 'users',      label: 'Utilisateurs', icon: UsersIcon     },
  { id: 'posts',      label: 'Articles',     icon: FileText      },
  { id: 'contacts',   label: 'Messages',     icon: MessageSquare },
  { id: 'analytics',  label: 'Analytics',    icon: TrendingUp    },
  { id: 'settings',   label: 'Paramètres',   icon: Settings      },
];

function AdminDashboardInner() {
  const [stats,          setStats]          = useState<DashboardStats>(DEMO_STATS);
  const [breakdown,      setBreakdown]      = useState<any>(null);
  const [chartsData,     setChartsData]     = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [isDemoMode,     setIsDemoMode]     = useState(false);
  const [lastUpdate,     setLastUpdate]     = useState('');
  const [activeTab,      setActiveTab]      = useState('dashboard');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) { loadDemoData(); return; }
    try {
      const [sRes, aRes, cRes] = await Promise.all([
        fetch(`${API}/dashboard.php?action=stats`,  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/dashboard.php?action=recent`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/dashboard.php?action=charts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [sData, aData, cData] = await Promise.all([sRes.json(), aRes.json(), cRes.json()]);
      if (sData.success) { setStats(sData.stats); setBreakdown(sData.breakdown); setIsDemoMode(false); }
      if (aData.success) setRecentActivity(aData.activities || []);
      if (cData.success) setChartsData(cData.charts);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch { loadDemoData(); }
    finally   { setLoading(false); }
  };

  const loadDemoData = () => {
    setIsDemoMode(true);
    setStats(DEMO_STATS);
    setBreakdown({ usersByRole: { admin:1, client:1 }, postsByCategory:[{category:'Marketing',count:3}], contactsByStatus:{new:12,read:4} });
    setRecentActivity([
      { id:1, user:'Admin',             type:'Connexion',   description:"Admin s'est connecté",   time:'5 min', icon:'login', color:'blue'   },
      { id:2, user:'client@visioad.com',type:'Inscription', description:'Nouveau client inscrit', time:'2h',    icon:'user',  color:'green'  },
      { id:3, user:'Visiteur',          type:'Contact',     description:'Nouveau message contact',time:'4h',    icon:'mail',  color:'purple' },
    ]);
    setChartsData({ usersByMonth:[{month:'2026-01',count:2}], popularPosts:[{title:'Guide marketing',views:250}], trafficByDevice:[{device:'Desktop',count:65}] });
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ stats, breakdown, recentActivity }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `visioad-${new Date().toISOString().split('T')[0]}.json` });
    a.click(); URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':  return <div className="space-y-6"><StatsCards stats={stats} breakdown={breakdown} isDemoMode={isDemoMode}/><ChartsSection chartsData={chartsData} isDemoMode={isDemoMode}/><RecentActivity activities={recentActivity} isDemoMode={isDemoMode}/></div>;
      case 'newsletter': return <NewsletterTable/>;
      case 'users':      return <UsersTable/>;
      case 'posts':      return <PostsTable/>;
      case 'contacts':   return <ContactsTable/>;
      case 'analytics':  return <div className="bg-white rounded-xl p-8 text-center border border-gray-100"><TrendingUp className="w-12 h-12 mx-auto text-gray-200 mb-4"/><p className="text-gray-500">Allez sur <a href="/admin/analytics" className="text-[#d12127] underline">/admin/analytics</a></p></div>;
      case 'settings':   return <div className="bg-white rounded-xl p-8 text-center border border-gray-100"><Settings className="w-12 h-12 mx-auto text-gray-200 mb-4"/><p className="text-gray-500">Module paramètres en cours de développement.</p></div>;
      default: return null;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor:'#d12127' }}/>
        <p className="text-gray-500 text-sm">Chargement…</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-4">

        {/* ── Ligne unique : Tabs  +  Actualiser/Exporter à droite ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">

          {/* Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#d12127] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0"/> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={loadDashboardData} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <RefreshCw className="w-4 h-4"/> Actualiser
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Download className="w-4 h-4"/> Exporter
            </button>
          </div>
        </div>

        {isDemoMode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
            ⚠ Mode démo — XAMPP doit être démarré sur le port 8089.
          </div>
        )}

        {lastUpdate && <p className="text-xs text-gray-400">Dernière mise à jour : {lastUpdate}</p>}

        {/* Contenu avec animation */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.15 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin"/></div>}>
      <AdminDashboardInner/>
    </Suspense>
  );
}