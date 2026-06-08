import { Zap, Clock, Gauge, Timer } from 'lucide-react'

export default function RateLimitBar({ keyInfo }) {
  if (!keyInfo?.rateLimit) return null
  const r = keyInfo.rateLimit
  const secPct = (r.perSecond.used / r.perSecond.max) * 100
  const minPct = (r.perMinute.used / r.perMinute.max) * 100
  const tokenPct = (r.tokens / r.bucketMax) * 100
  const isFree = keyInfo.tier === 'free'

  return (
    <div className="rate-bar">
      <div className="rate-title">
        <Gauge size={14} />
        速率限制
        {keyInfo.permanent && <span className="perm-badge">永久</span>}
      </div>
      <div className="rate-meters">
        <Meter icon={Zap} label="每秒" used={r.perSecond.used} max={r.perSecond.max} pct={secPct} />
        <Meter icon={Clock} label="每分钟" used={r.perMinute.used} max={r.perMinute.max} pct={minPct} />
        <Meter icon={Gauge} label="令牌" used={r.tokens} max={r.bucketMax} pct={tokenPct} />
      </div>
      {isFree && r.recoverLabel && (
        <div className="rate-recover">
          <Timer size={12} />
          <span>{r.recoverLabel}</span>
        </div>
      )}
      {isFree && r.dailyRecoverLabel && (
        <div className="rate-recover daily">
          <span>{r.dailyRecoverLabel}</span>
        </div>
      )}
      {!isFree && r.recoverPerSecond > 0 && (
        <div className="rate-recover"><span>恢复 {r.recoverPerSecond} 令牌/秒</span></div>
      )}
      {r.nextRecoverInSeconds > 0 && (
        <div className="rate-next">下次恢复约 {Math.ceil(r.nextRecoverInSeconds / 60)} 分钟</div>
      )}
      <div className="rate-tier">{keyInfo.tier?.toUpperCase()} · 今日 {keyInfo.dailyCount}/{keyInfo.dailyLimit}</div>
    </div>
  )
}

function Meter({ icon: Icon, label, used, max, pct }) {
  return (
    <div className="meter">
      <div className="meter-label"><Icon size={12} /> {label} {used}/{max}</div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
    </div>
  )
}
