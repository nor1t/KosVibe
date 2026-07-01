-- ============================================================================
-- Sprint 4 — Restaurant Data
-- ============================================================================
-- Creates: restaurant_reviews, restaurant_promotions, restaurant_specials
-- Seeds: places, restaurant_profiles, place_images, place_hours,
--        place_contacts, restaurant_reviews, restaurant_promotions,
--        restaurant_specials, place_category_links
--
-- Rule: Purely additive — no existing tables modified, no frontend changed.
--       Once seeded, repositories can drop mock-data fallbacks.
-- ============================================================================

begin;

-- ============================================================================
-- 1. restaurant_reviews table
-- ============================================================================

create table public.restaurant_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  author_name text not null,
  comment text not null,
  rating int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint restaurant_reviews_rating_check
    check (rating >= 1 and rating <= 5)
);

comment on table public.restaurant_reviews is 'User reviews per restaurant place.';
comment on column public.restaurant_reviews.rating is 'Rating from 1 to 5.';
comment on column public.restaurant_reviews.deleted_at is 'Soft-delete timestamp — when set, the review is considered removed.';

create trigger set_restaurant_reviews_created_by
  before insert on public.restaurant_reviews
  for each row execute function public.set_created_by();

create trigger set_restaurant_reviews_updated_by
  before update on public.restaurant_reviews
  for each row execute function public.set_updated_by();

create trigger set_restaurant_reviews_updated_at
  before update on public.restaurant_reviews
  for each row execute function public.set_updated_at();

create index restaurant_reviews_place_id_idx on public.restaurant_reviews (place_id) where deleted_at is null;
create index restaurant_reviews_rating_idx on public.restaurant_reviews (rating) where deleted_at is null;

-- ============================================================================
-- 2. restaurant_promotions table
-- ============================================================================

create table public.restaurant_promotions (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  title text not null,
  subtitle text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint restaurant_promotions_sort_order_check
    check (sort_order >= 0)
);

comment on table public.restaurant_promotions is 'Active promotions and offers for restaurant places.';
comment on column public.restaurant_promotions.deleted_at is 'Soft-delete timestamp — when set, the promotion is considered removed.';

create trigger set_restaurant_promotions_created_by
  before insert on public.restaurant_promotions
  for each row execute function public.set_created_by();

create trigger set_restaurant_promotions_updated_by
  before update on public.restaurant_promotions
  for each row execute function public.set_updated_by();

create trigger set_restaurant_promotions_updated_at
  before update on public.restaurant_promotions
  for each row execute function public.set_updated_at();

create index restaurant_promotions_place_id_idx on public.restaurant_promotions (place_id) where deleted_at is null;
create index restaurant_promotions_active_idx on public.restaurant_promotions (is_active) where deleted_at is null and is_active = true;

-- ============================================================================
-- 3. restaurant_specials table
-- ============================================================================

create table public.restaurant_specials (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  name text not null,
  description text,
  original_price text,
  price text not null,
  discount_label text,
  available_until text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint restaurant_specials_sort_order_check
    check (sort_order >= 0)
);

comment on table public.restaurant_specials is 'Today specials and featured items for restaurant places.';
comment on column public.restaurant_specials.deleted_at is 'Soft-delete timestamp — when set, the special is considered removed.';

create trigger set_restaurant_specials_created_by
  before insert on public.restaurant_specials
  for each row execute function public.set_created_by();

create trigger set_restaurant_specials_updated_by
  before update on public.restaurant_specials
  for each row execute function public.set_updated_by();

create trigger set_restaurant_specials_updated_at
  before update on public.restaurant_specials
  for each row execute function public.set_updated_at();

create index restaurant_specials_place_id_idx on public.restaurant_specials (place_id) where deleted_at is null;
create index restaurant_specials_active_idx on public.restaurant_specials (is_active) where deleted_at is null and is_active = true;

-- ============================================================================
-- 4. Enable RLS
-- ============================================================================

alter table public.restaurant_reviews enable row level security;
alter table public.restaurant_promotions enable row level security;
alter table public.restaurant_specials enable row level security;

-- ============================================================================
-- 5. RLS policies — restaurant_reviews
-- ============================================================================

create policy "Reviews are readable when parent place is published"
on public.restaurant_reviews
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.places p
    where p.id = restaurant_reviews.place_id
      and p.is_published = true
      and p.deleted_at is null
  )
  or (auth.uid() is not null and created_by = auth.uid())
  or public.is_admin()
);

