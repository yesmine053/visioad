'use client';

import { User, Mail, FileText, LogIn, MessageSquare } from 'lucide-react';

interface RecentActivityProps { activities: any[]; isDemoMode: boolean; }

const iconMap: Record<string,any> = {
  login: LogIn, mail: Mail, file: FileText, user: User, default: MessageSquare
};
const colorMap: Record<string,string> = {
  blue:   'bg-blue-50   text-blue-600',
  green:  'bg-green-50  text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red:    'bg-red-50    text-[#d12127]',
};
const typeBadge: Record<string,string> = {
  Connexion:   'bg-blue-100   text-blue-700',
  Inscription: 'bg-green-100  text-green-700',
  Contact:     'bg-purple-100 text-purple-700',
  Article:     'bg-amber-100  text-amber-700',
};

export default function RecentActivity({ activities, isDemoMode }: RecentActivityProps) {
  if (!activities || activities.length === 0) return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Activité récente</h2>
      <div className="text-center py-8 text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
        <p className="text-sm">Aucune activité récente</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Activité récente</h2>
      <div className="space-y-3">
        {activities.slice(0, 8).map((activity, i) => {
          const Icon = iconMap[activity.icon] || iconMap.default;
          return (
            <div key={activity.id || i}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[activity.color] || 'bg-gray-100 text-gray-500'}`}>
                <Icon className="w-5 h-5"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm text-gray-900 truncate">{activity.user}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${typeBadge[activity.type] || 'bg-gray-100 text-gray-600'}`}>
                    {activity.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}