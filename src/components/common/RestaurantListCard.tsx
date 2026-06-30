import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

type RestaurantListCardRestaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  city: string;
  rating: number;
  imageUrl?: string | null;
};

type RestaurantListCardProps = {
  restaurant: RestaurantListCardRestaurant;
  onPress: () => void;
};

export function RestaurantListCard({ restaurant, onPress }: RestaurantListCardProps) {
  return (
    <Pressable
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      onPress={onPress}>
      {restaurant.imageUrl ? (
        <ImageBackground source={{ uri: restaurant.imageUrl }} style={styles.image}>
          <LinearGradient colors={['rgba(13,13,26,0.02)', 'rgba(13,13,26,0.5)']} style={styles.imageOverlay} />
        </ImageBackground>
      ) : (
        <View style={styles.fallbackImage}>
          <Ionicons name="restaurant-outline" size={24} color={theme.colors.secondary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
        </View>

        <Text style={styles.cuisine} numberOfLines={1}>
          {restaurant.cuisine ?? 'Restaurant'}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={13} color={theme.colors.secondary} />
            <Text style={styles.metaText}>{restaurant.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={theme.colors.mutedText} />
            <Text style={styles.metaText}>{restaurant.city}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,31,61,0.16)',
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  imageOverlay: {
    flex: 1,
  },
  fallbackImage: {
    width: 86,
    height: 86,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  cuisine: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.heading,
    fontSize: 12,
    fontWeight: '700',
  },
});