create policy "Reviews are insertable by authenticated users"
on public.restaurant_reviews
for insert
to authenticated
with check (auth.uid() = created_by or created_by is null);

create policy "Reviews are updatable by author or admin"
on public.restaurant_reviews
for update
to authenticated
using (created_by = auth.uid() or public.is_admin())
with check (created_by = auth.uid() or public.is_admin());

create policy "Reviews are deletable by author or admin"
on public.restaurant_reviews
for delete
to authenticated
using (created_by = auth.uid() or public.is_admin());

-- ============================================================================
-- 6. RLS policies — restaurant_promotions & restaurant_specials
-- ============================================================================

create policy "Promotions are readable when parent place is published"
on public.restaurant_promotions
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.places p
    where p.id = restaurant_promotions.place_id
      and p.is_published = true and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Promotions are insertable by place owner or admin"
on public.restaurant_promotions
for insert
to authenticated
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Promotions are updatable by place owner or admin"
on public.restaurant_promotions
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Promotions are deletable by place owner or admin"
on public.restaurant_promotions
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

create policy "Specials are readable when parent place is published"
on public.restaurant_specials
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.places p
    where p.id = restaurant_specials.place_id
      and p.is_published = true and p.deleted_at is null
  )
  or public.is_place_owner(place_id)
  or public.is_admin()
);

create policy "Specials are insertable by place owner or admin"
on public.restaurant_specials
for insert
to authenticated
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Specials are updatable by place owner or admin"
on public.restaurant_specials
for update
to authenticated
using (public.is_place_owner(place_id) or public.is_admin())
with check (public.is_place_owner(place_id) or public.is_admin());

create policy "Specials are deletable by place owner or admin"
on public.restaurant_specials
for delete
to authenticated
using (public.is_place_owner(place_id) or public.is_admin());

-- ============================================================================
-- 7. Seed places for all mock restaurants
-- ============================================================================

-- City lookup helper: resolve city name to city_id
create or replace function public.resolve_city(city_name text)
returns uuid
language sql
stable
as $$
  select id from public.cities
  where lower(name) = lower(city_name) and deleted_at is null
  limit 1;
$$;

