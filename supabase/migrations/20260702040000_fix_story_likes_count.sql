-- ============================================================================
-- Sprint 14 — Fix story likes count syncing
-- ============================================================================
-- Problem: When users like/unlike a story, the story_likes table is updated
-- but the stories.likes_count column is never incremented/decremented.
-- This means the like count shown in the UI is always stale (seed data).
--
-- Solution: SECURITY DEFINER RPC functions that atomically update
-- likes_count on the stories table.
-- ============================================================================

begin;

-- 1. Increment likes_count for a story
create or replace function public.increment_story_likes_count(story_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.stories
  set likes_count = coalesce(likes_count, 0) + 1,
      updated_at = now()
  where id = story_id_param
    and deleted_at is null;
$$;

comment on function public.increment_story_likes_count(uuid) is
  'Atomically increments the likes_count for a story (bypasses RLS).';

-- 2. Decrement likes_count for a story (floor at 0)
create or replace function public.decrement_story_likes_count(story_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.stories
  set likes_count = greatest(coalesce(likes_count, 0) - 1, 0),
      updated_at = now()
  where id = story_id_param
    and deleted_at is null;
$$;

comment on function public.decrement_story_likes_count(uuid) is
  'Atomically decrements the likes_count for a story, floor at 0 (bypasses RLS).';

-- Grant execution to authenticated roles
grant execute on function public.increment_story_likes_count(uuid) to authenticated;
grant execute on function public.decrement_story_likes_count(uuid) to authenticated;

commit;