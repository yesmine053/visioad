'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Eye, TrendingUp, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = 'http://localhost:8089/visioad/backend/api/blog.php';

const BlogSection = () => {
  const [posts, setPosts]               = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const [postsRes, featuredRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}?limit=4`),
          fetch(`${API_URL}?action=featured`),
          fetch(`${API_URL}?action=categories`),
        ]);
        const postsData      = await postsRes.json();
        const featuredData   = await featuredRes.json();
        const categoriesData = await categoriesRes.json();
        if (postsData.success)      setPosts(postsData.data);
        if (featuredData.success)   setFeaturedPosts(featuredData.data);
        if (categoriesData.success) setCategories(categoriesData.data);
      } catch (error) {
        console.error('Error fetching blog data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, []);

  const stats = [
    { icon: <BookOpen className="w-5 h-5" />, value: '50+',   label: 'Articles publiés' },
    { icon: <Users    className="w-5 h-5" />, value: '10k+',  label: 'Lecteurs mensuels' },
    { icon: <Eye      className="w-5 h-5" />, value: '100k+', label: 'Vues totales' },
    { icon: <TrendingUp className="w-5 h-5" />, value: '95%', label: 'Satisfaction' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-gray-600">Chargement des articles...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
            <BookOpen className="w-4 h-4" />Notre Blog
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Découvrez nos{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              dernières actualités
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Restez informé des dernières tendances en marketing digital, développement web
            et création de contenu avec nos articles experts.
          </p>

          {/* Stats */}
          <motion.div variants={containerVariants} initial="hidden"
            whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants}
                className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-3 text-primary">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Articles en vedette</h3>
              <Link href="/blog"
                className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Voir tous les articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {(featuredPosts as any[]).slice(0, 3).map((post: any) => (
                <motion.article key={post.id} whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image src={post.image_url || '/images/blog/default.jpg'} alt={post.title}
                        fill className="object-cover hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date_display}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.read_time_display}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`}
                      className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Lire l'article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Posts & Categories */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Articles récents</h3>
              <Link href="/blog"
                className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Voir plus <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-6">
              {(posts as any[]).map((post: any) => (
                <motion.article key={post.id} initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <Link href={`/blog/${post.slug}`} className="md:w-1/3">
                    <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                      <Image src={post.image_url || '/images/blog/default.jpg'} alt={post.title}
                        fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  </Link>
                  <div className="md:w-2/3">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date_display}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.read_time_display}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{post.author?.charAt(0) || 'V'}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{post.author}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`}
                        className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        Lire <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* Sidebar — Categories + Tags uniquement (newsletter supprimée) */}
          <div className="space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Catégories</h3>
              <div className="space-y-3">
                {(categories as any[]).map((cat: any) => (
                  <Link key={cat.category} href={`/blog/category/${cat.category.toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <span className="font-medium text-gray-700 group-hover:text-primary">{cat.category}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tags populaires</h3>
              <div className="flex flex-wrap gap-2">
                {['Marketing', 'SEO', 'Design', 'Content', 'Web', 'Social Media', 'IA', 'E-commerce'].map(tag => (
                  <Link key={tag} href={`/blog/tag/${tag.toLowerCase()}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-sm font-medium transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="mt-20 text-center">
          <Link href="/blog"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/25">
            <BookOpen className="w-5 h-5" />
            Explorer tous les articles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default BlogSection;