insert into public.places (slug, name, description, kind, city_id, city, address, latitude, longitude, price_range, rating, review_count, is_featured, is_published, status)
values
  ('pishat',               'Pishat Restaurant',     'Traditional Kosovo',           'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Garibaldi 23, Prishtina 10000',      42.6629, 21.1655, '€€',   4.8, 324, true,  true, 'active'),
  ('sushi-bar-tokio',      'Sushi Bar Tokio',       'Japanese, Sushi',              'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga B 18, Prishtina 10000',               42.6532, 21.1619, '€€€',  4.9, 289, true,  true, 'active'),
  ('pizza-napoli',         'Pizza Napoli',          'Italian, Pizza',               'restaurant', public.resolve_city('Prizren'),   'Prizren',   'Sheshi Shadervan 4, Prizren',                42.2146, 20.7397, '€€',   4.6, 512, false, true, 'active'),
  ('cafe-renaissance',     'Cafe Renaissance',      'Cafe, Breakfast',              'restaurant', public.resolve_city('Peje'),      'Peje',      'Sheshi Haxhi Zeka 7, Peje',                 42.6591, 20.2885, '€',    4.4, 198, false, true, 'active'),
  ('grill-house',          'Grill House',           'Grill House',                  'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Bujar Barjamovic 11, Prishtina',       42.6516, 21.1700, '€€',   4.5, 226, false, true, 'active'),
  ('bar-metropol',         'Bar Metropol',          'Bar, Cocktails',               'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Rexhep Luci 9, Prishtina',             42.6594, 21.1576, '€€',   4.7, 172, true,  true, 'active'),
  ('rena-bistro',          'Rena Bistro',           'Modern European plates with Kosovo produce', 'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Fehmi Agani 12, Prishtina',            42.6638, 21.1607, '€€',   4.7, 184, false, true, 'active'),
  ('miso-house',           'Miso House',            'Ramen bowls and small plates', 'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga B 41, Prishtina',                      42.6524, 21.1646, '€€',   4.8, 147, false, true, 'active'),
  ('smash-yard',           'Smash Yard',            'Smashed burgers and loaded fries', 'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Luan Haradinaj 6, Prishtina',          42.6605, 21.1585, '€€',   4.6, 391, false, true, 'active'),
  ('ember-steakhouse',     'Ember Steakhouse',      'Charcoal steaks and wine',     'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Muharrem Fejza 28, Prishtina',         42.6459, 21.1698, '€€€',  4.9, 208, false, true, 'active'),
  ('shadervan-pasta',      'Shadervan Pasta',       'Fresh pasta near the old bridge', 'restaurant', public.resolve_city('Prizren'), 'Prizren',  'Sheshi Shadervan 12, Prizren',               42.2098, 20.7401, '€€',   4.5, 132, false, true, 'active'),
  ('taco-luma',            'Taco Luma',             'Tacos, lime and spicy salsa',  'restaurant', public.resolve_city('Prizren'),   'Prizren',   'Rruga Marin Barleti 8, Prizren',             42.2115, 20.7379, '€',    4.4, 98,  false, true, 'active'),
  ('green-table',          'Green Table',           'Fresh bowls and plant-forward plates', 'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Bill Clinton 24, Prishtina',           42.6551, 21.1492, '€€',   4.6, 156, false, true, 'active'),
  ('peja-bakery',          'Peja Bakery',           'Warm bread, pastries and coffee', 'restaurant', public.resolve_city('Peje'),   'Peje',      'Rruga Mbreteresha Teute 5, Peje',            42.6608, 20.2911, '€',    4.7, 244, false, true, 'active'),
  ('drini-seafood',        'Drini Seafood',         'Fresh fish and Mediterranean sides', 'restaurant', public.resolve_city('Prizren'), 'Prizren', 'Rruga UCK 32, Prizren',                       42.2158, 20.7426, '€€€',  4.5, 119, false, true, 'active'),
  ('mezze-sofra',          'Mezze Sofra',           'Small plates for sharing',     'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Edit Durham 10, Prishtina',            42.6669, 21.1589, '€€',   4.8, 203, false, true, 'active'),
  ('sweet-corner',         'Sweet Corner',          'Cakes, coffee and late sweets','restaurant', public.resolve_city('Prizren'),  'Prizren',   'Rruga William Walker 3, Prizren',             42.2131, 20.7354, '€',    4.6, 174, false, true, 'active'),
  ('veranda-peje',         'Veranda Peje',          'Elevated Kosovo dining with mountain mood', 'restaurant', public.resolve_city('Peje'), 'Peje',  'Rruga Adem Jashari 19, Peje',                42.6584, 20.2868, '€€€',  4.8, 137, false, true, 'active'),
  ('rugova-soup-bar',      'Rugova Soup Bar',       'Warm bowls inspired by the mountains', 'restaurant', public.resolve_city('Peje'),  'Peje',      'Rruga Rugova 14, Peje',                      42.6636, 20.2825, '€',    4.5, 88,  false, true, 'active'),
  ('sunrise-toast',        'Sunrise Toast',         'Toast plates, eggs and fresh juice', 'restaurant', public.resolve_city('Prishtina'), 'Prishtina', 'Rruga Tringe Smajli 15, Prishtina',          42.6574, 21.1552, '€',    4.4, 126, false, true, 'active'),
  ('old-town-qebaptore',   'Old Town Qebaptore',    'Classic qebapa near the old town', 'restaurant', public.resolve_city('Prizren'), 'Prizren', 'Rruga Saracet 2, Prizren',                   42.2107, 20.7418, '€',    4.7, 318, false, true, 'active')
on conflict (slug) do update
set
  name            = excluded.name,
  description     = excluded.description,
  city_id         = excluded.city_id,
  city            = excluded.city,
  address         = excluded.address,
  latitude        = excluded.latitude,
  longitude       = excluded.longitude,
  price_range     = excluded.price_range,
  rating          = excluded.rating,
  review_count    = excluded.review_count,
  is_featured     = excluded.is_featured,
  updated_at      = now();

-- ============================================================================
-- 8. Seed restaurant_profiles
-- ============================================================================

