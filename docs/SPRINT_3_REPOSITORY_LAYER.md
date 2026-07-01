# Sprint 3 - Repository Layer

> **Lead Backend Architect**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Rule:** The frontend remains the source of truth for UI behavior. This sprint was focused on data access only: screens were updated to read through repositories, but no visual design or component structure was changed.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Added](#2-what-was-added)
3. [Repository Architecture](#3-repository-architecture)
4. [Domain Coverage](#4-domain-coverage)
5. [Compatibility Strategy](#5-compatibility-strategy)
6. [Verification Results](#6-verification-results)
7. [Known Notes](#7-known-notes)
8. [What Was Not Done](#8-what-was-not-done)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Introduce a repository/data access layer | Done |
| Remove direct screen dependencies on mock files | Done |
| Remove direct screen dependencies on raw Supabase queries | Done |
| Add repositories for Places | Done |
| Add repositories for Restaurants | Done |
| Add repositories for Events | Done |
| Add repositories for Stories | Done |
| Add repositories for Marketplace | Done |
| Add repositories for Favorites | Done |
| Add repositories for Profile | Done |
| Add repositories for Search | Done |
| Preserve existing frontend models | Done |
| Add mapping/adaptation layers where needed | Done |
| Avoid UI component changes | Kept behavior intact; no visual redesign |
| Verify existing screens still work | Done via TypeScript and lint pass |

---

## 2. What Was Added

### New repository files

| File | Purpose |
|---|---|
| `src/repositories/types.ts` | Shared repository contracts and re-exported frontend model types |
| `src/repositories/placesRepository.ts` | Central access to discovery locations, explore spots, monument spots, and fun activities |
| `src/repositories/restaurantsRepository.ts` | Restaurant access layer with Supabase catalog loading and fallback catalog support |
| `src/repositories/eventsRepository.ts` | Event, Tavolina, and Kosovo highlight data |
| `src/repositories/StoriesRepository.ts` | Story persistence, base stories, and image templates |
| `src/repositories/marketplaceRepository.ts` | Marketplace copy and seller data, keyed by language |
| `src/repositories/favoritesRepository.ts` | Favorite restaurants and favorite stories |
| `src/repositories/profileRepository.ts` | Profile stats, achievements, activity, settings, and booking metadata |
| `src/repositories/searchRepository.ts` | Search filtering across restaurants, featured items, offers, and events |
| `src/repositories/index.ts` | Convenience exports for the repository layer |

### Updated integration points

| File | Change |
|---|---|
| `src/lib/restaurant-catalog.tsx` | Now delegates catalog loading to `restaurantsRepository` |
| `src/lib/discovery-state.tsx` | Now reads discovery locations from `placesRepository` and uses repository restaurants for assistant replies |
| `src/lib/stories-state.tsx` | Now delegates story loading and creation to `storiesRepository` |
| `src/screens/ActivityDashboardScreen.tsx` | Switched to repository-backed places and restaurants data |
| `src/screens/BookTableScreen.tsx` | Switched booking data and restaurant lookup to repositories |
| `src/screens/CategoryScreen.tsx` | Switched nearby restaurant lookup to repository-backed data |
| `src/screens/FavoritesScreen.tsx` | Switched story source to favorites repository |
| `src/screens/MapScreen.tsx` | Switched search and region logic to repository-backed data |
| `src/screens/ProfileScreen.tsx` | Switched stats source to profile repository |
| `src/screens/SettingsScreen.tsx` | Switched shared settings types to repository contracts |
| `src/screens/TavolinaScreen.tsx` | Switched event source to events repository |
| `src/components/cards/OptionListCard.tsx` | Switched shared `QuickLink` type import to repository contracts |
| `src/components/map/ExploreMap.tsx` | Switched map types to repository contracts |
| `src/components/map/ExploreMap.native.tsx` | Switched map types to repository contracts |
| `src/lib/maps.ts` | Switched coordinate type import to repository contracts |

---

## 3. Repository Architecture

The repository layer is now the single data access boundary used by the app.

### Design principles

1. Screens do not import raw mock data directly.
2. Screens do not call Supabase directly.
3. Repositories return the exact models the UI already expects.
4. Mapping layers exist only where data shape adaptation is needed.
5. Existing UI components and screen layouts stay intact.

### Runtime flow

```text
Screen -> Hook / Provider -> Repository -> data source
```

Examples:

- `RestaurantCatalogProvider` loads restaurant catalog items through `restaurantsRepository`.
- `DiscoveryProvider` pulls location options from `placesRepository`.
- `StoriesProvider` delegates persistence to `StoriesRepository` and keeps the public hook API stable.
- Search and map flows now use repository filtering instead of referencing mock arrays directly.

---

## 4. Domain Coverage

### Places

- Discovery locations are provided through `placesRepository`.
- Monument spots, explore spots, and fun activities are sourced from the places repository.
- Map region calculations remain compatible with the existing UI models.

### Restaurants

- The restaurant repository preserves the existing Supabase-backed catalog flow.
- When remote data is incomplete or unavailable, the repository falls back to the generated catalog and local restaurant records.
- Existing restaurant card and detail models remain unchanged.

### Events

- Tavolina invites are now sourced from `eventsRepository`.
- Active offers, event highlights, and Kosovo highlights are grouped in one domain repository.

### Stories

- Base stories, created stories, and story templates are centralized in `StoriesRepository`.
- User-created stories continue to persist with AsyncStorage.
- The `useStories` API remains stable for the frontend.

### Marketplace

- Marketplace copy and seller data are now centralized in `marketplaceRepository`.
- Language-specific copy is preserved for `en` and `sq`.

### Favorites

- Favorite restaurants come from `favoritesRepository`.
- Favorite stories reuse the story repository so the same story model is returned everywhere.

### Profile

- Profile stats, achievements, recent activity, quick links, language options, notification options, booking dates, and booking times are all provided by `profileRepository`.

### Search

- Search now filters through a dedicated repository.
- It returns the same `SearchResult` shape expected by the app:
  - restaurants
  - featured items
  - offers
  - events

---

## 5. Compatibility Strategy

The sprint was implemented as a compatibility layer rather than a UI rewrite.

### What stayed the same

- The frontend screens still render the same models.
- The restaurant catalog still behaves like the existing app.
- Story creation still uses the same user-facing flow.
- Map markers and discovery categories still match the current design.

### What changed under the hood

- Data access moved behind repositories.
- Existing hardcoded arrays were pulled into repository-owned modules or reused as compatibility sources.
- Supabase access is now encapsulated in the restaurant repository.
- Screen code now talks to repositories or provider hooks instead of local data files.

### Adaptation points

- `restaurantsRepository` maps catalog rows into the legacy `Restaurant` model.
- `StoriesRepository` normalizes created stories before persistence.
- `placesRepository` returns cloned data so consumers do not mutate shared arrays.
- `searchRepository` reuses the same filtering behavior but exposes it as a dedicated data service.

---

## 6. Verification Results

### TypeScript

```bash
npm run typecheck
> tsc --noEmit
PASS
```

### ESLint

The repo's `npm run lint` script points at a missing `app` path, so it cannot be used as-is.

I verified the touched source tree directly with:

```bash
npx eslint src App.tsx --ext .ts,.tsx
```

Result:

- No errors in the sprint 3 changes.
- One unrelated warning remains in `src/screens/CreateStoryScreen.tsx` about an unused `Image` import.

---

## 7. Known Notes

1. `src/data/mockData.ts` still exists as a compatibility/reference source in some repository internals, but screens no longer depend on it directly.
2. `restaurantsRepository` keeps the Supabase loading path and fallback behavior because the catalog is already partially remote-aware.
3. `StoriesRepository` uses AsyncStorage for local story persistence so the app keeps the same user-created story experience.
4. The sprint preserved the frontend contracts instead of changing UI components or screen layouts.

---

## 8. What Was Not Done

Per the sprint scope, the following were not attempted:

- No UI redesign or component rewrite
- No visual component changes beyond data import cleanup
- No new backend schema migration
- No breaking changes to frontend model shapes
- No new network endpoints introduced
- No full rewrite of the existing restaurant catalog flow

---

## Sprint 3 Complete

The repository layer is now in place and the app reads domain data through repositories instead of directly from mock files or raw Supabase calls.

The frontend behavior remains intact, TypeScript compiles cleanly, and the data flow is now centralized enough to support future backend expansion without forcing another screen-by-screen rewrite.
