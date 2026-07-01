import { supabase } from '../lib/supabase';
import type { IRestaurantsRepository, Restaurant, RestaurantCatalogItem, FeaturedMenuItem } from './types';

/**
 * Sprint 4 — Database-backed Restaurant Repository
 *
 * All restaurant data now comes from the database. The mock-data fallback
 * chain has been removed. The `Restaurant` model shape remains identical
 * so screens need no changes.
 */

// ─── DB query helpers ───────────────────────────────────────────────────────

async function loadCatalog(): Promise<RestaurantCatalogItem[]> {
  const { data, error } = await supabase
    .from('place_catalog')
    .select('*')
    .range(0, 9999)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to load place catalog from Supabase', error);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description ?? null,
      city: row.city,
      address: row.address ?? null,
      cuisine: row.cuisine ?? null,
      priceRange: row.price_range ?? null,
      rating: Number.isFinite(Number(row.rating)) ? Number(row.rating) : 0,
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      phone: row.phone ?? null,
      website: row.website ?? null,
      imageUrl: row.image_url ?? null,
      isFeatured: Boolean(row.is_featured),
    })) ?? []
  );
}

/**
 * Load full restaurant detail from the place-centered schema.
 * Joins: places, restaurant_profiles, place_images, place_hours,
 * place_contacts, menu_categories/menu_items, restaurant_reviews,
 * restaurant_promotions, restaurant_specials.
 */
async function loadRestaurantDetail(placeId: string): Promise<Restaurant | null> {
  // Load place + profile in one query
  const { data: placeData, error: placeError } = await supabase
    .from('places')
    .select(`
      *,
      restaurant_profiles!inner(*),
      place_images(*),
      place_hours(*),
      place_contacts(*),
      restaurant_reviews(*),
      restaurant_promotions(*),
      restaurant_specials(*)
    `)
    .eq('id', placeId)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single();

  if (placeError || !placeData) {
    console.error('Failed to load place detail', placeError);
    return null;
  }

  // Load menu
  const { data: menuCategories } = await supabase
    .from('menu_categories')
    .select(`
      id,
      name,
      description,
      sort_order,
      menu_items(
        id, name, description, price, image_url, image_alt_text, sort_order, is_available
      )
    `)
    .eq('restaurant_id', placeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return buildRestaurant(placeData, menuCategories ?? []);
}

function buildRestaurant(
  place: Record<string, unknown>,
  menuCategories: Array<Record<string, unknown>>
): Restaurant {
  const profile = place.restaurant_profiles as Record<string, unknown> | undefined;
  const images = (place.place_images as Array<Record<string, unknown>>) ?? [];
  const hours = (place.place_hours as Array<Record<string, unknown>>) ?? [];
  const contacts = (place.place_contacts as Array<Record<string, unknown>>) ?? [];
  const reviews = (place.restaurant_reviews as Array<Record<string, unknown>>) ?? [];
  const promotions = (place.restaurant_promotions as Array<Record<string, unknown>>) ?? [];
  const specials = (place.restaurant_specials as Array<Record<string, unknown>>) ?? [];

  // Primary image
  const primaryImage =
    images.find((img) => img.is_primary === true) ??
    images.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))[0];

  const imageUrl =
    (primaryImage?.image_url as string) ??
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

  // Phone
  const phoneContact = contacts.find((c) => c.kind === 'phone' && c.is_primary === true) ??
    contacts.find((c) => c.kind === 'phone');
  const phone = (phoneContact?.value as string) ?? '+383 44 000 000';

  // Address
  const address = (place.address as string) ?? (place.city as string) ?? '';

  // Hours display
  const hoursText =
    (profile?.hours_text as string) ??
    formatHours(hours as PlaceHour[]);

  // Cuisine
  const cuisine = (profile?.cuisine as string) ?? (place.description as string) ?? 'Restaurant';

  // Tagline
  const tagline = (profile?.tagline as string) ?? (place.description as string) ?? cuisine;

  // Today special
  const primarySpecial = specials.sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  )[0];

  const todaySpecial = primarySpecial
    ? {
        name: primarySpecial.name as string,
        description: (primarySpecial.description as string) ?? '',
        originalPrice: (primarySpecial.original_price as string) ?? '',
        price: (primarySpecial.price as string) ?? '',
        discount: (primarySpecial.discount_label as string) ?? '',
        availableUntil: (primarySpecial.available_until as string) ?? undefined,
        image: (primarySpecial.image_url as string) ?? imageUrl,
      }
    : {
        name: '',
        description: '',
        originalPrice: '',
        price: '',
        discount: '',
        image: imageUrl,
      };

  // Promotions
  const promotionList = (promotions as Array<Record<string, unknown>>).slice(0, 5).map((p) => ({
    id: p.id as string,
    title: p.title as string,
    subtitle: p.subtitle as string,
  }));

  // Menu sections
  const menuSections = (menuCategories ?? []).map((cat) => {
    const items = (cat.menu_items as Array<Record<string, unknown>>) ?? [];
    return {
      id: cat.id as string,
      title: cat.name as string,
      items: items.map((item) => ({
        id: item.id as string,
        name: item.name as string,
        description: (item.description as string) ?? '',
        price: formatPrice(Number(item.price)),
        image: (item.image_url as string) ?? undefined,
      })),
    };
  });

  // Reviews
  const reviewList = (reviews as Array<Record<string, unknown>>)
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
    .slice(0, 20)
    .map((r) => ({
      id: r.id as string,
      author: r.author_name as string,
      comment: r.comment as string,
      rating: Number(r.rating),
      timeAgo: timeAgo(new Date(r.created_at as string)),
    }));

  // Rating from reviews or fallback to place rating
  const computedRating =
    reviewList.length > 0
      ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
      : (Number(place.rating) || 0);

  // isOpen from profile
  const isOpen = profile?.is_open_now !== false;

  // Distance (will be computed client-side or shown as "Nearby")
  const distance = 'Nearby';

  return {
    id: place.id as string,
    name: place.name as string,
    cuisine,
    tagline,
    priceRange: (place.price_range as string) ?? '€€',
    rating: Math.round(computedRating * 10) / 10,
    reviewCount: reviewList.length || (place.review_count as number) || 0,
    distance,
    isOpen,
    image: imageUrl,
    heroImage: imageUrl,
    address,
    phone,
    hours: hoursText,
    city: (place.city as string) ?? '',
    coordinates: {
      latitude: Number(place.latitude ?? 42.6629),
      longitude: Number(place.longitude ?? 21.1655),
    },
    todaySpecial,
    promotions: promotionList,
    menuSections,
    reviews: reviewList,
  };
}

