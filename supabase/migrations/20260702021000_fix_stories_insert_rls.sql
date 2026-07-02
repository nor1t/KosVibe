-- ============================================================================
-- Sprint 13.2 — Fix RLS policies
--
-- 1. Stories INSERT: created_by set by trigger, so allow all auth users
-- 2. Events UPDATE: needed for soft-delete
-- 3. Event attendance SELECT: allow anyone to see who joined (for counts & host view)
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

-- Fix event_attendance SELECT: allow anyone to see attendance (for spot counts)
drop policy if exists "Event attendance is viewable by self or admin" on public.event_attendance;
create policy "Event attendance is viewable by all authenticated users"
on public.event_attendance
for select
to authenticated
using (true);

commit;
