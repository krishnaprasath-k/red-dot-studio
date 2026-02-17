import { getPool, verifyToken } from '../../_lib/db.js';

export default async function handler(req, res) {
  const auth = verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const pool = getPool();

  // PUT: update project
  if (req.method === 'PUT') {
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
        [title, category, description, image_url, github_url, live_url, year, tags, sort_order, visible, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }

  // DELETE: remove project
  if (req.method === 'DELETE') {
    try {
      const result = await pool.query(
        `DELETE FROM portfolio_projects WHERE id = $1 RETURNING id`,
        [id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
