'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Eye, Tag, Share2, BookOpen, Mail, Check, Send } from 'lucide-react';
import Link from 'next/link';

const API_URL = 'http://localhost:8089/visioad/backend/api/blog.php';

// ── Newsletter fonctionnelle ──────────────────────────────────────────────────
const NewsletterBlock = () => {
  const [email, setEmail]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) { setError('Adresse email invalide'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch('http://localhost:8089/visioad/backend/api/newsletter.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true); setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch { setError('Erreur de connexion'); }
    finally   { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Newsletter</h3>
          <p className="text-white/80 text-xs">Restez informé</p>
        </div>
      </div>
      <p className="text-white/90 text-sm mb-5">
        Recevez nos derniers articles et conseils directement dans votre boîte mail.
      </p>
      {subscribed ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-white/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-300" />
            <div>
              <p className="font-semibold text-sm">Inscription réussie !</p>
              <p className="text-xs text-white/80">Merci pour votre abonnement.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="votre@email.com" disabled={submitting}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 text-sm" />
          {error && <p className="text-xs text-red-200">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 text-sm">
            {submitting
              ? <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Inscription...</>
              : <><Send className="w-4 h-4" />S'abonner</>}
          </button>
        </form>
      )}
      <p className="text-xs text-white/60 mt-3">Désabonnement à tout moment.</p>
    </motion.div>
  );
};

// ── BlogSidebar ───────────────────────────────────────────────────────────────
const BlogSidebar = () => {
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [postsRes, catRes] = await Promise.all([
          fetch(`${API_URL}?limit=5&sort=views`),
          fetch(`${API_URL}?action=categories`),
        ]);
        const postsData = await postsRes.json();
        const catData   = await catRes.json();
        if (postsData.success) setPopularPosts(postsData.data?.slice(0, 4) || []);
        if (catData.success)   setCategories(catData.data?.slice(0, 5) || []);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    fetchSidebarData();
  }, []);

  const tags = ['Marketing', 'SEO', 'Design', 'Content', 'Web', 'Social Media', 'IA', 'E-commerce'];

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* About */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">VisioAD Blog</h3>
            <p className="text-white/90 text-sm">Expertise digitale depuis 2022</p>
          </div>
        </div>
        <p className="text-white/90 mb-6">
          Nous partageons notre expertise en marketing digital, développement web et création de contenu.
        </p>
        <Link href="/#a-propos"
          className="inline-block w-full text-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
          Découvrir VisioAD
        </Link>
      </motion.div>

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-gray-900">Articles populaires</h3>
          </div>
          <div className="space-y-4">
            {popularPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-start gap-3 group">
                <span className="text-sm font-bold text-gray-400 group-hover:text-primary mt-1">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">{post.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views} vues</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date_display}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Catégories</h3>
          <div className="space-y-3">
            {categories.map(category => (
              <Link key={category.category} href={`/blog/category/${category.category.toLowerCase()}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <span className="font-medium text-gray-700 group-hover:text-primary">{category.category}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded group-hover:bg-primary group-hover:text-white transition-colors">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ✅ Newsletter fonctionnelle (remplace l'ancien bloc statique) */}
      <NewsletterBlock />

      {/* Tags */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-gray-900">Tags populaires</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Link key={tag} href={`/blog/tag/${tag.toLowerCase().replace(' ', '-')}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-sm font-medium transition-colors">
              #{tag}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Share */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-gray-900">Partager</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            Facebook
          </button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`)}
            className="flex-1 px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors font-medium text-sm">
            Twitter
          </button>
          <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}
            className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm">
            LinkedIn
          </button>
        </div>
      </motion.div>

    </div>
  );
};

export default BlogSidebar;