'use client';

import { Users, FileText, Mail, Eye, TrendingUp, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface StatsCardsProps { stats: any; breakdown: any; isDemoMode: boolean; }

export default function StatsCards({ stats, breakdown }: StatsCardsProps) {
  const router = useRouter();

  const cards = [
    { title: 'Utilisateurs', value: stats?.totalUsers ?? 0, icon: Users, color: 'red',
      sub: `+${stats?.monthlyGrowth ?? 0}% ce mois`,
      detail: breakdown?.usersByRole ? Object.entries(breakdown.usersByRole).map(([r,c]) => `${r}: ${c}`).join(' · ') : '',
      link: '/admin/dashboard' },
    { title: 'Articles', value: stats?.totalPosts ?? 0, icon: FileText, color: 'green',
      detail: breakdown?.postsByCategory ? breakdown.postsByCategory.slice(0,2).map((c:any) => `${c.category}: ${c.count}`).join(' · ') : '',
      link: '/admin/dashboard' },
    { title: 'Messages', value: stats?.totalContacts ?? 0, icon: Mail, color: 'purple',
      sub: `${stats?.newContacts ?? 0} non lus`,
      detail: breakdown?.contactsByStatus ? Object.entries(breakdown.contactsByStatus).map(([s,c]) => `${s}: ${c}`).join(' · ') : '',
      link: '/admin/dashboard' },
    { title: 'Newsletter', value: stats?.newsletterSubscribers ?? 0, icon: Eye, color: 'pink',
      sub: 'Abonnés actifs', link: '/admin/dashboard' },
    { title: 'Sessions', value: stats?.todaySessions ?? 0, icon: TrendingUp, color: 'orange',
      sub: "Aujourd'hui", link: '/admin/analytics' },
    { title: 'Commentaires', value: stats?.totalComments ?? 0, icon: Bell, color: 'gray',
      sub: 'Total', link: '/admin/dashboard' },
  ];

  const iconBg: Record<string,string> = {
    red: 'bg-red-50 text-[#d12127]', green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600', pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600', gray: 'bg-gray-100 text-gray-500',
  };
  const textColor: Record<string,string> = {
    red: 'text-[#d12127]', green: 'text-green-600', purple: 'text-purple-600',
    pink: 'text-pink-600', orange: 'text-orange-600', gray: 'text-gray-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.title}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(card.link)}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                {card.sub    && <p className="text-sm text-gray-500">{card.sub}</p>}
                {card.detail && <p className="text-xs text-gray-400 mt-1 truncate">{card.detail}</p>}
              </div>
              <div className={`p-3 rounded-xl ${iconBg[card.color]} ml-4 flex-shrink-0`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-400">Détails</span>
              <span className={`font-medium ${textColor[card.color]}`}>Voir →</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}