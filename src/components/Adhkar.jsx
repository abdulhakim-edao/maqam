import { useState, useEffect, useRef, useCallback } from 'react'
import { adhkar } from '../data/adhkar'

const STORAGE_KEY        = 'maqam_adhkar'
const TASBIH_LOG_KEY     = 'maqam_tasbih_log'
const TASBIH_SESSION_KEY = 'maqam_tasbih_session'

// ── Tasbih presets ──────────────────────────────────────────────────────
const PRESETS = [
  { ar: 'سبحان الله',          en: 'SubhanAllah',              target: 33 },
  { ar: 'الحمد لله',           en: 'Alhamdulillah',            target: 33 },
  { ar: 'الله أكبر',           en: 'Allahu Akbar',             target: 33 },
  { ar: 'لا إله إلا الله',     en: 'La ilaha illa Allah',      target: 100 },
  { ar: 'أستغفر الله',         en: 'Astaghfirullah',           target: 100 },
  { ar: 'سبحان الله وبحمده',   en: 'SubhanAllahi wa bihamdih', target: 100 },
]

// The three-part post-Salah sequence (33 × 3 = 99)
const POST_SALAH = [0, 1, 2] // indices into PRESETS

function haptic(type = 'light') {
  if (!navigator.vibrate) return
  const pat = { light: [15], medium: [25], success: [30, 40, 30] }
  navigator.vibrate(pat[type] ?? pat.light)
}

function softClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 820
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.07, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch {}
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function loadCounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const { date, counts } = JSON.parse(raw)
    if (date !== todayKey()) return {}
    return counts ?? {}
  } catch { return {} }
}
function saveCounts(counts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), counts })) } catch {}
}

function loadTasbihLog() {
  try { return JSON.parse(localStorage.getItem(TASBIH_LOG_KEY)) || [] } catch { return [] }
}
function saveTasbihLog(log) {
  try { localStorage.setItem(TASBIH_LOG_KEY, JSON.stringify(log.slice(-200))) } catch {}
}
function loadTasbihSession() {
  try {
    const s = JSON.parse(localStorage.getItem(TASBIH_SESSION_KEY))
    return s && typeof s.presetIdx === 'number' ? s : { presetIdx: 0, count: 0, seqActive: false, seqPos: 0 }
  } catch { return { presetIdx: 0, count: 0, seqActive: false, seqPos: 0 } }
}

// ── Tasbih SVG ring ────────────────────────────────────────────────────
const R = 100
const C = 2 * Math.PI * R

function TasbihRing({ progress, complete, pulse }) {
  const offset = C * (1 - progress)
  return (
    <svg className="tasbih-ring-svg" viewBox="0 0 240 240" aria-hidden>
      {/* Track */}
      <circle cx="120" cy="120" r={R} className="tasbih-ring-track" />
      {/* Fill */}
      <circle
        cx="120" cy="120" r={R}
        className={`tasbih-ring-fill${complete ? ' complete' : ''}`}
        style={{ strokeDasharray: C, strokeDashoffset: offset }}
        transform="rotate(-90 120 120)"
      />
      {pulse && (
        <circle cx="120" cy="120" r={R} className="tasbih-ring-pulse" />
      )}
    </svg>
  )
}

