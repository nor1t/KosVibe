# Sprint 2 — Places Architecture

> **Lead Backend Architect**
> **Date:** 2026-07-01
> **Repository:** KosVibe (`norit/KosVibe`)
> **Rule:** The frontend is COMPLETE and is the source of truth. This sprint is purely additive — no existing tables were modified, no frontend code was changed, no screens were touched.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Created](#2-what-was-created)
3. [Architectural Concept](#3-architectural-concept)
4. [Database Schema](#4-database-schema)
5. [Conventions Applied](#5-conventions-applied)
6. [RLS Policies](#6-rls-policies)
7. [Compatibility Views](#7-compatibility-views)
8. [Generated Types](#8-generated-types)
9. [Seeded Reference Data](#9-seeded-reference-data)
10. [How to Apply the Migration](#10-how-to-apply-the-migration)
11. [What Was NOT Done (Deferred)](#11-what-was-not-done-deferred)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Refactor backend to be place-centered | ✅ |
| Create `places` table (central entity) | ✅ |
| Create `cities` table (normalized municipalities) | ✅ |
| Create `place_categories` table | ✅ |
| Create `place_category_links` table (M:N) | ✅ |
| Create `place_images` table | ✅ |
| Create `place_hours` table | ✅ |
| Create `place_contacts` table | ✅ |
| Create `tags` table | ✅ |
| Create `place_tags` table (M:N) | ✅ |
| Create `restaurant_profiles` table (place extension) | ✅ |
| Preserve existing `restaurants` table | ✅ Untouched |
| Create compatibility views | ✅ `place_catalog`, `restaurants_compat` |
| Generate migrations | ✅ |
| Generate TypeScript types | ✅ |
| Do NOT modify screens | ✅ No frontend files changed |
| Implement RLS on all new tables | ✅ |
| Seed reference data (cities, categories, tags) | ✅ |

---

## 2. What Was Created

### Files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701140000_sprint2_places_architecture.sql` | Migration: 10 tables, 4 enums, 5 slug trigger functions, 1 RLS helper, 40 RLS policies, 2 compatibility views, seeded reference data |
| `src/types/database.types.ts` | Updated TypeScript database types (all existing + Sprint 2 tables, views, functions, enums) |
| `docs/SPRINT_2_PLACES_ARCHITECTURE.md` | This document |

### No Existing Files Modified

The frontend source code was **not touched**. The existing `restaurants` table and all related tables (`restaurant_images`, `saved_restaurants`, `menu_categories`, `menu_items`, `restaurant_catalog` view) remain exactly as they were. The migration is purely additive.

---

## 3. Architectural Concept

### From Restaurant-Centered to Place-Centered

Before Sprint 2, the backend was centered on the `restaurants` table. Every place of interest was assumed to be a restaurant. This limited the app's ability to represent cafes, bars, venues, attractions, hiking trails, and other place types.

Sprint 2 introduces a **place-centered architecture**:

```
                    ┌──────────────┐
                    │    places    │  ← central entity
                    │  (any kind)  │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   cities    │  │ place_cats  │  │   tags      │
   │ (location)  │  │ (category)  │  │ (labels)    │
   └─────────────┘  └──────┬──────┘  └──────┬──────┘
                           │                │
                   ┌───────▼──────┐  ┌──────▼──────┐
                   │ place_cat_   │  │ place_tags  │
                   │ links (M:N)  │  │  (M:N)      │
                   └──────────────┘  └─────────────┘

          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │ place_imgs  │  │ place_hours │  │ place_      │
   │ (gallery)   │  │ (weekly)    │  │ contacts    │
   └─────────────┘  └─────────────┘  └─────────────┘

                    ┌──────────────────┐
                    │ restaurant_      │
                    │ profiles (1:1)   │  ← restaurant-specific extension
                    └──────────────────┘
```

### Key Design Decisions

1. **`places` is the central entity** — any point of interest (restaurant, cafe, venue, attraction, etc.) is a place with a `kind` discriminator.

2. **`restaurant_profiles` extends places** — restaurant-specific fields (cuisine, tagline, hours_text, reservation/delivery/takeaway flags) live in a 1:1 extension table. This keeps `places` generic while preserving restaurant richness.

3. **`cities` normalizes locations** — the 38 Kosovo municipalities from `discoveryLocations` are seeded as a reference table. `places.city_id` is the FK; `places.city` is a denormalized text fallback for legacy compatibility.

4. **Categories are M:N** — a place can belong to multiple categories (e.g. a restaurant that is also a study spot). `place_category_links` supports a `is_primary` flag (at most one per place).

5. **Contacts are multi-channel** — `place_contacts` supports phone, email, website, and social media (instagram, facebook, tiktok, x) with a `is_primary` flag per kind.

6. **Hours are weekly** — `place_hours` stores one row per day of week with `open_time`/`close_time` as `HH:MM` strings (matching the UI's `"11:00 - 23:00"` format) and an `is_closed` flag.

7. **Tags are reusable** — `tags` is a shared definitions table; `place_tags` is the M:N junction. Tags support i18n (`name_sq`).

8. **Legacy `restaurants` table preserved** — not modified, not dropped. Compatibility views bridge the old and new schemas.

---

## 4. Database Schema

### Enum Types

```sql
type place_status as enum ('draft', 'active', 'inactive', 'archived');
type place_kind as enum ('restaurant', 'cafe', 'bar', 'venue', 'attraction', 'hotel', 'shop', 'other');
type contact_kind as enum ('phone', 'email', 'website', 'instagram', 'facebook', 'tiktok', 'x', 'other');
type day_of_week as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
```

### Table: `cities`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | Auto-generated from name |
| name | text | |
| name_sq | text | Albanian name (optional) |
| region | text | |
| country | text | default 'Kosovo' |
| latitude | numeric(9,6) | |
| longitude | numeric(9,6) | |
| default_zoom | numeric(4,2) | Map zoom delta |
| is_active | boolean | default true |
| sort_order | int | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

### Table: `place_categories`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | Auto-generated from name |
| name | text | |
| name_sq | text | Albanian name (optional) |
| description | text | |
| icon | text | Ionicons name |
| accent_color | text | Hex color |
| is_active | boolean | default true |
| sort_order | int | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

### Table: `places` (central entity)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | Auto-generated from name |
| name | text | |
| description | text | |
| kind | place_kind | default 'restaurant' |
| city_id | uuid → cities | FK (nullable) |
| city | text | Denormalized fallback |
| address | text | |
| latitude | numeric(9,6) | |
| longitude | numeric(9,6) | |
| price_range | text | |
| rating | numeric(2,1) | 0-5 |
| review_count | int | default 0 |
| is_featured | boolean | default false |
| is_published | boolean | default true |
| status | place_status | default 'active' |
| business_account_id | uuid → business_accounts | Optional owner |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

### Table: `place_category_links` (M:N)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| place_id | uuid → places | ON DELETE CASCADE |
| category_id | uuid → place_categories | ON DELETE CASCADE |
| is_primary | boolean | At most one per place |
| sort_order | int | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Unique constraints:** `(place_id, category_id)` where active; `(place_id)` where `is_primary = true` and active.

### Table: `place_images`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| place_id | uuid → places | ON DELETE CASCADE |
| image_url | text | Must be http(s):// |
| alt_text | text | |
| sort_order | int | |
| is_primary | boolean | At most one per place |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

### Table: `place_hours`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| place_id | uuid → places | ON DELETE CASCADE |
| day_of_week | day_of_week | mon-sun |
| open_time | text | "HH:MM" (24h) |
| close_time | text | "HH:MM" (24h) |
| is_closed | boolean | default false |
| sort_order | int | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Unique constraint:** `(place_id, day_of_week)` where active.

### Table: `place_contacts`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| place_id | uuid → places | ON DELETE CASCADE |
| kind | contact_kind | phone, email, website, social... |
| value | text | |
| label | text | |
| is_primary | boolean | At most one per kind per place |
| sort_order | int | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Check constraints:** website must be `https?://`, email must match email regex.

### Table: `tags`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | Auto-generated from name |
| name | text | |
| name_sq | text | Albanian name (optional) |
| description | text | |
| is_system | boolean | System tags cannot be hard-deleted |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

### Table: `place_tags` (M:N)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| place_id | uuid → places | ON DELETE CASCADE |
| tag_id | uuid → tags | ON DELETE CASCADE |
| sort_order | int | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Unique constraint:** `(place_id, tag_id)` where active.

### Table: `restaurant_profiles` (1:1 place extension)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| place_id | uuid → places | UNIQUE, 1:1, ON DELETE CASCADE |
| cuisine | text | |
| tagline | text | |
| hours_text | text | Legacy UI format ("11:00 - 23:00") |
| is_open_now | boolean | Denormalized from place_hours |
| reservation_enabled | boolean | |
| delivery_enabled | boolean | |
| takeaway_enabled | boolean | |
| created_at / updated_at | timestamptz | Auto |
| created_by / updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

---

## 5. Conventions Applied

All Sprint 1 conventions are continued in Sprint 2:

- **Timestamps:** `created_at` / `updated_at` auto-managed
- **Audit:** `created_by` / `updated_by` auto-populated from `auth.uid()`
- **Soft delete:** `deleted_at` on all tables; all unique indexes are partial (`WHERE deleted_at IS NULL`)
- **Slugs:** Auto-generated via `slugify()` trigger functions (`set_city_slug`, `set_place_category_slug`, `set_place_slug`, `set_tag_slug`)
- **RLS:** Enabled on all new tables
- **Comments:** Every table and key column has a `COMMENT`

---

## 6. RLS Policies

### Helper Function

| Function | Returns | Purpose |
|---|---|---|
| `is_place_owner(place_id)` | boolean | True if current user is an active member of the business account owning the place, or is admin |

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `cities` | Public (active) or admin | Admin only | Admin only | Admin only |
| `place_categories` | Public (active) or admin | Admin only | Admin only | Admin only |
| `places` | Public (published), owner, or admin | Authenticated (created_by = self) or admin | Owner or admin | Admin only |
| `place_category_links` | When parent place readable | Owner or admin | Owner or admin | Owner or admin |
| `place_images` | When parent place published | Owner or admin | Owner or admin | Owner or admin |
| `place_hours` | When parent place published | Owner or admin | Owner or admin | Owner or admin |
| `place_contacts` | When parent place published | Owner or admin | Owner or admin | Owner or admin |
| `tags` | Public (active) or admin | Admin only | Admin only | Admin only |
| `place_tags` | When parent place published | Owner or admin | Owner or admin | Owner or admin |
| `restaurant_profiles` | When parent place published | Owner or admin | Owner or admin | Owner or admin |

Child tables (images, hours, contacts, category_links, tags links, restaurant_profiles) inherit visibility from their parent place — they are readable when the parent place is published, or when the current user is the place owner or admin.

---

## 7. Compatibility Views

### `place_catalog`

A catalog view mirroring the legacy `restaurant_catalog` shape but sourced from the new place-centered schema. Includes primary image, phone, website, cuisine (from restaurant_profiles), city (from cities or denormalized), kind, city_id, and status.

```sql
select * from public.place_catalog;
-- Returns: id, slug, name, description, city, address, cuisine, price_range,
--          rating, latitude, longitude, phone, website, is_featured, image_url,
--          kind, city_id, status
```

### `restaurants_compat`

A compatibility view that exposes the new places schema through the **exact column shape** of the legacy `restaurants` table. This allows the existing `restaurant_catalog` view and any legacy queries to continue functioning while data is migrated.

```sql
select * from public.restaurants_compat;
-- Returns: id, slug, name, description, city, address, cuisine, price_range,
--          rating, latitude, longitude, phone, website, is_featured,
--          is_published, created_at, updated_at
```

Only places with `kind = 'restaurant'` are included.

### Legacy `restaurants` Table

The original `restaurants` table is **preserved untouched**. It continues to work exactly as before. The compatibility views provide a parallel path for reading place-centered data through the legacy interface. Data migration from `restaurants` to `places` is deferred to a future sprint.

---

## 8. Generated Types

`src/types/database.types.ts` now includes:

- All Sprint 2 tables: `cities`, `place_categories`, `places`, `place_category_links`, `place_images`, `place_hours`, `place_contacts`, `tags`, `place_tags`, `restaurant_profiles`
- Sprint 2 views: `place_catalog`, `restaurants_compat`
- Sprint 2 enums: `PlaceStatus`, `PlaceKind`, `ContactKind`, `DayOfWeek`
- Sprint 2 functions: `set_city_slug`, `set_place_category_slug`, `set_place_slug`, `set_tag_slug`, `is_place_owner`

Usage example:

```typescript
import type { Database, Tables, Enums } from '@/src/types/database.types';

type Place = Tables<'places'>;
type City = Tables<'cities'>;
type PlaceKind = Enums<'place_kind'>;
type PlaceCatalogRow = Views<'place_catalog'>;
```

---

## 9. Seeded Reference Data

### Place Categories (5)

Seeded to mirror the frontend category union `'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study'`:

| Slug | Name | Name (SQ) | Icon |
|---|---|---|---|
| restaurants | Restaurants | Restorante | restaurant-outline |
| hiking | Hiking | Ecje | walk-outline |
| party | Party | Fest | wine-outline |
| culture | Culture | Kulture | library-outline |
| study | Study | Studim | book-outline |

### Cities (38)

All 38 Kosovo municipalities from `discoveryLocations` (excluding the 'all' pseudo-location) are seeded with their coordinates and default zoom from the mock data.

### Tags (10 starter system tags)

| Slug | Name | Name (SQ) |
|---|---|---|
| traditional | Traditional | Tradicionale |
| italian | Italian | Italiane |
| pizza | Pizza | Pizza |
| sushi | Sushi | Sushi |
| cafe | Cafe | Kafene |
| grill | Grill | Zjar |
| vegetarian | Vegetarian | Vegetariane |
| family-friendly | Family Friendly | Per Familje |
| outdoor | Outdoor | Ne natyre |
| nightlife | Nightlife | Jete nate |

All seeds use `ON CONFLICT (slug) DO UPDATE` so they are idempotent and can be re-run safely.

---

## 10. How to Apply the Migration

The migration file is ready at:
```
supabase/migrations/20260701140000_sprint2_places_architecture.sql
```

### Option A: Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref rrpfxhptjmdjuoxhldpz
npx supabase db push
```

### Option B: Supabase Dashboard (SQL Editor)

1. Go to the Supabase Dashboard → SQL Editor
2. Copy the contents of the migration file
3. Paste and run

### Option C: psql

```bash
psql "postgresql://postgres:[PASSWORD]@db.rrpfxhptjmdjuoxhldpz.supabase.co:5432/postgres" \
  -f supabase/migrations/20260701140000_sprint2_places_architecture.sql
```

---

## 11. What Was NOT Done (Deferred)

Per the sprint requirements, the following were **not** done:

- ❌ No existing tables modified (`restaurants` and related tables untouched)
- ❌ No frontend code changed (no screens, providers, or components modified)
- ❌ No data migration from `restaurants` to `places` (deferred — compatibility views bridge the gap)
- ❌ No menu data migrated to place-centered model (existing `menu_categories`/`menu_items` still reference `restaurants`)
- ❌ No reviews, promotions, or today's specials tables created (deferred to a future sprint)
- ❌ No Edge Functions created
- ❌ No storage buckets configured
- ❌ No RPC functions for computed `isOpen` / `distance` / `reviewCount` (deferred)

These are deferred to future sprints.

---

## Sprint 2 Complete

The backend is now place-centered. The `places` table is the central entity, with `restaurant_profiles` as a 1:1 extension for restaurant-specific data. Cities, categories, tags, images, hours, and contacts are all normalized. The legacy `restaurants` table is preserved, and compatibility views ensure existing consumers keep working. TypeScript types are generated and compile cleanly. No screens were modified.

**Next sprint:** Data migration from `restaurants` to `places`, or feature table creation (reviews, promotions, specials, stories, events, etc.) per the Sprint 0 recommended migration order.