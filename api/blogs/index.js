import { getPool, initDB } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDB();
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, cover_image, author, tags, created_at, updated_at
       FROM blog_posts WHERE published = true ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
}
