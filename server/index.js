import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3001;

// ── Database ──────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Auth helpers ──────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Initialize Database ───────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image VARCHAR(1000),
        author VARCHAR(200) DEFAULT 'Red Dot Studio',
        tags TEXT[] DEFAULT '{}',
        published BOOLEAN DEFAULT false,
        meta_title VARCHAR(200),
        meta_description VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        category VARCHAR(300),
        description TEXT,
        image_url VARCHAR(1000),
        github_url VARCHAR(1000),
        live_url VARCHAR(1000),
        year VARCHAR(10),
        tags TEXT[] DEFAULT '{}',
        sort_order INT DEFAULT 0,
        visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ Database tables ready');
  } finally {
    client.release();
  }
}

// ── Utility: slug generator ───────────────────────────────
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

// ══════════════════════════════════════════════════════════
//                     PUBLIC ROUTES
// ══════════════════════════════════════════════════════════

// ── Login ─────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

// ── Get all published blog posts ──────────────────────────
app.get('/api/blogs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, cover_image, author, tags, created_at, updated_at
       FROM blog_posts WHERE published = true ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// ── Get single blog post by slug ──────────────────────────
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE slug = $1 AND published = true`,
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// ── SEO: Sitemap.xml ──────────────────────────────────────
app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT slug, updated_at FROM blog_posts WHERE published = true ORDER BY updated_at DESC`
    );
    const baseUrl = req.headers['x-forwarded-host']
      ? `https://${req.headers['x-forwarded-host']}`
      : `${req.protocol}://${req.get('host')}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    for (const post of result.rows) {
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `\n</urlset>`;
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating sitemap');
  }
});

// ── SEO: Blog structured data (JSON-LD) ───────────────────
app.get('/api/blogs/:slug/jsonld', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE slug = $1 AND published = true`,
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    const post = result.rows[0];
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      image: post.cover_image,
      author: {
        '@type': 'Organization',
        name: post.author || 'Red Dot Studio'
      },
      datePublished: post.created_at,
      dateModified: post.updated_at,
      publisher: {
        '@type': 'Organization',
        name: 'Red Dot Studio'
      }
    };
    res.json(jsonLd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate JSON-LD' });
  }
});


// ══════════════════════════════════════════════════════════
//                     ADMIN ROUTES
// ══════════════════════════════════════════════════════════

