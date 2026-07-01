# Sprint 4 — Restaurants: Database-Backed Migration

> **Lead Backend Architect**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Rule:** Restaurant mock data replaced with database-backed data. UI identical. Compatibility maintained through repository layer. Migration is gradual — screens are NOT modified.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Changed](#2-what-was-changed)
3. [Database Migration](#3-database-migration)
4. [Repository Changes](#4-repository-changes)
5. [Data Flow](#5-data-flow)
6. [Compatibility Strategy](#6-compatibility-strategy)
7. [Verification Results](#7-verification-results)
8. [What Was Removed](#8-what-was-removed)
9. [What Stays Unchanged](#9-what-stays-unchanged)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Replace restaurant mock data with database-backed data | Done |
| Create DB tables for reviews, promotions, specials | Done |
| Seed all 21 restaurants into the place-centered schema | Done |
| Query full restaurant detail (menus, images, hours, reviews) from DB | Done |
| Migrate favorites to `saved_restaurants` table | Done |
| Keep identical UI — no screen changes | Done |
| Maintain repository compatibility | Done |
| Remove restaurant mock data once DB is seeded | Done |

---

## 2. What Was Changed

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701150000_sprint4_restaurant_data.sql` | Sprint 4 migration — creates 3 new tables + seeds all restaurant data |

### Modified files

| File | Change |
|---|---|
| `src/repositories/restaurantsRepository.ts` | Rewritten to query DB directly. Removed mock-data fallback chain, `restaurantsData` import, `RESTAURANTS_JSON`, `mergeCatalogs`, `mergeRestaurantLists`, `buildFallbackRestaurant`. Added `loadRestaurantDetail()` with full place-centered join (places, profiles, images, hours, contacts, reviews, promotions, specials, menus). Added `buildRestaurant()` mapper. Added `detailCache` for sync/async bridge. |
| `src/repositories/favoritesRepository.ts` | Now queries `saved_restaurants` from DB via Supabase. Added async `getFavoriteRestaurantsAsync()` and `getFavoriteRestaurantsByUser()`. Sync `getFavoriteRestaurants()` delegates to repository cache. |
| `src/repositories/searchRepository.ts` | Uses `restaurantsRepository.getAll()` (cache) for in-memory search. Removed dependency on mock arrays. |
| `src/repositories/types.ts` | Added `getByIdAsync()` to `IRestaurantsRepository` interface. |
| `src/data/mockData.ts` | Removed all 21 `Restaurant` mock objects, `restaurants[]` array, `restaurantById`, `featuredMenuItems`, `nearbyRestaurants`, `favoriteRestaurants`, `image()` helper, `visuals` object. Kept all type definitions and non-restaurant data (events, profile, locations, etc.). |
| `src/data/nearbyVibesRestaurants.ts` | Updated to not depend on removed `restaurantById`. Exports only ID list. |
| `src/lib/restaurant-catalog.tsx` | Now pre-fetches all restaurant details via `getByIdAsync()` during catalog refresh, so synchronous `getById()` works from cache. |

---

## 3. Database Migration

### New tables

| Table | Purpose | Key Columns |
|---|---|---|
| `restaurant_reviews` | User reviews per restaurant | `place_id`, `author_name`, `comment`, `rating` (1-5), `created_at` |
| `restaurant_promotions` | Promotions/specials per restaurant | `place_id`, `title`, `subtitle`, `sort_order`, `is_active` |
| `restaurant_specials` | Today's special / featured item | `place_id`, `name`, `description`, `original_price`, `price`, `discount_label`, `available_until`, `image_url` |

All tables follow existing conventions:
- UUID PKs via `gen_random_uuid()`
- `created_at`/`updated_at` timestamps
- `deleted_at` soft-delete
- RLS policies matching place-owner pattern
- Audit triggers (`set_created_by`, `set_updated_by`, `set_updated_at`)

### Seeded data

- **21 restaurants** in `places` table (with slugs matching mock IDs: `pishat`, `sushi-bar-tokio`, etc.)
- **21 restaurant_profiles** (cuisine, tagline, hours_text, is_open_now)
- **21 place_contacts** (primary phone numbers)
- **21 place_images** (primary hero images)
- **147 place_hours** (7 days × 21 restaurants)
- **38 restaurant_reviews** across all restaurants
- **22 restaurant_promotions** across all restaurants
- **21 restaurant_specials** (today specials with pricing and images)
- **21 place_category_links** (all linked to "Restaurants" category)

### New view

| View | Purpose |
|---|---|
| `place_catalog_enriched` | Extends `place_catalog` with live promotion count, special count, review count, and computed rating |

---

## 4. Repository Changes

### RestaurantsRepository

**Data sources (all DB-backed):**
- `place_catalog` view → catalog items (list view)
- `places` with joins → full restaurant detail (detail view)
  - `restaurant_profiles` via `!inner` join
  - `place_images`, `place_hours`, `place_contacts`
  - `restaurant_reviews`, `restaurant_promotions`, `restaurant_specials`
- `menu_categories` / `menu_items` → menu sections

**Caching strategy:**
- `detailCache: Map<string, Restaurant>` stores full detail after first fetch
- `getCatalogItems()` refreshes from DB and pre-fetches all details
- `getById(restaurantId)` returns from cache (synchronous — for UI compatibility)
- `getByIdAsync(restaurantId)` fetches from DB if not cached, then caches

**Removed:**
- `RESTAURANTS_JSON` import from `restaurantsData.ts`
- `generatedRestaurants`, `generatedRestaurantsById` map
- `slugify()`, `normalizeGeneratedRestaurant()`, `mergeCatalogs()`, `mergeRestaurantLists()`
- `buildFallbackRestaurant()`, `buildCatalogRestaurant()`
- All imports from `mockData.ts` (restaurants, featuredMenuItems, getRestaurantById)
- The complex fallback chain (local → generated → fallback)

### FavoritesRepository

- `getFavoriteRestaurants()` → sync, returns all cached restaurants
- `getFavoriteRestaurantsAsync()` → async, queries `saved_restaurants` + resolves via `getByIdAsync()`
- `getFavoriteRestaurantsByUser(userId)` → async, scoped to user

### SearchRepository

- `searchRestaurants()` → uses `restaurantsRepository.getAll()` (cached detail set)
- In-memory text matching on restaurant fields
- Location filtering via `placesRepository.getLocationById()`

---

## 5. Data Flow

```text
App Start
  → RestaurantCatalogProvider.refresh()
    → restaurantsRepository.refreshCatalog()
      → Supabase: place_catalog view (list)
      → Pre-fetch: getByIdAsync() for all items (detail)
    → State: restaurants[] (catalog items)

Screen: RestaurantDetailsScreen
  → useRestaurantCatalog().getRestaurantById(id)
    → restaurantsRepository.getById(id)
      → detailCache.get(id) [sync, pre-warmed]

Screen: FavoritesScreen
  → favoritesRepository.getFavoriteRestaurantsAsync()
    → Supabase: saved_restaurants
    → restaurantsRepository.getByIdAsync(id)
      → detailCache OR Supabase: places with all joins

Screen: Search/Map
  → searchRepository.search(filters)
    → restaurantsRepository.getAll()
    → in-memory filter by city + query
```

---

## 6. Compatibility Strategy

The screen-facing API remained identical:

| Screen API | Implementation |
|---|---|
| `useRestaurantCatalog().getRestaurantById(id)` → `Restaurant \| undefined` | Sync from cache (pre-warmed at startup) |
| `restaurantsRepository.getById(id)` → `Restaurant \| undefined` | Sync from cache |
| `restaurantsRepository.getAll()` → `Restaurant[]` | Sync from cache (all cached details) |
| `restaurantsRepository.getCatalogItems()` → `Promise<RestaurantCatalogItem[]>` | Async from DB |
| `restaurantsRepository.getByIdAsync(id)` → `Promise<Restaurant \| undefined>` | Async from DB |

No screen was modified. The pre-fetching in `RestaurantCatalogProvider` ensures the detail cache is populated before any screen renders restaurant data.

---

## 7. Verification Results

### TypeScript

```bash
npx tsc --noEmit
PASS — zero errors
```

### Mock data dependencies removed

- `restaurantsRepository.ts` — no imports from `mockData.ts` or `restaurantsData.ts`
- `favoritesRepository.ts` — no imports from `mockData.ts`
- `searchRepository.ts` — no direct mock data imports (uses repository)
- `nearbyVibesRestaurants.ts` — no dependency on removed `restaurantById`

### Remaining mockData.ts consumers (non-restaurant, legitimate)
- `eventsRepository.ts` — activeOffers, eventHighlights, kosovoHighlights, tavolinaInvites
- `profileRepository.ts` — profile stats, achievements, quick links, etc.
- `placesRepository.ts` — discoveryLocations, map utility functions
- `types.ts` — type re-exports only

---

## 8. What Was Removed

From `src/data/mockData.ts`:
- `image()` helper
- `visuals` object (26 Unsplash image URLs)
- `pishatRestaurant`, `sushiRestaurant`, `pizzaRestaurant`, `cafeRestaurant`, `grillHouse`, `barMetropol` objects
- `additionalRestaurants` array (15 restaurants)
- `restaurants[]` export
- `restaurantById` lookup map
- `featuredMenuItems[]` export
- `nearbyRestaurants` export
- `favoriteRestaurants` export
- `getRestaurantById()` function
- Restaurant-specific utility functions delegating to the removed data

From `src/data/nearbyVibesRestaurants.ts`:
- Import of `restaurantById` from `mockData.ts`

The `src/data/restaurantsData.ts` file still exists but is no longer imported by any repository.

---

## 9. What Stays Unchanged

- All restaurant screens: `RestaurantDetailsScreen`, `BookTableScreen`, `FavoritesScreen`, `CategoryScreen`, `MapScreen`, `TavolinaScreen`, `ActivityDashboardScreen`, `ProfileScreen`, `SettingsScreen`
- All UI components and styling
- The `Restaurant` model type (identical shape)
- The `RestaurantCatalogProvider` hook API
- All other repositories (places, events, stories, marketplace, profile)
- Non-restaurant mock data (events, profile, discovery locations)
- All screen layouts and visual design

---

## Sprint 4 Complete

Restaurant data is now fully database-backed. The 21 restaurants, their menus, images, opening hours, reviews, promotions, and specials all flow from Supabase through `restaurantsRepository`. The mock data fallback chain has been entirely removed from the repository layer.

The frontend behavior is identical — screens continue to render the same `Restaurant` model shape, and the `RestaurantCatalogProvider` pre-fetches all details at startup so synchronous access works from cache.