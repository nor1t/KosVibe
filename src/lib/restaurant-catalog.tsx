import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from './supabase';
import { getRestaurantById as getLocalRestaurantById, type Restaurant } from '../data/mockData';
import { RESTAURANTS_JSON as generatedRestaurants } from '../data/restaurantsData';

export type RestaurantCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  cuisine: string | null;
  priceRange: string | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

type RestaurantCatalogContextValue = {
  restaurants: RestaurantCatalogItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getRestaurantById: (restaurantId: string) => Restaurant | undefined;
};

const RestaurantCatalogContext = createContext<RestaurantCatalogContextValue | undefined>(undefined);

const generatedRestaurantsById = new Map(generatedRestaurants.map((restaurant) => [restaurant.id, restaurant]));

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildFallbackRestaurant(item: RestaurantCatalogItem): Restaurant {
  const latitude = item.latitude ?? 42.6629;
  const longitude = item.longitude ?? 21.1655;
  const priceRange = item.priceRange ?? '€€';
  const cuisine = item.cuisine ?? 'Restaurant';
  const image = item.imageUrl ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';
  const description = item.description ?? cuisine;

  return {
    id: item.id,
    name: item.name,
    cuisine,
    tagline: description,
    priceRange,
    rating: item.rating ?? 0,
    reviewCount: 0,
    distance: 'Nearby',
    isOpen: true,
    image,
    heroImage: image,
    address: item.address ?? item.city,
    phone: item.phone ?? '+383 44 000 000',
    hours: 'Open daily',
    city: item.city,
    coordinates: {
      latitude,
      longitude,
    },
    todaySpecial: {
      name: `${item.name} Special`,
      description: item.description ?? `A featured dish from ${item.name}.`,
      originalPrice: '€10',
      price: '€8',
      discount: '-20%',
      image,
    },
    promotions: [],
    menuSections: [],
    reviews: [],
  };
}

function buildCatalogRestaurant(item: RestaurantCatalogItem): Restaurant {
  const localRestaurant = getLocalRestaurantById(item.id);
  const generatedRestaurant = generatedRestaurantsById.get(item.id);
  return localRestaurant ?? generatedRestaurant ?? buildFallbackRestaurant(item);
}

function normalizeGeneratedRestaurant(restaurant: Restaurant): RestaurantCatalogItem {
  return {
    id: restaurant.id,
    slug: slugify(restaurant.name) || restaurant.id,
    name: restaurant.name,
    description: restaurant.tagline ?? restaurant.cuisine,
    city: restaurant.city,
    address: restaurant.address,
    cuisine: restaurant.cuisine,
    priceRange: restaurant.priceRange,
    rating: restaurant.rating,
    latitude: restaurant.coordinates.latitude,
    longitude: restaurant.coordinates.longitude,
    phone: restaurant.phone,
    website: null,
    imageUrl: restaurant.image ?? restaurant.heroImage ?? null,
    isFeatured: restaurant.rating >= 4.7,
  };
}

function mergeCatalogs(primary: RestaurantCatalogItem[], fallback: RestaurantCatalogItem[]) {
  const seen = new Set<string>();
  const merged: RestaurantCatalogItem[] = [];

  for (const restaurant of [...primary, ...fallback]) {
    const key = `${restaurant.slug.toLowerCase()}|${restaurant.city.toLowerCase()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(restaurant);
  }

  return merged;
}

async function loadRestaurants(): Promise<RestaurantCatalogItem[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select(
      'id, slug, name, description, city, address, cuisine, price_range, rating, latitude, longitude, phone, website, is_featured, restaurant_images ( image_url, alt_text, sort_order )'
    )
    .range(0, 9999)
    .order('name', { ascending: true });

  if (error) {
    throw error;
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
      imageUrl:
        Array.isArray(row.restaurant_images) && row.restaurant_images.length > 0
          ? [...row.restaurant_images].sort((left, right) => left.sort_order - right.sort_order)[0]
              ?.image_url ?? null
          : null,
      isFeatured: Boolean(row.is_featured),
    })) ?? []
  );
}

function getGeneratedCatalogFallback() {
  return generatedRestaurants.map(normalizeGeneratedRestaurant);
}

export function RestaurantCatalogProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<RestaurantCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const remoteRestaurants = await loadRestaurants();
      const nextRestaurants =
        remoteRestaurants.length >= 200
          ? remoteRestaurants
          : mergeCatalogs(remoteRestaurants, getGeneratedCatalogFallback());
      setRestaurants(nextRestaurants);

      if (remoteRestaurants.length < 200) {
        console.info(
          `Loaded ${remoteRestaurants.length} restaurants from Supabase and merged the bundled catalog so the full list stays visible.`
        );
      }
    } catch (loadError) {
      console.error('Failed to load restaurants from Supabase', loadError);
      setError('Could not load restaurants from Supabase.');
      setRestaurants(getGeneratedCatalogFallback());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getRestaurantById = useCallback(
    (restaurantId: string) => {
      const item = restaurants.find((restaurant) => restaurant.id === restaurantId);
      return item
        ? buildCatalogRestaurant(item)
        : generatedRestaurantsById.get(restaurantId) ?? getLocalRestaurantById(restaurantId);
    },
    [restaurants]
  );

  const value = useMemo<RestaurantCatalogContextValue>(
    () => ({
      restaurants,
      loading,
      error,
      refresh,
      getRestaurantById,
    }),
    [error, getRestaurantById, loading, refresh, restaurants]
  );

  return <RestaurantCatalogContext.Provider value={value}>{children}</RestaurantCatalogContext.Provider>;
}

export function useRestaurantCatalog() {
  const context = useContext(RestaurantCatalogContext);

  if (!context) {
    throw new Error('useRestaurantCatalog must be used within RestaurantCatalogProvider');
  }

  return context;
}
