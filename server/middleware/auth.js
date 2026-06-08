/**
 * API 密钥 & 速率限制中间件
 */
import { getDatabase } from '../db/database.js'

const rateLimitBuckets = new Map()

export async function authMiddleware(req, res, next) {
  const keyStr = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '')
  
  try {
    const db = await getDatabase({ dataDir: process.env.QILING_DATA_DIR })
    
    if (!keyStr) {
      return res.status(401).json({ error: '需要 API 密钥' })
    }
    
    const apiKey = db.validateKey(keyStr)
    if (!apiKey) {
      return res.status(401).json({ error: '无效的 API 密钥' })
    }
    
    const tier = apiKey.tier
    const tierConfig = db.getTierConfig(tier)
    
    // 每日限额检查
    if (apiKey.dailyCount >= tierConfig.dailyLimit && !apiKey.permanent) {
      return res.status(429).json({
        error: '今日额度已用完',
        tier,
        dailyLimit: tierConfig.dailyLimit,
        upgrade: tier === 'free'
      })
    }
    
    // 速率限制检查
    const rateCheck = checkRateLimit(keyStr, tierConfig)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: '请求过于频繁',
        retryAfter: rateCheck.retryAfter,
        rateLimit: rateCheck
      })
    }
    
    req.apiKey = apiKey
    req.tierConfig = tierConfig
    
    next()
  } catch (e) {
    res.status(500).json({ error: '认证失败: ' + e.message })
  }
}

export async function adminMiddleware(req, res, next) {
  const secret = req.headers['x-admin-secret']
  if (!process.env.QILING_ADMIN_SECRET || secret !== process.env.QILING_ADMIN_SECRET) {
    return res.status(403).json({ error: '需要管理员密钥' })
  }
  next()
}

function checkRateLimit(keyStr, tierConfig) {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(keyStr) || { tokens: tierConfig.ratePerSec, lastRefill: now }
  
  // 令牌桶算法
  const elapsed = (now - bucket.lastRefill) / 1000
  bucket.tokens = Math.min(tierConfig.ratePerSec, bucket.tokens + elapsed * tierConfig.ratePerSec)
  bucket.lastRefill = now
  
  if (bucket.tokens < 1) {
    return { allowed: false, retryAfter: Math.ceil((1 - bucket.tokens) / tierConfig.ratePerSec * 1000), tokens: 0 }
  }
  
  bucket.tokens -= 1
  rateLimitBuckets.set(keyStr, bucket)
  
  return { allowed: true, tokens: bucket.tokens, remaining: Math.floor(tierConfig.ratePerSec - bucket.tokens) }
}