import { BookOpen, Key, MessageSquare, Brain, BarChart3, GitBranch, Code, Terminal } from 'lucide-react'

const endpoints = [
  {
    method: 'GET', path: '/api/health', desc: '健康检查',
    response: '{ "status": "ok", "engine": "绮灵 Brain v3", "version": "3.0.0" }'
  },
  {
    method: 'POST', path: '/api/keys/register', desc: '注册新 API 密钥',
    body: '{ "label": "我的应用", "inviteCode": "可选邀请码" }',
    response: '{ "key": "QL-xxx...", "tier": "free", "message": "免费密钥已创建" }'
  },
  {
    method: 'POST', path: '/api/chat', desc: '发送对话消息',
    body: '{ "message": "你好", "mode": "cute", "useTools": true }',
    response: '{ "response": "嘿嘿～ 你好呀！...", "version": {...} }'
  },
  {
    method: 'POST', path: '/api/chat/stream', desc: '流式对话（SSE）',
    body: '{ "message": "你好", "mode": "cute" }',
    response: 'data: {"content":"嘿"}\ndata: {"content":"嘿嘿"}\n...'
  },
  {
    method: 'POST', path: '/api/train', desc: '训练新知识',
    body: '{ "question": "你的名字", "answer": "我是绮灵" }',
    response: '{ "ok": true, "total": 42 }'
  },
  {
    method: 'GET', path: '/api/train/knowledge', desc: '获取知识库列表',
    response: '{ "knowledge": [...], "stats": {...} }'
  },
  {
    method: 'POST', path: '/api/feedback', desc: '提交反馈（👍👎）',
    body: '{ "question": "...", "answer": "...", "rating": 1 }',
    response: '{ "ok": true }'
  },
  {
    method: 'GET', path: '/api/version', desc: '获取所有版本信息',
    response: '[{ "version": "3.0.0", "codename": "星识觉醒", ... }]'
  },
  {
    method: 'GET', path: '/api/stats', desc: '获取统计信息',
    response: '{ "vectorCount": 100, "version": {...}, "uptime": 3600 }'
  },
  {
    method: 'GET', path: '/api/tools', desc: '获取可用工具列表',
    response: '{ "tools": [{ "name": "calculator", ... }] }'
  },
  {
    method: 'GET', path: '/api/plugins', desc: '获取插件列表',
    response: '{ "plugins": [{ "name": "emoji_render", ... }] }'
  },
  {
    method: 'POST', path: '/api/train/auto', desc: '触发自动训练（管理员）',
    response: '{ "processed": 50, "added": 12, ... }'
  },
]

const codeExamples = [
  { lang: 'curl', code: `curl -X POST http://localhost:3001/api/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: QL-your-key-here" \\
  -d '{"message": "你好绮灵", "mode": "cute"}'` },
  { lang: 'JavaScript', code: `const res = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'QL-your-key-here'
  },
  body: JSON.stringify({ message: '你好绮灵', mode: 'cute' })
})
const data = await res.json()
console.log(data.response)` },
  { lang: 'Python', code: `import requests

res = requests.post(
    'http://localhost:3001/api/chat',
    headers={'x-api-key': 'QL-your-key-here'},
    json={'message': '你好绮灵', 'mode': 'cute'}
)
print(res.json()['response'])` },
]

export default function ApiDocsPage() {
  return (
    <div>
      <h2 className="section-title">📖 API 文档</h2>
      <p className="section-subtitle">绮灵 RESTful API — 将智能集成到你的应用中</p>

      {/* 认证 */}
      <div className="card api-section">
        <h3><Key size={18} /> 认证方式</h3>
        <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:12}}>
          所有 API 请求都需要在 Header 中传入 API 密钥：
        </p>
        <pre><code>x-api-key: QL-your-api-key-here</code></pre>
        <p style={{fontSize:14,color:'var(--text-secondary)',marginTop:12}}>
          或使用 Bearer Token：
        </p>
        <pre><code>Authorization: Bearer QL-your-api-key-here</code></pre>
        <div style={{marginTop:12}}>
          <p style={{fontSize:13,color:'var(--text-muted)'}}>
            💡 在登录页面免费获取 API 密钥
          </p>
        </div>
      </div>

      {/* 速率限制 */}
      <div className="card api-section">
        <h3><BarChart3 size={18} /> 速率限制</h3>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <th style={{textAlign:'left',padding:'8px 12px'}}>套餐</th>
                <th style={{textAlign:'left',padding:'8px 12px'}}>速率</th>
                <th style={{textAlign:'left',padding:'8px 12px'}}>每日限额</th>
                <th style={{textAlign:'left',padding:'8px 12px'}}>价格</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['免费', '1次/秒 · 10次/分', '20 条', '¥0'],
                ['Pro', '5次/秒 · 60次/分', '500 条', '¥29/月'],
                ['Ultra', '10次/秒 · 120次/分', '2000 条', '¥79/月'],
                ['企业', '50次/秒 · 无限', '10000+ 条', '¥299/月'],
              ].map((row, i) => (
                <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                  {row.map((cell, j) => (
                    <td key={j} style={{padding:'10px 12px'}}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 端点列表 */}
      <div className="api-section">
        <h3><Terminal size={18} /> API 端点</h3>
        {endpoints.map((ep, i) => (
          <div key={i} className="card" style={{marginBottom:12}}>
            <div className="api-endpoint">
              <span className={'method method-' + ep.method.toLowerCase()}>{ep.method}</span>
              <code style={{fontSize:14}}>{ep.path}</code>
            </div>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>{ep.desc}</p>
            {ep.body && (
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>请求体：</div>
                <pre><code>{ep.body}</code></pre>
              </div>
            )}
            <div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>响应：</div>
              <pre><code>{ep.response}</code></pre>
            </div>
          </div>
        ))}
      </div>

      {/* 代码示例 */}
      <div className="api-section">
        <h3><Code size={18} /> 代码示例</h3>
        {codeExamples.map((ex, i) => (
          <div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>{ex.lang}</div>
            <pre><code>{ex.code}</code></pre>
          </div>
        ))}
      </div>
    </div>
  )
}