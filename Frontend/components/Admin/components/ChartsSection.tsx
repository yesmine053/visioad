'use client';

import { TrendingUp, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartsSectionProps { chartsData: any; isDemoMode: boolean; }

const DEMO_MONTHS = [
  { month:'2026-01', count:2 }, { month:'2026-02', count:1 }, { month:'2026-03', count:1 },
];
const DEMO_POSTS  = [
  { title:'Les 10 tendances marketing 2025', views:312 },
  { title:'SEO 2025 : Guide complet',        views:287 },
  { title:'IA générative en marketing',      views:265 },
  { title:'Développement web : Next.js 15',  views:198 },
  { title:'Audit SEO complet 2025',          views:119 },
];
const DEMO_TRAFFIC = [
  { device:'Desktop', count:65 },
  { device:'Mobile',  count:30 },
  { device:'Tablette',count:5  },
];

export default function ChartsSection({ chartsData, isDemoMode }: ChartsSectionProps) {
  const months       = chartsData?.usersByMonth   ?? DEMO_MONTHS;
  const posts        = chartsData?.popularPosts   ?? DEMO_POSTS;
  const traffic      = chartsData?.trafficByDevice ?? DEMO_TRAFFIC;
  const maxMonth     = Math.max(...months.map((m:any) => m.count), 1);
  const totalViews   = posts.reduce((s:number, p:any) => s + (p.views??0), 0);
  const totalTraffic = traffic.reduce((s:number, d:any) => s + (d.count??0), 0);

  const trafficColors = ['#d12127','#10b981','#f59e0b'];
  const C = 2 * Math.PI * 40;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Inscriptions par mois */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Inscriptions par mois</h3>
            <p className="text-xs text-gray-400 mt-0.5">Nouveaux utilisateurs</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg"><TrendingUp className="w-5 h-5 text-[#d12127]"/></div>
        </div>
        <div className="space-y-3">
          {months.map((item:any, i:number) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">{item.month}</span>
                <span className="text-gray-400">{item.count} utilisateurs</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#d12127] rounded-full transition-all duration-700"
                  style={{ width: `${(item.count/maxMonth)*100}%` }}/>
              </div>
            </div>
          ))}
        </div>
        {isDemoMode && <p className="mt-4 text-xs text-amber-500">⚠ Données de démo</p>}
      </motion.div>

      {/* Articles populaires */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Articles les plus vus</h3>
            <p className="text-xs text-gray-400 mt-0.5">Top 5 populaires</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg"><Eye className="w-5 h-5 text-green-600"/></div>
        </div>
        <div className="space-y-3">
          {posts.map((post:any, i:number) => {
            const pct = totalViews > 0 ? (post.views/totalViews)*100 : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width:`${pct}%` }}/>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{post.views}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {isDemoMode && <p className="mt-4 text-xs text-amber-500">⚠ Données de démo</p>}
      </motion.div>

      {/* Trafic par appareil */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Trafic par appareil</h3>
            <p className="text-xs text-gray-400 mt-0.5">Répartition des visites</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-5 h-5 text-purple-600"/></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {traffic.map((device:any, i:number) => {
            const pct   = totalTraffic > 0 ? (device.count/totalTraffic)*100 : 0;
            const color = trafficColors[i] ?? '#888';
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="relative w-28 h-28 mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={`${(pct/100)*C} ${C}`}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{pct.toFixed(0)}%</span>
                    <span className="text-xs text-gray-400">{device.count}</span>
                  </div>
                </div>
                <p className="font-semibold text-sm text-gray-800">{device.device}</p>
                <p className="text-xs text-gray-400">visites</p>
              </div>
            );
          })}
        </div>
        {isDemoMode && <p className="mt-4 text-center text-xs text-amber-500">⚠ Données de démo</p>}
      </motion.div>
    </div>
  );
}