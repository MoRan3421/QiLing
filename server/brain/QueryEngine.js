/**
 * 绮灵资料查询引擎 — 知识库检索 + 结构化数据查询
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.QILING_DATA_DIR || path.join(__dirname, '../data')
const QUERY_FILE = path.join(DATA_DIR, 'query-data.json')

const BUILTIN_DATA = {
  wiki: [
    { title: '绮灵 QìLíng', category: 'AI', content: '绮灵是自研可训练 AI 引擎，支持 RAG、链式推理、Discord 接入。' },
    { title: '量子纠缠', category: '物理', content: '两个粒子共享量子态，测量一个瞬间影响另一个，无论距离。' },
    { title: '令牌桶算法', category: '技术', content: '速率限制算法：以固定速率向桶中添加令牌，请求消耗令牌，桶空则限流。' },
    { title: 'API Key 等级', category: '产品', content: '免费版 1次/秒 10次/分；Pro 5次/秒 永久有效；Ultra 10次/秒 最高配额。' },
  ],
  faq: [
    { q: '怎么获取 Pro', a: '使用管理员发放的邀请码注册，或联系管理员创建永久 Pro Key。' },
    { q: 'Discord 怎么用', a: '在 discord 目录配置 DISCORD_TOKEN 和 QILING_API_KEY，运行 npm start。' },
    { q: '怎么训练', a: '网页训练中心或 POST /api/train 或 Discord /train 命令。' },
  ],
  stats: {
    version: '2.0.0',
    engine: '绮灵 Brain',
    phases: ['Phase1 核心对话', 'Phase2 限流+Discord', 'Phase3 资料查询', 'Phase4 集群+支付'],
  },
}

function loadQueryData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(QUERY_FILE)) {
    fs.writeFileSync(QUERY_FILE, JSON.stringify({ custom: [], datasets: BUILTIN_DATA }, null, 2))
  }
  return JSON.parse(fs.readFileSync(QUERY_FILE, 'utf-8'))
}

function saveQueryData(data) {
  fs.writeFileSync(QUERY_FILE, JSON.stringify(data, null, 2))
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^\u4e00-\u9fff\w]/g, ' ').split(/\s+/).filter(Boolean)
}

function score(query, text) {
  const qTokens = tokenize(query)
  const docTokens = tokenize(text)
  let s = 0
  for (const t of qTokens) {
    if (docTokens.includes(t)) s += 1
    if (text.toLowerCase().includes(t)) s += 0.5
  }
  return s
}

export class QueryEngine {
  constructor(brain) {
    this.brain = brain
    this.data = loadQueryData()
  }

  reload() {
    this.data = loadQueryData()
  }

  search(query, { type = 'all', limit = 5 } = {}) {
    const results = []
    const q = query.trim()
    if (!q) return { results: [], total: 0 }

    if (type === 'all' || type === 'wiki') {
      for (const item of this.data.datasets?.wiki || BUILTIN_DATA.wiki) {
        const s = score(q, item.title + ' ' + item.content)
        if (s > 0) results.push({ type: 'wiki', score: s, ...item })
      }
    }

    if (type === 'all' || type === 'faq') {
      for (const item of this.data.datasets?.faq || BUILTIN_DATA.faq) {
        const s = score(q, item.q + ' ' + item.a)
        if (s > 0) results.push({ type: 'faq', score: s, question: item.q, answer: item.a })
      }
    }

    if (type === 'all' || type === 'knowledge') {
      const knowledge = this.brain?.getKnowledge() || []
      for (const item of knowledge) {
        const s = score(q, item.q + ' ' + item.a)
        if (s > 0) results.push({ type: 'knowledge', score: s, question: item.q, answer: item.a })
      }
    }

    if (type === 'all' || type === 'custom') {
      for (const item of this.data.custom || []) {
        const s = score(q, (item.title || '') + ' ' + (item.content || ''))
        if (s > 0) results.push({ type: 'custom', score: s, ...item })
      }
    }

    results.sort((a, b) => b.score - a.score)
    const top = results.slice(0, limit)

    let summary = ''
    if (top.length > 0) {
      summary = top.map((r, i) => {
        if (r.type === 'faq' || r.type === 'knowledge') return `${i + 1}. **${r.question}**\n${r.answer}`
        return `${i + 1}. **${r.title || r.question}** (${r.category || r.type})\n${r.content || r.answer}`
      }).join('\n\n')
    } else {
      summary = `未找到「${q}」的直接匹配。建议在训练中心添加相关资料，或使用更具体的关键词。`
    }

    return { query: q, results: top, total: results.length, summary }
  }

  addCustomData(title, content, category = '自定义') {
    this.data.custom = this.data.custom || []
    this.data.custom.push({ title, content, category, createdAt: new Date().toISOString() })
    saveQueryData(this.data)
    return { total: this.data.custom.length }
  }

  getDatasets() {
    return {
      wiki: (this.data.datasets?.wiki || []).length,
      faq: (this.data.datasets?.faq || []).length,
      custom: (this.data.custom || []).length,
      knowledge: this.brain?.getKnowledge()?.length || 0,
      version: this.data.datasets?.stats?.version || '2.0.0',
    }
  }

  lookup(type, id) {
    if (type === 'stats') return this.data.datasets?.stats || BUILTIN_DATA.stats
    if (type === 'wiki') return (this.data.datasets?.wiki || BUILTIN_DATA.wiki)[id]
    if (type === 'faq') return (this.data.datasets?.faq || BUILTIN_DATA.faq)[id]
    return null
  }
}
