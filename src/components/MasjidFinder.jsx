import { useState, useEffect } from 'react'

const DEFAULT    = { lat: 44.9778, lng: -93.2650 }
const OVERPASS   = 'https://overpass-api.de/api/interpreter'
const RADIUS_M   = 5000  // 5 km

function haversine(lat1, lon1, lat2, lon2) {
  const R    = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a    = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtDist(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

function openMaps(lat, lon, name) {
  const encoded = encodeURIComponent(name)
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    window.open(`maps://maps.apple.com/?q=${encoded}&ll=${lat},${lon}`, '_blank')
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}&center=${lat},${lon}`, '_blank', 'noopener,noreferrer')
  }
}

export default function MasjidFinder() {
  const [location, setLocation]       = useState(null)
  const [masajid, setMasajid]         = useState([])
  const [status, setStatus]           = useState('locating')  // locating | fetching | done | error
  const [usingDefault, setUsingDefault] = useState(false)

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(DEFAULT); setUsingDefault(true); return
    }
    navigator.geolocation.getCurrentPosition(
      p  => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { setLocation(DEFAULT); setUsingDefault(true) },
      { timeout: 8000 }
    )
  }, [])

  // Overpass query
  useEffect(() => {
    if (!location) return
    setStatus('fetching')
    const query = [
      '[out:json][timeout:10];',
      '(',
      `node["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS_M},${location.lat},${location.lng});`,
      `way["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS_M},${location.lat},${location.lng});`,
      `relation["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS_M},${location.lat},${location.lng});`,
      ');',
      'out center 30;',
    ].join('')

    fetch(`${OVERPASS}?data=${encodeURIComponent(query)}`)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(data => {
        const seen = new Set()
        const items = data.elements
          .map(el => {
            const lat  = el.lat ?? el.center?.lat
            const lon  = el.lon ?? el.center?.lon
            if (lat == null || lon == null) return null
            const name = el.tags?.['name:en'] || el.tags?.name || 'Masjid'
            const dist = haversine(location.lat, location.lng, lat, lon)
            return { id: el.id, name, dist, lat, lon }
          })
          .filter(x => {
            if (!x) return false
            // deduplicate by proximity (~20m)
            const key = `${Math.round(x.lat * 500)},${Math.round(x.lon * 500)}`
            if (seen.has(key)) return false
            seen.add(key); return true
          })
        items.sort((a, b) => a.dist - b.dist)
        setMasajid(items)
        setStatus('done')
      })
      .catch(() => setStatus('error'))
  }, [location])

  return (
    <div className="masajid-page">
      <div className="masajid-header">
        <p className="masajid-sub">Within 5 km{usingDefault ? ' · Default location (Minneapolis, MN)' : ''}</p>
      </div>

      {(status === 'locating' || status === 'fetching') && (
        <div className="masajid-state">
          <div className="masajid-spinner" />
          <p>{status === 'locating' ? 'Getting your location…' : 'Searching for masajid…'}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="masajid-state masajid-error">
          <p>Could not reach OpenStreetMap. Check your connection and try again.</p>
        </div>
      )}

      {status === 'done' && masajid.length === 0 && (
        <div className="masajid-state">
          <p>No masajid found within 5 km.</p>
        </div>
      )}

      {status === 'done' && masajid.length > 0 && (
        <ul className="masajid-list">
          {masajid.map(m => (
            <li key={m.id} className="masajid-item" onClick={() => openMaps(m.lat, m.lon, m.name)}>
              <span className="masajid-icon">🕌</span>
              <div className="masajid-info">
                <span className="masajid-name">{m.name}</span>
                <span className="masajid-dist">{fmtDist(m.dist)}</span>
              </div>
              <span className="masajid-arrow">↗</span>
            </li>
          ))}
        </ul>
      )}

      <p className="masajid-credit">Data © OpenStreetMap contributors (ODbL)</p>
    </div>
  )
}
