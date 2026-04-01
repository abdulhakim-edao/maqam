# Phase 3 — Community & Discovery

**Theme**: Extend the daily ritual. Give users tools beyond the five pillars.

**Goal**: Make Maqam the only app open during the 30 minutes after each prayer.

---

## 3.1 Tasbih Counter ✅ Next to build

**Why it's first**: Tasbih is done *immediately* after Salah. If Maqam is open for prayer
times, the user should never have to switch to another app to count.

### Design
- Accessible as a third tab inside the Adhkar screen (Morning / Evening / **Tasbih**)
- Large SVG progress ring (260px), count centered in Arabic numerals
- Tap the entire ring area to count — big target, no fumbling mid-dhikr
- Subtle haptic on each tap (`navigator.vibrate([15])`)
- Haptic burst on target reached (`[30, 40, 30]`) + ring fills amber + brief animation
- Auto-advances through a sequence (SubhanAllah 33 → Alhamdulillah 33 → Allahu Akbar 33)

### Presets
| Arabic | Transliteration | Default Target |
|---|---|---|
| سبحان الله | SubhanAllah | 33 |
| الحمد لله | Alhamdulillah | 33 |
| الله أكبر | Allahu Akbar | 33 |
| لا إله إلا الله | La ilaha illa Allah | 100 |
| أستغفر الله | Astaghfirullah | 100 |
| سبحان الله وبحمده | SubhanAllahi wa bihamdih | 100 |
| Custom | — | user-defined |

### Session Flow
1. User picks a dhikr (or starts the post-Salah sequence)
2. Counter shows `0 / 33` with progress ring
3. Each tap: count++ + haptic
4. At target: ring fills, haptics burst, toast "SubhanAllah ×33 ✓", auto-advance or stop
5. On sequence complete: "مبروك — Post-Salah dhikr complete" card

### Data Model
```js
// localStorage: maqam_tasbih_sessions
[{ date: '2026-04-01', dhikr: 'سبحان الله', count: 33, target: 33, complete: true }, ...]
```

### Daily Summary (in Adhkar tab)
- Small "Today: 99 × SubhanAllah · Alhamdulillah · Allahu Akbar" row at top of Adhkar
- Streak: consecutive days with at least one complete session

### Tech Notes
- All client-side, localStorage only
- Haptic: `navigator.vibrate` (Android only — iOS Safari blocks this, silently no-op)
- Sound: optional Web Audio API soft click (single oscillator, 10ms, 880Hz, gain 0.1)
- Arabic numerals: `count.toLocaleString('ar-EG')` for display toggle

---

## 3.2 Masjid Finder

**Why**: "Where is the nearest masjid?" is one of the most common Muslim searches. Every
existing solution either requires an account or a third-party API key.

### Data Source
OpenStreetMap Overpass API — free, no key, crowdsourced, globally comprehensive.

```
[out:json][timeout:10];
node[amenity=place_of_worship][religion=muslim](around:5000,{lat},{lon});
out body;
```

### UI
- Location permission request on first open (reuses existing geolocation)
- List view: name · distance · direction arrow · open in Maps button
- Each card: masjid name (Arabic if available), distance in km/mi, bearing
- "Navigate" → `https://maps.apple.com/?daddr={lat},{lon}` (iOS) / Google Maps fallback
- Filter: show only mosques with Jumu'ah time data (OSM `opening_hours` tag)

### Offline Handling
- Cache last 20 results in localStorage with timestamp
- If cached < 24h old and no network, show cached with "Last updated X hours ago"
- If no cache and no network: "No connection — try again when online"

### Data Quality Note
OSM coverage is excellent in Muslim-majority countries and major cities. Rural coverage
varies. Users can link to OSM to add missing masajid — "Is your masjid missing? Add it →".

### Tech Notes
- No npm dependency — raw `fetch` to Overpass
- Haversine distance calculation (already have bearing math from Qibla)
- Results capped at 20, sorted by distance
- Rate-limit safe: one request per user action, not polling

---

