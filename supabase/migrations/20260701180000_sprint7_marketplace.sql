-- ============================================================================
-- Sprint 7 — Marketplace
-- ============================================================================
-- Creates: marketplace_categories, marketplace_spots, marketplace_sellers,
--          marketplace_collections, marketplace_products
-- Seeds: All bilingual marketplace content (en/sq).
--
-- Rule: Purely additive. No screens modified.
-- ============================================================================

begin;

-- ============================================================================
-- 1. marketplace_categories table
-- ============================================================================

create table public.marketplace_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label_en text not null,
  label_sq text not null,
  title_en text,
  title_sq text,
  subtitle_en text,
  subtitle_sq text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint marketplace_categories_sort_order_check check (sort_order >= 0)
);

comment on table public.marketplace_categories is 'Marketplace category definitions (bilingual en/sq).';

create trigger set_marketplace_categories_updated_at
  before update on public.marketplace_categories
  for each row execute function public.set_updated_at();

create index marketplace_categories_slug_idx on public.marketplace_categories (slug) where deleted_at is null;

-- ============================================================================
-- 2. marketplace_spots table
-- ============================================================================

create table public.marketplace_spots (
  id uuid primary key default extensions.gen_random_uuid(),
  title_en text not null,
  title_sq text not null,
  subtitle_en text,
  subtitle_sq text,
  tone_color text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint marketplace_spots_sort_order_check check (sort_order >= 0)
);

comment on table public.marketplace_spots is 'Market spot highlights (bilingual en/sq).';

create trigger set_marketplace_spots_updated_at
  before update on public.marketplace_spots
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. marketplace_sellers table
-- ============================================================================

create table public.marketplace_sellers (
  id uuid primary key default extensions.gen_random_uuid(),
  category_slug text not null,
  family_en text not null,
  family_sq text not null,
  address_en text not null,
  address_sq text not null,
  phone text,
  image_url text,
  description_en text,
  description_sq text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint marketplace_sellers_category_check check (category_slug in ('food', 'craft', 'clothing')),
  constraint marketplace_sellers_sort_order_check check (sort_order >= 0)
);

comment on table public.marketplace_sellers is 'Seller/vendor profiles (bilingual en/sq).';

create trigger set_marketplace_sellers_created_by
  before insert on public.marketplace_sellers
  for each row execute function public.set_created_by();

create trigger set_marketplace_sellers_updated_by
  before update on public.marketplace_sellers
  for each row execute function public.set_updated_by();

create trigger set_marketplace_sellers_updated_at
  before update on public.marketplace_sellers
  for each row execute function public.set_updated_at();

create index marketplace_sellers_category_idx on public.marketplace_sellers (category_slug) where deleted_at is null;

-- ============================================================================
-- 4. marketplace_collections table
-- ============================================================================

create table public.marketplace_collections (
  id uuid primary key default extensions.gen_random_uuid(),
  icon_name text not null,
  title_en text not null,
  title_sq text not null,
  text_en text,
  text_sq text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint marketplace_collections_sort_order_check check (sort_order >= 0)
);

comment on table public.marketplace_collections is 'Collection cards for marketplace UI (bilingual en/sq).';

create trigger set_marketplace_collections_updated_at
  before update on public.marketplace_collections
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. marketplace_products table
-- ============================================================================

create table public.marketplace_products (
  id uuid primary key default extensions.gen_random_uuid(),
  seller_id uuid not null references public.marketplace_sellers (id) on delete cascade,
  name_en text not null,
  name_sq text not null,
  description text,
  price text,
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint marketplace_products_sort_order_check check (sort_order >= 0)
);

comment on table public.marketplace_products is 'Product inventory per seller (bilingual en/sq).';

create trigger set_marketplace_products_updated_at
  before update on public.marketplace_products
  for each row execute function public.set_updated_at();

create index marketplace_products_seller_id_idx on public.marketplace_products (seller_id) where deleted_at is null;

-- ============================================================================
-- 6. Enable RLS
-- ============================================================================

alter table public.marketplace_categories enable row level security;
alter table public.marketplace_spots enable row level security;
alter table public.marketplace_sellers enable row level security;
alter table public.marketplace_collections enable row level security;
alter table public.marketplace_products enable row level security;

-- ============================================================================
-- 7. RLS policies
-- ============================================================================

