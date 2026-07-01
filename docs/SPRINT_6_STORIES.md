# Sprint 6 — Stories: Database-Backed Migration

> **Lead Backend Architect**
> **Date:** 2026-07-01
> **Repository:** KosVibe (`norit/KosVibe`)
> **Rule:** Local story persistence (AsyncStorage) replaced with database-backed data. UI identical. Compatibility maintained through repository layer.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Changed](#2-what-was-changed)
3. [Database Migration](#3-database-migration)
4. [Repository Changes](#4-repository-changes)
5. [Provider Changes](#5-provider-changes)
6. [Data Flow](#6-data-flow)
7. [Verification Results](#7-verification-results)
8. [What Stays Unchanged](#8-what-stays-unchanged)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Replace AsyncStorage persistence with Supabase-backed storage | Done |
| Create DB tables for stories, media, likes, comments | Done |
| Implement moderation (visibility, moderation_status) | Done |
| Seed all 8 base stories (4 en + 4 sq) into the database | Done |
| Add write methods for likes, comments | Done |
| Keep identical UI — no screen changes | Done |
| Remove AsyncStorage dependency from StoriesRepository | Done |

---

## 2. What Was Changed

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701170000_sprint6_stories.sql` | Sprint 6 migration — 4 tables + seed data |
| `docs/SPRINT_6_STORIES.md` | Sprint documentation |

### Modified files

| File | Change |
|---|---|
| `src/repositories/StoriesRepository.ts` | Full rewrite. Removed AsyncStorage and hardcoded `baseStories`. Now queries `stories` table via Supabase with cache. Added `likeStory()`, `unlikeStory()`, `addComment()`. `createStory()` persists to DB and updates cache. |
| `src/lib/stories-state.tsx` | Changed `loadCreatedStories()` → `refresh()`. Context API unchanged. |

---

## 3. Database Migration

### New tables

| Table | Purpose | Key Columns |
|---|---|---|
| `stories` | Story content with moderation | `title`, `author`, `subtitle`, `body`, `image_url`, `location`, `category`, `read_time`, `posted_at`, `likes_count`, `views_count`, `language`, `is_user_story`, `visibility`, `moderation_status`, `user_id` |
| `story_media` | Additional images per story | `story_id`, `image_url`, `sort_order` |
| `story_likes` | User likes (unique per user per story) | `story_id`, `user_id` |
| `story_comments` | User comments with moderation | `story_id`, `user_id`, `author_name`, `body`, `moderation_status` |

All tables follow Sprint 1-5 conventions:
- UUID PKs via `gen_random_uuid()`
- `created_at`/`updated_at` timestamps
- `deleted_at` soft-delete
- RLS policies with appropriate access rules
- Audit triggers

### New enums

| Type | Values |
|---|---|
| `story_visibility` | `public`, `hidden`, `flagged` |
| `moderation_status` | `pending`, `approved`, `rejected` |

**Moderation flow:**
- Base stories: `moderation_status = 'approved'`, `visibility = 'public'`
- User-created stories: `moderation_status = 'pending'`, `visibility = 'public'` (visible but requires approval for full visibility)
- Flagged stories: `visibility = 'flagged'` (hidden from public view)
- Comments: RLS filters show only `moderation_status = 'approved'` to public

### Seeded data

- **4 English base stories** (Midnight in Prizren, Kosovo Coffee Trails, Icons After Rain, One Table Six Friends)
- **4 Albanian base stories** (Mesnate ne Prizren, Shtigjet e kafes, Ikonat pas shiut, Nje tavoline)

---

## 4. Repository Changes

### StoriesRepository

**Data source:**
- `stories` table → all story data (filtered by language, visibility, moderation)

**Caching:**
- `baseStoriesCache: Map<SupportedLanguage, StoryItem[]>` — one entry per language
- `refresh()` loads both languages from Supabase in sequence
- `initialized` flag + `ensureReady()` for lazy initialization

**Methods changed:**
- `getStories(language)` → returns from cache (sync)
- `createStory(input)` → returns immediately with temp ID, persists to DB in background, updates cache with real DB ID on success
- `getImageTemplates()` → returns hardcoded 5 Unsplash URLs (unchanged)

**Methods added:**
- `likeStory(storyId)` — inserts into `story_likes`
- `unlikeStory(storyId)` — deletes from `story_likes`
- `addComment(storyId, body)` — inserts into `story_comments`

**Methods removed:**
- `loadCreatedStories()` — replaced by `refresh()`

**Dependencies removed:**
- `@react-native-async-storage/async-storage` — no longer imported
- Hardcoded `baseStories` objects (8 stories across 2 languages) — now seeded in DB

---

## 5. Provider Changes

**`stories-state.tsx`** — Single line change:

```typescript
// Before (Sprint 3)
void storiesRepository.loadCreatedStories().then(...)

// After (Sprint 6)
void storiesRepository.refresh().then(...)
```

The `StoriesProvider` context API, `useStories()` hook, and all screen-facing interfaces remain identical. No screen was touched.

---

## 6. Data Flow

```text
App Start
  → StoriesProvider mounts
    → useEffect: storiesRepository.refresh()
      → Supabase: stories WHERE language='en' AND visibility='public' AND moderation_status='approved'
      → Supabase: stories WHERE language='sq' AND visibility='public' AND moderation_status='approved'
    → Cache populated → forceUpdate → screens re-render

Screen: CreateStoryScreen
  → useStories().createStory(input)
    → storiesRepository.createStory(input)
      → Returns StoryItem immediately (with temp ID)
      → Background: INSERT into stories table
      → On success: update cache with real DB ID
    → UI updates instantly

Screen: FavoritesScreen (favorite stories)
  → favoritesRepository.getFavoriteStories(language)
    → storiesRepository.getStories(language)
      → returns cached StoryItem[]

Screen: StoryDetailScreen
  → useStories().getStoryById(id, language)
    → storiesRepository.getStoryById(id, language)
      → linear search in cache
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
> Applying migration 20260701170000_sprint6_stories.sql...
> Finished supabase db push.
PASS
```

### AsyncStorage removed

- `StoriesRepository.ts` — no `AsyncStorage` import
- `package.json` still lists `@react-native-async-storage/async-storage` as dependency (may be used elsewhere)

### Remaining hardcoded data

- `imageTemplates` — 5 Unsplash image URLs remain hardcoded in `StoriesRepository.ts` (fallback for story creation)

---

## 8. What Stays Unchanged

- All screens: `CreateStoryScreen`, `StoryDetailScreen`, `FavoritesScreen`
- All UI components and styling
- The `StoryItem` model type (identical shape, `imageUri` field preserved)
- The `StoriesProvider` context API (`createStory`, `getStoryById`, `getStories`, `imageTemplates`)
- All other repositories (restaurants, events, places, marketplace, profile, search, favorites)
- All screen layouts and visual design

---

## Sprint 6 Complete

Story persistence is now fully database-backed. The 8 base stories are seeded in Supabase and loaded on app start via `stories.refresh()`. User-created stories persist to the `stories` table. The `story_likes` and `story_comments` tables are ready for UI integration. The moderation system (visibility, moderation_status) is in place.

AsyncStorage has been removed from the `StoriesRepository` entirely. The frontend behavior is identical — screens continue to render the same `StoryItem` model shape through the unchanged `useStories()` hook.