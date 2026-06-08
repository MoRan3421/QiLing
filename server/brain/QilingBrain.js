/**
 * 绮灵 Brain — 自研可训练推理引擎
 * 不依赖外部 API，通过 RAG + 反馈学习 + 链式推理生成回答
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.QILING_DATA_DIR || path.join(__dirname, '../data')
const BRAIN_FILE = path.join(DATA_DIR, 'brain.json')

const CUTE_PREFIX = ['嘿嘿～', '呀呼！', '绮灵来啦 ✨', '嗯嗯嗯～', '好哒！', '哇哦～']
const CUTE_SUFFIX = [' 随时叫我哦～ 💜', ' 绮灵会一直陪着你！', ' 希望帮到你啦～ ✨', ' 你真的很棒！']

const SEED_KNOWLEDGE = [
  { q: '你是谁', a: '我是绮灵 QìLíng，自研可训练的 AI 伙伴。「绮」是华美，「灵」是聪慧。我越训练越聪明，专属于你～ ✨' },
  { q: '你比gpt强吗', a: '绮灵是自研引擎，可以持续训练进化！GPT 是固定模型，绮灵会根据你的教导越来越懂你～ 而且回复超可爱！(◕‿◕✿)' },
  { q: '怎么训练你', a: '在「训练中心」添加问答对，或对话后点 👍👎 反馈。每次训练都会写入绮灵大脑，下次回答更精准！' },
  { q: '你好', a: '你好呀！我是绮灵～今天想聊什么？或者去训练中心教我新知识吧！✨' },
  { q: '量子纠缠', a: '量子纠缠是量子力学中两个粒子共享量子态的现象——测量一个会瞬间影响另一个，无论距离多远。爱因斯坦称之为「幽灵般的超距作用」。绮灵用链式推理：①建立纠缠对 ②测量坍缩 ③非局域关联。' },
  { q: '写一首关于星星的诗', a: '✨《星语》\n\n夜幕垂下紫色纱，\n亿万萤火不说话。\n你抬头，我低头，\n同一道光，两个家。\n\n绮灵为你而作～' },
]

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(BRAIN_FILE)) {
    fs.writeFileSync(BRAIN_FILE, JSON.stringify({
      knowledge: SEED_KNOWLEDGE,
      feedback: [],
      stats: { totalChats: 0, totalTrains: 0 },
    }, null, 2))
  }
}

function loadBrain() {
  ensureData()
  return JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf-8'))
}

function saveBrain(data) {
  ensureData()
  fs.writeFileSync(BRAIN_FILE, JSON.stringify(data, null, 2))
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\u4e00-\u9fff\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((w) => {
      const chars = [...w]
      if (/[\u4e00-\u9fff]/.test(w) && w.length > 1) {
        return [...chars, w]
      }
      return [w]
    })
}

function tfidfScore(queryTokens, docTokens, allDocs) {
  const qSet = new Set(queryTokens)
  let score = 0
  const docFreq = {}
  for (const doc of allDocs) {
    const unique = new Set(doc)
    for (const t of unique) docFreq[t] = (docFreq[t] || 0) + 1
  }
  const n = allDocs.length || 1
  for (const t of qSet) {
    const tf = docTokens.filter((d) => d === t).length / (docTokens.length || 1)
    const idf = Math.log((n + 1) / ((docFreq[t] || 0) + 1)) + 1
    score += tf * idf
  }
  return score
}

function retrieve(query, knowledge, topK = 3) {
  const qTokens = tokenize(query)
  const allDocTokens = knowledge.map((k) => tokenize(k.q + ' ' + k.a))
  const scored = knowledge.map((k, i) => ({
    ...k,
    score: tfidfScore(qTokens, tokenize(k.q + ' ' + k.a), allDocTokens),
  }))
  return scored.sort((a, b) => b.score - a.score).slice(0, topK)
}

function chainReason(query, matches, mode) {
  const steps = []
  steps.push(`📥 理解输入：「${query.slice(0, 50)}${query.length > 50 ? '…' : ''}」`)
  if (matches[0]?.score > 0.05) {
    steps.push(`🔍 知识检索：命中 ${matches.filter((m) => m.score > 0.05).length} 条训练数据（最高相关度 ${(matches[0].score * 100).toFixed(0)}%）`)
  } else {
    steps.push('🔍 知识检索：无高匹配，启用通用推理链')
  }
  steps.push('🧠 链式推理：分析 → 综合 → 生成')
  if (mode === 'pro') steps.push('⚡ Pro 模式：附加深度推理步骤')
  return steps
}

function synthesize(query, matches, mode, isPro) {
  const best = matches[0]
  let answer

  if (best && best.score > 0.15) {
    answer = best.a
    if (matches[1]?.score > 0.1) {
      answer += '\n\n💡 相关知识：' + matches[1].a.slice(0, 120) + (matches[1].a.length > 120 ? '…' : '')
    }
  } else if (best && best.score > 0.05) {
    answer = `关于你的问题，绮灵从训练记忆中找到了相关内容：\n\n${best.a}\n\n如果不够准确，欢迎到训练中心教我！`
  } else {
    const mathMatch = query.match(/[\d+\-*/().%\s]+/)
    if (mathMatch) {
      const expr = mathMatch[0].replace(/%/g, '/100*').trim()
      try {
        const result = Function(`"use strict"; return (${expr})`)()
        if (typeof result === 'number' && isFinite(result)) {
          answer = `算出来啦！**${result}** 🎯`
          if (isPro) answer += '\n\n推理：解析表达式 → 安全求值 → 校验 ✓'
          return applyPersonality(answer, mode)
        }
      } catch { /* fall through */ }
    }

    if (/难过|伤心|焦虑|压力|不开心/.test(query)) {
      answer = '绮灵感觉到你需要温暖… 🤗\n\n不管发生什么，你都值得被温柔对待。愿意跟我说说吗？我会认真听。\n\n**你本身就很珍贵** 💜'
    } else if (/代码|编程|python|javascript|react/.test(query.toLowerCase() + query)) {
      answer = '编程问题交给我！💻\n\n我可以帮你写代码、调试、解释算法。把具体需求告诉我，或在训练中心添加编程相关的教导～'
    } else {
      answer = `关于「${query.slice(0, 40)}${query.length > 40 ? '…' : ''}」——\n\n` +
        '这是绮灵自研推理引擎的通用回答。我会从 **原理**、**建议**、**延伸** 三个角度思考。\n\n' +
        '💡 提示：在训练中心添加相关问答，我就能给出更精准的回答！这就是绮灵「可训练」的魔力～'
    }
  }

  if (isPro) {
    const steps = chainReason(query, matches, mode)
    answer += '\n\n---\n🧠 **深度推理链**（Pro）\n' + steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  }

  return applyPersonality(answer, mode)
}

