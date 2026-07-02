-- ============================================================================
-- Sprint 15 — Enable Supabase Realtime for live sync
-- ============================================================================
-- Enables Postgres change events on tavolina_events and stories tables
-- so all connected clients receive instant updates when events/stories
-- are created, updated, or deleted.
-- ============================================================================

begin;

-- Add tavolina_events to the supabase_realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tavolina_events'
  ) then
    alter publication supabase_realtime add table public.tavolina_events;
  end if;
end
$$;

-- Add stories to the supabase_realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'stories'
  ) then
    alter publication supabase_realtime add table public.stories;
  end if;
end
$$;

commit;