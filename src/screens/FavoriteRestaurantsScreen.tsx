import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { favoritesRepository } from '../repositories/favoritesRepository';
import type { Restaurant } from '../repositories/types';
import { theme } from '../theme';

type FavoriteRestaurantsScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export function FavoriteRestaurantsScreen({ navigation }: FavoriteRestaurantsScreenProps) {
  const { language } = useI18n();
  const { user } = useAuth();
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = () => {
    if (!user) {
      setSavedRestaurants([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    void favoritesRepository
      .getFavoriteRestaurantsByUser(user.id)
      .then((restaurants) => {
        if (active) {
          setSavedRestaurants(restaurants);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load favorites.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  };

  useEffect(() => {
    const cleanup = loadFavorites();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openRestaurant = (restaurantId: string) => {
    navigation.navigate('RestaurantDetails', { restaurantId });
  };

  const favoritesLabel = language === 'sq' ? 'Restorantet e preferuara' : 'Favorite Restaurants';
  const emptyTitle = language === 'sq' ? 'Ende pa te preferuara' : 'No favorites yet';
  const emptyDescription =
    language === 'sq'
      ? 'Prek ikonen e zemres ne nje restorant per ta ruajtur ketu.'
      : 'Tap the heart icon on a restaurant to save it here.';

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centeredState}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <View style={styles.centeredState}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.colors.mutedText} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadFavorites}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (savedRestaurants.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.centeredState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={44} color={theme.colors.mutedText} />
          </View>
          <Text style={styles.emptyHeading}>{emptyTitle}</Text>
          <Text style={styles.emptyDescription}>{emptyDescription}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.sectionLabel}>{favoritesLabel}</Text>
        </View>

        <View style={styles.restaurantList}>
          {savedRestaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => openRestaurant(restaurant.id)}>
              <ImageBackground source={{ uri: restaurant.image }} style={styles.restaurantImage}>
                <View style={styles.restaurantOverlay}>
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <View style={styles.restaurantMetaRow}>
                      <Ionicons name="star" size={12} color={theme.colors.secondary} />
                      <Text style={styles.restaurantRating}>{restaurant.rating.toFixed(1)}</Text>
                      <Text style={styles.restaurantMeta}>{restaurant.city}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.surface} />
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING + 20,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  header: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  loadingText: {
    color: theme.colors.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.mutedText,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyHeading: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyDescription: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  restaurantList: {
    gap: 12,
  },
  restaurantCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  restaurantImage: {
    height: 120,
  },
  restaurantOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: 'rgba(6,7,13,0.5)',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    color: theme.colors.heading,
    fontSize: 17,
    fontWeight: '900',
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  restaurantRating: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
  restaurantMeta: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
});