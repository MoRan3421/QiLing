import { useState, useEffect } from 'react'
import { BarChart3, Brain, MessageSquare, GitBranch, Zap, Clock, Activity, Users, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function DashboardPage() {
  const { apiKey } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_URL + '/stats', {
          headers: apiKey ? { 'x-api-key': apiKey } : {}
        })
        if (res.ok) setStats(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchStats()
  }, [apiKey])

  if (loading) {
    return <div style={{textAlign:'center',padding:60}}><Activity size={32} className="animate-pulse-soft" /></div>
  }

  const statCards = [
    { icon: Brain, value: stats?.vectorCount || 0, label: '知识库条数', color: '#9B59B6' },
    { icon: MessageSquare, value: stats?.trainingPairs || 0, label: '训练对', color: '#3498DB' },
    { icon: GitBranch, value: 'v' + (stats?.version?.version || '3.0'), label: '当前版本', color: '#2ECC71' },
    { icon: Clock, value: Math.floor((stats?.uptime || 0) / 3600) + 'h', label: '运行时间', color: '#F1C40F' },
    { icon: Users, value: stats?.memoryCount || 0, label: '记忆片段', color: '#E74C3C' },
    { icon: Zap, value: stats?.version?.trainingCycles || 0, label: '训练轮次', color: '#F39C12' },
  ]

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div>
          <h2 className="section-title" style={{margin:0}}>📊 仪表盘</h2>
          <p className="section-subtitle" style={{margin:'4px 0 0'}}>绮灵运行状态和数据概览</p>
        </div>
        <div className="version-badge">
          <Sparkles size={14} /> v{(stats?.version?.version || '3.0')} · {stats?.version?.codename || '星识觉醒'}
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="card stat-card">
            <div style={{color:s.color,display:'flex',justifyContent:'center',marginBottom:8}}>
              <s.icon size={28} />
            </div>
            <div className="value">{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 版本能力 */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{marginBottom:16}}>🧠 当前版本能力</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {(stats?.version?.capabilities || ['基础对话', '向量检索', '工具调用']).map((cap, i) => (
            <span key={i} style={{
              padding:'6px 14px',background:'rgba(155,89,182,0.1)',
              border:'1px solid rgba(155,89,182,0.2)',borderRadius:20,
              fontSize:13,color:'var(--primary-light)'
            }}>
              ✨ {cap}
            </span>
          ))}
        </div>
      </div>

      {/* 系统信息 */}
      <div className="card">
        <h3 style={{marginBottom:16}}>🔧 系统信息</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
          {[
            ['引擎', '绮灵 Brain v3'],
            ['推理方式', '向量检索 + 本地模型'],
            ['训练方式', '手动 + 自动闭环'],
            ['数据存储', '本地加密存储'],
            ['模型模式', '回退 / llama.cpp'],
            ['API 状态', stats ? '正常' : '未连接']
          ].map(([k, v], i) => (
            <div key={i}>
              <div style={{fontSize:12,color:'var(--text-muted)'}}>{k}</div>
              <div style={{fontSize:14,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}