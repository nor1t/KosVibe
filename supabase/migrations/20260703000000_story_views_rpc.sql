-- ============================================================================
-- Sprint 16 — Story views tracking RPC
-- ============================================================================
-- Problem: views_count on stories is never incremented when a story is opened.
-- Solution: SECURITY DEFINER RPC function that atomically increments
-- views_count (bypasses RLS so any reader can increment views).
-- ============================================================================

begin;

create or replace function public.increment_story_views(story_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.stories
  set views_count = coalesce(views_count, 0) + 1,
      updated_at = now()
  where id = story_id_param
    and deleted_at is null;
$$;

comment on function public.increment_story_views(uuid) is
  'Atomically increments the views_count for a story (bypasses RLS).';

grant execute on function public.increment_story_views(uuid) to authenticated;
grant execute on function public.increment_story_views(uuid) to anon;

commit;