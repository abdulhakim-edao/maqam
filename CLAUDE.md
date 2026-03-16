# Maqam — Project Memory

## Vision

A unified Muslim life OS. One app every Muslim uses instead of 5-7 fragmented apps.
Designed with taste. No ads during prayer. Works offline.

## App Name

**Maqam** (Arabic: مقام — station/rank, also musical scale. Double meaning: spiritual station + daily rhythm)

## Collaborators

- Claude: architect, coder, designer
- Abdulhakim: executor, decision-maker, domain knowledge

## Working Style

- Abdulhakim is direct, execution-oriented. No fluff.
- Claude leads technical decisions and asks only when needed.
- Keep responses short. Ship fast, iterate.
- **What to build next is Claude's call.** Abdulhakim has explicitly delegated product and engineering decisions. Don't ask — just build the most valuable next thing.
- **Assets Claude can't get (licensed/restricted fonts, etc.):** Ask Abdulhakim to drop the file in the project. He will provide it. Drop location: `public/font/`. Examples: KFGQPC font files, custom icons.

## Tech Stack

- **Web**: React + Vite (project initialized, running on localhost:5173)
- **Mobile (later)**: React Native
- **Backend (later)**: Supabase
- **AI feature (later)**: Anthropic API for Islamic Q&A
- **Storage**: localStorage now, Supabase later
- **Key libraries**: adhan (prayer times), no other deps for MVP

## MVP Scope (Phase 1) — Web Prototype

Three features, done excellently:

1. **Prayer Times** — calculated by geolocation, all 5 prayers, next prayer countdown
2. **Qibla** — compass direction to Mecca using device orientation
3. **Adhkar** — morning/evening dhikr with Arabic, transliteration, translation, counter

NO: accounts, backend, payments, Quran, community — that's Phase 2+

## Design Direction

