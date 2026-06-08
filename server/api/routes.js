/**
 * API 路由 — 聊天/训练/版本/密钥/统计/管理
 */
import { Router } from 'express'
import { QilingBrain } from '../brain/core/QilingBrain.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { getDatabase } from '../db/database.js'

export function createRouter(brain, config = {}) {
  const router = Router()
  const dbPromise = getDatabase(config)
  
  // 健康检查
  router.get('/health', async (req, res) => {
    const db = await dbPromise
    res.json({
      status: 'ok',
      engine: '绮灵 Brain v3.0',
      version: brain.getStats().version,
      uptime: process.uptime()
    })
  })
  
  // ── API 密钥 ──
  router.post('/keys/register', async (req, res) => {
    const { label, inviteCode } = req.body || {}
    const db = await dbPromise
    const config = db.getTierConfig
    
    let tier = 'free'
    if (inviteCode === process.env.QILING_PRO_INVITE) tier = 'pro'
    if (inviteCode === process.env.QILING_ULTRA_INVITE) tier = 'ultra'
    
    const result = db.generateKey(label || '用户', tier)
    res.json({
      message: tier === 'free' ? '免费密钥已创建' : tier.toUpperCase() + ' 密钥已创建',
      ...result,
      tierConfig: db.getTierConfig(tier)
    })
  })
  
  router.get('/keys', authMiddleware, async (req, res) => {
    const db = await dbPromise
    res.json({
      key: req.apiKey,
      tierConfig: req.tierConfig,
      keys: req.apiKey.tier === 'admin' ? db.listKeys() : undefined
    })
  })
  
  router.post('/keys/create', adminMiddleware, async (req, res) => {
    const { label, tier, permanent } = req.body || {}
    const db = await dbPromise
    const result = db.generateKey(label || '管理创建', tier || 'pro', { permanent })
    res.json({ ...result, tierConfig: db.getTierConfig(result.tier) })
  })
  
  router.delete('/keys/:id', adminMiddleware, async (req, res) => {
    const db = await dbPromise
    db.revokeKey(req.params.id)
    res.json({ ok: true })
  })
  
  // ── 聊天 ──
  router.post('/chat', authMiddleware, async (req, res) => {
    const { message, mode = 'cute', useTools = true, useMemory = true } = req.body
    if (!message?.trim()) return res.status(400).json({ error: '消息不能为空' })
    
    const db = await dbPromise
    db.incrementUsage(req.apiKey.id)
    
    const stream = req.headers.accept === 'text/event-stream'
    
    try {
      const result = await brain.chat(message, {
        userId: req.apiKey.id,
        mode,
        useTools: useTools && req.apiKey.tier !== 'free',
        useMemory: req.apiKey.tier !== 'free',
        stream
      })
      
      res.json({
        response: result.response,
        version: result.version,
        matches: result.knowledge?.slice(0, 3) || []
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  
  router.post('/chat/stream', authMiddleware, async (req, res) => {
    const { message, mode = 'cute' } = req.body
    if (!message?.trim()) return res.status(400).json({ error: '消息不能为空' })
    
    const db = await dbPromise
    db.incrementUsage(req.apiKey.id)
    
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    try {
      const result = await brain.chat(message, {
        userId: req.apiKey.id,
        mode,
        useTools: req.apiKey.tier !== 'free',
        useMemory: req.apiKey.tier !== 'free'
      })
      
      const text = result.response
      for (let i = 0; i < text.length; i++) {
        res.write('data: ' + JSON.stringify({ content: text.slice(0, i + 1) }) + '\n\n')
        await new Promise(r => setTimeout(r, 8 + Math.random() * 10))
      }
      res.write('data: ' + JSON.stringify({ done: true }) + '\n\n')
    } catch (e) {
      res.write('data: ' + JSON.stringify({ error: e.message }) + '\n\n')
    }
    res.end()
  })
  
  // ── 训练 ──
  router.get('/train/knowledge', authMiddleware, async (req, res) => {
    const knowledge = brain.vectorStore.getCount()
    res.json({ knowledge, stats: brain.getStats() })
  })
  
  router.post('/train', authMiddleware, async (req, res) => {
    const { question, answer } = req.body || {}
    try {
      await brain.train(question, answer)
      res.json({ ok: true, total: brain.vectorStore.getCount() })
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })
  
  // ── 反馈 ──
  router.post('/feedback', authMiddleware, async (req, res) => {
    const { question, answer, rating, messageId } = req.body || {}
    if (rating > 0 && question) {
      await brain.train(question, answer, 'feedback')
    }
    res.json({ ok: true })
  })
  
  // ── 版本 ──
  router.get('/version', (req, res) => {
    res.json(brain.version.getAllVersions())
  })
  
  router.get('/version/current', (req, res) => {
    res.json(brain.version.getCurrent())
  })
  
  // ── 自动训练触发 ──
  router.post('/train/auto', adminMiddleware, async (req, res) => {
    const result = await brain.autoTrain()
    res.json(result)
  })
  
  // ── 工具 ──
  router.get('/tools', (req, res) => {
    res.json({ tools: brain.tools.listTools() })
  })
  
  // ── 插件 ──
  router.get('/plugins', (req, res) => {
    res.json({ plugins: brain.plugins.listPlugins() })
  })
  
  // ── 统计 ──
  router.get('/stats', (req, res) => {
    res.json({
      ...brain.getStats(),
      uptime: process.uptime()
    })
  })
  
  return router
}