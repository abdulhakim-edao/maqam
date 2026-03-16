import { useState } from 'react'
import {
  getHijriMonthDays,
  getUpcomingEvents,
  HIJRI_MONTHS,
  HIJRI_MONTHS_AR,
} from '../utils/islamicCalendar'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function IslamicCalendar() {
  const [ref, setRef] = useState(new Date())

  const { days, month, year, firstWeekday } = getHijriMonthDays(ref)
  const upcomingEvents = getUpcomingEvents(7)

  const prevMonth = () => {
    const d = new Date(ref)
    d.setDate(d.getDate() - 30)
    setRef(d)
  }
  const nextMonth = () => {
    const d = new Date(ref)
    d.setDate(d.getDate() + 30)
    setRef(d)
  }
  const goToday = () => setRef(new Date())

  const monthNameAr = HIJRI_MONTHS_AR[month - 1] ?? ''
  const monthNameEn = HIJRI_MONTHS[month - 1] ?? ''

  // Pad grid with empty cells before the first day
  const gridCells = [...Array(firstWeekday).fill(null), ...days]

  return (
    <div className="cal-page">
      {/* Month navigation */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
        <button className="cal-month-title" onClick={goToday} aria-label="Go to today">
          <span className="cal-month-ar">{monthNameAr}</span>
          <span className="cal-month-en">{monthNameEn} {year} AH</span>
        </button>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      {/* Weekday headers */}
      <div className="cal-weekdays">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className={`cal-weekday${i === 5 ? ' cal-friday-label' : ''}`}>{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="cal-grid">
        {gridCells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} className="cal-day cal-empty" />
          const { hijri, isToday, event, gregorian } = cell
          const isFriday = gregorian.getDay() === 5
          return (
            <div
              key={i}
              className={[
                'cal-day',
                isToday   ? 'cal-today'    : '',
                event     ? 'cal-has-event': '',
                isFriday  ? 'cal-friday'   : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="cal-hijri-num">{hijri.day}</span>
              <span className="cal-greg-num">{gregorian.getDate()}</span>
              {event && <span className="cal-event-dot" />}
            </div>
          )
        })}
      </div>

      {/* Upcoming events */}
      <div className="cal-events-section">
        <h3 className="cal-events-heading">Upcoming</h3>
        <div className="cal-events-list">
          {upcomingEvents.map((ev, i) => (
            <div key={i} className="cal-event-row">
              <div className="cal-event-info">
                <span className="cal-event-arabic">{ev.arabic}</span>
                <span className="cal-event-name">{ev.name}</span>
              </div>
              <div className="cal-event-meta">
                <span className="cal-event-date">
                  {ev.gregorian.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className={`cal-event-countdown${i === 0 ? ' cal-next' : ''}`}>
                  {ev.daysUntil === 0 ? 'Today'
                   : ev.daysUntil === 1 ? 'Tomorrow'
                   : `${ev.daysUntil}d`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
