-- ============================================================================
-- Migration: saved_restaurants FK → public.places(id)
--
-- Background
-- The legacy `restaurants` table (seed.sql) has its own UUIDs.
-- The current Places architecture (Sprint 2+) uses `public.places`.
-- The frontend sends `places.id` when saving favorites, so
-- `saved_restaurants.restaurant_id` must reference `public.places(id)`.
--
-- This migration:
--   1. Drops the old FK referencing `public.restaurants(id)` (if it exists)
--   2. Adds the correct FK referencing `public.places(id)`
--   3. Is safe for both new tables (already referencing places) and
--      legacy tables (still referencing restaurants)
--
-- Existing data: the table was recently created and the app was not
-- usable (FK violation), so there is no user data to migrate.
-- If rows exist, they are stale and should be cleaned or were
-- inserted during development with incorrect IDs.
--
-- Note: `create table if not exists` from the earlier migration
-- (20240701000000) only creates the table the FIRST time. If the
-- legacy table was already present, the old FK stayed. This
-- migration fixes that edge case.
-- ============================================================================

begin;

-- Step 1 — Drop the old FK to `restaurants` if it exists.
-- We use a DO-block because constraint names may vary.
do $$
declare
  old_constraint_name text;
begin
  -- Find the FK constraint that references `restaurants`
  select con.conname into old_constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'saved_restaurants'
    and con.contype = 'f'
    and exists (
      select 1 from pg_class ref
      where ref.oid = con.confrelid and ref.relname = 'restaurants'
    );

  if old_constraint_name is not null then
    execute format('alter table public.saved_restaurants drop constraint %I', old_constraint_name);
  end if;
end
$$;

-- Step 2 — Clean any stale rows that reference non-existent `restaurants` IDs.
-- These rows would block the new FK creation.
delete from public.saved_restaurants
where restaurant_id not in (select id from public.places where deleted_at is null);

-- Step 3 — Add the correct FK to `public.places(id)` IF it doesn't already exist.
-- This handles the case where the earlier migration already created
-- the table with the correct FK (fresh project).
do $$
begin
  if not exists (
    select 1 from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'saved_restaurants'
      and con.contype = 'f'
      and exists (
        select 1 from pg_class ref
        where ref.oid = con.confrelid and ref.relname = 'places'
      )
  ) then
    alter table public.saved_restaurants
    add constraint saved_restaurants_restaurant_id_fkey
    foreign key (restaurant_id) references public.places(id) on delete cascade;
  end if;
end
$$;

commit;