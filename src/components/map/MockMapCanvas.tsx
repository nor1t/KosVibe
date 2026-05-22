import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { AppText } from '@/src/components/AppText';
import type { Coordinates, MapRegion } from '@/src/data/mockData';
import { theme } from '@/src/theme';

export type MockMapMarker = {
  id: string;
  title: string;
  subtitle: string;
  coordinate: Coordinates;
  color: string;
};

type MockMapCanvasProps = {
  markers: MockMapMarker[];
  region: MapRegion;
  selectedMarkerId?: string | null;
  onMarkerPress?: (markerId: string) => void;
  onInteractionStart?: () => void;
  style?: StyleProp<ViewStyle>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function markerPosition(marker: MockMapMarker, region: MapRegion) {
  const longitudeStart = region.longitude - region.longitudeDelta / 2;
  const latitudeTop = region.latitude + region.latitudeDelta / 2;
  const x = ((marker.coordinate.longitude - longitudeStart) / region.longitudeDelta) * 100;
  const y = ((latitudeTop - marker.coordinate.latitude) / region.latitudeDelta) * 100;

  return {
    left: `${clamp(x, 8, 92)}%` as `${number}%`,
    top: `${clamp(y, 10, 88)}%` as `${number}%`,
  };
}

export function MockMapCanvas({
  markers,
  region,
  selectedMarkerId,
  onMarkerPress,
  onInteractionStart,
  style,
}: MockMapCanvasProps) {
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? markers[0];

  return (
    <Pressable style={[styles.map, style]} onPress={onInteractionStart}>
      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`vertical-${index}`}
          style={[styles.verticalLine, { left: `${(index + 1) * 10}%` }]}
        />
      ))}
      {Array.from({ length: 7 }).map((_, index) => (
        <View
          key={`horizontal-${index}`}
          style={[styles.horizontalLine, { top: `${(index + 1) * 12.5}%` }]}
        />
      ))}

      <View style={styles.centerGlow} />

      {markers.map((marker) => {
        const isSelected = marker.id === selectedMarkerId;

        return (
          <Pressable
            key={marker.id}
            accessibilityRole="button"
            accessibilityLabel={marker.title}
            onPress={(event) => {
              event.stopPropagation();
              onMarkerPress?.(marker.id);
            }}
            style={[
              styles.pin,
              markerPosition(marker, region),
              { backgroundColor: isSelected ? theme.colors.primary : marker.color },
              isSelected ? styles.pinSelected : undefined,
            ]}>
            <Ionicons name="location-sharp" size={24} color={theme.colors.surface} />
          </Pressable>
        );
      })}

      {selectedMarker ? (
        <View style={styles.caption}>
          <AppText variant="subtitle" numberOfLines={1}>
            {selectedMarker.title}
          </AppText>
          <AppText variant="caption" color={theme.colors.mutedText} numberOfLines={1}>
            {selectedMarker.subtitle}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    minHeight: 260,
    overflow: 'hidden',
    backgroundColor: theme.colors.mapSurface,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(117, 130, 151, 0.22)',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(117, 130, 151, 0.22)',
  },
  centerGlow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 150,
    height: 150,
    marginLeft: -75,
    marginTop: -75,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  pin: {
    position: 'absolute',
    width: 46,
    height: 46,
    marginLeft: -23,
    marginTop: -23,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  pinSelected: {
    width: 54,
    height: 54,
    marginLeft: -27,
    marginTop: -27,
  },
  caption: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    gap: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadow.card,
  },
});
