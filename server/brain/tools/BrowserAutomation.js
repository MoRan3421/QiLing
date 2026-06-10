/**
 * 浏览器自动化引擎 — Playwright 无头模式
 * 仅使用 Chromium，独立运行，不占用本地浏览器，每请求隔离上下文
 */
import { chromium } from 'playwright'

export class BrowserAutomation {
  constructor() {
    this.browser = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    this.browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    this.initialized = true
    console.log('浏览器自动化引擎就绪 (Chromium)')
  }

  async newContext() {
    await this.initialize()
    return await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      permissions: [],
      extraHTTPHeaders: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })
  }

  async fetchPage(url, options = {}) {
    const { waitUntil = 'networkidle', timeout = 30000, screenshot = false, pdf = false, script = null } = options
    const context = await this.newContext()
    const page = await context.newPage()

    try {
      await page.goto(url, { waitUntil, timeout })

      if (script) {
        await page.evaluate(script)
      }

      const content = await page.content()
      const text = await page.evaluate(() => document.body.innerText)
      const title = await page.title()
      const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => ({ text: a.innerText.trim(), href: a.href })).slice(0, 50))

      let screenshotBuffer = null
      if (screenshot) {
        screenshotBuffer = await page.screenshot({ fullPage: true, type: 'png' })
      }

      let pdfBuffer = null
      if (pdf) {
        pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
      }

      return { url, title, text, html: content, links, screenshot: screenshotBuffer, pdf: pdfBuffer }
    } finally {
      await context.close()
    }
  }

  async search(query, options = {}) {
    const { engines = ['duckduckgo'], maxResults = 10 } = options
    const results = []

    for (const engine of engines) {
      try {
        let url
        if (engine === 'duckduckgo') {
          url = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(query)
        } else if (engine === 'bing') {
          url = 'https://www.bing.com/search?q=' + encodeURIComponent(query)
        } else {
          continue
        }

        const { text, links } = await this.fetchPage(url)
        const snippets = text.split('\n').filter(l => l.length > 20).slice(0, maxResults)
        results.push(...snippets.map((snippet, i) => ({ engine, snippet, source: links[i]?.href || url })))
      } catch (e) {
        console.error(engine + ' 搜索失败:', e.message)
      }
    }

    return results.slice(0, maxResults)
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.initialized = false
    }
  }
}