/**
 * Firebase Functions 入口 - 适配 Express 应用
 */
import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'

let appPromise = null

async function getApp() {
  if (!appPromise) {
    appPromise = import('./index.js').then(module => {
      const { app } = module.default()
      return app
    })
  }
  return appPromise
}

export const api = onRequest(
  {
    region: 'asia-east1',
    memory: '512MiB',
    timeoutSeconds: 60,
    cors: true
  },
  async (req, res) => {
    try {
      const app = await getApp()
      return app(req, res)
    } catch (error) {
      logger.error('Firebase Function error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)