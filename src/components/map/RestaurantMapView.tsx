import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import type { MapRegion, Restaurant } from '../../data/mockData';

type RestaurantMapViewProps = {
  restaurants: Restaurant[];
  region: MapRegion;
  selectedRestaurantId?: string | null;
  onMarkerPress?: (restaurantId: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function RestaurantMapView({
  restaurants,
  region,
  selectedRestaurantId,
  onMarkerPress,
  style,
}: RestaurantMapViewProps) {
  return (
    <View style={[styles.wrap, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled
      >
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={restaurant.coordinates}
            title={restaurant.name}
            description={restaurant.tagline}
            pinColor={restaurant.id === selectedRestaurantId ? '#FF4C49' : '#FF8A3D'}
            onPress={() => onMarkerPress?.(restaurant.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