type PlaceHour = {
  day_of_week?: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed?: boolean;
  sort_order?: number;
};

function formatHours(hours: PlaceHour[]): string {
  if (hours.length === 0) return 'Open daily';

  const sorted = [...hours].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const activeHours = sorted.filter((h) => !h.is_closed && h.open_time && h.close_time);

  if (activeHours.length === 0) return 'Hours unavailable';

  // Check if all days have the same times
  const firstTime = `${activeHours[0].open_time} - ${activeHours[0].close_time}`;
  const allSame = activeHours.every(
    (h) => `${h.open_time} - ${h.close_time}` === firstTime
  );

  if (allSame) return firstTime;

  // Try to find consecutive ranges
  const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const ranges = buildHourRanges(sorted, dayNames);

  return ranges.length > 0 ? ranges.join(', ') : firstTime;
}

function buildHourRanges(
  hours: PlaceHour[],
  dayNames: string[]
): string[] {
  const dayMap = new Map<string, string>();
  for (const h of hours) {
    if (h.day_of_week && !h.is_closed && h.open_time && h.close_time) {
      dayMap.set(h.day_of_week, `${h.open_time} - ${h.close_time}`);
    }
  }

  const ranges: string[] = [];
  let rangeStart: string | null = null;
  let rangeEnd: string | null = null;
  let rangeTime: string | null = null;

  for (let i = 0; i < dayNames.length; i++) {
    const day = dayNames[i];
    const time = dayMap.get(day);

    if (time) {
      if (rangeStart === null) {
        rangeStart = day;
        rangeEnd = day;
        rangeTime = time;
      } else if (time === rangeTime) {
        rangeEnd = day;
      } else {
        ranges.push(formatDayRange(rangeStart, rangeEnd!, rangeTime!));
        rangeStart = day;
        rangeEnd = day;
        rangeTime = time;
      }
    } else if (rangeStart !== null) {
      ranges.push(formatDayRange(rangeStart, rangeEnd!, rangeTime!));
      rangeStart = null;
      rangeEnd = null;
      rangeTime = null;
    }
  }

  if (rangeStart !== null) {
    ranges.push(formatDayRange(rangeStart, rangeEnd!, rangeTime!));
  }

  return ranges;
}

