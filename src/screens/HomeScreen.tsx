import { Feather, Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useDeferredValue, useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';

import { EventCard } from '../components/cards/EventCard';
import { FeaturedMenuCard } from '../components/cards/FeaturedMenuCard';
import { InfoHighlightCard } from '../components/cards/InfoHighlightCard';
import { OfferGradientCard } from '../components/cards/OfferGradientCard';
import { RestaurantListCard } from '../components/cards/RestaurantListCard';
import { CompactHeader } from '../components/common/CompactHeader';
import { Footer } from '../components/common/Footer';
import { LocationPickerModal } from '../components/common/LocationPickerModal';
import { SectionTitle } from '../components/common/SectionTitle';
import { GradientHeaderShell } from '../components/layout/GradientHeaderShell';
import { Screen } from '../components/layout/Screen';
import {
    eventHighlights,
    filterFeaturedItemsByDiscovery,
    filterOffersByDiscovery,
    filterRestaurantsByDiscovery,
    kosovoHighlights,
    nearbyRestaurants,
    restaurants,
} from '../data/mockData';
import { useDiscovery } from '../lib/discovery-state';
import { theme } from '../theme';

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type FunActivity = {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  backgroundColor: string;
};

const funActivities: FunActivity[] = [
  {
    id: 'fun-prishtina-mall',
    title: 'Prishtina Mall',
    subtitle: 'Shopping, cinema, food court, and easy indoor hangout energy.',
    city: 'Prishtina',
    icon: 'bag-handle-outline',
    accentColor: '#FFB300',
    backgroundColor: 'rgba(255, 179, 0, 0.16)',
  },
  {
    id: 'fun-germia-park',
    title: 'Germia Park',
    subtitle: 'Forest walks, bike rides, fresh air, and a quick city escape.',
    city: 'Prishtina',
    icon: 'bicycle-outline',
    accentColor: '#42D98C',
    backgroundColor: 'rgba(66, 217, 140, 0.16)',
  },
  {
    id: 'fun-1-tetori',
    title: '1 Tetori Sports Hall',
    subtitle: 'Sports events, training sessions, and an active local crowd.',
    city: 'Prishtina',
    icon: 'basketball-outline',
    accentColor: '#FF6138',
    backgroundColor: 'rgba(255, 97, 56, 0.16)',
  },
  {
    id: 'fun-brezovica',
    title: 'Brezovica',
    subtitle: 'Mountain views, snow-season fun, and a classic weekend trip.',
    city: 'Prizren',
    icon: 'snow-outline',
    accentColor: '#5DA7FF',
    backgroundColor: 'rgba(93, 167, 255, 0.16)',
  },
  {
    id: 'fun-rugova',
    title: 'Rugova Canyon',
    subtitle: 'Adventure routes, scenic drives, and outdoor adrenaline near Peje.',
    city: 'Peje',
    icon: 'trail-sign-outline',
    accentColor: '#8F7CFF',
    backgroundColor: 'rgba(143, 124, 255, 0.16)',
  },
];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const {
    locationOptions,
    openChat,
    searchQuery,
    selectedLocation,
    selectedLocationId,
    setSearchQuery,
    setSelectedLocationId,
  } = useDiscovery();
  const deferredQuery = useDeferredValue(searchQuery);
  const cardWidth = Math.min(width * 0.72, 282);

  const searchResults = useMemo(
    () => filterRestaurantsByDiscovery(restaurants, selectedLocationId, deferredQuery),
    [deferredQuery, selectedLocationId]
  );
  const featuredItems = useMemo(
    () => filterFeaturedItemsByDiscovery(selectedLocationId, deferredQuery),
    [deferredQuery, selectedLocationId]
  );
  const offers = useMemo(
    () => filterOffersByDiscovery(selectedLocationId, deferredQuery),
    [deferredQuery, selectedLocationId]
  );
  const nearby = useMemo(
    () => filterRestaurantsByDiscovery(nearbyRestaurants, selectedLocationId, deferredQuery),
    [deferredQuery, selectedLocationId]
  );
  const visibleFunActivities = useMemo(() => {
    if (!selectedLocation.city) {
      return funActivities;
    }

    return funActivities.filter((activity) => activity.city === selectedLocation.city);
  }, [selectedLocation.city]);
  const hasSearch = deferredQuery.trim().length > 0;

  const experienceCategories = [
    {
      id: 'restaurants',
      label: 'Restaurants',
      color: theme.colors.orange,
      icon: 'restaurant-outline',
    },
    {
      id: 'hiking',
      label: 'Hiking',
      color: theme.colors.nature,
      icon: 'leaf-outline',
    },
    {
      id: 'party',
      label: 'Parties',
      color: theme.colors.party,
      icon: 'sparkles-outline',
    },
    {
      id: 'culture',
      label: 'Culture',
      color: theme.colors.culture,
      icon: 'book-outline',
    },
  ];

  const eventItems = eventHighlights;
  const highlightItems = kosovoHighlights;

  return (
    <View style={styles.container}>
      <Screen variant="semafori" contentContainerStyle={styles.content}>
        <GradientHeaderShell>
          <CompactHeader />

          <Pressable style={styles.locationChip} onPress={() => setIsLocationPickerOpen(true)}>
            <Ionicons name="location-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.locationText}>{selectedLocation.label}</Text>
            <Ionicons name="chevron-down-outline" size={18} color={theme.colors.surface} />
          </Pressable>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={theme.colors.mutedText} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search restaurants, events, hikes..."
              placeholderTextColor={theme.colors.mutedText}
              style={styles.searchInput}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.subtle} />
              </Pressable>
            ) : null}
          </View>
        </GradientHeaderShell>

        <View style={styles.categoryRow}>
          {experienceCategories.map((category) => (
            <View key={category.id} style={[styles.categoryPill, { backgroundColor: category.color }]}> 
              <Ionicons name={category.icon as any} size={18} color={theme.colors.surface} />
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </View>
          ))}
        </View>

        {hasSearch ? (
          <View style={styles.section}>
            <SectionTitle
              title="Search Results"
              icon={<Feather name="search" size={22} color={theme.colors.danger} />}
            />
            <View style={styles.listGap}>
              {searchResults.length ? (
                searchResults.map((restaurant) => (
                  <RestaurantListCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onPress={() =>
                      navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })
                    }
                  />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No restaurants found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try another keyword or switch to a different city.
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionTitle
            title="Daily Menu"
            actionLabel={featuredItems.length ? 'View all' : undefined}
            icon={<Feather name="trending-up" size={22} color={theme.colors.danger} />}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}>
            {featuredItems.map((item) => (
              <FeaturedMenuCard
                key={item.id}
                item={item}
                width={cardWidth}
                onPress={() =>
                  navigation.navigate('RestaurantDetails', { restaurantId: item.restaurantId })
                }
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Active Offers"
            icon={<Feather name="percent" size={22} color={theme.colors.danger} />}
          />

          <View style={styles.listGap}>
            {offers.map((offer) => (
              <OfferGradientCard key={offer.id} offer={offer} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Events & Experiences"
            actionLabel="See all"
            icon={<Feather name="coffee" size={22} color={theme.colors.accent} />}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventRow}>
            {eventItems.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Discover Kosovo"
            icon={<Feather name="globe" size={22} color={theme.colors.culture} />}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightRow}>
            {highlightItems.map((highlight) => (
              <InfoHighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Near You"
            icon={<Feather name="navigation" size={22} color={theme.colors.danger} />}
          />

          <View style={styles.listGap}>
            {nearby.map((restaurant) => (
              <RestaurantListCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() =>
                  navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Fun Activities"
            icon={<Feather name="compass" size={22} color={theme.colors.secondary} />}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.funActivityRow}>
            {visibleFunActivities.map((activity) => (
              <View key={activity.id} style={styles.funActivityCard}>
                <View
                  style={[
                    styles.funActivityIconWrap,
                    { backgroundColor: activity.backgroundColor },
                  ]}>
                  <Ionicons name={activity.icon} size={24} color={activity.accentColor} />
                </View>
                <Text style={styles.funActivityCity}>{activity.city}</Text>
                <Text style={styles.funActivityTitle}>{activity.title}</Text>
                <Text style={styles.funActivitySubtitle}>{activity.subtitle}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <Footer />
      </Screen>

      <Pressable style={styles.chatFab} onPress={openChat}>
        <View style={styles.chatBadge} />
        <Ionicons name="sparkles-outline" size={28} color={theme.colors.surface} />
      </Pressable>

      <LocationPickerModal
        visible={isLocationPickerOpen}
        locations={locationOptions}
        selectedLocationId={selectedLocationId}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelect={setSelectedLocationId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.xxxl,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xxl,
  },
  brandPrimary: {
    color: theme.colors.surface,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  brandAccent: {
    color: '#FFE84C',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  locationChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  locationText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  searchBar: {
    backgroundColor: '#FFF6F2',
    borderRadius: theme.radius.round,
    minHeight: 64,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 16,
    color: theme.colors.heading,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.xxl,
    marginTop: theme.spacing.lg,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
  },
  categoryLabel: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.body,
    fontWeight: '700',
  },
  section: {
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
  },
  featuredRow: {
    gap: theme.spacing.lg,
    paddingRight: theme.spacing.xxl,
  },
  eventRow: {
    gap: theme.spacing.lg,
    paddingRight: theme.spacing.xxl,
  },
  highlightRow: {
    gap: theme.spacing.lg,
    paddingRight: theme.spacing.xxl,
  },
  funActivityRow: {
    gap: theme.spacing.lg,
    paddingRight: theme.spacing.xxl,
  },
  listGap: {
    gap: theme.spacing.lg,
  },
  funActivityCard: {
    width: 244,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  funActivityIconWrap: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funActivityCity: {
    color: theme.colors.secondary,
    fontSize: theme.typography.sizes.caption,
    lineHeight: theme.typography.lineHeights.caption,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  funActivityTitle: {
    color: theme.colors.heading,
    fontSize: theme.typography.sizes.title,
    lineHeight: theme.typography.lineHeights.title,
    fontWeight: '900',
  },
  funActivitySubtitle: {
    color: theme.colors.mutedText,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadow.card,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.title,
    lineHeight: theme.typography.lineHeights.title,
    fontWeight: '800',
    color: theme.colors.heading,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
    color: theme.colors.mutedText,
  },
  chatFab: {
    position: 'absolute',
    right: theme.spacing.xxl,
    bottom: 104,
    width: 70,
    height: 70,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.floating,
  },
  chatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});