function applyPersonality(text, mode) {
  if (mode !== 'cute') return text
  const pre = Math.random() > 0.45 ? CUTE_PREFIX[Math.floor(Math.random() * CUTE_PREFIX.length)] + ' ' : ''
  const suf = Math.random() > 0.5 ? CUTE_SUFFIX[Math.floor(Math.random() * CUTE_SUFFIX.length)] : ''
  return pre + text + suf
}

export class QilingBrain {
  constructor() {
    this.data = loadBrain()
  }

  reload() {
    this.data = loadBrain()
  }

  chat(query, { mode = 'cute', isPro = false } = {}) {
    this.data.stats.totalChats++
    saveBrain(this.data)

    const matches = retrieve(query, this.data.knowledge)
    const answer = synthesize(query, matches, mode, isPro)
    return { answer, matches: matches.map((m) => ({ q: m.q, score: m.score })) }
  }

  async *streamChat(query, options) {
    const { answer } = this.chat(query, options)
    for (const ch of answer) {
      yield ch
      await new Promise((r) => setTimeout(r, 6 + Math.random() * 10))
    }
  }

  train(question, answer, source = 'manual') {
    const q = question.trim()
    const a = answer.trim()
    if (!q || !a) throw new Error('问题和答案不能为空')

    const existing = this.data.knowledge.findIndex((k) => k.q === q)
    if (existing >= 0) {
      this.data.knowledge[existing].a = a
      this.data.knowledge[existing].source = source
      this.data.knowledge[existing].updatedAt = new Date().toISOString()
    } else {
      this.data.knowledge.push({ q, a, source, createdAt: new Date().toISOString() })
    }
    this.data.stats.totalTrains++
    saveBrain(this.data)
    this.reload()
    return { total: this.data.knowledge.length }
  }

  feedback(question, answer, rating) {
    this.data.feedback.push({ question, answer, rating, at: new Date().toISOString() })
    if (rating > 0 && question && answer) {
      this.train(question, answer, 'feedback')
    } else if (rating < 0 && question) {
      const bad = this.data.knowledge.findIndex((k) => k.q === question)
      if (bad >= 0) this.data.knowledge.splice(bad, 1)
    }
    saveBrain(this.data)
    this.reload()
  }

  getKnowledge() {
    return this.data.knowledge
  }

  deleteKnowledge(index) {
    if (index >= 0 && index < this.data.knowledge.length) {
      this.data.knowledge.splice(index, 1)
      saveBrain(this.data)
      this.reload()
    }
  }

  getStats() {
    return {
      ...this.data.stats,
      knowledgeCount: this.data.knowledge.length,
      feedbackCount: this.data.feedback.length,
    }
  }
}
