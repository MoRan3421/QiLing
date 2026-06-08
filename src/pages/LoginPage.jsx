import { useState } from 'react'
import { Key, Sparkles, Copy, Check, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function LoginPage() {
  const { apiKey, tier, login, logout } = useAuth()
  const navigate = useNavigate()
  const [keyInput, setKeyInput] = useState('')
  const [label, setLabel] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleRegister = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL + '/keys/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim() || '用户',
          inviteCode: inviteCode.trim() || undefined
        })
      })
      
      if (!res.ok) throw new Error((await res.json()).error)
      
      const data = await res.json()
      setNewKey(data)
      login(data.key)
      showToast('✅ ' + (data.message || '密钥已创建'))
    } catch (e) {
      showToast('创建失败: ' + e.message)
    }
    setLoading(false)
  }

  const handleUseExisting = () => {
    if (keyInput.trim()) {
      login(keyInput.trim())
      setKeyInput('')
      showToast('✅ 密钥已配置')
      navigate('/chat')
    }
  }

  const copyToClipboard = () => {
    if (newKey?.key) {
      navigator.clipboard.writeText(newKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="login-page" style={{minHeight:'calc(100vh - 120px)'}}>
      <div className="card login-card">
        <div style={{fontSize:48,marginBottom:16}}>✨</div>
        <h2>绮灵 API 密钥</h2>
        <p>免费获取密钥，开始使用绮灵 AI</p>

        {/* 已有密钥 */}
        {apiKey ? (
          <div style={{marginBottom:24}}>
            <div style={{
              background:'var(--bg-surface)',border:'1px solid var(--border)',
              borderRadius:'var(--radius)',padding:16,marginBottom:12
            }}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <Shield size={16} style={{color:'var(--success)'}} />
                <span style={{fontSize:14,fontWeight:600}}>已配置密钥</span>
                <span className={'badge badge-' + tier} style={{marginLeft:'auto'}}>
                  {tier?.toUpperCase() || 'FREE'}
                </span>
              </div>
              <code style={{fontSize:12,color:'var(--text-muted)'}}>
                {apiKey.slice(0, 16)}...{apiKey.slice(-4)}
              </code>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={() => navigate('/chat')} style={{flex:1,justifyContent:'center'}}>
                <Sparkles size={16} /> 开始对话
              </button>
              <button className="btn btn-ghost" onClick={logout} style={{color:'var(--danger)'}}>
                清除
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* 注册新密钥 */}
            <div style={{marginBottom:24}}>
              <h4 style={{fontSize:14,marginBottom:12,color:'var(--text-secondary)'}}>
                获取新密钥
              </h4>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <input
                  placeholder="应用名称（可选）"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <input
                  placeholder="邀请码（选填，升级 Pro/Ultra）"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleRegister} disabled={loading} style={{justifyContent:'center'}}>
                  {loading ? '创建中...' : '免费获取密钥'}
                </button>
              </div>
            </div>

            <div style={{position:'relative',margin:'16px 0'}}>
              <div style={{borderTop:'1px solid var(--border)'}} />
              <div style={{
                position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',
                background:'var(--bg-card)',padding:'0 12px',
                fontSize:12,color:'var(--text-muted)'
              }}>或者</div>
            </div>

            {/* 使用已有密钥 */}
            <div>
              <h4 style={{fontSize:14,marginBottom:12,color:'var(--text-secondary)'}}>
                使用已有密钥
              </h4>
              <div style={{display:'flex',gap:8}}>
                <input
                  placeholder="粘贴 API 密钥..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  style={{flex:1,fontFamily:'monospace',fontSize:12}}
                />
                <button className="btn btn-primary" onClick={handleUseExisting} disabled={!keyInput.trim()}>
                  <Key size={16} /> 配置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新建密钥展示 */}
        {newKey && (
          <div style={{
            marginTop:24,padding:20,background:'rgba(46,204,113,0.05)',
            border:'1px solid rgba(46,204,113,0.2)',borderRadius:'var(--radius)'
          }}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <Shield size={18} style={{color:'var(--success)'}} />
              <span style={{fontWeight:600}}>密钥已创建！</span>
              <span className={'badge badge-' + newKey.tier}>{newKey.tier?.toUpperCase()}</span>
            </div>
            <div style={{
              background:'var(--bg-dark)',border:'1px solid var(--border)',
              borderRadius:8,padding:'12px 16px',marginBottom:12,
              fontFamily:'monospace',fontSize:13,wordBreak:'break-all',
              display:'flex',alignItems:'center',gap:8
            }}>
              <code style={{flex:1,fontSize:12}}>{newKey.key}</code>
              <button onClick={copyToClipboard} style={{
                background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',
                padding:4,flexShrink:0
              }}>
                {copied ? <Check size={16} style={{color:'var(--success)'}} /> : <Copy size={16} />}
              </button>
            </div>
            <p style={{fontSize:12,color:'var(--danger)',margin:0}}>
              ⚠️ 请立即保存！此密钥只显示一次。
            </p>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}