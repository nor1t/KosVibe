-- ============================================================================
-- Sprint 2 — Places Architecture
-- ============================================================================
-- Refactors the backend so the application becomes place-centered.
--
-- Creates:
--   places                  — central place entity (restaurants, venues, etc.)
--   cities                  — normalized Kosovo municipalities
--   place_categories        — category definitions
--   place_category_links    — many-to-many places ↔ categories
--   place_images            — ordered image galleries per place
--   place_hours             — weekly opening hours per place
--   place_contacts          — contact channels (phone, email, website, social)
--   tags                    — reusable tag definitions
--   place_tags              — many-to-many places ↔ tags
--   restaurant_profiles     — restaurant-specific extension of a place
--
-- Preserves the existing `restaurants` table and related tables untouched.
-- Adds compatibility views so legacy `restaurants` consumers keep working
-- while the migration is in progress.
--
-- Rule: Purely additive — no existing tables are modified, no frontend code
--       is changed. Screens are NOT touched.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enum types
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'place_status') then
    create type public.place_status as enum ('draft', 'active', 'inactive', 'archived');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'place_kind') then
    create type public.place_kind as enum ('restaurant', 'cafe', 'bar', 'venue', 'attraction', 'hotel', 'shop', 'other');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_kind') then
    create type public.contact_kind as enum ('phone', 'email', 'website', 'instagram', 'facebook', 'tiktok', 'x', 'other');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'day_of_week') then
    create type public.day_of_week as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  end if;
end
$$;

-- ============================================================================
-- 2. cities table
-- ============================================================================

create or replace function public.set_city_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = public.slugify(new.name);
  end if;
  return new;
end;
$$;

comment on function public.set_city_slug is 'Trigger function — auto-generates a slug from name if not provided.';

create table public.cities (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_sq text,
  region text,
  country text not null default 'Kosovo',
  latitude numeric(9,6),
  longitude numeric(9,6),
  default_zoom numeric(4,2) not null default 0.11,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint cities_latitude_check
    check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint cities_longitude_check
    check (longitude is null or (longitude >= -180 and longitude <= 180)),
  constraint cities_sort_order_check
    check (sort_order >= 0)
);

comment on table public.cities is 'Normalized Kosovo municipalities used for discovery and place assignment.';
comment on column public.cities.slug is 'URL-friendly identifier (auto-generated from name if not provided).';
comment on column public.cities.name_sq is 'Optional Albanian-language name for the city.';
comment on column public.cities.default_zoom is 'Default map zoom delta for the city region.';
comment on column public.cities.deleted_at is 'Soft-delete timestamp — when set, the city is considered deleted.';

create trigger set_city_slug
  before insert on public.cities
  for each row execute function public.set_city_slug();

create trigger set_cities_created_by
  before insert on public.cities
  for each row execute function public.set_created_by();

create trigger set_cities_updated_by
  before update on public.cities
  for each row execute function public.set_updated_by();

create trigger set_cities_updated_at
  before update on public.cities
  for each row execute function public.set_updated_at();

create index cities_slug_idx on public.cities (slug) where deleted_at is null;
create index cities_active_idx on public.cities (is_active) where deleted_at is null and is_active = true;
create index cities_sort_order_idx on public.cities (sort_order) where deleted_at is null;

-- ============================================================================
-- 3. place_categories table
-- ============================================================================

create or replace function public.set_place_category_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = public.slugify(new.name);
  end if;
  return new;
end;
$$;

comment on function public.set_place_category_slug is 'Trigger function — auto-generates a slug from name if not provided.';

create table public.place_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_sq text,
  description text,
  icon text,
  accent_color text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint place_categories_sort_order_check
    check (sort_order >= 0)
);

comment on table public.place_categories is 'Category definitions for places (e.g. Restaurants, Hiking, Party, Culture, Study).';
comment on column public.place_categories.slug is 'URL-friendly identifier (auto-generated from name if not provided).';
comment on column public.place_categories.icon is 'Optional Ionicons icon name used by the UI.';
comment on column public.place_categories.accent_color is 'Optional hex accent color used by the UI.';
comment on column public.place_categories.deleted_at is 'Soft-delete timestamp — when set, the category is considered deleted.';

create trigger set_place_category_slug
  before insert on public.place_categories
  for each row execute function public.set_place_category_slug();

create trigger set_place_categories_created_by
  before insert on public.place_categories
  for each row execute function public.set_created_by();

create trigger set_place_categories_updated_by
  before update on public.place_categories
  for each row execute function public.set_updated_by();

create trigger set_place_categories_updated_at
  before update on public.place_categories
  for each row execute function public.set_updated_at();

create index place_categories_slug_idx on public.place_categories (slug) where deleted_at is null;
create index place_categories_active_idx on public.place_categories (is_active) where deleted_at is null and is_active = true;
create index place_categories_sort_order_idx on public.place_categories (sort_order) where deleted_at is null;

-- ============================================================================
-- 4. places table (the central entity)
-- ============================================================================

create or replace function public.set_place_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = public.slugify(new.name);
  end if;
  return new;
end;
$$;

comment on function public.set_place_slug is 'Trigger function — auto-generates a slug from name if not provided.';

create table public.places (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  kind public.place_kind not null default 'restaurant',
  city_id uuid references public.cities (id) on delete set null,
  city text,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  price_range text,
  rating numeric(2,1),
  review_count int not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  status public.place_status not null default 'active',
  business_account_id uuid references public.business_accounts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint places_rating_check
    check (rating is null or (rating >= 0 and rating <= 5)),
  constraint places_latitude_check
    check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint places_longitude_check
    check (longitude is null or (longitude >= -180 and longitude <= 180)),
  constraint places_review_count_check
    check (review_count >= 0)
);

comment on table public.places is 'Central place entity — restaurants, cafes, venues, attractions, etc.';
comment on column public.places.slug is 'URL-friendly identifier (auto-generated from name if not provided).';
comment on column public.places.kind is 'Place kind: restaurant | cafe | bar | venue | attraction | hotel | shop | other.';
comment on column public.places.city_id is 'Foreign key to cities. city text is kept as denormalized fallback for legacy compatibility.';
comment on column public.places.city is 'Denormalized city name — kept for compatibility with the legacy restaurants table shape.';
comment on column public.places.status is 'Lifecycle: draft → active | inactive | archived.';
comment on column public.places.business_account_id is 'Optional owning business account.';
comment on column public.places.deleted_at is 'Soft-delete timestamp — when set, the place is considered deleted.';

create trigger set_place_slug
  before insert on public.places
  for each row execute function public.set_place_slug();

create trigger set_places_created_by
  before insert on public.places
  for each row execute function public.set_created_by();

create trigger set_places_updated_by
  before update on public.places
  for each row execute function public.set_updated_by();

create trigger set_places_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

create index places_slug_idx on public.places (slug) where deleted_at is null;
create index places_city_id_idx on public.places (city_id) where deleted_at is null;
create index places_city_idx on public.places (city) where deleted_at is null;
create index places_kind_idx on public.places (kind) where deleted_at is null;
create index places_status_idx on public.places (status) where deleted_at is null;
create index places_published_idx on public.places (is_published) where deleted_at is null and is_published = true;
create index places_featured_idx on public.places (is_featured) where deleted_at is null and is_featured = true;
create index places_business_account_id_idx on public.places (business_account_id) where deleted_at is null;

-- ============================================================================
-- 5. place_category_links table (many-to-many)
-- ============================================================================

create table public.place_category_links (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  category_id uuid not null references public.place_categories (id) on delete cascade,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint place_category_links_sort_order_check
    check (sort_order >= 0)
);

comment on table public.place_category_links is 'Junction table linking places to one or more categories.';
comment on column public.place_category_links.is_primary is 'Marks the primary category for a place (a place should have at most one primary).';
comment on column public.place_category_links.deleted_at is 'Soft-delete timestamp — when set, the link is considered removed.';

-- Partial unique index: a place can have at most one active link per category.
create unique index place_category_links_place_id_category_id_idx
  on public.place_category_links (place_id, category_id)
  where deleted_at is null;

