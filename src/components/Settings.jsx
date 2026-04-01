import { useState } from 'react'
import { useSettings } from '../utils/settings'
import { CALC_METHODS } from '../utils/prayerCalc'
import { requestNotificationPermission, getPermissionStatus } from '../utils/notifications'

const ASR_OPTIONS = [
  { key: 'standard', label: 'Standard', sub: 'Shāfiʿī · Mālikī · Ḥanbalī' },
  { key: 'hanafi',   label: 'Ḥanafī',   sub: 'Later Asr time' },
]

const HL_OPTIONS = [
  { key: 'middleOfNight',  label: 'Middle of Night', sub: 'Recommended for most latitudes' },
  { key: 'seventhOfNight', label: 'Seventh of Night', sub: 'Conservative estimate' },
  { key: 'twilightAngle',  label: 'Twilight Angle',   sub: 'Angle-based adjustment' },
  { key: 'none',           label: 'None',              sub: 'No adjustment' },
]

const NUMERAL_OPTIONS = [
  { key: 'western', label: '1 2 3', sub: 'Western' },
  { key: 'arabic',  label: '١ ٢ ٣', sub: 'Arabic-Indic' },
]

function Row({ label, sub, active, onClick }) {
  return (
    <button className={`settings-option${active ? ' active' : ''}`} onClick={onClick}>
      <div className="settings-option-text">
        <span className="settings-option-label">{label}</span>
        {sub && <span className="settings-option-sub">{sub}</span>}
      </div>
      {active && <span className="settings-option-check">✓</span>}
    </button>
  )
}

export default function Settings({ onRefreshLocation }) {
  const { settings, set } = useSettings()
  const [permStatus, setPermStatus] = useState(() => getPermissionStatus())

  async function handleNotifToggle() {
    if (settings.notificationsEnabled) {
      set('notificationsEnabled', false)
      return
    }
    const status = await requestNotificationPermission()
    setPermStatus(status)
    if (status === 'granted') {
      set('notificationsEnabled', true)
    }
  }

  const notifSubtext = () => {
    if (permStatus === 'unsupported') return 'Not supported in this browser'
    if (permStatus === 'denied') return 'Permission blocked — enable in browser settings'
    if (settings.notificationsEnabled) return 'You will be notified at each prayer time'
    return 'Tap to enable prayer time alerts'
  }

  return (
    <div className="settings-page">

      {/* ── Prayer Calculation ── */}
      <div className="settings-section">
        <p className="settings-section-title">Prayer Calculation</p>

        <p className="settings-group-label">Method</p>
        <div className="settings-group">
          {CALC_METHODS.map(m => (
            <Row
              key={m.key}
              label={m.label}
              sub={m.sub}
              active={settings.calcMethod === m.key}
              onClick={() => set('calcMethod', m.key)}
            />
          ))}
        </div>

        <p className="settings-group-label">Asr Time (Madhab)</p>
        <div className="settings-group">
          {ASR_OPTIONS.map(o => (
            <Row
              key={o.key}
              label={o.label}
              sub={o.sub}
              active={settings.asrMadhab === o.key}
              onClick={() => set('asrMadhab', o.key)}
            />
          ))}
        </div>

        <p className="settings-group-label">High Latitude Adjustment</p>
        <div className="settings-group">
          {HL_OPTIONS.map(o => (
            <Row
              key={o.key}
              label={o.label}
              sub={o.sub}
              active={settings.highLatitude === o.key}
              onClick={() => set('highLatitude', o.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="settings-section">
        <p className="settings-section-title">Appearance</p>
        <p className="settings-group-label">Numerals</p>
        <div className="settings-group">
          {NUMERAL_OPTIONS.map(o => (
            <Row
              key={o.key}
              label={o.label}
              sub={o.sub}
              active={settings.numerals === o.key}
              onClick={() => set('numerals', o.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="settings-section">
        <p className="settings-section-title">Notifications</p>
        <div className="settings-group">
          <button
            className={`settings-option${settings.notificationsEnabled ? ' active' : ''}`}
            onClick={handleNotifToggle}
            disabled={permStatus === 'unsupported' || permStatus === 'denied'}
          >
            <div className="settings-option-text">
              <span className="settings-option-label">Prayer Time Alerts</span>
              <span className="settings-option-sub">{notifSubtext()}</span>
            </div>
            <span className={`notif-toggle${settings.notificationsEnabled ? ' on' : ''}`}>
              {settings.notificationsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Location ── */}
      <div className="settings-section">
        <p className="settings-section-title">Location</p>
        <div className="settings-group">
          <button className="settings-option settings-action-row" onClick={onRefreshLocation}>
            <div className="settings-option-text">
              <span className="settings-option-label">Refresh Location</span>
              <span className="settings-option-sub">Re-request GPS for prayer times</span>
            </div>
            <span className="settings-option-arrow">→</span>
          </button>
        </div>
      </div>

      {/* ── About ── */}
      <div className="settings-section">
        <p className="settings-section-title">About</p>
        <div className="settings-group">
          <div className="settings-option settings-static-row">
            <span className="settings-option-label">Version</span>
            <span className="settings-option-value">1.0.0</span>
          </div>
          <div className="settings-option settings-static-row">
            <span className="settings-option-label">Privacy</span>
            <span className="settings-option-sub">Prayer times calculated on-device. No location is ever sent to a server.</span>
          </div>
          <a
            className="settings-option settings-link-row"
            href="https://github.com/Abdulhakim-Edao/Maqam"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="settings-option-label">Open Source on GitHub</span>
            <span className="settings-option-arrow">↗</span>
          </a>
          <a
            className="settings-option settings-link-row"
            href="https://almaqam.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="settings-option-label">almaqam.app</span>
            <span className="settings-option-arrow">↗</span>
          </a>
        </div>
      </div>

      <p className="settings-footer">مقام — Built with love for every Muslim</p>
    </div>
  )
}
