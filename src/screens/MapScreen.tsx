import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExploreMap, type ExploreMapMarker } from '../components/map/ExploreMap';
import {
    filterRestaurantsByDiscovery,
    getMapRegionForRestaurants,
    restaurants,
    type Coordinates,
    type MapRegion,
} from '../data/mockData';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useDiscovery } from '../lib/discovery-state';
import { openDirectionsToPlace } from '../lib/maps';
import { useScrollBehavior } from '../lib/scroll-behavior';
import { PAGE_BOTTOM_PADDING } from '../components/Screen';
import { theme } from '../theme';

type MapScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type ActivityKey =
  | 'eat'
  | 'coffee'
  | 'nightlife'
  | 'culture'
  | 'nature'
  | 'study'
  | 'icons';

type ActivityOption = {
  id: ActivityKey;
  label: string;
  icon: string;
  colors: readonly [string, string];
  sheetTitle: string;
  sheetDescription: string;
  emptyDescription: string;
};

type ExploreSpot = {
  id: string;
  category: Exclude<ActivityKey, 'eat'>;
  title: string;
  subtitle: string;
  city: string;
  distance: string;
  coordinate: Coordinates;
  color: string;
  accentLabel: string;
};

type ExploreCardItem = {
  id: string;
  markerId: string;
  title: string;
  subtitle: string;
  distance: string;
  accentLabel: string;
  color: string;
  coordinate: Coordinates;
  restaurantId?: string;
};

const activityOptions: ActivityOption[] = [
  {
    id: 'eat',
    label: 'Eat',
    icon: 'restaurant-outline',
    colors: theme.gradients.primary,
    sheetTitle: 'Nearby Vibes',
    sheetDescription: 'Curated places close to your current map area.',
    emptyDescription: 'No food spots match this location yet.',
  },
  {
    id: 'coffee',
    label: 'Coffee',
    icon: 'cafe-outline',
    colors: theme.gradients.gold,
    sheetTitle: 'Coffee Corners',
    sheetDescription: 'Comfortable cafes for meetings, catchups, and slow mornings.',
    emptyDescription: 'No coffee spots are pinned for this city yet.',
  },
  {
    id: 'nightlife',
    label: 'Nightlife',
    icon: 'wine-outline',
    colors: ['#FF6A3D', '#FF1F3D'] as const,
    sheetTitle: 'After Dark',
    sheetDescription: 'Late-night energy, rooftop views, and music-forward stops.',
    emptyDescription: 'No nightlife spots are pinned for this city yet.',
  },
  {
    id: 'culture',
    label: 'Culture',
    icon: 'color-palette-outline',
    colors: ['#5DA7FF', '#2F6BFF'] as const,
    sheetTitle: 'Culture Trail',
    sheetDescription: 'Creative venues and heritage stops worth saving.',
    emptyDescription: 'No culture stops are pinned for this city yet.',
  },
  {
    id: 'nature',
    label: 'Nature',
    icon: 'leaf-outline',
    colors: ['#42D98C', '#1E9B63'] as const,
    sheetTitle: 'Outdoor Escapes',
    sheetDescription: 'Fresh-air routes, viewpoints, and scenic resets.',
    emptyDescription: 'No outdoor spots are pinned for this city yet.',
  },
  {
    id: 'study',
    label: 'Study',
    icon: 'library-outline',
    colors: ['#8F7CFF', '#5A4BDB'] as const,
    sheetTitle: 'Study Mode',
    sheetDescription: 'Quiet corners and productive spots with good coffee nearby.',
    emptyDescription: 'No study-friendly spots are pinned for this city yet.',
  },
  {
    id: 'icons',
    label: 'Icons',
    icon: 'compass-outline',
    colors: ['#FFD166', '#FF8C00'] as const,
    sheetTitle: 'Kosovo Icons',
    sheetDescription: 'Signature landmarks for first-timers and quick detours.',
    emptyDescription: 'No landmark pins are available for this city yet.',
  },
];

