# Maqam — Project Memory

## Vision

A unified Muslim life OS. One app every Muslim uses instead of 5–7 fragmented apps.
Designed with taste. No ads during prayer. Works offline.

## App Name

**Maqam** (Arabic: مقام — station/rank, also musical scale. Double meaning: spiritual station + daily rhythm)

## Live Site

**[almaqam.app](https://almaqam.app)** — deployed on Vercel, auto-deploys from `main`.
GitHub: `https://github.com/Abdulhakim-Edao/Maqam`

---

## Collaborators

- Claude: architect, coder, designer
- Abdulhakim: executor, decision-maker, domain knowledge

## Working Style

- Abdulhakim is direct, execution-oriented. No fluff.
- Claude leads technical decisions and asks only when needed.
- Keep responses short. Ship fast, iterate.
- **What to build next is Claude's call.** Abdulhakim has explicitly delegated product and engineering decisions. Don't ask — just build the most valuable next thing.
- **Assets Claude can't get (licensed/restricted fonts, etc.):** Ask Abdulhakim to drop the file in the project. Drop location: `public/font/`.

---

## Tech Stack

| Layer              | Choice                                      |
| ------------------ | ------------------------------------------- |
| Web                | React 19 + Vite                             |
| Mobile (later)     | React Native                                |
| Backend (later)    | Supabase                                    |
| AI feature (later) | Anthropic API — Islamic Q&A                 |
| Storage            | localStorage (now) → Supabase (later)       |
| Key libraries      | adhan (prayer times), no other deps for MVP |

---

## Current State — What's Shipped

### 5 Tabs (all complete)

| Tab              | Status                                                                |
| ---------------- | --------------------------------------------------------------------- |
| Prayer Times     | ✅ Geolocation, 6 calc methods, countdown, Hijri date, Ramadan badges |
| Qibla            | ✅ RAF-smoothed live compass, neumorphic dish, aligned detection      |
| Adhkar           | ✅ Morning/evening dhikr, tap counter, progress bars, midnight reset  |
| Islamic Calendar | ✅ Hijri grid, event dots, upcoming events list                       |
| Quran Reader     | ✅ See detail below                                                   |

### Quran Reader — Full Feature List

- **604 SVG mushaf pages** (SVGO-optimised), served from `/public`, offline-capable
- **Smooth swipe** with live drag + axis locking; no vertical scroll in portrait
- **Two-page spread** on ≥1100px screens with orientationchange/resize detection
- **Slider navigation** — RTL slider with Arabic surah + page tooltip during drag
- **Surah jump sheet** — instant client-side search (Arabic + transliteration)
- **Ayah search** — offline, client-side; 6236 ayahs indexed in `public/quran-index.json`
  - Harakat-stripped normalisation + alef variant matching
  - Lazy-loaded once, cached in browser; works offline after first load
  - Shows up to 25 results: surah:ayah ref · Arabic snippet · page number
- **Multi-bookmark system** — save/list/delete, persisted as JSON
- **Dark mode** — obsidian bg, warm inverted ink, persisted to localStorage
- **Text mode** — full Arabic + English translation per ayah, tappable
  - Basmallah rendered correctly (surah 1 inline, surahs 2–114 as header, surah 9 none)
- **Sequential audio** (EveryAyah CDN) — Alafasy + Husary, starts from current page's first ayah
- **Per-ayah tap audio** in text mode; mutual exclusion with sequential playback
- **Sheet above keyboard** — `visualViewport` kbHeight tracking
- **Pinch-zoom safe** — `visualViewport.scale > 1.05` bail prevents accidental page turns
- **Auto-saves** last-read page to localStorage

### App-Wide

- **PWA** — installable on Android/iOS/desktop, cache-first service worker
- **Ramadan Mode** — auto-detected via `Intl` ca-islamic-umalqura; Iftar/Suhoor hero, banner
- **Design system** — Obsidian + Amber + Lapis, glassmorphism + neumorphism
- **Responsive** — mobile (<768px) · tablet sidebar (≥768px) · desktop two-page (≥1100px)

---

## Project Structure (actual)

```
maqam/
├── public/
│   ├── quran_sources/quran-svg-opt/  # 604 SVG mushaf pages
│   ├── quran-index.json              # 6236 ayahs for offline search
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker (cache-first)
├── scripts/
│   └── buildQuranIndex.mjs           # One-time: node scripts/buildQuranIndex.mjs
├── src/
│   ├── components/
│   │   ├── PrayerTimes.jsx
│   │   ├── Qibla.jsx
│   │   ├── Adhkar.jsx
│   │   ├── IslamicCalendar.jsx
│   │   └── QuranReader.jsx
│   ├── data/
│   │   └── adhkar.js
│   ├── utils/
│   │   ├── prayerCalc.js
│   │   ├── qibla.js
│   │   └── quranData.js              # SURAHS, JUZ_PAGES, helpers
│   ├── App.jsx
│   └── index.css
├── CLAUDE.md
└── package.json
```

---

## Key Implementation Notes

- Prayer calc: adhan npm package, default ISNA (Minnesota)
- Geolocation: `navigator.geolocation` API
- Qibla: bearing to Kaaba (21.4225°N, 39.8262°E), DeviceOrientationEvent
- Adhkar: plain JS arrays in `src/data/adhkar.js`, localStorage-persisted
- Quran pages: `/quran_sources/quran-svg-opt/001.svg` … `604.svg`
- Ayah index: built once via `node scripts/buildQuranIndex.mjs`; re-run if data needs refresh
- No backend in production — fully offline capable

---

## Phase Roadmap

| Phase | Scope                                              | Status  |
| ----- | -------------------------------------------------- | ------- |
| 1     | Prayer times + Qibla + Adhkar                      | ✅ Done |
| 2     | Quran reader, Islamic calendar, Ramadan mode, PWA  | ✅ Done |
| 3     | Tasbih counter, Masjid finder, Halal map           | 🔜 Next |
| 4     | Mobile app (React Native)                          | —       |
| 5     | Supabase backend, accounts, sync                   | —       |
| 6     | Monetization — Maqam Premium, Masjid Dashboard B2B | —       |

---

## Phase 3 — Next Up (in priority order)

1. **Tasbih counter** — dedicated screen or floating widget; tap to count, preset dhikr phrases, haptic feedback, daily log
2. **Masjid finder** — nearest masajid via browser geolocation + OpenStreetMap/Overpass API (no API key needed)
3. **Halal restaurant map** — OpenStreetMap `amenity=restaurant + cuisine=halal` layer
4. **Push notifications** — prayer time alerts via Web Push API (requires HTTPS, already live)
5. **User settings screen** — calc method, madhab (Asr), notification toggles, theme preference

---

## Monetization Plan (Phase 6)

- Freemium core (free forever)
- Maqam Premium: $4.99/mo or $29/yr
- Masjid Dashboard B2B (main revenue)
- Halal marketplace affiliate listings