function formatDayRange(start: string, end: string, time: string): string {
  const dayLabels: Record<string, string> = {
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
    fri: 'Fri', sat: 'Sat', sun: 'Sun',
  };

  if (start === end) {
    return `${dayLabels[start] ?? start}: ${time}`;
  }

  return `${dayLabels[start] ?? start}-${dayLabels[end] ?? end}: ${time}`;
}

function formatPrice(price: number): string {
  if (Number.isFinite(price) && price === Math.floor(price)) {
    return `€${price.toFixed(0)}`;
  }

  return `€${price.toFixed(2)}`;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

// ─── Nearvy Vibes restaurant IDs (curated list) ─────────────────────────────

const nearbyVibesRestaurantSlugs = [
  'pishat',
  'sushi-bar-tokio',
  'pizza-napoli',
  'cafe-renaissance',
  'grill-house',
  'bar-metropol',
] as const;

// ─── Repository class ───────────────────────────────────────────────────────

export class RestaurantsRepository implements IRestaurantsRepository {
  private catalog: RestaurantCatalogItem[] = [];
  private detailCache = new Map<string, Restaurant>();

  async refreshCatalog(): Promise<RestaurantCatalogItem[]> {
    try {
      const remoteRestaurants = await loadCatalog();
      this.catalog = remoteRestaurants;
      this.detailCache.clear();

      if (remoteRestaurants.length === 0) {
        console.warn('Restaurant catalog is empty — Supabase may not have restaurant data yet.');
      }
    } catch (loadError) {
      console.error('Failed to refresh restaurant catalog', loadError);
    }

    return this.getCatalogItemsSnapshot();
  }

  async getCatalogItems(): Promise<RestaurantCatalogItem[]> {
    if (this.catalog.length === 0) {
      await this.refreshCatalog();
    }

    return this.getCatalogItemsSnapshot();
  }

  async getCatalogItemById(restaurantId: string): Promise<Restaurant | undefined> {
    return this.getByIdAsync(restaurantId);
  }

  getAll(): Restaurant[] {
    // Synchronous access returns cached detail or empty
    // Use async methods (getCatalogItems, getByIdAsync) for DB-backed data
    return [...this.detailCache.values()];
  }

  getById(restaurantId: string): Restaurant | undefined {
    // Synchronous access from cache only
    return this.detailCache.get(restaurantId);
  }

  async getByIdAsync(restaurantId: string): Promise<Restaurant | undefined> {
    // Check cache first
    if (this.detailCache.has(restaurantId)) {
      return this.detailCache.get(restaurantId);
    }

    const restaurant = await loadRestaurantDetail(restaurantId);
    if (restaurant) {
      this.detailCache.set(restaurantId, restaurant);
    }

    return restaurant ?? undefined;
  }

  getNearbyVibes(): Restaurant[] {
    // Return restaurants from the detail cache
    const cached = [...this.detailCache.values()];
    if (cached.length === 0) return [];

    // Match featured catalog slugs to cached details
    const vibes: Restaurant[] = [];
    for (const item of this.catalog) {
      if (nearbyVibesRestaurantSlugs.includes(item.slug as typeof nearbyVibesRestaurantSlugs[number])) {
        const detail = this.detailCache.get(item.id);
        if (detail) vibes.push(detail);
      }
    }

    // Fallback: return first few cached restaurants if no featured match
    if (vibes.length === 0) return cached.slice(0, 6);
    return vibes;
  }

  getFeaturedMenuItems(): FeaturedMenuItem[] {
    // Synchronous access — returns empty; use async method instead
    return [];
  }

  private getCatalogItemsSnapshot(): RestaurantCatalogItem[] {
    return this.catalog.map((restaurant) => ({ ...restaurant }));
  }
}

export const restaurantsRepository = new RestaurantsRepository();