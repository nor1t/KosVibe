-- ============================================================================
-- Sprint 8 — Search (PostgreSQL Full Text Search + Trigram + Geo)
-- ============================================================================
-- Enables: pg_trgm extension
-- Creates: search_documents materialized view, GIN/GiST/trigram indexes,
--          search_all RPC function
-- Rule: Purely additive. No frontend changes.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enable pg_trgm extension
-- ============================================================================

create extension if not exists pg_trgm with schema public;
create extension if not exists cube with schema public;
create extension if not exists earthdistance with schema public;

-- ============================================================================
-- 2. search_documents materialized view
-- ============================================================================

create materialized view public.search_documents as
-- Restaurants
select
  p.id,
  'restaurant' as type,
  p.name,
  coalesce(p.description, rp.cuisine, '') as description,
  coalesce(p.city, '') as city,
  coalesce(rp.cuisine, '') as category,
  setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(rp.cuisine, '') || ' ' || coalesce(rp.tagline, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(p.description, '') || ' ' || coalesce(p.city, '') || ' ' || coalesce(p.address, '')), 'C')
    as search_vector,
  p.latitude,
  p.longitude,
  coalesce(p.rating, 0) as rating,
  p.slug as source_id,
  (
    select pi.image_url
    from public.place_images pi
    where pi.place_id = p.id and pi.deleted_at is null
    order by pi.is_primary desc, pi.sort_order asc
    limit 1
  ) as thumbnail_url
from public.places p
left join public.restaurant_profiles rp on rp.place_id = p.id and rp.deleted_at is null
where p.is_published = true
  and p.deleted_at is null
  and p.kind = 'restaurant'

union all

-- Event highlights
select
  eh.id,
  'event' as type,
  eh.title as name,
  coalesce(eh.description, '') as description,
  '' as city,
  eh.category,
  setweight(to_tsvector('english', coalesce(eh.title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(eh.category, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(eh.description, '') || ' ' || coalesce(eh.venue, '')), 'C')
    as search_vector,
  null::numeric as latitude,
  null::numeric as longitude,
  0 as rating,
  eh.id::text as source_id,
  null::text as thumbnail_url
from public.event_highlights eh
where eh.is_active = true
  and eh.deleted_at is null;

-- ============================================================================
-- 3. Indexes
-- ============================================================================

-- GIN index for FTS
create index search_documents_fts_idx
  on public.search_documents
  using gin (search_vector);

-- GiST index for geo proximity (point-based)
create index search_documents_geo_idx
  on public.search_documents
  using gist (
    point(coalesce(longitude, 20.92), coalesce(latitude, 42.63))
  );

-- Trigram index for similarity search on names
create index search_documents_name_trgm_idx
  on public.search_documents
  using gin (name gin_trgm_ops);

-- B-tree indexes for filtering and sorting
create index search_documents_type_idx on public.search_documents (type);
create index search_documents_city_idx on public.search_documents (city);
create index search_documents_category_idx on public.search_documents (category);
create index search_documents_rating_idx on public.search_documents (rating desc);

-- ============================================================================
-- 4. Trigger to refresh materialized view after data changes
-- ============================================================================

create or replace function public.refresh_search_documents()
returns trigger
language plpgsql
as $$
begin
  refresh materialized view concurrently public.search_documents;
  return null;
end;
$$;

-- Don't add triggers yet (concurrent refresh requires unique index)

-- ============================================================================
-- 5. search_all RPC function
-- ============================================================================

create or replace function public.search_all(
  search_term   text default null,
  city_filter   text default null,
  category_filter text default null,
  lat           numeric default null,
  lng           numeric default null,
  radius_km     numeric default null,
  page_num      int default 1,
  page_size     int default 20,
  sort_by       text default 'relevance'
)
returns table(
  id            uuid,
  type          text,
  name          text,
  description   text,
  city          text,
  category      text,
  rating        numeric,
  source_id     text,
  thumbnail_url text,
  latitude      numeric,
  longitude     numeric,
  relevance     numeric,
  total_count   bigint
)
language plpgsql
stable
as $$
declare
  query_tsquery tsquery;
  total        bigint;
  offset_val   int;
begin
  -- Defaults
  page_num  := greatest(coalesce(page_num, 1), 1);
  page_size := least(greatest(coalesce(page_size, 20), 1), 100);
  offset_val := (page_num - 1) * page_size;

  -- Build tsquery from search term
  if search_term is not null and length(trim(search_term)) > 0 then
    query_tsquery := plainto_tsquery('english', trim(search_term));
  end if;

  -- Count total matches first
  select count(*)
  into total
  from public.search_documents sd
  where
    (query_tsquery is null or sd.search_vector @@ query_tsquery
     or sd.name % trim(search_term))
    and (city_filter is null or lower(sd.city) = lower(city_filter))
    and (category_filter is null or lower(sd.category) = lower(category_filter))
    and (
      lat is null or lng is null or radius_km is null
      or (
        point(sd.longitude, sd.latitude) <@>
        point(lng, lat)
      ) * 111.32 <= radius_km
    );

  -- Return paged results with ranking
  return query
  select
    sd.id,
    sd.type,
    sd.name,
    sd.description,
    sd.city,
    sd.category,
    sd.rating,
    sd.source_id,
    sd.thumbnail_url,
    sd.latitude,
    sd.longitude,
    case
      when query_tsquery is not null then
        coalesce(ts_rank(sd.search_vector, query_tsquery, 32), 0) * 0.7
        + coalesce(similarity(sd.name, trim(search_term)), 0) * 0.3
      when lat is not null and lng is not null then
        1.0 / (1 + (
          point(sd.longitude, sd.latitude) <@>
          point(lng, lat)
        ) * 111.32)
      else coalesce(sd.rating, 0) / 5.0
    end as relevance,
    total as total_count
  from public.search_documents sd
  where
    (query_tsquery is null or sd.search_vector @@ query_tsquery
     or sd.name % trim(search_term))
    and (city_filter is null or lower(sd.city) = lower(city_filter))
    and (category_filter is null or lower(sd.category) = lower(category_filter))
    and (
      lat is null or lng is null or radius_km is null
      or earth_distance(
           ll_to_earth(sd.latitude, sd.longitude),
           ll_to_earth(lat, lng)
         ) <= radius_km * 1000
    )
  order by
    case when sort_by = 'relevance' and query_tsquery is not null then
      coalesce(ts_rank(sd.search_vector, query_tsquery, 32), 0) * 0.7
      + coalesce(similarity(sd.name, trim(search_term)), 0) * 0.3
    else null end desc,
    case when sort_by = 'rating' then coalesce(sd.rating, 0) else null end desc,
    case when sort_by = 'distance' and lat is not null then
      point(sd.longitude, sd.latitude) <@>
      point(lng, lat)
    else null end asc,
    coalesce(sd.rating, 0) desc
  limit page_size
  offset offset_val;
end;
$$;

comment on function public.search_all is
  'Full-text search across restaurants and events with weighted ranking, trigram similarity, city/category filters, geo proximity, and pagination.';

-- ============================================================================
-- 6. search_restaurants RPC (simpler, for sync API compatibility)
-- ============================================================================

create or replace function public.search_restaurants(
  search_term   text default null,
  city_filter   text default null,
  category_filter text default null,
  limit_count   int default 50
)
returns table(
  id            uuid,
  type          text,
  name          text,
  description   text,
  city          text,
  category      text,
  rating        numeric,
  source_id     text,
  thumbnail_url text,
  latitude      numeric,
  longitude     numeric
)
language plpgsql
stable
as $$
declare
  query_tsquery tsquery;
begin
  if search_term is not null and length(trim(search_term)) > 0 then
    query_tsquery := plainto_tsquery('english', trim(search_term));
  end if;

  return query
  select
    sd.id, sd.type, sd.name, sd.description,
    sd.city, sd.category, sd.rating,
    sd.source_id, sd.thumbnail_url,
    sd.latitude, sd.longitude
  from public.search_documents sd
  where
    sd.type = 'restaurant'
    and (query_tsquery is null or sd.search_vector @@ query_tsquery
         or sd.name % trim(search_term))
    and (city_filter is null or lower(sd.city) = lower(city_filter))
    and (category_filter is null or lower(sd.category) = lower(category_filter))
  order by
    case when query_tsquery is not null then
      ts_rank(sd.search_vector, query_tsquery, 32)
    else coalesce(sd.rating, 0)
    end desc
  limit limit_count;
end;
$$;

comment on function public.search_restaurants is
  'Search restaurants only with FTS, trigram fallback, city filter, and category filter.';

commit;