-- Partial unique index: a place can have at most one primary category.
create unique index place_category_links_place_id_primary_idx
  on public.place_category_links (place_id)
  where deleted_at is null and is_primary = true;

create trigger set_place_category_links_created_by
  before insert on public.place_category_links
  for each row execute function public.set_created_by();

create trigger set_place_category_links_updated_by
  before update on public.place_category_links
  for each row execute function public.set_updated_by();

create trigger set_place_category_links_updated_at
  before update on public.place_category_links
  for each row execute function public.set_updated_at();

create index place_category_links_place_id_idx on public.place_category_links (place_id) where deleted_at is null;
create index place_category_links_category_id_idx on public.place_category_links (category_id) where deleted_at is null;

-- ============================================================================
-- 6. place_images table
-- ============================================================================

create table public.place_images (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint place_images_sort_order_check
    check (sort_order >= 0),
  constraint place_images_image_url_check
    check (image_url is null or image_url ~* '^https?://')
);

comment on table public.place_images is 'Ordered image gallery entries for places.';
comment on column public.place_images.is_primary is 'Marks the primary/hero image for a place (at most one per place).';
comment on column public.place_images.deleted_at is 'Soft-delete timestamp — when set, the image is considered removed.';

-- Partial unique index: a place can have at most one primary image.
create unique index place_images_place_id_primary_idx
  on public.place_images (place_id)
  where deleted_at is null and is_primary = true;

create trigger set_place_images_created_by
  before insert on public.place_images
  for each row execute function public.set_created_by();

create trigger set_place_images_updated_by
  before update on public.place_images
  for each row execute function public.set_updated_by();

create trigger set_place_images_updated_at
  before update on public.place_images
  for each row execute function public.set_updated_at();

create index place_images_place_id_sort_order_idx on public.place_images (place_id, sort_order) where deleted_at is null;

-- ============================================================================
-- 7. place_hours table
-- ============================================================================

create table public.place_hours (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  day_of_week public.day_of_week not null,
  open_time text,
  close_time text,
  is_closed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint place_hours_sort_order_check
    check (sort_order >= 0),
  constraint place_hours_open_time_check
    check (open_time is null or open_time ~* '^[0-2]?[0-9]:[0-5][0-9]$'),
  constraint place_hours_close_time_check
    check (close_time is null or close_time ~* '^[0-2]?[0-9]:[0-5][0-9]$')
);

comment on table public.place_hours is 'Weekly opening hours for places (one row per day of week).';
comment on column public.place_hours.day_of_week is 'Day of week: mon | tue | wed | thu | fri | sat | sun.';
comment on column public.place_hours.open_time is 'Opening time as "HH:MM" (24h). Null when is_closed.';
comment on column public.place_hours.close_time is 'Closing time as "HH:MM" (24h). Null when is_closed.';
comment on column public.place_hours.is_closed is 'When true, the place is closed on this day.';
comment on column public.place_hours.deleted_at is 'Soft-delete timestamp — when set, the row is considered removed.';

-- Partial unique index: a place can have at most one active row per day.
create unique index place_hours_place_id_day_of_week_idx
  on public.place_hours (place_id, day_of_week)
  where deleted_at is null;

create trigger set_place_hours_created_by
  before insert on public.place_hours
  for each row execute function public.set_created_by();

create trigger set_place_hours_updated_by
  before update on public.place_hours
  for each row execute function public.set_updated_by();

create trigger set_place_hours_updated_at
  before update on public.place_hours
  for each row execute function public.set_updated_at();

create index place_hours_place_id_idx on public.place_hours (place_id) where deleted_at is null;

-- ============================================================================
-- 8. place_contacts table
-- ============================================================================

