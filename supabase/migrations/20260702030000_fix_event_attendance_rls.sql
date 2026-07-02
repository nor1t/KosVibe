-- ============================================================================
-- Sprint 13 — Fix event_attendance RLS bypass for aggregate queries
-- ============================================================================
-- Problem: getEventAttendees and getAllEventJoinedCounts query
-- event_attendance directly, but the RLS policy restricts SELECT to
-- auth.uid() = user_id, hiding other users' attendance records.
--
-- Solution: SECURITY DEFINER functions that bypass RLS for read-only
-- aggregate operations on event_attendance.
-- ============================================================================

begin;

-- 1. RPC: Get all unique user IDs attending a specific event  
create or replace function public.get_event_attendee_user_ids(event_id_param uuid)
returns table (user_id uuid)
language sql
security definer
set search_path = ''
as $$
  select ea.user_id
  from public.event_attendance ea
  where ea.event_id = event_id_param
    and ea.status = 'joined'
    and ea.deleted_at is null;
$$;

comment on function public.get_event_attendee_user_ids(uuid) is
  'Returns user_ids of all attendees for an event (bypasses RLS for count aggregation).';

-- 2. RPC: Get joined count per event for all events  
create or replace function public.get_all_event_joined_counts()
returns table (event_id uuid, count bigint)
language sql
security definer
set search_path = ''
as $$
  select ea.event_id, count(*)::bigint as count
  from public.event_attendance ea
  where ea.status = 'joined'
    and ea.deleted_at is null
  group by ea.event_id;
$$;

comment on function public.get_all_event_joined_counts() is
  'Returns joined attendance counts per event (bypasses RLS for aggregation).';

-- 3. RPC: Get joined count for a single event
create or replace function public.get_event_joined_count(event_id_param uuid)
returns bigint
language sql
security definer
set search_path = ''
as $$
  select count(*)::bigint
  from public.event_attendance ea
  where ea.event_id = event_id_param
    and ea.status = 'joined'
    and ea.deleted_at is null;
$$;

comment on function public.get_event_joined_count(uuid) is
  'Returns the joined attendee count for a single event (bypasses RLS).';

-- Grant execution to anon and authenticated roles
grant execute on function public.get_event_attendee_user_ids(uuid) to anon, authenticated;
grant execute on function public.get_all_event_joined_counts() to anon, authenticated;
grant execute on function public.get_event_joined_count(uuid) to anon, authenticated;

commit;