'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Share2, MessageCircle, Bookmark, User, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPostProps {
  slug: string;
}

interface Comment {
  id: number;
  author_name: string;
  author_email: string;
  content: string;
  date_display: string;
}

interface BlogPostData {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  author: string;
  author_image?: string;
  category: string;
  date_display: string;
  read_time_display: string;
  views: number;
  tags: string;
  is_featured: boolean; // AJOUT DE CETTE PROPRIÉTÉ
  comments: Comment[];
  similar?: Array<{
    id: number;
    title: string;
    slug: string;
    image_url: string;
    date_display: string;
  }>;
}

const BlogPost = ({ slug }: BlogPostProps) => {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const API_URL = 'http://localhost:8089/visioad/backend/api/blog.php';
      const response = await fetch(`${API_URL}/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
      } else {
        setError('Article non trouvé');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Erreur de chargement de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const API_URL = 'http://localhost:8089/visioad/backend/api/blog.php';
      const response = await fetch(`${API_URL}?action=comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post?.id,
          ...comment
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCommentSuccess(true);
        setComment({ author_name: '', author_email: '', content: '' });
        // Rafraîchir les commentaires
        fetchPost();
        
        setTimeout(() => {
          setCommentSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Chargement de l'article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
          <MessageCircle className="w-full h-full" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {error || 'Article non trouvé'}
        </h3>
        <p className="text-gray-600 mb-6">
          L'article que vous recherchez n'existe pas ou a été déplacé.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au blog
        </Link>
      </div>
    );
  }

  const tags = post.tags ? post.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au blog
        </Link>
      </div>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href={`/blog/category/${post.category.toLowerCase()}`}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            {post.category}
          </Link>
          {post.is_featured && (
            <span className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-full">
              ★ En vedette
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
          <div className="flex items-center gap-3">
            {post.author_image ? (
              <Image
                src={post.author_image}
                alt={post.author}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">{post.author}</div>
              <div className="text-sm">Auteur</div>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-300"></div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Publié le {post.date_display}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.read_time_display} de lecture</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.views} vues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.image_url && (
          <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Partager</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <Bookmark className="w-5 h-5" />
              <span className="font-medium">Sauvegarder</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Dernière mise à jour : {post.date_display}
          </div>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase()}`}
                className="px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-gray-900">
            Commentaires ({post.comments?.length || 0})
          </h3>
        </div>

        {/* Comment Form */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Ajouter un commentaire
          </h4>
          
          {commentSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
              Votre commentaire a été soumis. Il sera publié après modération.
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={comment.author_name}
                  onChange={(e) => setComment({...comment, author_name: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={comment.author_email}
                  onChange={(e) => setComment({...comment, author_email: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire *
              </label>
              <textarea
                value={comment.content}
                onChange={(e) => setComment({...comment, content: e.target.value})}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                placeholder="Votre commentaire..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi en cours...' : 'Publier le commentaire'}
            </button>
          </form>
        </div>

        {/* Comments List */}
        {post.comments && post.comments.length > 0 ? (
          <div className="space-y-6">
            {post.comments.map(comment => (
              <div key={comment.id} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {comment.author_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {comment.date_display}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Soyez le premier à commenter cet article !
          </div>
        )}
      </div>

      {/* Similar Posts */}
      {post.similar && post.similar.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Articles similaires
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {post.similar.map(similarPost => (
              <Link
                key={similarPost.id}
                href={`/blog/${similarPost.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={similarPost.image_url || '/images/blog/default.jpg'}
                      alt={similarPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      {similarPost.date_display}
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                      {similarPost.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPost;