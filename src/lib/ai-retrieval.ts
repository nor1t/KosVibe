/**
 * Sprint 9 — AI Retrieval Layer
 *
 * Prepare structured context from the database for LLM consumption.
 * These functions do NOT make AI API calls — they assemble the
 * text/document chunks that an LLM would receive.
 */

import { supabase } from './supabase';
import type { Restaurant } from '../repositories/types';

/**
 * Build a structured text blob for a restaurant for AI context.
 * Includes: name, cuisine, description, price range, rating,
 * address, hours, today's special, reviews summary.
 */
export async function buildRestaurantContext(restaurant: Restaurant): Promise<string> {
  const parts: string[] = [];

  parts.push(`Restaurant: ${restaurant.name}`);
  parts.push(`Cuisine: ${restaurant.cuisine}`);
  parts.push(`Description: ${restaurant.tagline}`);
  parts.push(`Price Range: ${restaurant.priceRange}`);
  parts.push(`Rating: ${restaurant.rating.toFixed(1)} (${restaurant.reviewCount} reviews)`);
  parts.push(`Address: ${restaurant.address}`);
  parts.push(`Hours: ${restaurant.hours}`);
  parts.push(`City: ${restaurant.city}`);

  if (restaurant.todaySpecial?.name) {
    parts.push(`Today's Special: ${restaurant.todaySpecial.name} - ${restaurant.todaySpecial.description} (${restaurant.todaySpecial.price}, was ${restaurant.todaySpecial.originalPrice})`);
  }

  if (restaurant.menuSections.length > 0) {
    const menuItems = restaurant.menuSections
      .map((section) => `  ${section.title}: ${section.items.map((item) => `${item.name} (${item.price})`).join(', ')}`)
      .join('\n');
    parts.push(`Menu:\n${menuItems}`);
  }

  if (restaurant.reviews.length > 0) {
    const reviewTexts = restaurant.reviews
      .slice(0, 5)
      .map((r) => `  - ${r.author} (${r.rating}/5): "${r.comment}"`)
      .join('\n');
    parts.push(`Recent Reviews:\n${reviewTexts}`);
  }

  return parts.join('\n\n');
}

/**
 * Build context from search results.
 */
export async function buildSearchContext(query: string): Promise<string> {
  const parts: string[] = [`User search query: "${query}"`];

  const { data, error } = await supabase.rpc('search_all', {
    search_term: query,
    page_size: 5,
    page_num: 1,
    sort_by: 'relevance',
  });

  if (!error && data) {
    const results = data as Array<Record<string, unknown>>;
    if (results.length > 0) {
      parts.push(`\nTop search results:`);
      for (const r of results) {
        parts.push(
          `  - [${r.type}] ${r.name} (${r.city || 'Unknown'})` +
          ` - ${(r.description as string)?.slice(0, 100) || ''} - Rating: ${r.rating}`
        );
      }
    }
  }

  return parts.join('\n');
}

/**
 * Build context for an event.
 */
export async function buildEventContext(eventId: string): Promise<string> {
  const parts: string[] = [];

  const { data: event } = await supabase
    .from('event_highlights')
    .select('*')
    .eq('id', eventId)
    .single();

  if (event) {
    parts.push(`Event: ${event.title}`);
    parts.push(`Category: ${event.category}`);
    parts.push(`Venue: ${event.venue}`);
    parts.push(`Date: ${event.date_display}`);
    parts.push(`Description: ${event.description}`);
  }

  return parts.join('\n\n');
}

/**
 * Build context for personalized recommendations.
 * Aggregates user's favorites, recent views, and top-rated in their city.
 */
export async function buildRecommendationContext(userId: string): Promise<string> {
  const parts: string[] = [];

  // User's saved restaurants
  const { data: saved } = await supabase
    .from('saved_restaurants')
    .select('restaurant_id')
    .eq('user_id', userId)
    .limit(10);

  if (saved && saved.length > 0) {
    parts.push(`User has ${saved.length} saved restaurants.`);
  }

  // Recent recommendation events
  const { data: recentEvents } = await supabase
    .from('recommendation_events')
    .select('action, entity_type, entity_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (recentEvents && recentEvents.length > 0) {
    const actions = recentEvents.map((e) => `${e.action} ${e.entity_type}/${e.entity_id}`);
    parts.push(`Recent interactions: ${actions.join(', ')}`);
  }

  return parts.join('\n\n');
}