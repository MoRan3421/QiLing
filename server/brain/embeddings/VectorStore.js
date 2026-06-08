/**
 * 向量存储引擎 — 支持 sqlite-vec / FAISS-CPU / 内存向量索引
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import Database from "better-sqlite3"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class VectorStore {
  constructor(config) {
    this.config = config
    this.dataDir = config.dataDir
    this.dbPath = path.join(this.dataDir, "vectors.db")
    this.embeddingDim = 384
    this.db = null
    this.initialized = false
  }

  async initialize() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
    
    this.db = new Database(this.dbPath)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS vectors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        embedding BLOB NOT NULL,
        metadata TEXT,
        source TEXT,
        timestamp INTEGER,
        version TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_source ON vectors(source);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON vectors(timestamp);
    `)
    
    try {
      this.db.exec("LOAD EXTENSION sqlite-vec")
      this.hasVec = true
    } catch {
      this.hasVec = false
      console.log("⚠️ sqlite-vec 未加载，使用内存向量搜索")
    }
    
    this.initialized = true
  }

  async add(text, answer, metadata = {}) {
    if (!this.initialized) await this.initialize()
    
    const embedding = await this.getEmbedding(text + " " + answer)
    const blob = Buffer.from(new Float32Array(embedding).buffer)
    
    const stmt = this.db.prepare(`
      INSERT INTO vectors (text, embedding, metadata, source, timestamp, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      JSON.stringify({ q: text, a: answer }),
      blob,
      JSON.stringify(metadata),
      metadata.source || "manual",
      metadata.timestamp || Date.now(),
      metadata.version || "1.0.0"
    )
  }

  async search(query, { limit = 10, threshold = 0.3 } = {}) {
    if (!this.initialized) await this.initialize()
    
    const queryEmbedding = await this.getEmbedding(query)
    
    if (this.hasVec) {
      return this.vecSearch(queryEmbedding, limit, threshold)
    }
    
    return this.memorySearch(queryEmbedding, limit, threshold)
  }

  async vecSearch(queryEmbedding, limit, threshold) {
    const rows = this.db.prepare(`
      SELECT text, embedding, metadata, source, timestamp, version,
             vec_distance_cos(embedding, ?) as distance
      FROM vectors
      WHERE vec_distance_cos(embedding, ?) < ?
      ORDER BY distance ASC
      LIMIT ?
    `).all(Buffer.from(new Float32Array(queryEmbedding).buffer), Buffer.from(new Float32Array(queryEmbedding).buffer), 1 - threshold, limit)
    
    return rows.map(r => ({
      content: JSON.parse(r.text),
      score: 1 - r.distance,
      metadata: JSON.parse(r.metadata || "{}"),
      source: r.source,
      timestamp: r.timestamp,
      version: r.version
    }))
  }

  async memorySearch(queryEmbedding, limit, threshold) {
    const rows = this.db.prepare("SELECT * FROM vectors").all()
    
    const results = rows.map(r => {
      const embedding = new Float32Array(r.embedding)
      const score = this.cosineSimilarity(queryEmbedding, embedding)
      return {
        content: JSON.parse(r.text),
        score,
        metadata: JSON.parse(r.metadata || "{}"),
        source: r.source,
        timestamp: r.timestamp,
        version: r.version
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
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async getEmbedding(text) {
    // 使用 ONNX Runtime 运行 BGE-small 或 all-MiniLM-L6-v2
    // 这里返回模拟向量，实际部署时替换为真实模型推理
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
    if (!this.initialized) return 0
    return this.db.prepare("SELECT COUNT(*) as count FROM vectors").get().count
  }
}
