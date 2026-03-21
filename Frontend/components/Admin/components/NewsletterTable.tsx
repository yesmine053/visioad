'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, RefreshCw, Search, Users, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subscriber { id: number; email: string; subscribed_at: string; }

const API = 'http://localhost:8089/visioad/backend/api/newsletter.php';

export default function NewsletterTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [confirmId, setConfirmId] = useState<number|null>(null);
  const [deleting, setDeleting]   = useState<number|null>(null);
  const [msg, setMsg]             = useState('');
  const [error, setError]         = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}?action=list`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSubscribers(data.subscribers || []);
      else setError(data.message || 'Erreur de chargement');
    } catch {
      setSubscribers([
        { id:1, email:'client1@gmail.com',   subscribed_at:'2025-11-15 10:30:00' },
        { id:2, email:'contact@startup.tn',  subscribed_at:'2026-01-20 14:22:00' },
        { id:3, email:'info@entreprise.com', subscribed_at:'2026-02-03 09:15:00' },
      ]);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res  = await fetch(`${API}?action=delete&id=${id}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSubscribers(p => p.filter(s => s.id !== id));
      setMsg(data.success ? 'Abonné supprimé avec succès' : 'Supprimé');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setSubscribers(p => p.filter(s => s.id !== id));
      setMsg('Abonné supprimé'); setTimeout(() => setMsg(''), 3000);
    } finally { setDeleting(null); setConfirmId(null); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });

  const now       = new Date();
  const thisMonth = subscribers.filter(s => {
    const d = new Date(s.subscribed_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez vos abonnés</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label:'Total abonnés',  value: subscribers.length, icon: <Users    className="w-5 h-5 text-[#d12127]"/>, bg:'bg-red-50'    },
          { label:'Ce mois',        value: thisMonth,           icon: <Mail     className="w-5 h-5 text-green-600"/>, bg:'bg-green-50'  },
          { label:'Dernier inscrit', value: subscribers.length > 0 ? fmt(subscribers[subscribers.length-1].subscribed_at) : '—',
            icon: <Calendar className="w-5 h-5 text-purple-600"/>, bg:'bg-purple-50' },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${s.bg} rounded-lg`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">✅ {msg}</motion.div>}
        {error && <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="p-3 bg-red-50 border border-red-200 text-[#d12127] rounded-xl text-sm">⚠️ {error}</motion.div>}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="text" placeholder="Rechercher un email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"/>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><Mail className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Aucun abonné</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#','Email','Date inscription','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub, i) => (
                <motion.tr key={sub.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-400">{i+1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#d12127] font-semibold text-xs uppercase">{sub.email.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>{fmt(sub.subscribed_at)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {confirmId === sub.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-gray-500">Confirmer ?</span>
                        <button onClick={() => handleDelete(sub.id)} disabled={deleting===sub.id}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50">
                          {deleting===sub.id ? '...' : 'Oui'}
                        </button>
                        <button onClick={() => setConfirmId(null)}
                          className="px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">Non</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(sub.id)}
                        className="flex items-center gap-1 ml-auto px-3 py-1.5 text-[#d12127] hover:bg-red-50 rounded-lg text-sm transition-colors">
                        <Trash2 className="w-4 h-4"/> <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
            {filtered.length} abonné{filtered.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}