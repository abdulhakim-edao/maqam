import { useState } from 'react'
import PrayerTimes from './components/PrayerTimes'
import Qibla from './components/Qibla'
import Adhkar from './components/Adhkar'
import IslamicCalendar from './components/IslamicCalendar'
import QuranReader from './components/QuranReader'
import Settings from './components/Settings'
import { SettingsProvider } from './utils/settings'
import './App.css'

const TABS = [
  { id: 'prayer',   label: 'Prayer',   Icon: PrayerIcon },
  { id: 'qibla',    label: 'Qibla',    Icon: QiblaIcon },
  { id: 'adhkar',   label: 'Adhkar',   Icon: AdhkarIcon },
  { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
  { id: 'quran',    label: 'Quran',    Icon: QuranIcon },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('prayer')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [locationRefreshKey, setLocationRefreshKey] = useState(0)

  return (
    <SettingsProvider>
    <div className={`app${activeTab === 'quran' ? ' quran-active' : ''}${!sidebarOpen ? ' sidebar-collapsed' : ''}`}>

      {/* Sidebar — tablet/desktop only */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">مقام</span>
          <div className="sidebar-brand-info">
            <span className="sidebar-app-name">Maqam</span>
            <span className="sidebar-app-tagline">Muslim companion</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`sidebar-item${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-label={label}
            >
              <Icon active={activeTab === id} />
              <span className="sidebar-item-label">{label}</span>
            </button>
          ))}
        </nav>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen
              ? <path d="M15 18l-6-6 6-6" />
              : <path d="M9 18l6-6-6-6" />}
          </svg>
        </button>
      </aside>

      {/* Header — mobile only */}
      <header className="app-header">
        <span className="app-logo">مقام</span>
        <div className="app-title-group">
          <span className="app-name">Maqam</span>
          <span className="app-tagline">Your daily Muslim companion</span>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'prayer'   && <PrayerTimes key={locationRefreshKey} />}
        {activeTab === 'qibla'    && <Qibla />}
        {activeTab === 'adhkar'   && <Adhkar />}
        {activeTab === 'calendar' && <IslamicCalendar />}
        {activeTab === 'quran'    && <QuranReader />}
        {activeTab === 'settings' && <Settings onRefreshLocation={() => { setLocationRefreshKey(k => k+1); setActiveTab('prayer') }} />}
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="bottom-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-tab${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
            aria-label={label}
          >
            <Icon active={activeTab === id} />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
    </SettingsProvider>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────
function PrayerIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4975A' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C9 2 7 4 7 7v4H5l1 11h12l1-11h-2V7c0-3-2-5-5-5z" />
      <path d="M9 11V7a3 3 0 0 1 6 0v4" />
    </svg>
  )
}

function QiblaIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4975A' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="12,4 14.5,12 12,10.5 9.5,12" fill={active ? '#D4975A' : 'currentColor'} stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill={active ? '#D4975A' : 'currentColor'} stroke="none" />
    </svg>
  )
}

function AdhkarIcon({ active }) {
  const c = active ? '#D4975A' : 'currentColor'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.5" />
      <path d="M12 2a10 10 0 1 0 0 20" stroke={c} strokeWidth="1.5" />
      <path d="M19 7l1.5-1.5M21 3l-1.5 1.5" stroke={c} strokeWidth="1.5" />
    </svg>
  )
}

function CalendarIcon({ active }) {
  const c = active ? '#D4975A' : 'currentColor'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth="2" />
    </svg>
  )
}

function QuranIcon({ active }) {
  const c = active ? '#D4975A' : 'currentColor'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 7c-1.5 0-2.5 1-2.5 2.5S10.5 12 12 13c1.5-1 2.5-2 2.5-3.5S13.5 7 12 7z" fill={active ? 'rgba(212,151,90,0.25)' : 'none'} />
    </svg>
  )
}

function SettingsIcon({ active }) {
  const c = active ? '#D4975A' : 'currentColor'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
