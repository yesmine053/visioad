'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Users, Eye, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import BlogSearch from './BlogSearch';

const BlogHero = () => {
  const [stats, setStats] = useState([
    { icon: <BookOpen   className="w-5 h-5" />, value: '...',  label: 'Articles publiés'  },
    { icon: <Users      className="w-5 h-5" />, value: '...',  label: 'Catégories'        },
    { icon: <Eye        className="w-5 h-5" />, value: '...',  label: 'Vues totales'      },
    { icon: <TrendingUp className="w-5 h-5" />, value: '...',  label: 'Articles en vedette'},
  ]);

  const [categories, setCategories] = useState([
    { name: 'Marketing',     color: 'bg-blue-500'   },
    { name: 'SEO',           color: 'bg-green-500'  },
    { name: 'Design',        color: 'bg-purple-500' },
    { name: 'Développement', color: 'bg-amber-500'  },
    { name: 'Content',       color: 'bg-pink-500'   },
  ]);

  // Couleurs pour les catégories dynamiques
  const COLORS = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-amber-500', 'bg-pink-500', 'bg-red-500',
    'bg-indigo-500', 'bg-teal-500',
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer tous les articles
        const res  = await fetch('http://localhost:8089/visioad/backend/api/blog.php?action=list');
        const data = await res.json();

        if (data.success && data.data) {
          const posts     = data.data;
          const totalViews    = posts.reduce((sum: number, p: any) => sum + (parseInt(p.views) || 0), 0);
          const featuredCount = posts.filter((p: any) => p.is_featured).length;
          const cats          = Array.from(new Set(posts.map((p: any) => p.category))) as string[];

          // Mettre à jour les stats avec les vraies données
          setStats([
            { icon: <BookOpen   className="w-5 h-5" />, value: `${posts.length}`,      label: 'Articles publiés'   },
            { icon: <Users      className="w-5 h-5" />, value: `${cats.length}`,        label: 'Catégories'         },
            { icon: <Eye        className="w-5 h-5" />, value: totalViews > 999 ? `${(totalViews/1000).toFixed(1)}k` : `${totalViews}`, label: 'Vues totales' },
            { icon: <TrendingUp className="w-5 h-5" />, value: `${featuredCount}`,      label: 'Articles en vedette'},
          ]);

          // Mettre à jour les catégories depuis la DB
          if (cats.length > 0) {
            setCategories(cats.map((name, i) => ({
              name,
              color: COLORS[i % COLORS.length],
            })));
          }
        }
      } catch (e) {
        // Garder les valeurs par défaut si le backend est inaccessible
        setStats([
          { icon: <BookOpen   className="w-5 h-5" />, value: '12',  label: 'Articles publiés'   },
          { icon: <Users      className="w-5 h-5" />, value: '5',   label: 'Catégories'         },
          { icon: <Eye        className="w-5 h-5" />, value: '0',   label: 'Vues totales'       },
          { icon: <TrendingUp className="w-5 h-5" />, value: '3',   label: 'Articles en vedette'},
        ]);
      }
    };
    fetchStats();
  }, []);

  // Scroll vers la liste ET déclenche le filtre via un event custom écouté par BlogList
  const filterAndScroll = (categoryName: string) => {
    window.dispatchEvent(new CustomEvent('blogFilterChange', { detail: categoryName }));
    setTimeout(() => {
      document.getElementById('recent')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-primary/5 via-white to-primary/5 overflow-hidden">
      <motion.div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ y:[0,-40,0], x:[0,30,0], scale:[1,1.1,1] }}
        transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-amber-500/10 to-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y:[0,40,0], x:[0,-30,0], scale:[1,1.1,1] }}
        transition={{ duration:20, repeat:Infinity, ease:'easeInOut', delay:2 }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="text-center mb-12">
            <motion.div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm mb-8"
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold text-sm tracking-wider uppercase">Blog VisioAD</span>
            </motion.div>
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
              <span className="block">Découvrez notre</span>
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">expertise digitale</span>
            </motion.h1>
            <motion.p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
              Articles, conseils et tendances en marketing digital, développement web et création de contenu.
              Tout ce dont vous avez besoin pour réussir en ligne.
            </motion.p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="max-w-3xl mx-auto mb-12">
            <BlogSearch />
          </motion.div>

          {/* Stats — données réelles depuis la DB */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div key={i} className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                whileHover={{ y:-5 }} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.5+i*0.1 }}>
                <div className="flex justify-center mb-3 text-primary">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Categories — depuis la DB */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Explorez par catégorie</h3>
              <button onClick={() => document.getElementById('recent')?.scrollIntoView({ behavior:'smooth' })}
                className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Voir tous <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className={`grid grid-cols-2 gap-4 ${categories.length <= 4 ? 'md:grid-cols-4' : 'md:grid-cols-5'}`}>
              {categories.map((cat, i) => (
                <motion.button key={cat.name} onClick={() => filterAndScroll(cat.name)}
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7+i*0.1 }}
                  whileHover={{ scale:1.05 }}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center group cursor-pointer w-full">
                  <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">{cat.name}</h4>
                  <p className="text-xs text-gray-400">Voir les articles</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }} className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button onClick={() => document.getElementById('recent')?.scrollIntoView({ behavior:'smooth' })}
                className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/25 flex items-center justify-center gap-3">
                <BookOpen className="w-5 h-5" /> Voir les articles récents <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/#Contact"
                className="px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-3">
                <Filter className="w-5 h-5" /> Besoin d'un article sur mesure ?
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">Mise à jour régulière • Contenu vérifié par nos experts</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default BlogHero;