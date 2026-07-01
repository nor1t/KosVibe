import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { theme } from '@/src/theme';

import type { Coordinates, MapRegion } from '@/src/repositories/types';

export type ExploreMapMarker = {
  id: string;
  title: string;
  subtitle: string;
  coordinate: Coordinates;
  color: string;
};

type ExploreMapProps = {
  markers: ExploreMapMarker[];
  region: MapRegion;
  selectedMarkerId?: string | null;
  onMarkerPress?: (markerId: string) => void;
  onMapInteractionStart?: () => void;
  mapType?: 'standard' | 'hybrid';
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ExploreMap({ style }: ExploreMapProps) {
  return (
    <View style={[styles.wrap, style]}>
      <EmptyState
        title="Map preview unavailable here"
        description="The live Explore map uses the native iOS and Android map view, including your location when permission is allowed."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});
