<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76+-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL%2017-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# 🇽🇰 KosVibe — Discover Kosovo

**KosVibe** is a mobile travel companion that helps locals and tourists discover the best of Kosovo — from traditional restaurants and community events to rural markets, cultural monuments, and mountain adventures. Built with React Native (Expo) and powered by a production Supabase PostgreSQL backend with full-text search, geo proximity, and bilingual content in English and Albanian.

<p align="center">
  <img src="https://img.shields.io/badge/42%20Database%20Tables-Evergreen-3ECF8E" alt="42 tables" />
  <img src="https://img.shields.io/badge/9%20Migrations-Applied-3ECF8E" alt="9 migrations" />
  <img src="https://img.shields.io/badge/7%20Repositories-DB%20Backed-3ECF8E" alt="7 repositories" />
  <img src="https://img.shields.io/badge/0%20Mock%20Data-Remaining-FF3E00" alt="Zero mocks" />
</p>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Repository Layer](#-repository-layer)
- [Search Engine](#-search-engine)
- [Platform Services](#-platform-services)
- [Migration History](#-migration-history)
- [About the Author](#-about-the-author)

---

## ✨ Features

### 🍽️ Restaurant Discovery
Browse 21 restaurants across Kosovo's cities with rich detail screens showing menus, images, opening hours, today's specials, promotions, and user reviews. Book tables, save favorites, and filter by city or cuisine.

### 🎉 Community Events (Tavolina)
Join local food tours, cultural walks, nightlife meetups, and outdoor adventures. Create your own events, track attendance, confirm presence, and rate organizers. Each organizer has a reputation profile with badges and guest praise.

### 📚 Stories & Guides
Curated stories in English and Albanian covering Kosovo's coffee culture, night walks, monuments, and food routes. Users can create their own stories with image uploads, likes, and comments — all with a moderation queue.

### 🏪 Rural Marketplace
Explore village market guides featuring family sellers of traditional wine, rakia, dairy, copper craft, woodwork, woven textiles, and ceremonial clothing. All content is bilingual (en/sq).

### 🗺️ Monuments & Nature
Discover 12 monument and nature spots (Prizren Fortress, Rugova Canyon, Mirusha Waterfalls, etc.) and 18 explore spots (coffee, nightlife, culture, nature, study, icons) across Prishtina, Prizren, and Peja.

### 🎯 Fun Activities
15 curated activities — from Germia Park bike rides and Padel Court matches to Batllava Lake fishing and Brezovica ski trips — with a scrolling billboard on the home screen.

### 🔍 Production Search
PostgreSQL Full Text Search with weighted `ts_rank`, trigram similarity for fuzzy matching, category and city filters, geo proximity radius search, pagination, and sorting by relevance, rating, or distance.

### 🤖 AI-Ready Retrieval Layer
RAG (Retrieval-Augmented Generation) context builders that assemble structured text from restaurants, reviews, menus, search results, and user favorites — ready to feed into any LLM.

### 🌐 Bilingual (English / Shqip)
Every screen supports both languages via `useI18n()`. Marketplace, monument spots, and fun activities have bilingual database columns.

### 📊 Platform Services
Unified notification system with per-type per-channel preferences, analytics event tracking, recommendation event logging for personalized feeds, user report/moderation system, and a detailed audit log trail.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native 0.76, Expo SDK 52 |
| **Language** | TypeScript 5.3+ |
| **Backend** | Supabase (PostgreSQL 17) |
| **Search** | PostgreSQL FTS + pg_trgm + earthdistance |
| **Auth** | Supabase Auth (email-based) |
| **Navigation** | React Navigation 7 (tabs + stack) |
| **Icons** | Ionicons (Expo vector icons) |
| **State** | React Context + hooks |
| **Persistence** | Supabase (all data), AsyncStorage removed |
| **Migrations** | Supabase CLI (`supabase db push`) |

---

## 🏗️ Architecture

```
App (React Native / Expo)
  │
  ├─ Screens (16 screens — no mock data, no DB queries)
  │    ├─ ActivityDashboardScreen (home)
  │    ├─ RestaurantDetailsScreen
  │    ├─ CategoryScreen / MapScreen
  │    ├─ TavolinaScreen (events)
  │    ├─ CreateStoryScreen / StoryDetailScreen
  │    ├─ MarketScreen
  │    ├─ FavoritesScreen / ProfileScreen / BookTableScreen
  │    └─ SettingsScreen / HelpScreen / HistoryScreen / ExchangeScreen
  │
  ├─ Providers (React Context)
  │    ├─ DiscoveryProvider → placesRepository
  │    ├─ RestaurantCatalogProvider → restaurantsRepository
  │    ├─ StoriesProvider → storiesRepository
  │    └─ I18nProvider (en/sq)
  │
  ├─ Repositories (7 typed interfaces)
  │    ├─ placesRepository.ts       → cities, place_highlights, fun_activities
  │    ├─ restaurantsRepository.ts  → places, restaurant_{profiles,reviews,promos,specials}
  │    ├─ eventsRepository.ts       → event_highlights, tavolina_events, kosovo_highlights
  │    ├─ storiesRepository.ts      → stories, story_likes, story_comments
  │    ├─ marketplaceRepository.ts  → marketplace_{categories,spots,sellers,collections}
  │    ├─ favoritesRepository.ts    → saved_restaurants
  │    ├─ searchRepository.ts       → search_documents (RPC)
  │    └─ profileRepository.ts      → profile_stats, achievements (static)
  │
  ├─ Services
  │    ├─ ai-retrieval.ts           → RAG context builders
  │    ├─ recommendation-feeds.ts   → personalized/trending/nearby feeds
  │    └─ platform-services.ts      → notifications, analytics, reports, audit
  │
  └─ Supabase Postgres (42 tables, 9 migrations, 2 RPC functions)
```

### Core Principle

**Screens never call Supabase directly and never import mock data.** All data access goes through typed repository interfaces (`IRestaurantsRepository`, `IEventsRepository`, etc.). Repositories return the exact model types screens expect. This allows replacing data sources without touching any screen code.

---

## 🗄️ Database Schema

### Core Tables (20+)
| Table | Description |
|---|---|
| `cities` | 39 Kosovo municipalities with coordinates |
| `places` | Central place entity (restaurants, cafes, venues) |
| `restaurant_profiles` | Cuisine, tagline, hours, open status |
| `place_images` | Ordered image galleries per place |
| `place_hours` | Weekly opening hours (7 days × 21 restaurants) |
| `place_contacts` | Phone, email, website, social |
| `place_categories` + `place_category_links` | Many-to-many categories |
| `restaurant_reviews` | User reviews with 1-5 ratings |
| `restaurant_promotions` | Active offers per restaurant |
| `restaurant_specials` | Today's specials with pricing |
| `menu_categories` + `menu_items` | Restaurant menus |

### Event & Story Tables (11)
| Table | Description |
|---|---|
| `tavolina_events` | Community events with attendance |
| `event_highlights` | Curated event cards |
| `kosovo_highlights` | Kosovo content cards |
| `event_attendance` | Join/confirm/cancel tracking |
| `event_reviews` | Event ratings (1-5) |
| `event_organizers` | Organizer profiles with badges |
| `stories` | Story content with moderation |
| `story_likes` | User likes (unique per story) |
| `story_comments` | Comments with moderation |

### Marketplace, Search & Platform (11)
| Table | Description |
|---|---|
| `marketplace_categories/spots/sellers/collections/products` | Bilingual marketplace |
| `place_highlights` | Monument + explore spots |
| `fun_activities` | Activity dashboard content |
| `search_documents` | Materialized view for FTS |
| `notifications` | Unified notification system |
| `notification_preferences` | Per-type per-channel prefs |
| `analytics_events` | User behavior tracking |
| `recommendation_events` | Personalization signals |
| `reports` | User-submitted moderation reports |
| `audit_logs` | Data mutation audit trail |

### Access Control (Sprint 1)
| Table | Description |
|---|---|
| `roles` | RBAC role definitions |
| `user_roles` | User-to-role assignments |
| `business_accounts` | Business entity profiles |
| `business_members` | Business team memberships |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)
- A Supabase project ([create one free](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/nor1t/KosVibe.git
cd KosVibe

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Apply all database migrations
supabase db push

# Start the Expo development server
npx expo start
```

### Environment Variables (`.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📂 Project Structure

```
KosVibe/
├── app/                    # Expo Router pages
│   ├── (auth)/             # Sign in / sign up
│   ├── (onboarding)/       # Onboarding flow
│   └── (tabs)/             # Tab navigation
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── cards/          # OptionListCard, RestaurantShowcaseCard
│   │   ├── common/         # StickyAppHeader, WeatherSettingsButton
│   │   └── map/            # ExploreMap (native + web)
│   ├── data/               # (Removed — all data now in Supabase)
│   ├── i18n/               # Internationalization (en + sq)
│   ├── lib/                # Providers, services, utilities
│   │   ├── discovery-state.tsx      # City/region provider
│   │   ├── restaurant-catalog.tsx   # Restaurant list provider
│   │   ├── stories-state.tsx        # Stories provider
│   │   ├── ai-retrieval.ts          # RAG context builders
│   │   ├── recommendation-feeds.ts  # Feed query helpers
│   │   └── platform-services.ts     # Notifications, analytics, reports
│   ├── navigation/         # Navigation configuration
│   ├── repositories/       # Data access layer (7 typed interfaces)
│   │   ├── types.ts                    # All model types + interfaces
│   │   ├── placesRepository.ts         # Cities, monuments, activities
│   │   ├── restaurantsRepository.ts    # Restaurant CRUD + catalog
│   │   ├── eventsRepository.ts         # Events + write methods
│   │   ├── storiesRepository.ts        # Stories (removed AsyncStorage)
│   │   ├── marketplaceRepository.ts    # Bilingual marketplace
│   │   ├── favoritesRepository.ts      # Saved restaurants
│   │   ├── searchRepository.ts         # FTS + trigram + geo
│   │   └── profileRepository.ts        # Profile data
│   ├── screens/            # 16 screen components
│   ├── theme/              # Dark theme design tokens
│   └── types/              # Generated Supabase types
├── supabase/
│   ├── config.toml         # Supabase project configuration
│   └── migrations/         # 9 migration files (202607*)
└── docs/                   # Sprint documentation (0-10)
```

---

## 🔌 Repository Layer

All data access flows through typed repository interfaces:

```typescript
// src/repositories/types.ts
export interface IRestaurantsRepository {
  getAll(): Restaurant[];
  getById(restaurantId: string): Restaurant | undefined;
  getByIdAsync(restaurantId: string): Promise<Restaurant | undefined>;
  getNearbyVibes(): Restaurant[];
  getCatalogItems(): Promise<RestaurantCatalogItem[]>;
}

export interface IEventsRepository {
  getEventHighlights(): EventFeature[];
  getTavolinaInvites(): TavolinaInvite[];
  getKosovoHighlights(): KosovoHighlight[];
}

export interface ISearchRepository {
  search(filters: SearchFilters): SearchResult;
  searchRestaurants(locationId: string, query: string): Restaurant[];
}

// ... and IStoriesRepository, IMarketplaceRepository, IFavoritesRepository,
//     IProfileRepository, IPlacesRepository
```

**Key design decisions:**
- **Sync/async bridge caching** — `RestaurantCatalogProvider` pre-fetches all detail via `getByIdAsync()` at startup, so screens use synchronous `getById()` from cache
- **Fallback safety** — `placesRepository.getDiscoveryLocations()` returns a default "All Kosovo" location before DB loads
- **In-memory cache** — Each repository maintains a cache populated by `refresh()`, avoiding repeated DB calls
- **Zero code changes on screens** — All 16 screens consume the same model types they always did

---

## 🔍 Search Engine

The search engine was migrated from in-memory JavaScript filtering to PostgreSQL Full Text Search:

```
search_documents (materialized view)
  ├─ 21 restaurants (places + restaurant_profiles + place_catalog)
  ├─ 5 event highlights (event_highlights)
  └─ search_vector (weighted tsvector)
       ├─ A-weight: name
       ├─ B-weight: cuisine, category, tagline
       └─ C-weight: description, city, address, venue

search_all(search_term, city, category, lat, lng, radius, page, sort_by)
  └─ Returns: restaurants + events + total_count + relevance score

Indexes:
  ├─ GIN on search_vector (FTS)
  ├─ GIN trigram on name (fuzzy matching)
  ├─ GiST on point(lon, lat) (geo proximity)
  └─ B-tree on city, category, rating (filters/sorting)
```

**Ranking formula:** `ts_rank * 0.7 + similarity(name, query) * 0.3`

---

## 🛡️ Platform Services

### Security
- **Row-Level Security** on all 42 tables
- **Anon access** for public data (places, events, stories, marketplace)
- **User-scoped data** — notifications, preferences, favorites, reports scoped to `auth.uid()`
- **Admin functions** — `is_admin()`, `is_place_owner()`, `is_business_owner()`
- **Soft deletes** — `deleted_at` column on every table
- **Audit trail** — `created_by`, `updated_by` triggers + dedicated `audit_logs` table

### Notifications System
- Unified `notifications` table (supersedes old `event_notifications`)
- Per-type per-channel preferences (push/in-app/email × 5 event types)
- Mark-read tracking and unread count badge support

### Moderation
- `moderation_status` enum on stories and comments (pending/approved/rejected)
- `report_status` enum on user-submitted reports
- Admin-only report resolution workflow

---

## 📜 Migration History

| Sprint | Migration | Tables Added | Domain |
|---|---|---|---|
| 1 | `20260701130000` | 4 | RBAC + business accounts |
| 2 | `20260701140000` | 10 | Place-centered architecture |
| 3 | — | 0 | Repository layer |
| 4 | `20260701150000` | 3 | Restaurant reviews, promos, specials |
| 5 | `20260701160000` | 7 | Events, attendance, organizers |
| 6 | `20260701170000` | 4 | Stories, likes, comments, media |
| 7 | `20260701180000` | 5 | Marketplace categories, sellers |
| 8 | `20260701190000` | 1* | FTS mat view + 2 RPC functions |
| 9 | `20260701200000` | 6 | Notifications, analytics, reports, audit |
| 11 | `20260701210000` | 2 | Place highlights, fun activities |

*\*Sprint 8 also enabled 3 PostgreSQL extensions: `pg_trgm`, `cube`, `earthdistance`*

---

## 👤 About the Author

This project was built as part of a hackathon to modernize the KosVibe travel app — migrating from hardcoded mock data to a production PostgreSQL backend while preserving identical frontend behavior across every screen.

**Key achievements:**
- 16 screens kept visually identical while completely replacing their data layer
- 7 repository interfaces with synchronous cache bridge for zero-UI-change DB migration
- PostgreSQL Full Text Search with weighted ranking, trigram similarity, and geo proximity
- Bilingual database schema serving English and Albanian from single-row records
- 42 tables, 9 migrations, 0 remaining mock data files

---

<p align="center">
  <sub>Built with ❤️ for Kosovo • <a href="https://github.com/nor1t/KosVibe">github.com/nor1t/KosVibe</a></sub>
</p>