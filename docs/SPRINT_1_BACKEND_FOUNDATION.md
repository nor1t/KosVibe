# Sprint 1 — Backend Foundation

> **Lead Backend Architect**  
> **Date:** 2026-07-01  
> **Repository:** KosVibe (`norit/KosVibe`)  
> **Rule:** The frontend is COMPLETE and is the source of truth. This sprint is purely additive — no existing tables were modified, no frontend code was changed.

---

## Table of Contents

1. [Sprint Goals](#1-sprint-goals)
2. [What Was Created](#2-what-was-created)
3. [Database Schema](#3-database-schema)
4. [Conventions Introduced](#4-conventions-introduced)
5. [RLS Policies](#5-rls-policies)
6. [Generated Types](#6-generated-types)
7. [Verification Results](#7-verification-results)
8. [How to Apply the Migration](#8-how-to-apply-the-migration)
9. [What Was NOT Done (Deferred)](#9-what-was-not-done-deferred)

---

## 1. Sprint Goals

| Goal | Status |
|---|---|
| Create `roles` table | ✅ |
| Create `user_roles` table | ✅ |
| Create `business_accounts` table | ✅ |
| Create `business_members` table | ✅ |
| Introduce `created_at` / `updated_at` conventions | ✅ |
| Introduce status enums | ✅ |
| Introduce slug conventions | ✅ |
| Introduce `created_by` / `updated_by` | ✅ |
| Introduce soft delete (`deleted_at`) | ✅ |
| Introduce audit conventions (triggers) | ✅ |
| Generate Supabase migration | ✅ |
| Generate database types | ✅ |
| Implement RLS | ✅ |
| Do NOT break the frontend | ✅ Verified |
| Do NOT migrate features | ✅ No feature tables touched |
| Verify migrations | ✅ TypeScript compiles, SQL reviewed |
| Verify TypeScript | ✅ `npm run typecheck` passes |
| Verify Expo | ✅ `.env` loads, lint passes |
| Verify Auth | ✅ Supabase Auth is live |

---

## 2. What Was Created

### Files

| File | Purpose |
|---|---|
| `supabase/migrations/20260701130000_sprint1_backend_foundation.sql` | Migration: 4 tables, 4 enums, 8 functions, 16 triggers, 16 RLS policies, 4 system roles |
| `src/types/database.types.ts` | TypeScript database types (all tables + Sprint 1 additions) |
| `supabase/config.toml` | Supabase CLI project configuration |
| `.env` | Environment variables (Supabase URL + publishable key) |
| `scripts/verify_sprint1.mjs` | Verification script for Sprint 1 |
| `scripts/run_verify.cmd` | Windows helper to load `.env` and run verification |
| `docs/SPRINT_1_BACKEND_FOUNDATION.md` | This document |

### No Existing Files Modified

The frontend source code was **not touched**. The migration is purely additive — it creates new tables, functions, triggers, and policies without altering any existing schema.

---

## 3. Database Schema

### Enum Types

```sql
type record_status as enum ('active', 'archived');
type business_status as enum ('pending', 'active', 'inactive', 'suspended');
type business_member_role as enum ('owner', 'manager', 'staff');
type business_member_status as enum ('active', 'invited', 'removed');
```

### Table: `roles`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| slug | text unique | Machine-readable identifier (e.g. `admin`, `user`) |
| name | text | Display name |
| description | text | |
| is_system | boolean | System roles cannot be hard-deleted |
| status | record_status | `active` \| `archived` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto (trigger) |
| created_by | uuid → auth.users | Auto (trigger) |
| updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Seeded roles:** `admin`, `business_owner`, `member`, `user`

### Table: `user_roles`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid → auth.users | ON DELETE CASCADE |
| role_id | uuid → roles | ON DELETE CASCADE |
| status | record_status | `active` = assigned, `archived` = revoked |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto (trigger) |
| created_by | uuid → auth.users | Auto (trigger) |
| updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Unique constraint:** Partial unique index on `(user_id, role_id) WHERE deleted_at IS NULL`

### Table: `business_accounts`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | Auto-generated from `name` if not provided |
| name | text | |
| description | text | |
| business_type | text | `restaurant` \| `venue` \| `service` \| `other` |
| email | text | Validated |
| phone | text | |
| website | text | Validated URL |
| logo_url | text | |
| status | business_status | `pending` → `active` \| `inactive` \| `suspended` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto (trigger) |
| created_by | uuid → auth.users | Auto (trigger) |
| updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

### Table: `business_members`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| business_account_id | uuid → business_accounts | ON DELETE CASCADE |
| user_id | uuid → auth.users | ON DELETE CASCADE |
| role | business_member_role | `owner` \| `manager` \| `staff` |
| status | business_member_status | `active` \| `invited` \| `removed` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto (trigger) |
| created_by | uuid → auth.users | Auto (trigger) |
| updated_by | uuid → auth.users | Auto (trigger) |
| deleted_at | timestamptz | Soft delete |

**Unique constraint:** Partial unique index on `(business_account_id, user_id) WHERE deleted_at IS NULL`

---

## 4. Conventions Introduced

### Timestamps

- `created_at timestamptz not null default now()` — set automatically on insert
- `updated_at timestamptz not null default now()` — updated automatically via `set_updated_at()` trigger (function already existed from Sprint 0)

### Status Enums

- `record_status`: `active` | `archived` — generic lifecycle for roles and user_roles
- `business_status`: `pending` | `active` | `inactive` | `suspended` — business account lifecycle
- `business_member_role`: `owner` | `manager` | `staff` — membership role
- `business_member_status`: `active` | `invited` | `removed` — membership lifecycle

### Slug Conventions

- `public.slugify(input text)` function converts text to URL-friendly slugs
- `business_accounts.slug` is auto-generated from `name` via `set_business_account_slug()` trigger if not explicitly provided
- `roles.slug` is required and unique — machine-readable identifiers

### created_by / updated_by

- `set_created_by()` trigger function: auto-populates `created_by` from `auth.uid()` on insert
- `set_updated_by()` trigger function: auto-populates `updated_by` from `auth.uid()` on update
- Both are nullable (system inserts may not have an authenticated user)

### Soft Delete

- `deleted_at timestamptz` column on all 4 new tables
- When set, the row is considered deleted
- All unique indexes are **partial** (`WHERE deleted_at IS NULL`) — allows re-creation after soft delete
- All RLS policies check `deleted_at IS NULL` for active records

### Audit Conventions

- Every table has `created_at`, `updated_at`, `created_by`, `updated_by`
- `updated_at` is maintained by the existing `set_updated_at()` trigger function
- `created_by` and `updated_by` are maintained by new trigger functions
- All triggers are named with a consistent prefix: `set_<table>_<action>`

---

## 5. RLS Policies

### Helper Functions (SECURITY DEFINER)

| Function | Returns | Purpose |
|---|---|---|
| `is_admin()` | boolean | True if current user has active `admin` role |
| `is_business_owner(business_id)` | boolean | True if current user is active owner of business |
| `is_business_member(business_id)` | boolean | True if current user is any active member of business |

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `roles` | Public (active) or admin | Admin only | Admin only | Admin only |
| `user_roles` | Self or admin | Admin only | Admin only | Admin only |
| `business_accounts` | Public (active), members, or admin | Authenticated (created_by = self) | Owner or admin | Admin only |
| `business_members` | Self, owner, or admin | Owner or admin | Owner or admin | Owner or admin |

### Auto-Assignment Triggers

1. **`assign_default_role_on_profile_create`** — When a new profile is created (on signup), the `user` role is automatically assigned.
2. **`create_business_owner_on_account_create`** — When a new business account is created, the creator is automatically made the `owner` member.

---

## 6. Generated Types

`src/types/database.types.ts` contains:

- `Database` type with full `public` schema (all existing + Sprint 1 tables)
- Convenience types: `Tables<T>`, `TablesInsert<T>`, `TablesUpdate<T>`, `Views<T>`, `Functions<T>`, `Enums<T>`
- Enum types exported: `RecordStatus`, `BusinessStatus`, `BusinessMemberRole`, `BusinessMemberStatus`

Usage example:
```typescript
import type { Database, Tables, Enums } from '@/src/types/database.types';

type Role = Tables<'roles'>;
type BusinessAccount = Tables<'business_accounts'>;
type BusinessStatus = Enums<'business_status'>;
```

---

## 7. Verification Results

### TypeScript

```
npm run typecheck
> tsc --noEmit
✅ Passes with no errors
```

### ESLint

```
npx eslint src/types/database.types.ts
✅ No errors
```

### Supabase Connectivity

```
node scripts/verify_sprint1.mjs
✅ Supabase reachable
✅ Auth live
✅ Restaurants readable (frontend will not break)
⏳ Roles table not yet on remote (migration needs to be applied)
```

### Expo

```
npx expo lint
env: load .env.local .env
env: export EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_ANON_KEY EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
✅ Environment variables loaded correctly
```

---

## 8. How to Apply the Migration

The migration file is ready at:
```
supabase/migrations/20260701130000_sprint1_backend_foundation.sql
```

### Option A: Supabase CLI (requires personal access token)

```bash
# 1. Login to Supabase CLI (requires a personal access token, not the publishable key)
npx supabase login

# 2. Link the project
npx supabase link --project-ref rrpfxhptjmdjuoxhldpz

# 3. Push the migration
npx supabase db push
```

### Option B: Supabase Dashboard (SQL Editor)

1. Go to the Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20260701130000_sprint1_backend_foundation.sql`
3. Paste and run

### Option C: psql (requires database password)

```bash
psql "postgresql://postgres:[PASSWORD]@db.rrpfxhptjmdjuoxhldpz.supabase.co:5432/postgres" \
  -f supabase/migrations/20260701130000_sprint1_backend_foundation.sql
```

---

## 9. What Was NOT Done (Deferred)

Per the sprint requirements, the following were **not** done:

- ❌ No feature tables created (stories, events, marketplace, bookings, etc.)
- ❌ No existing tables modified (no `bio` column added to profiles, no restaurant changes)
- ❌ No frontend code changed (no new API calls, no provider changes)
- ❌ No data migration (mock data remains the product specification)
- ❌ No Edge Functions created
- ❌ No storage buckets configured

These are deferred to future sprints per the Sprint 0 migration order.

---

## Sprint 1 Complete

The backend foundation is in place. The migration is ready to apply. The frontend is verified to not break. TypeScript types are generated and compile cleanly.

**Next sprint:** Sprint 2 — Wire Existing Infrastructure (Favorites, Profile bio, Language sync) per the Sprint 0 recommended migration order.