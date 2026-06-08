import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Database, BookOpen, HelpCircle, Brain } from 'lucide-react'
import { queryData } from '../lib/api'

const TYPES = [
  { id: 'all', label: '全部', icon: Database },
  { id: 'wiki', label: '百科', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'knowledge', label: '训练知识', icon: Brain },
]

export default function QueryPanel({ apiKey, onClose, onToast }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await queryData(apiKey, query, type)
      setResult(data)
    } catch (e) {
      onToast(e.message)
    }
    setLoading(false)
  }

  return (
    <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="panel-content query-panel" initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
        <h2><Search size={20} /> 资料查询</h2>
        <p className="panel-desc">搜索百科、FAQ、训练知识库 — 绮灵自研 QueryEngine</p>

        <div className="query-types">
          {TYPES.map((t) => (
            <button key={t.id} className={`mode-btn ${type === t.id ? 'active' : ''}`} onClick={() => setType(t.id)}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="query-input-row">
          <input
            placeholder="输入查询关键词…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={handleSearch} disabled={loading}>
            {loading ? '查询中…' : '搜索'}
          </button>
        </div>

        {result && (
          <div className="query-result">
            <div className="query-meta">命中 {result.total} 条</div>
            <div className="query-summary">{result.summary}</div>
            {result.results?.map((r, i) => (
              <div key={i} className="query-item">
                <span className="query-type-tag">{r.type}</span>
                <strong>{r.title || r.question}</strong>
                <p>{(r.content || r.answer || '').slice(0, 200)}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
