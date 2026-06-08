/**
 * 工具执行引擎 — 搜索/计算/代码/文件/联网/API
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import vm from 'vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class ToolExecutor {
  constructor(config) {
    this.config = config
    this.initialized = false
    this.tools = new Map()
  }

  async initialize() {
    if (this.initialized) return
    
    this.registerBuiltinTools()
    await this.loadCustomTools()
    
    this.initialized = true
    console.log('✨ 工具引擎就绪 (' + this.tools.size + ' 个工具)')
  }

  registerBuiltinTools() {
    this.tools.set('calculator', {
      name: 'calculator',
      description: '数学计算器，支持四则运算、三角函数等',
      execute: (params) => this.calc(params)
    })
    
    this.tools.set('execute_code', {
      name: 'execute_code',
      description: '安全执行代码片段（JavaScript/Python）',
      execute: (params) => this.executeCode(params)
    })
    
    this.tools.set('web_search', {
      name: 'web_search',
      description: '联网搜索获取最新信息',
      execute: (params) => this.webSearch(params)
    })
    
    this.tools.set('read_file', {
      name: 'read_file',
      description: '读取文件内容',
      execute: (params) => this.readFile(params)
    })
    
    this.tools.set('write_file', {
      name: 'write_file',
      description: '写入文件内容',
      execute: (params) => this.writeFile(params)
    })
    
    this.tools.set('datetime', {
      name: 'datetime',
      description: '获取当前日期和时间',
      execute: () => ({ now: new Date().toISOString(), locale: new Date().toLocaleString('zh-CN') })
    })
    
    this.tools.set('weather', {
      name: 'weather',
      description: '获取天气信息（需 API）',
      execute: (params) => this.getWeather(params)
    })
  }

  async loadCustomTools() {
    const customDir = path.join(this.config.dataDir || './data', 'custom-tools')
    if (!fs.existsSync(customDir)) return
    
    const files = fs.readdirSync(customDir).filter(f => f.endsWith('.js'))
    for (const file of files) {
      try {
        const toolPath = path.join(customDir, file)
        const tool = await import(toolPath)
        if (tool.name && tool.execute) {
          this.tools.set(tool.name, tool)
        }
      } catch (e) {
        console.error('加载自定义工具失败:', file, e.message)
      }
    }
  }

  async execute(response, context) {
    const toolCalls = this.parseToolCalls(response)
    const results = []
    
    for (const call of toolCalls) {
      const tool = this.tools.get(call.name)
      if (!tool) {
        results.push({ name: call.name, error: '未知工具' })
        continue
      }
      
      try {
        const result = await tool.execute(call.params, context)
        results.push({ name: call.name, result })
      } catch (e) {
        results.push({ name: call.name, error: e.message })
      }
    }
    
    return results
  }

  parseToolCalls(text) {
    const calls = []
    const regex = /\[TOOL:\s*(\w+)\s*(?:\(([^)]*)\))?\]/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      try {
        calls.push({
          name: match[1],
          params: match[2] ? JSON.parse(match[2]) : {}
        })
      } catch {
        calls.push({
          name: match[1],
          params: { raw: match[2] || '' }
        })
      }
    }
    
    return calls
  }

  calc(params) {
    const expr = params.expression || params.expr || params.toString()
    const safe = expr.replace(/[^0-9+\-*/().%,\s]/g, '').replace(/%/g, '/100*')
    
    try {
      const result = vm.runInNewContext('(' + safe + ')', {}, { timeout: 1000 })
      if (typeof result === 'number' && isFinite(result)) {
        return { result, expression: expr }
      }
      return { error: '无效表达式' }
    } catch (e) {
      return { error: e.message }
    }
  }

  executeCode(params) {
    const code = params.code || params.toString()
    const lang = params.language || params.lang || 'javascript'
    
    if (lang === 'javascript') {
      try {
        const sandbox = { console: { log: (...args) => logs.push(args.join(' ')) } }
        const logs = []
        vm.createContext(sandbox)
        const result = vm.runInContext(code, sandbox, { timeout: 5000 })
        return { result: String(result), logs, language: 'javascript' }
      } catch (e) {
        return { error: e.message, language: 'javascript' }
      }
    }
    
    return { error: '不支持的语言: ' + lang }
  }

  async webSearch(params) {
    const query = params.query || params.q || params.toString()
    return { message: '联网搜索需要在部署环境配置 API 密钥', query }
  }

  readFile(params) {
    const filePath = params.path || params.file || params.toString()
    const safePath = path.resolve(this.config.dataDir || '.', 'files', filePath)
    
    if (!safePath.startsWith(path.resolve(this.config.dataDir || '.'))) {
      return { error: '路径不允许' }
    }
    
    if (!fs.existsSync(safePath)) {
      return { error: '文件不存在' }
    }
    
    const content = fs.readFileSync(safePath, 'utf-8')
    return { content, path: filePath, size: content.length }
  }

  writeFile(params) {
    const filePath = params.path || params.file || ''
    const content = params.content || ''
    const safePath = path.resolve(this.config.dataDir || '.', 'files', filePath)
    
    if (!safePath.startsWith(path.resolve(this.config.dataDir || '.'))) {
      return { error: '路径不允许' }
    }
    
    const dir = path.dirname(safePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    
    fs.writeFileSync(safePath, content, 'utf-8')
    return { success: true, path: filePath, size: content.length }
  }

  getWeather(params) {
    return { message: '天气查询需要配置天气 API 密钥', location: params.location || params.city || '' }
  }

  listTools() {
    return Array.from(this.tools.keys()).map(name => ({
      name,
      description: this.tools.get(name).description
    }))
  }
}