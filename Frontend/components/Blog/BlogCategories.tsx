'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, FileText, Palette, Code, Megaphone, Globe } from 'lucide-react';

interface Category { category: string; count: number; }

const categoryIcons: Record<string, React.ReactNode> = {
  'Marketing':     <Megaphone className="w-5 h-5" />,
  'SEO':           <TrendingUp className="w-5 h-5" />,
  'Content':       <FileText   className="w-5 h-5" />,
  'Design':        <Palette    className="w-5 h-5" />,
  'Développement': <Code       className="w-5 h-5" />,
  'Web':           <Globe      className="w-5 h-5" />,
  'default':       <FileText   className="w-5 h-5" />,
};

// Scroll vers la liste + filtre via event custom
const filterList = (value: string) => {
  window.dispatchEvent(new CustomEvent('blogFilterChange', { detail: value }));
  setTimeout(() => document.getElementById('recent')?.scrollIntoView({ behavior: 'smooth' }), 50);
};

const BlogCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('http://localhost:8089/visioad/backend/api/blog.php?action=categories')
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
        {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-200 rounded mb-3" />)}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Catégories</h3>

      <div className="space-y-2">
        {/* Tous */}
        <motion.button initial={{ y:10, opacity:0 }} animate={{ y:0, opacity:1 }}
          onClick={() => filterList('all')}
          className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-primary">Tous les articles</div>
              <div className="text-sm text-gray-500">Explorez notre collection complète</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Catégories dynamiques */}
        {categories.map((cat, i) => (
          <motion.button key={cat.category}
            initial={{ y:10, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay: i * 0.05 }}
            onClick={() => filterList(cat.category)}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {categoryIcons[cat.category] || categoryIcons.default}
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-primary">{cat.category}</div>
                <div className="text-sm text-gray-500">{cat.count} article{cat.count !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
          </motion.button>
        ))}
      </div>

      {/* Tags — filtrent la liste au lieu de naviguer */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags populaires</h4>
        <div className="flex flex-wrap gap-2">
          {['Marketing Digital','SEO','Design UX','Développement Web','Réseaux Sociaux','Content Marketing','E-commerce','IA'].map(tag => (
            <button key={tag}
              onClick={() => {
                // Extraire le premier mot pour matcher une catégorie
                const cat = tag.split(' ')[0];
                filterList(cat);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-sm font-medium transition-colors">
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCategories;