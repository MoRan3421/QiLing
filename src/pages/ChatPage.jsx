import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function ChatPage() {
  const { apiKey, tier } = useAuth()
  const { settings } = useSettings()
  const [messages, setMessages] = useState([
    { role: 'bot', content: '嘿嘿～ 绮灵来啦 ✨ 今天想聊什么呀？或者去训练中心教我新知识，我会越来越聪明哦！' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'bot', content: '请先在设置页面配置 API 密钥后再开始对话～ 💜' }])
      setLoading(false)
      return
    }

    try {
      const res = await fetch(API_URL + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ message: userMsg, mode: settings.mode, useTools: settings.useTools })
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '请求失败')
      }
      
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.response || '绮灵正在思考中…' }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', content: '啊哦，出错了：' + e.message + '\n\n请检查 API 密钥和服务器状态～' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{maxWidth:800,margin:'0 auto',display:'flex',flexDirection:'column',height:'calc(100vh - 120px)'}}>
      <div className="chat-messages" style={{flex:1,overflowY:'auto'}}>
        {messages.map((msg, i) => (
          <div key={i} className={'chat-message ' + msg.role}>
            <div className="message-avatar">
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="message-content" style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message bot">
            <div className="message-avatar"><Bot size={18} /></div>
            <div className="message-content">
              <Loader2 size={18} className="animate-spin" style={{display:'inline'}} /> 绮灵正在思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div style={{display:'flex',gap:8,marginBottom:8,alignItems:'center',flexWrap:'wrap'}}>
          <span className="version-badge">
            <Sparkles size={12} /> v3.0 · {tier?.toUpperCase() || 'FREE'}
          </span>
          {!apiKey && (
            <span style={{fontSize:12,color:'var(--danger)'}}>⚠️ 未配置 API 密钥</span>
          )}
        </div>
        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="对绮灵说点什么吧…"
            rows={1}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()} style={{borderRadius:22,width:44,height:44,padding:0,justifyContent:'center',flexShrink:0}}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}