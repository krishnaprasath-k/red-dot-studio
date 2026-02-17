import { getPool, initDB, verifyToken, generateSlug } from '../../_lib/db.js';

export default async function handler(req, res) {
  const auth = verifyToken(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await initDB();
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT * FROM blog_posts ORDER BY created_at DESC`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  }

  if (req.method === 'POST') {
    const { title, excerpt, content, cover_image, author, tags, published, meta_title, meta_description } = req.body;
    const slug = generateSlug(title);
    try {
      const result = await pool.query(
        `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, tags, published, meta_title, meta_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [title, slug, excerpt, content, cover_image, author || 'Red Dot Studio', tags || [], published || false, meta_title, meta_description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'A blog post with a similar title already exists' });
      }
      return res.status(500).json({ error: 'Failed to create blog post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
