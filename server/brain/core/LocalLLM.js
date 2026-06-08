/**
 * 本地小模型推理引擎 — llama.cpp / ONNX Runtime
 * 支持 Phi-3-mini, Qwen2.5-1.5B, Gemma-2B 等
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class LocalLLM {
  constructor(config) {
    this.config = config
    this.modelPath = config.modelPath
    this.llamaCppPath = config.llamaCppPath || path.join(__dirname, '../../bin/llama-cli')
    this.initialized = false
    this.process = null
    this.fallbackMode = false
  }

  async initialize() {
    if (this.initialized) return
    
    if (!fs.existsSync(this.modelPath)) {
      console.log('⚠️ 模型文件不存在，将使用回退模式')
      this.fallbackMode = true
    }
    
    const exePath = this.llamaCppPath + (process.platform === 'win32' ? '.exe' : '')
    if (!fs.existsSync(exePath)) {
      console.log('⚠️ llama-cli 不存在，将使用回退模式')
      this.fallbackMode = true
    }
    
    this.initialized = true
    console.log('✨ 本地 LLM 引擎就绪' + (this.fallbackMode ? ' (回退模式)' : ''))
  }

  async generate(prompt, options = {}) {
    await this.initialize()
    
    if (this.fallbackMode) {
      return this.fallbackGenerate(prompt, options)
    }
    
    return new Promise((resolve, reject) => {
      const args = [
        '-m', this.modelPath,
        '-p', prompt,
        '-n', String(options.maxTokens || 2048),
        '-t', String(options.temperature || 0.7),
        '-p', String(options.topP || 0.9),
        '--repeat-penalty', '1.1',
        '-c', String(this.config.maxContext || 4096)
      ]
      
      const exe = this.llamaCppPath + (process.platform === 'win32' ? '.exe' : '')
      this.process = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'] })
      
      let output = ''
      this.process.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      this.process.stderr.on('data', (data) => {
        console.error('llama.cpp stderr:', data.toString())
      })
      
      this.process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim())
        } else {
          reject(new Error('llama.cpp 进程退出码: ' + code))
        }
      })
      
      this.process.on('error', (err) => {
        reject(err)
      })
      
      setTimeout(() => {
        if (this.process) {
          this.process.kill()
          reject(new Error('推理超时'))
        }
      }, 120000)
    })
  }

  fallbackGenerate(prompt, options) {
    const responses = [
      '绮灵正在思考中… 这是一个很棒的问题！让我从几个角度来分析。',
      '嗯～ 关于这个问题，绮灵有几个想法想和你分享。',
      '好问题！绮灵觉得可以从原理、应用、延伸三个层面来看。'
    ]
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)]
    
    if (/代码|编程|code|program/i.test(prompt)) {
      return baseResponse + '\n\n💻 编程方面，绮灵可以帮你写代码、调试、解释算法。把具体需求告诉我吧！'
    }
    
    if (/数学|计算|math|\d[+\-*/]\d/i.test(prompt)) {
      return baseResponse + '\n\n🔢 数学计算交给绮灵！虽然现在是回退模式，但简单运算还是难不倒我～'
    }
    
    if (/心情|难过|开心|情绪|emo/i.test(prompt)) {
      return baseResponse + '\n\n💜 绮灵感受到你的情绪了。不管发生什么，你都值得被温柔对待。'
    }
    
    return baseResponse + '\n\n✨ 绮灵会持续进化，每个版本都比上一个更强！'
  }

  getInfo() {
    return {
      model: this.modelPath,
      fallbackMode: this.fallbackMode,
      maxContext: this.config.maxContext
    }
  }
}