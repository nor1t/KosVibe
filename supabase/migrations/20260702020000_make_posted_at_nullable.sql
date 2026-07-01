-- ============================================================================
-- Migration: Make posted_at nullable — created_at is the canonical timestamp
--
-- Background
-- The `stories` table has `created_at timestamptz` which auto-populates on
-- insert. The `posted_at` column was a legacy text field defaulting to
-- "Just now". The application now derives `postedAt` from `created_at` at
-- runtime. `posted_at` is no longer used by any code path.
--
-- This migration:
--   1. Drops the NOT NULL constraint on posted_at
--   2. Drops the default value so future inserts don't get "Just now"
--   3. Preserves existing data (old rows keep their posted_at text)
--
-- After this migration:
--   - New rows: posted_at is NULL, created_at is the real timestamp
--   - Old rows: posted_at retains "Just now" or whatever was stored
--   - The application reads created_at for relative time display
--   - The application reads posted_at only as a fallback in buildStory()
-- ============================================================================

begin;

-- Step 1 — Drop the NOT NULL constraint
alter table public.stories alter column posted_at drop not null;

-- Step 2 — Drop the default value
alter table public.stories alter column posted_at drop default;

commit;