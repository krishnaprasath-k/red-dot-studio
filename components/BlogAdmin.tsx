import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, LogOut, Plus, Save, Trash2, Eye, EyeOff, Edit3, X, 
  Download, ArrowLeft, FileText, Clock, Sparkles, Wand2, Briefcase, PenTool
} from 'lucide-react';
import { PortfolioAdmin } from './PortfolioAdmin';

interface BlogPostAdmin {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  tags: string[];
  published: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

interface PostForm {
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  tags: string;
  published: boolean;
  meta_title: string;
  meta_description: string;
}

const emptyForm: PostForm = {
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: 'Red Dot Studio',
  tags: '',
  published: false,
  meta_title: '',
  meta_description: '',
};

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

export const BlogAdmin: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('rds_admin_token'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<BlogPostAdmin | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'blog' | 'portfolio'>('blog');

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  // Auth handlers
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Invalid password');
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('rds_admin_token', data.token);
      setPassword('');
    } catch {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('rds_admin_token');
  };

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setPosts(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Flash message
  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // AI generation
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) { flash('Enter a topic or idea'); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) {
        const err = await res.json();
        flash(err.error || 'AI generation failed');
        setGenerating(false);
        return;
      }
      const data = await res.json();
      setForm({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        cover_image: data.cover_image || '',
        author: 'Red Dot Studio',
        tags: data.tags || '',
        published: false,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
      });
      setShowAiPanel(false);
      setAiPrompt('');
      flash('Blog post generated! Review and edit before publishing.');
    } catch {
      flash('Network error during generation');
    }
    setGenerating(false);
  };

  // Form handlers
  const openNewPost = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setView('editor');
  };

  const openEditPost = (post: BlogPostAdmin) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image: post.cover_image || '',
      author: post.author || 'Red Dot Studio',
      tags: post.tags?.join(', ') || '',
      published: post.published,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    });
    setView('editor');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      flash('Title and content are required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const url = editingPost
        ? `${API_BASE}/api/admin/blogs/${editingPost.id}`
        : `${API_BASE}/api/admin/blogs`;
      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) {
        const err = await res.json();
        flash(err.error || 'Failed to save');
        setSaving(false);
        return;
      }
      flash(editingPost ? 'Post updated!' : 'Post created!');
      setView('list');
      fetchPosts();
    } catch {
      flash('Network error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await fetch(`${API_BASE}/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      flash('Post deleted');
      fetchPosts();
    } catch {
      flash('Failed to delete');
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/admin/blogs/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch {
      flash('Failed to toggle');
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ═══════════════════════════════════════════════════════
  //                     LOGIN SCREEN
  // ═══════════════════════════════════════════════════════
  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-3 h-3 rounded-full bg-red-dot" />
            <span className="font-display font-bold text-xl tracking-tighter">RDS ADMIN</span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-4 font-mono">Enter admin password to continue</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="password"
              className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-dot transition-colors mb-4"
              autoFocus
            />
            {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-red-dot text-white py-3 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={16} /> Sign In
            </button>
          </div>

          {installPrompt && (
            <button
              onClick={installApp}
              className="w-full mt-4 border border-neutral-700 text-gray-400 py-3 rounded-lg font-mono text-xs hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} /> Install as App
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //                    EDITOR VIEW
  // ═══════════════════════════════════════════════════════
  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-black pt-6 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Editor header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-mono"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  showAiPanel
                    ? 'bg-purple-600 text-white'
                    : 'border border-purple-600/50 text-purple-400 hover:bg-purple-600/10'
                }`}
              >
                <Sparkles size={14} /> AI Generate
              </button>
              <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="accent-red-dot w-4 h-4"
                />
                <span className={form.published ? 'text-green-400' : 'text-gray-500'}>
                  {form.published ? 'Published' : 'Draft'}
                </span>
              </label>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-red-dot text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* AI Generation Panel */}
          {showAiPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-purple-950/20 border border-purple-600/30 rounded-lg p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Wand2 size={16} className="text-purple-400" />
                <span className="text-sm font-mono text-purple-300">AI Blog Generator</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Describe what you want to write about. The AI will generate a full blog post with title, excerpt, tags, SEO metadata, and content.</p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Write about why startups should invest in branding early, with practical tips and case studies..."
                className="w-full bg-black/50 border border-purple-800/30 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-gray-600 font-mono">Powered by Groq · Kimi K2</span>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !aiPrompt.trim()}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
                  {generating ? 'Generating...' : 'Generate Post'}
                </button>
              </div>
            </motion.div>
          )}

          {message && (
            <div className="mb-4 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-gray-300 font-mono">
              {message}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Post title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-transparent text-3xl md:text-4xl font-display font-bold text-white placeholder-gray-700 focus:outline-none border-b border-neutral-800 pb-4"
            />

            <input
              type="text"
              placeholder="Brief excerpt / summary..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full bg-transparent text-lg text-gray-400 placeholder-gray-700 focus:outline-none border-b border-neutral-800 pb-3"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Cover image URL"
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-dot transition-colors"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-dot transition-colors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Author name"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-dot transition-colors"
              />
              <input
                type="text"
                placeholder="SEO meta title (optional)"
                value={form.meta_title}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-dot transition-colors"
              />
            </div>

            <input
              type="text"
              placeholder="SEO meta description (optional)"
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-dot transition-colors"
            />

            {/* Cover image preview */}
            {form.cover_image && (
              <div className="aspect-[21/9] overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
                <img src={form.cover_image} alt="Cover preview" className="object-cover w-full h-full" />
              </div>
            )}

            {/* Content editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Content (Markdown)</span>
                <span className="text-xs text-gray-600 font-mono">{form.content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your blog post content in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item
- Another item

> Blockquote

```
code block
```

[Link text](https://example.com)
![Image alt](https://image-url.com)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-5 py-4 text-white text-sm font-mono leading-relaxed placeholder-gray-700 focus:outline-none focus:border-red-dot transition-colors resize-y"
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //                     POST LIST VIEW
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-black pt-6 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-dot" />
            <span className="font-display font-bold text-xl tracking-tighter">RDS Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {installPrompt && (
              <button
                onClick={installApp}
                className="border border-neutral-700 text-gray-400 px-4 py-2 rounded-lg font-mono text-xs hover:border-white hover:text-white transition-colors flex items-center gap-2"
              >
                <Download size={14} /> Install
              </button>
            )}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="border border-neutral-700 text-gray-400 px-4 py-2 rounded-lg text-sm hover:border-white hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => setAdminTab('blog')}
            className={`px-5 py-2 rounded-md text-sm font-mono transition-colors flex items-center gap-2 ${
              adminTab === 'blog' ? 'bg-red-dot text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <PenTool size={14} /> Blog
          </button>
          <button
            onClick={() => setAdminTab('portfolio')}
            className={`px-5 py-2 rounded-md text-sm font-mono transition-colors flex items-center gap-2 ${
              adminTab === 'portfolio' ? 'bg-red-dot text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Briefcase size={14} /> Portfolio
          </button>
        </div>

        {/* Portfolio tab */}
        {adminTab === 'portfolio' && (
          <PortfolioAdmin token={token} onLogout={handleLogout} />
        )}

        {/* Blog tab */}
        {adminTab === 'blog' && (
        <>

        {/* Blog actions */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 font-mono text-xs">{posts.length} posts</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { openNewPost(); setTimeout(() => setShowAiPanel(true), 100); }}
              className="border border-purple-600/50 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600/10 transition-colors flex items-center gap-2"
            >
              <Sparkles size={14} /> AI Generate
            </button>
            <button
              onClick={openNewPost}
              className="bg-red-dot text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-gray-300 font-mono">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <span className="text-2xl font-display font-bold text-white">{posts.length}</span>
            <p className="text-xs text-gray-500 font-mono mt-1">Total Posts</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <span className="text-2xl font-display font-bold text-green-400">{posts.filter(p => p.published).length}</span>
            <p className="text-xs text-gray-500 font-mono mt-1">Published</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <span className="text-2xl font-display font-bold text-yellow-400">{posts.filter(p => !p.published).length}</span>
            <p className="text-xs text-gray-500 font-mono mt-1">Drafts</p>
          </div>
        </div>

        {/* Post list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-red-dot rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-lg">
            <FileText size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-mono text-sm mb-4">No blog posts yet</p>
            <button
              onClick={openNewPost}
              className="text-red-dot hover:underline font-mono text-sm"
            >
              Create your first post →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${post.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {post.published ? <Eye size={10} /> : <EyeOff size={10} />}
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                    <h3 className="font-display font-medium text-white truncate">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 font-mono">
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(post.created_at)}</span>
                    <span>·</span>
                    <span>{post.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(post.id)}
                    className={`p-2 rounded-lg border transition-colors ${post.published ? 'border-green-800 text-green-400 hover:bg-green-500/10' : 'border-neutral-700 text-gray-500 hover:text-yellow-400 hover:border-yellow-800'}`}
                    title={post.published ? 'Unpublish' : 'Publish'}
                  >
                    {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => openEditPost(post)}
                    className="p-2 rounded-lg border border-neutral-700 text-gray-400 hover:text-white hover:border-white transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg border border-neutral-700 text-gray-500 hover:text-red-500 hover:border-red-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
