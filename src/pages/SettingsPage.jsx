import { useState } from 'react'
import { Settings, Key, Palette, Bell, Shield, Globe, Monitor, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

export default function SettingsPage() {
  const { apiKey, tier, login, logout } = useAuth()
  const { settings, updateSetting } = useSettings()
  const [keyInput, setKeyInput] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      login(keyInput.trim())
      setKeyInput('')
      showToast('API 密钥已保存')
    }
  }

  return (
    <div style={{maxWidth:700}}>
      <h2 className="section-title">⚙️ 设置</h2>
      <p className="section-subtitle">配置绮灵的工作方式和你的偏好</p>

      {/* API 密钥 */}
      <div className="card settings-section" style={{marginBottom:24}}>
        <h3><Key size={18} /> API 密钥</h3>
        {apiKey ? (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <span style={{fontSize:12,color:'var(--success)'}}>✅ 已配置</span>
              <span className={'badge badge-' + tier}>{tier?.toUpperCase() || 'FREE'}</span>
              <span style={{fontSize:12,color:'var(--text-muted)',fontFamily:'monospace'}}>
                {apiKey.slice(0, 12)}...
              </span>
            </div>
            <button className="btn btn-ghost" onClick={logout} style={{color:'var(--danger)'}}>
              清除密钥
            </button>
          </div>
        ) : (
          <div>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:12}}>
              输入你的绮灵 API 密钥以开始对话
            </p>
            <div style={{display:'flex',gap:8}}>
              <input
                placeholder="输入 API 密钥..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{flex:1}}
              />
              <button className="btn btn-primary" onClick={handleSaveKey} disabled={!keyInput.trim()}>
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 对话设置 */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{marginBottom:16}}><Monitor size={18} /> 对话设置</h3>
        
        <div className="setting-row">
          <div className="info">
            <h4>回复风格</h4>
            <p>可爱模式 vs 专业模式</p>
          </div>
          <select 
            value={settings.mode} 
            onChange={(e) => updateSetting('mode', e.target.value)}
            style={{width:'auto'}}
          >
            <option value="cute">可爱 🎀</option>
            <option value="pro">专业 📊</option>
            <option value="normal">普通</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="info">
            <h4>工具调用</h4>
            <p>启用计算、搜索等工具</p>
          </div>
          <div 
            className={'toggle' + (settings.useTools ? ' active' : '')}
            onClick={() => updateSetting('useTools', !settings.useTools)}
          />
        </div>

        <div className="setting-row">
          <div className="info">
            <h4>长期记忆</h4>
            <p>记住之前的对话内容</p>
          </div>
          <div 
            className={'toggle' + (settings.useMemory ? ' active' : '')}
            onClick={() => updateSetting('useMemory', !settings.useMemory)}
          />
        </div>

        <div className="setting-row">
          <div className="info">
            <h4>流式输出</h4>
            <p>逐字显示回复</p>
          </div>
          <div 
            className={'toggle' + (settings.streamResponse ? ' active' : '')}
            onClick={() => updateSetting('streamResponse', !settings.streamResponse)}
          />
        </div>
      </div>

      {/* 显示设置 */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{marginBottom:16}}><Palette size={18} /> 显示设置</h3>
        
        <div className="setting-row">
          <div className="info">
            <h4>主题</h4>
            <p>深色 / 浅色</p>
          </div>
          <select 
            value={settings.theme} 
            onChange={(e) => updateSetting('theme', e.target.value)}
            style={{width:'auto'}}
          >
            <option value="dark">深色 🌙</option>
            <option value="light">浅色 ☀️</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="info">
            <h4>字体大小</h4>
            <p>调整聊天气泡的文字大小</p>
          </div>
          <input 
            type="range" 
            min={12} 
            max={20} 
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
            style={{width:120}}
          />
        </div>
      </div>

      {/* 关于 */}
      <div className="card">
        <h3 style={{marginBottom:16}}><Sparkles size={18} /> 关于绮灵</h3>
        <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.8}}>
          <p><strong>版本：</strong>v3.0.0 星识觉醒</p>
          <p><strong>引擎：</strong>自研可训练推理引擎 · 向量检索 + 本地模型推理</p>
          <p><strong>数据：</strong>完全本地存储，数据不出服务器</p>
          <p><strong>训练：</strong>支持手动训练 + 自动训练闭环</p>
          <p><strong>扩展：</strong>工具调用 · 插件系统 · 长期记忆 · Discord 集成</p>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}