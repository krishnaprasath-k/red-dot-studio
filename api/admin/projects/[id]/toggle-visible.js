import { getPool, verifyToken } from '../../../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const pool = getPool();

  try {
    const result = await pool.query(
      `UPDATE portfolio_projects SET visible = NOT visible, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to toggle visibility' });
  }
}
