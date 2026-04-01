# Phase 4 — Mobile Native

**Theme**: Own the home screen. Become the app icon Muslims see every day.

**Goal**: Ship on App Store + Google Play. Enable native capabilities the web can't provide.

---

## The Decision: Capacitor vs React Native

### Option A — Capacitor (recommended)
- Wrap the existing React app in a native WebView shell
- Add native plugins for: haptics, push, home screen widget, biometric auth
- Same codebase — zero rewrite, ship in weeks not months
- **Tradeoff**: WebView rendering (slightly less smooth than fully native)

### Option B — React Native (Expo)
- Rewrite UI in React Native components
- Fully native rendering, access to every native API
- Share business logic (utils, data, localStorage → AsyncStorage)
- **Tradeoff**: 2–3 month rewrite before shipping anything new

### Recommendation
Start with **Capacitor**. It gets us on both stores in weeks with zero feature regression.
If performance becomes a real user complaint (unlikely given current app speed), migrate
the highest-impact screens to React Native incrementally.

---

## Native Capabilities Unlocked

### Home Screen Widget (iOS / Android)
**This is the killer feature.** A glanceable widget on the home screen showing:
- Next prayer name + time + countdown
- Hijri date
- One tap → opens Maqam

iOS: WidgetKit (Swift — requires Capacitor native plugin or thin Swift-side widget)
Android: Jetpack Glance (Kotlin — Capacitor plugin or standalone widget APK component)

The widget doesn't need to be perfect at launch — a simple 2x1 "Next prayer: Asr 4:23 PM"
is enough to justify the install.

### Real Push Notifications
- Phase 3 uses `setTimeout` (tab must be open)
- Native push via APNs (iOS) and FCM (Android) — works when app is closed, phone is locked
- Timing precision: ±30 seconds, not ±5 minutes like web push
- Adhan sound as notification sound — ship custom `.caf` (iOS) and `.mp3` (Android) adhan audio

### Haptics
- Web: `navigator.vibrate` — Android only, coarse
- Native iOS: `UIImpactFeedbackGenerator` — precise, textured tap feel
- Use for tasbih counter — the difference between a clay bead and a glass bead

### Offline Storage
- Replace localStorage with `@capacitor/preferences` (key-value) for small data
- Add SQLite via `@capacitor-community/sqlite` for Tasbih logs and Quran bookmarks
- IndexedDB remains for Quran index search (already works well)

### Background Location
- Update prayer times silently when user travels through a timezone
- iOS: significant location change API (battery-friendly)

---

## App Store Specifics

### iOS
- Target iOS 16+ (covers 90%+ of active iPhones)
- App Review: prayer apps are well-established — expect standard review, 2–5 days
- Privacy nutrition label: location (used for prayer calculation, not shared)
- IAP for Premium via StoreKit 2

### Android
- Target Android 10+ (API 29)
- Google Play: faster review (1–2 days), less strict
- Billing API for Premium subscriptions

### Content Requirements
- App Store description: lead with "no ads, private, offline"
- Screenshots: dark mode looks best — use obsidian theme in all marketing
- App icon: the existing SVG icon works — export at all required sizes

---

## Phase 4 Build Order

1. Capacitor setup + iOS/Android project init
2. Test existing web app in WebView — fix any mobile-specific rendering issues
3. Home screen widget (iOS) — minimum viable: next prayer + time
4. Home screen widget (Android)
5. Native push notifications (replace setTimeout approach)
6. Native haptics for Tasbih
7. App Store submission (iOS)
8. Google Play submission (Android)
9. SQLite migration for persistent data

---

## Phase 4 Success Criteria

- App live in both stores
- Home screen widget available
- Push notifications work when app is closed
- App Store rating ≥ 4.5 within 30 days of launch
- 1,000 installs within first month (organic, no paid)
