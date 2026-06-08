const API_BASE = import.meta.env.VITE_API_URL || '/api'

function headers(apiKey) {
  const h = { 'Content-Type': 'application/json' }
  if (apiKey) h['X-Api-Key'] = apiKey
  return h
}

export async function registerKey(label, inviteCode) {
  const res = await fetch(`${API_BASE}/keys/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ label, inviteCode }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '注册失败')
  return data
}

export async function verifyKey(apiKey) {
  const res = await fetch(`${API_BASE}/keys/verify`, { headers: headers(apiKey) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '验证失败')
  return data
}

export async function getRateLimit(apiKey) {
  const res = await fetch(`${API_BASE}/keys/rate-limit`, { headers: headers(apiKey) })
  return res.json()
}

export async function getVersion() {
  const res = await fetch(`${API_BASE}/version`)
  return res.json()
}

export async function streamChat(apiKey, message, mode, onChunk) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ message, mode }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.retryAfter
      ? `${err.error}（${err.retryAfter}s 后重试）`
      : (err.error || `请求失败 ${res.status}`)
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const payload = JSON.parse(line.slice(6))
        if (payload.error) throw new Error(payload.error)
        if (payload.content) {
          full = payload.content
          onChunk(full, payload)
        }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e
      }
    }
  }
  return full
}

export async function queryData(apiKey, q, type = 'all') {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ q, type }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '查询失败')
  return data
}

export async function submitFeedback(apiKey, question, answer, rating) {
  await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ question, answer, rating }),
  })
}

export async function trainKnowledge(apiKey, question, answer) {
  const res = await fetch(`${API_BASE}/train`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ question, answer }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '训练失败')
  return data
}

export async function getKnowledge(apiKey) {
  const res = await fetch(`${API_BASE}/train/knowledge`, { headers: headers(apiKey) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '获取失败')
  return data
}

export async function deleteKnowledge(apiKey, index) {
  await fetch(`${API_BASE}/train/${index}`, {
    method: 'DELETE',
    headers: headers(apiKey),
  })
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`)
  return res.json()
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`)
  return res.json()
}