// ── Tasbih screen ──────────────────────────────────────────────────────
function TasbihScreen() {
  const [session, setSession] = useState(loadTasbihSession)
  const [log, setLog]         = useState(loadTasbihLog)
  const [pulse, setPulse]     = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showLog, setShowLog]       = useState(false)
  const [sound, setSound]           = useState(() => localStorage.getItem('maqam_tasbih_sound') !== '0')
  const justDoneRef = useRef(false)

  useEffect(() => {
    localStorage.setItem(TASBIH_SESSION_KEY, JSON.stringify(session))
  }, [session])
  useEffect(() => {
    saveTasbihLog(log)
  }, [log])
  useEffect(() => {
    localStorage.setItem('maqam_tasbih_sound', sound ? '1' : '0')
  }, [sound])

  const preset  = session.seqActive ? PRESETS[POST_SALAH[session.seqPos]] : PRESETS[session.presetIdx]
  const target  = preset.target
  const count   = session.count
  const progress = Math.min(count / target, 1)
  const complete = count >= target

  const triggerPulse = useCallback(() => {
    setPulse(true)
    setTimeout(() => setPulse(false), 320)
  }, [])

  const logSession = useCallback((p, c, t) => {
    const entry = { date: todayKey(), ar: p.ar, en: p.en, count: c, target: t, complete: c >= t }
    setLog(prev => [...prev, entry])
  }, [])

  const tap = useCallback(() => {
    if (count >= target) return
    haptic('light')
    if (sound) softClick()
    triggerPulse()

    setSession(prev => {
      const next = prev.count + 1
      if (next >= target) {
        // reached target
        haptic('success')
        justDoneRef.current = true
        setTimeout(() => { justDoneRef.current = false }, 1200)
        // log it
        const p = prev.seqActive ? PRESETS[POST_SALAH[prev.seqPos]] : PRESETS[prev.presetIdx]
        logSession(p, next, target)
        return { ...prev, count: next }
      }
      return { ...prev, count: next }
    })
  }, [count, target, sound, triggerPulse, logSession])

  const reset = useCallback(() => {
    haptic('medium')
    setSession(prev => ({ ...prev, count: 0 }))
  }, [])

  const nextInSequence = useCallback(() => {
    haptic('medium')
    setSession(prev => {
      const nextPos = prev.seqPos + 1
      if (nextPos >= POST_SALAH.length) {
        // sequence complete — back to free mode
        return { presetIdx: 0, count: 0, seqActive: false, seqPos: 0 }
      }
      return { ...prev, count: 0, seqPos: nextPos }
    })
  }, [])

  const startSequence = useCallback(() => {
    haptic('medium')
    setSession({ presetIdx: 0, count: 0, seqActive: true, seqPos: 0 })
  }, [])

  const selectPreset = useCallback((idx) => {
    haptic('light')
    setSession({ presetIdx: idx, count: 0, seqActive: false, seqPos: 0 })
    setShowPicker(false)
  }, [])

  // Today's log summary
  const todayStr = todayKey()
  const todayLog = log.filter(e => e.date === todayStr)
  const todayTotal = todayLog.reduce((s, e) => s + e.count, 0)

  // Streak: consecutive days with ≥1 complete session
  const streak = (() => {
    const dates = [...new Set(log.filter(e => e.complete).map(e => e.date))].sort().reverse()
    if (!dates.length) return 0
    let s = 0
    let d = new Date()
    for (const dateStr of dates) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      if (dateStr === key) { s++; d.setDate(d.getDate() - 1) }
      else break
    }
    return s
  })()

  const seqLabel = session.seqActive
    ? `${session.seqPos + 1} / ${POST_SALAH.length}`
    : null

  return (
    <div className="tasbih-screen">
      {/* Stats row */}
      <div className="tasbih-stats">
        <div className="tasbih-stat">
          <span className="tasbih-stat-val">{todayTotal}</span>
          <span className="tasbih-stat-lbl">Today</span>
        </div>
        <div className="tasbih-stat">
          <span className="tasbih-stat-val">{streak}</span>
          <span className="tasbih-stat-lbl">Day streak</span>
        </div>
        <button className="tasbih-stat tasbih-stat-btn" onClick={() => setShowLog(v => !v)}>
          <span className="tasbih-stat-val">{log.filter(e => e.complete).length}</span>
          <span className="tasbih-stat-lbl">Sessions</span>
        </button>
      </div>

      {/* Log drawer */}
      {showLog && (
        <div className="tasbih-log">
          {todayLog.length === 0
            ? <p className="tasbih-log-empty">No sessions today yet</p>
            : todayLog.slice().reverse().map((e, i) => (
              <div key={i} className="tasbih-log-row">
                <span className="tasbih-log-ar">{e.ar}</span>
                <span className="tasbih-log-count">{e.count}{e.complete ? ' ✓' : ''}</span>
              </div>
            ))
          }
        </div>
      )}

      {/* Main counter */}
      <div
        className={`tasbih-counter${complete ? ' complete' : ''}`}
        onClick={tap}
        role="button"
        aria-label={`${preset.ar} — ${count} of ${target}. Tap to count.`}
      >
        <TasbihRing progress={progress} complete={complete} pulse={pulse} />
        <div className="tasbih-counter-inner">
          <span className="tasbih-count-num">{count.toLocaleString('ar-EG')}</span>
          <span className="tasbih-count-sep">/ {target}</span>
        </div>
      </div>

      {/* Dhikr label */}
      <div className="tasbih-label">
        <p className="tasbih-label-ar">{preset.ar}</p>
        <p className="tasbih-label-en">{preset.en}</p>
        {seqLabel && <p className="tasbih-label-seq">Step {seqLabel}</p>}
      </div>

      {/* Action row */}
      <div className="tasbih-actions">
        {complete ? (
          session.seqActive && session.seqPos < POST_SALAH.length - 1 ? (
            <button className="tasbih-action-btn tasbih-next-btn" onClick={nextInSequence}>
              Next →
            </button>
          ) : (
            <button className="tasbih-action-btn tasbih-reset-btn" onClick={reset}>
              Reset
            </button>
          )
        ) : (
          <button className="tasbih-action-btn tasbih-reset-btn" onClick={reset} aria-label="Reset count">
            Reset
          </button>
        )}
        <button className="tasbih-action-btn tasbih-pick-btn" onClick={() => setShowPicker(v => !v)}>
          Change
        </button>
        <button
          className={`tasbih-action-btn tasbih-sound-btn${sound ? ' on' : ''}`}
          onClick={() => setSound(v => !v)}
          aria-label={sound ? 'Mute click sound' : 'Enable click sound'}
        >
          {sound ? '🔔' : '🔕'}
        </button>
      </div>

      {/* Post-Salah sequence shortcut */}
      {!session.seqActive && (
        <button className="tasbih-salah-btn" onClick={startSequence}>
          Post-Salah sequence · سبحان الله × الحمد لله × الله أكبر
        </button>
      )}

      {/* Preset picker */}
      {showPicker && (
        <div className="tasbih-picker">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className={`tasbih-pick-item${session.presetIdx === i && !session.seqActive ? ' active' : ''}`}
              onClick={() => selectPreset(i)}
            >
              <span className="tpi-ar">{p.ar}</span>
              <span className="tpi-en">{p.en}</span>
              <span className="tpi-target">×{p.target}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Adhkar export ─────────────────────────────────────────────────
export default function Adhkar() {
  const [category, setCategory] = useState('morning')
  const [counts, setCounts] = useState(loadCounts)

  useEffect(() => { saveCounts(counts) }, [counts])

  const items = adhkar.filter(d => d.category === category)

  const getCount = (id) => counts[id] ?? 0
  const isDone = (id, required) => getCount(id) >= required

  const increment = (id, required) => {
    setCounts(prev => {
      const current = prev[id] ?? 0
      if (current >= required) return prev
      return { ...prev, [id]: current + 1 }
    })
  }

  const resetCategory = () => {
    const ids = items.map(d => d.id)
    setCounts(prev => {
      const next = { ...prev }
      ids.forEach(id => delete next[id])
      return next
    })
  }

  const completedCount = items.filter(d => isDone(d.id, d.count)).length
  const progress = items.length > 0 ? completedCount / items.length : 0
  const allDone = completedCount === items.length

  return (
    <div className="adhkar-page">
      {/* Morning / Evening / Tasbih tabs */}
      <div className="adhkar-tabs">
        <button
          className={`adhkar-tab${category === 'morning' ? ' active' : ''}`}
          onClick={() => setCategory('morning')}
        >
          Morning
          <span className="adhkar-tab-arabic"> الصباح</span>
        </button>
        <button
          className={`adhkar-tab${category === 'evening' ? ' active' : ''}`}
          onClick={() => setCategory('evening')}
        >
          Evening
          <span className="adhkar-tab-arabic"> المساء</span>
        </button>
        <button
          className={`adhkar-tab${category === 'tasbih' ? ' active' : ''}`}
          onClick={() => setCategory('tasbih')}
        >
          Tasbih
          <span className="adhkar-tab-arabic"> تسبيح</span>
        </button>
      </div>

      {category === 'tasbih' ? (
        <TasbihScreen />
      ) : (
        <>
          {/* Progress bar */}
          <div className="adhkar-progress">
            <div className="adhkar-progress-bar">
              <div className="adhkar-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="adhkar-progress-text">{completedCount}/{items.length}</span>
          </div>

          {allDone ? (
            <div className="adhkar-complete">
              <div className="adhkar-complete-icon">✦</div>
              <p className="adhkar-complete-title">
                {category === 'morning' ? 'Morning Adhkar Complete' : 'Evening Adhkar Complete'}
              </p>
              <p className="adhkar-complete-sub">
                {category === 'morning'
                  ? 'May Allah bless your day.'
                  : 'May Allah grant you a peaceful night.'}
              </p>
              <button className="adhkar-reset-btn" onClick={resetCategory}>Reset</button>
            </div>
          ) : (
            <div className="adhkar-list">
              {items.map(dhikr => {
                const current = getCount(dhikr.id)
                const done = isDone(dhikr.id, dhikr.count)
                const remaining = dhikr.count - current
                return (
                  <div
                    key={dhikr.id}
                    className={`dhikr-card${done ? ' done' : ''}`}
                    onClick={() => increment(dhikr.id, dhikr.count)}
                    role="button"
                    tabIndex={done ? -1 : 0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') increment(dhikr.id, dhikr.count) }}
                    aria-label={`${dhikr.transliteration}, ${done ? 'completed' : `${current} of ${dhikr.count}`}`}
                  >
                    <div className="dhikr-body">
                      <p className="dhikr-arabic">{dhikr.arabic}</p>
                      <p className="dhikr-transliteration">{dhikr.transliteration}</p>
                      <p className="dhikr-translation">{dhikr.translation}</p>
                    </div>
                    <div className="dhikr-footer">
                      <span className="dhikr-count-label">
                        {done ? '✓ Done' : `${current} / ${dhikr.count}x`}
                      </span>
                      {!done && (
                        <span className="dhikr-tap-hint">
                          {dhikr.count === 1 ? 'Tap to complete' : `${remaining} left`}
                        </span>
                      )}
                    </div>
                    {!done && dhikr.count > 1 && (
                      <div className="dhikr-progress-dots">
                        <div
                          className="dhikr-progress-fill"
                          style={{ width: `${(current / dhikr.count) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

