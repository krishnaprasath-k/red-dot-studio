import { getPool, ensurePortfolioTable } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensurePortfolioTable();
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM portfolio_projects WHERE visible = true ORDER BY sort_order ASC, created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}
