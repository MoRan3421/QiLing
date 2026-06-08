import { motion } from 'framer-motion'
import { Sparkles, User } from 'lucide-react'

function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ))
  })
}

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={`msg ${isUser ? 'msg-user' : 'msg-ai'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`msg-avatar ${isUser ? 'avatar-user' : 'avatar-ai'}`}>
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>
      <div className="msg-body">
        <div className="msg-name">{isUser ? '你' : '绮灵'}</div>
        <div className="msg-content">
          {renderMarkdown(message.content)}
          {isStreaming && <span className="cursor-blink">▍</span>}
        </div>
      </div>
    </motion.div>
  )
}
