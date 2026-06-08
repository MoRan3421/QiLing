/**
 * 插件系统 — 扩展能力：多模态/代码解析/数据分析/绘图
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class PluginManager {
  constructor(config) {
    this.config = config
    this.plugins = new Map()
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    await this.loadBuiltinPlugins()
    await this.loadUserPlugins()
    
    this.initialized = true
    console.log('✨ 插件系统就绪 (' + this.plugins.size + ' 个插件)')
  }

  async loadBuiltinPlugins() {
    this.plugins.set('emoji_render', {
      name: 'emoji_render',
      version: '1.0.0',
      hooks: ['before_response', 'after_response'],
      handler: (text, context) => this.emojiRender(text, context)
    })
    
    this.plugins.set('code_highlight', {
      name: 'code_highlight',
      version: '1.0.0',
      hooks: ['after_response'],
      handler: (text, context) => this.codeHighlight(text, context)
    })
    
    this.plugins.set('text_analysis', {
      name: 'text_analysis',
      version: '1.0.0',
      hooks: ['after_response'],
      handler: (text, context) => this.textAnalysis(text, context)
    })
  }

  async loadUserPlugins() {
    const pluginDir = path.join(this.config.dataDir || './data', 'plugins')
    if (!fs.existsSync(pluginDir)) return
    
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'))
    for (const file of files) {
      try {
        const pluginPath = path.join(pluginDir, file)
        const plugin = await import(pluginPath)
        if (plugin.name && plugin.handler) {
          this.plugins.set(plugin.name, {
            ...plugin,
            path: file
          })
        }
      } catch (e) {
        console.error('加载插件失败:', file, e.message)
      }
    }
  }

  async process(text, context) {
    let result = text
    
    for (const [name, plugin] of this.plugins) {
      if (plugin.hooks && plugin.hooks.includes('after_response')) {
        try {
          result = await plugin.handler(result, context)
        } catch (e) {
          console.error('插件执行失败:', name, e.message)
        }
      }
    }
    
    return result
  }

  emojiRender(text, context) {
    return text
  }

  codeHighlight(text, context) {
    if (!text.includes('```')) return text
    
    return text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return match
    })
  }

  textAnalysis(text, context) {
    const stats = {
      characters: text.length,
      chineseChars: (text.match(/[\u4e00-\u9fff]/g) || []).length,
      englishWords: (text.match(/[a-zA-Z]+/g) || []).length,
      emojiCount: (text.match(/[\u{1F000}-\u{1FFFF}]/gu) || []).length,
      sentences: (text.split(/[。！？.!?]+/).filter(Boolean)).length
    }
    
    return text
  }

  listPlugins() {
    return Array.from(this.plugins.keys()).map(name => ({
      name,
      version: this.plugins.get(name).version || '1.0.0',
      hooks: this.plugins.get(name).hooks || []
    }))
  }
}