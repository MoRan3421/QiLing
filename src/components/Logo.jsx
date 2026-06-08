import { motion } from 'framer-motion'

export function LogoIcon({ size = 42, animate = true }) {
  const Wrapper = animate ? motion.div : 'div'
  const props = animate ? {
    whileHover: { scale: 1.05, rotate: 3 },
    transition: { type: 'spring', stiffness: 300 },
  } : {}

  return (
    <Wrapper className="logo-wrap" style={{ width: size, height: size }} {...props}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="lg2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#lg2)" opacity="0.15" />
        <circle cx="50" cy="50" r="38" fill="url(#lg1)" filter="url(#glow)" opacity="0.9" />
        <circle cx="50" cy="50" r="30" fill="url(#lg2)" opacity="0.4" />
        <path d="M30 55 Q50 30 70 55 Q50 75 30 55" fill="white" opacity="0.25" />
        <circle cx="40" cy="46" r="4" fill="white" opacity="0.9" />
        <circle cx="60" cy="46" r="4" fill="white" opacity="0.9" />
        <circle cx="41" cy="45" r="1.5" fill="#7c3aed" />
        <circle cx="61" cy="45" r="1.5" fill="#7c3aed" />
        <path d="M42 56 Q50 62 58 56" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <circle cx="25" cy="25" r="2" fill="#fbbf24" opacity="0.8">
          {animate && <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="78" cy="30" r="1.5" fill="#38bdf8" opacity="0.8">
          {animate && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="72" cy="72" r="2" fill="#f472b6" opacity="0.7">
          {animate && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />}
        </circle>
      </svg>
    </Wrapper>
  )
}

export default function Logo({ size = 42, showText = true, sub = 'QìLíng AI' }) {
  return (
    <div className="logo-brand">
      <LogoIcon size={size} />
      {showText && (
        <div className="logo-text">
          <span className="logo-title">绮灵</span>
          {sub && <span className="logo-sub">{sub}</span>}
        </div>
      )}
    </div>
  )
}
