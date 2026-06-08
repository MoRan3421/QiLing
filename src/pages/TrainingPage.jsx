import { useState, useEffect } from 'react'
import { Brain, Plus, Trash2, RefreshCw, Lightbulb, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function TrainingPage() {
  const { apiKey } = useAuth()
  const [questions, setQuestions] = useState([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadQuestions = async () => {
    setFetchLoading(true)
    try {
      const res = await fetch(API_URL + '/train/knowledge', {
        headers: { 'x-api-key': apiKey }
      })
      const data = await res.json()
      setQuestions(data.knowledge || [])
      setStats(data.stats)
    } catch (e) {
      showToast('加载失败: ' + e.message)
    }
    setFetchLoading(false)
  }

  useEffect(() => {
    if (apiKey) loadQuestions()
    else setFetchLoading(false)
  }, [apiKey])

  const handleTrain = async () => {
    if (!question.trim() || !answer.trim()) return
    setLoading(true)
    try {
      const res = await fetch(API_URL + '/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim() })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setQuestion('')
      setAnswer('')
      showToast('🧠 训练成功！绮灵变得更聪明了～')
      loadQuestions()
    } catch (e) {
      showToast('训练失败: ' + e.message)
    }
    setLoading(false)
  }

  const handleDelete = async (index) => {
    try {
      await fetch(API_URL + '/train/' + index, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey }
      })
      showToast('已删除')
      loadQuestions()
    } catch (e) {
      showToast('删除失败')
    }
  }

  if (!apiKey) {
    return (
      <div style={{textAlign:'center',padding:'60px 20px'}}>
        <Brain size={48} style={{color:'var(--text-muted)',marginBottom:16}} />
        <h2>请先配置 API 密钥</h2>
        <p style={{color:'var(--text-secondary)'}}>登录后即可开始训练绮灵</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <div>
          <h2 className="section-title" style={{margin:0}}>🧠 训练中心</h2>
          <p className="section-subtitle" style={{margin:'4px 0 0'}}>
            教导绮灵新知识 — 每次训练写入大脑，回答越来越精准！
            {stats && <span> · 已训练 {stats.knowledgeCount || '?'} 条</span>}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={loadQuestions}><RefreshCw size={16} /></button>
      </div>

      {/* 训练表单 */}
      <div className="train-form">
        <div>
          <label>问题 / 触发词</label>
          <input 
            placeholder="例如：我们公司的产品叫什么？"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div>
          <label>绮灵的回答</label>
          <textarea 
            placeholder="例如：我们的产品叫星澜，是一款..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
          />
        </div>
        <button className="btn btn-primary" onClick={handleTrain} disabled={loading || !question.trim() || !answer.trim()} style={{alignSelf:'flex-start'}}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {loading ? '训练中...' : '训练绮灵'}
        </button>
      </div>

      {/* 提示 */}
      <div className="card" style={{padding:'16px 20px',marginBottom:24,background:'rgba(241,196,15,0.05)',borderColor:'rgba(241,196,15,0.2)'}}>
        <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
          <Lightbulb size={20} style={{color:'var(--warning)',flexShrink:0,marginTop:2}} />
          <div>
            <strong style={{fontSize:14}}>训练小贴士</strong>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>
              训练后绮灵会在匹配到相似问题时自动调用你的回答。问题越精确，匹配越准确。
              你也可以在对话中使用 👍 / 👎 反馈来训练！
            </p>
          </div>
        </div>
      </div>

      {/* 知识库列表 */}
      <h3 style={{marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
        <Brain size={18} /> 知识库 ({fetchLoading ? '...' : questions.length})
      </h3>

      {fetchLoading ? (
        <div style={{textAlign:'center',padding:40}}><Loader2 className="animate-spin" size={24} /></div>
      ) : questions.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:40}}>
          <Sparkles size={32} style={{color:'var(--text-muted)',marginBottom:12}} />
          <p style={{color:'var(--text-secondary)'}}>还没有训练数据，开始教导绮灵吧！</p>
        </div>
      ) : (
        <div className="train-list">
          {questions.map((item, i) => (
            <div key={i} className="train-item">
              <div style={{flex:1}}>
                <div className="q">Q: {item.q}</div>
                <div className="a">A: {item.a?.slice(0, 150)}{item.a?.length > 150 ? '…' : ''}</div>
              </div>
              <button 
                className="btn btn-ghost" 
                onClick={() => handleDelete(i)}
                style={{padding:8,color:'var(--danger)'}}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}