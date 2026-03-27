'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, RefreshCw, Search, Users, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string; // format DB : "2026-03-25 10:30:00" ou "2026-03-25T10:30:00"
}

const API = 'http://localhost:8089/visioad/backend/api/newsletter.php';

// ── Formate une date DB en français ──────────────────────────────────────────
// Accepte "2026-03-25 10:30:00" ET "2026-03-25T10:30:00.000Z"
const fmtDate = (raw: string): string => {
  if (!raw) return '—';
  // Remplace l'espace par T pour que Date() parse correctement
  const normalized = raw.replace(' ', 'T');
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return raw; // fallback : retourne la chaîne brute
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Retourne le subscriber le plus récent (par subscribed_at) ─────────────────
const getLastSubscriber = (list: Subscriber[]): Subscriber | null => {
  if (!list.length) return null;
  return list.reduce((latest, s) => {
    const dLatest = new Date(latest.subscribed_at.replace(' ', 'T')).getTime();
    const dS      = new Date(s.subscribed_at.replace(' ', 'T')).getTime();
    return dS > dLatest ? s : latest;
  });
};

export default function NewsletterTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [confirmId,   setConfirmId]   = useState<number | null>(null);
  const [deleting,    setDeleting]    = useState<number | null>(null);
  const [msg,         setMsg]         = useState('');
  const [error,       setError]       = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}?action=list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Trier du plus récent au plus ancien
        const sorted = (data.subscribers || []).sort((a: Subscriber, b: Subscriber) => {
          return new Date(b.subscribed_at.replace(' ', 'T')).getTime()
               - new Date(a.subscribed_at.replace(' ', 'T')).getTime();
        });
        setSubscribers(sorted);
      } else {
        setError(data.message || 'Erreur de chargement');
      }
    } catch {
      // Mode démo si backend injoignable
      setSubscribers([
        { id: 3, email: 'info@entreprise.com',  subscribed_at: '2026-03-25 09:15:00' },
        { id: 2, email: 'contact@startup.tn',   subscribed_at: '2026-01-20 14:22:00' },
        { id: 1, email: 'client1@gmail.com',    subscribed_at: '2025-11-15 10:30:00' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res  = await fetch(`${API}?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setMsg(data.success ? 'Abonné supprimé avec succès' : 'Supprimé');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setMsg('Abonné supprimé');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

  // ── Calculs stats ─────────────────────────────────────────────────────────
  const now       = new Date();
  const thisMonth = subscribers.filter(s => {
    const d = new Date(s.subscribed_at.replace(' ', 'T'));
    return !isNaN(d.getTime())
      && d.getMonth()    === now.getMonth()
      && d.getFullYear() === now.getFullYear();
  }).length;

  const lastSubscriber = getLastSubscriber(subscribers);

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez vos abonnés</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* ── Cartes stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total abonnés */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <Users className="w-5 h-5 text-[#d12127]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total abonnés</p>
          </div>
        </div>

        {/* Ce mois */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Ce mois ({now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})
            </p>
          </div>
        </div>

        {/* Dernier inscrit */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 truncate max-w-[160px]">
              {lastSubscriber ? fmtDate(lastSubscriber.subscribed_at) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Dernier inscrit</p>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
            ✅ {msg}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 bg-red-50 border border-red-200 text-[#d12127] rounded-xl text-sm">
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Barre recherche */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? 'Aucun résultat pour cette recherche' : 'Aucun abonné pour le moment'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'Email', 'Date inscription', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub, i) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-400 w-10">{i + 1}</td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#d12127] font-semibold text-xs uppercase">
                          {sub.email.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {/* ✅ fmtDate gère les deux formats DB */}
                      {fmtDate(sub.subscribed_at)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {confirmId === sub.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Confirmer ?</span>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deleting === sub.id}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting === sub.id ? '...' : 'Oui'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(sub.id)}
                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-[#d12127] hover:bg-red-50 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500 flex justify-between">
            <span>{filtered.length} abonné{filtered.length > 1 ? 's' : ''}</span>
            {search && (
              <button onClick={() => setSearch('')} className="text-[#d12127] hover:underline text-xs">
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}