insert into public.restaurant_profiles (place_id, cuisine, tagline, hours_text, is_open_now)
select
  p.id,
  case p.slug
    when 'pishat'             then 'Traditional Kosovo'
    when 'sushi-bar-tokio'    then 'Japanese, Sushi'
    when 'pizza-napoli'       then 'Italian, Pizza'
    when 'cafe-renaissance'   then 'Cafe, Breakfast'
    when 'grill-house'        then 'Grill'
    when 'bar-metropol'       then 'Cocktails, Lounge'
    when 'rena-bistro'        then 'Modern European'
    when 'miso-house'         then 'Asian, Ramen'
    when 'smash-yard'         then 'Burgers, Street Food'
    when 'ember-steakhouse'   then 'Steakhouse, Grill'
    when 'shadervan-pasta'    then 'Italian, Pasta'
    when 'taco-luma'          then 'Mexican, Street Food'
    when 'green-table'        then 'Healthy, Vegetarian'
    when 'peja-bakery'        then 'Bakery, Breakfast'
    when 'drini-seafood'      then 'Seafood, Mediterranean'
    when 'mezze-sofra'        then 'Mediterranean, Mezze'
    when 'sweet-corner'       then 'Desserts, Cafe'
    when 'veranda-peje'       then 'Fine Dining, Kosovo'
    when 'rugova-soup-bar'    then 'Soups, Comfort Food'
    when 'sunrise-toast'      then 'Breakfast, Brunch'
    when 'old-town-qebaptore' then 'Traditional, Grill'
  end as cuisine,
  p.description as tagline,
  case p.slug
    when 'pishat'             then '11:00 - 23:00'
    when 'sushi-bar-tokio'    then '12:00 - 22:30'
    when 'pizza-napoli'       then '10:00 - 23:30'
    when 'cafe-renaissance'   then '07:30 - 20:00'
    when 'grill-house'        then '10:00 - 22:00'
    when 'bar-metropol'       then '17:00 - 01:00'
    when 'rena-bistro'        then '09:00 - 23:00'
    when 'miso-house'         then '12:00 - 22:00'
    when 'smash-yard'         then '11:00 - 00:00'
    when 'ember-steakhouse'   then '13:00 - 23:30'
    when 'shadervan-pasta'    then '11:00 - 23:00'
    when 'taco-luma'          then '12:00 - 23:00'
    when 'green-table'        then '08:00 - 21:00'
    when 'peja-bakery'        then '06:30 - 19:00'
    when 'drini-seafood'      then '12:00 - 22:30'
    when 'mezze-sofra'        then '11:30 - 23:00'
    when 'sweet-corner'       then '09:00 - 22:00'
    when 'veranda-peje'       then '12:00 - 23:00'
    when 'rugova-soup-bar'    then '10:00 - 20:00'
    when 'sunrise-toast'      then '07:00 - 15:00'
    when 'old-town-qebaptore' then '09:00 - 22:30'
  end as hours_text,
  case p.slug
    when 'grill-house'   then false
    when 'drini-seafood' then false
    else true
  end as is_open_now
from public.places p
where p.kind = 'restaurant'
  and p.deleted_at is null
  and not exists (
    select 1 from public.restaurant_profiles rp
    where rp.place_id = p.id and rp.deleted_at is null
  );

-- ============================================================================
-- 9. Seed place_contacts (phone numbers)
-- ============================================================================

insert into public.place_contacts (place_id, kind, value, is_primary, sort_order)
select
  p.id,
  'phone',
  case p.slug
    when 'pishat'             then '+383 44 123 456'
    when 'sushi-bar-tokio'    then '+383 44 555 890'
    when 'pizza-napoli'       then '+383 49 222 333'
    when 'cafe-renaissance'   then '+383 44 200 100'
    when 'grill-house'        then '+383 44 700 800'
    when 'bar-metropol'       then '+383 44 111 222'
    when 'rena-bistro'        then '+383 44 610 210'
    when 'miso-house'         then '+383 49 810 122'
    when 'smash-yard'         then '+383 45 300 777'
    when 'ember-steakhouse'   then '+383 44 880 441'
    when 'shadervan-pasta'    then '+383 49 440 118'
    when 'taco-luma'          then '+383 45 990 330'
    when 'green-table'        then '+383 44 506 606'
    when 'peja-bakery'        then '+383 49 210 900'
    when 'drini-seafood'      then '+383 44 760 555'
    when 'mezze-sofra'        then '+383 45 770 118'
    when 'sweet-corner'       then '+383 49 500 404'
    when 'veranda-peje'       then '+383 44 230 303'
    when 'rugova-soup-bar'    then '+383 49 340 222'
    when 'sunrise-toast'      then '+383 44 420 515'
    when 'old-town-qebaptore' then '+383 44 220 909'
  end,
  true,
  0
