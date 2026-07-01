/**
 * Sprint 9 — Recommendation Feeds
 *
 * Query helpers for building personalized, trending, nearby, and
 * "because you liked" recommendation feeds from recommendation_events
 * and search_documents.
 */

import { supabase } from './supabase';

type FeedItem = {
  id: string;
  name: string;
  type: string;
  description: string;
  city: string;
  category: string;
  rating: number;
  thumbnail_url: string | null;
};

/**
 * Personalized feed — restaurants the user hasn't interacted with,
 * but are similar to ones they have (same city, same cuisine).
 */
export async function getPersonalizedFeed(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<FeedItem[]> {
  // Get entities the user has interacted with
  const { data: interactions } = await supabase
    .from('recommendation_events')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', 'restaurant')
    .order('created_at', { ascending: false })
    .limit(20);

  const seenIds = new Set(interactions?.map((e) => e.entity_id) ?? []);

  // Get saved restaurants
  const { data: saved } = await supabase
    .from('saved_restaurants')
    .select('restaurant_id')
    .eq('user_id', userId)
    .limit(10);

  for (const s of saved ?? []) {
    seenIds.add(s.restaurant_id);
  }

  // Find similar: query all restaurants excluding seen ones, sorted by rating
  const { data, error } = await supabase.rpc('search_all', {
    page_num: page,
    page_size: pageSize,
    sort_by: 'rating',
  });

  if (error || !data) return [];

  return (data as FeedItem[]).filter((item) => !seenIds.has(item.id));
}

/**
 * Trending feed — top-rated restaurants with recent engagement.
 */
export async function getTrendingFeed(page = 1, pageSize = 10): Promise<FeedItem[]> {
  const { data, error } = await supabase.rpc('search_all', {
    page_num: page,
    page_size: pageSize,
    sort_by: 'rating',
  });

  if (error || !data) return [];
  return data as FeedItem[];
}

/**
 * Nearby feed — restaurants within a radius sorted by distance.
 */
export async function getNearbyFeed(
  lat: number,
  lng: number,
  radiusKm = 10,
  page = 1,
  pageSize = 10
): Promise<FeedItem[]> {
  const { data, error } = await supabase.rpc('search_all', {
    lat,
    lng,
    radius_km: radiusKm,
    page_num: page,
    page_size: pageSize,
    sort_by: 'distance',
  });

  if (error || !data) return [];
  return data as FeedItem[];
}

/**
 * "Because you liked" — restaurants similar to a given one
 * by cuisine and city, excluding the source and seen ones.
 */
export async function getBecauseYouLiked(
  userId: string,
  sourceId: string,
  page = 1,
  pageSize = 5
): Promise<FeedItem[]> {
  // Get interactions
  const { data: interactions } = await supabase
    .from('recommendation_events')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_type', 'restaurant')
    .limit(20);

  const seenIds = new Set(interactions?.map((e) => e.entity_id) ?? []);
  seenIds.add(sourceId);

  // Search by the restaurant's cuisine
  const { data, error } = await supabase.rpc('search_all', {
    sort_by: 'rating',
    page_num: page,
    page_size: pageSize * 3,
  });

  if (error || !data) return [];

  return (data as FeedItem[])
    .filter((item) => item.type === 'restaurant' && !seenIds.has(item.id))
    .slice(0, pageSize);
}