const exploreSpots: ExploreSpot[] = [
  {
    id: 'coffee-prishtine',
    category: 'coffee',
    title: 'Soma Book Station',
    subtitle: 'Relaxed coffee and laptop tables',
    city: 'Prishtina',
    distance: '0.5 km',
    coordinate: { latitude: 42.6608, longitude: 21.1605 },
    color: '#FFB300',
    accentLabel: 'Good for meetups',
  },
  {
    id: 'coffee-prizren',
    category: 'coffee',
    title: 'Stone Bridge Espresso',
    subtitle: 'Coffee stop with old-town energy',
    city: 'Prizren',
    distance: '0.4 km',
    coordinate: { latitude: 42.2099, longitude: 20.7419 },
    color: '#FFB300',
    accentLabel: 'Historic center',
  },
  {
    id: 'coffee-peje',
    category: 'coffee',
    title: 'Rugova Roast Lab',
    subtitle: 'Specialty coffee before the mountain drive',
    city: 'Peje',
    distance: '0.9 km',
    coordinate: { latitude: 42.6599, longitude: 20.2904 },
    color: '#FFB300',
    accentLabel: 'Roastery vibe',
  },
  {
    id: 'nightlife-prishtine',
    category: 'nightlife',
    title: 'Zone Rooftop',
    subtitle: 'Sunset drinks and a late DJ set',
    city: 'Prishtina',
    distance: '1.2 km',
    coordinate: { latitude: 42.6624, longitude: 21.1592 },
    color: '#FF6138',
    accentLabel: 'Late-night favorite',
  },
  {
    id: 'nightlife-prizren',
    category: 'nightlife',
    title: 'Lumbardhi Nights',
    subtitle: 'Cocktails close to the river walk',
    city: 'Prizren',
    distance: '0.7 km',
    coordinate: { latitude: 42.2118, longitude: 20.7392 },
    color: '#FF6138',
    accentLabel: 'Best after 21:00',
  },
  {
    id: 'nightlife-peje',
    category: 'nightlife',
    title: 'Peja Rooftop',
    subtitle: 'City lights and a social crowd',
    city: 'Peje',
    distance: '1.1 km',
    coordinate: { latitude: 42.6618, longitude: 20.2887 },
    color: '#FF6138',
    accentLabel: 'Weekend hotspot',
  },
  {
    id: 'culture-prishtine',
    category: 'culture',
    title: 'National Library Plaza',
    subtitle: 'Architecture and student energy',
    city: 'Prishtina',
    distance: '0.8 km',
    coordinate: { latitude: 42.6575, longitude: 21.162297 },
    color: '#5DA7FF',
    accentLabel: 'Creative district',
  },
  {
    id: 'culture-prizren',
    category: 'culture',
    title: 'Prizren Fortress',
    subtitle: 'Old stone walls and city views',
    city: 'Prizren',
    distance: '1.4 km',
    coordinate: { latitude: 42.2069, longitude: 20.7465 },
    color: '#5DA7FF',
    accentLabel: 'Golden-hour stop',
  },
  {
    id: 'culture-peje',
    category: 'culture',
    title: 'Dukagjini Heritage Court',
    subtitle: 'Historic facades and gallery stops',
    city: 'Peje',
    distance: '0.6 km',
    coordinate: { latitude: 42.6611, longitude: 20.2881 },
    color: '#5DA7FF',
    accentLabel: 'Photo-ready route',
  },
  {
    id: 'nature-prishtine',
    category: 'nature',
    title: 'Germia Trail Gate',
    subtitle: 'Easy access to forest paths',
    city: 'Prishtina',
    distance: '2.1 km',
    coordinate: { latitude: 42.66887, longitude: 21.15345 },
    color: '#42D98C',
    accentLabel: 'Morning reset',
  },
  {
    id: 'nature-prizren',
    category: 'nature',
    title: 'Sharr Vista Point',
    subtitle: 'Mountain air with a wide valley view',
    city: 'Prizren',
    distance: '3.3 km',
    coordinate: { latitude: 42.1744, longitude: 20.9614 },
    color: '#42D98C',
    accentLabel: 'Scenic drive',
  },
  {
    id: 'nature-peje',
    category: 'nature',
    title: 'Rugova Canyon Start',
    subtitle: 'Gateway to the most dramatic outdoor route nearby',
    city: 'Peje',
    distance: '4.5 km',
    coordinate: { latitude: 42.692222, longitude: 20.168611 },
    color: '#42D98C',
    accentLabel: 'Weekend adventure',
  },
  {
    id: 'study-prishtine',
    category: 'study',
    title: 'Innovation Centre Kosovo',
    subtitle: 'Quiet work tables and strong Wi-Fi',
    city: 'Prishtina',
    distance: '0.9 km',
    coordinate: { latitude: 42.6551, longitude: 21.1633 },
    color: '#8F7CFF',
    accentLabel: 'Best for deep work',
  },
  {
    id: 'study-prizren',
    category: 'study',
    title: 'Lumbardhi Work Loft',
    subtitle: 'A calm corner near the cultural district',
    city: 'Prizren',
    distance: '0.8 km',
    coordinate: { latitude: 42.2131, longitude: 20.7399 },
    color: '#8F7CFF',
    accentLabel: 'Laptop-friendly',
  },
  {
    id: 'study-peje',
    category: 'study',
    title: 'Dukagjini Desk Hub',
    subtitle: 'Focused work sessions near the center',
    city: 'Peje',
    distance: '0.7 km',
    coordinate: { latitude: 42.6604, longitude: 20.2874 },
    color: '#8F7CFF',
    accentLabel: 'Quietest before noon',
  },
  {
    id: 'icon-prishtine',
    category: 'icons',
    title: 'Newborn Monument',
    subtitle: 'The city’s most recognizable landmark',
    city: 'Prishtina',
    distance: '1.0 km',
    coordinate: { latitude: 42.6607, longitude: 21.1583 },
    color: '#FFD166',
    accentLabel: 'Must-see icon',
  },
  {
    id: 'icon-prizren',
    category: 'icons',
    title: 'Stone Bridge',
    subtitle: 'Classic old-town crossing and photo stop',
    city: 'Prizren',
    distance: '0.5 km',
    coordinate: { latitude: 42.20965, longitude: 20.74034 },
    color: '#FFD166',
    accentLabel: 'Old-town favorite',
  },
  {
    id: 'icon-peje',
    category: 'icons',
    title: 'Patriarchate View',
    subtitle: 'A landmark route framed by mountain scenery',
    city: 'Peje',
    distance: '2.4 km',
    coordinate: { latitude: 42.6775, longitude: 20.2669 },
    color: '#FFD166',
    accentLabel: 'Landmark detour',
  },
];

