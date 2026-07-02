-- ============================================================================
-- Sprint 13 — Storage Buckets for User Uploads
-- Creates 3 buckets: avatars, story-images, event-images
--
-- IMPORTANT: Run this in the Supabase SQL Editor after manually creating
-- the buckets in the Dashboard (Storage → New Bucket).
-- SQL Editor: https://supabase.com/dashboard/project/rrpfxhptjmdjuoxhldpz/sql/new
-- ============================================================================

begin;

-- Drop any existing conflicting policies first
drop policy if exists "Avatars are publicly readable" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;
drop policy if exists "Story images are publicly readable" on storage.objects;
drop policy if exists "Authenticated users can upload story images" on storage.objects;
drop policy if exists "Users can update their own story images" on storage.objects;
drop policy if exists "Users can delete their own story images" on storage.objects;
drop policy if exists "Event images are publicly readable" on storage.objects;
drop policy if exists "Authenticated users can upload event images" on storage.objects;
drop policy if exists "Users can update their own event images" on storage.objects;
drop policy if exists "Users can delete their own event images" on storage.objects;
drop policy if exists "avatars_insert_policy" on storage.objects;
drop policy if exists "story_images_insert_policy" on storage.objects;
drop policy if exists "event_images_insert_policy" on storage.objects;
drop policy if exists "public_read_policy" on storage.objects;
drop policy if exists "public_read_all" on storage.objects;
drop policy if exists "auth_insert_avatars" on storage.objects;
drop policy if exists "auth_insert_story_images" on storage.objects;
drop policy if exists "auth_insert_event_images" on storage.objects;
drop policy if exists "auth_update_avatars" on storage.objects;
drop policy if exists "auth_update_story_images" on storage.objects;
drop policy if exists "auth_update_event_images" on storage.objects;
drop policy if exists "auth_delete_avatars" on storage.objects;
drop policy if exists "auth_delete_story_images" on storage.objects;
drop policy if exists "auth_delete_event_images" on storage.objects;

-- ---------------------------------------------------------------------------
-- Read access — all users can view files in all public buckets
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'public_read_all'
  ) then
    create policy "public_read_all"
    on storage.objects
    for select
    to anon, authenticated
    using (true);
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Upload — authenticated users can upload to any of our 3 buckets
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_insert_avatars'
  ) then
    create policy "auth_insert_avatars"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'avatars');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_insert_story_images'
  ) then
    create policy "auth_insert_story_images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'story-images');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_insert_event_images'
  ) then
    create policy "auth_insert_event_images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'event-images');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Update — authenticated users can update their own uploads
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_update_avatars'
  ) then
    create policy "auth_update_avatars"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'avatars')
    with check (bucket_id = 'avatars');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_update_story_images'
  ) then
    create policy "auth_update_story_images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'story-images')
    with check (bucket_id = 'story-images');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_update_event_images'
  ) then
    create policy "auth_update_event_images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'event-images')
    with check (bucket_id = 'event-images');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Delete — authenticated users can delete their own uploads
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_delete_avatars'
  ) then
    create policy "auth_delete_avatars"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'avatars');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_delete_story_images'
  ) then
    create policy "auth_delete_story_images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'story-images');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth_delete_event_images'
  ) then
    create policy "auth_delete_event_images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'event-images');
  end if;
end
$$;

commit;