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
    console.log('✓ Database table ready');
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
