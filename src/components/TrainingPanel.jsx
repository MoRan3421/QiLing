import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Plus, Trash2, RefreshCw } from 'lucide-react'
import { getKnowledge, trainKnowledge, deleteKnowledge } from '../lib/api'

export default function TrainingPanel({ apiKey, onClose, onToast }) {
  const [knowledge, setKnowledge] = useState([])
  const [stats, setStats] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      const data = await getKnowledge(apiKey)
      setKnowledge(data.knowledge || [])
      setStats(data.stats)
    } catch (e) {
      onToast(e.message)
    }
  }

  useEffect(() => { load() }, [apiKey])

  const handleTrain = async () => {
    if (!question.trim() || !answer.trim()) return
    setLoading(true)
    try {
      await trainKnowledge(apiKey, question, answer)
      setQuestion('')
      setAnswer('')
      onToast('训练成功！绮灵变聪明了～ 🧠✨')
      load()
    } catch (e) {
      onToast(e.message)
    }
    setLoading(false)
  }

  const handleDelete = async (index) => {
    await deleteKnowledge(apiKey, index)
    onToast('已删除训练数据')
    load()
  }

  return (
    <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="panel-content train-panel" initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
        <div className="train-header">
          <h2><Brain size={22} /> 训练中心</h2>
          <button className="btn-icon" onClick={load}><RefreshCw size={16} /></button>
        </div>
        <p className="panel-desc">
          教导绮灵新知识 — 每次训练写入自研大脑，回答越来越精准！
          {stats && <span> · 已训练 {stats.knowledgeCount} 条 · 对话 {stats.totalChats} 次</span>}
        </p>

        <div className="train-form">
          <label>问题 / 触发词</label>
          <input placeholder="例如：我们公司的产品叫什么" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <label>绮灵应该回答</label>
          <textarea placeholder="例如：我们的产品叫星澜，是一款…" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} />
          <button className="btn-primary" onClick={handleTrain} disabled={loading}>
            <Plus size={16} /> {loading ? '训练中…' : '训练绮灵'}
          </button>
        </div>

        <div className="train-list">
          <h3>知识库 ({knowledge.length})</h3>
          {knowledge.map((k, i) => (
            <div key={i} className="train-item">
              <div className="train-q">Q: {k.q}</div>
              <div className="train-a">A: {k.a.slice(0, 120)}{k.a.length > 120 ? '…' : ''}</div>
              <button className="train-del" onClick={() => handleDelete(i)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
