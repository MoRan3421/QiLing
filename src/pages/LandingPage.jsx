import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Brain, Shield, Zap, MessageCircle, Search,
  Bot, ArrowRight, Star, Heart, Code,
} from 'lucide-react'
import Logo from '../components/Logo'

const FEATURES = [
  { icon: Brain, title: '自研可训练', desc: '绮灵 Brain 引擎，越教越聪明，不依赖 GPT' },
  { icon: Shield, title: '零第三方 Key', desc: '完全自主开发，API Key 由你自己掌控' },
  { icon: Zap, title: '智能限流', desc: '免费版按分钟恢复，Pro 永久无限' },
  { icon: Search, title: '资料查询', desc: '百科、FAQ、训练知识库一键搜索' },
  { icon: Bot, title: 'Discord 接入', desc: '斜杠命令直连同一套 AI 大脑' },
  { icon: Heart, title: '可爱回复', desc: '萌萌语气 + 流式打字 + 正在输入动画' },
]

const PHASES = [
  { n: 1, name: '绮灵初醒', status: 'done', items: ['核心对话', '训练中心', 'API Key'] },
  { n: 2, name: '灵络扩展', status: 'current', items: ['速率限制', 'Discord', '资料查询'] },
  { n: 3, name: '星识觉醒', status: 'soon', items: ['联网搜索', '多模态', '插件'] },
  { n: 4, name: '绮灵天成', status: 'soon', items: ['集群', '支付', '企业版'] },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="bg-orbs"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>

      <nav className="landing-nav">
        <Logo size={36} />
        <div className="nav-links">
          <a href="#features">功能</a>
          <a href="#phases">路线图</a>
          <a href="#about">介绍</a>
          <Link to="/login" className="nav-login">登录</Link>
          <Link to="/login" className="nav-cta">免费开始 <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <section className="hero">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="hero-badge"><Sparkles size={14} /> 自研 AI · Phase 2</div>
          <h1>绮灵 <span>QìLíng</span></h1>
          <p className="hero-sub">比星星还懂你的下一代智能伙伴<br />可训练 · 可定制 · 完全属于你</p>
          <div className="hero-actions">
            <Link to="/login" className="btn-hero-primary">立即体验 <ArrowRight size={18} /></Link>
            <a href="https://github.com/MoRan3421/QiLing" target="_blank" rel="noreferrer" className="btn-hero-secondary">
              <Code size={16} /> GitHub
            </a>
          </div>
          <div className="hero-stats">
            <div><strong>4</strong><span>开发阶段</span></div>
            <div><strong>8+</strong><span>可切换功能</span></div>
            <div><strong>∞</strong><span>训练可能</span></div>
          </div>
        </motion.div>
        <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <img src="/qiling-logo.png" alt="绮灵" className="hero-logo" onError={(e) => { e.target.style.display = 'none' }} />
          <div className="hero-chat-demo">
            <div className="demo-msg user">你好绮灵！</div>
            <div className="demo-msg ai">
              <span className="demo-typing">绮灵正在输入中<span className="dots">...</span></span>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="section">
        <h2>强大功能</h2>
        <p className="section-sub">全部可自由开关，打造专属 AI 体验</p>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
              <div className="feature-icon"><f.icon size={22} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="phases" className="section">
        <h2>四阶段路线图</h2>
        <div className="phase-timeline">
          {PHASES.map((p) => (
            <div key={p.n} className={`phase-card ${p.status}`}>
              <div className="phase-num">Phase {p.n}</div>
              <h3>{p.name}</h3>
              <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              {p.status === 'current' && <span className="phase-badge">当前</span>}
              {p.status === 'done' && <span className="phase-badge done">已发布</span>}
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="section about-section">
        <h2>什么是绮灵？</h2>
        <div className="about-content">
          <p><strong>绮灵（QìLíng）</strong>是一套完全自研的开源 AI 系统。「绮」代表华美精致，「灵」代表灵动聪慧。</p>
          <p>与 ChatGPT 等不同，绮灵不依赖任何第三方 API Key。它的智能来自 <strong>绮灵 Brain</strong> — 一个可训练的推理引擎，结合 RAG 检索、链式推理和反馈学习。</p>
          <p>你可以通过训练中心教导它、通过资料查询搜索知识库、通过 Discord 机器人在任何地方使用它。免费版按分钟恢复配额，Pro 版永久无限。</p>
        </div>
        <Link to="/login" className="btn-hero-primary" style={{ marginTop: 24 }}>
          <MessageCircle size={18} /> 登录并开始对话
        </Link>
      </section>

      <footer className="landing-footer">
        <Logo size={28} sub="QìLíng AI" />
        <p>© 2026 绮灵 · <a href="https://github.com/MoRan3421/QiLing">GitHub</a></p>
      </footer>
    </div>
  )
}
