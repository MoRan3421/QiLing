import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function TypingIndicator({ name = '绮灵' }) {
  return (
    <motion.div
      className="typing-indicator"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <div className="msg-avatar avatar-ai">
        <Sparkles size={18} />
      </div>
      <div className="typing-body">
        <div className="msg-name">{name}</div>
        <div className="typing-bubble">
          <span className="typing-text">正在输入中</span>
          <span className="typing-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        </div>
      </div>
    </motion.div>
  )
}
