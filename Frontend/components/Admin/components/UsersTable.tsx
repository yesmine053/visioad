'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, User, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const API = 'http://localhost:8089/visioad/backend/api/users.php';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  // ── Ces champs peuvent être null/undefined si la colonne n'existe pas en DB ──
  status?: string | null;
  verified?: boolean | number | null;
  last_login?: string | null;
  created_at?: string | null;
}

// ── Formate une date DB "2026-03-26 10:30:00" → "26/03/2026" ─────────────────
const fmtDate = (raw?: string | null): string => {
  if (!raw) return '—';
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR');
};

// ── Formate la date de dernière connexion avec heure si aujourd'hui ───────────
const fmtLogin = (raw?: string | null): string => {
  if (!raw) return 'Jamais connecté';
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return 'Jamais connecté';

  const now   = new Date();
  const isToday =
    d.getDate()     === now.getDate()   &&
    d.getMonth()    === now.getMonth()  &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Aujourd'hui ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate()     === yesterday.getDate()   &&
    d.getMonth()    === yesterday.getMonth()  &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Hier';
  return d.toLocaleDateString('fr-FR');
};

// ── Détermine si un compte est vérifié (différents formats possibles) ─────────
const isVerified = (u: UserData): boolean => {
  // Si la colonne verified existe → l'utiliser
  if (u.verified !== null && u.verified !== undefined) {
    return Boolean(u.verified);
  }
  // Fallback : un admin est toujours vérifié
  return u.role === 'admin';
};

// ── Détermine le statut (colonne optionnelle) ─────────────────────────────────
const getStatus = (u: UserData): string => {
  if (u.status) return u.status;
  return 'active'; // par défaut
};

export default function UsersTable() {
  const [users,       setUsers]       = useState<UserData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterRole,  setFilterRole]  = useState('all');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [confirmId,   setConfirmId]   = useState<number | null>(null);
  const [deleting,    setDeleting]    = useState<number | null>(null);
  const [msg,         setMsg]         = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => { load(); }, [page, filterRole]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: '10',
        ...(filterRole !== 'all' && { role: filterRole }),
      });
      const res  = await fetch(`${API}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages ?? 1);
      } else {
        throw new Error(data.message);
      }
    } catch {
      // Données démo si backend injoignable
      setUsers([
        { id: 1, username: 'admin',   email: 'admin@visioad.com',   role: 'admin',   status: 'active', verified: true,  last_login: new Date().toISOString(),                created_at: '2026-01-01' },
        { id: 2, username: 'visitor', email: 'visitor@visioad.com', role: 'visitor', status: 'active', verified: false, last_login: null,                                    created_at: '2026-01-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await fetch(`${API}?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      setMsg('Utilisateur supprimé');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setUsers(prev => prev.filter(u => u.id !== id));
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Badges ───────────────────────────────────────────────────────────────────
  const roleBadge: Record<string, string> = {
    admin:   'bg-red-100 text-[#d12127] font-semibold',
    visitor: 'bg-gray-100 text-gray-600',
    client:  'bg-blue-100 text-blue-700',
  };
  const statusBadge: Record<string, string> = {
    active:   'bg-green-100 text-green-700',
    inactive: 'bg-yellow-100 text-yellow-700',
    banned:   'bg-red-100 text-red-700',
  };
  const statusLabel: Record<string, string> = {
    active: 'Actif', inactive: 'Inactif', banned: 'Banni',
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez les comptes de la plateforme</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          ✅ {msg}
        </div>
      )}

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] bg-white"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="visitor">Visiteur</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Vérifié', 'Inscription', 'Dernière connexion', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => {
                  const verified = isVerified(user);
                  const status   = getStatus(user);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                      {/* Utilisateur */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[#d12127] font-bold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full ${roleBadge[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusBadge[status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[status] ?? status}
                        </span>
                      </td>

                      {/* ✅ Vérifié — affiche ✓ vert si vérifié, ✗ gris sinon */}
                      <td className="px-4 py-4">
                        {verified
                          ? <span title="Compte vérifié"><CheckCircle className="w-5 h-5 text-green-500" /></span>
                          : <span title="Non vérifié"><XCircle    className="w-5 h-5 text-gray-300"   /></span>

                        }
                      </td>

                      {/* ✅ Date inscription */}
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {fmtDate(user.created_at)}
                      </td>

                      {/* ✅ Dernière connexion — affiche "Jamais connecté" si null */}
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <span className={!user.last_login ? 'text-gray-300 italic' : ''}>
                          {fmtLogin(user.last_login)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        {confirmId === user.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Confirmer ?</span>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deleting === user.id}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleting === user.id ? '...' : 'Oui'}
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
                            onClick={() => setConfirmId(user.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-sm">
            <span className="text-gray-500">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 text-sm"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 text-sm"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}