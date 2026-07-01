import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { restaurantsRepository } from '../repositories/restaurantsRepository';
import type { Restaurant, RestaurantCatalogItem } from '../repositories/types';

type RestaurantCatalogContextValue = {
  restaurants: RestaurantCatalogItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getRestaurantById: (restaurantId: string) => Restaurant | undefined;
};

const RestaurantCatalogContext = createContext<RestaurantCatalogContextValue | undefined>(undefined);

export function RestaurantCatalogProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<RestaurantCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextRestaurants = await restaurantsRepository.refreshCatalog();
      setRestaurants(nextRestaurants);

      // Pre-fetch details for all catalog items so sync getById works
      await Promise.allSettled(
        nextRestaurants.map((item) => restaurantsRepository.getByIdAsync(item.id))
      );
    } catch (loadError) {
      console.error('Failed to refresh restaurant catalog', loadError);
      setError('Could not load restaurants from Supabase.');
      setRestaurants(await restaurantsRepository.getCatalogItems());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getRestaurantById = useCallback(
    (restaurantId: string) => restaurantsRepository.getById(restaurantId),
    []
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