# KosVibe — Supabase Dashboard Deployment Checklist

> This checklist covers every manual action required in the Supabase Dashboard that **cannot** be performed automatically by the existing migrations or codebase. All database tables, indexes, RLS policies, triggers, functions, enums, and seed data are handled by `supabase db push`.

---

## 1. Authentication

### 1.1 Site URL
- [ ] Go to **Authentication → URL Configuration**
- [ ] Set **Site URL** to your production domain (e.g., `https://your-app.vercel.app`)
- [ ] Add redirect URLs:
  - `exp://` (Expo development)
  - `http://localhost:8081` (Expo web)
  - Your production domain

### 1.2 Email Templates
- [ ] Go to **Authentication → Email Templates**
- [ ] Customize **Confirm Signup** template (the default mentions "Supabase" — replace with "KosVibe")
- [ ] Customize **Reset Password** template
- [ ] Customize **Magic Link** template (if using)

### 1.3 Auth Providers (Optional)
- [ ] If using social login, enable providers in **Authentication → Providers** (Google, Apple, etc.)
- [ ] Configure OAuth credentials for each provider

### 1.4 User Registration
- [ ] In **Authentication → Settings**, confirm:
  - **Enable email confirmations** is ON (recommended for production)
  - **Allow anonymous sign-ins** is OFF

---

## 2. Database

### 2.1 Apply Migrations
- [ ] Run `supabase db push` from the project root (or use Supabase Dashboard → SQL Editor to run migrations manually)
- [ ] Verify all tables exist: check **Database → Tables** — you should see ~42 tables
- [ ] Run these verification queries:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify RLS is enabled on all tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;

-- If any result, those tables have NO RLS — enable manually
ALTER TABLE <tablename> ENABLE ROW LEVEL SECURITY;

-- Verify search_documents materialized view
SELECT count(*) FROM public.search_documents;
-- Should return ~26 (21 restaurants + 5 events)
```

### 2.2 Refresh Materialized View
- [ ] After seeding data, refresh the search index:
```sql
REFRESH MATERIALIZED VIEW public.search_documents;
```
- [ ] (Optional) Set up a scheduled job to refresh periodically (e.g., via pg_cron or Supabase Edge Function)

### 2.3 Connection Pooling
- [ ] Go to **Database → Settings**
- [ ] Note the **Connection String** for production (use transaction pooler: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)

---

## 3. Storage

### 3.1 Create Buckets
- [ ] Go to **Storage → New Bucket**

| Bucket Name | Public | Purpose |
|---|---|---|
| `story-images` | ✅ Yes | User-uploaded story photos |
| `avatars` | ✅ Yes | Profile avatars |
| `event-images` | ✅ Yes | Event cover photos |

### 3.2 Storage Policies (SQL Editor)
- [ ] Paste and run this SQL to allow authenticated uploads + public reads:

```sql
-- Story images: public read, authenticated insert
CREATE POLICY "Story images are publicly readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'story-images');

CREATE POLICY "Story images are uploadable by authenticated users"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-images');

-- Avatars: public read, authenticated insert
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Avatars are uploadable by authenticated users"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Event images: public read, authenticated insert
CREATE POLICY "Event images are publicly readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'event-images');

CREATE POLICY "Event images are uploadable by authenticated users"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-images');
```

### 3.3 File Size Limits
- [ ] In **Storage → Settings**, set max file upload size (e.g., 10MB for images)

---

## 4. RLS Policies

> ✅ All RLS policies are included in migrations (Sprints 1-11). No manual action needed.
> Verify with: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';`

---

## 5. Buckets

> See Section 3 above. Bucket creation is manual — not covered by migrations.

---

## 6. Functions (Edge Functions / RPC)

### 6.1 Database Functions
- [ ] Verify RPC functions exist:
```sql
SELECT proname FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('search_all', 'search_restaurants');
```
- Should return 2 rows. If not, re-run migration `20260701190000_sprint8_search.sql`.

### 6.2 Edge Functions (Optional)
- [ ] No Edge Functions are required for the current app. If you need push notifications, rate limiting, or webhooks, deploy them via `supabase functions deploy`.

---

## 7. Environment Variables

### 7.1 `.env` File
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in values from Supabase Dashboard → Settings → API:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 7.2 Production Overrides
- [ ] For production builds, set the same variables in your hosting platform (Vercel, Netlify, EAS, etc.)

---

## 8. Verification

### 8.1 Authentication Flow
- [ ] Open the app
- [ ] Navigate to Sign Up screen
- [ ] Create a new account
- [ ] Check Supabase Dashboard → Authentication → Users — the user should appear
- [ ] Sign out and sign back in

### 8.2 Data Reads
- [ ] Home screen shows Trending restaurants (from `places` table)
- [ ] Home screen shows Fun Activities billboard (from `fun_activities` table)
- [ ] Category screen shows filtered restaurants
- [ ] Restaurant details shows menu, reviews, hours, specials
- [ ] Map screen shows restaurant pins
- [ ] Events (Tavolina) tab shows 3 seeded events
- [ ] Stories shows 4 seeded stories per language
- [ ] Market screen shows sellers, categories, collections

### 8.3 Data Writes
- [ ] Create a story — appears in Stories list after creation
- [ ] Join an event — check `event_attendance` table
- [ ] Save a restaurant to favorites — check `saved_restaurants` table
- [ ] Book a table — check `restaurant_bookings` table
- [ ] Edit profile — check `profiles` table updated

### 8.4 Cross-User Visibility
- [ ] Open app on Device A (User 1)
- [ ] Create an event
- [ ] Open app on Device B (User 2)
- [ ] Navigate to Events tab — User 1's event should be visible
- [ ] User 2 joins the event
- [ ] Switch back to Device A — the spots count should update

### 8.5 Search
- [ ] Type a query in the search bar
- [ ] Results should return with ranked ordering
- [ ] Try a misspelled query — trigram should catch it
- [ ] Filter by city — results should narrow

### 8.6 Storage Uploads
- [ ] Create a story with a photo
- [ ] Open Supabase Dashboard → Storage → `story-images`
- [ ] The uploaded image should appear

### 8.7 TypeScript & Build
- [ ] Run `npx tsc --noEmit` — should pass with zero errors
- [ ] Run `npx expo start` — app starts without crashes
- [ ] Run `npx expo export` (optional) — production build succeeds

---

## Summary

| Area | Manual Actions | Automated (Migrations) |
|---|---|---|
| Database tables | 0 | 42 tables + 1 mat view |
| RLS policies | 0 | All tables covered (Sprints 1-11) |
| Indexes | 0 | GIN, GiST, trigram, B-tree |
| Seed data | 0 | 21 restaurants, 5 events, 8 stories, 9 sellers, 39 cities, 15 activities |
| Storage buckets | 3 (story-images, avatars, event-images) | 0 |
| Storage policies | 6 CREATE POLICY statements | 0 |
| Auth URL config | 2 (Site URL + redirect URLs) | 0 |
| Email templates | 2-3 (customize defaults) | 0 |
| Environment vars | 2 (URL + anon key) | 0 |
| Connection pooling | 1 (note pooler URL) | 0 |

**Total manual actions: ~16** (most are one-time setup)