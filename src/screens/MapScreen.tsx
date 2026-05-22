import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FakeMap } from '../components/map/FakeMap';
import { filterRestaurantsByDiscovery, restaurants, type MapPin } from '../data/mockData';
import { useDiscovery } from '../lib/discovery-state';
import { theme } from '../theme';

type MapScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type MonumentPin = MapPin & {
  title: string;
  subtitle: string;
};

const monumentPins: MonumentPin[] = [
  { id: 'monument-1', restaurantId: 'culture-1', x: '33%', y: '42%', color: '#FFB300', title: 'Prizren Bridge', subtitle: 'Historic landmark' },
  { id: 'monument-2', restaurantId: 'culture-2', x: '52%', y: '35%', color: '#FF8C00', title: 'Newborn Monument', subtitle: 'Urban culture' },
  { id: 'monument-3', restaurantId: 'culture-3', x: '64%', y: '56%', color: '#FFD166', title: 'Bear Sanctuary', subtitle: 'Nature preserve' },
];

export function MapScreen({ navigation }: MapScreenProps) {
  const { selectedLocation, selectedLocationId } = useDiscovery();
  const [activeLayer, setActiveLayer] = useState<'eat' | 'icons'>('eat');
  const visibleRestaurants = useMemo(
    () => filterRestaurantsByDiscovery(restaurants, selectedLocationId, ''),
    [selectedLocationId]
  );
  const pins: MapPin[] = useMemo(
    () =>
      visibleRestaurants.slice(0, 4).map((restaurant, index) => ({
        id: `pin-${restaurant.id}`,
        restaurantId: restaurant.id,
        x: `${24 + index * 16}%` as `${number}%`,
        y: `${32 + (index % 2) * 18}%` as `${number}%`,
        color: index % 2 === 0 ? theme.colors.primary : theme.colors.secondary,
      })),
    [visibleRestaurants]
  );

  return (
    <View style={styles.container}>
      <FakeMap
        pins={activeLayer === 'eat' ? pins : monumentPins}
        onPinPress={(restaurantId) => {
          if (activeLayer === 'eat') {
            navigation.navigate('RestaurantDetails', { restaurantId });
          }
        }}
      />

      <LinearGradient colors={['rgba(7,8,16,0.14)', 'rgba(7,8,16,0.72)']} style={styles.topFade} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore Kosovo</Text>
          <Text style={styles.headerSubtitle}>{selectedLocation.label}</Text>
        </View>

        <Pressable style={styles.headerButton}>
          <Ionicons name="locate-outline" size={22} color={theme.colors.surface} />
        </Pressable>
      </View>

      <View style={styles.toggleWrap}>
        <View style={styles.toggleShell}>
          <Pressable style={styles.toggleSide} onPress={() => setActiveLayer('eat')}>
            {activeLayer === 'eat' ? (
              <LinearGradient colors={theme.gradients.primary} style={styles.toggleActive}>
                <Text style={styles.toggleActiveLabel}>Eat</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleLabel}>Eat</Text>
            )}
          </Pressable>

          <Pressable style={styles.toggleSide} onPress={() => setActiveLayer('icons')}>
            {activeLayer === 'icons' ? (
              <LinearGradient colors={theme.gradients.gold} style={styles.toggleActive}>
                <Text style={styles.toggleActiveLabel}>Icons</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleLabel}>Icons</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>{activeLayer === 'eat' ? 'Nearby Vibes' : 'Kosovo Icons'}</Text>
        <Text style={styles.sheetSubtitle}>
          {activeLayer === 'eat'
            ? `${visibleRestaurants.length} curated places around you`
            : 'Switch between cultural landmarks across the country'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetRow}>
          {activeLayer === 'eat'
            ? visibleRestaurants.slice(0, 4).map((restaurant) => (
                <Pressable
                  key={restaurant.id}
                  style={styles.placeCard}
                  onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })}>
                  <Text style={styles.placeName}>{restaurant.name}</Text>
                  <Text style={styles.placeMeta}>{restaurant.cuisine}</Text>
                  <Text style={styles.placeAccent}>{restaurant.distance} away</Text>
                </Pressable>
              ))
            : monumentPins.map((item) => (
                <View key={item.id} style={styles.placeCard}>
                  <Text style={styles.placeName}>{item.title}</Text>
                  <Text style={styles.placeMeta}>{item.subtitle}</Text>
                  <Text style={styles.placeAccent}>Saved to trail</Text>
                </View>
              ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.mapSurface,
  },
  topFade: {
    ...StyleSheet.absoluteFillObject,
    bottom: '42%',
  },
  header: {
    position: 'absolute',
    top: 62,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: theme.colors.heading,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 14,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleWrap: {
    position: 'absolute',
    top: 128,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  toggleShell: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 220,
  },
  toggleSide: {
    flex: 1,
  },
  toggleActive: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleLabel: {
    textAlign: 'center',
    paddingVertical: 10,
    color: theme.colors.mutedText,
    fontWeight: '700',
  },
  toggleActiveLabel: {
    color: theme.colors.surface,
    fontWeight: '900',
  },
  sheet: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 108,
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(15,17,28,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  handle: {
    alignSelf: 'center',
    width: 58,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  sheetTitle: {
    color: theme.colors.heading,
    fontSize: 22,
    fontWeight: '900',
  },
  sheetSubtitle: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  sheetRow: {
    gap: 12,
    paddingTop: 18,
    paddingRight: 4,
  },
  placeCard: {
    width: 170,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  placeName: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  placeMeta: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 14,
  },
  placeAccent: {
    marginTop: 12,
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
});
