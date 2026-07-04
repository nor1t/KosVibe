-- ============================================================================
-- Fix: Storage INSERT policy only allows is_admin() — blocks business owners
-- ============================================================================
-- Root cause: Migration 20260705 created an INSERT policy on storage.objects
-- that only permits is_admin(). Business owners (who pass is_place_owner)
-- were blocked from uploading gallery images.
-- ============================================================================

begin;

-- Drop the old admin-only policy
drop policy if exists "Place owners can upload restaurant images" on storage.objects;

-- Create new policy allowing any authenticated user to upload
-- (the place_images table INSERT is separately protected by is_place_owner RLS)
create policy "Authenticated users can upload restaurant images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'restaurant-images');

commit;