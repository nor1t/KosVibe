# Sprint 5 — Events: Database-Backed Migration

> **Lead Backend Architect**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Rule:** Event mock data replaced with database-backed data. UI identical with minimal screen changes. Compatibility maintained through repository layer.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Changed](#2-what-was-changed)
3. [Database Migration](#3-database-migration)
4. [Repository Changes](#4-repository-changes)
5. [Screen Changes](#5-screen-changes)
6. [Data Flow](#6-data-flow)
7. [Verification Results](#7-verification-results)
8. [What Stays Unchanged](#8-what-stays-unchanged)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Create DB tables for events, attendance, reviews, organizers, notifications | Done |
| Seed all existing mock event data into the database | Done |
| Replace event mock data imports with DB queries | Done |
| Add write methods (join, leave, confirm, rate, create) to repository | Done |
| Keep identical UI — minimal screen changes | Done |
| Replace event mock data with database-backed data | Done |

---

## 2. What Was Changed

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701160000_sprint5_events.sql` | Sprint 5 migration — 7 new tables + seed data |
| `docs/SPRINT_5_EVENTS.md` | Sprint documentation |

### Modified files

| File | Change |
|---|---|
| `src/repositories/eventsRepository.ts` | Full rewrite. DB queries with cache. Write methods for join/leave/confirm/rate/create. Async reads for attendance and ratings. |
| `src/screens/TavolinaScreen.tsx` | Added `useEffect` to load events from DB on mount via `eventsRepository.refresh()`. Added `useEffect` import. No UI changes. |
| `src/data/mockData.ts` | Removed `tavolinaAvatar` constant from top-level (moved inline before `tavolinaInvites` array). All event data (`eventHighlights`, `kosovoHighlights`, `tavolinaInvites`, `activeOffers`) kept as reference/compatibility — `EventsRepository` no longer imports them. |

---

## 3. Database Migration

### New tables

| Table | Purpose | Key Columns |
|---|---|---|
| `tavolina_events` | Community events (Tavolina feature) | `restaurant_id`, `restaurant_name`, `city`, `day`, `time`, `event_type`, `creator_name`, `creator_avatar`, `description`, `tags`, `spots_label`, `image_url`, `is_paid`, `price`, `max_attendees` |
| `event_highlights` | Curated event cards | `title`, `category`, `venue`, `date_display`, `description`, `color_from`, `color_to`, `is_active`, `sort_order` |
| `kosovo_highlights` | Kosovo content cards | `title`, `description`, `accent_color`, `sort_order`, `is_active` |
| `event_attendance` | Join/attendance tracking | `event_id`, `user_id`, `status` (enum: joined/confirmed/cancelled) |
| `event_reviews` | Event ratings/reviews | `event_id`, `user_id`, `rating` (1-5), `comment` |
| `event_organizers` | Organizer profiles | `name` (unique), `avatar`, `rating`, `event_count`, `confirmed_guests`, `reliability`, `badges` (text[]), `recent_praise` (text[]) |
| `event_notifications` | Event notifications | `event_id`, `user_id`, `type`, `message`, `is_read` |

All tables follow Sprint 1-4 conventions:
- UUID PKs via `gen_random_uuid()`
- `created_at`/`updated_at` timestamps
- `deleted_at` soft-delete
- RLS policies with appropriate access rules
- Audit triggers (`set_created_by`, `set_updated_by`, `set_updated_at`)
- Partial unique indexes for attendance and reviews

### New enum

| Type | Values |
|---|---|
| `event_attendance_status` | `joined`, `confirmed`, `cancelled` |

### Seeded data

- **5 event highlights** (Duplex Night Market, Rugova Canyon Hike, Prizren Heritage Walk, Kosovo Flavors Dinner, Campus Study Circle)
- **5 Kosovo highlights** (Economy, Nature, Nightlife, Culture, Study)
- **3 tavolina events** (Pishat dinner, Sushi Bar Tokio, Prizren Old Town Walk)
- **3 event organizers** (Arta K., Rina D., Dren A.)

---

## 4. Repository Changes

### EventsRepository

**Data sources (all DB-backed):**
- `event_highlights` → `getEventHighlights()`  
- `tavolina_events` → `getTavolinaInvites()`
- `kosovo_highlights` → `getKosovoHighlights()`
- `restaurant_promotions` → `getActiveOffers()` (Sprint 4 table)

**Caching:**
- `eventHighlightsCache`, `tavolinaInvitesCache`, `kosovoHighlightsCache` arrays
- `refresh()` loads all three from Supabase in parallel
- `initialized` flag + `ensureReady()` for lazy initialization

**Write methods:**
- `createEvent(input)` — inserts into `tavolina_events`, updates cache
- `joinEvent(eventId)` — inserts into `event_attendance` with status `joined`
- `leaveEvent(eventId)` — updates attendance to `cancelled`
- `confirmAttendance(eventId)` — updates attendance to `confirmed`
- `rateEvent(eventId, rating)` — upserts into `event_reviews`

**Async read methods:**
- `getTavolinaInvitesAsync()`, `getEventHighlightsAsync()`, `getKosovoHighlightsAsync()`
- `getAttendedEventIds()` — returns IDs with status `joined`
- `getConfirmedEventIds()` — returns IDs with status `confirmed`
- `getEventRatings()` — returns `Record<string, number>` from reviews

**Removed:**
- All imports from `mockData.ts` (activeOffers, eventHighlights, kosovoHighlights, tavolinaInvites)

---

## 5. Screen Changes

**`TavolinaScreen.tsx`** — Minimal, additive changes only:

1. Added `useEffect` import
2. Added `useEffect` hook to load events on mount:
```typescript
useEffect(() => {
  eventsRepository.refresh().then(() => {
    setEvents(eventsRepository.getTavolinaInvites());
  });
}, []);
```

No UI code, styling, modals, form handlers, or component structure was changed. The screen continues to use local React state for join/confirm/rate interactions (which can be migrated to DB-backed state in a future sprint).

---

## 6. Data Flow

```text
App Start
  → TavolinaScreen mounts
    → useEffect: eventsRepository.refresh()
      → Supabase: event_highlights (all active)
      → Supabase: tavolina_events (all active, ordered by created_at)
      → Supabase: kosovo_highlights (all active, ordered by sort_order)
    → setEvents(eventsRepository.getTavolinaInvites())

Screen: TavolinaScreen
  → Join/Leave/Create — local state (future: DB calls)

Screen: ActivityDashboardScreen (event highlights)
  → eventsRepository.getEventHighlights()
    → cached EventFeature[]

Screen: Explore/Discover (Kosovo highlights)
  → eventsRepository.getKosovoHighlights()
    → cached KosovoHighlight[]
```

---

## 7. Verification Results

### TypeScript

```bash
npx tsc --noEmit
PASS — zero errors
```

### Database

```bash
npx supabase db push
> Applying migration 20260701160000_sprint5_events.sql...
> Finished supabase db push.
PASS
```

### Mock data imports removed

- `eventsRepository.ts` — no imports from `mockData.ts`
- `tavolinaInvites`, `eventHighlights`, `activeOffers`, `kosovoHighlights` arrays remain in `mockData.ts` for reference but are not consumed by any repository

---

## 8. What Stays Unchanged

- All screens (beyond the minimal `useEffect` addition in TavolinaScreen)
- All UI components and styling
- The `EventFeature`, `ActiveOffer`, `TavolinaInvite`, `KosovoHighlight` model types (identical shape)
- All other repositories (restaurants, places, stories, marketplace, profile, search, favorites)
- Non-event mock data (profile, discovery locations)
- All screen layouts and visual design

---

## Sprint 5 Complete

Event data is now fully database-backed. The 5 event highlights, 5 Kosovo highlights, 3 Tavolina community events, and 3 organizer profiles are all seeded in Supabase and queried through `EventsRepository`. Write methods for event participation, attendance confirmation, rating, and creation are ready for UI integration.

The frontend behavior is identical — the TavolinaScreen loads events from the database on mount and continues to use local state for interactions. Mock data imports have been removed from the repository layer entirely.