/**
 * 数据库 Schema & 管理器 — SQLite/liblsl
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class Database {
  constructor(config = {}) {
    this.dataDir = config.dataDir || path.join(__dirname, '../data')
    this.dbFile = path.join(this.dataDir, 'qiling.db')
    this.db = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true })
    
    // 使用 JSON 文件数据库（纯 JS，零依赖）
    this.db = new JsonDB(this.dbFile)
    await this.db.initialize()
    
    this.initialized = true
  }

  getDb() {
    return this.db
  }
}

class JsonDB {
  constructor(filePath) {
    this.filePath = filePath
    this.data = {
      apiKeys: [],
      users: [],
      rateLimits: {},
      usageLogs: [],
      config: {}
    }
  }

  async initialize() {
    if (fs.existsSync(this.filePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
      } catch {
        this.save()
      }
    } else {
      this.seed()
      this.save()
    }
  }

  seed() {
    const adminKey = 'QL-' + crypto.randomBytes(16).toString('hex')
    
    this.data.apiKeys = [
      {
        id: 'admin-001',
        key: adminKey,
        prefix: adminKey.slice(0, 12),
        tier: 'admin',
        label: '管理员',
        created: Date.now(),
        dailyCount: 0,
        permanent: true,
        active: true
      }
    ]
    
    this.data.config = {
      tiers: {
        free: { ratePerSec: 1, ratePerMin: 10, dailyLimit: 20, price: 0 },
        pro: { ratePerSec: 5, ratePerMin: 60, dailyLimit: 500, price: 29, permanent: true },
        ultra: { ratePerSec: 10, ratePerMin: 120, dailyLimit: 2000, price: 79, permanent: true },
        enterprise: { ratePerSec: 50, ratePerMin: 500, dailyLimit: 10000, price: 299, permanent: true },
        admin: { ratePerSec: 1000, ratePerMin: 60000, dailyLimit: 999999, price: 0, permanent: true }
      },
      version: '3.0.0',
      updatedAt: Date.now()
    }
  }

  // API Keys
  generateKey(label, tier, options = {}) {
    const raw = 'QL-' + crypto.randomBytes(24).toString('hex')
    const key = {
      id: 'key-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      key: raw,
      prefix: raw.slice(0, 12),
      tier: tier || 'free',
      label: label || '用户',
      created: Date.now(),
      dailyCount: 0,
      permanent: options.permanent || false,
      active: true
    }
    
    this.data.apiKeys.push(key)
    this.save()
    return { key: raw, prefix: key.prefix, id: key.id, tier: key.tier }
  }

  validateKey(rawKey) {
    return this.data.apiKeys.find(k => k.key === rawKey && k.active)
  }

  listKeys() {
    return this.data.apiKeys.map(k => ({
      ...k,
      key: k.prefix + '...' + k.key.slice(-4)
    }))
  }

  revokeKey(id) {
    const key = this.data.apiKeys.find(k => k.id === id)
    if (key) key.active = false
    this.save()
  }

  upgradeKey(id, newTier) {
    const key = this.data.apiKeys.find(k => k.id === id)
    if (key) key.tier = newTier
    this.save()
  }

  incrementUsage(id) {
    const key = this.data.apiKeys.find(k => k.id === id || k.key === id)
    if (key) key.dailyCount++
    this.save()
  }

  getTierConfig(tier) {
    return this.data.config.tiers[tier] || this.data.config.tiers.free
  }

  resetDailyCounts() {
    for (const key of this.data.apiKeys) {
      key.dailyCount = 0
    }
    this.save()
  }

  save() {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
  }
}

let dbInstance = null

export async function getDatabase(config) {
  if (!dbInstance) {
    dbInstance = new Database(config)
    await dbInstance.initialize()
  }
  return dbInstance.getDb()
}

export default Database