## 3.3 Halal Map

**Why**: Finding halal food is a daily need for practicing Muslims in non-Muslim-majority
countries. Google Maps has no halal filter. Zomato/Yelp data is unreliable.

### Data Source
OpenStreetMap Overpass API:
```
[out:json][timeout:15];
(
  node[amenity=restaurant][diet:halal=yes](around:3000,{lat},{lon});
  node[amenity=restaurant][cuisine=halal](around:3000,{lat},{lon});
  node[amenity=fast_food][diet:halal=yes](around:3000,{lat},{lon});
);
out body;
```

### UI
- Card list sorted by distance with category chip (restaurant / fast food / cafe)
- Name, cuisine type, distance, "Navigate" button
- "Report incorrect" link → opens OSM edit in browser (community-sourced quality)
- Filter chips: All · Restaurant · Fast Food · Cafe

### Caveats
- OSM halal data is incomplete in many Western cities — we note this clearly
- Phase 5: allow user submissions that feed back to OSM via their API

---

## 3.4 Prayer Notifications

**Why**: The most-requested feature that Muslim Pro gets right. We can do it better — with
user control, no dark patterns, and no ads attached.

### Implementation
- Web Push API (requires HTTPS — already live at almaqam.app)
- Service worker handles notification delivery even when app is closed
- `PushManager.subscribe()` on user opt-in (explicit — never auto-prompt)

### UX
- Settings screen: toggle per prayer (Fajr / Dhuhr / Asr / Maghrib / Isha)
- Lead time: "At prayer time" / "5 min before" / "10 min before" / "15 min before"
- Notification content: "Asr — 4:23 PM · 12 min remaining"
- Tap notification → opens Maqam to Prayer Times tab
- No notification during Salah itself (within the prayer window, suppress)

### Backend Requirement
- Needs a lightweight cron/push server to send the right time per user timezone
- Use Supabase Edge Functions + Supabase's built-in cron (Phase 5 dependency)
- Phase 3 interim: local `setTimeout` scheduling (works only while tab open — note limitation)

### Privacy
- Push subscription stored server-side (Supabase) with only: timezone, calc method, enabled prayers
- No name, no email required for notifications
- Easy unsubscribe: toggle in settings, server-side unsubscribe via `pushSubscription.unsubscribe()`

---

## 3.5 Settings Screen

**Why**: Users need control. Prayer calc method, Asr madhab, theme, notifications — these
are not nice-to-haves, they're requirements for daily use.

### Sections

**Prayer Calculation**
- Method: ISNA / MWL / Egyptian / Karachi / Umm Al-Qura / Moonsighting Committee
- Asr: Standard (Shafi'i/Maliki/Hanbali) / Hanafi
- High latitude adjustment: None / Middle of Night / One-Seventh / Angle-Based
- Current location display (city name via reverse geocode if available)

**Notifications**
- Toggle per prayer (links to 3.4 above)
- Lead time picker

**Appearance**
- Theme: System / Light / Dark
- Language: English / العربية (Arabic UI)
- Numerals: Western (123) / Arabic-Indic (١٢٣)

**About**
- Version, GitHub link, privacy statement (one paragraph, plain language)
- "Refresh prayer times" (clears cached location)

### Tech Notes
- All settings in one `maqam_settings` localStorage object
- React context (`SettingsContext`) so any component can read settings without prop-drilling
- Settings screen is a full-page view, not a modal — deserves real estate

---

## Phase 3 Build Order

1. ✅ Tasbih Counter — ships first, highest daily use
2. ✅ Settings Screen — needed for notification setup
3. ✅ Prayer Notifications — requires settings
4. ✅ Masjid Finder — network feature, less critical offline
5. ✅ Halal Map — least critical, but high discovery value

---

## Phase 3 Success Criteria

- Tasbih: used at least once by 40%+ of DAU
- Settings: calc method changed by at least 20% of users (proves they trust us enough to customize)
- Notifications: 30%+ opt-in rate
- Masjid: 15%+ of users search at least once per month