from public.places p
where p.kind = 'restaurant'
  and p.deleted_at is null
  and not exists (
    select 1 from public.place_contacts pc
    where pc.place_id = p.id and pc.kind = 'phone' and pc.is_primary = true and pc.deleted_at is null
  );

-- ============================================================================
-- 10. Seed place_images (hero image per restaurant)
-- ============================================================================

insert into public.place_images (place_id, image_url, alt_text, sort_order, is_primary)
select
  p.id,
  case p.slug
    when 'pishat'             then 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    when 'sushi-bar-tokio'    then 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80'
    when 'pizza-napoli'       then 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
    when 'cafe-renaissance'   then 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
    when 'grill-house'        then 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80'
    when 'bar-metropol'       then 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80'
    when 'rena-bistro'        then 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    when 'miso-house'         then 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80'
    when 'smash-yard'         then 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'
    when 'ember-steakhouse'   then 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80'
    when 'shadervan-pasta'    then 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80'
    when 'taco-luma'          then 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80'
    when 'green-table'        then 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'
    when 'peja-bakery'        then 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
    when 'drini-seafood'      then 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80'
    when 'mezze-sofra'        then 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80'
    when 'sweet-corner'       then 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=1200&q=80'
    when 'veranda-peje'       then 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'
    when 'rugova-soup-bar'    then 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80'
    when 'sunrise-toast'      then 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80'
    when 'old-town-qebaptore' then 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
  end,
  p.name || ' interior',
  0,
  true
from public.places p
where p.kind = 'restaurant'
  and p.deleted_at is null
  and not exists (
    select 1 from public.place_images pi
    where pi.place_id = p.id and pi.is_primary = true and pi.deleted_at is null
  );

-- ============================================================================
-- 11. Seed place_hours (simplified: single range per restaurant)
-- ============================================================================

insert into public.place_hours (place_id, day_of_week, open_time, close_time, is_closed, sort_order)
select
  p.id,
  d.day::public.day_of_week,
  d.open_time,
  d.close_time,
  false,
  d.sort_order
from public.places p
cross join lateral (
  values
    ('mon', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 0),
    ('tue', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 1),
    ('wed', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 2),
    ('thu', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 3),
    ('fri', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 4),
    ('sat', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 5),
    ('sun', case p.slug
      when 'pishat' then '11:00' when 'sushi-bar-tokio' then '12:00' when 'pizza-napoli' then '10:00'
      when 'cafe-renaissance' then '07:30' when 'grill-house' then '10:00' when 'bar-metropol' then '17:00'
      when 'rena-bistro' then '09:00' when 'miso-house' then '12:00' when 'smash-yard' then '11:00'
      when 'ember-steakhouse' then '13:00' when 'shadervan-pasta' then '11:00' when 'taco-luma' then '12:00'
      when 'green-table' then '08:00' when 'peja-bakery' then '06:30' when 'drini-seafood' then '12:00'
      when 'mezze-sofra' then '11:30' when 'sweet-corner' then '09:00' when 'veranda-peje' then '12:00'
      when 'rugova-soup-bar' then '10:00' when 'sunrise-toast' then '07:00' when 'old-town-qebaptore' then '09:00'
    end,
    case p.slug
      when 'pishat' then '23:00' when 'sushi-bar-tokio' then '22:30' when 'pizza-napoli' then '23:30'
      when 'cafe-renaissance' then '20:00' when 'grill-house' then '22:00' when 'bar-metropol' then '01:00'
      when 'rena-bistro' then '23:00' when 'miso-house' then '22:00' when 'smash-yard' then '00:00'
      when 'ember-steakhouse' then '23:30' when 'shadervan-pasta' then '23:00' when 'taco-luma' then '23:00'
      when 'green-table' then '21:00' when 'peja-bakery' then '19:00' when 'drini-seafood' then '22:30'
      when 'mezze-sofra' then '23:00' when 'sweet-corner' then '22:00' when 'veranda-peje' then '23:00'
      when 'rugova-soup-bar' then '20:00' when 'sunrise-toast' then '15:00' when 'old-town-qebaptore' then '22:30'
    end, 6)
) as d(day, open_time, close_time, sort_order)
where p.kind = 'restaurant'
  and p.deleted_at is null
  and not exists (
    select 1 from public.place_hours ph
    where ph.place_id = p.id and ph.deleted_at is null
    limit 1
  );