create policy "Marketplace categories are publicly readable"
on public.marketplace_categories for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy "Marketplace categories are manageable by admin"
on public.marketplace_categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Marketplace spots are publicly readable"
on public.marketplace_spots for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy "Marketplace spots are manageable by admin"
on public.marketplace_spots for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Active marketplace sellers are publicly readable"
on public.marketplace_sellers for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy "Marketplace sellers are manageable by admin"
on public.marketplace_sellers for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Own sellers are manageable by owner"
on public.marketplace_sellers for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Marketplace collections are publicly readable"
on public.marketplace_collections for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy "Marketplace collections are manageable by admin"
on public.marketplace_collections for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Marketplace products are publicly readable"
on public.marketplace_products for select to anon, authenticated
using (deleted_at is null);

create policy "Marketplace products are manageable by admin"
on public.marketplace_products for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 8. Seed marketplace_categories
-- ============================================================================

insert into public.marketplace_categories (slug, label_en, label_sq, title_en, title_sq, subtitle_en, subtitle_sq, sort_order)
values
  ('food', 'Food & Drink', 'Ushqim & Pije',
   'Traditional food and drink', 'Ushqime dhe pije tradicionale',
   'Family producers known for wine, rakia, preserves, dairy, and village pantry staples.',
   'Prodhues familjare te njohur per vere, raki, konserva, bulmet dhe shije te fshatit.', 1),
  ('craft', 'Items & Instruments', 'Objekte & Instrumente',
   'Traditional items and instruments', 'Objekte dhe instrumente tradicionale',
   'Craft families making woodwork, shepherd tools, lahuta-style instruments, and home objects.',
   'Familje artizane qe punojne dru, vegla bariu, instrumente dhe sende shtepie me tradite.', 2),
  ('clothing', 'Traditional Clothes', 'Veshje Tradicionale',
   'Traditional clothing', 'Veshje tradicionale',
   'Households and ateliers with woven aprons, plis caps, embroidered vests, and ceremonial dress details.',
   'Shtepi dhe atelie me perparese te endura, plis, jeleka te qendisur dhe pjese ceremoniale.', 3)
on conflict (slug) do update set
  label_en = excluded.label_en, label_sq = excluded.label_sq,
  title_en = excluded.title_en, title_sq = excluded.title_sq,
  subtitle_en = excluded.subtitle_en, subtitle_sq = excluded.subtitle_sq,
  sort_order = excluded.sort_order, updated_at = now();

-- ============================================================================
-- 9. Seed marketplace_spots
-- ============================================================================

insert into public.marketplace_spots (title_en, title_sq, subtitle_en, subtitle_sq, tone_color, sort_order)
values
  ('Rahovec Wine Route', 'Rruga e Veres ne Rahovec',
   'Cellars, grape products, village hospitality, and Kosovo wine culture.',
   'Kantina, produkte rrushi, mikpritje fshati dhe kulture e veres se Kosoves.', '#FFB300', 1),
  ('Rugova Farm Stays', 'Bujtinat e Rugoves',
   'Mountain food, dairy products, herbal goods, and handmade home items.',
   'Ushqim mali, produkte bulmeti, bime sheruese dhe sende te punuara me dore.', '#42D98C', 2),
  ('Gjakova Old Bazaar', 'Carshia e Madhe ne Gjakove',
   'Traditional craft, copper details, textiles, and strong cultural atmosphere.',
   'Artizanat tradicional, pune bakri, tekstile dhe atmosfere kulturore e forte.', '#5DA7FF', 3)
on conflict do nothing;

-- ============================================================================
-- 10. Seed marketplace_collections
-- ============================================================================

insert into public.marketplace_collections (icon_name, title_en, title_sq, text_en, text_sq, sort_order)
values
  ('wine-outline', 'Wine & Rakia', 'Vere & Raki',
   'Village cellars, grape harvest products, and small-batch bottles with a local story.',
   'Kantina fshati, produkte te vjeljes se rrushit dhe shishe me histori lokale.', 1),
  ('restaurant-outline', 'Traditional Foods', 'Ushqime Tradicionale',
   'Cheese, honey, ajvar, mountain tea, dried fruit, preserves, and handmade pastries.',
   'Djathera, mjalte, ajvar, caj mali, fruta te thata, konserva dhe embelsira shtepie.', 2),
  ('leaf-outline', 'Agro Culture', 'Agrokulture',
   'Farm visits, orchard routes, village lunches, seasonal produce, and countryside rituals.',
   'Vizita ne ferma, rruge pemetaresh, dreka ne fshat, prodhim sezonal dhe rituale lokale.', 3),
  ('cube-outline', 'Objects & Craft', 'Objekte & Artizanat',
   'Woodwork, woven fabric, kitchen tools, table pieces, and useful handmade goods.',
   'Punime druri, tekstile, vegla kuzhine, pjese tavoline dhe sende te dobishme me dore.', 4)
