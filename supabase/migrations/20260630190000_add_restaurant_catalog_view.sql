begin;

create or replace view public.restaurant_catalog as
select
  r.id,
  r.slug,
  r.name,
  r.description,
  r.city,
  r.address,
  r.cuisine,
  r.price_range,
  r.rating,
  r.latitude,
  r.longitude,
  r.phone,
  r.website,
  r.is_featured,
  (
    select ri.image_url
    from public.restaurant_images ri
    where ri.restaurant_id = r.id
    order by ri.sort_order asc
    limit 1
  ) as image_url
from public.restaurants r
where r.is_published = true;

comment on view public.restaurant_catalog is 'Published restaurant cards with a primary image for the app catalog.';

commit;
