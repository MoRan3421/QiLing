import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Menu, Plus, Crown, Key, Brain, Search, Settings,
  MessageCircle, Code, BookOpen, Heart, Wand2,
  Sun, Moon, ThumbsUp, ThumbsDown, LogOut, Home,
} from 'lucide-react'
import Logo from '../components/Logo'
import ChatMessage from '../components/ChatMessage'
import TypingIndicator from '../components/TypingIndicator'
import PremiumModal from '../components/PremiumModal'
import ApiKeyPanel from '../components/ApiKeyPanel'
import TrainingPanel from '../components/TrainingPanel'
import QueryPanel from '../components/QueryPanel'
import SettingsPanel from '../components/SettingsPanel'
import RateLimitBar from '../components/RateLimitBar'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { streamChat, submitFeedback, healthCheck, getVersion } from '../lib/api'
import '../App.css'

const MODES = [
  { id: 'cute', label: '可爱', icon: Heart },
  { id: 'pro', label: '专业', icon: Code },
  { id: 'creative', label: '创作', icon: Wand2 },
  { id: 'learn', label: '学霸', icon: BookOpen },
]

const SUGGESTIONS = [
  '绮灵，你怎么训练的？',
  '帮我写一首关于星星的诗',
  '解释一下量子纠缠',
  '你比 GPT 强在哪里？',
]

const WELCOME = {
  role: 'assistant',
  content: '你好呀！我是 **绮灵 QìLíng**～ ✨\n\n自研可训练 AI，功能可在设置里自由开关。教我新知识或随便聊聊吧！\n\n(◕‿◕✿)',
}

