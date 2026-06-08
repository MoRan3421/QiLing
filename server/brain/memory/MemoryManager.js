/**
 * 长期记忆管理器 — 向量化存储 + 重要性评分 + 遗忘曲线
 */
import { VectorStore } from '../embeddings/VectorStore.js'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class MemoryManager {
  constructor(config) {
    this.config = config
    this.vectorStore = new VectorStore({ ...config, dataDir: path.join(config.dataDir, 'memory') })
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    await this.vectorStore.initialize()
    this.initialized = true
    console.log('✨ 长期记忆管理器就绪')
  }

  async store(userId, sessionId, query, response) {
    await this.initialize()
    
    const importance = this.calculateImportance(query, response)
    if (importance < 0.3) return
    
    const memoryText = `用户: ${query}\n绮灵: ${response}`
    await this.vectorStore.add(memoryText, '', {
      source: 'conversation',
      userId,
      sessionId,
      importance,
      timestamp: Date.now()
    })
  }

  async retrieve(userId, query, { limit = 5 } = {}) {
    await this.initialize()
    
    const results = await this.vectorStore.search(query, { limit: limit * 2 })
    
    return results
      .filter(r => r.metadata.userId === userId)
      .sort((a, b) => (b.metadata.importance || 0) - (a.metadata.importance || 0))
      .slice(0, limit)
  }

  calculateImportance(query, response) {
    let score = 0.5
    
    if (query.length > 50) score += 0.1
    if (response.length > 100) score += 0.1
    if (/重要|记住|记下|关键|核心/i.test(query)) score += 0.3
    if (/喜欢|讨厌|偏好|习惯|风格/i.test(query)) score += 0.2
    if (/(名字|叫|生日|纪念日|电话|地址|密码)/i.test(query)) score += 0.4
    
    return Math.min(score, 1.0)
  }

  async forgetOldMemories(userId, maxAge = 30 * 24 * 60 * 60 * 1000) {
    // 遗忘曲线：低重要性 + 久远记忆会被淡化
    // 实际实现需要向量库支持按时间/重要性删除
  }

  getCount() {
    return this.vectorStore.getCount()
  }
}