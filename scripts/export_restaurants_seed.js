const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'supabase', 'seed_generated_restaurants.sql');

const candidateJsonPaths = [
  process.env.RESTAURANTS_JSON_PATH,
  'C:\\Users\\Norit\\OneDrive\\Desktop\\LIGJERATAT\\VITI I 3-të\\SEMESTRI 6\\Kurs Laboratorik\\restaurants.json',
].filter(Boolean);

const sourcePath = candidateJsonPaths.find((candidatePath) => fs.existsSync(candidatePath));

if (!sourcePath) {
  throw new Error(
    'Could not find restaurants.json. Set RESTAURANTS_JSON_PATH or place the source file in the expected location.'
  );
}

const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

if (!Array.isArray(data)) {
  throw new Error('restaurants.json must contain an array of restaurant objects.');
}

function sqlEscape(value) {
  if (value === null || value === undefined || value === '') {
    return 'null';
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededNumber(key, min, max) {
  const fraction = (hashString(key) % 10000) / 10000;
  return min + (max - min) * fraction;
}

function seededInteger(key, min, max) {
  return Math.floor(seededNumber(key, min, max + 1));
}

function cityBase(city) {
  switch (city) {
    case 'Prizren':
      return { latitude: 42.213, longitude: 20.739 };
    case 'Peje':
      return { latitude: 42.659, longitude: 20.288 };
    case 'Ferizaj':
      return { latitude: 42.3708, longitude: 21.1553 };
    case 'Gjakova':
      return { latitude: 42.3831, longitude: 20.4309 };
    default:
      return { latitude: 42.6629, longitude: 21.1655 };
  }
}

function formatDecimal(value) {
  return Number(value).toFixed(6);
}

const slugCounts = new Map();
const rows = data.map((item, index) => {
  const name = String(item.name ?? `Restaurant ${index + 1}`).trim();
  const baseSlug = slugify(name) || `restaurant-${index + 1}`;
  const nextCount = (slugCounts.get(baseSlug) ?? 0) + 1;
  slugCounts.set(baseSlug, nextCount);
  const slug = nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`;

  const city = String(item.city ?? 'Prishtina').trim() || 'Prishtina';
  const cuisine = Array.isArray(item.cuisine)
    ? item.cuisine.filter(Boolean).join(', ')
    : String(item.cuisine ?? '').trim();
  const description = String(item.description ?? '').trim();
  const imageUrl = String(item.image ?? '').trim();
  const base = cityBase(city);
  const latitude = formatDecimal(base.latitude + seededNumber(`${slug}-lat`, -0.012, 0.012));
  const longitude = formatDecimal(base.longitude + seededNumber(`${slug}-lng`, -0.012, 0.012));
  const rating = seededNumber(`${slug}-rating`, 3.6, 4.9).toFixed(1);
  const isFeatured = Number(rating) >= 4.7 || index < 24;
  const priceRange = ['€', '€€', '€€€'][seededInteger(`${slug}-price`, 0, 2)];

  return {
    slug,
    name,
    description: description || cuisine || city,
    city,
    address: `${city} Center`,
    cuisine: cuisine || null,
    priceRange,
    rating,
    latitude,
    longitude,
    phone: null,
    website: null,
    isFeatured,
    imageUrl: imageUrl || null,
    altText: `Photo of ${name}`,
  };
});

const restaurantValues = rows
  .map(
    (row) => `  (
    ${sqlEscape(row.name)},
    ${sqlEscape(row.slug)},
    ${sqlEscape(row.description)},
    ${sqlEscape(row.city)},
    ${sqlEscape(row.address)},
    ${sqlEscape(row.cuisine)},
    ${sqlEscape(row.priceRange)},
    ${row.rating},
    ${row.latitude},
    ${row.longitude},
    ${sqlEscape(row.phone)},
    ${sqlEscape(row.website)},
    ${row.isFeatured ? 'true' : 'false'},
    true
  )`
  )
  .join(',\n');

const slugList = rows.map((row) => `    ${sqlEscape(row.slug)}`).join(',\n');

const imageValues = rows
  .filter((row) => row.imageUrl)
  .map((row) => `    (${sqlEscape(row.slug)}, ${sqlEscape(row.imageUrl)}, ${sqlEscape(row.altText)}, 0)`)
  .join(',\n');

const sql = `begin;

insert into public.restaurants (
  name,
  slug,
  description,
  city,
  address,
  cuisine,
  price_range,
  rating,
  latitude,
  longitude,
  phone,
  website,
  is_featured,
  is_published
)
values
${restaurantValues}
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  city = excluded.city,
  address = excluded.address,
  cuisine = excluded.cuisine,
  price_range = excluded.price_range,
  rating = excluded.rating,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone = excluded.phone,
  website = excluded.website,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

delete from public.restaurant_images
where restaurant_id in (
  select id
  from public.restaurants
  where slug in (
${slugList}
  )
);

insert into public.restaurant_images (restaurant_id, image_url, alt_text, sort_order)
select r.id, v.image_url, v.alt_text, v.sort_order
from public.restaurants r
join (
  values
${imageValues}
) as v(slug, image_url, alt_text, sort_order)
  on v.slug = r.slug;

commit;
`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${rows.length} restaurant rows from ${sourcePath} to ${outputPath}`);