function loadState() {
  try {
    const saved = localStorage.getItem('qiling-state')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return { chats: [{ id: '1', title: '新对话', messages: [WELCOME] }], activeChat: '1' }
}

export default function ChatApp() {
  const navigate = useNavigate()
  const { user, apiKey, keyInfo, logout, refreshKeyInfo } = useAuth()
  const { settings, setAppearance } = useSettings()
  const { features, appearance } = settings

  const [state, setState] = useState(loadState)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [keyPanelOpen, setKeyPanelOpen] = useState(false)
  const [trainPanelOpen, setTrainPanelOpen] = useState(false)
  const [queryPanelOpen, setQueryPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mode, setMode] = useState(settings.chat.defaultMode)
  const [toast, setToast] = useState(null)
  const [serverOk, setServerOk] = useState(null)
  const [versionInfo, setVersionInfo] = useState(null)
  const bottomRef = useRef(null)

  const chat = state.chats.find((c) => c.id === state.activeChat) || state.chats[0]
  const messages = chat?.messages || []
  const tier = keyInfo?.tier || 'free'
  const isPro = ['pro', 'ultra', 'admin'].includes(tier)

  useEffect(() => {
    if (!apiKey) navigate('/login')
  }, [apiKey, navigate])

  useEffect(() => { localStorage.setItem('qiling-state', JSON.stringify(state)) }, [state])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streaming, isTyping])

  useEffect(() => {
    healthCheck().then(() => setServerOk(true)).catch(() => setServerOk(false))
    getVersion().then(setVersionInfo).catch(() => {})
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const sendMessage = async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || streaming || !apiKey) return

    const userMsg = { role: 'user', content: trimmed }
    const assistantPlaceholder = { role: 'assistant', content: '', question: trimmed }

    setState((s) => ({
      ...s,
      chats: s.chats.map((c) =>
        c.id === s.activeChat
          ? {
              ...c,
              title: c.messages.length <= 1 ? trimmed.slice(0, 20) : c.title,
              messages: [...c.messages, userMsg, assistantPlaceholder],
            }
          : c
      ),
    }))
    setInput('')
    setStreaming(true)
    if (features.typingIndicator) setIsTyping(true)

    let firstChunk = false
    try {
      await streamChat(apiKey, trimmed, mode, (chunk) => {
        if (!firstChunk) {
          firstChunk = true
          setIsTyping(false)
        }
        setState((s) => ({
          ...s,
          chats: s.chats.map((c) =>
            c.id === s.activeChat
              ? {
                  ...c,
                  messages: c.messages.map((m, i, arr) =>
                    i === arr.length - 1 ? { ...m, content: chunk } : m
                  ),
                }
              : c
          ),
        }))
      })
      refreshKeyInfo()
      if (features.soundNotify) {
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6WjHqF').play() } catch { /* ignore */ }
      }
    } catch (e) {
      setIsTyping(false)
      if (e.message.includes('额度') || e.message.includes('恢复')) setPremiumOpen(true)
      showToast(e.message)
    }
    setStreaming(false)
    setIsTyping(false)
  }

  const handleFeedback = async (msg, rating) => {
    if (!features.feedback) return
    const idx = messages.indexOf(msg)
    const question = msg.question || (idx > 0 ? messages[idx - 1]?.content : '')
    try {
      await submitFeedback(apiKey, question, msg.content, rating)
      showToast(rating > 0 ? '谢谢夸奖！绮灵记住了～ 💜' : '收到反馈，绮灵会改进的！')
    } catch { showToast('反馈失败') }
  }

  const newChat = () => {
    const id = Date.now().toString()
    setState((s) => ({
      ...s,
      activeChat: id,
      chats: [{ id, title: '新对话', messages: [WELCOME] }, ...s.chats],
    }))
  }

  const handleLogout = () => { logout(); navigate('/login') }

  if (!apiKey) return null

  return (
    <div className={`app ${appearance.darkMode ? '' : 'light'} ${appearance.compactMode ? 'compact' : ''}`}>
      <div className="bg-orbs"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>

      <AnimatePresence>
        {appearance.sidebarOpen && (
          <motion.aside className="sidebar" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}>
            <div className="sidebar-top">
              <Logo />
              <div className="user-pill">
                <span>{user?.nickname || '用户'}</span>
                <span className="tier-tag">{tier.toUpperCase()}</span>
              </div>
              <button className="btn-new" onClick={newChat}><Plus size={16} /> 新对话</button>
            </div>
            <div className="sidebar-nav">
              {features.training && (
                <button className="nav-btn" onClick={() => setTrainPanelOpen(true)}><Brain size={16} /> 训练中心</button>
              )}
              {features.query && (
                <button className="nav-btn" onClick={() => setQueryPanelOpen(true)}><Search size={16} /> 资料查询</button>
              )}
              <button className="nav-btn" onClick={() => setKeyPanelOpen(true)}><Key size={16} /> API 密钥</button>
              <button className="nav-btn" onClick={() => setSettingsOpen(true)}><Settings size={16} /> 功能设置</button>
              <Link to="/" className="nav-btn"><Home size={16} /> 主页</Link>
            </div>
            {features.rateLimitBar && keyInfo && (
              <div className="sidebar-rate"><RateLimitBar keyInfo={keyInfo} /></div>
            )}
            <div className="sidebar-chats">
              {state.chats.map((c) => (
                <div key={c.id} className={`chat-item ${c.id === state.activeChat ? 'active' : ''}`}
                  onClick={() => setState((s) => ({ ...s, activeChat: c.id }))}>
                  <MessageCircle size={14} /><span>{c.title}</span>
                </div>
              ))}
            </div>
            <div className="sidebar-bottom">
              <button className="btn-upgrade" onClick={() => setPremiumOpen(true)}>
                <Crown size={16} />{isPro ? 'Pro 会员' : '升级 Pro'}
              </button>
              <button className="btn-logout" onClick={handleLogout}><LogOut size={14} /> 退出登录</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="main">
        <header className="header">
          <button className="btn-icon" onClick={() => setAppearance('sidebarOpen', !appearance.sidebarOpen)}><Menu size={20} /></button>
          <div className="header-center">
            <Logo size={32} sub="" />
            <span className="header-tag">Phase {versionInfo?.phase || 2}</span>
          </div>
          <span className="header-status">{serverOk ? '🟢 在线' : '🔴 离线'}</span>
          <button className="btn-icon" onClick={() => setAppearance('darkMode', !appearance.darkMode)}>
            {appearance.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="modes">
          {MODES.map((m) => (
            <button key={m.id} className={`mode-btn ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
              <m.icon size={14} />{m.label}
            </button>
          ))}
        </div>

        <div className="messages">
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1
            const showTyping = isTyping && isLast && msg.role === 'assistant' && !msg.content
            if (showTyping) {
              return <TypingIndicator key={i} />
            }
            return (
              <div key={i}>
                <ChatMessage
                  message={msg}
                  isStreaming={streaming && isLast && msg.role === 'assistant' && !!msg.content}
                />
                {features.feedback && msg.role === 'assistant' && msg.content && !streaming && (
                  <div className="msg-actions">
                    <button className="fb-btn" onClick={() => handleFeedback(msg, 1)}><ThumbsUp size={12} /> 好棒</button>
                    <button className="fb-btn" onClick={() => handleFeedback(msg, -1)}><ThumbsDown size={12} /> 改进</button>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {features.suggestions && messages.length <= 1 && (
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="input-area">
          <div className="input-box">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder={streaming ? '绮灵正在输入中…' : '跟绮灵说点什么吧～ ✨'}
              rows={1} disabled={streaming} />
            <button className="btn-send" onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}>
              <Send size={18} />
            </button>
          </div>
          <p className="input-hint">
            {keyInfo?.rateLimit?.recoverLabel || '绮灵 Brain'}
            {tier === 'free' && keyInfo?.rateLimit?.dailyRecoverLabel ? ` · ${keyInfo.rateLimit.dailyRecoverLabel}` : ''}
          </p>
        </div>
      </main>

      {premiumOpen && <PremiumModal open onClose={() => setPremiumOpen(false)} onUpgrade={() => showToast('请联系管理员获取 Pro 邀请码')} isPro={isPro} />}
      {keyPanelOpen && <ApiKeyPanel apiKey={apiKey} onSave={() => { setKeyPanelOpen(false); refreshKeyInfo() }} onClose={() => setKeyPanelOpen(false)} />}
      {features.training && trainPanelOpen && <TrainingPanel apiKey={apiKey} onClose={() => setTrainPanelOpen(false)} onToast={showToast} />}
      {features.query && queryPanelOpen && <QueryPanel apiKey={apiKey} onClose={() => setQueryPanelOpen(false)} onToast={showToast} />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
