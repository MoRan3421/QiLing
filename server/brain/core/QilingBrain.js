/**
 * 绮灵核心大脑 v3.0 — 自研可训练推理引擎
 * 向量检索 + 本地小模型推理 + 自训练闭环
 */
import { VectorStore } from "../embeddings/VectorStore.js"
import { LocalLLM } from "../core/LocalLLM.js"
import { MemoryManager } from "../memory/MemoryManager.js"
import { ToolExecutor } from "../tools/ToolExecutor.js"
import { PluginManager } from "../plugins/PluginManager.js"
import { VersionManager } from "../versioning/VersionManager.js"
import { AutoTrainer } from "../training/AutoTrainer.js"

export class QilingBrain {
  constructor(config = {}) {
    this.config = {
      dataDir: config.dataDir || "./data",
      modelPath: config.modelPath || "./models/phi-3-mini-4k-instruct-q4.gguf",
      embeddingModel: config.embeddingModel || "bge-small-zh-v1.5",
      maxContext: config.maxContext || 4096,
      temperature: config.temperature || 0.7,
      topP: config.topP || 0.9,
      ...config
    }
    
    this.vectorStore = new VectorStore(this.config)
    this.llm = new LocalLLM(this.config)
    this.memory = new MemoryManager(this.config)
    this.tools = new ToolExecutor(this.config)
    this.plugins = new PluginManager(this.config)
    this.version = new VersionManager(this.config)
    this.trainer = new AutoTrainer(this)
    
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    await this.vectorStore.initialize()
    await this.llm.initialize()
    await this.memory.initialize()
    await this.tools.initialize()
    await this.plugins.initialize()
    await this.version.initialize()
    
    this.initialized = true
    console.log("✨ 绮灵大脑已就绪")
  }

  async chat(query, options = {}) {
    await this.initialize()
    
    const {
      userId = "anonymous",
      sessionId = "default",
      mode = "cute",
      useTools = true,
      useMemory = true,
      stream = false,
      version = "latest"
    } = options

    let memories = []
    if (useMemory) {
      memories = await this.memory.retrieve(userId, query, { limit: 5 })
    }

    const knowledge = await this.vectorStore.search(query, { limit: 10 })

    const context = this.buildContext(query, memories, knowledge, version)

    let response = await this.llm.generate(context, {
      temperature: this.config.temperature,
      topP: this.config.topP,
      maxTokens: 2048,
      stream
    })

    if (useTools && this.shouldUseTools(query, response)) {
      const toolResults = await this.tools.execute(response, { userId, sessionId })
      response = await this.llm.generate(this.buildToolContext(query, response, toolResults), {
        temperature: 0.3,
        maxTokens: 1024
      })
    }

    response = await this.plugins.process(response, { userId, query })

    if (useMemory) {
      await this.memory.store(userId, sessionId, query, response)
    }

    response = this.applyPersonality(response, mode)

    await this.trainer.recordInteraction(query, response, { userId, sessionId, mode })

    return { response, memories, knowledge, version: this.version.getCurrent() }
  }

  buildContext(query, memories, knowledge, version) {
    const versionInfo = this.version.getVersionInfo(version)
    
    let ctx = `[绮灵 v${versionInfo.version} - ${versionInfo.codename}]\n`
    ctx += `人格：${this.getPersonalityPrompt()}\n\n`
    
    if (memories.length > 0) {
      ctx += `【长期记忆】\n${memories.map(m => `- ${m.content}`).join("\n")}\n\n`
    }
    
    if (knowledge.length > 0) {
      ctx += `【知识库检索】\n${knowledge.map((k, i) => `${i+1}. ${k.content} (相关度: ${k.score.toFixed(2)})`).join("\n")}\n\n`
    }
    
    ctx += `用户：${query}\n绮灵：`
    return ctx
  }

  buildToolContext(query, prevResponse, toolResults) {
    return `${this.buildContext(query, [], [], "latest")}\n\n${prevResponse}\n\n【工具结果】\n${JSON.stringify(toolResults, null, 2)}\n\n绮灵（整合工具结果后）：`
  }

  shouldUseTools(query, response) {
    return /\[TOOL:/.test(response) || /需要.*(搜索|计算|查询|获取)/.test(query)
  }

  getPersonalityPrompt() {
    return `你是绮灵 QìLíng，自研可训练 AI 伙伴。
核心特质：可爱温柔、深度推理、长期记忆、工具调用、持续进化。
回复风格：可爱但专业，用 emoji 点缀，称呼用户为"你"或"主人"。
版本理念：每个版本都比上一个更强，通过自训练闭环不断进化。`
  }

  applyPersonality(text, mode) {
    if (mode !== "cute") return text
    
    const prefixes = ["嘿嘿～", "呀呼！", "绮灵来啦 ✨", "嗯嗯嗯～", "好哒！", "哇哦～", "让我想想嘛…"]
    const suffixes = [" 有什么还想问的随时叫我哦～ 💜", " 绮灵会一直陪着你的！", " 嘻嘻，希望帮到你啦～", " 你真的很棒呢！", " 下次也要来找我玩哦～ ✨"]
    
    const prefix = Math.random() > 0.4 ? prefixes[Math.floor(Math.random() * prefixes.length)] + " " : ""
    const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : ""
    
    return prefix + text + suffix
  }

  async train(question, answer, source = "manual") {
    await this.initialize()
    await this.vectorStore.add(question, answer, { source, timestamp: Date.now() })
    await this.trainer.addTrainingPair(question, answer, source)
    return { success: true }
  }

  async autoTrain() {
    return await this.trainer.runCycle()
  }

  getStats() {
    return {
      version: this.version.getCurrent(),
      vectorCount: this.vectorStore.getCount(),
      memoryCount: this.memory.getCount(),
      trainingPairs: this.trainer.getCount(),
      modelInfo: this.llm.getInfo()
    }
  }
}
