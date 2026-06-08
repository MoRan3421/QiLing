import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Copy, Check, Crown, Sparkles } from 'lucide-react'
import { registerKey, verifyKey } from '../lib/api'

export default function ApiKeyPanel({ apiKey, onSave, onClose }) {
  const [label, setLabel] = useState('')
  const [invite, setInvite] = useState('')
  const [newKey, setNewKey] = useState(null)
  const [inputKey, setInputKey] = useState(apiKey || '')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyInfo, setKeyInfo] = useState(null)

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await registerKey(label, invite || undefined)
      setNewKey(data.key)
      onSave(data.key, data.tier)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    try {
      const info = await verifyKey(inputKey)
      setKeyInfo(info)
      onSave(inputKey, info.tier)
    } catch (e) {
      setError(e.message)
      setKeyInfo(null)
    }
    setLoading(false)
  }

  const copyKey = () => {
    navigator.clipboard.writeText(newKey || inputKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="panel-content api-panel" initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
        <h2><Key size={20} /> API 密钥</h2>
        <p className="panel-desc">绮灵不内置任何第三方 API Key，使用自研引擎。注册密钥即可使用。</p>

        {!apiKey && !newKey && (
          <div className="api-section">
            <h3><Sparkles size={16} /> 免费注册</h3>
            <input placeholder="昵称（可选）" value={label} onChange={(e) => setLabel(e.target.value)} />
            <input placeholder="Pro 邀请码（可选）" value={invite} onChange={(e) => setInvite(e.target.value)} />
            <button className="btn-primary" onClick={handleRegister} disabled={loading}>
              {loading ? '创建中…' : '获取免费 API Key'}
            </button>
            <p className="api-note">免费版：50 条/天 · Pro：无限 + 深度推理</p>
          </div>
        )}

        {newKey && (
          <div className="api-section key-reveal">
            <h3>🎉 密钥已创建（仅显示一次）</h3>
            <div className="key-box">
              <code>{newKey}</code>
              <button onClick={copyKey}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
            </div>
            <button className="btn-primary" onClick={onClose}>开始使用</button>
          </div>
        )}

        <div className="api-divider">或</div>

        <div className="api-section">
          <h3>已有密钥</h3>
          <input
            type="password"
            placeholder="ql_free_... 或 ql_pro_..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
          />
          <button className="btn-secondary" onClick={handleVerify} disabled={loading || !inputKey}>
            验证并登录
          </button>
        </div>

        {keyInfo && (
          <div className="key-info">
            <span className={`tier-badge tier-${keyInfo.tier}`}>
              {keyInfo.tier === 'pro' ? <><Crown size={12} /> Pro</> : '免费版'}
            </span>
            <span>今日 {keyInfo.dailyCount}/{keyInfo.limit} · 剩余 {keyInfo.remaining}</span>
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}
      </motion.div>
    </motion.div>
  )
}
