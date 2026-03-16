import { useState, useEffect } from 'react'
import { adhkar } from '../data/adhkar'

const STORAGE_KEY = 'maqam_adhkar'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function loadCounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const { date, counts } = JSON.parse(raw)
    if (date !== todayKey()) return {} // new day → reset
    return counts ?? {}
  } catch { return {} }
}

function saveCounts(counts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), counts }))
  } catch {}
}

export default function Adhkar() {
  const [category, setCategory] = useState('morning')
  const [counts, setCounts] = useState(loadCounts)

  // Persist to localStorage whenever counts change
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
      {/* Morning / Evening toggle */}
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
      </div>

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
    </div>
  )
}

