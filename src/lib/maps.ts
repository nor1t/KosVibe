import { Linking, Platform } from 'react-native';

import type { Coordinates } from '../data/mockData';

type DirectionsTarget = {
  label: string;
  coordinate: Coordinates;
};

function googleDirectionsUrl({ coordinate }: DirectionsTarget) {
  const destination = `${coordinate.latitude},${coordinate.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export async function openDirectionsToPlace(target: DirectionsTarget) {
  const { latitude, longitude } = target.coordinate;
  const encodedLabel = encodeURIComponent(target.label);
  const fallbackUrl = googleDirectionsUrl(target);
  const nativeUrl = Platform.select({
    ios: `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedLabel}`,
    android: `google.navigation:q=${latitude},${longitude}`,
    default: fallbackUrl,
  });

  try {
    await Linking.openURL(nativeUrl ?? fallbackUrl);
  } catch {
    await Linking.openURL(fallbackUrl);
  }
}
