import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home, MessageSquare, Brain, Settings, BarChart3, 
  GitBranch, BookOpen, LogIn, Menu, X, Sparkles, Shield, Star
} from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: '首页', exact: true },
  { path: '/chat', icon: MessageSquare, label: '对话', exact: false },
  { path: '/training', icon: Brain, label: '训练中心', exact: false },
  { path: '/dashboard', icon: BarChart3, label: '仪表盘', exact: false },
  { path: '/versions', icon: GitBranch, label: '版本进化', exact: false },
  { path: '/api-docs', icon: BookOpen, label: 'API 文档', exact: false },
  { path: '/settings', icon: Settings, label: '设置', exact: false },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="app-layout">
      {/* 侧边栏 */}
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="sidebar-logo">
          <img src="/qiling-logo.png" alt="绮灵" onError={(e) => { e.target.style.display = 'none' }} />
          <div>
            <h1>绮灵</h1>
            <span style={{display:'block', fontSize:11,color:'var(--text-muted)',marginTop:-2}}>QìLíng AI v3</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <item.icon className="icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/login" className="nav-item">
            <LogIn className="icon" />
            登录 / API 密钥
          </NavLink>
          <div style={{padding:'12px 16px', display:'flex', gap:6, flexWrap:'wrap'}}>
            <span className="badge badge-free">免费</span>
            <span className="badge badge-pro">Pro</span>
            <span className="badge badge-ultra">Ultra</span>
            <span className="badge badge-enterprise">企业</span>
          </div>
        </div>
      </aside>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div 
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:99}}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容 */}
      <main className="main-content">
        {/* 移动端顶部栏 */}
        <div style={{
          display:'none', 
          padding:'12px 20px',
          background:'var(--bg-card)',
          borderBottom:'1px solid var(--border)',
          alignItems:'center',
          gap:12
        }} className="mobile-header">
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{background:'none',border:'none',color:'var(--text-primary)',cursor:'pointer',padding:4}}
          >
            <Menu size={24} />
          </button>
          <span style={{fontSize:18,fontWeight:700}}>绮灵</span>
        </div>

        <div className="page">
          {children}
        </div>

        <div className="footer">
          绮灵 QìLíng — 自研可训练 AI 伙伴 · v3.0
        </div>
      </main>
    </div>
  )
}