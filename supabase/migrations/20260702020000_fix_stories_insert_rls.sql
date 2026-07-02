-- ============================================================================
-- Sprint 13.2 — Fix stories INSERT RLS + events UPDATE RLS
--
-- 1. Stories: The old policy checked auth.uid() = created_by, but created_by
--    is set by a trigger. RLS with-check runs BEFORE triggers, so created_by
--    was always NULL at check time.
-- 2. Events: No UPDATE policy existed, so soft-delete (set deleted_at) was
--    blocked by RLS.
-- ============================================================================

begin;

-- Drop the old INSERT policy for stories
drop policy if exists "Stories are insertable by authenticated users" on public.stories;

-- Allow any authenticated user to insert a story
create policy "Stories are insertable by authenticated users"
on public.stories
for insert
to authenticated
with check (true);

-- Drop old event-related policies if they exist
drop policy if exists "Tavolina events are insertable by all users" on public.tavolina_events;
drop policy if exists "Tavolina events are updatable by the creator" on public.tavolina_events;

-- Ensure tavolina_events has an insert policy (may have been dropped)
create policy "Tavolina events are insertable by all users"
on public.tavolina_events
for insert
to anon, authenticated
with check (true);

-- Allow the event creator to update their events (needed for soft-delete)
create policy "Tavolina events are updatable by the creator"
on public.tavolina_events
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

commit;
