'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/Admin/AdminLayout';
import {
  ArrowLeft, Save, Upload, Eye, X,
  Image as ImageIcon, FileText, Bold, Italic,
  Link as LinkIcon, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const API_URL = 'http://localhost:8089/visioad/backend/api/blog.php';

interface PostFormData {
  title: string; slug: string; content: string; excerpt: string;
  category: string; author: string; is_featured: boolean;
  tags: string[]; image_url: string;
}

// ── TagInput ──────────────────────────────────────────────────────────────────
const TagInput: React.FC<{ tags: string[]; onTagsChange: (t: string[]) => void }> = ({ tags, onTagsChange }) => {
  const [input, setInput] = useState('');
  const add = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = input.trim();
      if (tag && !tags.includes(tag)) { onTagsChange([...tags, tag]); setInput(''); }
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl min-h-[46px] focus-within:border-[#d12127] focus-within:ring-2 focus-within:ring-red-100 transition">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-[#d12127] border border-red-200 rounded-full font-medium">
            #{tag}
            <button type="button" onClick={() => onTagsChange(tags.filter((_, j) => j !== i))}
              className="hover:text-red-700"><X size={12} /></button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={add}
          placeholder={tags.length === 0 ? 'Ajouter un tag (Entrée)' : ''}
          className="flex-1 min-w-[140px] outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400" />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">Appuyez sur Entrée ou virgule pour ajouter</p>
    </div>
  );
};

// ── ImageInput ────────────────────────────────────────────────────────────────
const ImageInput: React.FC<{ url: string; onChange: (url: string) => void }> = ({ url, onChange }) => {
  const [drag, setDrag]           = useState(false);
  const [tab, setTab]             = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image trop grande (max 5MB)'); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('action', 'upload');
      const res  = await fetch('http://localhost:8089/visioad/backend/api/media.php', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        onChange(data.media.url);
      } else {
        // fallback base64
        const r = new FileReader();
        r.onloadend = () => onChange(r.result as string);
        r.readAsDataURL(file);
      }
    } catch {
      const r = new FileReader();
      r.onloadend = () => onChange(r.result as string);
      r.readAsDataURL(file);
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button type="button" onClick={() => setTab('url')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition ${tab === 'url' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          🔗 URL
        </button>
        <button type="button" onClick={() => setTab('upload')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition ${tab === 'upload' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          📁 Importer
        </button>
      </div>

      {tab === 'url' && (
        <input type="text" value={url} onChange={e => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-2 focus:ring-red-100 transition text-gray-700 placeholder-gray-400" />
      )}

      {tab === 'upload' && (
        <div
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${drag ? 'border-[#d12127] bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Envoi en cours…</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">Glissez une image ici ou</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#d12127] text-white text-sm rounded-xl cursor-pointer hover:bg-red-700 transition">
                <Upload size={14} /> Choisir un fichier
                <input type="file" className="hidden" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
              </label>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP · max 5MB</p>
            </>
          )}
        </div>
      )}

      {url && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
          <img src={url} alt="cover" className="w-full h-52 object-cover"
            onError={e => { (e.target as HTMLImageElement).src = '/images/blog/default.jpg'; }} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button type="button" onClick={() => onChange('')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <X size={14} /> Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── MarkdownEditor ────────────────────────────────────────────────────────────
const MarkdownEditor: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const insert = (before: string, after = '') => {
    const ta = ref.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    onChange(value.substring(0, s) + before + value.substring(s, e) + after + value.substring(e));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, e + before.length); }, 0);
  };
  const tools = [
    { label: 'H1',    icon: <span className="font-bold text-xs">H1</span>,     action: () => insert('# ')         },
    { label: 'H2',    icon: <span className="font-bold text-xs">H2</span>,     action: () => insert('## ')        },
    { label: 'Gras',  icon: <Bold size={14} />,                                action: () => insert('**', '**')   },
    { label: 'Ital.', icon: <Italic size={14} />,                              action: () => insert('*', '*')     },
    { label: 'Lien',  icon: <LinkIcon size={14} />,                            action: () => { const u = prompt('URL:'); if (u) insert(`[lien](${u})`); } },
    { label: 'Liste', icon: <span className="text-xs">• —</span>,              action: () => insert('- ')         },
    { label: 'Code',  icon: <span className="font-mono text-xs">{`</>`}</span>, action: () => insert('```\n', '\n```') },
  ];
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#d12127] focus-within:ring-2 focus-within:ring-red-100 transition">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-1 flex-wrap">
        {tools.map((t, i) => (
          <button key={i} type="button" onClick={t.action} title={t.label}
            className="px-2.5 py-1.5 text-gray-600 hover:bg-white hover:text-[#d12127] rounded-lg transition flex items-center text-sm">
            {t.icon}
          </button>
        ))}
      </div>
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} rows={20}
        className="w-full px-4 py-4 font-mono text-sm focus:outline-none resize-y bg-white text-gray-800 leading-relaxed"
        placeholder="Contenu en Markdown..." />
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
export default function EditPostPage() {
  const router    = useRouter();
  const params    = useParams();
  const postId    = params?.id as string;

  const [loadingPost, setLoadingPost] = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [preview, setPreview]         = useState(false);
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [notFound, setNotFound]       = useState(false);

  const [form, setForm] = useState<PostFormData>({
    title: '', slug: '', content: '', excerpt: '',
    category: 'Marketing', author: '', is_featured: false,
    tags: [], image_url: '',
  });

  const categories = ['Marketing', 'SEO', 'Design', 'Content', 'Développement', 'Web', 'Social Media', 'IA'];

  const makeSlug = (title: string) => title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Charger l'article existant ────────────────────────────────────────────
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('access_token') || '';
        const res   = await fetch(`${API_URL}?action=list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        if (data.success && data.data) {
          const post = data.data.find((p: any) => String(p.id) === String(postId));
          if (post) {
            setForm({
              title:       post.title       || '',
              slug:        post.slug        || '',
              content:     post.content     || '',
              excerpt:     post.excerpt     || '',
              category:    post.category    || 'Marketing',
              author:      post.author      || '',
              is_featured: !!post.is_featured,
              tags:        post.tags ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              image_url:   post.image_url   || '',
            });
          } else {
            setNotFound(true);
          }
        }
      } catch (e) {
        showToast('error', 'Impossible de charger l\'article');
      } finally {
        setLoadingPost(false);
      }
    };
    fetchPost();
  }, [postId]);

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  // ── Sauvegarder les modifications ─────────────────────────────────────────
  const submit = async () => {
    if (!form.title.trim())   { showToast('error', 'Le titre est obligatoire'); return; }
    if (!form.content.trim()) { showToast('error', 'Le contenu est obligatoire'); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      const payload = {
        title:       form.title,
        slug:        form.slug || makeSlug(form.title),
        content:     form.content,
        excerpt:     form.excerpt,
        category:    form.category,
        author:      form.author || 'Équipe VisioAD',
        is_featured: form.is_featured ? 1 : 0,
        tags:        form.tags.join(','),
        image_url:   form.image_url,
        read_time:   Math.max(1, Math.ceil(form.content.split(' ').length / 200)),
      };

      const res  = await fetch(`${API_URL}?action=update&id=${postId}`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept':        'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); }
      catch { throw new Error('Réponse invalide du serveur. Vérifiez XAMPP.'); }

      if (data.success) {
        showToast('success', 'Article mis à jour avec succès !');
        setTimeout(() => router.push('/admin/dashboard?tab=posts'), 1200);
      } else {
        showToast('error', data.message || 'Erreur lors de la mise à jour');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Serveur inaccessible. Vérifiez XAMPP.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreview = (md: string) => ({
    __html: md
      .replace(/^# (.*$)/gm,   '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gm,  '<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-5 mb-2 text-gray-800">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,    '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#d12127] hover:underline">$1</a>')
      .replace(/^- (.*$)/gm,   '<li class="ml-5 list-disc text-gray-700">$1</li>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto my-4"><code>$1</code></pre>')
      .replace(/\n\n/g, '</p><p class="my-3 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br>'),
  });

  const field = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d12127] focus:ring-2 focus:ring-red-100 transition text-gray-800 placeholder-gray-400 bg-white";

  // ── États de chargement ───────────────────────────────────────────────────
  if (loadingPost) return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement de l'article...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (notFound) return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">Article introuvable</p>
          <p className="text-gray-500 mb-6">L'article #{postId} n'existe pas.</p>
          <Link href="/admin/dashboard?tab=posts"
            className="px-6 py-3 bg-[#d12127] text-white rounded-xl font-medium hover:bg-red-700 transition">
            ← Retour aux articles
          </Link>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-[#d12127]'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard?tab=posts"
                className="p-2 hover:bg-white rounded-xl transition border border-transparent hover:border-gray-200 hover:shadow-sm">
                <ArrowLeft size={18} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifier l'article</h1>
                <p className="text-sm text-gray-400 mt-0.5">ID #{postId} — Blog VISIOAD</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => setPreview(!preview)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl hover:border-gray-300 transition text-sm font-medium text-gray-700">
                <Eye size={15} /> {preview ? 'Éditer' : 'Aperçu'}
              </button>
              <button type="button" onClick={submit} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#d12127] text-white rounded-xl hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50 shadow-sm">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</>
                ) : (
                  <><Save size={15} /> Sauvegarder</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Formulaire principal */}
            <div className={`lg:col-span-2 space-y-5 ${preview ? 'hidden' : 'block'}`}>

              {/* Titre + Slug */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
                <input type="text" name="title" value={form.title} onChange={update}
                  placeholder="Titre de l'article"
                  className="w-full px-4 py-3 text-lg font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-[#d12127] focus:ring-2 focus:ring-red-100 transition placeholder-gray-300" />
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400 flex-shrink-0">visioad.tn/blog/</span>
                  <input type="text" name="slug" value={form.slug} onChange={update}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#d12127] transition text-gray-600 bg-gray-50" />
                </div>
              </div>

              {/* Image */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Image de couverture</label>
                <ImageInput url={form.image_url} onChange={url => setForm(p => ({ ...p, image_url: url }))} />
              </div>

              {/* Extrait */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Extrait</label>
                  <span className={`text-xs ${form.excerpt.length > 180 ? 'text-[#d12127]' : 'text-gray-400'}`}>{form.excerpt.length}/200</span>
                </div>
                <textarea name="excerpt" value={form.excerpt} onChange={update} rows={3} maxLength={200}
                  placeholder="Résumé court affiché dans la liste des articles..."
                  className={field + ' resize-none'} />
              </div>

              {/* Contenu */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Contenu (Markdown) *</label>
                  <span className="text-xs text-gray-400">{form.content.split(' ').length} mots</span>
                </div>
                <MarkdownEditor value={form.content} onChange={v => setForm(p => ({ ...p, content: v }))} />
              </div>
            </div>

            {/* Sidebar / Aperçu */}
            <div className={preview ? 'lg:col-span-3' : 'block'}>
              {preview ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Aperçu</h2>
                    <button onClick={() => setPreview(false)} className="text-sm text-[#d12127] hover:underline">← Retour</button>
                  </div>
                  {form.image_url && (
                    <img src={form.image_url} className="w-full h-64 object-cover rounded-xl mb-8" alt="cover"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/blog/default.jpg'; }} />
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-red-50 text-[#d12127] text-xs rounded-full font-medium border border-red-200">{form.category}</span>
                    <span className="text-xs text-gray-400">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title || 'Titre...'}</h1>
                  {form.excerpt && <p className="text-gray-500 text-lg border-l-4 border-[#d12127] pl-4 mb-8 italic">{form.excerpt}</p>}
                  <div dangerouslySetInnerHTML={renderPreview(form.content)} />
                  {form.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
                      {form.tags.map((t, i) => <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">#{t}</span>)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Publication */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Publication</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Statut</span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs rounded-full font-medium">Publié</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${form.is_featured ? 'bg-[#d12127] border-[#d12127]' : 'border-gray-300'}`}>
                        {form.is_featured && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">Mettre en avant</span>
                    </label>
                  </div>

                  {/* Organisation */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Organisation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Catégorie</label>
                        <select name="category" value={form.category} onChange={update} className={field}>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Auteur</label>
                        <input type="text" name="author" value={form.author} onChange={update}
                          placeholder="Votre nom" className={field} />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Tags</h3>
                    <TagInput tags={form.tags} onTagsChange={tags => setForm(p => ({ ...p, tags }))} />
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">Modification en cours</h4>
                        <p className="text-xs text-blue-700">
                          Article #{postId} — Les modifications seront visibles immédiatement après sauvegarde.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}