create table public.place_contacts (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  kind public.contact_kind not null,
  value text not null,
  label text,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint place_contacts_sort_order_check
    check (sort_order >= 0),
  constraint place_contacts_website_check
    check ((kind <> 'website') or value ~* '^https?://'),
  constraint place_contacts_email_check
    check ((kind <> 'email') or value ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

comment on table public.place_contacts is 'Contact channels for places (phone, email, website, social).';
comment on column public.place_contacts.kind is 'Contact kind: phone | email | website | instagram | facebook | tiktok | x | other.';
comment on column public.place_contacts.is_primary is 'Marks the primary contact of a given kind for a place.';
comment on column public.place_contacts.deleted_at is 'Soft-delete timestamp — when set, the contact is considered removed.';

-- Partial unique index: a place can have at most one primary contact per kind.
create unique index place_contacts_place_id_kind_primary_idx
  on public.place_contacts (place_id, kind)
  where deleted_at is null and is_primary = true;

create trigger set_place_contacts_created_by
  before insert on public.place_contacts
  for each row execute function public.set_created_by();

create trigger set_place_contacts_updated_by
  before update on public.place_contacts
  for each row execute function public.set_updated_by();

create trigger set_place_contacts_updated_at
  before update on public.place_contacts
  for each row execute function public.set_updated_at();

create index place_contacts_place_id_idx on public.place_contacts (place_id) where deleted_at is null;
create index place_contacts_kind_idx on public.place_contacts (kind) where deleted_at is null;

-- ============================================================================
-- 9. tags table
-- ============================================================================

create or replace function public.set_tag_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = public.slugify(new.name);
  end if;
  return new;
end;
$$;

comment on function public.set_tag_slug is 'Trigger function — auto-generates a slug from name if not provided.';

create table public.tags (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_sq text,
  description text,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.tags is 'Reusable tag definitions that can be attached to places.';
comment on column public.tags.slug is 'URL-friendly identifier (auto-generated from name if not provided).';
comment on column public.tags.is_system is 'System tags are seeded by migrations and cannot be hard-deleted.';
comment on column public.tags.deleted_at is 'Soft-delete timestamp — when set, the tag is considered deleted.';

create trigger set_tag_slug
  before insert on public.tags
  for each row execute function public.set_tag_slug();

create trigger set_tags_created_by
  before insert on public.tags
  for each row execute function public.set_created_by();

create trigger set_tags_updated_by
  before update on public.tags
  for each row execute function public.set_updated_by();

create trigger set_tags_updated_at
  before update on public.tags
  for each row execute function public.set_updated_at();

create index tags_slug_idx on public.tags (slug) where deleted_at is null;
create index tags_active_idx on public.tags (is_active) where deleted_at is null and is_active = true;

-- ============================================================================
-- 10. place_tags table (many-to-many)
-- ============================================================================

create table public.place_tags (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint place_tags_sort_order_check
    check (sort_order >= 0)
);

comment on table public.place_tags is 'Junction table linking places to tags.';
comment on column public.place_tags.deleted_at is 'Soft-delete timestamp — when set, the link is considered removed.';

-- Partial unique index: a place can have at most one active link per tag.
create unique index place_tags_place_id_tag_id_idx
  on public.place_tags (place_id, tag_id)
  where deleted_at is null;

create trigger set_place_tags_created_by
  before insert on public.place_tags
  for each row execute function public.set_created_by();

create trigger set_place_tags_updated_by
  before update on public.place_tags
  for each row execute function public.set_updated_by();

create trigger set_place_tags_updated_at
  before update on public.place_tags
  for each row execute function public.set_updated_at();

create index place_tags_place_id_idx on public.place_tags (place_id) where deleted_at is null;
create index place_tags_tag_id_idx on public.place_tags (tag_id) where deleted_at is null;

-- ============================================================================
-- 11. restaurant_profiles table (place extension)
-- ============================================================================

create table public.restaurant_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null unique references public.places (id) on delete cascade,
  cuisine text,
  tagline text,
  hours_text text,
  is_open_now boolean not null default true,
  reservation_enabled boolean not null default false,
  delivery_enabled boolean not null default false,
  takeaway_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.restaurant_profiles is 'Restaurant-specific extension of a place (1:1 with places where kind = restaurant).';
comment on column public.restaurant_profiles.place_id is 'The place this profile extends (unique, 1:1).';
comment on column public.restaurant_profiles.cuisine is 'Cuisine label (e.g. "Italian", "Traditional").';
comment on column public.restaurant_profiles.tagline is 'Short marketing tagline.';
comment on column public.restaurant_profiles.hours_text is 'Pre-formatted hours string for legacy UI compatibility (e.g. "11:00 - 23:00").';
comment on column public.restaurant_profiles.is_open_now is 'Denormalized open status — should be maintained from place_hours.';
comment on column public.restaurant_profiles.deleted_at is 'Soft-delete timestamp — when set, the profile is considered removed.';

create trigger set_restaurant_profiles_created_by
  before insert on public.restaurant_profiles
  for each row execute function public.set_created_by();

create trigger set_restaurant_profiles_updated_by
  before update on public.restaurant_profiles
  for each row execute function public.set_updated_by();

create trigger set_restaurant_profiles_updated_at
  before update on public.restaurant_profiles
  for each row execute function public.set_updated_at();

create index restaurant_profiles_place_id_idx on public.restaurant_profiles (place_id) where deleted_at is null;
create index restaurant_profiles_cuisine_idx on public.restaurant_profiles (cuisine) where deleted_at is null;

-- ============================================================================
-- 12. RLS helper functions
-- ============================================================================

-- is_place_owner: returns true if the current user owns the business account
-- linked to the given place, or is an admin.
create or replace function public.is_place_owner(place_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    public.is_admin()
    or (
      exists (
        select 1
        from public.places p
        left join public.business_members bm
          on bm.business_account_id = p.business_account_id
         and bm.user_id = auth.uid()
         and bm.status = 'active'
         and bm.deleted_at is null
        where p.id = place_id
          and p.deleted_at is null
          and bm.id is not null
      )
    );
$$;

comment on function public.is_place_owner is 'Returns true if the current user is an active member of the business account owning the place, or is an admin.';

-- ============================================================================
-- 13. Enable RLS on all new tables
-- ============================================================================

alter table public.cities enable row level security;
alter table public.place_categories enable row level security;
alter table public.places enable row level security;
alter table public.place_category_links enable row level security;
alter table public.place_images enable row level security;
alter table public.place_hours enable row level security;
alter table public.place_contacts enable row level security;
alter table public.tags enable row level security;
alter table public.place_tags enable row level security;
alter table public.restaurant_profiles enable row level security;

-- ============================================================================
-- 14. RLS policies — cities
-- ============================================================================

create policy "Active cities are publicly readable"
on public.cities
for select
to anon, authenticated
using (
  (is_active = true and deleted_at is null)
  or public.is_admin()
);

create policy "Cities are insertable by admin"
on public.cities
for insert
to authenticated
with check (public.is_admin());

create policy "Cities are updatable by admin"
on public.cities
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Cities are deletable by admin"
on public.cities
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 15. RLS policies — place_categories
-- ============================================================================

create policy "Active place categories are publicly readable"
on public.place_categories
for select
to anon, authenticated
using (
  (is_active = true and deleted_at is null)
  or public.is_admin()
);

create policy "Place categories are insertable by admin"
on public.place_categories
for insert
to authenticated
with check (public.is_admin());

create policy "Place categories are updatable by admin"
on public.place_categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Place categories are deletable by admin"
on public.place_categories
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 16. RLS policies — places
-- ============================================================================

create policy "Published places are publicly readable"
on public.places
for select
to anon, authenticated
using (
  (is_published = true and deleted_at is null)
  or public.is_place_owner(id)
  or public.is_admin()
);

create policy "Places are insertable by authenticated users"
on public.places
for insert
to authenticated
with check (
  created_by = auth.uid()
  or public.is_admin()
);

create policy "Places are updatable by owner or admin"
on public.places
for update
to authenticated
using (public.is_place_owner(id))
with check (public.is_place_owner(id));

create policy "Places are deletable by admin"
on public.places
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 17. RLS policies — place_category_links
-- ============================================================================

create policy "Place category links are readable when parent place is readable"
on public.place_category_links
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = place_category_links.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place category links are insertable by place owner or admin"
on public.place_category_links
for insert
to authenticated
with check (
  public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place category links are updatable by place owner or admin"
on public.place_category_links
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Place category links are deletable by place owner or admin"
on public.place_category_links
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 18. RLS policies — place_images
-- ============================================================================

create policy "Place images are readable when parent place is published"
on public.place_images
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = place_images.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place images are insertable by place owner or admin"
on public.place_images
for insert
to authenticated
with check (
  public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place images are updatable by place owner or admin"
on public.place_images
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Place images are deletable by place owner or admin"
on public.place_images
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 19. RLS policies — place_hours
-- ============================================================================

create policy "Place hours are readable when parent place is published"
on public.place_hours
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = place_hours.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place hours are insertable by place owner or admin"
on public.place_hours
for insert
to authenticated
with check (
  public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place hours are updatable by place owner or admin"
on public.place_hours
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Place hours are deletable by place owner or admin"
on public.place_hours
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 20. RLS policies — place_contacts
-- ============================================================================

create policy "Place contacts are readable when parent place is published"
on public.place_contacts
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = place_contacts.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place contacts are insertable by place owner or admin"
on public.place_contacts
for insert
to authenticated
with check (
  public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place contacts are updatable by place owner or admin"
on public.place_contacts
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Place contacts are deletable by place owner or admin"
on public.place_contacts
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 21. RLS policies — tags
-- ============================================================================

create policy "Active tags are publicly readable"
on public.tags
for select
to anon, authenticated
using (
  (is_active = true and deleted_at is null)
  or public.is_admin()
);

create policy "Tags are insertable by admin"
on public.tags
for insert
to authenticated
with check (public.is_admin());

create policy "Tags are updatable by admin"
on public.tags
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Tags are deletable by admin"
on public.tags
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 22. RLS policies — place_tags
-- ============================================================================

create policy "Place tags are readable when parent place is published"
on public.place_tags
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = place_tags.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place tags are insertable by place owner or admin"
on public.place_tags
for insert
to authenticated
with check (
  public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Place tags are updatable by place owner or admin"
on public.place_tags
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Place tags are deletable by place owner or admin"
on public.place_tags
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 23. RLS policies — restaurant_profiles
-- ============================================================================

create policy "Restaurant profiles are readable when parent place is published"
on public.restaurant_profiles
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = restaurant_profiles.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Restaurant profiles are insertable by place owner or admin"
on public.restaurant_profiles
for insert
to authenticated
with check (
  public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Restaurant profiles are updatable by place owner or admin"
on public.restaurant_profiles
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Restaurant profiles are deletable by place owner or admin"
on public.restaurant_profiles
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 24. Compatibility views
-- ============================================================================
-- These views expose the new place-centered schema through the legacy
-- `restaurants`-shaped interface so existing consumers (e.g. the
-- restaurant_catalog view, the RestaurantCatalogProvider) keep working
-- during the migration window. They are read-only.
-- ============================================================================

-- place_catalog: published places with primary image, primary category,
-- and restaurant profile (if any). Mirrors the restaurant_catalog shape.
create or replace view public.place_catalog as
select
  p.id,
  p.slug,
  p.name,
  p.description,
  coalesce(p.city, c.name) as city,
  p.address,
  rp.cuisine,
  p.price_range,
  p.rating,
  p.latitude,
  p.longitude,
  pc_phone.value as phone,
  pc_website.value as website,
  p.is_featured,
  (
    select pi.image_url
    from public.place_images pi
    where pi.place_id = p.id
      and pi.deleted_at is null
    order by pi.is_primary desc, pi.sort_order asc
    limit 1
  ) as image_url,
  p.kind,
  p.city_id,
  p.status
from public.places p
left join public.cities c on c.id = p.city_id
left join public.restaurant_profiles rp on rp.place_id = p.id and rp.deleted_at is null
left join lateral (
  select pc.value
  from public.place_contacts pc
  where pc.place_id = p.id
    and pc.kind = 'phone'
    and pc.deleted_at is null
  order by pc.is_primary desc, pc.sort_order asc
  limit 1
) pc_phone on true
left join lateral (
  select pc.value
  from public.place_contacts pc
  where pc.place_id = p.id
    and pc.kind = 'website'
    and pc.deleted_at is null
  order by pc.is_primary desc, pc.sort_order asc
  limit 1
) pc_website on true
where p.is_published = true
  and p.deleted_at is null;

comment on view public.place_catalog is 'Published place cards with primary image, phone, website, and restaurant profile for the app catalog.';

-- restaurants_compat: a compatibility view that exposes the new places
-- schema through the exact column shape of the legacy `restaurants` table.
-- This allows the existing restaurant_catalog view and any legacy queries
-- to continue functioning while data is migrated to the place-centered model.
create or replace view public.restaurants_compat as
select
  p.id,
  p.slug,
  p.name,
  p.description,
  coalesce(p.city, c.name) as city,
  p.address,
  rp.cuisine,
  p.price_range,
  p.rating,
  p.latitude,
  p.longitude,
  pc_phone.value as phone,
  pc_website.value as website,
  p.is_featured,
  p.is_published,
  p.created_at,
  p.updated_at
from public.places p
left join public.cities c on c.id = p.city_id
left join public.restaurant_profiles rp on rp.place_id = p.id and rp.deleted_at is null
left join lateral (
  select pc.value
  from public.place_contacts pc
  where pc.place_id = p.id
    and pc.kind = 'phone'
    and pc.deleted_at is null
  order by pc.is_primary desc, pc.sort_order asc
  limit 1
) pc_phone on true
left join lateral (
  select pc.value
  from public.place_contacts pc
  where pc.place_id = p.id
    and pc.kind = 'website'
    and pc.deleted_at is null
  order by pc.is_primary desc, pc.sort_order asc
  limit 1
) pc_website on true
where p.kind = 'restaurant'
  and p.deleted_at is null;

comment on view public.restaurants_compat is 'Compatibility view exposing place-centered restaurant data through the legacy restaurants table column shape.';

-- ============================================================================
-- 25. Seed default place categories
-- ============================================================================
-- These mirror the category union used by the frontend:
--   'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study'

insert into public.place_categories (slug, name, name_sq, description, icon, is_active, sort_order)
values
  ('restaurants', 'Restaurants', 'Restorante', 'Restaurants and dining places.', 'restaurant-outline', true, 1),
  ('hiking', 'Hiking', 'Ecje', 'Hiking trails and outdoor nature activities.', 'walk-outline', true, 2),
  ('party', 'Party', 'Fest', 'Nightlife, clubs, and party venues.', 'wine-outline', true, 3),
  ('culture', 'Culture', 'Kulture', 'Cultural monuments, museums, and heritage sites.', 'library-outline', true, 4),
  ('study', 'Study', 'Studim', 'Study spots, cafes, and coworking spaces.', 'book-outline', true, 5)
on conflict (slug) do update
set
  name = excluded.name,
  name_sq = excluded.name_sq,
  description = excluded.description,
  icon = excluded.icon,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ============================================================================
-- 26. Seed cities from discoveryLocations (Kosovo municipalities)
-- ============================================================================
-- The 'all' pseudo-location is intentionally NOT seeded as a city.

insert into public.cities (slug, name, latitude, longitude, default_zoom, is_active, sort_order)
values
  ('prishtine', 'Prishtina', 42.6629, 21.1655, 0.11, true, 1),
  ('prizren', 'Prizren', 42.2146, 20.7397, 0.12, true, 2),
  ('peje', 'Peje', 42.6591, 20.2885, 0.12, true, 3),
  ('ferizaj', 'Ferizaj', 42.3706, 21.1553, 0.11, true, 4),
  ('gjakova', 'Gjakova', 42.3803, 20.4308, 0.11, true, 5),
  ('gjilan', 'Gjilan', 42.4635, 21.4694, 0.11, true, 6),
  ('mitrovice', 'Mitrovice', 42.8914, 20.8656, 0.11, true, 7),
  ('vushtrri', 'Vushtrri', 42.8231, 20.9675, 0.11, true, 8),
  ('podujeve', 'Podujeve', 42.9106, 21.1931, 0.11, true, 9),
  ('fushe-kosove', 'Fushe Kosove', 42.6394, 21.0961, 0.10, true, 10),
  ('suhareke', 'Suhareke', 42.3586, 20.825, 0.11, true, 11),
  ('rahovec', 'Rahovec', 42.3994, 20.6547, 0.11, true, 12),
  ('malisheve', 'Malisheve', 42.4822, 20.7458, 0.11, true, 13),
  ('skenderaj', 'Skenderaj', 42.7467, 20.7886, 0.11, true, 14),
  ('drenas', 'Drenas', 42.6283, 20.8939, 0.11, true, 15),
  ('lipjan', 'Lipjan', 42.5217, 21.1258, 0.11, true, 16),
  ('kamenice', 'Kamenice', 42.5781, 21.5803, 0.11, true, 17),
  ('viti', 'Viti', 42.3214, 21.3583, 0.11, true, 18),
  ('kacanik', 'Kacanik', 42.2319, 21.2594, 0.11, true, 19),
  ('shtime', 'Shtime', 42.4331, 21.0397, 0.10, true, 20),
  ('obiliq', 'Obiliq', 42.6869, 21.0703, 0.10, true, 21),
  ('kline', 'Kline', 42.6217, 20.5778, 0.11, true, 22),
  ('istog', 'Istog', 42.78, 20.4875, 0.11, true, 23),
  ('decan', 'Decan', 42.5402, 20.2879, 0.11, true, 24),
  ('dragash', 'Dragash', 42.0265, 20.6533, 0.11, true, 25),
  ('mamushe', 'Mamushe', 42.3306, 20.7267, 0.09, true, 26),
  ('hani-i-elezit', 'Hani i Elezit', 42.1508, 21.2969, 0.09, true, 27),
  ('junik', 'Junik', 42.4758, 20.2772, 0.09, true, 28),
  ('gracanice', 'Gracanice', 42.6011, 21.1958, 0.09, true, 29),
  ('shterpce', 'Shterpce', 42.2394, 21.0272, 0.11, true, 30),
  ('novoberde', 'Novoberde', 42.6158, 21.4361, 0.10, true, 31),
  ('partesh', 'Partesh', 42.4019, 21.4339, 0.09, true, 32),
  ('ranillug', 'Ranillug', 42.4928, 21.5989, 0.09, true, 33),
  ('kllokot', 'Kllokot', 42.3717, 21.3747, 0.09, true, 34),
  ('mitrovica-north', 'Mitrovica North', 42.8956, 20.8664, 0.09, true, 35),
  ('zubin-potok', 'Zubin Potok', 42.9144, 20.6897, 0.11, true, 36),
  ('zvecan', 'Zvecan', 42.9075, 20.8403, 0.09, true, 37),
  ('leposavic', 'Leposavic', 43.1039, 20.8028, 0.11, true, 38)
on conflict (slug) do update
set
  name = excluded.name,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  default_zoom = excluded.default_zoom,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ============================================================================
-- 27. Seed a starter set of system tags
-- ============================================================================

insert into public.tags (slug, name, name_sq, description, is_system, is_active)
values
  ('traditional', 'Traditional', 'Tradicionale', 'Traditional Kosovo cuisine.', true, true),
  ('italian', 'Italian', 'Italiane', 'Italian cuisine.', true, true),
  ('pizza', 'Pizza', 'Pizza', 'Pizza places.', true, true),
  ('sushi', 'Sushi', 'Sushi', 'Sushi and Japanese cuisine.', true, true),
  ('cafe', 'Cafe', 'Kafene', 'Cafes and coffee shops.', true, true),
  ('grill', 'Grill', 'Zjar', 'Grill and barbecue.', true, true),
  ('vegetarian', 'Vegetarian', 'Vegetariane', 'Vegetarian-friendly.', true, true),
  ('family-friendly', 'Family Friendly', 'Per Familje', 'Family-friendly places.', true, true),
  ('outdoor', 'Outdoor', 'Ne natyre', 'Outdoor seating or location.', true, true),
  ('nightlife', 'Nightlife', 'Jete nate', 'Nightlife and bars.', true, true)
on conflict (slug) do update
set
  name = excluded.name,
  name_sq = excluded.name_sq,
  description = excluded.description,
  is_system = excluded.is_system,
  is_active = excluded.is_active,
  updated_at = now();

commit;