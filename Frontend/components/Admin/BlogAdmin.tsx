// components/Admin/BlogAdmin.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import {
  Save, Eye, Trash2, Search, Calendar,
  CheckCircle, AlertCircle, Loader2, FilePlus, RefreshCw, X, Star,
} from 'lucide-react';

const API = 'http://localhost:8089/visioad/backend/api/blog.php';

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string;
  content: string; image_url: string; author: string; category: string;
  tags: string; read_time: number; views: number; is_featured: boolean;
  created_at: string;
}

interface FormData {
  title: string; excerpt: string; content: string; category: string;
  image_url: string; author: string; read_time: number;
  is_featured: boolean; tags: string;
}

type StatusType = 'idle' | 'loading' | 'success' | 'error';
interface StatusState { type: StatusType; message: string; }

const CATEGORIES = ['Marketing','SEO','Design','Content','Développement','Web','Social Media','IA'];

const EMPTY_FORM: FormData = {
  title:'', excerpt:'', content:'', category:'Marketing',
  image_url:'', author:'Équipe VisioAD',
  read_time:5, is_featured:false, tags:'',
};

const StatusBanner = ({ status }: { status: StatusState }) => {
  if (status.type === 'idle') return null;
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error:   'bg-red-50 text-[#d12127] border-red-200',
    loading: 'bg-gray-50 text-gray-700 border-gray-200',
  }[status.type] ?? '';
  const Icon = status.type === 'success' ? CheckCircle : status.type === 'error' ? AlertCircle : Loader2;
  return (
    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      className={`mb-4 p-4 rounded-xl border flex items-center gap-3 ${styles}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${status.type==='loading'?'animate-spin':''}`}/>
      <span>{status.message}</span>
    </motion.div>
  );
};

