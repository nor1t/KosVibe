import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { theme } from '@/src/theme';

import type { Coordinates, MapRegion } from '@/src/data/mockData';

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
  style?: StyleProp<ViewStyle>;
};

export function ExploreMap({ style }: ExploreMapProps) {
  return (
    <View style={[styles.wrap, style]}>
      <EmptyState
        title="Map preview unavailable here"
        description="The live Explore map now uses the native iOS and Android map view."
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
