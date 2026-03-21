'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail, User, Clock, Eye, CheckCircle, XCircle, Reply, Trash2,
  Phone, Search, RefreshCw, AlertCircle, MessageSquare,
  Loader2, Filter, Calendar, Send, X,
} from 'lucide-react';

interface ContactMessage {
  id: number; name: string; email: string; phone: string;
  subject: string; message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string; email_sent: boolean;
}

const API = 'http://localhost:8089/visioad/backend/api/contact.php';

const DEMO: ContactMessage[] = [
  { id:1, name:'Ahmed Ben Salah',     email:'ahmed@example.com',  phone:'+216 92 345 678', subject:'Demande de devis site web',    message:'Bonjour, je souhaite obtenir un devis pour la création de mon site e-commerce.',     status:'new',     created_at: new Date(Date.now()-600000).toISOString(),    email_sent:true },
  { id:2, name:'Marie Dupont',        email:'marie@example.com',  phone:'+33 6 12 34 56',  subject:'Projet application mobile',   message:'Nous cherchons une agence pour développer une application iOS et Android.',           status:'read',    created_at: new Date(Date.now()-7200000).toISOString(),   email_sent:true },
  { id:3, name:'Mohamed Ali',         email:'moali@example.com',  phone:'+216 71 234 567', subject:'Référencement SEO',           message:'Comment pouvez-vous améliorer le référencement de notre site actuel ?',               status:'replied', created_at: new Date(Date.now()-86400000).toISOString(),  email_sent:true },
  { id:4, name:'Sophie Martin',       email:'sophie@example.com', phone:'+33 6 98 76 54',  subject:'Design graphique',           message:'J\'ai besoin d\'un nouveau logo pour mon entreprise.',                                status:'new',     created_at: new Date(Date.now()-172800000).toISOString(), email_sent:false },
  { id:5, name:'Fatima Khadraoui',    email:'fatima@example.com', phone:'+213 555 123 456',subject:'Formation WordPress',         message:'Est-ce que vous proposez des formations pour WordPress ?',                            status:'new',     created_at: new Date(Date.now()-259200000).toISOString(), email_sent:true  },
];