-- ============================================================================
-- 12. Seed restaurant_reviews from mock data
-- ============================================================================

insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select
  p.id, r.author_name, r.comment, r.rating, r.created_at
from public.places p
cross join lateral (
  values
    ('Agron K.',  'Excellent traditional food. Best Tave Kosi in Prishtina.',                5, now() - interval '2 days'),
    ('Mimoza S.', 'Great atmosphere and friendly staff. Highly recommended.',                 5, now() - interval '1 week'),
    ('Dardan M.', 'Good food and reasonable prices. It can get busy on weekends.',            4, now() - interval '2 weeks')
) as r(author_name, comment, rating, created_at)
where p.slug = 'pishat'
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select p.id, 'Era B.', 'Fresh sushi and really kind service.', 5, now() - interval '3 days'
from public.places p where p.slug = 'sushi-bar-tokio'
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select p.id, 'Lira T.', 'Cozy place and a very good crust.', 5, now() - interval '5 days'
from public.places p where p.slug = 'pizza-napoli'
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select p.id, 'Alban P.', 'Great coffee and a quiet breakfast spot.', 4, now() - interval '4 days'
from public.places p where p.slug = 'cafe-renaissance'
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select p.id, 'Rinor D.', 'Very good qebapa and fast service.', 4, now() - interval '1 week'
from public.places p where p.slug = 'grill-house'
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select p.id, 'Drita Q.', 'Good music and a strong drinks menu.', 5, now() - interval '6 days'
from public.places p where p.slug = 'bar-metropol'
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

-- Additional restaurant reviews
insert into public.restaurant_reviews (place_id, author_name, comment, rating, created_at)
select p.id, r.author_name, r.comment, r.rating, now() - (r.days_ago || ' days')::interval
from public.places p
cross join lateral (
  values
    ('rena-bistro',     'Nora H.',  'Polished service and a strong lunch menu.',          5, '1'),
    ('rena-bistro',     'Blend A.', 'Great for a quiet dinner in the center.',            4, '5'),
    ('miso-house',      'Lea R.',   'The broth is rich and the portions are generous.',   5, '2'),
    ('smash-yard',      'Arben J.', 'Crispy edges, good sauce, quick service.',           5, '3'),
    ('ember-steakhouse','Valon S.', 'Best steak night I have had in Prishtina.',          5, '7'),
    ('shadervan-pasta', 'Elira N.', 'Lovely view and very comforting pasta.',             4, '4'),
    ('taco-luma',       'Besa M.',  'Fun flavors and a bright little place.',            4, '7'),
    ('green-table',     'Diellza K.','Fresh ingredients and really good sauces.',         5, '2'),
    ('peja-bakery',     'Ariana V.','The smell alone is worth stopping for.',             5, '0'),
    ('drini-seafood',   'Besart G.','Clean flavors and a nice break from heavy food.',    4, '14'),
    ('mezze-sofra',     'Dion B.',  'Perfect place to share plates with friends.',        5, '6'),
    ('sweet-corner',    'Sara P.',  'Small, cute and great for dessert after dinner.',    5, '3'),
    ('veranda-peje',    'Ilir C.',  'A calm dinner spot with excellent service.',         5, '7'),
    ('rugova-soup-bar', 'Flaka E.', 'Simple, warm and perfect after a cold walk.',        4, '5'),
    ('sunrise-toast',   'Rita Z.',  'Bright morning spot with fast service.',             4, '2'),
    ('old-town-qebaptore','Mentor H.','Fast, classic and exactly what you want in old town.', 5, '4')
) as r(slug, author_name, comment, rating, days_ago)
where p.slug = r.slug
  and not exists (select 1 from public.restaurant_reviews rr where rr.place_id = p.id and rr.deleted_at is null limit 1);

-- ============================================================================
-- 13. Seed restaurant_promotions
-- ============================================================================

