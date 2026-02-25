import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Save, Trash2, Eye, EyeOff, Edit3,
  ArrowLeft, Image, Github, ExternalLink, GripVertical,
  Sparkles, Wand2
} from 'lucide-react';

interface PortfolioProject {
  id: number;
  title: string;
  category: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string;
  year: string;
  tags: string[];
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectForm {
  title: string;
  category: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url: string;
  year: string;
  tags: string;
  sort_order: number;
  visible: boolean;
}

const emptyForm: ProjectForm = {
  title: '',
  category: '',
  description: '',
  image_url: '',
  github_url: '',
  live_url: '',
  year: new Date().getFullYear().toString(),
  tags: '',
  sort_order: 0,
  visible: true,
};

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface Props {
  token: string;
  onLogout: () => void;
}

export const PortfolioAdmin: React.FC<Props> = ({ token, onLogout }) => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setProjects(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [token, onLogout]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // AI generation
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) { flash('Describe the project'); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/generate?type=project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          image_url: form.image_url,
          github_url: form.github_url,
          live_url: form.live_url,
        }),
      });
      if (res.status === 401) { setGenerating(false); onLogout(); return; }
      if (!res.ok) {
        const err = await res.json();
        flash(err.error || 'AI generation failed');
        setGenerating(false);
        return;
      }
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        category: data.category || prev.category,
        description: data.description || prev.description,
        tags: data.tags || prev.tags,
        year: data.year || prev.year,
        image_url: data.image_url || prev.image_url,
        github_url: data.github_url || prev.github_url,
        live_url: data.live_url || prev.live_url,
      }));
      setShowAiPanel(false);
      setAiPrompt('');
      flash('Project details generated! Review and save.');
    } catch {
      flash('Network error during generation');
    }
    setGenerating(false);
  };

  // Form handlers
  const openNewProject = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setView('editor');
  };

  const openEditProject = (project: PortfolioProject) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      category: project.category || '',
      description: project.description || '',
      image_url: project.image_url || '',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      year: project.year || '',
      tags: project.tags?.join(', ') || '',
      sort_order: project.sort_order || 0,
      visible: project.visible,
    });
    setView('editor');
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      flash('Title is required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const url = editingProject
        ? `${API_BASE}/api/admin/projects/${editingProject.id}`
        : `${API_BASE}/api/admin/projects`;
      const method = editingProject ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) {
        const err = await res.json();
        flash(err.error || 'Failed to save');
        setSaving(false);
        return;
      }
      flash(editingProject ? 'Project updated!' : 'Project created!');
      setView('list');
      fetchProjects();
    } catch {
      flash('Network error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        flash(err.error || 'Failed to delete');
        return;
      }
      flash('Project deleted');
      fetchProjects();
    } catch {
      flash('Failed to delete');
    }
  };

  const handleToggleVisible = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        flash(err.error || 'Failed to toggle visibility');
        return;
      }
      fetchProjects();
    } catch {
      flash('Failed to toggle');
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //                    EDITOR VIEW
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (view === 'editor') {
    return (
      <div>
        {/* Editor header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-mono"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${
                showAiPanel
                  ? 'bg-purple-600 text-white'
                  : 'border border-purple-600/50 text-purple-400 hover:bg-purple-600/10'
              }`}
            >
              <Sparkles size={14} /> AI Fill
            </button>
            <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                className="accent-red-dot w-4 h-4"
              />
              <span className={form.visible ? 'text-green-400' : 'text-gray-500'}>
                {form.visible ? 'Visible' : 'Hidden'}
              </span>
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-red-dot text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* AI Generation Panel */}
        <AnimatePresence>
        {showAiPanel && (
          <motion.div
            key="ai-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-purple-950/20 border border-purple-600/30 rounded-sm p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={16} className="text-purple-400" />
              <span className="text-sm font-mono text-purple-300">AI Portfolio Generator</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Describe the project below. Fill in the image, GitHub & live URLs first â€” the AI will use them as context and auto-fill title, category, description, and tags.
            </p>

            {/* Pre-fill links before AI generation */}
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div className="flex items-center gap-2 bg-gray-50/50 border border-purple-800/20 rounded-lg px-3 py-2">
                <Image size={14} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="bg-transparent text-gray-900 text-xs w-full focus:outline-none placeholder-gray-600"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50/50 border border-purple-800/20 rounded-lg px-3 py-2">
                <Github size={14} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  className="bg-transparent text-gray-900 text-xs w-full focus:outline-none placeholder-gray-600"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50/50 border border-purple-800/20 rounded-lg px-3 py-2">
                <ExternalLink size={14} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Live URL"
                  value={form.live_url}
                  onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                  className="bg-transparent text-gray-900 text-xs w-full focus:outline-none placeholder-gray-600"
                />
              </div>
            </div>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. A SaaS dashboard for logistics built with Next.js and Tailwind. Reduced onboarding time by 60%..."
              className="w-full bg-gray-50/50 border border-purple-800/30 rounded-sm px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              rows={2}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-gray-600 font-mono">Powered by Groq Â· Kimi K2</span>
              <button
                onClick={handleGenerate}
                disabled={generating || !aiPrompt.trim()}
                className="bg-purple-600 text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
                {generating ? 'Generating...' : 'Generate Details'}
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {message && (
          <div className="mb-4 px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-600 font-mono">
            {message}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Project title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-transparent text-3xl md:text-4xl font-display font-bold text-white placeholder-gray-400 focus:outline-none border-b border-gray-200 pb-4"
          />

          <input
            type="text"
            placeholder="Category (e.g. Web Design & Development)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-transparent text-lg text-gray-400 placeholder-gray-400 focus:outline-none border-b border-gray-200 pb-3"
          />

          <textarea
            placeholder="Description â€” results-focused, 1-2 sentences..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors resize-none"
            rows={3}
          />

          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Image URL"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm pl-9 pr-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors"
              />
            </div>
            <div className="relative">
              <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="GitHub URL"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm pl-9 pr-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors"
              />
            </div>
            <div className="relative">
              <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Live URL"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm pl-9 pr-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors"
            />
            <input
              type="text"
              placeholder="Year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors"
            />
            <input
              type="number"
              placeholder="Sort order (0 = first)"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-red-dot transition-colors"
            />
          </div>

          {/* Image preview */}
          {form.image_url && (
            <div className="aspect-[4/3] max-w-md overflow-hidden rounded-sm bg-gray-50 border border-gray-200">
              <img src={form.image_url} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //                    PROJECT LIST VIEW
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <div>
      {/* Actions */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-gray-500 font-mono text-xs">{projects.length} projects</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { openNewProject(); setTimeout(() => setShowAiPanel(true), 100); }}
            className="border border-purple-600/50 text-purple-400 px-4 py-2 rounded-sm text-sm font-medium hover:bg-purple-600/10 transition-colors flex items-center gap-2"
          >
            <Sparkles size={14} /> AI Generate
          </button>
          <button
            onClick={openNewProject}
            className="bg-red-dot text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-600 font-mono">
          {message}
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-dot rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
          <Image size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-sm mb-4">No portfolio projects yet</p>
          <button
            onClick={openNewProject}
            className="text-red-dot hover:underline font-mono text-sm"
          >
            Add your first project â†’
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden flex flex-col sm:flex-row hover:border-gray-300 transition-colors"
            >
              {/* Thumbnail */}
              {project.image_url && (
                <div className="sm:w-40 h-28 sm:h-auto shrink-0 bg-gray-100">
                  <img src={project.image_url} alt={project.title} className="object-cover w-full h-full" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${project.visible ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {project.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                      {project.visible ? 'Visible' : 'Hidden'}
                    </span>
                    <h3 className="font-display font-medium text-gray-900 truncate">{project.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-1">{project.category} Â· {project.year}</p>
                  <div className="flex items-center gap-3">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                        <Github size={13} />
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {project.tags?.length > 0 && (
                      <span className="text-[10px] text-gray-600 font-mono">{project.tags.join(' Â· ')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVisible(project.id)}
                    className={`p-2 rounded-lg border transition-colors ${project.visible ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-gray-300 text-gray-500 hover:text-yellow-600 hover:border-yellow-300'}`}
                    title={project.visible ? 'Hide' : 'Show'}
                  >
                    {project.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => openEditProject(project)}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-white hover:border-gray-900 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
