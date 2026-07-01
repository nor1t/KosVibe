-- ============================================================================
-- Migration: Seed cities table from existing places
--
-- The cities table (Sprint 2) exists but has never been populated.
-- The places table contains city names (text column) from Sprint 4 seed.
-- This migration extracts those city names into the cities table
-- so the discovery/explore dropdown populates correctly.
--
-- After this runs, `placesRepository.refresh()` will return real cities.
-- ============================================================================

begin;

-- Enable RLS and allow anyone to read active cities
alter table public.cities enable row level security;

create policy "Anyone can read active cities"
on public.cities for select
using (is_active = true and deleted_at is null);

-- Extract distinct city names from places that don't already exist in cities
insert into public.cities (name, slug, latitude, longitude, sort_order, is_active)
select
  p.city,
  lower(regexp_replace(p.city, '[^a-zA-Z0-9]+', '-', 'g')),
  avg(p.latitude),
  avg(p.longitude),
  row_number() over (order by count(*) desc),
  true
from public.places p
where p.deleted_at is null
  and p.is_published = true
  and p.city is not null
  and p.city != ''
  and not exists (
    select 1 from public.cities c
    where lower(c.name) = lower(p.city)
      and c.deleted_at is null
  )
group by p.city
on conflict (slug) do nothing;

-- Ensure standard Kosovo cities always exist (idempotent)
insert into public.cities (name, slug, latitude, longitude, sort_order, is_active)
values
  ('Prishtina', 'prishtina', 42.6629, 21.1655, 1, true),
  ('Prizren',   'prizren',   42.2139, 20.7397, 2, true),
  ('Peja',      'peja',      42.6591, 20.2885, 3, true)
on conflict (slug) do nothing;

commit;