function mapDiscoveryCategory(
  selectedCategory: ReturnType<typeof useDiscovery>['selectedCategory']
): ActivityKey {
  switch (selectedCategory) {
    case 'Party':
      return 'nightlife';
    case 'Culture':
      return 'culture';
    case 'Hiking':
      return 'nature';
    case 'Study':
      return 'study';
    case 'Restaurants':
    default:
      return 'eat';
  }
}

function getRegionForCoordinates(coordinates: Coordinates[], fallbackRegion: MapRegion): MapRegion {
  if (coordinates.length === 0) {
    return fallbackRegion;
  }

  if (coordinates.length === 1) {
    return {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.7, 0.08),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.7, 0.08),
  };
}

function getFocusedRegion(coordinate: Coordinates, fallbackRegion: MapRegion): MapRegion {
  return {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta: Math.min(fallbackRegion.latitudeDelta, 0.06),
    longitudeDelta: Math.min(fallbackRegion.longitudeDelta, 0.06),
  };
}

function getUserRegion(coordinate: Coordinates): MapRegion {
  return {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };
}

export function MapScreen({ navigation }: MapScreenProps) {
  const { language } = useI18n();
  const { setScrollOffset } = useScrollBehavior();
  const copy = nativeCopy[language].map;
  const {
    locationOptions,
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedLocationId,
    setSearchQuery,
    setSelectedLocationId,
  } = useDiscovery();
  const [activeCategory, setActiveCategory] = useState<ActivityKey>(() =>
    mapDiscoveryCategory(selectedCategory)
  );
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>(selectedLocation.region);
  const [mapType, setMapType] = useState<'standard' | 'hybrid'>('standard');
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draftSearchQuery, setDraftSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setDraftSearchQuery(searchQuery);
  }, [searchQuery]);

  const visibleRestaurants = useMemo(
    () => filterRestaurantsByDiscovery(restaurants, selectedLocationId, searchQuery),
    [searchQuery, selectedLocationId]
  );

  const visibleSpots = useMemo(
    () =>
      exploreSpots.filter((spot) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesLocation = selectedLocation.city ? spot.city === selectedLocation.city : true;
        const matchesQuery = normalizedQuery
          ? [spot.title, spot.subtitle, spot.city, spot.accentLabel, spot.category]
              .join(' ')
              .toLowerCase()
              .includes(normalizedQuery)
          : true;

        return matchesLocation && matchesQuery;
      }),
    [searchQuery, selectedLocation.city]
  );

  const localizedActivityOptions = useMemo<ActivityOption[]>(
    () =>
      activityOptions.map((option) => ({
        ...option,
        ...copy.options[option.id],
      })),
    [copy.options]
  );

  const activityCounts = useMemo(
    () =>
      localizedActivityOptions.reduce<Record<ActivityKey, number>>((counts, option) => {
        counts[option.id] =
          option.id === 'eat'
            ? visibleRestaurants.length
            : visibleSpots.filter((spot) => spot.category === option.id).length;
        return counts;
      }, {} as Record<ActivityKey, number>),
    [localizedActivityOptions, visibleRestaurants, visibleSpots]
  );

  const currentOption =
    localizedActivityOptions.find((option) => option.id === activeCategory) ??
    localizedActivityOptions[0];

  const mapMarkers = useMemo<ExploreMapMarker[]>(() => {
    if (activeCategory === 'eat') {
      return visibleRestaurants.map((restaurant) => ({
        id: `restaurant-${restaurant.id}`,
        title: restaurant.name,
        subtitle: `${restaurant.cuisine} · ${restaurant.city}`,
        coordinate: restaurant.coordinates,
        color: theme.colors.secondary,
      }));
    }

    return visibleSpots
      .filter((spot) => spot.category === activeCategory)
      .map((spot) => ({
        id: `spot-${spot.id}`,
        title: spot.title,
        subtitle: `${spot.subtitle} · ${spot.city}`,
        coordinate: spot.coordinate,
        color: spot.color,
      }));
  }, [activeCategory, visibleRestaurants, visibleSpots]);

  const sheetItems = useMemo<ExploreCardItem[]>(() => {
    if (activeCategory === 'eat') {
      return visibleRestaurants.map((restaurant) => ({
        id: restaurant.id,
        markerId: `restaurant-${restaurant.id}`,
        title: restaurant.name,
        subtitle: `${restaurant.cuisine} · ${restaurant.city}`,
        distance: restaurant.distance,
        accentLabel: restaurant.isOpen ? 'Open now' : 'Closed now',
        color: restaurant.isOpen ? theme.colors.success : theme.colors.mutedText,
        coordinate: restaurant.coordinates,
        restaurantId: restaurant.id,
      }));
    }

    return visibleSpots
      .filter((spot) => spot.category === activeCategory)
      .map((spot) => ({
        id: spot.id,
        markerId: `spot-${spot.id}`,
        title: spot.title,
        subtitle: `${spot.subtitle} · ${spot.city}`,
        distance: spot.distance,
        accentLabel: spot.accentLabel,
        color: spot.color,
        coordinate: spot.coordinate,
      }));
  }, [activeCategory, visibleRestaurants, visibleSpots]);

  const defaultRegion = useMemo(() => {
    if (activeCategory === 'eat') {
      return getMapRegionForRestaurants(visibleRestaurants);
    }

    return getRegionForCoordinates(
      visibleSpots
        .filter((spot) => spot.category === activeCategory)
        .map((spot) => spot.coordinate),
      selectedLocation.region
    );
  }, [activeCategory, selectedLocation.region, visibleRestaurants, visibleSpots]);

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(mapDiscoveryCategory(selectedCategory));
    }
  }, [selectedCategory]);

  useEffect(() => {
    let active = true;

    const syncLocation = async () => {
      try {
        const currentPermission = await Location.getForegroundPermissionsAsync();

        if (!active) {
          return;
        }

        const granted = currentPermission.status === Location.PermissionStatus.GRANTED;
        setHasLocationPermission(granted);

        if (!granted) {
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!active) {
          return;
        }

        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        if (active) {
          setHasLocationPermission(false);
          setUserLocation(null);
        }
      }
    };

    void syncLocation();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setMapRegion(defaultRegion);
    setSelectedMarkerId(null);
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSearchOpen(false);
  }, [defaultRegion]);

  const openCategoryMenu = () => {
    setIsCategoryMenuOpen((current) => {
      const next = !current;
      setIsSheetVisible(!next);
      setIsCityMenuOpen(false);
      setIsSearchOpen(false);
      return next;
    });
  };

  const openCityMenu = () => {
    setIsCityMenuOpen((current) => {
      const next = !current;
      setIsSheetVisible(!next);
      setIsCategoryMenuOpen(false);
      setIsSearchOpen(false);
      return next;
    });
  };

  const toggleMapType = () => {
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSearchOpen(false);
    setMapType((current) => (current === 'standard' ? 'hybrid' : 'standard'));
  };

  const hideSheetForMap = () => {
    setIsSheetVisible(false);
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleMarkerPress = (markerId: string) => {
    const selectedItem = sheetItems.find((item) => item.markerId === markerId);

    setSelectedMarkerId(markerId);
    setIsSheetVisible(true);

    if (selectedItem) {
      setMapRegion(getFocusedRegion(selectedItem.coordinate, defaultRegion));
    }
  };

  const handleCategorySelect = (category: ActivityKey) => {
    setActiveCategory(category);
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSearchOpen(false);
    setIsSheetVisible(false);
  };

  const handleCitySelect = (locationId: string) => {
    const nextLocation = locationOptions.find((location) => location.id === locationId);

    setSelectedLocationId(locationId);
    setIsCityMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsSearchOpen(false);
    setIsSheetVisible(true);
    setSelectedMarkerId(null);

    if (nextLocation) {
      setMapRegion(nextLocation.region);
    }
  };

  const submitSearch = () => {
    setSearchQuery(draftSearchQuery.trim());
    setIsSearchOpen(false);
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSheetVisible(true);
  };

  const handleSearchPress = () => {
    if (isSearchOpen) {
      submitSearch();
      return;
    }

    setIsSearchOpen(true);
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSheetVisible(false);
  };

  const handleRevealSheet = () => {
    setIsCategoryMenuOpen(false);
    setIsCityMenuOpen(false);
    setIsSearchOpen(false);
    setIsSheetVisible(true);
    setMapRegion(defaultRegion);
  };

  const handleLocatePress = () => {
    const requestLocation = async () => {
      try {
        setIsCategoryMenuOpen(false);
        setIsCityMenuOpen(false);
        setIsSearchOpen(false);
        setIsSheetVisible(true);
        setIsLocatingUser(true);

        let permission = await Location.getForegroundPermissionsAsync();

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        const granted = permission.status === Location.PermissionStatus.GRANTED;
        setHasLocationPermission(granted);

        if (!granted) {
          setUserLocation(null);
          setSelectedMarkerId(null);
          setMapRegion(defaultRegion);
          Alert.alert(
            'Location not enabled',
            'Turn on location access if you want KosVibe to center the map on where you are.'
          );
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(coordinates);
        setSelectedMarkerId(null);
        setMapRegion(getUserRegion(coordinates));
      } catch {
        setMapRegion(defaultRegion);
      } finally {
        setIsLocatingUser(false);
      }
    };

    void requestLocation();
  };

  return (
    <View style={styles.container}>
      <ExploreMap
        markers={mapMarkers}
        region={mapRegion}
        selectedMarkerId={selectedMarkerId}
        onMarkerPress={handleMarkerPress}
        onMapInteractionStart={hideSheetForMap}
        mapType={mapType}
        showsMyLocationButton={false}
        showsUserLocation={hasLocationPermission && userLocation !== null}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerSubtitle}>{selectedLocation.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={styles.categoryButton}
          onPress={openCategoryMenu}>
          <LinearGradient colors={currentOption.colors} style={styles.categoryIconWrap}>
            <Ionicons name={currentOption.icon as never} size={16} color={theme.colors.surface} />
          </LinearGradient>

          <View style={styles.categoryCopy}>
            <Text style={styles.categoryEyebrow}>{copy.categoryEyebrow}</Text>
            <Text style={styles.categoryValue} numberOfLines={1}>
              {currentOption.label}
            </Text>
          </View>

          <Ionicons
            name={isCategoryMenuOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={14}
            color={theme.colors.surface}
          />
        </Pressable>

        <Pressable
          style={styles.cityButton}
          onPress={openCityMenu}>
          <LinearGradient colors={['#42D98C', '#1E9B63']} style={styles.cityIconWrap}>
            <Ionicons name="location-outline" size={16} color={theme.colors.surface} />
          </LinearGradient>
          <View style={styles.cityCopy}>
            <Text style={styles.categoryEyebrow}>{copy.cityEyebrow}</Text>
            <Text style={styles.cityValue} numberOfLines={1}>
              {selectedLocation.city ?? copy.allCities}
            </Text>
          </View>
          <Ionicons
            name={isCityMenuOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={14}
            color={theme.colors.surface}
          />
        </Pressable>

        <Pressable
          accessibilityLabel={`Switch map to ${mapType === 'standard' ? 'satellite' : 'standard'}`}
          style={styles.headerButton}
          onPress={toggleMapType}>
          <Ionicons
            name={mapType === 'standard' ? 'layers-outline' : 'map-outline'}
            size={20}
            color={theme.colors.surface}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Use my location"
          style={styles.headerButton}
          onPress={handleLocatePress}>
          <Ionicons
            name={hasLocationPermission ? 'locate' : 'locate-outline'}
            size={22}
            color={isLocatingUser ? theme.colors.secondary : theme.colors.surface}
          />
        </Pressable>

        <Pressable
          accessibilityLabel={copy.searchButton}
          style={[styles.headerButton, isSearchOpen ? styles.headerButtonActive : undefined]}
          onPress={handleSearchPress}>
          <Ionicons name="search-outline" size={20} color={theme.colors.surface} />
        </Pressable>
      </View>

      {isSearchOpen ? (
        <View style={styles.searchPanel}>
          <TextInput
            autoFocus
            value={draftSearchQuery}
            onChangeText={setDraftSearchQuery}
            onSubmitEditing={submitSearch}
            placeholder={copy.searchPlaceholder}
            placeholderTextColor={theme.colors.mutedText}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
      ) : null}

      {isCategoryMenuOpen ? (
        <View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>{copy.dropdownTitle}</Text>
          <View style={styles.dropdownGrid}>
            {localizedActivityOptions.map((option) => {
              const isActive = option.id === activeCategory;

              return (
                <Pressable
                  key={option.id}
                  style={styles.dropdownOption}
                  onPress={() => handleCategorySelect(option.id)}>
                  {isActive ? (
                    <LinearGradient colors={option.colors} style={styles.dropdownOptionActive}>
                      <Ionicons name={option.icon as never} size={18} color={theme.colors.surface} />
                      <Text style={styles.dropdownActiveLabel}>{option.label}</Text>
                      <Text style={styles.dropdownActiveCount}>
                        {activityCounts[option.id]} {copy.spotsLabel}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.dropdownOptionInactive}>
                      <Ionicons name={option.icon as never} size={18} color={theme.colors.mutedText} />
                      <Text style={styles.dropdownLabel}>{option.label}</Text>
                      <Text style={styles.dropdownCount}>
                        {activityCounts[option.id]} {copy.spotsLabel}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {isCityMenuOpen ? (
        <View style={styles.cityDropdownPanel}>
          <Text style={styles.dropdownTitle}>{copy.cityDropdownTitle}</Text>
          <ScrollView style={styles.cityOptionScroll} contentContainerStyle={styles.cityOptionList}>
            {locationOptions.map((location) => {
              const isActive = location.id === selectedLocationId;

              return (
                <Pressable
                  key={location.id}
                  style={[styles.cityOption, isActive ? styles.cityOptionActive : undefined]}
                  onPress={() => handleCitySelect(location.id)}>
                  <Ionicons
                    name={location.city ? 'business-outline' : 'map-outline'}
                    size={18}
                    color={isActive ? theme.colors.surface : theme.colors.mutedText}
                  />
                  <Text style={[styles.cityOptionText, isActive ? styles.cityOptionTextActive : undefined]}>
                    {location.city ?? copy.allCities}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {isSheetVisible ? (
        <View style={styles.sheet}>
          <View style={styles.sheetTopRow}>
            <View style={styles.sheetCopy}>
              <Text style={styles.sheetTitle}>{currentOption.sheetTitle}</Text>
              <Text style={styles.sheetSubtitle}>
                {activityCounts[activeCategory] > 0
                  ? `${activityCounts[activeCategory]} ${copy.spotsLabel} - ${currentOption.sheetDescription}`
                  : currentOption.emptyDescription}
              </Text>
            </View>

            <Pressable style={styles.sheetHideButton} onPress={() => setIsSheetVisible(false)}>
              <Ionicons name="eye-off-outline" size={18} color={theme.colors.surface} />
            </Pressable>
          </View>

          {sheetItems.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sheetRow}
              onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}>
              {sheetItems.map((item) => {
                const isSelected = item.markerId === selectedMarkerId;

                return (
                  <Pressable
                    key={item.id}
                    style={[styles.placeCard, isSelected ? styles.placeCardSelected : undefined]}
                    onPress={() => {
                      if (item.restaurantId) {
                        navigation.navigate('RestaurantDetails', { restaurantId: item.restaurantId });
                        return;
                      }

                      setSelectedMarkerId(item.markerId);
                      setMapRegion(getFocusedRegion(item.coordinate, defaultRegion));
                    }}>
                    <View style={styles.placeCardTop}>
                      <View style={[styles.placeDot, { backgroundColor: item.color }]} />
                      <Pressable
                        accessibilityLabel={`Get directions to ${item.title}`}
                        style={styles.placeDirectionButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          void openDirectionsToPlace({
                            label: item.title,
                            coordinate: item.coordinate,
                          });
                        }}>
                        <Ionicons name="navigate-outline" size={16} color={theme.colors.surface} />
                      </Pressable>
                    </View>
                    <Text style={styles.placeName}>{item.title}</Text>
                    <Text style={styles.placeMeta}>{item.subtitle}</Text>
                    <Text style={styles.placeDistance}>{item.distance}</Text>
                    <Text style={[styles.placeAccent, { color: item.color }]}>{item.accentLabel}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptyDescription}>{currentOption.emptyDescription}</Text>
            </View>
          )}
        </View>
      ) : (
        <Pressable style={styles.revealButton} onPress={handleRevealSheet}>
          <Ionicons name="layers-outline" size={18} color={theme.colors.surface} />
          <Text style={styles.revealLabel}>{copy.reveal} {currentOption.sheetTitle}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.mapSurface,
  },
  header: {
    position: 'absolute',
    top: 78,
    left: 20,
    right: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    marginRight: 8,
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
  controls: {
    position: 'absolute',
    top: 144,
    left: 14,
    right: 8,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    zIndex: 4,
  },
  categoryButton: {
    flex: 1.15,
    minWidth: 132,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(15,17,28,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCopy: {
    flex: 1,
    minWidth: 0,
  },
  categoryEyebrow: {
    color: theme.colors.mutedText,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  categoryValue: {
    marginTop: 2,
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '800',
  },
  cityButton: {
    flex: 1,
    minWidth: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(15,17,28,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cityCopy: {
    flex: 1,
    minWidth: 0,
  },
  cityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityValue: {
    marginTop: 2,
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '800',
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15,17,28,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  searchPanel: {
    position: 'absolute',
    top: 198,
    left: 20,
    right: 20,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(15,17,28,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...theme.shadow.floating,
    zIndex: 5,
  },
  searchInput: {
    color: theme.colors.heading,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 12,
  },
  dropdownPanel: {
    position: 'absolute',
    top: 198,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(12,14,24,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...theme.shadow.floating,
    zIndex: 5,
  },
  dropdownTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dropdownOption: {
    width: '48%',
  },
  dropdownOptionActive: {
    borderRadius: 22,
    padding: 14,
    gap: 8,
  },
  dropdownOptionInactive: {
    borderRadius: 22,
    padding: 14,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dropdownActiveLabel: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownLabel: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownActiveCount: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownCount: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  cityDropdownPanel: {
    position: 'absolute',
    top: 204,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(12,14,24,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...theme.shadow.floating,
    zIndex: 5,
  },
  cityOptionList: {
    gap: 10,
    paddingBottom: 4,
  },
  cityOptionScroll: {
    marginTop: 14,
    maxHeight: 330,
  },
  cityOption: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cityOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cityOptionText: {
    color: theme.colors.heading,
    fontSize: 15,
    fontWeight: '800',
  },
  cityOptionTextActive: {
    color: theme.colors.surface,
  },
  sheet: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 140,
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(15,17,28,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...theme.shadow.floating,
  },
  sheetTopRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  sheetCopy: {
    flex: 1,
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
  sheetHideButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRow: {
    gap: 12,
    paddingTop: 18,
    paddingRight: 4,
  },
  placeCard: {
    width: 184,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  placeCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,31,61,0.14)',
  },
  placeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  placeDirectionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,31,61,0.86)',
  },
  placeDistance: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  placeName: {
    marginTop: 14,
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  placeMeta: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  placeAccent: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDescription: {
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  revealButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Math.max(PAGE_BOTTOM_PADDING + 6, 104),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(15,17,28,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  revealLabel: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
});
