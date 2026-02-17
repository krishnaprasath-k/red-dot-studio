import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

export function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const token = header.replace('Bearer ', '');
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch {
    return null;
  }
}

export async function initDB() {
  const client = await getPool().connect();
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
  } finally {
    client.release();
  }
}

let _portfolioTableReady = false;
export async function ensurePortfolioTable() {
  if (_portfolioTableReady) return;
  try {
    await getPool().query(`
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
    _portfolioTableReady = true;
  } catch (err) {
    console.error('[db] Failed to ensure portfolio_projects table:', err);
  }
}
