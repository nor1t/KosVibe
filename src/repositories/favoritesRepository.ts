import { supabase } from '../lib/supabase';
import { storiesRepository } from './StoriesRepository';
import { restaurantsRepository } from './restaurantsRepository';
import type { IFavoritesRepository, Restaurant, StoryItem } from './types';
import type { SupportedLanguage } from '../i18n/messages';

/**
 * Sprint 4 — Database-backed Favorites Repository
 *
 * Favorite restaurants are loaded from the `saved_restaurants` table.
 * The `getById` method on RestaurantsRepository serves from cache
 * (pre-populated by the catalog provider at startup).
 */

export class FavoritesRepository implements IFavoritesRepository {
  getFavoriteRestaurants(): Restaurant[] {
    // Synchronous: returns cached favorites from the repository's detail cache.
    // For real user-specific data, call getFavoriteRestaurantsAsync.
    return restaurantsRepository.getAll();
  }

  async getFavoriteRestaurantsAsync(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('saved_restaurants')
      .select('restaurant_id')
      .range(0, 50)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Failed to load saved restaurants', error);
      return [];
    }

    const restaurantIds = data.map((row) => row.restaurant_id);
    const restaurants = await Promise.all(
      restaurantIds.map((id) => restaurantsRepository.getByIdAsync(id))
    );

    return restaurants.filter((r): r is Restaurant => Boolean(r));
  }

  async getFavoriteRestaurantsByUser(userId: string): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('saved_restaurants')
      .select('restaurant_id')
      .eq('user_id', userId)
      .range(0, 50)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Failed to load user saved restaurants', error);
      return [];
    }

    const restaurantIds = data.map((row) => row.restaurant_id);
    const restaurants = await Promise.all(
      restaurantIds.map((id) => restaurantsRepository.getByIdAsync(id))
    );

    return restaurants.filter((r): r is Restaurant => Boolean(r));
  }

  getFavoriteStories(language: SupportedLanguage): StoryItem[] {
    return storiesRepository.getStories(language);
  }
}

export const favoritesRepository = new FavoritesRepository();