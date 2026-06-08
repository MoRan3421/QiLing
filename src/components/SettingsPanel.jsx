import { motion } from 'framer-motion'
import { Settings, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const FEATURES = [
  { key: 'training', label: '训练中心', desc: '教导绮灵新知识' },
  { key: 'query', label: '资料查询', desc: '搜索百科和知识库' },
  { key: 'feedback', label: '点赞反馈', desc: '对话后显示 👍👎' },
  { key: 'suggestions', label: '快捷话题', desc: '新对话推荐问题' },
  { key: 'rateLimitBar', label: '速率监控', desc: '侧边栏显示配额' },
  { key: 'typingIndicator', label: '正在输入', desc: '回复前显示输入动画' },
  { key: 'streamEffect', label: '流式打字', desc: '逐字显示回复' },
  { key: 'soundNotify', label: '消息音效', desc: '收到回复时提示音' },
]

export default function SettingsPanel({ onClose }) {
  const { settings, toggleFeature, setAppearance } = useSettings()

  return (
    <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="panel-content settings-panel" initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2><Settings size={20} /> 功能设置</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="panel-desc">自由开关功能模块，打造你的专属绮灵体验</p>

        <div className="settings-section">
          <h3>功能开关</h3>
          {FEATURES.map((f) => (
            <button key={f.key} className="toggle-row" onClick={() => toggleFeature(f.key)}>
              <div>
                <div className="toggle-label">{f.label}</div>
                <div className="toggle-desc">{f.desc}</div>
              </div>
              {settings.features[f.key]
                ? <ToggleRight size={28} className="toggle-on" />
                : <ToggleLeft size={28} className="toggle-off" />}
            </button>
          ))}
        </div>

        <div className="settings-section">
          <h3>外观</h3>
          <button className="toggle-row" onClick={() => setAppearance('compactMode', !settings.appearance.compactMode)}>
            <div>
              <div className="toggle-label">紧凑模式</div>
              <div className="toggle-desc">缩小间距，显示更多内容</div>
            </div>
            {settings.appearance.compactMode
              ? <ToggleRight size={28} className="toggle-on" />
              : <ToggleLeft size={28} className="toggle-off" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
