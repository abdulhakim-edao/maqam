# Phase 6 — Monetization & Growth

**Theme**: Build a business that lets us keep the app free, ad-free, and honest.

**Goal**: $10K MRR within 12 months of launch. Primary engine: Masjid Dashboards.

---

## Principles

1. **Never monetize prayer time** — no ads, no paywalls during Salah-adjacent flows
2. **Free tier is genuinely useful** — Premium enhances, not unlocks basics
3. **B2B is the main revenue** — users pay with love; masajid pay with money
4. **Transparent pricing** — no dark patterns, easy to cancel

---

## Revenue Streams

### 1. Maqam Premium (B2C)
**Price**: $4.99/month · $29.99/year · $79.99 lifetime

**What Premium includes:**
- **Themes** — 4 additional visual themes (Desert Sand, Night Garden, Marble, Forest Dawn)
- **Custom Adhan sounds** — 8 additional reciters for prayer notification
- **Cloud sync** — bookmarks, Tasbih logs, settings across all devices
- **Advanced Tasbih** — custom sessions, history charts, export
- **Quran extras** — multiple translations side-by-side, word-by-word tafsir (Phase 6+)
- **No banner** — remove the "Try Premium" nudge

**What stays free forever:**
- All 5 prayer time calculations
- Qibla compass
- Full Quran reader (all 604 pages)
- Adhkar (all)
- Tasbih counter (basic)
- Masjid finder
- Halal map
- Push notifications (basic)

**Conversion target**: 2–3% of MAU → Maqam Premium

---

### 2. Masjid Dashboard (B2B) — Primary Revenue
**Price**: $29/month · $299/year per masjid

**What it is**: A web dashboard that masajid administrators use to manage their presence in
Maqam and communicate with their congregation.

**Features:**
- **Prayer time management** — override calculated times with imam-verified times
- **Announcements** — push notification to all followers ("Jumu'ah khutba topic this week…")
- **Events calendar** — Ramadan schedule, Islamic school, community dinners
- **Jumu'ah reminders** — automated push 30 min before Jumu'ah to all subscribers
- **Taraweeh schedule** (Ramadan) — which imam, which juz each night
- **Congregation stats** — anonymous: how many users are following this masjid
- **Donation link** — one verified payment link displayed to followers

**How users interact:**
- Masjid Finder shows a "Follow" button if the masjid has a Dashboard
- Following a masjid: get their announcements, see their verified prayer times
- No account needed to follow (push subscription only)

**Sales strategy:**
- Target: 30 masajid in first year at $299/year = $8,970 ARR
- Outreach: direct email to masjid administrators + Friday khutba network
- Free trial: 3 months free, no credit card
- Run a "Ramadan Dashboard" limited free tier each Ramadan to drive adoption

**Long-term**: If each masjid averages 500 followers who become Maqam users, 30 masajid =
15,000 users. This is the flywheel.

---

### 3. Halal Marketplace Listings (Phase 6+)
- Restaurants pay $9.99/month to be "Verified Halal" with a badge
- Includes: Google Maps style info card, menu link, hours, photos
- Revenue share with community reporters who verify listings
- Keep listings free forever; charge only for enhanced profiles

---

## Unit Economics Target (Year 1 after launch)

| Stream | Units | Price | ARR |
|---|---|---|---|
| Maqam Premium | 200 subscribers | $29.99/yr | $5,998 |
| Masjid Dashboard | 30 masajid | $299/yr | $8,970 |
| **Total** | | | **~$15K ARR** |

Year 2 target: 50 masajid + 1,000 Premium = $50K ARR

---

## App Store Considerations

- Apple takes 30% (15% for subscriptions after year 1)
- Offer web billing as default (`almaqam.app/premium`) to avoid Apple cut
- Capacitor app: link to web billing page from within the app (allowed if done correctly)
- Android: Google Play Billing required for IAP within the Android app; offer web as
  "Manage subscription" for non-Google-Play users

---

## Growth Channels

### Organic
- Word of mouth in Muslim communities (WhatsApp groups, Telegram, Discord)
- Reddit: r/islam, r/Muslim, r/exmuslim (convert market)
- Product Hunt launch (Friday of Ramadan for maximum visibility)
- Featured in "Islamic apps" roundups on YouTube

### Community
- Jumu'ah: if a masjid uses the Dashboard, imam announces it
- Islamic schools: halal map is useful for families
- Ramadan: all features spike — plan a Ramadan feature push every year

### SEO
- `almaqam.app/prayer-times/{city}` — static pages for top 500 Muslim-majority cities
- Generates organic traffic for "prayer times [city]" searches
- Each page is pre-calculated, static, instant — better than Muslim Pro's JS-heavy pages

### Press
- Islamic tech media: ProductiveMuslim.com, 1st Ethical, Muslim Girl
- Privacy angle: "The Muslim app that doesn't sell your location" — tech press will cover this

---

## What We Never Do

- No ads in the app, ever
- No selling or sharing user data
- No dark patterns (fake countdown timers, hidden cancel buttons)
- No shaming users for missing prayers
- No misleading "limited time" offers
