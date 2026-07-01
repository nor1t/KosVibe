# Sprint 9 — Platform Services

> **Lead Backend Architect**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Rule:** Backend-only platform services. No screens modified. Existing frontend reuses services through the repository layer.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Created](#2-what-was-created)
3. [Database Migration](#3-database-migration)
4. [Service Modules](#4-service-modules)
5. [Verification Results](#5-verification-results)
6. [What Stays Unchanged](#6-what-stays-unchanged)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Unified notification system (supersedes event_notifications) | Done |
| Notification preferences (per-type, per-channel) | Done |
| Analytics events tracking | Done |
| Recommendation events for personalized feeds | Done |
| Reports/moderation system | Done |
| Audit logs | Done |
| AI retrieval layer (RAG context preparation) | Done |
| Recommendation feeds (personalized, trending, nearby, similar) | Done |
| Keep frontend unchanged | Done |

---

## 2. What Was Created

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701200000_sprint9_platform.sql` | 6 tables + 2 enums + RLS |
| `src/lib/ai-retrieval.ts` | RAG context builders for LLM consumption |
| `src/lib/recommendation-feeds.ts` | Personalized/trending/nearby/similar feed queries |
| `src/lib/platform-services.ts` | Write operations (notifications, analytics, reports, audit) |
| `docs/SPRINT_9_PLATFORM.md` | Sprint documentation |

---

## 3. Database Migration

### New enums

| Enum | Values |
|---|---|
| `notification_channel` | `push`, `in_app`, `email` |
| `report_status` | `pending`, `reviewed`, `resolved`, `dismissed` |

### New tables

| Table | Purpose | Key Columns |
|---|---|---|
| `notifications` | Unified notification system | `user_id`, `type`, `title`, `body`, `data` (jsonb), `is_read`, `channel` |
| `notification_preferences` | Per-user per-type per-channel preferences | `user_id` (unique), 15 boolean columns (5 types × 3 channels) |
| `analytics_events` | User behavior tracking | `user_id`, `event_name`, `properties` (jsonb), `session_id`, `device_info` (jsonb) |
| `recommendation_events` | Interactions for recommendation engines | `user_id`, `action` (view/click/bookmark/book/rate/share/dismiss), `entity_type`, `entity_id`, `context` (jsonb) |
| `reports` | Moderation queue | `reporter_id`, `entity_type`, `entity_id`, `reason`, `description`, `status`, `resolution_note`, `resolved_by`, `resolved_at` |
| `audit_logs` | Detailed data mutation trail | `actor_id`, `action`, `entity_type`, `entity_id`, `changes` (jsonb), `ip_address`, `user_agent` |

All tables follow convention: UUID PKs, timestamps, RLS policies, indexed columns.

---

## 4. Service Modules

### `ai-retrieval.ts` — AI Retrieval Layer

Context builders for RAG (Retrieval-Augmented Generation):

| Function | Purpose |
|---|---|
| `buildRestaurantContext(restaurant)` | Structured text blob: name, cuisine, description, price range, rating, address, hours, today's special, menu items, top 5 reviews |
| `buildSearchContext(query)` | Search results from `search_all` RPC formatted as context |
| `buildEventContext(eventId)` | Event detail from `event_highlights` table |
| `buildRecommendationContext(userId)` | User's saved restaurants + recent interaction history |

These functions do NOT make AI API calls — they prepare the text chunks that an LLM would receive.

### `recommendation-feeds.ts` — Recommendation Feeds

Query helpers using `recommendation_events` and `search_all` RPC:

| Function | Purpose |
|---|---|
| `getPersonalizedFeed(userId, page)` | Restaurants the user hasn't interacted with, sorted by rating |
| `getTrendingFeed(page)` | Top-rated restaurants globally |
| `getNearbyFeed(lat, lng, radiusKm, page)` | Geo-sorted restaurants within radius |
| `getBecauseYouLiked(userId, sourceId, page)` | Similar restaurants excluding seen ones |

### `platform-services.ts` — Platform Write Operations

| Function | Purpose |
|---|---|
| `sendNotification(userId, type, title, body, data, channel)` | Insert notification |
| `markNotificationRead(notificationId)` | Mark as read |
| `getUnreadNotificationCount(userId)` | Count badge |
| `getNotificationPreferences(userId)` | Read preferences |
| `updateNotificationPreference(userId, type, channel, enabled)` | Update single preference |
| `trackAnalyticsEvent(eventName, properties, userId)` | Fire-and-forget analytics |
| `trackScreenView(screenName, userId)` | Screen view shortcut |
| `trackInteraction(action, entityType, entityId, userId)` | Entity interaction shortcut |
| `trackRecommendationEvent(userId, action, entityType, entityId, context)` | Recommendation signal |
| `submitReport(reporterId, entityType, entityId, reason, description)` | Submit moderation report |
| `resolveReport(reportId, resolution, note)` | Admin report resolution |
| `logAudit(actorId, action, entityType, entityId, changes)` | Fire-and-forget audit log |

---

## 5. Verification Results

### TypeScript
```bash
npx tsc --noEmit
PASS — zero errors
```

### Database
```bash
npx supabase db push
> Applying migration 20260701200000_sprint9_platform.sql...
> Finished supabase db push.
PASS
```

---

## 6. What Stays Unchanged

- All screens
- All UI components and styling
- All existing repositories
- All existing providers and hooks
- All screen layouts and visual design

---

## Sprint 9 Complete

Platform services are now in place: a unified notification system with per-type per-channel preferences, analytics and recommendation event tracking, a moderation/report system, audit logging, an AI retrieval layer for RAG context preparation, and recommendation feed query helpers.

These are backend-only services. The existing frontend reuses them through the repository layer with no changes required.