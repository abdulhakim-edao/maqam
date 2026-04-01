import { useState, useEffect } from 'react'
import { getPrayerTimes, getPrayersList, formatTime, formatCountdown } from '../utils/prayerCalc'
import { getRamadanInfo } from '../utils/ramadan'
import { useSettings } from '../utils/settings'
import { scheduleNotifications, clearScheduled } from '../utils/notifications'

const DEFAULT_LOCATION = { lat: 44.9778, lng: -93.2650 }

function getHijriDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

export default function PrayerTimes() {
  const [location, setLocation] = useState(null)
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [prayers, setPrayers] = useState([])
  const [nextKey, setNextKey] = useState(null)
  const [countdown, setCountdown] = useState('')
  const [locationMsg, setLocationMsg] = useState(null)
  const [tomorrowFajr, setTomorrowFajr] = useState(null)
  const { settings } = useSettings()
  const { calcMethod: methodKey, asrMadhab, highLatitude, notificationsEnabled } = settings
  const [isFasting, setIsFasting] = useState(false)
  const [ramadanCountdown, setRamadanCountdown] = useState('')

  const { isRamadan, day: ramadanDay } = getRamadanInfo()

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION)
      setLocationMsg('Geolocation not supported — using Minneapolis, MN')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocation(DEFAULT_LOCATION)
        setLocationMsg('Location access denied — using Minneapolis, MN')
      },
      { timeout: 8000 }
    )
  }, [])

  // Calculate prayer times (recalculates when location or method changes)
  useEffect(() => {
    if (!location) return
    const times = getPrayerTimes(location.lat, location.lng, new Date(), methodKey, asrMadhab, highLatitude)
    setPrayerTimes(times)
    setPrayers(getPrayersList(times))
    setNextKey(times.nextPrayer())

    if (notificationsEnabled) {
      scheduleNotifications(times)
    } else {
      clearScheduled()
    }

    // Tomorrow's Fajr needed for Ramadan suhoor countdown
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tTimes = getPrayerTimes(location.lat, location.lng, tomorrow, methodKey, asrMadhab, highLatitude)
    setTomorrowFajr(tTimes.fajr)
  }, [location, methodKey, asrMadhab, highLatitude, notificationsEnabled])

  // Live countdown
  useEffect(() => {
    if (!prayerTimes) return
    const tick = () => {
      const next = prayerTimes.nextPrayer()
      setNextKey(next)
      if (next === 'none') { setCountdown('Done for today'); return }
      setCountdown(formatCountdown(prayerTimes[next] - new Date()))

      if (isRamadan) {
        const now = new Date()
        const fasting = now >= prayerTimes.fajr && now < prayerTimes.maghrib
        setIsFasting(fasting)
        if (fasting) {
          setRamadanCountdown(formatCountdown(prayerTimes.maghrib - now))
        } else {
          const target = now < prayerTimes.fajr ? prayerTimes.fajr : tomorrowFajr
          setRamadanCountdown(target ? formatCountdown(target - now) : '')
        }
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [prayerTimes, isRamadan, tomorrowFajr])

  const nextPrayer = prayers.find(p => p.key === nextKey)
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const hijriStr = getHijriDate(now)
  const suhoorEndsAt = prayerTimes
    ? (now < prayerTimes.fajr ? prayerTimes.fajr : tomorrowFajr)
    : null

  return (
    <div className="prayer-page">
      {/* Date header */}
      <div className="prayer-date-block">
        {isRamadan && (
          <div className="ramadan-banner">
            <span className="ramadan-crescent">☽</span>
            <span className="ramadan-month">رمضان مبارك</span>
            <span className="ramadan-day-label">Day {ramadanDay} · Ramadan 1447</span>
          </div>
        )}
        <div className="prayer-date-gregorian">{dateStr}</div>
        {hijriStr && <div className="prayer-date-hijri">{hijriStr}</div>}
      </div>

      {/* Hero — Ramadan mode or regular */}
      {isRamadan ? (
        <div className="next-prayer-hero ramadan-hero">
          <p className="next-label">
            {isFasting ? 'Time until Iftar' : 'Time until Suhoor ends'}
          </p>
          <h2 className="next-name">{isFasting ? 'Iftar' : 'Suhoor'}</h2>
          <p className="next-arabic">{isFasting ? 'إفطار' : 'السحور'}</p>
          <div className="countdown">{ramadanCountdown || '--:--:--'}</div>
          <p className="next-time-small">
            {isFasting && prayerTimes
              ? `Break fast at ${formatTime(prayerTimes.maghrib)}`
              : suhoorEndsAt
              ? `Suhoor ends at ${formatTime(suhoorEndsAt)}`
              : ''}
          </p>
        </div>
      ) : (
        <div className="next-prayer-hero">
          <p className="next-label">Next Prayer</p>
          <h2 className="next-name">{nextPrayer?.name ?? '—'}</h2>
          <p className="next-arabic">{nextPrayer?.arabic ?? ''}</p>
          <div className="countdown">{countdown || '--:--:--'}</div>
          {nextPrayer && <p className="next-time-small">{formatTime(nextPrayer.time)}</p>}
        </div>
      )}

      {/* Prayer List */}
      <div className="prayers-list">
        {prayers.map(prayer => {
          const isPast = prayer.time < now
          const isNext = prayer.key === nextKey
          const isSunrise = prayer.key === 'sunrise'
          const isIftar = isRamadan && prayer.key === 'maghrib'
          const isSuhoorEnd = isRamadan && prayer.key === 'fajr'
          return (
            <div
              key={prayer.key}
              className={[
                'prayer-row',
                isNext ? 'next' : '',
                isPast && !isNext ? 'past' : '',
                isSunrise ? 'sunrise' : '',
                isIftar ? 'iftar-row' : '',
                isSuhoorEnd ? 'suhoor-row' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="prayer-info">
                <span className="prayer-name">
                  {prayer.name}
                  {isIftar && <span className="prayer-ramadan-tag">Iftar</span>}
                  {isSuhoorEnd && <span className="prayer-ramadan-tag suhoor-tag">Suhoor</span>}
                </span>
                <span className="prayer-arabic">{prayer.arabic}</span>
              </div>
              {isNext && <span className="next-badge">Next</span>}
              <span className="prayer-time">{formatTime(prayer.time)}</span>
            </div>
          )
        })}
      </div>

      {locationMsg && <p className="location-msg">{locationMsg}</p>}
    </div>
  )
}

