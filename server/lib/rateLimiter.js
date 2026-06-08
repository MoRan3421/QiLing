/**
 * 令牌桶速率限制 — 秒/分/日 + 分钟级恢复（免费版）
 */

export const TIER_LIMITS = {
  free: {
    perSecond: 1,
    perMinute: 8,
    daily: 30,
    bucketMax: 5,
    recoverPerSecond: 0,
    recoverPerMinute: 0.25,       // 每 4 分钟恢复 1 令牌
    recoverIntervalMinutes: 4,
    recoverAmountPerInterval: 1,
    dailyRecoverIntervalMinutes: 60, // 每 60 分钟恢复 5 条日额度
    dailyRecoverAmount: 5,
    permanent: false,
  },
  pro: {
    perSecond: 5,
    perMinute: 60,
    daily: 999999,
    bucketMax: 30,
    recoverPerSecond: 2,
    recoverPerMinute: 0,
    recoverIntervalMinutes: 0,
    recoverAmountPerInterval: 0,
    permanent: true,
  },
  ultra: {
    perSecond: 10,
    perMinute: 120,
    daily: 999999,
    bucketMax: 60,
    recoverPerSecond: 5,
    recoverPerMinute: 0,
    recoverIntervalMinutes: 0,
    recoverAmountPerInterval: 0,
    permanent: true,
  },
  admin: {
    perSecond: 100,
    perMinute: 1000,
    daily: 999999,
    bucketMax: 200,
    recoverPerSecond: 50,
    recoverPerMinute: 0,
    recoverIntervalMinutes: 0,
    recoverAmountPerInterval: 0,
    permanent: true,
  },
}

const buckets = new Map()
const minuteWindows = new Map()
const secondWindows = new Map()
const dailyBonus = new Map()

function getRecoverRate(limits) {
  if (limits.recoverPerSecond > 0) return limits.recoverPerSecond
  if (limits.recoverPerMinute > 0) return limits.recoverPerMinute / 60
  return 0
}

function getBucket(keyId, tier) {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free
  if (!buckets.has(keyId)) {
    buckets.set(keyId, { tokens: limits.bucketMax, lastRefill: Date.now() })
  }
  return { bucket: buckets.get(keyId), limits }
}

function refillBucket(bucket, limits) {
  const rate = getRecoverRate(limits)
  if (rate <= 0) return
  const now = Date.now()
  const elapsed = (now - bucket.lastRefill) / 1000
  bucket.tokens = Math.min(limits.bucketMax, bucket.tokens + elapsed * rate)
  bucket.lastRefill = now
}

function getNextRecoverSeconds(bucket, limits) {
  if (bucket.tokens >= limits.bucketMax) return 0
  const rate = getRecoverRate(limits)
  if (rate <= 0) return null
  return Math.ceil((1 - (bucket.tokens % 1)) / rate)
}

function checkWindow(map, keyId, windowMs, max) {
  const now = Date.now()
  if (!map.has(keyId)) map.set(keyId, [])
  const window = map.get(keyId).filter((t) => now - t < windowMs)
  map.set(keyId, window)
  if (window.length >= max) {
    const retryAfter = Math.ceil((windowMs - (now - window[0])) / 1000)
    return { ok: false, retryAfter, current: window.length, max }
  }
  window.push(now)
  return { ok: true, current: window.length, max }
}

function buildRecoveryInfo(bucket, limits, tier) {
  const nextSec = getNextRecoverSeconds(bucket, limits)
  const info = {
    recoverPerSecond: limits.recoverPerSecond,
    recoverPerMinute: limits.recoverPerMinute,
    recoverIntervalMinutes: limits.recoverIntervalMinutes,
    recoverAmountPerInterval: limits.recoverAmountPerInterval,
    nextRecoverInSeconds: nextSec,
  }
  if (tier === 'free' && limits.recoverIntervalMinutes) {
    info.recoverLabel = `每 ${limits.recoverIntervalMinutes} 分钟恢复 ${limits.recoverAmountPerInterval} 次`
    if (nextSec) info.recoverLabel += ` · ${Math.ceil(nextSec / 60)} 分钟后+1`
  } else if (limits.recoverPerSecond > 0) {
    info.recoverLabel = `每秒恢复 ${limits.recoverPerSecond} 令牌`
  }
  if (tier === 'free' && limits.dailyRecoverIntervalMinutes) {
    info.dailyRecoverLabel = `每 ${limits.dailyRecoverIntervalMinutes} 分钟恢复 ${limits.dailyRecoverAmount} 条日额度`
  }
  return info
}

export function consumeRateLimit(keyId, tier) {
  const { bucket, limits } = getBucket(keyId, tier)
  refillBucket(bucket, limits)

  const secCheck = checkWindow(secondWindows, keyId, 1000, limits.perSecond)
  if (!secCheck.ok) {
    return {
      allowed: false,
      reason: 'second_limit',
      message: `每秒最多 ${limits.perSecond} 次，${secCheck.retryAfter} 秒后恢复`,
      retryAfter: secCheck.retryAfter,
      limits,
      tokens: Math.floor(bucket.tokens),
      recovery: buildRecoveryInfo(bucket, limits, tier),
    }
  }

  const minCheck = checkWindow(minuteWindows, keyId, 60000, limits.perMinute)
  if (!minCheck.ok) {
    return {
      allowed: false,
      reason: 'minute_limit',
      message: `每分钟最多 ${limits.perMinute} 次，${Math.ceil(minCheck.retryAfter / 60)} 分钟后恢复`,
      retryAfter: minCheck.retryAfter,
      limits,
      tokens: Math.floor(bucket.tokens),
      recovery: buildRecoveryInfo(bucket, limits, tier),
    }
  }

  if (bucket.tokens < 1) {
    const waitSec = getNextRecoverSeconds(bucket, limits) || 60
    const waitMin = Math.ceil(waitSec / 60)
    return {
      allowed: false,
      reason: 'token_empty',
      message: tier === 'free'
        ? `免费额度用尽，约 ${waitMin} 分钟后恢复 1 次（${limits.recoverIntervalMinutes} 分钟/次）`
        : `令牌不足，${waitSec}s 后恢复`,
      retryAfter: waitSec,
      limits,
      tokens: Math.floor(bucket.tokens),
      recovery: buildRecoveryInfo(bucket, limits, tier),
    }
  }

  bucket.tokens -= 1
  return {
    allowed: true,
    limits,
    tokens: Math.floor(bucket.tokens),
    perSecond: { used: secCheck.current, max: limits.perSecond },
    perMinute: { used: minCheck.current, max: limits.perMinute },
    recovery: buildRecoveryInfo(bucket, limits, tier),
    permanent: limits.permanent,
  }
}

export function getRateLimitStatus(keyId, tier) {
  const { bucket, limits } = getBucket(keyId, tier)
  refillBucket(bucket, limits)
  const now = Date.now()
  const secUsed = (secondWindows.get(keyId) || []).filter((t) => now - t < 1000).length
  const minUsed = (minuteWindows.get(keyId) || []).filter((t) => now - t < 60000).length
  const recovery = buildRecoveryInfo(bucket, limits, tier)

  return {
    tier,
    permanent: limits.permanent,
    tokens: Math.floor(bucket.tokens),
    bucketMax: limits.bucketMax,
    perSecond: { used: secUsed, max: limits.perSecond, remaining: limits.perSecond - secUsed },
    perMinute: { used: minUsed, max: limits.perMinute, remaining: limits.perMinute - minUsed },
    daily: limits.daily,
    ...recovery,
  }
}