// ── Get ALL blog posts (including drafts) ─────────────────
app.get('/api/admin/blogs', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blog_posts ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// ── Create blog post ──────────────────────────────────────
app.post('/api/admin/blogs', authMiddleware, async (req, res) => {
  const { title, excerpt, content, cover_image, author, tags, published, meta_title, meta_description } = req.body;
  const slug = generateSlug(title);
  try {
    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, tags, published, meta_title, meta_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, slug, excerpt, content, cover_image, author || 'Red Dot Studio', tags || [], published || false, meta_title, meta_description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A blog post with a similar title already exists' });
    }
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// ── Update blog post ──────────────────────────────────────
app.put('/api/admin/blogs/:id', authMiddleware, async (req, res) => {
  const { title, excerpt, content, cover_image, author, tags, published, meta_title, meta_description } = req.body;
  const slug = title ? generateSlug(title) : undefined;
  try {
    const result = await pool.query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        excerpt = COALESCE($3, excerpt),
        content = COALESCE($4, content),
        cover_image = COALESCE($5, cover_image),
        author = COALESCE($6, author),
        tags = COALESCE($7, tags),
        published = COALESCE($8, published),
        meta_title = COALESCE($9, meta_title),
        meta_description = COALESCE($10, meta_description),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [title, slug, excerpt, content, cover_image, author, tags, published, meta_title, meta_description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// ── Delete blog post ──────────────────────────────────────
app.delete('/api/admin/blogs/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM blog_posts WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// ── Toggle publish status ─────────────────────────────────
app.patch('/api/admin/blogs/:id/toggle-publish', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE blog_posts SET published = NOT published, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle publish status' });
  }
});


// ══════════════════════════════════════════════════════════
//                   PORTFOLIO ROUTES
// ══════════════════════════════════════════════════════════

// ── Public: Get visible portfolio projects ─────────────────
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM portfolio_projects WHERE visible = true ORDER BY sort_order ASC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ── Admin: Get ALL portfolio projects ──────────────────────
app.get('/api/admin/projects', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM portfolio_projects ORDER BY sort_order ASC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ── Admin: Create project ─────────────────────────────────
app.post('/api/admin/projects', authMiddleware, async (req, res) => {
  const { title, category, description, image_url, github_url, live_url, year, tags, sort_order, visible } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO portfolio_projects (title, category, description, image_url, github_url, live_url, year, tags, sort_order, visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, category, description, image_url || '', github_url || '', live_url || '', year || new Date().getFullYear().toString(), tags || [], sort_order || 0, visible !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ── Admin: Update project ─────────────────────────────────
app.put('/api/admin/projects/:id', authMiddleware, async (req, res) => {
  const { title, category, description, image_url, github_url, live_url, year, tags, sort_order, visible } = req.body;
  try {
    const result = await pool.query(
      `UPDATE portfolio_projects SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        image_url = COALESCE($4, image_url),
        github_url = COALESCE($5, github_url),
        live_url = COALESCE($6, live_url),
        year = COALESCE($7, year),
        tags = COALESCE($8, tags),
        sort_order = COALESCE($9, sort_order),
        visible = COALESCE($10, visible),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [title, category, description, image_url, github_url, live_url, year, tags, sort_order, visible, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ── Admin: Delete project ─────────────────────────────────
app.delete('/api/admin/projects/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM portfolio_projects WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ── Admin: Toggle project visibility ──────────────────────
app.patch('/api/admin/projects/:id/toggle-visible', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE portfolio_projects SET visible = NOT visible, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
});

// ── AI Portfolio Generation (Groq) ────────────────────────
async function handleProjectGeneration(req, res) {
  const { prompt, image_url, github_url, live_url } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'Groq API key not configured' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'moonshotai/kimi-k2-instruct-0905',
          messages: [
            {
              role: 'system',
              content: `You are a portfolio copywriter for Red Dot Studio, a strategy-led design studio in Bangalore, India. Given context about a project (optionally with a GitHub repo link and live URL), generate professional portfolio details.

Respond in exactly this format:
TITLE: <project title — short, punchy, brandable>
CATEGORY: <type of work, e.g. "Web Design & Development", "Brand Identity", "Product Design & UI/UX", "E-Commerce & Brand Strategy">
DESCRIPTION: <1-2 sentence impact-focused description with a measurable result or strong value statement>
TAGS: <3-5 comma-separated technology/skill tags>
YEAR: <the year, default to current year if unknown>

Keep it concise, results-oriented, and matching a premium design studio tone.`
            },
            {
              role: 'user',
              content: `Project info: ${prompt}${github_url ? `\nGitHub: ${github_url}` : ''}${live_url ? `\nLive: ${live_url}` : ''}`
            }
          ],
          temperature: 0.5,
          max_completion_tokens: 1024,
          top_p: 1,
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq error:', err);
      return res.status(500).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse the structured output
    let title = '', category = '', description = '', tags = '', year = new Date().getFullYear().toString();
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('TITLE:')) title = trimmed.replace('TITLE:', '').trim();
      else if (trimmed.startsWith('CATEGORY:')) category = trimmed.replace('CATEGORY:', '').trim();
      else if (trimmed.startsWith('DESCRIPTION:')) description = trimmed.replace('DESCRIPTION:', '').trim();
      else if (trimmed.startsWith('TAGS:')) tags = trimmed.replace('TAGS:', '').trim();
      else if (trimmed.startsWith('YEAR:')) year = trimmed.replace('YEAR:', '').trim();
    }

    res.json({
      title: title || 'Untitled Project',
      category,
      description,
      tags,
      year,
      image_url: image_url || '',
      github_url: github_url || '',
      live_url: live_url || '',
    });
  } catch (err) {
    console.error('Groq generation error:', err);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI generation timed out' });
    }
    res.status(500).json({ error: 'Failed to generate project details' });
  }
}
app.post('/api/admin/generate-project', authMiddleware, handleProjectGeneration);

// ── AI Blog Generation (Groq) ─────────────────────────────
app.post('/api/admin/generate', authMiddleware, async (req, res) => {
  // Route to project generation if ?type=project
  if (req.query.type === 'project') {
    return handleProjectGeneration(req, res);
  }
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'Groq API key not configured' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'moonshotai/kimi-k2-instruct-0905',
          messages: [
            {
              role: 'system',
              content: `You are a world-class blog writer for Red Dot Studio, a strategy-led design studio based in Bangalore, India. Write in a confident, professional, clear tone. Use Markdown formatting.

When given a topic, generate a complete blog post with:
1. A compelling title (on the first line, prefixed with TITLE: )
2. A brief excerpt/summary (on the second line, prefixed with EXCERPT: )
3. Suggested tags (on the third line, prefixed with TAGS: comma separated)
4. A suggested cover image search term (on the fourth line, prefixed with COVER: )
5. An SEO meta title (on the fifth line, prefixed with META_TITLE: )
6. An SEO meta description (on the sixth line, prefixed with META_DESC: )
7. Then a blank line followed by the full blog content in Markdown.

The content should be 600-1200 words, insightful, actionable, and relevant to design, branding, web development, or business growth. Use headers (##, ###), bold text, lists, and blockquotes for readability.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 1,
      }),
    });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq error:', err);
      return res.status(500).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse the structured output
    const lines = text.split('\n');
    let title = '', excerpt = '', tags = '', cover = '', metaTitle = '', metaDesc = '', content = '';
    let contentStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('TITLE:')) { title = line.replace('TITLE:', '').trim(); }
      else if (line.startsWith('EXCERPT:')) { excerpt = line.replace('EXCERPT:', '').trim(); }
      else if (line.startsWith('TAGS:')) { tags = line.replace('TAGS:', '').trim(); }
      else if (line.startsWith('COVER:')) { cover = line.replace('COVER:', '').trim(); }
      else if (line.startsWith('META_TITLE:')) { metaTitle = line.replace('META_TITLE:', '').trim(); }
      else if (line.startsWith('META_DESC:')) { metaDesc = line.replace('META_DESC:', '').trim(); contentStartIndex = i + 1; }
      else if (title && !content && line === '') { contentStartIndex = i + 1; }
      else if (contentStartIndex > 0 && i >= contentStartIndex) { content += lines[i] + '\n'; }
    }

    // If parsing failed, use the whole text as content
    if (!content.trim()) {
      content = text;
    }

    // Generate a cover image URL from Unsplash
    const coverImage = cover
      ? `https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop`
      : '';

    res.json({
      title: title || 'Untitled Post',
      excerpt,
      tags,
      cover_image: coverImage,
      meta_title: metaTitle || title,
      meta_description: metaDesc || excerpt,
      content: content.trim(),
    });
  } catch (err) {
    console.error('Groq generation error:', err);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI generation timed out' });
    }
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});


// ── Start Server ──────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🔴 Red Dot Studio API running on http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
