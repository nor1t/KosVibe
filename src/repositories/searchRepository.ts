import { supabase } from '../lib/supabase';
import { eventsRepository } from './eventsRepository';
import { placesRepository } from './placesRepository';
import { restaurantsRepository } from './restaurantsRepository';
import type {
  ActiveOffer,
  EventFeature,
  FeaturedMenuItem,
  ISearchRepository,
  Restaurant,
  SearchFilters,
  SearchResult,
} from './types';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function offerText(offer: ActiveOffer) {
  return `${offer.title} ${offer.venue}`.toLowerCase();
}

function eventText(event: EventFeature) {
  return `${event.title} ${event.venue} ${event.date} ${event.description}`.toLowerCase();
}

/**
 * Sprint 8 — PostgreSQL Full Text Search Repository
 *
 * Search now delegates to the `search_all` and `search_restaurants`
 * RPC functions backed by the `search_documents` materialized view
 * with weighted ts_rank, trigram similarity, and geo proximity.
 */

type SearchDoc = {
  id: string;
  type: string;
  name: string;
  description: string;
  city: string;
  category: string;
  rating: number;
  source_id: string;
  thumbnail_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export class SearchRepository implements ISearchRepository {
  search(filters: SearchFilters): SearchResult {
    // Sync fallback — returns empty, async searchAll() is the real implementation
    return {
      restaurants: [],
      featuredItems: [],
      offers: [],
      events: [],
    };
  }

  async searchAll(filters: SearchFilters & {
    page?: number;
    pageSize?: number;
    sortBy?: 'relevance' | 'rating' | 'distance';
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Promise<SearchResult & { total: number; page: number; hasMore: boolean }> {
    const location = placesRepository.getLocationById(filters.locationId);

    const { data, error } = await supabase.rpc('search_all', {
      search_term: filters.query || null,
      city_filter: location.city || null,
      category_filter: filters.category || null,
      lat: filters.lat ?? null,
      lng: filters.lng ?? null,
      radius_km: filters.radiusKm ?? null,
      page_num: filters.page ?? 1,
      page_size: filters.pageSize ?? 20,
      sort_by: filters.sortBy ?? 'relevance',
    });

    if (error || !data) {
      console.error('Search RPC failed', error);
      return {
        restaurants: [],
        featuredItems: [],
        offers: [],
        events: [],
        total: 0,
        page: filters.page ?? 1,
        hasMore: false,
      };
    }

    const docs = data as Array<SearchDoc & { relevance: number; total_count: number }>;
    const totalCount = docs.length > 0 ? Number(docs[0].total_count) : 0;

    const restaurantDocs = docs.filter((d) => d.type === 'restaurant');
    const eventDocs = docs.filter((d) => d.type === 'event');

    // Build Restaurant objects from search results
    const restaurants: Restaurant[] = restaurantDocs.map((doc) => ({
      id: doc.source_id,
      name: doc.name,
      cuisine: doc.category || '',
      tagline: doc.description || '',
      priceRange: '€€',
      rating: Number(doc.rating) || 0,
      reviewCount: 0,
      distance: 'Nearby',
      isOpen: true,
      image: doc.thumbnail_url || '',
      heroImage: doc.thumbnail_url || '',
      address: '',
      phone: '',
      hours: 'Open daily',
      city: doc.city,
      coordinates: {
        latitude: Number(doc.latitude ?? 42.6629),
        longitude: Number(doc.longitude ?? 21.1655),
      },
      todaySpecial: {
        name: `${doc.name} Special`,
        description: doc.description || '',
        originalPrice: '€10',
        price: '€8',
        discount: '-20%',
        image: doc.thumbnail_url || '',
      },
      promotions: [],
      menuSections: [],
      reviews: [],
    }));

    // Build EventFeature objects from search results
    const events: EventFeature[] = eventDocs.map((doc) => ({
      id: doc.id,
      title: doc.name,
      category: doc.category as EventFeature['category'],
      venue: doc.description || '',
      date: '',
      description: doc.description || '',
      colors: ['#A43AFF', '#F52698'] as const,
    }));

    return {
      restaurants,
      featuredItems: [],
      offers: [],
      events,
      total: totalCount,
      page: filters.page ?? 1,
      hasMore: (filters.page ?? 1) * (filters.pageSize ?? 20) < totalCount,
    };
  }

  searchRestaurants(locationId: string, query: string): Restaurant[] {
    const location = placesRepository.getLocationById(locationId);
    const normalizedQuery = normalize(query);

    return restaurantsRepository.getAll().filter((restaurant) => {
      const matchesLocation = location.city ? restaurant.city === location.city : true;
      const matchesQuery = normalizedQuery
        ? `${restaurant.name} ${restaurant.cuisine} ${restaurant.city} ${restaurant.tagline}`.toLowerCase().includes(normalizedQuery)
        : true;
      return matchesLocation && matchesQuery;
    });
  }

  async searchRestaurantsAsync(locationId: string, query: string): Promise<Restaurant[]> {
    const location = placesRepository.getLocationById(locationId);

    const { data, error } = await supabase.rpc('search_restaurants', {
      search_term: query || null,
      city_filter: location.city || null,
      category_filter: null,
      limit_count: 50,
    });

    if (error || !data) {
      return [];
    }

    const docs = data as SearchDoc[];

    return docs.map((doc) => ({
      id: doc.source_id,
      name: doc.name,
      cuisine: doc.category || '',
      tagline: doc.description || '',
      priceRange: '€€',
      rating: Number(doc.rating) || 0,
      reviewCount: 0,
      distance: 'Nearby',
      isOpen: true,
      image: doc.thumbnail_url || '',
      heroImage: doc.thumbnail_url || '',
      address: '',
      phone: '',
      hours: 'Open daily',
      city: doc.city,
      coordinates: {
        latitude: Number(doc.latitude ?? 42.6629),
        longitude: Number(doc.longitude ?? 21.1655),
      },
      todaySpecial: {
        name: `${doc.name} Special`,
        description: doc.description || '',
        originalPrice: '€10',
        price: '€8',
        discount: '-20%',
        image: doc.thumbnail_url || '',
      },
      promotions: [],
      menuSections: [],
      reviews: [],
    }));
  }

  searchFeaturedItems(locationId: string, query: string): FeaturedMenuItem[] {
    // Featured items are managed by restaurant_specials (Sprint 4)
    return [];
  }

  searchOffers(locationId: string, query: string): ActiveOffer[] {
    // Offers are restaurant_promotions (Sprint 4)
    const normalizedQuery = normalize(query);

    return eventsRepository.getActiveOffers().filter((offer) => {
      return normalizedQuery ? offerText(offer).includes(normalizedQuery) : true;
    });
  }

  private searchEvents(_locationId: string, query: string, category: SearchFilters['category']): EventFeature[] {
    const normalizedQuery = normalize(query);

    return eventsRepository.getEventHighlights().filter((event) => {
      const matchesCategory = category ? event.category === category : true;
      const matchesQuery = normalizedQuery ? eventText(event).includes(normalizedQuery) : true;
      return matchesCategory && matchesQuery;
    });
  }
}

export const searchRepository = new SearchRepository();