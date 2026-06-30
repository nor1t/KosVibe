import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

type RestaurantShowcaseCardRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  image?: string;
};

type RestaurantShowcaseCardProps = {
  restaurant: RestaurantShowcaseCardRestaurant;
  onPress: () => void;
};

const stars = Array.from({ length: 4 });

export function RestaurantShowcaseCard({ restaurant, onPress }: RestaurantShowcaseCardProps) {
  return (
    <Pressable
      style={styles.restaurantCard}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      onPress={onPress}>
      {restaurant.image ? (
        <ImageBackground source={{ uri: restaurant.image }} style={styles.restaurantCardImage}>
          <LinearGradient
            colors={['rgba(13,13,26,0.1)', 'rgba(13,13,26,0.94)']}
            style={styles.restaurantCardOverlay}>
            <Text style={styles.restaurantCardTitle}>{restaurant.name}</Text>
            <Text style={styles.restaurantCardTag}>{restaurant.cuisine}</Text>
            <View style={styles.starsRow}>
              {stars.map((_, index) => (
                <Ionicons key={`${restaurant.id}-${index}`} name="star" size={13} color={theme.colors.secondary} />
              ))}
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={['rgba(255,31,61,0.18)', 'rgba(13,13,26,0.94)']}
          style={[styles.restaurantCardImage, styles.restaurantCardFallback]}>
          <View style={styles.fallbackIconWrap}>
            <Ionicons name="restaurant-outline" size={26} color={theme.colors.secondary} />
          </View>
          <View>
            <Text style={styles.restaurantCardTitle}>{restaurant.name}</Text>
            <Text style={styles.restaurantCardTag}>{restaurant.cuisine}</Text>
          </View>
          <View style={styles.starsRow}>
            {stars.map((_, index) => (
              <Ionicons key={`${restaurant.id}-${index}`} name="star" size={13} color={theme.colors.secondary} />
            ))}
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  restaurantCardFallback: {
    justifyContent: 'space-between',
  },
  fallbackIconWrap: {
    marginTop: 14,
    marginLeft: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
});
