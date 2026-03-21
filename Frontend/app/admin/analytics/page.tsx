'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, TrendingDown, Eye, RefreshCw, Calendar } from 'lucide-react';

import { analyticsApi } from '@/lib/apiClient';

interface DayData   { date: string; visitors: number; sessions: number; }
interface MonthData { month: string; visitors: number; sessions: number; }

// ✅ Données démo FIXES — pas de Math.random() pour éviter l'erreur d'hydratation
const DEMO_DAILY: DayData[] = [
  { date: '11 fév', visitors: 82,  sessions: 110 },
  { date: '12 fév', visitors: 95,  sessions: 128 },
  { date: '13 fév', visitors: 74,  sessions: 100 },
  { date: '14 fév', visitors: 110, sessions: 148 },
  { date: '15 fév', visitors: 130, sessions: 175 },
  { date: '16 fév', visitors: 88,  sessions: 119 },
  { date: '17 fév', visitors: 102, sessions: 138 },
  { date: '18 fév', visitors: 119, sessions: 161 },
  { date: '19 fév', visitors: 97,  sessions: 131 },
  { date: '20 fév', visitors: 145, sessions: 196 },
  { date: '21 fév', visitors: 133, sessions: 179 },
  { date: '22 fév', visitors: 78,  sessions: 105 },
  { date: '23 fév', visitors: 91,  sessions: 123 },
  { date: '24 fév', visitors: 124, sessions: 167 },
  { date: '25 fév', visitors: 108, sessions: 146 },
  { date: '26 fév', visitors: 139, sessions: 188 },
  { date: '27 fév', visitors: 155, sessions: 209 },
  { date: '28 fév', visitors: 86,  sessions: 116 },
  { date: '01 mar', visitors: 99,  sessions: 134 },
  { date: '02 mar', visitors: 117, sessions: 158 },
  { date: '03 mar', visitors: 142, sessions: 192 },
  { date: '04 mar', visitors: 128, sessions: 173 },
  { date: '05 mar', visitors: 93,  sessions: 126 },
  { date: '06 mar', visitors: 107, sessions: 145 },
  { date: '07 mar', visitors: 136, sessions: 183 },
  { date: '08 mar', visitors: 151, sessions: 204 },
  { date: '09 mar', visitors: 118, sessions: 159 },
  { date: '10 mar', visitors: 143, sessions: 193 },
  { date: '11 mar', visitors: 162, sessions: 219 },
  { date: '12 mar', visitors: 175, sessions: 236 },
];

const DEMO_MONTHLY: MonthData[] = [
  { month: 'Jan', visitors: 1250, sessions: 1688 },
  { month: 'Fév', visitors: 1480, sessions: 1998 },
  { month: 'Mar', visitors: 1320, sessions: 1782 },
  { month: 'Avr', visitors: 1650, sessions: 2228 },
  { month: 'Mai', visitors: 1890, sessions: 2552 },
  { month: 'Jun', visitors: 2100, sessions: 2835 },
  { month: 'Jul', visitors: 1750, sessions: 2363 },
  { month: 'Aoû', visitors: 1420, sessions: 1917 },
  { month: 'Sep', visitors: 1680, sessions: 2268 },
  { month: 'Oct', visitors: 1950, sessions: 2633 },
  { month: 'Nov', visitors: 2250, sessions: 3038 },
  { month: 'Déc', visitors: 2480, sessions: 3348 },
];

const PERIOD_LABELS: Record<string, string> = {
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
  '12m': '12 derniers mois',
};

// ── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name} :</span>
          <span className="text-white font-semibold">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, delta, icon: Icon, color, delay }: {
  label: string; value: number; delta: number; icon: any; color: string; delay: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${delta >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
        {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(delta)}%
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    <p className="text-sm text-gray-400 mt-1">{label}</p>
  </motion.div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [period, setPeriod]   = useState<'30d' | '90d' | '12m'>('30d');
  const [daily, setDaily]     = useState<DayData[]>(DEMO_DAILY);
  const [monthly, setMonthly] = useState<MonthData[]>(DEMO_MONTHLY);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo]   = useState(true);
  const [mounted, setMounted] = useState(false);

  // ✅ Évite l'hydratation mismatch — on attend que le composant soit monté
  useEffect(() => { setMounted(true); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getData(period as '30d' | '90d' | '12m');
      if (data.success && data.daily?.length > 0) {
        setDaily(data.daily);
        setMonthly(data.monthly || DEMO_MONTHLY);
        setIsDemo(false);
      } else {
        setDaily(DEMO_DAILY);
        setMonthly(DEMO_MONTHLY);
        setIsDemo(true);
      }
    } catch {
      setDaily(DEMO_DAILY);
      setMonthly(DEMO_MONTHLY);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { if (mounted) load(); }, [mounted, load]);

  // Stats calculées
  const totalVisitors = daily.reduce((s, d) => s + d.visitors, 0);
  const totalSessions = daily.reduce((s, d) => s + d.sessions, 0);
  const avgPerDay     = Math.round(totalVisitors / (daily.length || 1));
  const peak          = Math.max(...daily.map(d => d.visitors), 0);
  const lastWeek      = daily.slice(-7).reduce((s, d)    => s + d.visitors, 0);
  const prevWeek      = daily.slice(-14, -7).reduce((s, d) => s + d.visitors, 0);
  const weekDelta     = prevWeek > 0 ? Math.round(((lastWeek - prevWeek) / prevWeek) * 100) : 0;

  // ✅ Afficher un loader pendant le SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visiteurs & sessions — {PERIOD_LABELS[period]}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDemo && (
            <span className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium rounded-xl">
              Mode démo
            </span>
          )}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['30d', '90d', '12m'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${period === p ? 'bg-[#d12127] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                {p === '30d' ? '30j' : p === '90d' ? '90j' : '12m'}
              </button>
            ))}
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total visiteurs"     value={totalVisitors} delta={weekDelta}     icon={Users}      color="#d12127" delay={0}    />
        <StatCard label="Total sessions"      value={totalSessions} delta={weekDelta + 2} icon={Eye}        color="#2563eb" delay={0.05} />
        <StatCard label="Moy. visiteurs/jour" value={avgPerDay}     delta={3}             icon={Calendar}   color="#16a34a" delay={0.1}  />
        <StatCard label="Pic journalier"      value={peak}          delta={5}             icon={TrendingUp} color="#d97706" delay={0.15} />
      </div>

      {/* Area Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-900">Visiteurs & Sessions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Évolution quotidienne</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#d12127] inline-block" />Visiteurs</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Sessions</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={daily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#d12127" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#d12127" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
              interval={Math.floor(daily.length / 6)} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="visitors" name="Visiteurs" stroke="#d12127" strokeWidth={2}
              fill="url(#gradV)" dot={false} activeDot={{ r: 4, fill: '#d12127' }} />
            <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#2563eb" strokeWidth={2}
              fill="url(#gradS)" dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Vue mensuelle</h2>
          <p className="text-xs text-gray-400 mb-5">Visiteurs par mois</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="visitors" name="Visiteurs" fill="#d12127" radius={[6, 6, 0, 0]} opacity={0.85} />
              <Bar dataKey="sessions"  name="Sessions"  fill="#fca5a5" radius={[6, 6, 0, 0]} opacity={0.7}  />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Tendance sessions</h2>
          <p className="text-xs text-gray-400 mb-5">Courbe sur la période</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily.filter((_, i) => i % 2 === 0)} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                interval={3} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#2563eb" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="visitors" name="Visiteurs" stroke="#d12127" strokeWidth={2}
                dot={false} strokeDasharray="5 3" activeDot={{ r: 4, fill: '#d12127', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 7 derniers jours */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5">7 derniers jours</h2>
        <div className="grid grid-cols-7 gap-3">
          {daily.slice(-7).map((d, i) => {
            const maxV = Math.max(...daily.slice(-7).map(x => x.visitors), 1);
            const pct  = Math.round((d.visitors / maxV) * 100);
            return (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-400 mb-2">{d.date.split(' ')[0]}</div>
                <div className="relative h-20 bg-gray-50 rounded-xl overflow-hidden flex items-end">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-[#d12127] to-red-400 rounded-xl"
                  />
                </div>
                <div className="text-xs font-semibold text-gray-700 mt-2">{d.visitors}</div>
                <div className="text-xs text-gray-400">vis.</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}