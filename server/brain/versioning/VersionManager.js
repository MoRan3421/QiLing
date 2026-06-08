/**
 * 版本管理系统 — 语义化版本 + 能力矩阵 + 进化追踪
 * 每个版本都记录能力基线，版本递进代表能力增强
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VERSION_HISTORY = [
  {
    version: '1.0.0',
    codename: '绮灵初醒 QìLíng Awakening',
    date: '2024-03-01',
    capabilities: ['基础对话', 'TF-IDF检索', '人工训练'],
    benchmark: { accuracy: 0.45, relevance: 0.40, recall: 0.35 }
  },
  {
    version: '2.0.0',
    codename: '灵络扩展 Spirit Network',
    date: '2024-06-01',
    capabilities: ['向量检索', 'API密钥系统', '速率限制', 'Discord接入', '多轮对话'],
    benchmark: { accuracy: 0.55, relevance: 0.50, recall: 0.48 }
  },
  {
    version: '3.0.0',
    codename: '星识觉醒 Star Knowledge',
    date: '2025-01-01',
    capabilities: ['语义嵌入检索', '本地模型推理', '长期记忆', '工具调用', '插件系统', '自动化训练'],
    benchmark: { accuracy: 0.68, relevance: 0.62, recall: 0.60 }
  },
  {
    version: '4.0.0',
    codename: '智链永续 Wisdom Chain',
    date: '2025-06-01',
    capabilities: ['深度链式推理', '多模态理解', '知识图谱', '自适应学习', '自我修正', '联邦蒸馏'],
    benchmark: { accuracy: 0.78, relevance: 0.72, recall: 0.70 }
  },
  {
    version: '5.0.0',
    codename: '绮灵天成 QìLíng Ascended',
    date: '2026-01-01',
    capabilities: ['自监督学习', '因果推理', '元学习', '跨模态生成', '分布式集群', '自主学习策略'],
    benchmark: { accuracy: 0.85, relevance: 0.82, recall: 0.80 }
  }
]

export class VersionManager {
  constructor(config) {
    this.config = config
    this.currentVersion = null
    this.versionFile = path.join(config.dataDir || './data', 'version.json')
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true })
    }
    
    if (fs.existsSync(this.versionFile)) {
      this.currentVersion = JSON.parse(fs.readFileSync(this.versionFile, 'utf-8'))
    } else {
      this.currentVersion = { ...VERSION_HISTORY[2], iteration: 0, trainingCycles: 0 }
      this.saveVersion()
    }
    
    this.initialized = true
    console.log('✨ 版本系统就绪 — v' + this.currentVersion.version + '「' + this.currentVersion.codename + '」')
  }

  getCurrent() {
    return { ...this.currentVersion }
  }

  getVersionInfo(versionQuery) {
    if (versionQuery === 'latest') return this.currentVersion
    
    const v = VERSION_HISTORY.find(v => v.version === versionQuery)
    return v || this.currentVersion
  }

  getAllVersions() {
    return VERSION_HISTORY.map(v => ({
      ...v,
      isCurrent: v.version === this.currentVersion.version
    }))
  }

  async upgrade(newCapabilities = []) {
    const [major, minor, patch] = this.currentVersion.version.split('.').map(Number)
    
    if (newCapabilities.length > 3) {
      this.currentVersion.version = (major + 1) + '.0.0'
      this.currentVersion.codename = this.getNextCodename(major + 1)
    } else if (newCapabilities.length > 0) {
      this.currentVersion.version = major + '.' + (minor + 1) + '.0'
    } else {
      this.currentVersion.version = major + '.' + minor + '.' + (patch + 1)
    }
    
    this.currentVersion.capabilities.push(...newCapabilities)
    this.currentVersion.date = new Date().toISOString().split('T')[0]
    this.currentVersion.iteration++
    
    this.saveVersion()
    return this.getCurrent()
  }

  getNextCodename(major) {
    const names = {
      1: '绮灵初醒', 2: '灵络扩展', 3: '星识觉醒',
      4: '智链永续', 5: '绮灵天成', 6: '超智涌现',
      7: '意识觉醒', 8: '灵境融合', 9: '奇点临近', 10: '绮灵无限'
    }
    return (names[major] || '未知进化') + ' QìLíng'
  }

  recordTrainingCycle(results) {
    this.currentVersion.trainingCycles++
    this.currentVersion.lastTraining = new Date().toISOString()
    this.currentVersion.lastBenchmark = results
    
    this.saveVersion()
  }

  saveVersion() {
    fs.writeFileSync(this.versionFile, JSON.stringify(this.currentVersion, null, 2))
  }
}