on conflict do nothing;

-- ============================================================================
-- 11. Seed marketplace_sellers
-- ============================================================================

insert into public.marketplace_sellers (category_slug, family_en, family_sq, address_en, address_sq, phone, image_url, description_en, description_sq, is_verified, sort_order)
values
  ('food', 'Krasniqi Family Cellar', 'Kantina Familjare Krasniqi', 'Hoqe e Vogel, Rahovec', 'Hoqe e Vogel, Rahovec',
   '+383 49 210 415', 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=900&q=80',
   'Small family cellar with local red wine, white wine, and grape rakia poured and explained on site.',
   'Kantine e vogel familjare me vere te kuqe, vere te bardhe dhe raki rrushi qe prezantohet direkt ne vend.', true, 1),
  ('food', 'Bytyqi Dairy House', 'Shtepia e Bulmetit Bytyqi', 'Drelaj, Rugove, Peje', 'Drelaj, Rugove, Peje',
   '+383 44 672 188', 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=900&q=80',
   'Mountain household selling village cheese, yogurt, preserved butter, and seasonal herbal tea bundles.',
   'Shtepi malore qe shet djathe fshati, kos, gjalpe te ruajtur dhe paketa me cajra bimore sezonale.', true, 2),
  ('food', 'Berisha Pantry Table', 'Tryeza e Konservave Berisha', 'Krushe e Madhe, Rahovec', 'Krushe e Madhe, Rahovec',
   '+383 45 811 264', 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80',
   'Known for ajvar, fruit preserves, forest honey, and homemade juices prepared with family recipes.',
   'E njohur per ajvar, recelra, mjalte mali dhe lengje shtepie te pergatitura me receta familjare.', true, 3),
  ('craft', 'Gashi Wood & Lahuta Workshop', 'Punishtja e Drurit dhe Lahutes Gashi', 'Junik Center, Junik', 'Qendra e Junikut, Junik',
   '+383 49 520 733', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
   'A family workshop producing carved wooden trays, shepherd items, and string instruments inspired by local tradition.',
   'Punishte familjare me tabaka druri, sende bariu dhe instrumente me frymezim nga tradita lokale.', true, 4),
  ('craft', 'Hoxha Copper Corner', 'Kendi i Bakrit Hoxha', 'Gjakova Old Bazaar, Gjakove', 'Carshia e Madhe, Gjakove',
   '+383 44 398 551', 'https://images.unsplash.com/photo-1457530378978-8bac673b57c3?auto=format&fit=crop&w=900&q=80',
   'Hand-finished copper coffee sets, serving pieces, and practical home objects rooted in old bazaar craft.',
   'Servise bakri per kafe, pjese servirjeje dhe objekte praktike te lidhura me zanatin e vjeter.', true, 5),
  ('craft', 'Rama Heritage Tools', 'Veglat e Trashegimise Rama', 'Isniq, Decan', 'Isniq, Decan',
   '+383 48 703 992', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
   'Rural maker focused on handmade spoons, loom parts, and useful small tools that reflect village life.',
   'Punues rural i fokusuar ne luga dore, pjese te vekut dhe vegla te vogla qe pasqyrojne jeten e fshatit.', true, 6),
  ('clothing', 'Luma Weaving Room', 'Dhoma e Endjes Luma', 'Prizren outskirts, Prizren', 'Periferi e Prizrenit, Prizren',
   '+383 49 340 226', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
   'Traditional aprons, woven belts, and embroidered textile pieces made in a small family weaving space.',
   'Perparese tradicionale, rripa te endur dhe tekstile te qendisura ne nje hapesire te vogel familjare.', true, 7),
  ('clothing', 'Shala Costume House', 'Shtepia e Kostumeve Shala', 'Peje Old Town, Peje', 'Qyteti i Vjeter, Peje',
   '+383 45 916 448', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
   'Local family preserving ceremonial clothing details, plis caps, and stitched vest pieces for visitors and events.',
   'Familje lokale qe ruan detaje ceremoniale te veshjeve, plisa dhe pjese jelekesh per vizitore e ngjarje.', true, 8),
  ('clothing', 'Mustafa Needle Studio', 'Studioja e Gjilperes Mustafa', 'Gjakova artisan quarter, Gjakove', 'Lagjja artizanale, Gjakove',
   '+383 44 280 519', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
   'Traditional clothing accents, hand embroidery, and custom-made pieces based on regional Albanian dress motifs.',
   'Aksessore te veshjeve tradicionale, qendisje me dore dhe pjese sipas motiveve shqiptare rajonale.', true, 9)
on conflict do nothing;

commit;