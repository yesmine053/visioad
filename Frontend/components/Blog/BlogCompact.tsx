// components/Blog/BlogCompact.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  date_display: string;
}

const BlogCompact = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const API_URL = 'http://localhost:8089/visioad/backend/api/blog.php';
      const response = await fetch(`${API_URL}?limit=3`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-primary">Derniers articles</span>
          </h3>
          <Link 
            href="/blog" 
            className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{post.date_display}</span>
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-sm">
                  {post.title}
                </h4>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary font-medium hover:text-primary/80"
          >
            Explorer notre blog complet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogCompact;