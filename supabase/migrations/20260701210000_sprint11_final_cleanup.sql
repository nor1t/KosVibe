-- ============================================================================
-- Sprint 11 — Final Mock Data Migration
-- ============================================================================
-- Creates: place_highlights, fun_activities tables
-- Seeds: All monument spots, explore spots, and fun activities
-- Note: discoveryLocations already exists as `cities` table (Sprint 2)
-- Note: profile data is static UI config — kept in repository for now
-- Rule: Purely additive.
-- ============================================================================

begin;

-- ============================================================================
-- 1. place_highlights table (monument spots + explore spots)
-- ============================================================================

create table public.place_highlights (
  id uuid primary key default extensions.gen_random_uuid(),
  highlight_type text not null,
  category text,
  title text not null,
  title_sq text not null,
  subtitle text,
  subtitle_sq text,
  detail text,
  detail_sq text,
  location text,
  location_sq text,
  city text,
  distance text,
  image_url text,
  photo_credit text,
  accent_label text,
  accent_color text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint place_highlights_type_check
    check (highlight_type in ('monument', 'nature', 'explore')),
  constraint place_highlights_category_check
    check (category is null or category in ('coffee', 'nightlife', 'culture', 'nature', 'study', 'icons')),
  constraint place_highlights_sort_order_check
    check (sort_order >= 0)
);

comment on table public.place_highlights is 'Monument spots, nature spots, and explore spots for map and category screens.';

create trigger set_place_highlights_updated_at
  before update on public.place_highlights
  for each row execute function public.set_updated_at();

create index place_highlights_type_idx on public.place_highlights (highlight_type) where deleted_at is null;
create index place_highlights_category_idx on public.place_highlights (category) where deleted_at is null;
create index place_highlights_city_idx on public.place_highlights (city) where deleted_at is null;

-- ============================================================================
-- 2. fun_activities table
-- ============================================================================

create table public.fun_activities (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  subtitle text,
  summary text,
  city text not null,
  icon_name text,
  accent_color text not null,
  background_color text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint fun_activities_sort_order_check
    check (sort_order >= 0)
);

comment on table public.fun_activities is 'Fun activities for the activity dashboard screen.';

create trigger set_fun_activities_updated_at
  before update on public.fun_activities
  for each row execute function public.set_updated_at();

create index fun_activities_city_idx on public.fun_activities (city) where deleted_at is null;

-- ============================================================================
-- 3. Enable RLS
-- ============================================================================

alter table public.place_highlights enable row level security;
alter table public.fun_activities enable row level security;

-- ============================================================================
-- 4. RLS policies
-- ============================================================================

create policy "Place highlights are publicly readable"
on public.place_highlights for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy "Place highlights are manageable by admin"
on public.place_highlights for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Fun activities are publicly readable"
on public.fun_activities for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy "Fun activities are manageable by admin"
on public.fun_activities for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 5. Seed monument spots
-- ============================================================================

insert into public.place_highlights (highlight_type, title, title_sq, location, location_sq, image_url, photo_credit, detail, detail_sq, latitude, longitude, sort_order)
values
  ('monument', 'Stone Bridge', 'Ura e Gurit', 'Prizren', 'Prizren', 'https://upload.wikimedia.org/wikipedia/commons/e/e0/PrizrenStoneBridge.jpg', 'Wikimedia Commons', 'Built during the Ottoman period and rebuilt after the 1979 flood, the Stone Bridge is one of Prizren city symbols.', 'E ndertuar ne periudhen osmane dhe e rindertuar pas vershimit te vitit 1979, Ura e Gurit eshte nje nga simbolet e Prizrenit.', 42.20965, 20.74034, 1),
  ('monument', 'Prizren Fortress', 'Kalaja e Prizrenit', 'Prizren', 'Prizren', 'https://upload.wikimedia.org/wikipedia/commons/2/29/The_Prizren_Fortress_09.jpg', 'Wikimedia Commons', 'Kalaja rises above Prizren on layers of medieval and Ottoman history.', 'Kalaja ngrihet mbi Prizren mbi shtresa historie mesjetare dhe osmane.', 42.2069, 20.7465, 2),
  ('monument', 'League of Prizren', 'Lidhja e Prizrenit', 'Prizren', 'Prizren', 'https://upload.wikimedia.org/wikipedia/commons/c/c2/2011_Prizren%2C_Budynek_Ligi_Prizre%C5%84skiej_01.jpg', 'Wikimedia Commons', 'Memorial complex marking the Albanian League of Prizren, founded in 1878.', 'Kompleks memorial i Lidhjes Shqiptare te Prizrenit, themeluar ne 1878.', 42.211467, 20.743825, 3),
  ('monument', 'Newborn Monument', 'Monumenti Newborn', 'Prishtina', 'Prishtine', 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Kosovo_Feb_2020_22_04_58_224000.jpeg', 'Wikimedia Commons', 'Unveiled on 17 February 2008, celebrating Kosovo independence.', 'I zbuluar me 17 shkurt 2008, shenon shpalljen e pavaresise se Kosoves.', 42.6607, 21.1583, 4),
  ('monument', 'National Library', 'Biblioteka Kombetare', 'Prishtina', 'Prishtine', 'https://upload.wikimedia.org/wikipedia/commons/4/42/National_Library_of_Kosovo.jpg', 'Wikimedia Commons', 'One of Prishtina most recognizable buildings, known for its domes and metal lattice.', 'Nje nga ndertesat me te dallueshme te Prishtines, e njohur per kupolat dhe rrjeten metalike.', 42.6575, 21.162297, 5),
  ('monument', 'Ulpiana', 'Ulpiana', 'Near Gracanica', 'Afer Gracanices', 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Ulpiana_%28lokaliteti_arkeologjik%29_nga_ajri.jpg', 'Wikimedia Commons', 'Important Roman and early Byzantine city in ancient Dardania.', 'Qytet i rendesishem romak dhe i hershem bizantin ne Dardanine antike.', 42.596892, 21.174387, 6),
  ('nature', 'Gadime Cave', 'Shpella e Gadimes', 'Lipjan', 'Lipjan', 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Crystals_from_inside_the_Marble_Cave_in_Kosovo_13.JPG', 'Wikimedia Commons', 'Hidden and crystalline cave with marble passages and mineral shapes.', 'Shpelle e fshehur dhe kristalore me korridore mermeri dhe forma minerale.', 42.47809, 21.20757, 7),
  ('nature', 'Rugova Canyon', 'Gryka e Rugoves', 'Peja', 'Peje', 'https://upload.wikimedia.org/wikipedia/commons/4/47/Rugova_Canyon_Kosovo.jpg', 'Wikimedia Commons', 'Dramatic canyon with steep limestone walls and mountain roads.', 'Gryke dramatike me mure te thepisura gelqerore dhe rruge malore.', 42.692222, 20.168611, 8),
  ('nature', 'Mirusha Waterfalls', 'Ujevarat e Mirushes', 'Kline / Malisheve', 'Kline / Malisheve', 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Waterfall_Mirusha.jpg', 'Wikimedia Commons', 'Chain of waterfalls, pools, and pale rock walls.', 'Varg ujevaresh, pishinash natyrore dhe shkembinjsh te hapur.', 42.523889, 20.583056, 9),
  ('nature', 'White Drin Waterfall', 'Ujevara e Drinit te Bardhe', 'Peje', 'Peje', 'https://upload.wikimedia.org/wikipedia/commons/9/9c/White_Drin_Waterfall_in_June.jpg', 'Wikimedia Commons', 'Bright, cold waterfall near Radavc with forest shade.', 'Ujevare e ndritshme dhe e ftohte prane Radavcit me hije pylli.', 42.738056, 20.305833, 10),
  ('nature', 'Germia Park', 'Parku i Germise', 'Prishtina', 'Prishtine', 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Germia_Park_during_Spring_Season_in_Prishtina%2C_Kosovo.jpg', 'Wikimedia Commons', 'Green escape with wooded trails and rolling paths.', 'Arratisje e gjelber me shtigje pyjore dhe rruge te buta.', 42.66887, 21.15345, 11),
  ('nature', 'Sharr Mountains', 'Malet e Sharrit', 'South Kosovo', 'Jugu i Kosoves', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80', 'Wikimedia Commons', 'High pastures, ridgelines, and wide-open sky across southern Kosovo.', 'Kullosa te larta, kreshta dhe qiell te hapur ne jug te Kosoves.', 42.1744, 20.9614, 12)
on conflict do nothing;

-- ============================================================================
-- 6. Seed explore spots
-- ============================================================================

insert into public.place_highlights (highlight_type, category, title, title_sq, subtitle, subtitle_sq, city, distance, image_url, accent_color, accent_label, latitude, longitude, sort_order)
values
  ('explore', 'coffee', 'Soma Book Station', 'Soma Book Station', 'Relaxed coffee and laptop tables', 'Relaxed coffee and laptop tables', 'Prishtina', '0.5 km', null, '#FFB300', 'Good for meetups', 42.6608, 21.1605, 1),
  ('explore', 'coffee', 'Stone Bridge Espresso', 'Stone Bridge Espresso', 'Coffee stop with old-town energy', 'Coffee stop with old-town energy', 'Prizren', '0.4 km', null, '#FFB300', 'Historic center', 42.2099, 20.7419, 2),
  ('explore', 'coffee', 'Rugova Roast Lab', 'Rugova Roast Lab', 'Specialty coffee before the mountain drive', 'Specialty coffee before the mountain drive', 'Peje', '0.9 km', null, '#FFB300', 'Roastery vibe', 42.6599, 20.2904, 3),
  ('explore', 'nightlife', 'Zone Rooftop', 'Zone Rooftop', 'Sunset drinks and a late DJ set', 'Sunset drinks and a late DJ set', 'Prishtina', '1.2 km', null, '#FF6138', 'Late-night favorite', 42.6624, 21.1592, 4),
  ('explore', 'nightlife', 'Lumbardhi Nights', 'Lumbardhi Nights', 'Cocktails close to the river walk', 'Cocktails close to the river walk', 'Prizren', '0.7 km', null, '#FF6138', 'Best after 21:00', 42.2118, 20.7392, 5),
  ('explore', 'nightlife', 'Peja Rooftop', 'Peja Rooftop', 'City lights and a social crowd', 'City lights and a social crowd', 'Peje', '1.1 km', null, '#FF6138', 'Weekend hotspot', 42.6618, 20.2887, 6),
  ('explore', 'culture', 'National Library Plaza', 'National Library Plaza', 'Architecture and student energy', 'Architecture and student energy', 'Prishtina', '0.8 km', null, '#5DA7FF', 'Creative district', 42.6575, 21.162297, 7),
  ('explore', 'culture', 'Prizren Fortress', 'Prizren Fortress', 'Old stone walls and city views', 'Old stone walls and city views', 'Prizren', '1.4 km', null, '#5DA7FF', 'Golden-hour stop', 42.2069, 20.7465, 8),
  ('explore', 'culture', 'Dukagjini Heritage Court', 'Dukagjini Heritage Court', 'Historic facades and gallery stops', 'Historic facades and gallery stops', 'Peje', '0.6 km', null, '#5DA7FF', 'Photo-ready route', 42.6611, 20.2881, 9),
  ('explore', 'nature', 'Germia Trail Gate', 'Germia Trail Gate', 'Easy access to forest paths', 'Easy access to forest paths', 'Prishtina', '2.1 km', null, '#42D98C', 'Morning reset', 42.66887, 21.15345, 10),
  ('explore', 'nature', 'Sharr Vista Point', 'Sharr Vista Point', 'Mountain air with a wide valley view', 'Mountain air with a wide valley view', 'Prizren', '3.3 km', null, '#42D98C', 'Scenic drive', 42.1744, 20.9614, 11),
  ('explore', 'nature', 'Rugova Canyon Start', 'Rugova Canyon Start', 'Gateway to the most dramatic outdoor route nearby', 'Gateway to the most dramatic outdoor route nearby', 'Peje', '4.5 km', null, '#42D98C', 'Weekend adventure', 42.692222, 20.168611, 12),
  ('explore', 'study', 'Innovation Centre Kosovo', 'Innovation Centre Kosovo', 'Quiet work tables and strong Wi-Fi', 'Quiet work tables and strong Wi-Fi', 'Prishtina', '0.9 km', null, '#8F7CFF', 'Best for deep work', 42.6551, 21.1633, 13),
  ('explore', 'study', 'Lumbardhi Work Loft', 'Lumbardhi Work Loft', 'A calm corner near the cultural district', 'A calm corner near the cultural district', 'Prizren', '0.8 km', null, '#8F7CFF', 'Laptop-friendly', 42.2131, 20.7399, 14),
  ('explore', 'study', 'Dukagjini Desk Hub', 'Dukagjini Desk Hub', 'Focused work sessions near the center', 'Focused work sessions near the center', 'Peje', '0.7 km', null, '#8F7CFF', 'Quietest before noon', 42.6604, 20.2874, 15),
  ('explore', 'icons', 'Newborn Monument', 'Newborn Monument', 'The city''s most recognizable landmark', 'The city''s most recognizable landmark', 'Prishtina', '1.0 km', null, '#FFD166', 'Must-see icon', 42.6607, 21.1583, 16),
  ('explore', 'icons', 'Stone Bridge', 'Stone Bridge', 'Classic old-town crossing and photo stop', 'Classic old-town crossing and photo stop', 'Prizren', '0.5 km', null, '#FFD166', 'Old-town favorite', 42.20965, 20.74034, 17),
  ('explore', 'icons', 'Patriarchate View', 'Patriarchate View', 'A landmark route framed by mountain scenery', 'A landmark route framed by mountain scenery', 'Peje', '2.4 km', null, '#FFD166', 'Landmark detour', 42.6775, 20.2669, 18)
on conflict do nothing;

-- ============================================================================
-- 7. Seed fun activities
-- ============================================================================

insert into public.fun_activities (title, subtitle, summary, city, icon_name, accent_color, background_color, sort_order)
values
  ('Prishtina Mall', 'Shopping, cinema, food court, and easy indoor hangout energy.', 'A simple indoor plan for shopping, movies, coffee, and food with friends.', 'Prishtina', 'bag-handle-outline', '#FFB300', 'rgba(255, 179, 0, 0.16)', 1),
  ('Germia Park', 'Forest walks, bike rides, fresh air, and a quick city escape.', 'A green escape close to the city with trails, picnic spots, and cycling routes.', 'Prishtina', 'bicycle-outline', '#42D98C', 'rgba(66, 217, 140, 0.16)', 2),
  ('1 Tetori Sports Hall', 'Sports events, training sessions, and an active local crowd.', 'A practical stop for sports games, local events, and active meetups.', 'Prishtina', 'basketball-outline', '#FF6138', 'rgba(255, 97, 56, 0.16)', 3),
  ('Newborn Walk', 'Photo stop, coffee nearby, and quick city-center exploring.', 'A quick central walk around one of Prishtina most recognizable landmarks.', 'Prishtina', 'camera-outline', '#FF5EBE', 'rgba(255, 94, 190, 0.16)', 4),
  ('Bear Sanctuary', 'Nature visit and an easy half-day trip outside the city.', 'A calm half-day visit outside Prishtina to learn about rescued bears.', 'Prishtina', 'leaf-outline', '#20C56C', 'rgba(32, 197, 108, 0.16)', 5),
  ('Padel Court', 'Fast rallies, easy group matches, and sporty evening plans.', 'A fun social sport option for pairs or small groups.', 'Prishtina', 'tennisball-outline', '#00D4B8', 'rgba(0, 212, 184, 0.16)', 6),
  ('Batllava Lake Fishing', 'Quiet lakeside fishing, views, and a slow outdoor day.', 'A peaceful lake trip near Prishtina for fishing and fresh air.', 'Prishtina', 'fish-outline', '#4FC3FF', 'rgba(79, 195, 255, 0.16)', 7),
  ('Brezovica', 'Mountain views, snow-season fun, and a classic weekend trip.', 'A mountain getaway for winter sports, scenic drives, and fresh air.', 'Prizren', 'snow-outline', '#5DA7FF', 'rgba(93, 167, 255, 0.16)', 8),
  ('Prizren Fortress', 'Sunset views, old-town steps, and a classic panorama.', 'A classic Prizren climb with wide views over the old town.', 'Prizren', 'business-outline', '#FFB300', 'rgba(255, 179, 0, 0.16)', 9),
  ('Shadervan Night', 'Dessert, music, and relaxed evening walks in the old town.', 'An easy evening plan in Prizren old town with dessert and music.', 'Prizren', 'musical-notes-outline', '#D66BFF', 'rgba(214, 107, 255, 0.16)', 10),
  ('Lumbardhi Walk', 'River views, bridge photos, and a calm cafe route.', 'A gentle route by the river with bridge views and nearby cafes.', 'Prizren', 'walk-outline', '#42D98C', 'rgba(66, 217, 140, 0.16)', 11),
  ('Rugova Canyon', 'Adventure routes, scenic drives, and outdoor adrenaline near Peje.', 'A dramatic canyon area near Peje for scenic drives and hiking.', 'Peje', 'trail-sign-outline', '#8F7CFF', 'rgba(143, 124, 255, 0.16)', 12),
  ('Via Ferrata', 'Guided cliff routes and big Rugova canyon energy.', 'A guided climbing-style route for adventure seekers.', 'Peje', 'fitness-outline', '#FF6138', 'rgba(255, 97, 56, 0.16)', 13),
  ('Patriarchate Visit', 'A peaceful cultural stop close to the mountain road.', 'A quiet cultural visit near Peje with historic architecture.', 'Peje', 'book-outline', '#5DA7FF', 'rgba(93, 167, 255, 0.16)', 14),
  ('White Drini', 'Waterfall photos, fresh air, and a scenic short drive.', 'A short scenic trip for waterfall views and fresh air.', 'Peje', 'water-outline', '#42D98C', 'rgba(66, 217, 140, 0.16)', 15)
on conflict do nothing;

commit;