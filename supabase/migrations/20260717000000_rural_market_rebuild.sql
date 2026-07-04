-- ============================================================================
-- Rural Market — Complete Rebuild
-- ============================================================================
-- Replaces: marketplace_categories, marketplace_spots, marketplace_sellers,
--           marketplace_collections, marketplace_products
--
-- New architecture:
--   rural_market_categories — expanded category list
--   rural_market_listings   — main listing table (active/sold/archived)
--   rural_market_images     — multiple images per listing (separate table)
--
-- Storage bucket: rural-market-images (public read, authenticated upload)
-- ============================================================================

begin;

-- ============================================================================
-- 0. Drop old marketplace tables (cascade removes policies, triggers, FKs)
-- ============================================================================

drop table if exists public.marketplace_products cascade;
drop table if exists public.marketplace_sellers cascade;
drop table if exists public.marketplace_collections cascade;
drop table if exists public.marketplace_spots cascade;
drop table if exists public.marketplace_categories cascade;

-- ============================================================================
-- 1. rural_market_categories
-- ============================================================================

create table public.rural_market_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label_en text not null,
  label_sq text not null,
  icon_name text not null default 'pricetag-outline',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint rural_market_categories_sort_order_check check (sort_order >= 0)
);

comment on table public.rural_market_categories is 'Rural Market category definitions (bilingual en/sq).';

create trigger set_rural_market_categories_updated_at
  before update on public.rural_market_categories
  for each row execute function public.set_updated_at();

create index rural_market_categories_slug_idx
  on public.rural_market_categories (slug) where deleted_at is null;

-- ============================================================================
-- 2. rural_market_listings
-- ============================================================================

create type public.listing_status as enum ('active', 'sold', 'archived');

create table public.rural_market_listings (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.rural_market_categories (id) on delete restrict,
  title text not null,
  description text not null default '',
  price text not null default '',
  contact_phone text not null default '',
  address text not null default '',
  city text not null default '',
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint rural_market_listings_title_check check (char_length(title) >= 2)
);

comment on table public.rural_market_listings is 'Rural Market product/service listings.';

-- triggers
create trigger set_rural_market_listings_updated_at
  before update on public.rural_market_listings
  for each row execute function public.set_updated_at();

-- indexes
create index rural_market_listings_owner_id_idx
  on public.rural_market_listings (owner_id) where deleted_at is null;

create index rural_market_listings_category_id_idx
  on public.rural_market_listings (category_id) where deleted_at is null;

create index rural_market_listings_status_idx
  on public.rural_market_listings (status) where deleted_at is null;

create index rural_market_listings_city_idx
  on public.rural_market_listings (city) where deleted_at is null;

create index rural_market_listings_created_at_idx
  on public.rural_market_listings (created_at desc) where deleted_at is null and status = 'active';

-- full-text search index (english)
create index rural_market_listings_fts_en_idx
  on public.rural_market_listings
  using gin (to_tsvector('english', title || ' ' || description || ' ' || city))
  where deleted_at is null and status = 'active';

-- ============================================================================
-- 3. rural_market_images
-- ============================================================================

create table public.rural_market_images (
  id uuid primary key default extensions.gen_random_uuid(),
  listing_id uuid not null references public.rural_market_listings (id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint rural_market_images_sort_order_check check (sort_order >= 0)
);

comment on table public.rural_market_images is 'Images per Rural Market listing (stored in rural-market-images bucket).';

create index rural_market_images_listing_id_idx
  on public.rural_market_images (listing_id);

-- ============================================================================
-- 4. Enable RLS
-- ============================================================================

alter table public.rural_market_categories enable row level security;
alter table public.rural_market_listings enable row level security;
alter table public.rural_market_images enable row level security;

-- ============================================================================
-- 5. RLS — rural_market_categories
-- ============================================================================

create policy "Categories are publicly readable"
  on public.rural_market_categories for select
  to anon, authenticated
  using (is_active = true and deleted_at is null);

create policy "Categories are manageable by admin"
  on public.rural_market_categories for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 6. RLS — rural_market_listings
-- ============================================================================

create policy "Active listings are publicly readable"
  on public.rural_market_listings for select
  to anon, authenticated
  using (status = 'active' and deleted_at is null);

create policy "Owners can view all their listings"
  on public.rural_market_listings for select
  to authenticated
  using (owner_id = auth.uid() and deleted_at is null);

create policy "Owners can create listings"
  on public.rural_market_listings for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owners can update their listings"
  on public.rural_market_listings for update
  to authenticated
  using (owner_id = auth.uid() and deleted_at is null)
  with check (owner_id = auth.uid());

create policy "Owners can soft-delete their listings"
  on public.rural_market_listings for delete
  to authenticated
  using (owner_id = auth.uid());

create policy "Admins can manage all listings"
  on public.rural_market_listings for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 7. RLS — rural_market_images
-- ============================================================================

create policy "Images are publicly readable"
  on public.rural_market_images for select
  to anon, authenticated
  using (true);

create policy "Owners can insert images for their listings"
  on public.rural_market_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.rural_market_listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "Owners can delete images of their listings"
  on public.rural_market_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.rural_market_listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "Admins can manage all images"
  on public.rural_market_images for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 8. Seed rural_market_categories
-- ============================================================================

insert into public.rural_market_categories (slug, label_en, label_sq, icon_name, sort_order) values
  ('wine',         'Wine & Rakia',          'Vere & Raki',              'wine-outline',               1),
  ('dairy',        'Dairy & Cheese',        'Bulmet & Djathe',          'nutrition-outline',          2),
  ('honey',        'Honey & Preserves',     'Mjalte & Konserva',        'flask-outline',              3),
  ('fruits',       'Fruits & Vegetables',   'Fruta & Perime',           'leaf-outline',               4),
  ('herbs',        'Herbs & Tea',           'Bime & Caj',               'flower-outline',             5),
  ('meat',         'Meat & Eggs',           'Mish & Veze',              'restaurant-outline',         6),
  ('craft',        'Handmade Crafts',       'Artizanat',                'hammer-outline',             7),
  ('wood',         'Wood Products',         'Produkte Druri',           'cube-outline',               8),
  ('textile',      'Textiles & Clothing',   'Tekstile & Veshje',        'shirt-outline',              9),
  ('traditional',  'Traditional Food',      'Ushqime Tradicionale',     'fast-food-outline',         10),
  ('other',        'Other',                 'Tjera',                    'pricetag-outline',          99)
on conflict (slug) do update set
  label_en = excluded.label_en, label_sq = excluded.label_sq,
  icon_name = excluded.icon_name, sort_order = excluded.sort_order,
  updated_at = now();

commit;