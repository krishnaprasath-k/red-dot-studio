import { getPool, initDB, verifyToken, generateSlug } from '../../_lib/db.js';

export default async function handler(req, res) {
  const auth = verifyToken(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  await initDB();
  const pool = getPool();

  if (req.method === 'PUT') {
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
        [title, slug, excerpt, content, cover_image, author, tags, published, meta_title, meta_description, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      return res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await pool.query(
        `DELETE FROM blog_posts WHERE id = $1 RETURNING id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const result = await pool.query(
        `UPDATE blog_posts SET published = NOT published, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      return res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to toggle publish status' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
