import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useRestaurantCatalog } from '../lib/restaurant-catalog';
import { openDirectionsToPlace } from '../lib/maps';
import { favoritesRepository } from '../repositories/favoritesRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import type { Restaurant } from '../repositories/types';
import { theme } from '../theme';

type RestaurantDetailsRoute = RouteProp<
  { RestaurantDetails: { restaurantId: string } },
  'RestaurantDetails'
>;

type RestaurantDetailsScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RestaurantDetailsRoute;
};

export function RestaurantDetailsScreen({ navigation, route }: RestaurantDetailsScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].restaurantDetails;
  const { getRestaurantById, loading } = useRestaurantCatalog();
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(() =>
    getRestaurantById(route.params.restaurantId)
  );
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (restaurant) return;
    let active = true;
    setDetailLoading(true);
    // If the cache is empty (e.g. after the business edited), load from the server
    restaurantsRepository.getByIdAsync(route.params.restaurantId).then((fresh) => {
      if (active && fresh) setRestaurant(fresh);
      if (active) setDetailLoading(false);
    }).catch(() => {
      if (active) setDetailLoading(false);
    });
    return () => { active = false; };
  }, [route.params.restaurantId, restaurant]);
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    if (!restaurant || !user) return;
    let active = true;
    void favoritesRepository.isRestaurantFavorite(user.id, restaurant.id).then((isSaved) => {
      if (active) setSaved(isSaved);
    });
    return () => { active = false; };
  }, [restaurant, user]);

  const toggleFavorite = async () => {
    if (!restaurant || !user || savingFavorite) return;
    const previousState = saved;
    setSavingFavorite(true);
    // Optimistic update
    setSaved(!previousState);

    let success: boolean;
    if (previousState) {
      success = await favoritesRepository.removeFavorite(user.id, restaurant.id);
    } else {
      success = await favoritesRepository.addFavorite(user.id, restaurant.id);
    }

    if (!success) {
      // Rollback on failure
      setSaved(previousState);
    }
    setSavingFavorite(false);
  };

  if (!restaurant && (loading || detailLoading)) {
    return (
      <View style={[styles.container, styles.loadingState]}>
        <ActivityIndicator color={theme.colors.secondary} />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ImageBackground source={{ uri: restaurant.heroImage }} style={styles.heroImage}>
        <LinearGradient colors={['rgba(7,8,16,0.15)', 'rgba(7,8,16,0.78)', 'rgba(7,8,16,0.96)']} style={styles.heroOverlay}>
          <View style={styles.heroActions}>
            <View style={styles.heroSpacer} />
            <Pressable style={styles.iconButton} onPress={toggleFavorite} disabled={savingFavorite}>
              <Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={saved ? theme.colors.primary : theme.colors.surface} />
            </Pressable>
          </View>

          <View style={styles.heroCopy}>
            <View style={styles.statusChip}>
              <Text style={styles.statusLabel}>
                {restaurant.isOpen ? copy.openNow : copy.closed}
              </Text>
            </View>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantTagline}>{restaurant.tagline}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Ionicons name="star" size={18} color={theme.colors.secondary} />
            <Text style={styles.metaCardLabel}>
              {restaurant.rating.toFixed(1)} {copy.ratingSuffix}
            </Text>
          </View>
          <Pressable
            style={styles.metaCard}
            onPress={() =>
              void openDirectionsToPlace({
                label: restaurant.name,
                coordinate: restaurant.coordinates,
              })
            }>
            <Ionicons name="location-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.metaCardLabel}>{restaurant.distance}</Text>
          </Pressable>
          <View style={styles.metaCard}>
            <Ionicons name="cash-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.metaCardLabel}>{restaurant.priceRange}</Text>
          </View>
        </View>

        <LinearGradient colors={['rgba(255,31,61,0.22)', 'rgba(255,179,0,0.08)']} style={styles.specialCard}>
          <Text style={styles.specialEyebrow}>{copy.todaySpecial}</Text>
          <Text style={styles.specialTitle}>{restaurant.todaySpecial.name}</Text>
          <Text style={styles.specialText}>{restaurant.todaySpecial.description}</Text>
          <Text style={styles.specialPrice}>
            {restaurant.todaySpecial.price} <Text style={styles.specialOriginal}>{restaurant.todaySpecial.originalPrice}</Text>
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{copy.about}</Text>
          <Pressable
            style={styles.addressRow}
            onPress={() =>
              void openDirectionsToPlace({
                label: restaurant.name,
                coordinate: restaurant.coordinates,
              })
            }>
            <Ionicons name="navigate-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.addressText}>{restaurant.address}</Text>
          </Pressable>
          <Text style={styles.detailLine}>{restaurant.phone}</Text>
          <Text style={styles.detailLine}>
            {copy.openDailyPrefix}: {restaurant.hours}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{copy.menuHighlights}</Text>
          {restaurant.menuSections.length > 0 ? (
            <View style={styles.list}>
              {restaurant.menuSections.map((section) => (
                <View key={section.id} style={styles.infoCard}>
                  <Text style={styles.infoTitle}>{section.title}</Text>
                  <Text style={styles.infoText}>
                    {section.items[0]?.name ?? copy.seasonalSelection} - {section.items[0]?.price ?? ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{copy.menuHighlights}</Text>
              <Text style={styles.infoText}>No menu published yet.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{copy.reviews}</Text>
          {restaurant.reviews.length > 0 ? (
            <View style={styles.list}>
              {restaurant.reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    <Text style={styles.reviewTime}>{review.timeAgo}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{copy.reviews}</Text>
              <Text style={styles.infoText}>No reviews published yet.</Text>
            </View>
          )}
        </View>

        <Pressable style={styles.bookButton} onPress={() => navigation.navigate('BookTable', { restaurantId: restaurant.id })}>
          <LinearGradient colors={theme.gradients.primary} style={styles.bookButtonFill}>
            <Text style={styles.bookButtonLabel}>{copy.bookTable}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: theme.colors.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  heroImage: {
    height: 400,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING + 8,
    paddingBottom: 26,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  heroSpacer: {
    flex: 1,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    gap: 10,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,179,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.25)',
  },
  statusLabel: {
    color: '#FFD789',
    fontSize: 12,
    fontWeight: '800',
  },
  restaurantName: {
    color: theme.colors.heading,
    fontSize: 36,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  restaurantTagline: {
    color: '#E1E6F2',
    fontSize: 16,
  },
  sheet: {
    marginTop: -18,
    paddingHorizontal: 20,
    gap: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 8,
  },
  metaCardLabel: {
    color: theme.colors.heading,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  specialCard: {
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  specialEyebrow: {
    color: '#F8C979',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  specialTitle: {
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 26,
    fontWeight: '900',
  },
  specialText: {
    marginTop: 8,
    color: '#E6E0DC',
    fontSize: 15,
    lineHeight: 22,
  },
  specialPrice: {
    marginTop: 16,
    color: theme.colors.secondary,
    fontSize: 18,
    fontWeight: '900',
  },
  specialOriginal: {
    color: theme.colors.mutedText,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  section: {
    gap: 14,
  },
  sectionHeading: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  detailLine: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressText: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoTitle: {
    color: theme.colors.heading,
    fontSize: 17,
    fontWeight: '800',
  },
  infoText: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 14,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  reviewTime: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewText: {
    marginTop: 10,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 22,
  },
  bookButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  bookButtonFill: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonLabel: {
    color: theme.colors.surface,
    fontSize: 17,
    fontWeight: '900',
  },
});
