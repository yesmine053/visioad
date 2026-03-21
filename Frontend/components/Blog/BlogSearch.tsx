'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: number; title: string; slug: string; excerpt: string;
  image_url: string; author: string; date_display: string; read_time: number;
}

const BlogSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults]         = useState<SearchResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [showResults, setShowResults] = useState(false);

  const popularSearches = ['Marketing digital 2025', 'SEO techniques', 'Développement web', 'Design UX/UI', 'Content marketing', 'Réseaux sociaux'];

  useEffect(() => {
    if (searchQuery.length > 2) {
      const t = setTimeout(() => performSearch(), 300);
      return () => clearTimeout(t);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:8089/visioad/backend/api/blog.php?action=search&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) { setResults(data.data); setShowResults(true); }
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  const clearSearch = () => { setSearchQuery(''); setResults([]); setShowResults(false); };

  // "Voir tous les résultats" → ferme le dropdown et filtre la BlogList
  const showAllResults = () => {
    setShowResults(false);
    window.dispatchEvent(new CustomEvent('blogFilterChange', { detail: 'all' }));
    // Passer le terme de recherche à BlogList via sessionStorage
    sessionStorage.setItem('blogSearch', searchQuery);
    window.dispatchEvent(new CustomEvent('blogSearchChange', { detail: searchQuery }));
    document.getElementById('recent')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <form onSubmit={e => { e.preventDefault(); if (searchQuery.trim()) performSearch(); }} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher des articles..."
            className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-sm"
            onFocus={() => searchQuery.length > 2 && setShowResults(true)} />
          {searchQuery && (
            <button type="button" onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!searchQuery && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">Recherches populaires :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map(term => (
                <button key={term} type="button" onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-sm font-medium transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Résultats dropdown */}
      <AnimatePresence>
        {showResults && (results.length > 0 || loading) && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">

            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                {loading ? 'Recherche en cours...' : `${results.length} résultat${results.length !== 1 ? 's' : ''}`}
              </span>
              <button onClick={() => setShowResults(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-gray-600">Recherche en cours...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {results.map(result => (
                    <Link key={result.id} href={`/blog/${result.slug}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowResults(false)}>
                      <div className="flex items-start gap-4">
                        {result.image_url && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={result.image_url} alt={result.title} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{result.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{result.date_display}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{result.read_time} min</span>
                            <span>{result.author}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
                {/* ✅ "Voir tous" → scroll vers BlogList avec filtre, plus de /blog/search inexistant */}
                <div className="p-4 border-t border-gray-200">
                  <button onClick={showAllResults}
                    className="w-full text-center text-primary font-medium hover:text-primary/80 py-1">
                    Voir tous les résultats pour "{searchQuery}" →
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="font-semibold text-gray-900 mb-2">Aucun résultat</h4>
                <p className="text-gray-600">Aucun article ne correspond à "{searchQuery}"</p>
                <button onClick={clearSearch} className="mt-4 px-4 py-2 text-primary font-medium hover:text-primary/80">
                  Effacer la recherche
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}
    </div>
  );
};

export default BlogSearch;