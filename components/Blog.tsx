import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Tag } from 'lucide-react';

interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author: string;
  tags: string[];
  created_at: string;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/blogs`)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section id="blog" className="py-24 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-red-dot font-mono text-sm mb-2 block">05 / INSIGHTS</span>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight">
              From the studio
            </h2>
          </div>
          <p className="text-gray-500 max-w-sm text-sm md:text-base">
            Perspectives on design, branding, and building products that move the needle.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-red-dot rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-mono text-sm">No articles published yet. Stay tuned.</p>
          </div>
        )}

        {/* Blog grid */}
        {!loading && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {posts.map((post, index) => (
              <motion.a
                key={post.id}
                href={`/blog/${post.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group cursor-pointer block"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', `/blog/${post.slug}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-5 bg-white">
                  <img
                    src={post.cover_image || '/blog-cover-default.svg'}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-red-dot text-white p-2.5 rounded-sm">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 rounded-sm text-[11px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-display font-normal mb-2 text-gray-900 group-hover:text-red-dot transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono border-t border-gray-200 pt-3 group-hover:border-red-dot/30 transition-colors duration-300">
                  <Calendar size={12} />
                  <span>{formatDate(post.created_at)}</span>
                  <span className="text-neutral-700">·</span>
                  <span>{post.author}</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
