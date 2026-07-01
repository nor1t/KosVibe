# Sprint 0 — KosVibe Project Migration Audit

> **Lead Backend Architect Audit**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Commit:** `cef6ddbb`  
> **Rule:** The frontend is COMPLETE and is the source of truth. The backend adapts to the frontend. Mock data is the product specification — it is NOT deleted; it designs the database.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Architecture](#2-repository-architecture)
3. [Navigation & Screen Map](#3-navigation--screen-map)
4. [Provider & State Management Map](#4-provider--state-management-map)
5. [Data Source Inventory](#5-data-source-inventory)
6. [TypeScript Model & Interface Inventory](#6-typescript-model--interface-inventory)
7. [Supabase Integration Audit](#7-supabase-integration-audit)
8. [AsyncStorage Usage Audit](#8-asyncstorage-usage-audit)
9. [API Call Audit](#9-api-call-audit)
10. [UI Contract — Per Feature](#10-ui-contract--per-feature)
11. [Feature Dependency Graph](#11-feature-dependency-graph)
12. [Backend Dependency Graph](#12-backend-dependency-graph)
13. [Recommended Migration Order](#13-recommended-migration-order)
14. [Risk Register](#14-risk-register)

---

## 1. Executive Summary

KosVibe is a React Native (Expo SDK 54) mobile application for discovering Kosovo through restaurants, stories, events, marketplace, maps, and an AI assistant. The app is bilingual (English/Albanian) and uses a dark, cinematic visual design.

### Current State

| Layer | Status |
|---|---|
| **Frontend UI** | ✅ Complete — source of truth |
| **Auth** | ✅ Live Supabase Auth (email/password) |
| **Restaurant Catalog** | ⚠️ Hybrid — Supabase `restaurants` table + mock/generated fallback |
| **Restaurant Details (menu, reviews, promotions, today's special)** | ❌ Mock only — no DB tables |
| **Stories** | ❌ Local only — AsyncStorage + hardcoded base stories |
| **Events / Tavolina** | ❌ Mock only — `tavolinaInvites` array |
| **Marketplace** | ❌ Static inline data in screen |
| **Profile (stats, achievements, activity)** | ❌ Mock / hardcoded |
| **Favorites / Saved** | ⚠️ DB table exists (`saved_restaurants`) but UI uses local `useState` |
| **Search / Discovery** | ❌ Client-side filtering of mock data |
| **AI Assistant** | ❌ Mock rule-based chat (no LLM) |
| **Book Table** | ❌ Static dates/times, no persistence |
| **Settings / Notifications** | ❌ Static config, no persistence |
| **Fun Activities** | ❌ Hardcoded in screen |
| **i18n** | ✅ Complete (EN/SQ), persisted to AsyncStorage |

### Key Architectural Principle

The `RestaurantCatalogProvider` already demonstrates the intended migration pattern:
1. Fetch from Supabase.
2. If Supabase returns ≥200 rows, use them.
3. Otherwise, merge Supabase results with the bundled mock/generated catalog.
4. Map every `RestaurantCatalogItem` back to the full `Restaurant` type via `buildCatalogRestaurant()`.

**This pattern must be replicated for every feature.**

---

## 2. Repository Architecture

```
KosVibe/
├── App.tsx                          # Root — provider hierarchy
├── app.json                         # Expo config
├── package.json                     # Expo SDK 54, RN 0.81, Supabase 2.101
├── tailwind.config.js               # NativeWind config
├── tsconfig.json
├── .env.example                     # SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_MAPS_API_KEY
│
├── assets/
│   └── images/                      # home-drini, home-prishtina, home-rugova (hero slides)
│
├── src/
│   ├── components/                  # UI components
│   │   ├── AppButton.tsx
│   │   ├── AppLogo.tsx
│   │   ├── AppText.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── Screen.tsx               # Shared Screen wrapper, page spacing constants
│   │   ├── booking/                 # (empty — reserved)
│   │   ├── cards/
│   │   │   └── OptionListCard.tsx   # Uses QuickLink type from mockData
│   │   ├── common/
│   │   │   ├── ChatAssistantModal.tsx   # AI assistant modal — uses useDiscovery
│   │   │   ├── RestaurantListCard.tsx
│   │   │   ├── RestaurantShowcaseCard.tsx
│   │   │   ├── SectionTitle.tsx
│   │   │   ├── StickyAppHeader.tsx      # Global header with location selector
│   │   │   ├── ToggleSwitch.tsx
│   │   │   └── WeatherSettingsButton.tsx
│   │   ├── layout/                  # (empty — reserved)
│   │   ├── map/
│   │   │   ├── ExploreMap.native.tsx    # react-native-maps (iOS/Android)
│   │   │   └── ExploreMap.tsx           # Web fallback
│   │   └── restaurant/              # (empty — reserved)
│   │
│   ├── data/                        # Mock data — THE PRODUCT SPECIFICATION
│   │   ├── mockData.ts              # 2291 lines — 20 types, ~12 curated restaurants, all feature data
│   │   ├── restaurantsData.ts       # 320 generated restaurants (same Restaurant type)
│   │   └── nearbyVibesRestaurants.ts # 6 curated restaurant IDs
│   │
│   ├── features/
│   │   └── auth/
│   │       ├── AuthProvider.tsx     # Supabase auth (signIn, signUp, updateProfile, signOut)
│   │       ├── errors.ts            # Auth error → i18n message mapping
│   │       └── validation.ts        # Zod schemas for sign-in/sign-up
│   │
│   ├── i18n/
│   │   ├── I18nProvider.tsx         # Language state, AsyncStorage persistence
│   │   ├── messages.ts              # i18n message catalog (EN/SQ) — auth, restaurants, tabs, onboarding
│   │   └── nativeCopy.ts            # Screen-level copy (dashboard, profile, stories, etc.)
│   │
│   ├── lib/                         # State providers & utilities
│   │   ├── app-state.tsx            # Bootstrapping/onboarding state (unused in current App.tsx)
│   │   ├── discovery-state.tsx      # Location, category, search, AI chat state
│   │   ├── image-uri.ts             # Image URI normalization (file://, content://, https://)
│   │   ├── maps.ts                  # Open directions (Apple Maps / Google Maps)
│   │   ├── restaurant-catalog.tsx   # Supabase + mock fallback restaurant catalog
│   │   ├── scroll-behavior.tsx      # Scroll provider
│   │   ├── stories-state.tsx        # Stories — AsyncStorage + base stories (EN/SQ)
│   │   └── supabase.ts              # Supabase client (AsyncStorage for native, localStorage for web)
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Auth gate — TabsNavigator or AuthNavigator
│   │   ├── AuthNavigator.tsx        # SignIn / SignUp stack
│   │   ├── TabsNavigator.tsx        # 5 tabs, each with native stack
│   │   └── types.ts                 # All navigation param lists
│   │
│   ├── screens/                     # All screens
│   │   ├── ActivityDashboardScreen.tsx  # Home tab — hero, categories, trending, fun activities
│   │   ├── BookTableScreen.tsx          # Table booking — static dates/times
│   │   ├── CategoryScreen.tsx           # Category list (Restaurants/Hiking/Party/Culture/Study)
│   │   ├── CreateStoryScreen.tsx        # Story creation form
│   │   ├── ExchangeScreen.tsx           # Currency exchange (static)
│   │   ├── FavoritesScreen.tsx          # Stories tab — story list
│   │   ├── HelpScreen.tsx               # Help & support (static)
│   │   ├── HistoryScreen.tsx            # Reservation history (static)
│   │   ├── MapScreen.tsx                # Explore tab — map with restaurant pins
│   │   ├── MarketScreen.tsx             # Village market (static inline data)
│   │   ├── ProfileEditScreen.tsx        # Edit profile (Supabase auth.updateUser)
│   │   ├── ProfileScreen.tsx            # Profile tab — user info, stats, actions
│   │   ├── RestaurantDetailsScreen.tsx  # Restaurant detail — uses RestaurantCatalogProvider
│   │   ├── SettingsScreen.tsx           # Settings — languages, notifications, account
│   │   ├── StoryDetailScreen.tsx        # Story detail view
│   │   ├── TavolinaScreen.tsx           # Events tab — tavolina invites
│   │   └── auth/
│   │       ├── SignInScreen.tsx
│   │       └── SignUpScreen.tsx
│   │
│   └── theme/
│       ├── index.ts                 # Theme exports
│       └── tokens.ts                # Design tokens (colors, spacing, typography, gradients, shadows)
│
├── supabase/
│   ├── seed.sql                     # Initial seed
│   ├── seed_generated_restaurants.sql # 320 generated restaurant seeds
│   └── migrations/
│       ├── 20260403120000_initial_restaurant_foundation.sql  # profiles, restaurants, restaurant_images, saved_restaurants
│       ├── 20260407100000_add_restaurant_publishing.sql       # is_published column + RLS
│       ├── 20260407113000_add_restaurant_menus.sql            # menu_categories, menu_items
│       └── 20260630190000_add_restaurant_catalog_view.sql     # restaurant_catalog view
│
└── scripts/
    ├── check_restaurants.py         # Restaurant data validation
    ├── export_restaurants_seed.js   # Export to SQL seed
    └── generate_restaurants.py      # Generate 320 restaurants
```

### Technology Stack

| Category | Technology |
|---|---|
| Framework | React Native 0.81 via Expo SDK 54 |
| Language | TypeScript 5.9 |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| Backend | Supabase (Postgres, Auth, RLS) |
| State | React Context (7 providers) |
| Storage | AsyncStorage (auth session, language, stories) |
| Forms | react-hook-form + zod |
| Maps | react-native-maps + expo-location |
| Styling | NativeWind 4 / Tailwind 3 + StyleSheet |
| Images | expo-image, ImageBackground |
| Camera | expo-camera, expo-image-picker |
| Animations | react-native-reanimated 4, Animated API |

---

## 3. Navigation & Screen Map

### Auth Flow
```
AuthNavigator (no session)
├── SignIn
└── SignUp
```

### Main App (session exists)
```
TabsNavigator
├── HomeTab (ActivityDashboardScreen)
│   ├── HomeMain → ActivityDashboardScreen
│   ├── Market → MarketScreen
│   ├── Category → CategoryScreen { category: 'Restaurants'|'Hiking'|'Party'|'Culture'|'Study' }
│   ├── RestaurantDetails → RestaurantDetailsScreen { restaurantId }
│   ├── BookTable → BookTableScreen { restaurantId }
│   ├── Settings → SettingsScreen
│   ├── History → HistoryScreen
│   ├── Help → HelpScreen
│   └── Exchange → ExchangeScreen
│
├── MapTab (Explore)
│   ├── MapMain → MapScreen
│   ├── RestaurantDetails → RestaurantDetailsScreen { restaurantId }
│   ├── BookTable → BookTableScreen { restaurantId }
│   ├── Settings, History, Help, Exchange
│
├── TavolinaTab (Events)
│   ├── TavolinaMain → TavolinaScreen
│   ├── RestaurantDetails, BookTable, Settings, History, Help, Exchange
│
├── FavoritesTab (Stories)
│   ├── FavoritesMain → FavoritesScreen
│   ├── StoryDetail → StoryDetailScreen { storyId }
│   ├── CreateStory → CreateStoryScreen
│   ├── RestaurantDetails, BookTable, Settings, History, Help, Exchange
│
└── ProfileTab
    ├── ProfileMain → ProfileScreen
    ├── EditProfile → ProfileEditScreen
    ├── Settings, History, Help, Exchange
```

### Global Overlay
- `ChatAssistantModal` — rendered when session exists (AI assistant)

---

## 4. Provider & State Management Map

### Provider Hierarchy (App.tsx)
```
GestureHandlerRootView
└── SafeAreaProvider
    └── I18nProvider                    # language, setLanguage, messages
        └── AuthProvider                # session, user, signIn, signUp, updateProfile, signOut
            └── RestaurantCatalogProvider  # restaurants[], loading, error, refresh, getRestaurantById
                └── DiscoveryProvider       # locationOptions, selectedLocation, category, search, chat
                    └── StoriesProvider     # createStory, getStories, getStoryById, imageTemplates
                        └── AppNavigator
                            └── ScrollBehaviorProvider  # (inside AppNavigator)
```

### Provider Details

| Provider | File | State | Persistence | Supabase? |
|---|---|---|---|---|
| `I18nProvider` | `i18n/I18nProvider.tsx` | `language: 'en'\|'sq'` | AsyncStorage `kosvibe.language` | ❌ |
| `AuthProvider` | `features/auth/AuthProvider.tsx` | `session`, `user`, `isAuthReady` | Supabase session (AsyncStorage) | ✅ Auth |
| `RestaurantCatalogProvider` | `lib/restaurant-catalog.tsx` | `restaurants: RestaurantCatalogItem[]`, `loading`, `error` | None (fetches on mount) | ✅ `restaurants` table + fallback |
| `DiscoveryProvider` | `lib/discovery-state.tsx` | `selectedLocationId`, `selectedCategory`, `searchQuery`, `isChatOpen`, `chatMessages`, `isAssistantTyping` | None (in-memory) | ❌ |
| `StoriesProvider` | `lib/stories-state.tsx` | `createdStories: StoryItem[]` | AsyncStorage `kosvibe.createdStories` | ❌ |
| `AppStateProvider` | `lib/app-state.tsx` | `isBootstrapping`, `hasCompletedOnboarding` | None | ❌ (unused in App.tsx) |
| `ScrollBehaviorProvider` | `lib/scroll-behavior.tsx` | Scroll state | None | ❌ |

---

## 5. Data Source Inventory

### `src/data/mockData.ts` (2291 lines — THE PRODUCT SPECIFICATION)

#### Exported Types (20)
| Type | Lines | Used By |
|---|---|---|
| `MapRegion` | 1-6 | MapScreen, ExploreMap, discovery-state |
| `Coordinates` | 8-11 | maps.ts, ExploreMap, Restaurant |
| `MenuItem` | 13-19 | Restaurant.menuSections |
| `MenuSection` | 21-26 | Restaurant.menuSections |
| `Promotion` | 28-32 | Restaurant.promotions |
| `Review` | 34-40 | Restaurant.reviews |
| `Restaurant` | 42-71 | Core model — 25+ fields |
| `FeaturedMenuItem` | 73-83 | featuredMenuItems export |
| `ActiveOffer` | 85-92 | activeOffers export |
| `EventFeature` | 94-102 | eventHighlights export |
| `KosovoHighlight` | 104-109 | kosovoHighlights export |
| `MapPin` | 111-117 | (declared, not actively used) |
| `Activity` | 119-127 | recentActivity export |
| `ProfileAchievement` | 129-136 | profileAchievements export |
| `QuickLink` | 138-152 | profileQuickLinks, accountLinks, OptionListCard |
| `TavolinaInvite` | 154-172 | tavolinaInvites export, TavolinaScreen |
| `LanguageOption` | 174-179 | settingsLanguages export |
| `NotificationOption` | 181-186 | notificationOptions export |
| `BookingDate` | 188-194 | bookingDates export |
| `DiscoveryLocation` | 196-201 | discoveryLocations export, discovery-state |

#### Exported Data (20)
| Export | Type | Count | Lines |
|---|---|---|---|
| `restaurants` | `Restaurant[]` | ~12 curated | 1594 |
| `restaurantById` | `Record<string, Restaurant>` | lookup map | 1604 |
| `discoveryLocations` | `DiscoveryLocation[]` | 38 Kosovo municipalities | 1609 |
| `featuredMenuItems` | `FeaturedMenuItem[]` | ~6 | 1866 |
| `activeOffers` | `ActiveOffer[]` | ~3 | 1902 |
| `eventHighlights` | `EventFeature[]` | ~5 | 1921 |
| `kosovoHighlights` | `KosovoHighlight[]` | ~4 | 1969 |
| `nearbyRestaurants` | `Restaurant[]` | derived | 2002 |
| `favoriteRestaurants` | `Restaurant[]` | 8 | 2006 |
| `profileStats` | inline array | 3 | 2008 |
| `profileAchievements` | `ProfileAchievement[]` | ~4 | 2014 |
| `recentActivity` | `Activity[]` | 3 | 2049 |
| `profileQuickLinks` | `QuickLink[]` | 4 | 2077 |
| `settingsLanguages` | `LanguageOption[]` | 2 | 2084 |
| `notificationOptions` | `NotificationOption[]` | 3 | 2089 |
| `accountLinks` | `QuickLink[]` | 5 | 2110 |
| `bookingDates` | `BookingDate[]` | 5 | 2118 |
| `bookingTimes` | `string[]` | 16 | 2126 |
| `tavolinaInvites` | `TavolinaInvite[]` | 3 | 2145 |

#### Exported Functions (6)
| Function | Purpose |
|---|---|
| `getRestaurantById(id)` | Lookup from `restaurantById` map |
| `getLocationById(id)` | Lookup from `discoveryLocations` |
| `matchesRestaurantToLocation(restaurant, locationId)` | City matching |
| `filterRestaurantsByDiscovery(list, locationId, query)` | Location + text search filter |
| `filterFeaturedItemsByDiscovery(locationId, query)` | Featured items filtered by location |
| `filterOffersByDiscovery(locationId, query)` | Offers filtered by location |
| `getMapRegionForRestaurants(list)` | Compute bounding box for map |

### `src/data/restaurantsData.ts`
- **Export:** `RESTAURANTS_JSON: Restaurant[]` — 320 generated restaurants
- **Distribution:** Prishtina:192, Prizren:64, Peje:64
- **Schema:** Same `Restaurant` type from mockData
- **Quality:** Generated data with placeholder images, generic menu items, generic reviews

### `src/data/nearbyVibesRestaurants.ts`
- **Export:** `nearbyVibesRestaurants: Restaurant[]` — 6 curated restaurants
- **Source:** Maps IDs `['pishat', 'sushi-bar-tokio', 'pizza-napoli', 'cafe-renaissance', 'grill-house', 'bar-metropol']` to `restaurantById`

### `src/lib/stories-state.tsx`
- **Base stories:** 4 per language (EN/SQ) — hardcoded in `baseStories`
- **User stories:** AsyncStorage `kosvibe.createdStories`
- **StoryItem type:** id, title, author, subtitle, body, image, location, category, readTime, postedAt, likes, views, isUserStory, imageUri

### `src/lib/discovery-state.tsx`
- **Locations:** `discoveryLocations` from mockData (38 municipalities)
- **AI Chat:** Rule-based `buildAssistantReply()` — keyword matching, no LLM
- **Initial message:** Hardcoded welcome message

### Screen-level static data
| Screen | Static Data |
|---|---|
| `ActivityDashboardScreen` | `heroSlides` (3 images), `funActivities` (15 activities), `categories` (4) |
| `MarketScreen` | `marketCopy` with `marketSpots` (inline, EN/SQ) |
| `HistoryScreen` | (static content) |
| `HelpScreen` | (static content) |
| `ExchangeScreen` | (static content) |
| `ProfileScreen` | `stats` hardcoded as `['28', '12', '05']` |

---

## 6. TypeScript Model & Interface Inventory

### Core Domain Models

```typescript
// Restaurant (the central entity — 25+ fields)
type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  tagline: string;
  priceRange: string;          // "€", "€€", "€€€", "EUR", "EUR EUR"
  rating: number;              // 0-5
  reviewCount: number;
  distance: string;            // "0.8 km" — pre-formatted
  isOpen: boolean;
  image: string;               // card image URL
  heroImage: string;           // detail hero URL
  address: string;
  phone: string;
  hours: string;               // "11:00 - 23:00"
  city: string;
  coordinates: { latitude: number; longitude: number };
  todaySpecial: {
    name: string;
    description: string;
    originalPrice: string;     // "€8.5"
    price: string;             // "€6"
    discount: string;          // "-30%"
    availableUntil?: string;   // "Until 14:00"
    image: string;
  };
  promotions: Promotion[];
  menuSections: MenuSection[];
  reviews: Review[];
};

// RestaurantCatalogItem (Supabase-facing shape)
type RestaurantCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  cuisine: string | null;
  priceRange: string | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
};
```

### Mapper: RestaurantCatalogItem → Restaurant
The `buildCatalogRestaurant()` function in `restaurant-catalog.tsx`:
1. Try `getLocalRestaurantById(item.id)` — from mockData
2. Try `generatedRestaurantsById.get(item.id)` — from restaurantsData
3. Fall back to `buildFallbackRestaurant(item)` — synthesizes a full Restaurant from catalog fields with defaults

**Critical insight:** The full `Restaurant` type has nested objects (`todaySpecial`, `promotions`, `menuSections`, `reviews`) that do NOT exist in the Supabase `restaurants` table. The fallback synthesizes empty/placeholder values. **These nested structures must become database tables.**

---

## 7. Supabase Integration Audit

### Current Client (`src/lib/supabase.ts`)
- Creates client from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Storage: AsyncStorage (native), localStorage (web), memory (SSR)
- `autoRefreshToken`, `persistSession`, `detectSessionInUrl: false`

### Current Database Schema

#### Table: `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | → auth.users.id |
| full_name | text | |
| avatar_url | text | |
| preferred_language | text | default 'en', check en/sq |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger |

**RLS:** Owner-only (select/insert/update)

#### Table: `restaurants`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text unique | |
| description | text | |
| city | text | |
| address | text | |
| cuisine | text | |
| price_range | text | |
| rating | numeric(2,1) | 0-5 |
| latitude | numeric(9,6) | |
| longitude | numeric(9,6) | |
| phone | text | |
| website | text | |
| is_featured | boolean | default false |
| is_published | boolean | default true |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger |

**RLS:** Published restaurants publicly readable (anon + authenticated)

#### Table: `restaurant_images`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| restaurant_id | uuid FK | → restaurants.id |
| image_url | text | |
| alt_text | text | |
| sort_order | int | |

**RLS:** Publicly readable if parent restaurant is published

#### Table: `saved_restaurants`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | → auth.users.id |
| restaurant_id | uuid FK | → restaurants.id |
| created_at | timestamptz | |
| | | unique(user_id, restaurant_id) |

**RLS:** Owner-only (select/insert/delete)

#### Table: `menu_categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| restaurant_id | uuid FK | → restaurants.id |
| name | text | |
| description | text | |
| sort_order | int | |
| is_active | boolean | default true |

**RLS:** Publicly readable if parent restaurant is published

#### Table: `menu_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| category_id | uuid FK | → menu_categories.id |
| name | text | |
| description | text | |
| price | numeric(10,2) | |
| image_url | text | |
| image_alt_text | text | |
| sort_order | int | |
| is_available | boolean | default true |
| availability_note | text | |

**RLS:** Publicly readable if parent restaurant is published

#### View: `restaurant_catalog`
- Published restaurants with primary image (first by sort_order)

### What's Missing in the Database

| Feature | Missing Tables |
|---|---|
| Restaurant today's special | `restaurant_specials` or `restaurant_today_specials` |
| Restaurant promotions | `restaurant_promotions` |
| Restaurant reviews | `restaurant_reviews` |
| Restaurant hours / open status | `restaurant_hours` or columns on restaurants |
| Stories | `stories` (with i18n) |
| Events / Tavolina invites | `events` / `tavolina_invites` |
| Marketplace | `marketplace_listings` |
| Bookings | `restaurant_bookings` |
| Profile stats | Derived from bookings, reviews, saved, stories |
| Profile achievements | `achievements`, `user_achievements` |
| Recent activity | Derived from user actions |
| Fun activities | `activities` / `fun_activities` |
| Discovery locations | `discovery_locations` (or static config table) |
| Notifications | `notification_preferences` |
| AI chat history | `chat_messages` / `chat_conversations` |
| Featured menu items | Derived from `menu_items` + `restaurant_specials` |
| Active offers | `restaurant_offers` |
| Event highlights | `event_highlights` |
| Kosovo highlights | `kosovo_highlights` (static content) |

---

## 8. AsyncStorage Usage Audit

| Key | Provider | Purpose | Migration Target |
|---|---|---|---|
| Supabase session keys | `supabase.ts` | Auth session persistence | ✅ Keep (Supabase managed) |
| `kosvibe.language` | `I18nProvider` | User's preferred language | → `profiles.preferred_language` (sync on login) |
| `kosvibe.createdStories` | `StoriesProvider` | User-created stories | → `stories` table (user-authored) |

---

## 9. API Call Audit

### Current Supabase API Calls

| File | Call | Purpose |
|---|---|---|
| `AuthProvider.tsx` | `supabase.auth.getSession()` | Restore session on mount |
| `AuthProvider.tsx` | `supabase.auth.onAuthStateChange()` | Listen to auth changes |
| `AuthProvider.tsx` | `supabase.auth.startAutoRefresh()` | Auto-refresh token |
| `AuthProvider.tsx` | `supabase.auth.signInWithPassword()` | Sign in |
| `AuthProvider.tsx` | `supabase.auth.signUp()` | Sign up (with `full_name` metadata) |
| `AuthProvider.tsx` | `supabase.auth.updateUser()` | Update profile (full_name, bio, avatar_url) |
| `AuthProvider.tsx` | `supabase.auth.signOut()` | Sign out |
| `restaurant-catalog.tsx` | `supabase.from('restaurants').select(...)` | Load restaurant catalog with images |

### Restaurant Catalog Query (current)
```sql
SELECT
  id, slug, name, description, city, address, cuisine,
  price_range, rating, latitude, longitude, phone, website,
  is_featured,
  restaurant_images ( image_url, alt_text, sort_order )
FROM restaurants
ORDER BY name ASC
LIMIT 10000;
```

### External API Calls
| File | Call | Purpose |
|---|---|---|
| `maps.ts` | `Linking.openURL()` | Open Apple Maps / Google Maps directions |
| `MapScreen.tsx` | `expo-location` | Request device location permissions |
| All images | Unsplash URLs | Remote image loading (no API key needed) |

---

## 10. UI Contract — Per Feature

### 10.1 Restaurants (Catalog + Details)

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `Restaurant` (25+ fields with nested objects) | Must preserve full shape |
| **Model** | `Restaurant` type in mockData.ts | Source of truth |
| **Data source** | `RestaurantCatalogProvider` — Supabase + mock fallback | Hybrid |
| **Expected contract** | `RestaurantCatalogItem[]` from Supabase mapped to `Restaurant` | Keep mapper pattern |
| **Future DB source** | `restaurants` + `restaurant_images` + new tables for specials, promotions, reviews, hours | See below |
| **Required mapper** | `buildCatalogRestaurant()` — already exists, needs extension | Extend for new nested tables |
| **Required API/RPC** | `GET /restaurants` (catalog), `GET /restaurants/:id` (full detail with nested) | RPC or nested select |

#### Required New Tables for Restaurant Details
```sql
-- Today's special (1:1 with restaurant)
restaurant_today_specials (
  id uuid PK,
  restaurant_id uuid FK unique,
  name text,
  description text,
  original_price text,     -- keep as string to match UI ("€8.5")
  price text,              -- keep as string
  discount text,           -- "-30%"
  available_until text,    -- "Until 14:00"
  image_url text,
  is_active boolean
)

-- Promotions (1:many)
restaurant_promotions (
  id uuid PK,
  restaurant_id uuid FK,
  title text,
  subtitle text,
  sort_order int,
  is_active boolean
)

-- Reviews (1:many)
restaurant_reviews (
  id uuid PK,
  restaurant_id uuid FK,
  author text,             -- display name
  author_user_id uuid,     -- optional, if authenticated
  comment text,
  rating int,              -- 1-5
  created_at timestamptz
)

-- Hours / open status
restaurant_hours (
  id uuid PK,
  restaurant_id uuid FK,
  day_of_week int,         -- 0-6
  open_time text,          -- "11:00"
  close_time text,         -- "23:00"
  is_closed boolean
)
-- OR: add columns to restaurants: hours_text, is_open_now (computed)
```

#### Mapper Requirements
- `price` and `originalPrice` are **strings** in the UI (e.g., `"€6"`, `"EUR 8.5"`) — DB can store numeric but mapper must format
- `distance` is a **pre-formatted string** (e.g., `"0.8 km"`) — must be computed server-side or client-side from coordinates
- `isOpen` is a boolean — must be computed from current time + restaurant hours
- `reviewCount` is a denormalized count — maintain via trigger or RPC
- `rating` is a float (0-5) — maintain as aggregate from reviews

---

### 10.2 Stories

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `StoryItem` (13 fields) | Must preserve |
| **Model** | `StoryItem` in stories-state.tsx | Source of truth |
| **Data source** | `baseStories` (hardcoded, 4 per language) + AsyncStorage user stories | Local only |
| **Expected contract** | Stories list per language, user-created stories, story detail | `getStories(language)`, `getStoryById(id, language)`, `createStory(input)` |
| **Future DB source** | `stories` table with i18n support | See below |
| **Required mapper** | DB row → `StoryItem` | Map created_at → postedAt, compute readTime |
| **Required API/RPC** | `GET /stories?lang=en`, `GET /stories/:id`, `POST /stories` | RPC or REST |

#### Required New Tables
```sql
stories (
  id uuid PK,
  author_id uuid,          -- nullable for system stories
  author_name text,        -- "@streetvibes.xk" or "@you"
  title text,
  subtitle text,
  body text,
  image_url text,
  image_uri text,          -- local file URI for user uploads
  location text,
  category text,
  read_time text,          -- "3 min" — pre-formatted
  likes int default 0,
  views int default 0,
  is_user_story boolean default false,
  language text,           -- 'en' | 'sq' | 'all'
  is_published boolean default true,
  created_at timestamptz
)
```

#### Key Observations
- Base stories have **different content per language** (not just translations — different titles and bodies)
- User stories are language-agnostic (shown in all languages)
- `postedAt` is a human-readable string ("Tonight", "2h ago", "Just now") — must be computed from `created_at`
- `likes` and `views` are integers — need counter tables or denormalized columns
- `imageTemplates` array is used in CreateStoryScreen for image selection

---

### 10.3 Events / Tavolina

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `TavolinaInvite` (16 fields) | Must preserve |
| **Model** | `TavolinaInvite` in mockData.ts | Source of truth |
| **Data source** | `tavolinaInvites` array (3 items) | Static |
| **Expected contract** | Invites list, create invite, join spots | CRUD |
| **Future DB source** | `tavolina_invites` / `events` table | See below |
| **Required mapper** | DB row → `TavolinaInvite` | Map timestamps to day/time strings |
| **Required API/RPC** | `GET /tavolina-invites`, `POST /tavolina-invites`, `PATCH /tavolina-invites/:id/join` | |

#### Required New Tables
```sql
tavolina_invites (
  id uuid PK,
  restaurant_id uuid FK,          -- nullable
  restaurant_name text,           -- denormalized for non-restaurant events
  city text,
  day text,                       -- "Friday" — or derive from event_date
  time text,                      -- "20:00"
  event_type text,                -- 'food' | 'culture' | 'nightlife' | 'other'
  creator_id uuid,                -- auth user
  creator_name text,              -- display name
  creator_avatar text,
  description text,
  tags text[],                    -- array
  spots_label text,               -- "2/4 spots" — or compute from attendees
  max_attendees int,
  current_attendees int,
  image_url text,
  image_uri text,                 -- local upload
  is_paid boolean,
  price text,                     -- string to match UI
  is_active boolean default true,
  created_at timestamptz
)

tavolina_invite_attendees (
  id uuid PK,
  invite_id uuid FK,
  user_id uuid,
  joined_at timestamptz,
  unique(invite_id, user_id)
)
```

---

### 10.4 Marketplace

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | Inline `marketCopy` object with `marketSpots` array | Must preserve structure |
| **Model** | Inline in MarketScreen.tsx | Source of truth |
| **Data source** | Hardcoded in screen | Static |
| **Expected contract** | Market spots by category (food, craft, clothing) | `GET /marketplace` |
| **Future DB source** | `marketplace_listings` table | See below |
| **Required mapper** | DB row → market spot shape | |
| **Required API/RPC** | `GET /marketplace?category=food` | |

#### Required New Tables
```sql
marketplace_listings (
  id uuid PK,
  title text,
  subtitle text,
  description text,
  category text,          -- 'food' | 'craft' | 'clothing'
  city text,
  image_url text,
  price text,             -- nullable
  seller_name text,
  is_featured boolean,
  is_published boolean,
  sort_order int,
  created_at timestamptz
)
```

---

### 10.5 Profile

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | Supabase `user.user_metadata` (full_name, bio, avatar_url) + hardcoded stats | Hybrid |
| **Model** | Supabase User + inline stats | Source of truth |
| **Data source** | `useAuth()` for user data; `stats` hardcoded `['28', '12', '05']` | Auth live, stats mock |
| **Expected contract** | User profile + computed stats (saved count, stories count, events count) | |
| **Future DB source** | `profiles` table (exists) + derived counts | |
| **Required mapper** | User + metadata → ProfileScreen shape | Already done in ProfileScreen |
| **Required API/RPC** | `GET /profiles/me` with computed stats | RPC for aggregate counts |

#### Required Changes
- `profiles` table needs `bio` column (currently stored in `auth.users.user_metadata`)
- Stats should be computed: `saved_restaurants` count, `stories` count, `tavolina_invites` count
- `profileAchievements` and `recentActivity` need tables or RPC

```sql
ALTER TABLE profiles ADD COLUMN bio text;

achievements (
  id uuid PK,
  icon text,             -- 'star' | 'heart' | 'create' | 'diamond'
  title text,
  subtitle text,
  status text,
  unlock_criteria jsonb
)

user_achievements (
  id uuid PK,
  user_id uuid,
  achievement_id uuid,
  unlocked boolean,
  unlocked_at timestamptz
)

user_activity (
  id uuid PK,
  user_id uuid,
  activity_type text,    -- 'booking' | 'review' | 'favorite'
  entity_type text,      -- 'restaurant' | 'story' | 'event'
  entity_id text,
  title text,
  subtitle text,
  icon text,
  status text,
  created_at timestamptz
)
```

---

### 10.6 Favorites / Saved Restaurants

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `saved` boolean in `RestaurantDetailsScreen` (local `useState`) | Must become persistent |
| **Model** | `saved_restaurants` table (exists in DB) | DB ready |
| **Data source** | Local state only — NOT connected to `saved_restaurants` table | ❌ Disconnected |
| **Expected contract** | Toggle save, list saved restaurants, count | |
| **Future DB source** | `saved_restaurants` table (already exists with RLS) | ✅ Ready |
| **Required mapper** | `saved_restaurants` join → `Restaurant` | |
| **Required API/RPC** | `POST /restaurants/:id/save`, `DELETE /restaurants/:id/save`, `GET /me/saved` | |

#### Key Gap
The `saved_restaurants` table exists with proper RLS but the UI uses `useState(false)` in `RestaurantDetailsScreen`. The heart toggle does nothing persistent. **This is the easiest migration — just wire the UI to the existing table.**

---

### 10.7 Search / Discovery

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `DiscoveryLocation[]`, `searchQuery`, `selectedCategory` | Must preserve |
| **Model** | `DiscoveryLocation` in mockData, `DiscoveryProvider` state | Source of truth |
| **Data source** | `discoveryLocations` (38 municipalities) + client-side `filterRestaurantsByDiscovery()` | Local |
| **Expected contract** | Location selector, text search, category filter | |
| **Future DB source** | `discovery_locations` table or PostGIS query | |
| **Required mapper** | DB row → `DiscoveryLocation` | |
| **Required API/RPC** | `GET /restaurants?city=Prishtina&q=pizza` | Server-side search |

#### Key Observations
- `filterRestaurantsByDiscovery()` searches across: name, cuisine, city, tagline, todaySpecial.name, todaySpecial.description
- `discoveryLocations` has 38 Kosovo municipalities with lat/lng/zoom
- Search is currently client-side — must move to server-side for scale
- `MapRegion` (latitude, longitude, latitudeDelta, longitudeDelta) is used for map viewport

---

### 10.8 Maps

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `Restaurant[]` → map markers with `Coordinates` | Must preserve |
| **Model** | `Coordinates`, `MapRegion`, `ExploreMapMarker` | Source of truth |
| **Data source** | `restaurants` from mockData, filtered by discovery | Local |
| **Expected contract** | Map pins for restaurants, tap for details, directions | |
| **Future DB source** | `restaurants` with latitude/longitude | ✅ Columns exist |
| **Required mapper** | Restaurant → marker | Already done in MapScreen |
| **Required API/RPC** | `GET /restaurants?bbox=minLat,minLng,maxLat,maxLng` | PostGIS or bounding box |

#### Key Observations
- `ExploreMap.native.tsx` uses `react-native-maps` (iOS/Android)
- `ExploreMap.tsx` is web fallback
- `getMapRegionForRestaurants()` computes bounding box from restaurant list
- `openDirectionsToPlace()` opens native maps app
- `expo-location` used for device location in MapScreen

---

### 10.9 Categories

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | Category type: `'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study'` | Must preserve |
| **Model** | Union type in navigation types | Source of truth |
| **Data source** | Navigation param + `useRestaurantCatalog()` + `nearbyVibesRestaurants` | Hybrid |
| **Expected contract** | Filter restaurants by category, show curated lists | |
| **Future DB source** | `categories` table or `restaurant_categories` junction | |
| **Required mapper** | Category → restaurant filter | |
| **Required API/RPC** | `GET /restaurants?category=Restaurants` | |

#### Key Observations
- `CategoryScreen` uses `useRestaurantCatalog()` for the main list and `nearbyVibesRestaurants` for a horizontal showcase
- Categories are currently only "Restaurants" in practice — other categories (Hiking, Party, Culture, Study) don't filter restaurants differently
- The `categories` array in `ActivityDashboardScreen` maps: restaurants → Category, monuments → Category(Culture), events → TavolinaTab, stories → Market

---

### 10.10 Notifications

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `NotificationOption` (id, title, subtitle, enabled) | Must preserve |
| **Model** | `NotificationOption` in mockData | Source of truth |
| **Data source** | `notificationOptions` array (3 items) | Static |
| **Expected contract** | Toggle notification preferences, persist per user | |
| **Future DB source** | `notification_preferences` table | See below |
| **Required mapper** | DB row → `NotificationOption` | |
| **Required API/RPC** | `GET /me/notifications`, `PUT /me/notifications/:id` | |

```sql
notification_preferences (
  id uuid PK,
  user_id uuid,
  notification_type text,   -- 'offers' | 'reservations' | 'reviews'
  enabled boolean,
  unique(user_id, notification_type)
)
```

---

### 10.11 AI Assistant

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `ChatMessage` (id, role, text) | Must preserve |
| **Model** | `ChatMessage` in discovery-state | Source of truth |
| **Data source** | `buildAssistantReply()` — rule-based keyword matching | Mock |
| **Expected contract** | Natural language chat about Kosovo discovery | |
| **Future DB source** | LLM API (OpenAI/Anthropic) + `chat_conversations` table | |
| **Required mapper** | LLM response → `ChatMessage` | |
| **Required API/RPC** | `POST /chat` (streaming), `GET /chat/history` | Edge function |

#### Current AI Behavior
- Welcome message: "Hi, I am your KosVibe AI guide..."
- 850ms simulated typing delay
- Keyword matching: restaurant names, "book", "special/offer", "monument/nature", "market", "event/night", "history", "near/nearby", "pizza/italian", "traditional/kosovo"
- Returns contextual text about restaurants, monuments, markets, events, history
- Uses `restaurants` from mockData to find mentioned restaurants

#### Required Migration
- Replace `buildAssistantReply()` with Supabase Edge Function calling LLM
- Persist chat history per user
- Feed restaurant catalog as context to LLM
- Maintain the 850ms typing indicator UX

---

### 10.12 Book Table

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `BookingDate` (5 dates), `bookingTimes` (16 time slots) | Must preserve |
| **Model** | `BookingDate` in mockData, `bookingTimes` string array | Source of truth |
| **Data source** | Static arrays | Static |
| **Expected contract** | Select date/time, confirm booking, persist | |
| **Future DB source** | `restaurant_bookings` table | See below |
| **Required mapper** | DB row → booking confirmation | |
| **Required API/RPC** | `POST /restaurants/:id/bookings`, `GET /me/bookings` | |

```sql
restaurant_bookings (
  id uuid PK,
  restaurant_id uuid FK,
  user_id uuid,
  booking_date date,
  booking_time text,       -- "19:00"
  party_size int,
  status text,             -- 'confirmed' | 'pending' | 'cancelled'
  created_at timestamptz
)
```

#### Key Observations
- `bookingDates` are hardcoded with specific dates ("Today", "Thu 23", etc.) — should be dynamically generated
- `bookingTimes` is a static list of 16 slots from 11:00 to 21:00
- `BookTableScreen` uses `useRestaurantCatalog()` for restaurant lookup with mock fallback
- No booking persistence exists — the "confirm" action is visual only

---

### 10.13 Fun Activities

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `FunActivity` (id, title, subtitle, summary, city, icon, accentColor, backgroundColor) | Must preserve |
| **Model** | `FunActivity` inline in ActivityDashboardScreen | Source of truth |
| **Data source** | `funActivities` array (15 items) hardcoded in screen | Static |
| **Expected contract** | Activity cards by city, detail modal | |
| **Future DB source** | `fun_activities` table | See below |
| **Required mapper** | DB row → `FunActivity` | |
| **Required API/RPC** | `GET /activities?city=Prishtina` | |

```sql
fun_activities (
  id uuid PK,
  title text,
  subtitle text,
  summary text,
  city text,
  icon text,               -- Ionicons name
  accent_color text,       -- hex color
  background_color text,   -- rgba color
  is_published boolean,
  sort_order int
)
```

---

### 10.14 Settings

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `LanguageOption[]`, `NotificationOption[]`, `QuickLink[]` | Must preserve |
| **Model** | Types from mockData | Source of truth |
| **Data source** | `settingsLanguages`, `notificationOptions`, `accountLinks` | Static |
| **Expected contract** | Language toggle (syncs to profile), notification toggles, account links | |
| **Future DB source** | `profiles.preferred_language` (exists) + `notification_preferences` (new) | |
| **Required mapper** | Profile → `LanguageOption` | |
| **Required API/RPC** | `PUT /profiles/me` (language), `GET/PUT /me/notifications` | |

---

### 10.15 Hero Slides / Kosovo Highlights / Event Highlights

| Aspect | Current | Contract |
|---|---|---|
| **Data shape** | `heroSlides` (3 images), `KosovoHighlight[]`, `EventFeature[]` | Must preserve |
| **Model** | Inline in ActivityDashboardScreen, mockData types | Source of truth |
| **Data source** | Local `require()` images + mockData arrays | Static |
| **Expected contract** | Hero carousel, highlight cards, event feature cards | |
| **Future DB source** | `app_content` table (CMS-like) or static config | Low priority |

---

## 11. Feature Dependency Graph

```
                    ┌─────────────┐
                    │   Auth      │
                    │ (Supabase)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Profile    │
                    │  (user)     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌───▼────┐ ┌────▼─────┐
       │  Favorites  │ │ Stories│ │  Events  │
       │  (saved)    │ │(create)│ │(Tavolina)│
       └──────┬──────┘ └───┬────┘ └────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │ Restaurants │
                    │  (catalog)  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │    Maps     │  │  Book Table │  │   Search    │
   │  (pins)     │  │  (booking)  │  │ (discovery) │
   └─────────────┘  └─────────────┘  └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  AI Chat    │
                    │ (assistant) │
                    └─────────────┘

  Independent features:
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ Marketplace │  │  Settings   │  │   Fun       │
  │  (market)   │  │ (preferences)│  │ Activities  │
  └─────────────┘  └─────────────┘  └─────────────┘
```

### Dependency Details

| Feature | Depends On | Dependency Type |
|---|---|---|
| Profile | Auth | Hard — requires session |
| Favorites | Auth + Restaurants | Hard — requires user + restaurant IDs |
| Stories | Auth (for user stories) | Soft — base stories work without auth |
| Events/Tavolina | Auth + Restaurants (optional) | Soft — can exist without restaurant link |
| Restaurant Details | Restaurant Catalog | Hard — requires restaurant data |
| Maps | Restaurants | Hard — needs coordinates |
| Book Table | Restaurants + Auth | Hard — needs restaurant + user |
| Search | Restaurants + Discovery Locations | Hard — needs restaurant data |
| AI Chat | Restaurants + Discovery | Hard — needs restaurant context |
| Marketplace | None | Independent |
| Settings | Auth | Soft — language works offline |
| Fun Activities | Discovery (city filter) | Soft — works with static data |
| Notifications | Auth | Hard — per-user preferences |
| Categories | Restaurants | Hard — filters restaurants |

---

## 12. Backend Dependency Graph

```
                    ┌──────────────────┐
                    │  auth.users      │
                    │  (Supabase Auth) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    profiles      │
                    │ (full_name, bio, │
                    │  avatar, lang)   │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐   ┌──────▼──────┐   ┌───────▼───────┐
   │  restaurants│   │   stories   │   │ tavolina_     │
   │  (catalog)  │   │  (content)  │   │ invites       │
   └──────┬──────┘   └──────┬──────┘   └───────┬───────┘
          │                 │                  │
   ┌──────┼──────┐          │            ┌─────▼─────┐
   │      │      │          │            │ attendees │
   │      │      │          │            └───────────┘
┌─▼──┐ ┌─▼──┐ ┌─▼──────┐  ┌─▼────┐
│img │ │menu│ │specials│  │likes │
│    │ │cat │ │promos  │  │views │
│    │ │item│ │reviews │  └──────┘
│    │ │    │ │hours   │
└────┘ └────┘ └────────┘
          │
   ┌──────▼──────┐
   │    saved_   │
   │ restaurants │
   └─────────────┘
          │
   ┌──────▼──────┐
   │  bookings   │
   └─────────────┘

  Independent tables:
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │ marketplace │ │  activities │ │  discovery_ │
  │  listings   │ │  (fun)      │ │  locations  │
  └─────────────┘ └─────────────┘ └─────────────┘

  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │ notification│ │  user_      │ │  chat_      │
  │ preferences │ │  activity   │ │  messages   │
  └─────────────┘ └─────────────┘ └─────────────┘

  ┌─────────────┐ ┌─────────────┐
  │ achievements│ │user_achieve.│
  └─────────────┘ └─────────────┘
```

### Database Creation Order (dependency-safe)

1. `profiles` (depends on `auth.users`) — ✅ EXISTS
2. `restaurants` — ✅ EXISTS
3. `restaurant_images` — ✅ EXISTS
4. `restaurant_hours` (new)
5. `restaurant_today_specials` (new)
6. `restaurant_promotions` (new)
7. `menu_categories` — ✅ EXISTS
8. `menu_items` — ✅ EXISTS
9. `restaurant_reviews` (new)
10. `saved_restaurants` — ✅ EXISTS
11. `restaurant_bookings` (new)
12. `discovery_locations` (new — or keep as config)
13. `stories` (new)
14. `tavolina_invites` (new)
15. `tavolina_invite_attendees` (new)
16. `marketplace_listings` (new)
17. `fun_activities` (new)
18. `notification_preferences` (new)
19. `achievements` (new)
20. `user_achievements` (new)
21. `user_activity` (new)
22. `chat_conversations` (new)
23. `chat_messages` (new)

---

## 13. Recommended Migration Order

### Phase 1: Wire Existing Infrastructure (Low Risk)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 1.1 | **Favorites / Saved** | Low | `saved_restaurants` table + RLS already exists. Just wire UI `useState` → Supabase calls. |
| 1.2 | **Profile bio** | Low | Add `bio` column to `profiles` table. Move from `user_metadata` to `profiles`. |
| 1.3 | **Language sync** | Low | Sync AsyncStorage language to `profiles.preferred_language` on login. |

### Phase 2: Restaurant Detail Completeness (Medium Risk)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 2.1 | **Restaurant hours + isOpen** | Medium | Add `restaurant_hours` table or columns. Compute `isOpen` server-side. |
| 2.2 | **Restaurant today specials** | Medium | Add `restaurant_today_specials` table. Extend `buildCatalogRestaurant()` mapper. |
| 2.3 | **Restaurant promotions** | Medium | Add `restaurant_promotions` table. Extend mapper. |
| 2.4 | **Restaurant reviews** | Medium | Add `restaurant_reviews` table. Extend mapper. Add review submission. |
| 2.5 | **Menu data seeding** | Medium | Seed `menu_categories` + `menu_items` from mock data. Wire to detail screen. |

### Phase 3: Core User Features (Medium Risk)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 3.1 | **Book Table** | Medium | Add `restaurant_bookings` table. Wire BookTableScreen confirm action. |
| 3.2 | **Stories** | Medium | Add `stories` table with i18n. Migrate AsyncStorage stories. Wire create/list/detail. |
| 3.3 | **Events / Tavolina** | Medium | Add `tavolina_invites` + attendees. Wire TavolinaScreen create/join. |

### Phase 4: Discovery & Search (Medium-High Risk)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 4.1 | **Server-side search** | Medium | Move `filterRestaurantsByDiscovery()` to Supabase query/RPC. |
| 4.2 | **Discovery locations** | Low | Add `discovery_locations` table or keep as static config. |
| 4.3 | **Map bounding box query** | Medium | Add PostGIS or bbox query for map pins. |

### Phase 5: Enrichment Features (Lower Priority)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 5.1 | **Marketplace** | Medium | Add `marketplace_listings` table. Migrate inline data. |
| 5.2 | **Fun Activities** | Low | Add `fun_activities` table. Migrate hardcoded array. |
| 5.3 | **Notifications** | Medium | Add `notification_preferences` table. Wire SettingsScreen toggles. |
| 5.4 | **Profile stats + achievements** | Medium | Add `achievements` + `user_achievements`. Create RPC for computed stats. |
| 5.5 | **User activity feed** | Medium | Add `user_activity` table. Log actions from bookings, reviews, favorites. |

### Phase 6: AI Assistant (High Effort)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 6.1 | **Chat persistence** | Medium | Add `chat_conversations` + `chat_messages` tables. |
| 6.2 | **LLM integration** | High | Supabase Edge Function calling LLM with restaurant context. Replace `buildAssistantReply()`. |

### Phase 7: Content Management (Low Priority)

| Step | Feature | Effort | Rationale |
|---|---|---|---|
| 7.1 | **Hero slides / Kosovo highlights** | Low | CMS table or keep as static assets. |
| 7.2 | **Event highlights** | Low | `event_highlights` table or keep static. |
| 7.3 | **Exchange rates** | Low | External API or scheduled job. |

---

## 14. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| **Price formatting mismatch** — UI uses strings ("€6", "EUR 8.5"), DB stores numeric | High | Mapper must format prices to match existing UI strings exactly. Store currency format preference. |
| **`distance` field is pre-formatted** — "0.8 km" is a string, not a number | Medium | Compute distance from user location + coordinates, format as string in mapper. |
| **`isOpen` is computed** — currently a static boolean in mock data | Medium | Add `restaurant_hours` table and compute `isOpen` from current time. |
| **`postedAt` is human-readable** — "Tonight", "2h ago", "Just now" | Medium | Store `created_at` as timestamp, compute relative time in mapper. |
| **Stories have different content per language** — not just translations | Medium | Store language-specific stories with `language` column. User stories are language-agnostic. |
| **`reviewCount` and `rating` are denormalized** | Low | Maintain via triggers or compute in RPC. |
| **Mock data has inconsistent `priceRange`** — "€€", "EUR EUR", "EUR" | Low | Normalize to consistent format in DB, map to UI format. |
| **`restaurantById` uses string IDs** — Supabase uses UUID | Medium | Keep string IDs in DB (text PK) or map UUID → string in mapper. Current `restaurants` table uses UUID. |
| **AI chat has no persistence** — messages lost on app restart | Low | Add chat tables in Phase 6. |
| **`AppStateProvider` is unused** — defined but not in App.tsx provider chain | Low | Investigate if onboarding flow is planned. |
| **Empty component directories** — `booking/`, `layout/`, `restaurant/` | Low | Reserved for future component extraction. No impact. |
| **`expo-router` is installed but unused** — app uses React Navigation directly | Low | No migration impact. May be leftover from scaffolding. |

---

## Appendix A: Mock Data as Product Specification

### What the mock data tells us about the database

1. **Restaurants must support nested objects:** todaySpecial (1:1), promotions (1:many), menuSections (1:many), reviews (1:many)
2. **Prices are display strings:** The UI never parses prices — they are shown as-is. The DB can store numerics but the mapper must format them.
3. **Distance is pre-computed:** The UI shows "0.8 km" — this must be computed from coordinates relative to user location or a default point.
4. **Reviews include `timeAgo` as a string:** "2 days ago" — must be computed from `created_at`.
5. **Discovery locations cover all 38 Kosovo municipalities:** This is a complete list — should be seeded as a reference table.
6. **Stories are language-specific with different content:** Not translations — different stories per language.
7. **Tavolina invites link to restaurants optionally:** `restaurantId` is optional — events can be standalone.
8. **Booking dates are relative to "today":** Must be dynamically generated, not hardcoded.
9. **Fun activities have visual properties:** `accentColor` and `backgroundColor` are content, not theme — must be stored in DB.
10. **Profile stats are counts:** "28 saved", "12 stories", "05 events" — derived from user activity, not stored.

---

## Appendix B: File-to-Feature Matrix

| File | Primary Feature | Data Sources Used |
|---|---|---|
| `ActivityDashboardScreen.tsx` | Home/Dashboard | mockData (restaurants, filterRestaurantsByDiscovery), nearbyVibesRestaurants, discovery-state, i18n |
| `MapScreen.tsx` | Explore/Map | mockData (restaurants, filterRestaurantsByDiscovery, getMapRegionForRestaurants, Coordinates, MapRegion), discovery-state, maps.ts |
| `TavolinaScreen.tsx` | Events/Tavolina | mockData (tavolinaInvites, TavolinaInvite), i18n |
| `FavoritesScreen.tsx` | Stories list | stories-state (useStories, StoryItem), i18n |
| `ProfileScreen.tsx` | Profile | AuthProvider (useAuth), i18n, image-uri |
| `RestaurantDetailsScreen.tsx` | Restaurant detail | restaurant-catalog (useRestaurantCatalog), i18n, maps.ts |
| `CategoryScreen.tsx` | Category browse | nearbyVibesRestaurants, discovery-state, restaurant-catalog, maps.ts |
| `BookTableScreen.tsx` | Table booking | mockData (bookingDates, bookingTimes, getRestaurantById), restaurant-catalog, i18n |
| `MarketScreen.tsx` | Marketplace | i18n (inline data) |
| `SettingsScreen.tsx` | Settings | mockData (types: LanguageOption, NotificationOption, QuickLink), AuthProvider, i18n |
| `ProfileEditScreen.tsx` | Profile edit | AuthProvider (useAuth), i18n |
| `StoryDetailScreen.tsx` | Story detail | stories-state (useStories), i18n |
| `CreateStoryScreen.tsx` | Story creation | stories-state (useStories), i18n |
| `SignInScreen.tsx` | Auth sign-in | AuthProvider, validation.ts, errors.ts, i18n |
| `SignUpScreen.tsx` | Auth sign-up | AuthProvider, validation.ts, errors.ts, i18n |
| `HistoryScreen.tsx` | Reservation history | (static) |
| `HelpScreen.tsx` | Help & support | (static) |
| `ExchangeScreen.tsx` | Currency exchange | (static) |
| `ChatAssistantModal.tsx` | AI Assistant | discovery-state (useDiscovery) |
| `StickyAppHeader.tsx` | Global header | discovery-state (location selector) |

---

*End of Sprint 0 Migration Audit. No code was modified. The frontend is the source of truth. Mock data is the product specification.*