insert into public.restaurant_promotions (place_id, title, subtitle, sort_order)
select p.id, pr.title, pr.subtitle, pr.sort_order
from public.places p
cross join lateral (
  values
    ('pishat',             'Free Dessert',        'With any main course order over €15',    0),
    ('pishat',             '20% OFF',             'Family meals on weekends',               1),
    ('sushi-bar-tokio',    'Lunch Combo',         'Free miso soup with every lunch set',    0),
    ('pizza-napoli',       'Second Pizza -50%',   'Every Tuesday after 18:00',             0),
    ('cafe-renaissance',   'Weekend Brunch Special','Sat & Sun 10:00 - 14:00',             0),
    ('grill-house',        'Family Combo',        '4 grill plates for €20 every weekend',   0),
    ('bar-metropol',       'Happy Hour - 50% OFF Drinks', '17:00 - 19:00',                 0),
    ('rena-bistro',        'Business Lunch',      'Main course and drink for €10',          0),
    ('miso-house',         'Student Bowl',        '10% off ramen with student ID',          0),
    ('smash-yard',         'Combo Night',         'Free fries after 20:00',                 0),
    ('ember-steakhouse',   'Wine Pairing',        'House red included with selected steaks',0),
    ('shadervan-pasta',    'Pasta for Two',       'Two pastas and lemonade for €15',        0),
    ('taco-luma',          'Taco Tuesday',        'Second taco plate half price',           0),
    ('green-table',        'Smoothie Add-on',     'Add a smoothie for €2 with any bowl',    0),
    ('peja-bakery',        'Morning Box',         'Six pastries for €7 before 10:00',       0),
    ('drini-seafood',      'Family Fish Platter', 'Shared platter for four every Sunday',   0),
    ('mezze-sofra',        'Share Table',         'Free bread refill with every mezze board',0),
    ('sweet-corner',       'Cake + Coffee',       'Any cake slice with espresso for €5',    0),
    ('veranda-peje',       'Chef Tasting',        'Three-course menu every Friday',         0),
    ('rugova-soup-bar',    'Soup + Bread',        'Fresh bread included with every soup bowl',0),
    ('sunrise-toast',      'Fresh Juice Morning', 'Free orange juice with brunch plates before 10:00', 0),
    ('old-town-qebaptore', 'Lunch Plate',         'Qebapa, salad and drink for €7',         0)
) as pr(slug, title, subtitle, sort_order)
where p.slug = pr.slug
  and not exists (select 1 from public.restaurant_promotions rp where rp.place_id = p.id and rp.deleted_at is null limit 1);

-- ============================================================================
-- 14. Seed restaurant_specials (today specials)
-- ============================================================================