- Dark theme: deep midnight blue/near-black base
- Gold accents (#C9A84C or similar)
- Arabic typography prominent (Amiri or Scheherazade font)
- Clean, geometric Islamic-inspired motifs (subtle, not kitschy)
- Feels premium, not another green-and-crescent app
- Mobile-first layout even as web prototype

## Monetization Plan (Later Phases)

- Freemium core (free forever)
- Maqam Premium: $4.99/mo or $29/yr
- Masjid Dashboard B2B (main revenue)
- Halal marketplace affiliate listings

## Phase Roadmap

- **Phase 1 (MVP)**: Prayer times + Qibla + Adhkar — web prototype
- **Phase 2**: Quran reader, Islamic calendar, Ramadan mode
- **Phase 3**: Community features, masjid finder, halal map
- **Phase 4**: Mobile app (React Native)
- **Phase 5**: Monetization layer, masjid B2B dashboard

## Prayer Time Calculation

- Use Adhan.js library (open source, accurate, no API needed)
- Default method: ISNA for North America (Abdulhakim is in Minnesota)
- Allow user to change calculation method

## Key Decisions Made

- Web prototype before mobile
- MVP = prayer + qibla + adhkar only
- Maqam as app name (confirmed by Abdulhakim)
- Claude directs, Abdulhakim executes

## Project Structure (target)

```
maqam/
├── public/
├── src/
│   ├── components/
│   │   ├── PrayerTimes.jsx
│   │   ├── Qibla.jsx
│   │   └── Adhkar.jsx
│   ├── data/
│   │   └── adhkar.js        # morning/evening dhikr data
│   ├── utils/
│   │   ├── prayerCalc.js    # prayer time logic (adhan.js wrapper)
│   │   └── qibla.js         # qibla calculation
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── CLAUDE.md
└── package.json
```

## Install Commands

```bash
npm install adhan          # prayer time calculations
```

## Key Implementation Notes

- Prayer calc: use adhan npm package, not custom math
- Default calc method: ISNA (North America / Minnesota)
- Geolocation: browser navigator.geolocation API
- Qibla: bearing formula from user coords to Kaaba (21.4225°N, 39.8262°E)
- Device compass: DeviceOrientationEvent (requires HTTPS or localhost)
- Adhkar data: stored in src/data/adhkar.js as plain JS arrays
- No backend calls in MVP — fully offline capable

## Session Notes

- Session 1: Vision defined, MVP scoped, CLAUDE.md created
- Session 2: Vite project initialized, moving to VS Code / Copilot agent mode
- Session 3: Full MVP built and working — Prayer Times, Qibla, Adhkar all functional
  - Installed adhan npm package
  - Created src/utils/prayerCalc.js, src/utils/qibla.js
  - Created src/data/adhkar.js (10 morning + 10 evening authentic adhkar)
  - Built PrayerTimes.jsx, Qibla.jsx, Adhkar.jsx components
  - Rewrote App.jsx (shell + bottom nav + SVG icons)
  - Full design system in index.css (dark theme, gold accents, Amiri Arabic font)
  - App confirmed working on localhost:5173
- Session 4: Polish + Visual redesign
  - Added Hijri date display (Intl.DateTimeFormat ca-islamic-umalqura)
  - Added 6-method calculation picker (ISNA/MWL/Egyptian/Karachi/UmmAlQura/Moonsighting), localStorage-persisted
  - Adhkar localStorage persistence with automatic midnight reset
  - Tap-anywhere dhikr card UX + per-card progress bar
  - Full visual redesign: glassmorphism + dark neumorphism
- Session 6: PWA + Ramadan Mode
  - PWA: manifest.json, SVG icons, sw.js (cache-first / network-first) — installable
  - Ramadan detection via Intl ca-islamic-umalqura, Iftar/Suhoor countdowns, banner, prayer badges
- Session 7: Quran Reader + Qibla redesign + UX polish
  - Quran Reader (5th tab): 604 SVGO-optimised mushaf pages, offline, swipe to turn
  - No header on Quran tab; parchment (#F5EDD8) fills behind status bar
  - Footer: Juz · slider · ¼-Hizb row + tappable page number below
  - Slider: separate sliderVal state for drag smoothness; Arabic surah + page tooltip during drag
  - Slider direction RTL (scaleX(-1)), RTL swipe navigation on page area
  - Pages 1-2 scaled up 1.22× to fill vertical space (wider SVG viewBox)
  - Ink color: sepia(0.7) brightness(0.83) contrast(1.15) — warm manuscript feel
  - Dark mode toggle (🌙/☀️): obsidian bg, invert(1) sepia ink, persisted to localStorage
  - Multi-bookmark system: 📌 toggle per page, 📋 list sheet with jump + × delete, saved as JSON array
  - Page number input: always in DOM (display:none/block), type=text inputMode=numeric, opens on single tap
  - Qibla complete rewrite: RAF smoothing (12% ease), shortest-arc interpolation, auto-start on mount
    - Aligned detection ±5° → amber glow + 🕋 icon + "Facing Qibla ✦"
    - Deep neumorphism redesign: layered box-shadows for inset compass dish
- Session 8: Quran audio + text mode polish
  - Audio switched from full-surah CDN to per-ayah EveryAyah sequential playback
  - Play starts from first ayah of current mushaf page (fetches api.alquran.cloud/v1/page)
  - seqRef tracks {surahNum, ayahNum, total} for stale-closure-safe onEnded advance
  - Mutual exclusion: seq playback ↔ text-mode tap audio stop each other
  - Reciters: Alafasy + Husary only (verified working eay folder names)
  - Basmallah rendered on its own centered line in text mode
    - Surahs 2-114 (except 9): static header above ayah list
    - Surah 1: ayah 1 styled as basmallah line instead of numbered row
    - Surah 9: no basmallah (correct per sunnah)
  - Text mode dividers + ayah sheet dividers: dark brown rgba(90,55,15,x) in light mode
  - Dark mode overrides for sheet dividers, num, ar text, translation text

## Current State (after Session 8)

- **5 tabs**: Prayer Times, Qibla, Adhkar, Islamic Calendar, Quran Reader — all complete and polished
- **Quran Reader**:
  - 604 SVG pages (SVGO optimised, served from /public), offline-capable
  - Parchment light mode / obsidian dark mode with warm inverted ink
  - Smooth slider navigation with tooltip, surah jump sheet, swipe gestures
  - Multi-bookmark system (save/list/delete), persistent across sessions
  - Auto-saves last-read page to localStorage
  - Single-tap page number input (keyboard opens immediately on mobile)
  - Per-ayah sequential audio (EveryAyah CDN), starts from current page's first ayah
  - Text mode: basmallah header, tappable ayahs, translation sheet, per-ayah audio
  - Mutual exclusion between sequential and single-ayah audio
- **Qibla**: live compass with RAF smoothing, auto-starts, neumorphic dish design
- **PWA**: installable on Android/iOS/desktop, cache-first service worker
- **Ramadan Mode**: auto-detect, Iftar/Suhoor hero, banner, prayer badges
- **Islamic Calendar**: Hijri grid, event dots, upcoming events list
- **Design**: Obsidian + Amber + Lapis identity, glass + neumorphism
- **Next up**: decide Phase 3 direction (community / masjid finder / halal map / mobile)
