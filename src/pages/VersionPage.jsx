import { useState, useEffect } from 'react'
import { GitBranch, Sparkles, Check, Clock, ArrowUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const versionColor = (v) => {
  const colors = ['#3498DB', '#2ECC71', '#9B59B6', '#F1C40F', '#E74C3C', '#F39C12', '#1ABC9C', '#E91E63']
  return colors[v % colors.length]
}

export default function VersionPage() {
  const { apiKey } = useAuth()
  const [versions, setVersions] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const [vRes, cRes] = await Promise.all([
          fetch(API_URL + '/version', { headers: apiKey ? { 'x-api-key': apiKey } : {} }),
          fetch(API_URL + '/version/current', { headers: apiKey ? { 'x-api-key': apiKey } : {} })
        ])
        if (vRes.ok) setVersions(await vRes.json())
        if (cRes.ok) setCurrent(await cRes.json())
      } catch {}
      setLoading(false)
    }
    fetchVersions()
  }, [apiKey])

  const defaultVersions = [
    { version: '1.0.0', codename: '绮灵初醒 QìLíng Awakening', date: '2024-03', capabilities: ['基础对话', 'TF-IDF检索', '手动训练'], isCurrent: false },
    { version: '2.0.0', codename: '灵络扩展 Spirit Network', date: '2024-06', capabilities: ['向量检索', 'API密钥', '限流', 'Discord'], isCurrent: false },
    { version: '3.0.0', codename: '星识觉醒 Star Knowledge', date: '2025-01', capabilities: ['语义嵌入', '本地模型', '长期记忆', '工具调用', '自训练'], isCurrent: true },
    { version: '4.0.0', codename: '智链永续 Wisdom Chain', date: '2025-06 (规划)', capabilities: ['深度推理链', '多模态', '知识图谱', '自适应学习'], isCurrent: false },
    { version: '5.0.0', codename: '绮灵天成 QìLíng Ascended', date: '2026-01 (规划)', capabilities: ['自监督学习', '因果推理', '元学习', '集群分布式'], isCurrent: false },
  ]

  const displayVersions = versions.length > 0 ? versions : defaultVersions

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <h2 className="section-title" style={{margin:0}}>🌌 版本进化</h2>
        {current && (
          <div className="version-badge">
            <Sparkles size={14} /> v{current.version} · {current.codename}
          </div>
        )}
      </div>
      <p className="section-subtitle">每一轮训练都是一次进化，每个版本都代表一次质的飞跃</p>

      <div className="version-timeline">
        {displayVersions.map((v, i) => {
          const isCurrent = v.isCurrent || (current && v.version === current.version)
          
          return (
            <div key={i} className={'card version-card' + (isCurrent ? ' current' : '')}
              style={{borderColor: isCurrent ? 'var(--primary)' : 'var(--border)'}}
            >
              <div className="version-dot" style={{background: versionColor(i)}} />
              <div className="version-info">
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <h3 style={{margin:0}}>
                    v{v.version} {v.codename}
                  </h3>
                  {isCurrent && (
                    <span style={{
                      fontSize:11,background:'rgba(155,89,182,0.2)',color:'var(--primary-light)',
                      padding:'2px 10px',borderRadius:10
                    }}>
                      当前版本
                    </span>
                  )}
                </div>
                <div className="date" style={{marginTop:4}}>
                  <Clock size={12} style={{display:'inline',verticalAlign:'middle',marginRight:4}} />
                  {v.date}
                </div>
                <div className="caps">
                  {(v.capabilities || []).map((cap, j) => (
                    <span key={j} style={{
                      fontSize:12,color:'var(--text-secondary)',background:'var(--bg-surface)',
                      padding:'2px 10px',borderRadius:12,border:'1px solid var(--border)'
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>
                {v.benchmark && (
                  <div style={{marginTop:12,display:'flex',gap:16,fontSize:12,color:'var(--text-muted)'}}>
                    <span>准确率: {(v.benchmark.accuracy * 100).toFixed(0)}%</span>
                    <span>相关度: {(v.benchmark.relevance * 100).toFixed(0)}%</span>
                    <span>召回率: {(v.benchmark.recall * 100).toFixed(0)}%</span>
                  </div>
                )}
                {!isCurrent && i < displayVersions.length - 1 && (
                  <div style={{marginTop:12}}>
                    <button className="btn btn-secondary" style={{fontSize:12,padding:'6px 14px'}}>
                      <ArrowUp size={12} /> 对比
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 进化路线图 */}
      <div className="card" style={{marginTop:32,textAlign:'center',padding:32}}>
        <h3 style={{marginBottom:16}}>🚀 进化路线图</h3>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
          {['Phase 1: 基础', 'Phase 2: 扩展', 'Phase 3: 觉醒', 'Phase 4: 智慧', 'Phase 5: 无限'].map((p, i) => (
            <div key={i} style={{
              padding:'8px 16px',background:i <= 2 ? 'rgba(155,89,182,0.1)' : 'var(--bg-surface)',
              border:'1px solid ' + (i <= 2 ? 'rgba(155,89,182,0.3)' : 'var(--border)'),
              borderRadius:12,fontSize:13
            }}>
              {i <= 2 ? '✅ ' : '🔮 '}{p}
            </div>
          ))}
        </div>
        <p style={{fontSize:13,color:'var(--text-secondary)'}}>
          每完成一个训练闭环，绮灵的能力就会向下一阶段迈进。
          真正的"越用越强"，不是口号，是架构。
        </p>
      </div>
    </div>
  )
}