-- ============================================================================
-- Sprint 14 — Restaurant Images Storage Bucket
-- ============================================================================
-- Creates: restaurant-images storage bucket with RLS policies
-- Rule: Purely additive. Uses existing place_images table.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Create storage bucket (via raw SQL insert into storage.buckets)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-images',
  'Restaurant Images',
  true,
  10485760, -- 10MB
  '{image/jpeg,image/png,image/webp,image/heic}'
)
on conflict (id) do nothing;

-- ============================================================================
-- 2. RLS policies for the restaurant-images bucket
-- ============================================================================

-- Allow public read access to all objects in the bucket
create policy "Restaurant images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'restaurant-images');

-- Allow authenticated users to upload images for their owned places
create policy "Place owners can upload restaurant images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'restaurant-images'
  and public.is_admin()
  -- Note: we can't validate the owning place at storage insert time
  -- because we don't know the place_id yet. The place_images table
  -- insert is protected by RLS on that table (is_place_owner).
);

-- Allow place owners to delete images
create policy "Place owners can delete restaurant images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'restaurant-images'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.place_images pi
      join public.places p on p.id = pi.place_id
      where pi.image_url = ('https://' || (current_setting('supabase.settings.supabase_url')::text) || '/storage/v1/object/public/restaurant-images/' || storage.objects.name)
        and public.is_place_owner(p.id)
    )
  )
);

-- Allow place owners to update their images (for replacing)
create policy "Place owners can update restaurant images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'restaurant-images'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.place_images pi
      join public.places p on p.id = pi.place_id
      where pi.image_url like '%' || storage.objects.name
        and public.is_place_owner(p.id)
    )
  )
);

commit;