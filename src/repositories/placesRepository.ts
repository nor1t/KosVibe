import { supabase } from '../lib/supabase';
import type {
  DiscoveryLocation,
  ExploreSpot,
  FunActivity,
  IPlacesRepository,
  MapRegion,
  MonumentSpot,
  Restaurant,
} from './types';

/**
 * Sprint 11 — Database-backed Places Repository
 *
 * Discovery locations now query the `cities` table (seeded in Sprint 2).
 * Monument/explore spots query `place_highlights`.
 * Fun activities query `fun_activities`.
 * Map region calculation is client-side (unchanged).
 */

function buildDiscoveryLocation(row: Record<string, unknown>): DiscoveryLocation {
  return {
    id: row.slug as string,
    label: `${row.name as string}, Kosovo`,
    city: row.name as string,
    region: {
      latitude: Number(row.latitude ?? 42.63),
      longitude: Number(row.longitude ?? 20.92),
      latitudeDelta: Number(row.default_zoom ?? 0.11),
      longitudeDelta: Number(row.default_zoom ?? 0.11),
    },
  };
}

function buildMonumentSpot(row: Record<string, unknown>): MonumentSpot {
  return {
    id: row.id as string,
    type: row.highlight_type as 'monument' | 'nature',
    title: row.title as string,
    titleSq: row.title_sq as string,
    location: row.location as string,
    locationSq: row.location_sq as string,
    image: row.image_url as string,
    coordinate: {
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
    },
    photoCredit: (row.photo_credit as string) ?? '',
    detail: row.detail as string,
    detailSq: row.detail_sq as string,
  };
}

function buildExploreSpot(row: Record<string, unknown>): ExploreSpot {
  return {
    id: row.id as string,
    category: row.category as ExploreSpot['category'],
    title: row.title as string,
    subtitle: row.subtitle as string,
    city: row.city as string,
    distance: row.distance as string,
    coordinate: {
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
    },
    color: row.accent_color as string,
    accentLabel: row.accent_label as string,
  };
}

function buildFunActivity(row: Record<string, unknown>): FunActivity {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string,
    summary: row.summary as string,
    city: row.city as string,
    icon: row.icon_name as string,
    accentColor: row.accent_color as string,
    backgroundColor: row.background_color as string,
  };
}

export class PlacesRepository implements IPlacesRepository {
  private discoveryCache: DiscoveryLocation[] = [];
  private monumentCache: MonumentSpot[] = [];
  private exploreCache: ExploreSpot[] = [];
  private funCache: FunActivity[] = [];
  private initialized = false;

  async refresh(): Promise<void> {
    const [citiesRes, monumentsRes, exploreRes, funRes] = await Promise.all([
      supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      supabase
        .from('place_highlights')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .in('highlight_type', ['monument', 'nature'])
        .order('sort_order', { ascending: true }),
      supabase
        .from('place_highlights')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .eq('highlight_type', 'explore')
        .order('sort_order', { ascending: true }),
      supabase
        .from('fun_activities')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
    ]);

    if (citiesRes.data) {
      const allLabel: DiscoveryLocation = {
        id: 'all',
        label: 'All Kosovo',
        city: null,
        region: { latitude: 42.63, longitude: 20.92, latitudeDelta: 0.78, longitudeDelta: 0.78 },
      };
      const cities = citiesRes.data.map(buildDiscoveryLocation);
      this.discoveryCache = [allLabel, ...cities];
    }

    if (monumentsRes.data) this.monumentCache = monumentsRes.data.map(buildMonumentSpot);
    if (exploreRes.data) this.exploreCache = exploreRes.data.map(buildExploreSpot);
    if (funRes.data) this.funCache = funRes.data.map(buildFunActivity);

    this.initialized = true;
  }

  private async ensureReady(): Promise<void> {
    if (!this.initialized) await this.refresh();
  }

  private getDefaultLocation(): DiscoveryLocation {
    return {
      id: 'all',
      label: 'All Kosovo',
      city: null,
      region: { latitude: 42.63, longitude: 20.92, latitudeDelta: 0.78, longitudeDelta: 0.78 },
    };
  }

  getDiscoveryLocations(): DiscoveryLocation[] {
    if (this.discoveryCache.length === 0) return [this.getDefaultLocation()];
    return this.discoveryCache.map((l) => ({ ...l, region: { ...l.region } }));
  }

  getLocationById(locationId: string): DiscoveryLocation {
    const locations = this.getDiscoveryLocations();
    return locations.find((l) => l.id === locationId) ?? locations[0] ?? this.getDefaultLocation();
  }

  getMonumentSpots(): MonumentSpot[] {
    return this.monumentCache.map((s) => ({ ...s, coordinate: { ...s.coordinate } }));
  }

  getExploreSpots(): ExploreSpot[] {
    return this.exploreCache.map((s) => ({ ...s, coordinate: { ...s.coordinate } }));
  }

  getFunActivities(): FunActivity[] {
    if (this.funCache.length === 0) {
      return [
        { id: 'germia-park', title: 'Germia Park', subtitle: 'Forest walks, bike rides, fresh air', summary: 'Green escape close to the city', city: 'Prishtina', icon: 'bicycle-outline', accentColor: '#42D98C', backgroundColor: 'rgba(66,217,140,0.16)' },
        { id: 'prizren-fortress', title: 'Prizren Fortress', subtitle: 'Sunset views, old-town steps', summary: 'Classic Prizren climb', city: 'Prizren', icon: 'business-outline', accentColor: '#FFB300', backgroundColor: 'rgba(255,179,0,0.16)' },
        { id: 'rugova-canyon', title: 'Rugova Canyon', subtitle: 'Adventure routes, scenic drives', summary: 'Dramatic canyon near Peje', city: 'Peje', icon: 'trail-sign-outline', accentColor: '#8F7CFF', backgroundColor: 'rgba(143,124,255,0.16)' },
      ];
    }
    return this.funCache.map((a) => ({ ...a }));
  }

  getMapRegionForRestaurants(restaurants: Restaurant[]): MapRegion {
    if (restaurants.length === 0) {
      return { latitude: 42.63, longitude: 20.92, latitudeDelta: 0.78, longitudeDelta: 0.78 };
    }
    if (restaurants.length === 1) {
      return {
        latitude: restaurants[0].coordinates.latitude,
        longitude: restaurants[0].coordinates.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    const lats = restaurants.map((r) => r.coordinates.latitude);
    const lngs = restaurants.map((r) => r.coordinates.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.12),
      longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.12),
    };
  }
}

export const placesRepository = new PlacesRepository();