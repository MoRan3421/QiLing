import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Zap, Heart, Brain, Globe, Check } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: '免费版',
    price: '¥0',
    period: '永久',
    features: ['1次/秒 · 10次/分', '每日 50 条', '基础推理', '可爱模式'],
    cta: '当前方案',
    highlight: false,
  },
  {
    id: 'pro',
    name: '绮灵 Pro',
    price: '¥29',
    period: '/月',
    features: ['5次/秒 · 60次/分', '永久 API Key', '无限对话', '深度推理', '令牌恢复 2/秒'],
    cta: '立即升级',
    highlight: true,
    icon: Zap,
  },
  {
    id: 'ultra',
    name: '绮灵 Ultra',
    price: '¥79',
    period: '/月',
    features: ['10次/秒 · 120次/分', '永久 API Key', 'Pro 全部功能', 'Phase 3 优先体验', '令牌恢复 5/秒'],
    cta: '尊享升级',
    highlight: false,
    icon: Crown,
  },
]

export default function PremiumModal({ open, onClose, onUpgrade, isPro }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="关闭">
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="modal-badge">💎 值得付费的 AI</div>
              <h2>升级绮灵，解锁超强能力</h2>
              <p>不只是工具，是懂你的 AI 伙伴</p>
            </div>

            <div className="modal-perks">
              {[
                { icon: Brain, text: '深度推理' },
                { icon: Heart, text: '情感共鸣' },
                { icon: Globe, text: '实时联网' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="perk">
                  <Icon size={16} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="plans-grid">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.highlight ? 'plan-highlight' : ''}`}
                >
                  {plan.highlight && <div className="plan-tag">最受欢迎</div>}
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price-num">{plan.price}</span>
                    <span className="price-period">{plan.period}</span>
                  </div>
                  <ul>
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={14} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`plan-btn ${plan.highlight ? 'plan-btn-primary' : ''}`}
                    onClick={() => plan.id !== 'free' && onUpgrade(plan.id)}
                    disabled={plan.id === 'free' || (isPro && plan.id === 'pro')}
                  >
                    {isPro && plan.id === 'pro' ? '已开通 ✓' : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
