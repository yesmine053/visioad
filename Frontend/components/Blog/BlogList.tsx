'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Search, Filter, X } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string;
  image_url: string; author: string; category: string;
  date_display: string; read_time_display: string; views: number; is_featured: boolean;
}

// ── Résout l'URL de l'image selon son type ────────────────────────────────────
// • URL externe (https://...) → telle quelle
// • /uploads/xxx.jpg          → servi par Next.js depuis Frontend/public/uploads/
// • data:image/...            → base64 telle quelle
// • vide                      → image par défaut
const getImageUrl = (url: string): string => {
  if (!url)                    return '/images/blog/default.jpg';
  if (url.startsWith('http'))  return url;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('/'))     return url; // /uploads/... servi par public/
  return '/images/blog/default.jpg';
};

const BlogList = () => {
  const [posts, setPosts]                 = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories]       = useState<string[]>([]);
  const [currentPage, setCurrentPage]     = useState(1);
  const postsPerPage = 6;

  // Écouter l'event émis par BlogHero quand on clique une catégorie
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSelectedCategory(e.detail);
      setCurrentPage(1);
    };
    window.addEventListener('blogFilterChange', handler as EventListener);
    return () => window.removeEventListener('blogFilterChange', handler as EventListener);
  }, []);

  useEffect(() => { fetchBlogData(); }, []);
  useEffect(() => { filterPosts(); }, [searchQuery, selectedCategory, posts]);

  const fetchBlogData = async () => {
    try {
      const res  = await fetch('http://localhost:8089/visioad/backend/api/blog.php');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
        setFilteredPosts(data.data);
        const cats = Array.from(new Set(data.data.map((p: BlogPost) => p.category))) as string[];
        setCategories(['all', ...cats]);
      }
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  const filterPosts = useCallback(() => {
    let filtered = [...posts];
    if (searchQuery) filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory);
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, posts]);

  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('all'); };

  const indexOfLast  = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(filteredPosts.length / postsPerPage);

  if (loading) return (
    <div className="py-12 text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="mt-4 text-gray-600">Chargement des articles...</p>
    </div>
  );

  return (
    <div className="py-8">
      {/* Filtres */}
      <div className="mb-12">
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher des articles..."
            className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none" />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Filtrer par :</span>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>
          {(searchQuery || selectedCategory !== 'all') && (
            <button onClick={clearFilters} className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
              <X className="w-4 h-4" /> Effacer les filtres
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} trouvé{filteredPosts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` dans "${selectedCategory}"`}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* Grille articles */}
      {currentPosts.length > 0 ? (
        <>
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
            {currentPosts.map(post => (
              <motion.article key={post.id} whileHover={{ y: -5 }}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">

                {post.is_featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">★ En vedette</span>
                  </div>
                )}

                <Link href={`/blog/${post.slug}`} className="block relative">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {/* ✅ img standard — pas de restriction de domaine Next.js */}
                    <img
                      src={getImageUrl(post.image_url)}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        const img = e.target as HTMLImageElement;
                        if (!img.src.includes('default.jpg')) {
                          img.src = '/images/blog/default.jpg';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <button
                        onClick={e => { e.preventDefault(); setSelectedCategory(post.category); setCurrentPage(1); }}
                        className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/80 transition-colors">
                        {post.category}
                      </button>
                    </div>
                  </div>
                </Link>

                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date_display}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.read_time_display}</span>
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{post.author?.charAt(0) || 'V'}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{post.author}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}
                      className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors">
                      Lire →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    page === currentPage ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-50'
                  }`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun article trouvé</h3>
          <p className="text-gray-600 mb-6">Aucun article ne correspond à vos critères.</p>
          <button onClick={clearFilters}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            Afficher tous les articles
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;