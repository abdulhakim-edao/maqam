# Phase 5 — Backend, Accounts & Sync

**Theme**: Remembers you. Follows you across devices.

**Goal**: Users should never lose their data when they switch phones or browsers.

---

## Why Supabase

- Postgres under the hood — real relational database
- Auth built-in (email, Magic Link, Google, Apple)
- Real-time subscriptions — useful for Masjid Dashboard
- Row-level security — each user's data is isolated by default
- Edge Functions — serverless for push notification delivery
- Free tier is generous; pricing scales with usage

---

## Auth Strategy

### Sign In Options

- **Magic Link (email)** — no password to forget, no friction
- **Google OAuth** — one tap
- **Apple OAuth** — required for iOS App Store if other social logins present
- **Anonymous** — use the app without an account; upgrade later without losing data

### Anonymous → Authenticated Migration

Critical: users who use the app for weeks before creating an account must not lose data.

- Local data stored under a stable anonymous user ID
- On sign-up: merge local data to their new account
- Supabase supports this pattern natively via `supabase.auth.linkIdentity()`

---

## Data Model

```sql
-- Users (managed by Supabase Auth, extended here)
create table profiles (
  id          uuid references auth.users primary key,
  created_at  timestamptz default now(),
  settings    jsonb default '{}',   -- calc method, madhab, themes, etc.
  streak_data jsonb default '{}'    -- tasbih streak, adhkar streak
);

-- Quran bookmarks
create table bookmarks (
  id          bigint generated always as identity primary key,
  user_id     uuid references profiles(id) on delete cascade,
  page        int not null check (page between 1 and 604),
  label       text,
  created_at  timestamptz default now()
);
create index on bookmarks(user_id);

-- Tasbih sessions
create table tasbih_sessions (
  id          bigint generated always as identity primary key,
  user_id     uuid references profiles(id) on delete cascade,
  date        date not null,
  dhikr_ar    text not null,
  dhikr_en    text,
  count       int not null,
  target      int not null,
  complete    boolean default false,
  created_at  timestamptz default now()
);
create index on tasbih_sessions(user_id, date);

-- Masjid subscriptions (for dashboard notifications)
create table masjid_subscriptions (
  id          bigint generated always as identity primary key,
  user_id     uuid references profiles(id) on delete cascade,
  masjid_id   text not null,   -- OSM node ID
  created_at  timestamptz default now(),
  unique(user_id, masjid_id)
);

-- Push subscriptions
create table push_subscriptions (
  id             bigint generated always as identity primary key,
  user_id        uuid references profiles(id) on delete cascade,
  subscription   jsonb not null,   -- Web Push subscription object
  timezone       text not null,
  enabled_prayers text[] default '{Fajr,Dhuhr,Asr,Maghrib,Isha}',
  lead_minutes    int default 0,
  updated_at     timestamptz default now()
);
```

### Row-Level Security (RLS)

Every table has a policy: `using (user_id = auth.uid())`. Users only ever see their own data.

---

## Sync Architecture

### Conflict Resolution

Last-write-wins for settings. Merge for bookmarks (union of both sets). For tasbih sessions,
insert-only: never mutate, just append.

### Optimistic Updates

- UI updates immediately on user action
- Sync happens in background via `supabase.from('bookmarks').upsert()`
- If offline: queue in localStorage, flush on reconnect

### Real-time

- Bookmarks sync in real-time across browser tabs and devices
- Supabase real-time subscriptions on `bookmarks` table

---

## Push Notification Server

### Architecture

- Supabase Edge Function: `send-prayer-notifications`
- Supabase pg_cron: fires every minute
- Function checks `push_subscriptions` table for users whose next prayer is due
- Sends Web Push payload with prayer name, time, remaining minutes
- iOS: APNs (via Capacitor native layer), Android: FCM, Web: Web Push API

### Privacy

- Only data stored server-side: timezone, calc method, enabled prayers, push subscription
- No location stored — prayer times calculated at send-time using stored lat/lon
- Wait — store encrypted lat/lon only for users who explicitly enable cloud notifications
- Alternatively: store only city (reverse geocoded) and recalculate from city centroid
  (acceptable accuracy for notification purposes)

---

## Phase 5 Build Order

1. Supabase project setup + schema migration
2. Auth: Magic Link + Google OAuth
3. Anonymous user with local-first data
4. Settings sync (profile table)
5. Bookmarks sync
6. Tasbih sessions sync
7. Anonymous → authenticated migration
8. Push notification Edge Function + pg_cron
9. Real-time bookmark sync across tabs

---

## Phase 5 Success Criteria

- 20%+ of DAU have accounts
- Cross-device sync working with zero reported data loss
- Push notifications delivered within 60 seconds of prayer time
- Data stored per privacy promise: no location on server without explicit consent
