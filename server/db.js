import Database from 'better-sqlite3'
import { createHash, randomBytes } from 'crypto'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { TIER_LIMITS } from './lib/rateLimiter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.QILING_DATA_DIR || path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'qiling.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL,
    label TEXT DEFAULT '',
    tier TEXT DEFAULT 'free',
    daily_count INTEGER DEFAULT 0,
    last_reset TEXT,
    permanent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    active INTEGER DEFAULT 1
  );
  CREATE INDEX IF NOT EXISTS idx_key_hash ON api_keys(key_hash);
`)

// 迁移：添加 ultra 等级支持
try {
  const cols = db.prepare("PRAGMA table_info(api_keys)").all().map((c) => c.name)
  if (!cols.includes('permanent')) {
    db.exec('ALTER TABLE api_keys ADD COLUMN permanent INTEGER DEFAULT 0')
  }
  if (!cols.includes('expires_at')) {
    db.exec('ALTER TABLE api_keys ADD COLUMN expires_at TEXT')
  }
} catch { /* ignore */ }

function hashKey(key) {
  return createHash('sha256').update(key).digest('hex')
}

export function generateApiKey(label = '', tier = 'free', { permanent = null } = {}) {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free
  const isPermanent = permanent ?? limits.permanent
  const raw = `ql_${tier}_${randomBytes(24).toString('hex')}`
  const id = randomBytes(8).toString('hex')
  const prefix = raw.slice(0, 14) + '...'

  db.prepare(`
    INSERT INTO api_keys (id, key_hash, key_prefix, label, tier, last_reset, permanent, expires_at)
    VALUES (?, ?, ?, ?, ?, date('now'), ?, ?)
  `).run(id, hashKey(raw), prefix, label, tier, isPermanent ? 1 : 0, isPermanent ? null : null)

  return {
    id,
    key: raw,
    prefix,
    tier,
    permanent: isPermanent,
    limits,
  }
}

export function validateApiKey(rawKey) {
  if (!rawKey) return null
  const row = db.prepare('SELECT * FROM api_keys WHERE key_hash = ? AND active = 1')
    .get(hashKey(rawKey))
  if (!row) return null

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return null
  }

  const today = new Date().toISOString().slice(0, 10)
  if (row.last_reset !== today) {
    db.prepare('UPDATE api_keys SET daily_count = 0, last_reset = ? WHERE id = ?')
      .run(today, row.id)
    row.daily_count = 0
  }
  return row
}

export function incrementUsage(id) {
  db.prepare('UPDATE api_keys SET daily_count = daily_count + 1 WHERE id = ?').run(id)
}

export function listKeys() {
  return db.prepare(`
    SELECT id, key_prefix, label, tier, daily_count, permanent, created_at, expires_at, active
    FROM api_keys ORDER BY created_at DESC
  `).all()
}

export function revokeKey(id) {
  db.prepare('UPDATE api_keys SET active = 0 WHERE id = ?').run(id)
}

export function upgradeKey(id, tier) {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free
  db.prepare('UPDATE api_keys SET tier = ?, permanent = ? WHERE id = ?')
    .run(tier, limits.permanent ? 1 : 0, id)
}

export function getDailyLimit(tier) {
  return (TIER_LIMITS[tier] || TIER_LIMITS.free).daily
}

export const LIMITS = Object.fromEntries(
  Object.entries(TIER_LIMITS).map(([k, v]) => [k, v.daily])
)