insert into public.restaurant_specials (place_id, name, description, original_price, price, discount_label, available_until, image_url)
select p.id, s.name, s.description, s.original_price, s.price, s.discount_label, s.available_until, s.image_url
from public.places p
cross join lateral (
  values
    ('pishat',             'Tave Kosi me Mish Vici',  'Traditional baked lamb with yogurt',        '€8.5',  '€6',    '-30%', 'Until 14:00', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'),
    ('sushi-bar-tokio',    'Salmon Maki Set',          'Fresh salmon maki with avocado and sesame', '€12',   '€9.5',  '-21%', 'Until 15:00', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80'),
    ('pizza-napoli',       'Pizza Margherita',         'Classic stone baked pizza with basil',      '€7',    '€5.5',  '-21%', 'Until 15:00', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'),
    ('cafe-renaissance',   'Brunch Platter',           'Eggs, croissant, fruits and coffee',        '€9.5',  '€7.9',  '-17%', null,           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'),
    ('grill-house',        'Qebapa + Pita + Sallate',  'Traditional grilled minced meat plate',     '€7',    '€5.5',  '-22%', 'Until 15:00', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80'),
    ('bar-metropol',       'Happy Hour Drinks',       'Selected cocktails half price',              '€8',    '€4',    '-50%', null,           'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80'),
    ('rena-bistro',        'Herb Chicken Risotto',     'Creamy risotto with grilled chicken and local herbs', '€11', '€8.5', '-23%', 'Until 16:00', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'),
    ('miso-house',         'Spicy Beef Ramen',         'Rich broth, noodles, beef and chili oil',    '€10.5', '€8',   '-24%', 'Until 17:00', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80'),
    ('smash-yard',         'Double Smash Combo',       'Double patty burger with fries and house sauce', '€9', '€7',  '-22%', 'Until 18:00', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'),
    ('ember-steakhouse',   'Ribeye Board',             'Grilled ribeye with potatoes and pepper sauce', '€24', '€19', '-21%', 'Until 21:00', 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80'),
    ('shadervan-pasta',    'Tagliatelle Alfredo',      'Fresh pasta with cream, parmesan and mushrooms', '€8.5', '€6.8', '-20%', 'Until 16:00', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80'),
    ('taco-luma',          'Three Taco Plate',         'Chicken, beef and veggie tacos with salsa',  '€7.5',  '€6',   '-20%', 'Until 19:00', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80'),
    ('green-table',        'Power Bowl',               'Quinoa, roasted vegetables, chickpeas and tahini', '€8', '€6.5', '-19%', 'Until 15:00', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'),
    ('peja-bakery',        'Croissant Breakfast',      'Butter croissant, jam and espresso',         '€4.8',  '€3.8',  '-21%', 'Until 11:00', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'),
    ('drini-seafood',      'Grilled Sea Bass',         'Sea bass with lemon potatoes and herbs',     '€18',   '€14',   '-22%', 'Until 20:00', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80'),
    ('mezze-sofra',        'Mezze Mix',                'Hummus, olives, grilled vegetables and warm bread', '€12', '€9', '-25%', 'Until 18:00', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80'),
    ('sweet-corner',       'Chocolate Berry Cake',     'Layered chocolate cake with berry cream',    '€4.5',  '€3.5',  '-22%', 'Until 18:00', 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=1200&q=80'),
    ('veranda-peje',       'Slow Beef Plate',          'Braised beef, root vegetables and red wine sauce', '€17', '€13.5', '-21%', 'Until 20:00', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'),
    ('rugova-soup-bar',    'Mountain Bean Soup',       'Slow cooked beans with smoked paprika and bread', '€5.5', '€4.2', '-24%', 'Until 15:00', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80'),
    ('sunrise-toast',      'Avocado Egg Toast',        'Sourdough toast, avocado, egg and chili flakes', '€6', '€4.8', '-20%', 'Until 12:00', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80'),
    ('old-town-qebaptore', 'Ten Qebapa Plate',         'Qebapa with pita, onions and yogurt',        '€6.5',  '€5',    '-23%', 'Until 16:00', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80')
) as s(slug, name, description, original_price, price, discount_label, available_until, image_url)
where p.slug = s.slug
  and not exists (select 1 from public.restaurant_specials rs where rs.place_id = p.id and rs.deleted_at is null limit 1);

-- ============================================================================
-- 15. Link all seeded restaurants to the "Restaurants" category
-- ============================================================================

insert into public.place_category_links (place_id, category_id, is_primary, sort_order)
select
  p.id,
  pc.id,
  true,
  0
from public.places p
cross join public.place_categories pc
where p.kind = 'restaurant'
  and p.deleted_at is null
  and pc.slug = 'restaurants'
  and pc.deleted_at is null
  and not exists (
    select 1 from public.place_category_links pcl
    where pcl.place_id = p.id and pcl.category_id = pc.id and pcl.deleted_at is null
  );

-- ============================================================================
-- 16. Update place_catalog view to include promotions and specials count
-- ============================================================================

-- Add a view that enriches place_catalog with promotion/special counts
create or replace view public.place_catalog_enriched as
select
  pc.*,
  coalesce(pr.promotion_count, 0) as promotion_count,
  coalesce(sp.special_count, 0) as special_count,
  coalesce(rv.review_count_actual, 0) as review_count_actual,
  coalesce(rv.avg_rating, pc.rating) as computed_rating
from public.place_catalog pc
left join lateral (
  select count(*) as promotion_count
  from public.restaurant_promotions rp
  where rp.place_id = pc.id and rp.is_active = true and rp.deleted_at is null
) pr on true
left join lateral (
  select count(*) as special_count
  from public.restaurant_specials rs
  where rs.place_id = pc.id and rs.is_active = true and rs.deleted_at is null
) sp on true
left join lateral (
  select count(*) as review_count_actual,
         round(avg(rating)::numeric, 1) as avg_rating
  from public.restaurant_reviews rr
  where rr.place_id = pc.id and rr.deleted_at is null
) rv on true;

comment on view public.place_catalog_enriched is 'Enriched place catalog with live promotion, special, and review counts.';

-- ============================================================================
-- 17. Cleanup helper function
-- ============================================================================

drop function if exists public.resolve_city(text);

commit;