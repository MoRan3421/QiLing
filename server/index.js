import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { QilingBrain } from './brain/core/QilingBrain.js'
import { createRouter } from './api/routes.js'
import { getDatabase } from './db/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const VERSION = '3.0.0'

const app = express()
const corsOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim())

app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json({ limit: '5mb' }))

const config = {
  dataDir: process.env.QILING_DATA_DIR || path.join(__dirname, 'data'),
  modelPath: process.env.QILING_MODEL_PATH || path.join(__dirname, 'models', 'qiling-model.gguf')
}

const brain = new QilingBrain(config)
const router = createRouter(brain, config)

app.use('/api', router)

// 静态文件（生产环境）
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'))
  }
})

async function start() {
  await getDatabase(config)
  await brain.initialize()
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('╔══════════════════════════════════════════════╗')
    console.log('║     ✨ 绮灵 QìLíng Brain v' + VERSION + ' ✨       ║')
    console.log('║     自研可训练 AI 伙伴 — 越用越强            ║')
    console.log('╠══════════════════════════════════════════════╣')
    console.log('║  Server: http://0.0.0.0:' + PORT + '                ║')
    console.log('║  API:    /api/chat, /api/train, /api/keys   ║')
    console.log('║  Env:    ' + process.env.NODE_ENV || 'development' + '                         ║')
    console.log('╚══════════════════════════════════════════════╝')
    
    if (!process.env.QILING_ADMIN_SECRET) {
      console.log('⚠️  请设置 QILING_ADMIN_SECRET 环境变量')
    }
  })
}

start().catch(e => {
  console.error('启动失败:', e)
  process.exit(1)
})