const BlogAdmin = () => {
  const [form, setForm]           = useState<FormData>(EMPTY_FORM);
  const [posts, setPosts]         = useState<BlogPost[]>([]);
  const [filtered, setFiltered]   = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editingId, setEditingId] = useState<number|null>(null);
  const [confirmId, setConfirmId] = useState<number|null>(null);
  const [status, setStatus]       = useState<StatusState>({ type:'idle', message:'' });
  const [showForm, setShowForm]   = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  const showStatus = (type: StatusType, message: string) => {
    setStatus({ type, message });
    if (type !== 'loading') setTimeout(() => setStatus({ type:'idle', message:'' }), 4000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}?action=list`, { headers: { Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setPosts(data.data || []); setFiltered(data.data || []); }
      else showStatus('error', data.message || 'Erreur de chargement');
    } catch {
      showStatus('error', 'Serveur inaccessible. Vérifiez XAMPP (port 8089).');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    let f = [...posts];
    if (search) f = f.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'all') f = f.filter(p => p.category === catFilter);
    setFiltered(f);
  }, [search, catFilter, posts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showStatus('error', 'Le titre et le contenu sont obligatoires.');
      return;
    }
    showStatus('loading', editingId ? 'Mise à jour…' : 'Publication…');
    try {
      const action = editingId ? 'update' : 'create';
      const url    = editingId ? `${API}?action=${action}&id=${editingId}` : `${API}?action=${action}`;
      const method = editingId ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, tags: form.tags || form.category }),
      });
      const data = await res.json();
      if (data.success) {
        showStatus('success', editingId ? 'Article mis à jour !' : 'Article publié !');
        resetForm(); fetchPosts();
      } else showStatus('error', data.message || 'Erreur');
    } catch { showStatus('error', 'Serveur inaccessible.'); }
  };

  const handleDelete = async (id: number) => {
    showStatus('loading', 'Suppression…');
    try {
      const res  = await fetch(`${API}?action=delete&id=${id}`, {
        method:'DELETE', headers: { Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { showStatus('success','Article supprimé.'); fetchPosts(); }
      else showStatus('error', data.message || 'Erreur');
    } catch { showStatus('error','Serveur inaccessible.'); }
    finally { setConfirmId(null); }
  };

  const startEdit = (post: BlogPost) => {
    setForm({ title:post.title, excerpt:post.excerpt, content:post.content,
      category:post.category, image_url:post.image_url, author:post.author,
      read_time:post.read_time, is_featured:post.is_featured, tags:post.tags });
    setEditingId(post.id); setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); };

  const f = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion du Blog</h2>
            <p className="text-gray-500 text-sm mt-1">{posts.length} article{posts.length>1?'s':''} publiés</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchPosts}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">
              <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Actualiser
            </button>
            <button onClick={() => { resetForm(); setShowForm(s => !s); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#d12127] text-white rounded-xl hover:bg-[#b91c1c] text-sm font-medium">
              <FilePlus className="w-4 h-4"/> {showForm && !editingId ? 'Fermer' : 'Nouvel article'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          <StatusBanner status={status}/>
        </AnimatePresence>

        {/* Formulaire */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? `Modifier l'article #${editingId}` : 'Nouvel article'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
                    <input value={form.title} onChange={f('title')} required placeholder="Titre de l'article"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                    <select value={form.category} onChange={f('category')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127]">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Auteur</label>
                    <input value={form.author} onChange={f('author')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Extrait</label>
                    <textarea value={form.excerpt} onChange={f('excerpt')} rows={2} placeholder="Résumé court…"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20 resize-none"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contenu *</label>
                    <textarea value={form.content} onChange={f('content')} rows={8} required placeholder="Contenu de l'article…"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20 resize-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL image</label>
                    <input value={form.image_url} onChange={f('image_url')} placeholder="https://…"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                    <input value={form.tags} onChange={f('tags')} placeholder="seo, marketing, digital"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Temps de lecture (min)</label>
                    <input type="number" value={form.read_time} min={1} max={60}
                      onChange={e => setForm(p => ({ ...p, read_time: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127]"/>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.is_featured}
                        onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                        className="sr-only"/>
                      <div className={`w-10 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-[#d12127]' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow mt-1 transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-1'}`}/>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Article en vedette</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={status.type==='loading'}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#d12127] text-white rounded-xl hover:bg-[#b91c1c] text-sm font-semibold disabled:opacity-50">
                    {status.type==='loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                    {editingId ? 'Mettre à jour' : 'Publier'}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
            <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127]"/>
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127]">
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FilePlus className="w-12 h-12 mx-auto mb-3 opacity-30"/>
              <p>Aucun article trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Article','Catégorie','Auteur','Vues','Date','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 max-w-xs">
                      <p className="font-medium text-gray-900 text-sm truncate flex items-center gap-1">
                        {post.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0"/>}
                        {post.title}
                      </p>
                      {post.excerpt && <p className="text-xs text-gray-400 truncate mt-0.5">{post.excerpt}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-red-50 text-[#d12127] text-xs rounded-full">{post.category}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{post.author}</td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-sm text-gray-700"><Eye className="w-3 h-3"/>{post.views}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <a href={`/blog/${post.slug}`} target="_blank"
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Voir">
                          <Eye className="w-4 h-4"/>
                        </a>
                        <button onClick={() => startEdit(post)}
                          className="p-2 text-[#d12127] hover:bg-red-50 rounded-lg transition-colors" title="Modifier">
                          <Save className="w-4 h-4"/>
                        </button>
                        {confirmId === post.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Supprimer ?</span>
                            <button onClick={() => handleDelete(post.id)} className="px-2 py-1 bg-[#d12127] text-white text-xs rounded-lg">Oui</button>
                            <button onClick={() => setConfirmId(null)} className="px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg">Non</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(post.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
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
              <span>{filtered.length} article{filtered.length>1?'s':''}</span>
              <span>{filtered.reduce((s,p)=>s+p.views,0)} vues totales</span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogAdmin;