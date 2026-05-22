import { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { theme } from '@/src/theme';

import type { MapRegion } from '@/src/data/mockData';
import type { ExploreMapMarker } from '@/src/components/map/ExploreMap';

type ExploreMapProps = {
  markers: ExploreMapMarker[];
  region: MapRegion;
  selectedMarkerId?: string | null;
  onMarkerPress?: (markerId: string) => void;
  onMapInteractionStart?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ExploreMap({
  markers,
  region,
  selectedMarkerId,
  onMarkerPress,
  onMapInteractionStart,
  style,
}: ExploreMapProps) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 350);
  }, [region]);

  return (
    <MapView
      ref={mapRef}
      style={style}
      initialRegion={region}
      onTouchStart={onMapInteractionStart}
      onPanDrag={onMapInteractionStart}
      onPress={onMapInteractionStart}
      showsCompass={false}
      toolbarEnabled={false}
      showsPointsOfInterest={false}
      showsUserLocation
      showsMyLocationButton>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.subtitle}
          pinColor={marker.id === selectedMarkerId ? theme.colors.primary : marker.color}
          onPress={() => onMarkerPress?.(marker.id)}
        />
      ))}
    </MapView>
  );
}
