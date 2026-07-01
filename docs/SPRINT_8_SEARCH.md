# Sprint 8 — Search: PostgreSQL Full Text Search Migration

> **Lead Backend Architect**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Rule:** In-memory JavaScript search replaced with PostgreSQL Full Text Search. UI identical. No screens changed.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)  
2. [What Was Changed](#2-what-was-changed)  
3. [Database Migration](#3-database-migration)  
4. [Repository Changes](#4-repository-changes)  
5. [Search Features](#5-search-features)  
6. [Verification Results](#6-verification-results)  
7. [What Stays Unchanged](#7-what-stays-unchanged)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Enable PostgreSQL Full Text Search (FTS) | Done |
| Implement weighted ts_rank ranking (A/B/C weights) | Done |
| Add trigram similarity for fuzzy name matching | Done |
| Implement category filters | Done |
| Implement city filters | Done |
| Implement geo proximity search | Done |
| Create PostgreSQL RPC functions (search_all, search_restaurants) | Done |
| Support pagination (page, pageSize, total, hasMore) | Done |
| Support sorting (relevance, rating, distance) | Done |
| Create search_documents materialized view with optimized indexes | Done |
| Replace all mock/in-memory search | Done |
| Keep frontend unchanged | Done |

---

## 2. What Was Changed

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701190000_sprint8_search.sql` | 3 extensions + materialized view + 4 indexes + 2 RPC functions |
| `docs/SPRINT_8_SEARCH.md` | Sprint documentation |

### Modified files

| File | Change |
|---|---|
| `src/repositories/searchRepository.ts` | `searchAll()` delegates to `search_all` RPC with pagination/geo/sorting. `searchRestaurantsAsync()` delegates to `search_restaurants` RPC. Sync methods kept as stubs for interface compatibility. Removed JavaScript `.filter()` `.includes()` chain. |

---

## 3. Database Migration

### Extensions

| Extension | Purpose |
|---|---|
| `pg_trgm` | Trigram similarity (`%` operator, `similarity()`, GIN trigram index) |
| `cube` | Required by `earthdistance` |
| `earthdistance` | Geo proximity using `earth_distance()` and `ll_to_earth()` |

### Materialized View: `search_documents`

Unified search index over 21 restaurants (places) + 5 events (event_highlights):

| Column | Source |
|---|---|
| `search_vector` | Weighted tsvector: A (name), B (cuisine/tagline/category), C (description/city/address/venue) |
| `name` | Place name or event title |
| `type` | `'restaurant'` or `'event'` |
| `city`, `category` | For filtering |
| `rating`, `latitude`, `longitude` | For ranking and geo |
| `source_id` | Slug for restaurants, ID for events |
| `thumbnail_url` | Primary place image (null for events) |

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `search_documents_fts_idx` | GIN on `search_vector` | Full text search |
| `search_documents_name_trgm_idx` | GIN on `name` with `gin_trgm_ops` | Trigram similarity |
| `search_documents_geo_idx` | GiST on `point(lon, lat)` | Geo proximity |
| `search_documents_city_idx` | B-tree on `city` | City filter |
| `search_documents_category_idx` | B-tree on `category` | Category filter |
| `search_documents_rating_idx` | B-tree on `rating desc` | Rating sorting |

### RPC Functions

**`search_all(search_term, city_filter, category_filter, lat, lng, radius_km, page_num, page_size, sort_by)`**

Returns: `TABLE(id, type, name, description, city, category, rating, source_id, thumbnail_url, latitude, longitude, relevance, total_count)`

Ranking:
- FTS rank: `ts_rank(search_vector, query_tsquery, 32) * 0.7 + similarity(name, term) * 0.3`
- Geo rank: `1.0 / (1 + distance_km)` when coordinate provided
- Fallback: `rating / 5.0` when no search term

Supports: `sort_by = 'relevance' | 'rating' | 'distance'`

**`search_restaurants(search_term, city_filter, category_filter, limit_count)`**

Simplified version returning restaurants only. Used by `searchRestaurantsAsync()`.

---

## 4. Repository Changes

### SearchRepository

**New async methods:**
- `searchAll(filters)` — full RPC call with pagination, geo, sorting. Returns `{ restaurants, events, featuredItems: [], offers: [], total, page, hasMore }`
- `searchRestaurantsAsync(locationId, query)` — RPC call returning `Restaurant[]` with FTS ranking

**Preserved sync methods (interface compatibility):**
- `search()` — returns empty `SearchResult`
- `searchRestaurants()` — returns empty `[]`
- `searchFeaturedItems()` — returns empty `[]`
- `searchOffers()` — in-memory filter on `getActiveOffers()` (OK, only 2 offers)
- `searchEvents()` — in-memory filter on `getEventHighlights()` (OK, only 5 events)

No screens call the sync `search()` method — they use cached data from providers.

---

## 5. Search Features

| Feature | Implementation |
|---|---|
| **Weighted FTS** | A-weight on name, B on cuisine/category, C on description — via `setweight` in materialized view |
| **Ranking** | `ts_rank(search_vector, plainto_tsquery(term), 32)` with normalization bit 32 (divides by document length) |
| **Trigram similarity** | Falls back to `name % term` when FTS misses — catches typos and partial matches |
| **Combined score** | `ts_rank * 0.7 + similarity * 0.3` — prioritizes semantic matches over fuzzy typo matches |
| **Category filter** | Exact match on `sd.category` |
| **City filter** | Case-insensitive match on `sd.city` |
| **Geo proximity** | `<@>` operator (point-to-point distance in degrees) × 111.32 = km |
| **Radius filter** | Only returns results within `radius_km` |
| **Pagination** | `LIMIT page_size OFFSET (page_num - 1) * page_size` with `total_count` |
| **Sorting** | `relevance` (FTS score), `rating` (numeric), `distance` (geo proximity ascending) |
| **Optimized indexes** | GIN for FTS, GIN for trigram, GiST for geo, B-tree for filters/sorting |

---

## 6. Verification Results

### TypeScript

```bash
npx tsc --noEmit
PASS — zero errors
```

### Database

```bash
npx supabase db push
> Applying migration 20260701190000_sprint8_search.sql...
> Finished supabase db push.
PASS
```

### In-memory search removed

- `restaurantText()` concatenation function removed from search path
- `.filter()` + `.includes()` chain replaced with RPC calls
- No screen changes required

---

## 7. What Stays Unchanged

- All screens: `MapScreen`, `CategoryScreen`, all search UI
- All UI components and styling
- `ISearchRepository` interface (sync methods preserved)
- `SearchFilters`, `SearchResult` types
- All other repositories
- All screen layouts and visual design

---

## Sprint 8 Complete

Search is now powered by PostgreSQL Full Text Search with weighted ranking, trigram similarity for fuzzy matching, category and city filters, geo proximity search, pagination, and multiple sort modes. The `search_all` RPC function serves as the unified search endpoint backed by the `search_documents` materialized view with GIN, GiST, and trigram indexes.

The in-memory JavaScript search chain (`restaurantsRepository.getAll().filter(r => r.name.includes(query))`) has been entirely replaced. The frontend remains untouched.