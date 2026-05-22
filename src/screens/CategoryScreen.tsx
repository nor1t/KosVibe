import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { filterRestaurantsByDiscovery, restaurants } from '../data/mockData';
import { useDiscovery } from '../lib/discovery-state';
import type { HomeStackParamList } from '../navigation/types';
import { theme } from '../theme';

type CategoryScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<HomeStackParamList, 'Category'>;
};

const restaurantFilters = ['All', 'Traditional', 'Cafe', 'Street Food', 'Fine Dining'];

const monumentSpots = [
  {
    id: 'prizren-bridge',
    title: 'Prizren Bridge',
    location: 'Prizren',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sar-planina',
    title: 'Sar Planina',
    location: 'Mountain Range',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'gadima',
    title: 'Gadima',
    location: 'Marble Cave',
    image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'bear-sanctuary',
    title: 'Bear Sanctuary',
    location: 'Mramor',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'newborn',
    title: 'Newborn',
    location: 'Prishtina',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'rugova',
    title: 'Rugova Canyon',
    location: 'Peje',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  },
];

const storyReviews = [
  {
    id: 'rev-1',
    author: 'Peter Comments',
    summary: 'Absolutely fire. Best traditional pasta spot after sunset.',
  },
  {
    id: 'rev-2',
    author: 'Soulmaal Review',
    summary: 'The late-night energy and plating both feel editorial and alive.',
  },
];

export function CategoryScreen({ navigation, route }: CategoryScreenProps) {
  const { category } = route.params;
  const { searchQuery, selectedLocationId, setSearchQuery } = useDiscovery();
  const [selectedFilter, setSelectedFilter] = useState(restaurantFilters[0]);

  const visibleRestaurants = useMemo(
    () => filterRestaurantsByDiscovery(restaurants, selectedLocationId, searchQuery),
    [searchQuery, selectedLocationId]
  );

  if (category === 'Culture') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.monumentsContent}>
          <View style={styles.centerHeader}>
            <Text style={styles.monumentsTitle}>Kosovo Icons</Text>
            <Text style={styles.monumentsSubtitle}>Monuments Explorer</Text>
          </View>

          <View style={styles.monumentsGrid}>
            {monumentSpots.map((spot) => (
              <Pressable key={spot.id} style={styles.monumentCard}>
                <ImageBackground source={{ uri: spot.image }} style={styles.monumentImage}>
                  <LinearGradient
                    colors={['rgba(13,13,26,0.02)', 'rgba(13,13,26,0.86)']}
                    style={styles.monumentOverlay}>
                    <View style={styles.monumentBookmark}>
                      <Ionicons name="bookmark-outline" size={16} color={theme.colors.secondary} />
                    </View>
                    <View>
                      <Text style={styles.monumentName}>{spot.title}</Text>
                      <Text style={styles.monumentLocation}>{spot.location}</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.restaurantsContent}>
        <Text style={styles.brandWordmark}>KosVibe</Text>

        <View style={styles.restaurantHero}>
          <Text style={styles.restaurantHeroTitle}>Find your next favorite spot.</Text>
          <Text style={styles.restaurantHeroSubtitle}>
            Search restaurants, cuisines, vibes and community-approved places.
          </Text>
        </View>

        <View style={styles.neonSearchWrap}>
          <LinearGradient colors={['#FF1F3D', '#C8102E']} style={styles.neonOuter}>
            <View style={styles.neonInner}>
              <Ionicons name="search-outline" size={24} color={theme.colors.surface} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search restaurants, cuisines, vibes..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.searchInput}
              />
            </View>
          </LinearGradient>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {restaurantFilters.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <Pressable key={filter} onPress={() => setSelectedFilter(filter)} style={styles.filterChip}>
                {active ? (
                  <LinearGradient colors={theme.gradients.primary} style={styles.filterChipActive}>
                    <Text style={styles.filterLabelActive}>{filter}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChipInactive}>
                    <Text style={styles.filterLabel}>{filter}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionHeading}>Restaurants</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {visibleRestaurants.slice(0, 4).map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })}>
              <ImageBackground source={{ uri: restaurant.image }} style={styles.restaurantCardImage}>
                <LinearGradient colors={['rgba(13,13,26,0.1)', 'rgba(13,13,26,0.94)']} style={styles.restaurantCardOverlay}>
                  <Text style={styles.restaurantCardTitle}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCardTag}>{restaurant.cuisine}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Ionicons key={`${restaurant.id}-${index}`} name="star" size={13} color={theme.colors.secondary} />
                    ))}
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.reviewPanel}>
          <View style={styles.ratingSummary}>
            <View style={styles.ratingBadge}>
              <Ionicons name="person" size={16} color={theme.colors.surface} />
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Ionicons key={`summary-${index}`} name="star" size={18} color={theme.colors.secondary} />
              ))}
            </View>
          </View>

          {storyReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>{review.author}</Text>
              <Text style={styles.reviewText}>{review.summary}</Text>
            </View>
          ))}

          <Text style={styles.communityHeading}>Community Reviews</Text>
          <View style={styles.avatarRow}>
            {['A', 'M', 'R', 'D', 'L'].map((label, index) => (
              <View key={label} style={[styles.avatarRing, index % 2 === 0 ? styles.avatarRed : styles.avatarGold]}>
                <Text style={styles.avatarText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05060D',
  },
  restaurantsContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140,
  },
  brandWordmark: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 26,
    textAlign: 'center',
    fontWeight: '500',
  },
  restaurantHero: {
    marginTop: 18,
  },
  restaurantHeroTitle: {
    color: theme.colors.heading,
    fontSize: 42,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1.6,
    maxWidth: 280,
  },
  restaurantHeroSubtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  neonSearchWrap: {
    marginTop: 28,
  },
  neonOuter: {
    borderRadius: 999,
    padding: 2,
    shadowColor: '#FF1F3D',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  neonInner: {
    minHeight: 62,
    borderRadius: 999,
    backgroundColor: '#08080E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 16,
  },
  filterRow: {
    gap: 12,
    paddingVertical: 24,
  },
  filterChip: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  filterChipActive: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  filterChipInactive: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,31,61,0.3)',
  },
  filterLabel: {
    color: theme.colors.mutedText,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: theme.colors.surface,
    fontWeight: '800',
  },
  sectionHeading: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  cardRow: {
    gap: 14,
    paddingRight: 24,
  },
  restaurantCard: {
    width: 168,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,31,61,0.22)',
  },
  restaurantCardImage: {
    height: 220,
  },
  restaurantCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  restaurantCardTitle: {
    color: theme.colors.heading,
    fontSize: 22,
    fontWeight: '800',
  },
  restaurantCardTag: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  reviewPanel: {
    marginTop: 26,
    padding: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,31,61,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    marginTop: 18,
  },
  reviewTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  reviewText: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 24,
  },
  communityHeading: {
    marginTop: 24,
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  avatarRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarRed: {
    borderColor: '#FF1F3D',
    backgroundColor: 'rgba(255,31,61,0.14)',
  },
  avatarGold: {
    borderColor: '#FFB300',
    backgroundColor: 'rgba(255,179,0,0.14)',
  },
  avatarText: {
    color: theme.colors.heading,
    fontWeight: '900',
  },
  monumentsContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 144,
  },
  centerHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  monumentsTitle: {
    color: theme.colors.heading,
    fontSize: 52,
    lineHeight: 54,
    fontWeight: '900',
    letterSpacing: -2.2,
    textAlign: 'center',
  },
  monumentsSubtitle: {
    marginTop: 8,
    color: '#D6A45E',
    fontSize: 18,
    fontWeight: '500',
  },
  monumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  monumentCard: {
    width: '47%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.24)',
    backgroundColor: '#0C0F1A',
  },
  monumentImage: {
    height: 210,
  },
  monumentOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 14,
  },
  monumentBookmark: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.35)',
    backgroundColor: 'rgba(13,13,26,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monumentName: {
    color: '#F3C273',
    fontSize: 16,
    fontWeight: '500',
  },
  monumentLocation: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
