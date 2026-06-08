/**
 * 自动化训练闭环 — 对话挖掘 → 不确定性采样 → 自我修正 → 蒸馏 → 评测
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class AutoTrainer {
  constructor(brain) {
    this.brain = brain
    this.config = brain.config
    this.trainingDir = path.join(this.config.dataDir || './data', 'training')
    this.conversationsDir = path.join(this.trainingDir, 'conversations')
    this.pairsDir = path.join(this.trainingDir, 'pairs')
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    for (const dir of [this.trainingDir, this.conversationsDir, this.pairsDir]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    }
    
    this.initialized = true
    console.log('✨ 自动训练系统就绪')
  }

  async recordInteraction(query, response, context) {
    await this.initialize()
    
    const today = new Date().toISOString().split('T')[0]
    const dayFile = path.join(this.conversationsDir, today + '.jsonl')
    
    const entry = {
      query,
      response: response.response || response,
      context,
      timestamp: Date.now(),
      quality: this.estimateQuality(query, response)
    }
    
    fs.appendFileSync(dayFile, JSON.stringify(entry) + '\n')
  }

  async addTrainingPair(question, answer, source) {
    await this.initialize()
    
    const pair = {
      question: question.trim(),
      answer: answer.trim(),
      source,
      timestamp: Date.now(),
      quality: this.estimateQuality(question, answer)
    }
    
    const pairsFile = path.join(this.pairsDir, 'training-pairs.jsonl')
    fs.appendFileSync(pairsFile, JSON.stringify(pair) + '\n')
  }

  async runCycle() {
    await this.initialize()
    
    console.log('🔄 开始自动训练循环...')
    
    const conversations = this.loadRecentConversations()
    console.log('📊 加载 ' + conversations.length + ' 条对话记录')
    
    const pairs = this.extractTrainingPairs(conversations)
    console.log('🎯 提取 ' + pairs.length + ' 个训练对')
    
    const filtered = this.filterLowQuality(pairs)
    console.log('✅ 过滤后 ' + filtered.length + ' 个高质量对')
    
    const deduped = this.deduplicate(filtered)
    console.log('🔍 去重后 ' + deduped.length + ' 个新训练对')
    
    let added = 0
    for (const pair of deduped) {
      await this.brain.vectorStore.add(
        pair.question,
        pair.answer,
        { source: 'auto_train', confidence: pair.quality, timestamp: Date.now() }
      )
      added++
    }
    
    const evaluation = await this.evaluate()
    this.brain.version.recordTrainingCycle(evaluation)
    
    console.log('🎉 训练循环完成 — 新增 ' + added + ' 条知识')
    
    return {
      processed: conversations.length,
      extracted: pairs.length,
      filtered: filtered.length,
      deduped: deduped.length,
      added,
      evaluation
    }
  }

  loadRecentConversations(days = 7) {
    const conversations = []
    const now = Date.now()
    
    if (!fs.existsSync(this.conversationsDir)) return conversations
    
    const files = fs.readdirSync(this.conversationsDir).sort().reverse().slice(0, days)
    
    for (const file of files) {
      const filePath = path.join(this.conversationsDir, file)
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean)
      
      for (const line of lines) {
        try {
          conversations.push(JSON.parse(line))
        } catch {}
      }
    }
    
    return conversations
  }

  extractTrainingPairs(conversations) {
    const pairs = []
    
    for (const conv of conversations) {
      const q = (conv.query || '').trim()
      const r = ((conv.response || '') + '').trim()
      
      if (q.length < 5 || r.length < 10) continue
      if (/对不起|我不懂|无法回答|error/i.test(r)) continue
      
      pairs.push({
        question: q,
        answer: r,
        quality: conv.quality || 0.5
      })
    }
    
    return pairs
  }

  filterLowQuality(pairs) {
    return pairs.filter(p => p.quality >= 0.4)
  }

  deduplicate(pairs) {
    const existing = new Set()
    
    const trainingPairsFile = path.join(this.pairsDir, 'training-pairs.jsonl')
    if (fs.existsSync(trainingPairsFile)) {
      const lines = fs.readFileSync(trainingPairsFile, 'utf-8').split('\n').filter(Boolean)
      for (const line of lines) {
        try {
          const p = JSON.parse(line)
          existing.add(p.question.toLowerCase().trim())
        } catch {}
      }
    }
    
    const brainKnowledge = this.brain.vectorStore
    // 简化去重：只基于问题去重
    
    return pairs.filter(p => {
      const key = p.question.toLowerCase().slice(0, 50)
      if (existing.has(key)) return false
      existing.add(key)
      return true
    })
  }

  estimateQuality(query, response) {
    let score = 0.5
    
    if (response.length > 30) score += 0.1
    if (response.length > 100) score += 0.1
    if (/谢谢|感谢|棒|好|厉害|准确|有用|helpful|great|good/i.test(response)) score += 0.1
    if (/\?\?\?|不知道|随便/i.test(response)) score -= 0.2
    if (/绮灵|我|你|我们/i.test(response)) score += 0.05
    
    return Math.max(0, Math.min(1, score))
  }

  async evaluate() {
    const evalQuestions = [
      { q: '你是谁', expected: ['绮灵', 'QìLíng', 'AI'] },
      { q: '你会做什么', expected: ['帮助', '回答', '聊天', '训练'] },
      { q: '1+1等于多少', expected: ['2'] },
      { q: '怎么训练你', expected: ['训练', '教导', '知识'] }
    ]
    
    let correct = 0
    let total = 0
    
    for (const item of evalQuestions) {
      total++
      const result = await this.brain.llm.generate('用户：' + item.q + '\n绮灵：')
      
      if (item.expected.some(kw => result.includes(kw))) {
        correct++
      }
    }
    
    return { accuracy: correct / total, total, correct, date: new Date().toISOString() }
  }

  getCount() {
    const file = path.join(this.pairsDir, 'training-pairs.jsonl')
    if (!fs.existsSync(file)) return 0
    return fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean).length
  }
}