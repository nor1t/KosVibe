/**
 * Sprint 3 — Restaurants Repository
 *
 * Implements `IRestaurantsRepository`. Centralizes access to restaurant data,
 * including the mock catalog, nearby vibes, featured menu items, and the
 * Supabase-backed catalog (with mock fallback).
 *
 * Screens no longer import restaurant data directly from `mockData` — they go
 * through this repository.
 */

import {
  restaurants as mockRestaurants,
  restaurantById as mockRestaurantById,
  featuredMenuItems,
  getRestaurantById as getMockRestaurantById,
  type Restaurant,
  type FeaturedMenuItem,
} from '../data/mockData';
import { nearbyVibesRestaurants } from '../data/nearbyVibesRestaurants';
import { RESTAURANTS_JSON } from '../data/restaurantsData';
import { supabase } from '../lib/supabase';
import type { IRestaurantsRepository, RestaurantCatalogItem } from './types';

// ─── Supabase catalog row type ───────────────────────────────────────────────

type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  cuisine: string | null;
  price_range: string | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  is_featured: boolean;
};

// ─── Catalog adapter (Supabase row → frontend Restaurant) ────────────────────

function adaptCatalogRow(row: CatalogRow): Restaurant {
  const fallback = mockRestaurantById[row.id];

  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine ?? fallback?.cuisine ?? 'International',
    tagline: row.cuisine ?? fallback?.tagline ?? row.name,
    priceRange: row.price_range ?? fallback?.priceRange ?? '€€',
    rating: row.rating ?? fallback?.rating ?? 4.5,
    reviewCount: fallback?.reviewCount ?? 0,
    distance: fallback?.distance ?? '—',
    isOpen: fallback?.isOpen ?? true,
    image: row.image_url ?? fallback?.image ?? '',
    heroImage: row.image_url ?? fallback?.heroImage ?? '',
    address: row.address ?? fallback?.address ?? row.city,
    phone: row.phone ?? fallback?.phone ?? '',
    hours: fallback?.hours ?? '09:00 - 23:00',
    city: row.city,
    coordinates: {
      latitude: row.latitude ?? fallback?.coordinates.latitude ?? 42.6629,
      longitude: row.longitude ?? fallback?.coordinates.longitude ?? 21.1655,
    },
    todaySpecial: fallback?.todaySpecial ?? {
      name: 'Chef Special',
      description: 'Ask your server for today’s special.',
      originalPrice: '€10',
      price: '€7',
      discount: '-30%',
      image: '',
    },
    promotions: fallback?.promotions ?? [],
    menuSections: fallback?.menuSections ?? [],
    reviews: fallback?.reviews ?? [],
  };
}

export class RestaurantsRepository implements IRestaurantsRepository {
  /**
   * Returns the full mock restaurant list (handcrafted + generated).
   * This is the synchronous in-memory catalog used by discovery/map screens.
   */
  getAll(): Restaurant[] {
    return mockRestaurants;
  }

  getById(restaurantId: string): Restaurant | undefined {
    return getMockRestaurantById(restaurantId);
  }

  getNearbyVibes(): Restaurant[] {
    return nearbyVibesRestaurants;
  }

  getFeaturedMenuItems(): FeaturedMenuItem[] {
    return featuredMenuItems;
  }

  /**
   * Fetches the Supabase-backed catalog. Falls back to the generated
   * `RESTAURANTS_JSON` dataset when Supabase is unavailable or empty.
   */
  async getCatalogItems(): Promise<RestaurantCatalogItem[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(
          'id, slug, name, description, city, address, cuisine, price_range, rating, latitude, longitude, phone, website, image_url, is_featured'
        )
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.getFallbackCatalog();
      }

      return (data as CatalogRow[]).map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        city: row.city,
        address: row.address,
        cuisine: row.cuisine,
        priceRange: row.price_range,
        rating: row.rating,
        latitude: row.latitude,
        longitude: row.longitude,
        phone: row.phone,
        website: row.website,
        imageUrl: row.image_url,
        isFeatured: row.is_featured,
      }));
    } catch {
      return this.getFallbackCatalog();
    }
  }

  /**
   * Fetches a single restaurant from the Supabase catalog and adapts it to
   * the frontend `Restaurant` model. Falls back to the mock catalog.
   */
  async getCatalogItemById(restaurantId: string): Promise<Restaurant | undefined> {
    const mockMatch = getMockRestaurantById(restaurantId);
    if (mockMatch) {
      return mockMatch;
    }

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(
          'id, slug, name, description, city, address, cuisine, price_range, rating, latitude, longitude, phone, website, image_url, is_featured'
        )
        .eq('id', restaurantId)
        .maybeSingle();

      if (error || !data) {
        return undefined;
      }

      return adaptCatalogRow(data as CatalogRow);
    } catch {
      return undefined;
    }
  }

  private getFallbackCatalog(): RestaurantCatalogItem[] {
    return RESTAURANTS_JSON.map((restaurant) => ({
      id: restaurant.id,
      slug: restaurant.id,
      name: restaurant.name,
      description: restaurant.tagline,
      city: restaurant.city,
      address: restaurant.address,
      cuisine: restaurant.cuisine,
      priceRange: restaurant.priceRange,
      rating: restaurant.rating,
      latitude: restaurant.coordinates.latitude,
      longitude: restaurant.coordinates.longitude,
      phone: restaurant.phone,
      website: null,
      imageUrl: restaurant.image,
      isFeatured: false,
    }));
  }
}

export const restaurantsRepository = new RestaurantsRepository();