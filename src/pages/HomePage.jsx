import { Link } from 'react-router-dom'
import { Sparkles, Brain, Zap, Shield, Infinity, Heart, Github } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const features = [
  { icon: <Brain size={28} />, color: '#9B59B6', title: '自研推理引擎', desc: '不依赖第三方 API，完全自主知识产权的链式推理引擎，越用越聪明。' },
  { icon: <Zap size={28} />, color: '#F1C40F', title: '自动化训练', desc: '从对话中自动挖掘知识，自我修正、蒸馏、评测，形成完整的进化闭环。' },
  { icon: <Shield size={28} />, color: '#2ECC71', title: '完全本地私有', desc: '数据不出服务器，支持本地部署，你的数据只属于你。' },
  { icon: <Infinity size={28} />, color: '#3498DB', title: '持续版本进化', desc: '每轮自训练都带来版本提升，从绮灵初醒到无限进化。' },
  { icon: <Heart size={28} />, color: '#E74C3C', title: '情感共鸣', desc: '不只回答你的问题，更理解你的心情，给你温暖的陪伴。' },
  { icon: <Sparkles size={28} />, color: '#F39C12', title: '多能力扩展', desc: '工具调用、插件系统、长期记忆、知识检索，多功能于一体。' },
]

const pricingPlans = [
  { name: '免费', price: '¥0', badge: 'free', features: ['每日 20 次对话', '基础推理', '手动训练', '可爱回复'], cta: '开始使用' },
  { name: 'Pro', price: '¥29', badge: 'pro', features: ['无限对话', '深度推理', '工具调用', '长期记忆', '永久有效'], cta: '升级 Pro', recommended: false },
  { name: 'Ultra', price: '¥79', badge: 'ultra', features: ['无限对话 Premium', '全工具链', '优先算力', '插件系统', '专属皮肤'], cta: '升级 Ultra', recommended: true },
  { name: '企业', price: '¥299', badge: 'enterprise', features: ['私有部署', '定制模型', 'SLA 保障', '专属支持', '无限用量'], cta: '联系商务' },
]

export default function HomePage() {
  const { isLoggedIn } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div className="version-badge" style={{margin:'0 auto 20px',width:'fit-content'}}>
          <Sparkles size={14} /> v3.0.0 星识觉醒
        </div>
        <h1 className="hero-title">
          自研可训练<br />
          <span className="gradient">AI 伙伴 · 绮灵</span>
        </h1>
        <p className="hero-subtitle">
          不依赖任何外部 API，完全自主研发的智能引擎。
          每一次对话都是训练，每一个版本都比上一个更强。
          专属于你的、会进化的 AI 伙伴。
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Link to={isLoggedIn ? '/chat' : '/login'} className="btn btn-primary" style={{fontSize:16,padding:'14px 32px'}}>
            <Sparkles size={20} /> 开始对话
          </Link>
          <Link to="/training" className="btn btn-secondary" style={{fontSize:16,padding:'14px 32px'}}>
            <Brain size={20} /> 训练绮灵
          </Link>
        </div>
      </section>

      {/* 特性 */}
      <section>
        <h2 className="section-title" style={{textAlign:'center'}}>为什么选择绮灵？</h2>
        <p className="section-subtitle" style={{textAlign:'center'}}>与众不同的自研 AI 体验</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="card feature-card">
              <div className="feature-icon" style={{background:f.color + '22', color:f.color}}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 定价 */}
      <section>
        <h2 className="section-title" style={{textAlign:'center'}}>选择你的版本</h2>
        <p className="section-subtitle" style={{textAlign:'center'}}>从免费到企业，满足不同需求</p>
        <div className="pricing-grid">
          {pricingPlans.map((plan, i) => (
            <div key={i} className={'card pricing-card' + (plan.recommended ? ' recommended' : '')}>
              {plan.recommended && <div className="recommended-badge">推荐</div>}
              <h3>{plan.name}</h3>
              <div className="price">{plan.price}<span>/月</span></div>
              <ul className="features">
                {plan.features.map((f, j) => <li key={j}>✨ {f}</li>)}
              </ul>
              <Link to="/login" className={'btn ' + (plan.recommended ? 'btn-primary' : 'btn-secondary')} style={{width:'100%',justifyContent:'center'}}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 版本演进 */}
      <section style={{textAlign:'center',padding:'40px 0'}}>
        <h2 className="section-title">无限进化之路</h2>
        <p className="section-subtitle">从初醒到天成，每个版本都代表一次质的飞跃</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          {['绮灵初醒 v1', '灵络扩展 v2', '星识觉醒 v3', '智链永续 v4', '绮灵天成 v5'].map((v, i) => (
            <div key={i} className="card" style={{padding:'16px 20px',minWidth:120}}>
              <div style={{fontSize:24,marginBottom:4}}>{['🌟','🔗','✨','🧠','💎'][i]}</div>
              <div style={{fontSize:13,fontWeight:600}}>{v}</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>Phase {i + 1}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}