/**
 * 向量存储引擎 — 纯 JS 实现，支持 JSON 文件存储 / 内存向量索引
 * 无需编译原生模块，完全跨平台
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class VectorStore {
  constructor(config) {
    this.config = config
    this.dataDir = config.dataDir
    this.dbPath = path.join(this.dataDir, "vectors.json")
    this.embeddingDim = 384
    this.vectors = []
    this.initialized = false
  }

  async initialize() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
    
    if (fs.existsSync(this.dbPath)) {
      try {
        const data = fs.readFileSync(this.dbPath, "utf-8")
        this.vectors = JSON.parse(data)
      } catch {
        this.vectors = []
      }
    }
    
    this.initialized = true
    console.log(`✨ 向量存储就绪 (${this.vectors.length} 条向量)`)
  }

  async save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.vectors, null, 2))
  }

  async add(text, answer, metadata = {}) {
    if (!this.initialized) await this.initialize()
    
    const embedding = await this.getEmbedding(text + " " + answer)
    
    const entry = {
      id: Date.now() + Math.random(),
      text: JSON.stringify({ q: text, a: answer }),
      embedding: Array.from(embedding),
      metadata: metadata || {},
      source: metadata.source || "manual",
      timestamp: metadata.timestamp || Date.now(),
      version: metadata.version || "1.0.0"
    }
    
    this.vectors.push(entry)
    
    // 异步保存，不阻塞
    this.save().catch(() => {})
  }

  async search(query, { limit = 10, threshold = 0.3 } = {}) {
    if (!this.initialized) await this.initialize()
    
    const queryEmbedding = await this.getEmbedding(query)
    
    const results = this.vectors.map(v => {
      const score = this.cosineSimilarity(queryEmbedding, v.embedding)
      return {
        content: JSON.parse(v.text),
        score,
        metadata: v.metadata,
        source: v.source,
        timestamp: v.timestamp,
        version: v.version
      }
    }).filter(r => r.score >= threshold)
    
    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1)
  }

  async getEmbedding(text) {
    // 使用确定性哈希生成向量（模拟嵌入）
    // 生产环境可替换为 ONNX Runtime 运行 BGE-small / all-MiniLM-L6-v2
    const hash = this.simpleHash(text)
    const vec = new Float32Array(this.embeddingDim)
    for (let i = 0; i < this.embeddingDim; i++) {
      vec[i] = Math.sin(hash + i) * 0.5 + Math.cos(hash * 1.3 + i) * 0.5
    }
    return this.normalize(vec)
  }

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return hash
  }

  normalize(vec) {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
    return vec.map(v => v / (norm || 1))
  }

  getCount() {
    return this.vectors.length
  }
}