const ContactsTable: React.FC = () => {
  const [messages, setMessages]     = useState<ContactMessage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState<'all'|'new'|'read'|'replied'>('all');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<ContactMessage | null>(null);
  const [demoMode, setDemoMode]     = useState(false);
  const [actionId, setActionId]     = useState<number|null>(null);
  const [toast, setToast]           = useState<{ type:'success'|'error'; msg:string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number|null>(null);

  const token    = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const isMounted = useRef(true);

  const showToast = (type: 'success'|'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => { if (isMounted.current) setToast(null); }, 3500);
  };

  // ── Charger messages ────────────────────────────────────────────────────────
  const load = useCallback(async (force = false) => {
    if (refreshing && !force) return;
    setRefreshing(true);
    try {
      const res  = await fetch(`${API}?action=list`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages.map((m: any) => ({
          id:         Number(m.id),
          name:       m.name       || 'Non renseigné',
          email:      m.email      || '',
          phone:      m.phone      || '',
          subject:    m.subject    || 'Sans objet',
          message:    m.message    || '',
          status:     ['new','read','replied'].includes(m.status) ? m.status : 'new',
          created_at: m.created_at || new Date().toISOString(),
          email_sent: !!m.email_sent,
        })));
        setDemoMode(false);
      } else throw new Error(data.message || 'Réponse invalide');
    } catch {
      if (!isMounted.current) return;
      setDemoMode(true);
      setMessages(DEMO);
    } finally {
      if (isMounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, [token]);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => { isMounted.current = false; };
  }, [load]);

  // ── Mettre à jour statut ────────────────────────────────────────────────────
  const updateStatus = async (id: number, newStatus: 'read'|'replied') => {
    setActionId(id);
    if (demoMode) {
      setMessages(m => m.map(x => x.id === id ? { ...x, status: newStatus } : x));
      if (selected?.id === id) setSelected(s => s ? { ...s, status: newStatus } : null);
      setActionId(null);
      showToast('success', `Marqué comme ${newStatus === 'read' ? 'lu' : 'répondu'}`);
      return;
    }
    try {
      // ✅ PUT ?action=read  ou  PUT ?action=replied  — compatible contact.php POO
      const res  = await fetch(`${API}?action=${newStatus}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(m => m.map(x => x.id === id ? { ...x, status: newStatus } : x));
        if (selected?.id === id) setSelected(s => s ? { ...s, status: newStatus } : null);
        showToast('success', `Marqué comme ${newStatus === 'read' ? 'lu' : 'répondu'}`);
      } else throw new Error(data.message);
    } catch (e: any) { showToast('error', e.message || 'Erreur'); }
    finally { setActionId(null); }
  };

  // ── Supprimer ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setActionId(id); setConfirmDeleteId(null);
    if (demoMode) {
      setMessages(m => m.filter(x => x.id !== id));
      setSelected(null); setActionId(null);
      showToast('success', 'Message supprimé');
      return;
    }
    try {
      // ✅ DELETE ?action=delete — compatible contact.php POO
      const res  = await fetch(`${API}?action=delete`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(m => m.filter(x => x.id !== id));
        setSelected(null);
        showToast('success', 'Message supprimé');
      } else throw new Error(data.message);
    } catch (e: any) { showToast('error', e.message || 'Erreur'); }
    finally { setActionId(null); }
  };

  // ── Répondre par email ──────────────────────────────────────────────────────
  const replyByEmail = (msg: ContactMessage) => {
    const sub  = encodeURIComponent(`Re: ${msg.subject || 'Votre message'}`);
    const body = encodeURIComponent(`Bonjour ${msg.name},\n\nMerci pour votre message.\n\n`);
    window.open(`mailto:${msg.email}?subject=${sub}&body=${body}`, '_blank');
    if (msg.status !== 'replied') updateStatus(msg.id, 'replied');
  };

  // ── Filtres ─────────────────────────────────────────────────────────────────
  const filtered = messages.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) ||
           m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
  });

  // ── Utils ───────────────────────────────────────────────────────────────────
  const fmtDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000)    return 'À l\'instant';
    if (diff < 3600000)  return `Il y a ${Math.floor(diff/60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff/3600000)} h`;
    return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  };

  const statusColors: Record<string,string> = {
    new:     'bg-blue-100 text-blue-800',
    read:    'bg-gray-100 text-gray-700',
    replied: 'bg-green-100 text-green-700',
  };
  const statusLabels: Record<string,string> = { new:'Nouveau', read:'Lu', replied:'Répondu' };
  const newCount     = messages.filter(m => m.status === 'new').length;
  const readCount    = messages.filter(m => m.status === 'read').length;
  const repliedCount = messages.filter(m => m.status === 'replied').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#d12127]"/> Messages reçus
            {newCount > 0 && (
              <span className="bg-[#d12127] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {newCount}
              </span>
            )}
          </h2>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"/> Nouveaux: {newCount}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full"/> Lus: {readCount}</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500"/> Répondu: {repliedCount}</span>
            {demoMode && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">Mode démo</span>}
          </div>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}/>
          {refreshing ? 'Actualisation…' : 'Actualiser'}
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
          <input type="text" placeholder="Rechercher par nom, email, sujet…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"/>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400"/>
          {(['all','new','read','replied'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                filter === s ? 'bg-[#d12127] text-white border-[#d12127]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {s === 'all' ? 'Tous' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30"/>
            <p>{search || filter !== 'all' ? 'Aucun résultat' : 'Aucun message reçu'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Expéditeur','Sujet','Date','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(msg => (
                <tr key={msg.id} onClick={() => setSelected(msg)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${msg.status === 'new' ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                        msg.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{msg.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{msg.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{msg.email}</p>
                        {msg.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/>{msg.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="font-medium text-gray-800 text-sm truncate">{msg.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.message.slice(0,60)}{msg.message.length>60?'…':''}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{fmtDate(msg.created_at)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[msg.status]}`}>
                      {statusLabels[msg.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => replyByEmail(msg)} title="Répondre" disabled={actionId===msg.id}
                        className="p-2 text-[#d12127] hover:bg-red-50 rounded-lg transition-colors">
                        <Send className="w-4 h-4"/>
                      </button>
                      {msg.status !== 'read' && (
                        <button onClick={() => updateStatus(msg.id,'read')} title="Marquer lu" disabled={actionId===msg.id}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          {actionId===msg.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      )}
                      {msg.status !== 'replied' && (
                        <button onClick={() => updateStatus(msg.id,'replied')} title="Marquer répondu" disabled={actionId===msg.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          {actionId===msg.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Reply className="w-4 h-4"/>}
                        </button>
                      )}
                      {confirmDeleteId === msg.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Supprimer ?</span>
                          <button onClick={() => handleDelete(msg.id)} className="px-2 py-1 bg-[#d12127] text-white text-xs rounded-lg">Oui</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg">Non</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(msg.id)} title="Supprimer" disabled={actionId===msg.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500 flex justify-between">
            <span>{filtered.length} message{filtered.length>1?'s':''}</span>
            <span>{demoMode ? '⚠ Mode démo' : '● Données en direct'}</span>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Message #{selected.id}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[selected.status]}`}>
                      {statusLabels[selected.status]}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5"/>{fmtDate(selected.created_at)}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-gray-400"/>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div><p className="text-xs text-gray-500 mb-1">Nom</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="font-medium">{selected.email}</p></div>
                {selected.phone && <div><p className="text-xs text-gray-500 mb-1">Téléphone</p><p className="font-medium">{selected.phone}</p></div>}
                <div><p className="text-xs text-gray-500 mb-1">Sujet</p><p className="font-medium">{selected.subject}</p></div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Message</p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-line max-h-60 overflow-y-auto leading-relaxed">
                  {selected.message}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                <button onClick={() => replyByEmail(selected)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#d12127] text-white rounded-xl hover:bg-[#b91c1c] text-sm font-medium">
                  <Send className="w-4 h-4"/> Répondre
                </button>
                {selected.status !== 'read' && (
                  <button onClick={() => { updateStatus(selected.id,'read'); setSelected(null); }} disabled={actionId===selected.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-sm disabled:opacity-50">
                    <Eye className="w-4 h-4"/> Marquer lu
                  </button>
                )}
                {selected.status !== 'replied' && (
                  <button onClick={() => { updateStatus(selected.id,'replied'); setSelected(null); }} disabled={actionId===selected.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm disabled:opacity-50">
                    <Reply className="w-4 h-4"/> Répondu
                  </button>
                )}
                <button onClick={() => { setSelected(null); setConfirmDeleteId(selected.id); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm">
                  <Trash2 className="w-4 h-4"/> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-[#d12127] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin"/> Mise à jour…
        </div>
      )}
    </div>
  );
};

export default ContactsTable;