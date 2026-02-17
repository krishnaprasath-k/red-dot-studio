import { getPool, verifyToken, ensurePortfolioTable } from '../_lib/db.js';

export default async function handler(req, res) {
  const auth = verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  await ensurePortfolioTable();
  const pool = getPool();

  // GET: list all projects
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT * FROM portfolio_projects ORDER BY sort_order ASC, created_at DESC`
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  // POST: create project
  if (req.method === 'POST') {
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
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
