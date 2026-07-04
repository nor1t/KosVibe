-- ============================================================================
-- Rural Market — Storage Bucket Policies
-- ============================================================================
-- Creates storage.objects policies for the rural-market-images bucket.
-- The bucket must already exist (created via Dashboard or setup script).
-- ============================================================================

begin;

-- Ensure bucket exists in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rural-market-images',
  'Rural Market Images',
  true,
  10485760, -- 10MB
  '{image/jpeg,image/png,image/webp,image/heic}'
)
on conflict (id) do nothing;

-- Policy 1: Anyone can view images (public bucket)
create policy "Rural market images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'rural-market-images');

-- Policy 2: Any authenticated user can upload
-- (the DB RLS on rural_market_images validates listing ownership)
create policy "Authenticated users can upload rural market images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'rural-market-images');

-- Policy 3: Listing owners and admins can delete images
create policy "Listing owners can delete rural market images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'rural-market-images'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.rural_market_images rmi
      join public.rural_market_listings rml on rml.id = rmi.listing_id
      where rmi.storage_path = storage.objects.name
        and rml.owner_id = auth.uid()
        and rml.deleted_at is null
    )
  )
);

commit;