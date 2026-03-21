'use client';

import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Eye, FileText, Star, Calendar, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = 'http://localhost:8089/visioad/backend/api/blog.php';

interface Post {
  id: number; title: string; slug: string; category: string;
  author: string; views: number; is_featured: boolean; created_at: string; excerpt?: string;
}

export default function PostsTable() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [deleting, setDeleting]     = useState<number|null>(null);
  const [confirmId, setConfirmId]   = useState<number|null>(null);
  const [msg, setMsg]               = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
        const cats = Array.from(new Set((data.data || []).map((p:Post) => p.category))) as string[];
        setCategories(cats);
      }
    } catch {
      // démo
      setPosts([
        { id:1, title:'Les 10 tendances marketing 2025', slug:'tendances-marketing-2025', category:'Marketing', author:'Équipe VisioAD', views:312, is_featured:true,  created_at:'2025-03-01' },
        { id:2, title:'SEO 2025 : Guide complet',        slug:'seo-2025-guide',           category:'SEO',       author:'Ahmed Ben Ali',   views:287, is_featured:true,  created_at:'2025-02-15' },
        { id:3, title:'Design UX/UI tendances 2025',     slug:'design-ux-ui-2025',        category:'Design',    author:'Sara Mansouri',   views:198, is_featured:false, created_at:'2025-02-10' },
      ]);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res  = await fetch(`${API}?id=${id}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setPosts(p => p.filter(x => x.id !== id));
        setMsg('Article supprimé'); setTimeout(() => setMsg(''), 3000);
      }
    } catch { setPosts(p => p.filter(x => x.id !== id)); setMsg('Article supprimé'); setTimeout(() => setMsg(''), 3000); }
    finally   { setDeleting(null); setConfirmId(null); }
  };

  const filtered = posts.filter(p =>
    (category === 'all' || p.category === category) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez le contenu de votre blog</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">
            <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`} /> Actualiser
          </button>
          {/* Bouton "Nouvel article" → pointe vers page existante */}
          <Link href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#d12127] text-white rounded-xl hover:bg-[#b91c1c] text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" /> Nouvel article
          </Link>
        </div>
      </div>

      {msg && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">✅ {msg}</div>}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-1 focus:ring-[#d12127]/20" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127]">
          <option value="all">Toutes les catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun article trouvé</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Article','Catégorie','Auteur','Vues','Statut','Date','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 max-w-xs">
                    <div className="font-medium text-gray-900 text-sm truncate flex items-center gap-1">
                      {post.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      {post.title}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{post.category}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{post.author}</td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-700"><Eye className="w-3 h-3" />{post.views}</span>
                  </td>
                  <td className="px-4 py-4">
                    {post.is_featured
                      ? <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">En vedette</span>
                      : <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Publié</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {/* Voir article sur le blog */}
                      <Link href={`/blog/${post.slug}`} target="_blank"
                        className="p-2 text-[#d12127] hover:bg-red-50 rounded-lg transition-colors" title="Voir sur le blog">
                        <Eye className="w-4 h-4" />
                      </Link>
                      {/* Modifier */}
                      <Link href={`/admin/posts/edit/${post.id}`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      {/* Supprimer avec confirmation inline */}
                      {confirmId === post.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Confirmer ?</span>
                          <button onClick={() => handleDelete(post.id)} disabled={deleting===post.id}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {deleting===post.id ? '...' : 'Oui'}
                          </button>
                          <button onClick={() => setConfirmId(null)}
                            className="px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">
                            Non
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmId(post.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
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
            <span>{filtered.length} article{filtered.length > 1 ? 's' : ''}</span>
            <span>{filtered.reduce((s,p) => s+p.views, 0)} vues totales</span>
          </div>
        )}
      </div>
    </div>
  );
}