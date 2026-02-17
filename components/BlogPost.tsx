import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Clock, Share2 } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';

interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

export const BlogPost: React.FC<{ slug: string }> = ({ slug }) => {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/blogs/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
        // Set document title for SEO
        document.title = `${data.meta_title || data.title} — Red Dot Studio`;
        // Set meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.meta_description || data.excerpt || '');
        // Inject JSON-LD
        injectJsonLd(data);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      document.title = 'Red Dot Studio';
    };
  }, [slug]);

  const injectJsonLd = (data: BlogPostData) => {
    const existing = document.getElementById('blog-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'blog-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.meta_title || data.title,
      description: data.meta_description || data.excerpt,
      image: data.cover_image,
      author: {
        '@type': 'Organization',
        name: data.author || 'Red Dot Studio'
      },
      datePublished: data.created_at,
      dateModified: data.updated_at,
      publisher: {
        '@type': 'Organization',
        name: 'Red Dot Studio'
      }
    });
    document.head.appendChild(script);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const goBack = () => {
    window.history.pushState({}, '', '/blog');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const sharePost = async () => {
    if (navigator.share) {
      await navigator.share({ title: post?.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-700 border-t-red-dot rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <h1 className="font-display text-4xl font-bold text-white">404</h1>
        <p className="text-gray-500">This article doesn't exist.</p>
        <button onClick={goBack} className="text-red-dot hover:underline font-mono text-sm">← Back to blog</button>
      </div>
    );
  }

  return (
    <article className="min-h-screen pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-12 text-sm font-mono"
        >
          <button onClick={goHome} className="text-gray-500 hover:text-white transition-colors">Home</button>
          <span className="text-gray-700">/</span>
          <button onClick={goBack} className="text-gray-500 hover:text-white transition-colors">Blog</button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 truncate max-w-xs">{post.title}</span>
        </motion.div>

        {/* Post header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-gray-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={11} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-mono border-t border-neutral-800 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-red-dot">
                {post.author?.charAt(0) || 'R'}
              </div>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{estimateReadTime(post.content)} min read</span>
            </div>
            <button onClick={sharePost} className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </motion.header>

        {/* Cover Image */}
        {post.cover_image && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="aspect-[21/9] overflow-hidden rounded-sm mb-16 bg-neutral-900"
          >
            <img
              src={post.cover_image}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </motion.div>
        )}

        {/* Post content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-3xl mx-auto"
        >
          <div
            className="prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </motion.div>

        {/* Back to blog */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-3xl mx-auto mt-20 pt-10 border-t border-neutral-800"
        >
          <button
            onClick={goBack}
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-mono text-sm"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to all articles
          </button>
        </motion.div>
      </div>
    </article>
  );
};
