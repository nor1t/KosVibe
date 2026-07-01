-- ============================================================================
-- Sprint 12 — Fix RLS for tavolina_events (allow anon inserts)
-- ============================================================================

begin;

-- Drop the old authenticated-only policy
drop policy if exists "Tavolina events are insertable by authenticated users" on public.tavolina_events;

-- Create new policy allowing both anon and authenticated inserts
create policy "Tavolina events are insertable by all users"
on public.tavolina_events
for insert
to anon, authenticated
with check (auth.uid() = created_by or created_by is null);

commit;