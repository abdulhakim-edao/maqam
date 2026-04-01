import { createContext, useContext, useState, useCallback } from 'react'

const SETTINGS_KEY = 'maqam_settings'

const DEFAULTS = {
  calcMethod:    'NorthAmerica',
  asrMadhab:    'standard',      // 'standard' | 'hanafi'
  highLatitude:  'middleOfNight', // 'none' | 'middleOfNight' | 'seventhOfNight' | 'twilightAngle'
  numerals:     'western',       // 'western' | 'arabic'
}

function load() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch { return { ...DEFAULTS } }
}

function save(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {}
}

// Migrate old per-key storage so existing users don't lose their calc method
function migrate(settings) {
  const old = localStorage.getItem('maqam_calc_method')
  if (old && settings.calcMethod === DEFAULTS.calcMethod) {
    return { ...settings, calcMethod: old }
  }
  return settings
}

export const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => migrate(load()))

  const set = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      save(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS })
    save({ ...DEFAULTS })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, set, reset }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}

// Format a number respecting the numerals setting
export function formatNum(n, numerals) {
  if (numerals === 'arabic') return String(n).toLocaleString('ar-EG')
  return String(n)
}
