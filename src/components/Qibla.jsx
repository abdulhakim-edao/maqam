import { useState, useEffect, useCallback, useRef } from 'react'
import { getQiblaDirection } from '../utils/qibla'
import MasjidFinder from './MasjidFinder'

const DEFAULT = { lat: 44.9778, lng: -93.2650 }
const TICK_COUNT = 60   // finer ticks for richer ring

export default function Qibla() {
  const [subTab, setSubTab]             = useState('compass')
  const [qibla, setQibla]           = useState(null)
  const [heading, setHeading]       = useState(0)
  const smoothHeading               = useRef(0)
  const rafRef                      = useRef(null)
  const [compassState, setCompassState] = useState('idle') // idle | requesting | active | denied
  const [aligned, setAligned]       = useState(false)

  // Get qibla bearing from geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setQibla(getQiblaDirection(DEFAULT.lat, DEFAULT.lng)); return
    }
    navigator.geolocation.getCurrentPosition(
      p => setQibla(getQiblaDirection(p.coords.latitude, p.coords.longitude)),
      () => setQibla(getQiblaDirection(DEFAULT.lat, DEFAULT.lng)),
      { timeout: 8000 }
    )
  }, [])

  // Smooth heading via easing on RAF
  const targetHeading = useRef(0)
  const handleOrientation = useCallback((e) => {
    let raw
    if (e.webkitCompassHeading != null) {
      raw = e.webkitCompassHeading
    } else if (e.alpha != null) {
      raw = (360 - e.alpha) % 360
    } else return

    // Shortest-arc to avoid flipping through 0/360
    let diff = raw - targetHeading.current
    if (diff > 180)  diff -= 360
    if (diff < -180) diff += 360
    targetHeading.current = targetHeading.current + diff
  }, [])

  // RAF loop for smooth interpolation
  useEffect(() => {
    if (compassState !== 'active') return
    const tick = () => {
      const diff = targetHeading.current - smoothHeading.current
      smoothHeading.current += diff * 0.12   // ease factor
      setHeading(smoothHeading.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [compassState])

  const enableCompass = useCallback(async () => {
    setCompassState('requesting')
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEvent.requestPermission()
        if (result !== 'granted') { setCompassState('denied'); return }
      } catch {
        setCompassState('denied'); return
      }
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation, true)
    window.addEventListener('deviceorientation', handleOrientation, true)
    setCompassState('active')
  }, [handleOrientation])

  // Auto-request on mount (works on Android and non-permission iOS)
  useEffect(() => {
    enableCompass()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleOrientation])

  const needleAngle = qibla != null ? qibla - heading : 0
  const bearing     = qibla != null ? Math.round(qibla) : null

  // Aligned glow when within ±5°
  useEffect(() => {
    if (qibla == null) return
    const diff = Math.abs(((needleAngle % 360) + 360) % 360)
    setAligned(diff < 5 || diff > 355)
  }, [needleAngle, qibla])

  // Generate tick marks
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angleDeg = (i * 360) / TICK_COUNT
    const rad = (angleDeg - 90) * (Math.PI / 180)
    const isMajor  = i % 15 === 0   // cardinal N/E/S/W
    const isMedium = i % 5 === 0
    const r1 = 90
    const r2 = isMajor ? 76 : isMedium ? 82 : 86
    return { x1: Math.cos(rad)*r1, y1: Math.sin(rad)*r1,
             x2: Math.cos(rad)*r2, y2: Math.sin(rad)*r2,
             major: isMajor, medium: isMedium }
  })

  return (
    <div className="qibla-page">
      {/* Sub-tabs */}
      <div className="adhkar-tabs" style={{ marginBottom: '8px' }}>
        <button className={`adhkar-tab${subTab === 'compass' ? ' active' : ''}`} onClick={() => setSubTab('compass')}>Compass</button>
        <button className={`adhkar-tab${subTab === 'masajid' ? ' active' : ''}`} onClick={() => setSubTab('masajid')}>Nearby Masajid</button>
      </div>

      {subTab === 'masajid' && <MasjidFinder />}

      {subTab === 'compass' && <>
      <div className="qibla-title-row">
        <h2 className="qibla-title">Qibla</h2>
        <span className="qibla-arabic">القبلة</span>
      </div>

      {/* Compass */}
      <div className={`compass-wrap${aligned ? ' compass-aligned' : ''}`}>
        {/* Outer decorative ring */}
        <div className="compass-outer-ring" />

        <svg viewBox="-100 -100 200 200" className="compass-svg" aria-label="Qibla compass">
          <defs>
            <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#181114" />
              <stop offset="100%" stopColor="#0D090A" />
            </radialGradient>
            <linearGradient id="needleGrad" x1="0" y1="-75" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#4AADCB" />
              <stop offset="70%"  stopColor="rgba(74,173,203,0.5)" />
              <stop offset="100%" stopColor="rgba(74,173,203,0)" />
            </linearGradient>
            <filter id="needleGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {aligned && (
              <filter id="alignGlow">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            )}
          </defs>

          {/* Background disc */}
          <circle cx="0" cy="0" r="92" fill="url(#compassBg)" />

          {/* Subtle inner glow ring */}
          <circle cx="0" cy="0" r="91" fill="none"
            stroke={aligned ? 'rgba(212,151,90,0.5)' : 'rgba(74,173,203,0.2)'}
            strokeWidth="1.5"
            style={{ transition: 'stroke 0.4s' }} />

          {/* Tick marks (static ring — compass face rotates with device illusion via needle) */}
          {ticks.map((t, i) => (
            <line key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={t.major ? 'rgba(212,151,90,0.7)' : t.medium ? 'rgba(74,173,203,0.35)' : 'rgba(255,255,255,0.1)'}
              strokeWidth={t.major ? '2' : t.medium ? '1.2' : '0.8'}
            />
          ))}

          {/* Cardinal letters */}
          <text x="0"   y="-68" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#D4975A" letterSpacing="1">N</text>
          <text x="0"   y="72"  textAnchor="middle" dominantBaseline="middle" fontSize="9"  fontWeight="400" fill="rgba(74,173,203,0.5)">S</text>
          <text x="72"  y="0"   textAnchor="middle" dominantBaseline="middle" fontSize="9"  fontWeight="400" fill="rgba(74,173,203,0.5)">E</text>
          <text x="-72" y="0"   textAnchor="middle" dominantBaseline="middle" fontSize="9"  fontWeight="400" fill="rgba(74,173,203,0.5)">W</text>

          {/* Kaaba icon at top when aligned */}
          {aligned && (
            <text x="0" y="-56" textAnchor="middle" fontSize="12" fill="rgba(212,151,90,0.9)">🕋</text>
          )}

          {/* Needle group — rotates to point toward Mecca */}
          <g transform={`rotate(${needleAngle})`} filter={aligned ? 'url(#alignGlow)' : 'url(#needleGlow)'}>
            {/* Tip glow */}
            <ellipse cx="0" cy="-62" rx="5" ry="9"
              fill={aligned ? 'rgba(212,151,90,0.35)' : 'rgba(74,173,203,0.3)'} />
            {/* Arrow tip */}
            <polygon points="0,-78 -8,-56 8,-56"
              fill={aligned ? '#D4975A' : '#4AADCB'} />
            {/* Needle shaft */}
            <rect x="-2" y="-56" width="4" height="62" rx="2"
              fill="url(#needleGrad)" />
            {/* Counter tail */}
            <polygon points="0,22 -5,10 5,10"
              fill="rgba(74,173,203,0.22)" />
          </g>

          {/* Center hub */}
          <circle cx="0" cy="0" r="7" fill="#D4975A"
            filter={aligned ? 'url(#alignGlow)' : undefined} />
          <circle cx="0" cy="0" r="4" fill="#0D090A" />
          <circle cx="0" cy="0" r="1.5" fill="rgba(212,151,90,0.6)" />
        </svg>
      </div>

      {/* Bearing info */}
      <div className="qibla-info">
        {aligned ? (
          <p className="qibla-aligned-label">Facing Qibla ✦</p>
        ) : bearing != null ? (
          <>
            <span className="qibla-bearing">{bearing}<span className="qibla-deg">°</span></span>
            <p className="qibla-label">from North</p>
          </>
        ) : (
          <p className="qibla-label">Locating…</p>
        )}
      </div>

      {/* Status */}
      {compassState === 'idle' || compassState === 'requesting' ? (
        <button className="compass-btn" onClick={enableCompass} disabled={compassState === 'requesting'}>
          {compassState === 'requesting' ? 'Requesting…' : 'Enable Live Compass'}
        </button>
      ) : compassState === 'denied' ? (
        <p className="qibla-tip">Compass permission denied. Bearing shown is the static direction to Mecca.</p>
      ) : (
        <p className="qibla-tip">
          {aligned ? 'You are facing the Qibla.' : 'Rotate until the needle points straight up.'}
        </p>
      )}
      </>}
    </div>
  )
}

