import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { filterRestaurantsByDiscovery, restaurants } from '../data/mockData';
import { nearbyVibesRestaurants } from '../data/nearbyVibesRestaurants';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useDiscovery } from '../lib/discovery-state';
import { RestaurantShowcaseCard } from '../components/common/RestaurantShowcaseCard';
import { usePageSpacing } from '../components/Screen';
import { theme } from '../theme';

type ActivityDashboardScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type FunActivity = {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  backgroundColor: string;
};

const heroSlides = [
  {
    id: 'drini',
    image: require('../../assets/images/home-drini.jpeg'),
    title: 'DRINI I BARDHE',
    subtitle: 'PEJE, KOSOVO',
  },
  {
    id: 'prishtina',
    image: require('../../assets/images/home-prishtina.jpeg'),
    title: 'PRISHTINA',
    subtitle: 'KOSOVO',
  },
  {
    id: 'rugova',
    image: require('../../assets/images/home-rugova.jpeg'),
    title: 'RUGOVA CANYON',
    subtitle: 'PEJE, KOSOVO',
  },
] as const;

const FUN_ACTIVITY_CARD_WIDTH = 196;
const FUN_ACTIVITY_GAP = 12;

const funActivities: FunActivity[] = [
  {
    id: 'fun-prishtina-mall',
    title: 'Prishtina Mall',
    subtitle: 'Shopping, cinema, food court, and easy indoor hangout energy.',
    city: 'Prishtina',
    icon: 'bag-handle-outline',
    accentColor: '#FFB300',
    backgroundColor: 'rgba(255, 179, 0, 0.16)',
  },
  {
    id: 'fun-germia-park',
    title: 'Germia Park',
    subtitle: 'Forest walks, bike rides, fresh air, and a quick city escape.',
    city: 'Prishtina',
    icon: 'bicycle-outline',
    accentColor: '#42D98C',
    backgroundColor: 'rgba(66, 217, 140, 0.16)',
  },
  {
    id: 'fun-1-tetori',
    title: '1 Tetori Sports Hall',
    subtitle: 'Sports events, training sessions, and an active local crowd.',
    city: 'Prishtina',
    icon: 'basketball-outline',
    accentColor: '#FF6138',
    backgroundColor: 'rgba(255, 97, 56, 0.16)',
  },
  {
    id: 'fun-newborn',
    title: 'Newborn Walk',
    subtitle: 'Photo stop, coffee nearby, and quick city-center exploring.',
    city: 'Prishtina',
    icon: 'camera-outline',
    accentColor: '#FF5EBE',
    backgroundColor: 'rgba(255, 94, 190, 0.16)',
  },
  {
    id: 'fun-bear-sanctuary',
    title: 'Bear Sanctuary',
    subtitle: 'Nature visit and an easy half-day trip outside the city.',
    city: 'Prishtina',
    icon: 'leaf-outline',
    accentColor: '#20C56C',
    backgroundColor: 'rgba(32, 197, 108, 0.16)',
  },
  {
    id: 'fun-brezovica',
    title: 'Brezovica',
    subtitle: 'Mountain views, snow-season fun, and a classic weekend trip.',
    city: 'Prizren',
    icon: 'snow-outline',
    accentColor: '#5DA7FF',
    backgroundColor: 'rgba(93, 167, 255, 0.16)',
  },
  {
    id: 'fun-prizren-fortress',
    title: 'Prizren Fortress',
    subtitle: 'Sunset views, old-town steps, and a classic panorama.',
    city: 'Prizren',
    icon: 'business-outline',
    accentColor: '#FFB300',
    backgroundColor: 'rgba(255, 179, 0, 0.16)',
  },
  {
    id: 'fun-shadervan',
    title: 'Shadervan Night',
    subtitle: 'Dessert, music, and relaxed evening walks in the old town.',
    city: 'Prizren',
    icon: 'musical-notes-outline',
    accentColor: '#D66BFF',
    backgroundColor: 'rgba(214, 107, 255, 0.16)',
  },
  {
    id: 'fun-lumbardhi',
    title: 'Lumbardhi Walk',
    subtitle: 'River views, bridge photos, and a calm cafe route.',
    city: 'Prizren',
    icon: 'walk-outline',
    accentColor: '#42D98C',
    backgroundColor: 'rgba(66, 217, 140, 0.16)',
  },
  {
    id: 'fun-rugova',
    title: 'Rugova Canyon',
    subtitle: 'Adventure routes, scenic drives, and outdoor adrenaline near Peje.',
    city: 'Peje',
    icon: 'trail-sign-outline',
    accentColor: '#8F7CFF',
    backgroundColor: 'rgba(143, 124, 255, 0.16)',
  },
  {
    id: 'fun-via-ferrata',
    title: 'Via Ferrata',
    subtitle: 'Guided cliff routes and big Rugova canyon energy.',
    city: 'Peje',
    icon: 'fitness-outline',
    accentColor: '#FF6138',
    backgroundColor: 'rgba(255, 97, 56, 0.16)',
  },
  {
    id: 'fun-patriarchate',
    title: 'Patriarchate Visit',
    subtitle: 'A peaceful cultural stop close to the mountain road.',
    city: 'Peje',
    icon: 'book-outline',
    accentColor: '#5DA7FF',
    backgroundColor: 'rgba(93, 167, 255, 0.16)',
  },
  {
    id: 'fun-white-drini',
    title: 'White Drini',
    subtitle: 'Waterfall photos, fresh air, and a scenic short drive.',
    city: 'Peje',
    icon: 'water-outline',
    accentColor: '#42D98C',
    backgroundColor: 'rgba(66, 217, 140, 0.16)',
  },
];

const categories = [
  {
    id: 'restaurants' as const,
    icon: 'restaurant-outline' as const,
    onPress: (navigation: NavigationProp<ParamListBase>) =>
      navigation.navigate('Category', { category: 'Restaurants' }),
  },
  {
    id: 'monuments' as const,
    icon: 'business-outline' as const,
    onPress: (navigation: NavigationProp<ParamListBase>) =>
      navigation.navigate('Category', { category: 'Culture' }),
  },
  {
    id: 'events' as const,
    icon: 'sparkles-outline' as const,
    onPress: (navigation: NavigationProp<ParamListBase>) =>
      navigation.getParent()?.navigate('TavolinaTab'),
  },
  {
    id: 'stories' as const,
    icon: 'storefront-outline' as const,
    onPress: (navigation: NavigationProp<ParamListBase>) =>
      navigation.navigate('Market'),
  },
];

export function ActivityDashboardScreen({ navigation }: ActivityDashboardScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].dashboard;
  const { openChat, selectedLocation, selectedLocationId } = useDiscovery();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [incomingHeroIndex, setIncomingHeroIndex] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const billboardAnim = useRef(new Animated.Value(0)).current;
  const assistantPromptAnim = useRef(new Animated.Value(1)).current;
  const [isAssistantPromptVisible, setIsAssistantPromptVisible] = useState(true);
  const pageSpacing = usePageSpacing();
  const visibleRestaurants = filterRestaurantsByDiscovery(restaurants, selectedLocationId, '');
  const trending = visibleRestaurants.slice(0, 2);
  const topPick = visibleRestaurants[2] ?? visibleRestaurants[0];
  const visibleFunActivities = useMemo(
    () =>
      selectedLocation.city
        ? funActivities.filter((activity) => activity.city === selectedLocation.city)
        : funActivities,
    [selectedLocation.city]
  );
  const billboardDistance = visibleFunActivities.length * (FUN_ACTIVITY_CARD_WIDTH + FUN_ACTIVITY_GAP);
  const billboardItems = useMemo(
    () => [...visibleFunActivities, ...visibleFunActivities],
    [visibleFunActivities]
  );
  const activeHero = heroSlides[activeHeroIndex];
  const incomingHero = incomingHeroIndex === null ? null : heroSlides[incomingHeroIndex];
  const activeHeroStyle = incomingHero
    ? {
        opacity: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
      }
    : null;
  const incomingHeroStyle = incomingHero
    ? {
        opacity: fadeAnim,
      }
    : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setIncomingHeroIndex((currentIncomingIndex) => {
        if (currentIncomingIndex !== null) {
          return currentIncomingIndex;
        }

        const nextIndex = (activeHeroIndex + 1) % heroSlides.length;
        fadeAnim.setValue(0);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setActiveHeroIndex(nextIndex);
          setIncomingHeroIndex(null);
          fadeAnim.setValue(0);
        });

        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeHeroIndex, fadeAnim]);

  useEffect(() => {
    if (!billboardDistance) {
      return;
    }

    billboardAnim.setValue(0);

      const animation = Animated.loop(
      Animated.timing(billboardAnim, {
        toValue: -billboardDistance,
        duration: Math.max(7000, billboardDistance * 28),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [billboardAnim, billboardDistance]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(assistantPromptAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsAssistantPromptVisible(false);
        }
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [assistantPromptAnim]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.background}>
        <Animated.Image
          source={activeHero.image}
          style={[styles.heroImage, activeHeroStyle]}
          resizeMode="cover"
          fadeDuration={0}
        />
        {incomingHero ? (
          <Animated.Image
            source={incomingHero.image}
            style={[styles.heroImage, styles.heroImageOverlay, incomingHeroStyle]}
            resizeMode="cover"
            fadeDuration={0}
          />
        ) : null}
        <LinearGradient
          colors={['rgba(7,8,16,0.18)', 'rgba(7,8,16,0.58)', 'rgba(7,8,16,0.82)', 'rgba(7,8,16,0.9)']}
          locations={[0, 0.44, 0.74, 1]}
          style={styles.overlay}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              {
                paddingHorizontal: pageSpacing.horizontalPadding,
                paddingTop: pageSpacing.topPadding,
                paddingBottom: pageSpacing.bottomPadding,
              },
            ]}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                {copy.heroTitle} <Text style={styles.heroAccent}>{copy.heroAccent}</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                {copy.heroSubtitle}
              </Text>

              <Pressable
                style={styles.ctaRow}
                onPress={() => navigation.navigate('Category', { category: 'Culture' })}>
                <Text style={styles.ctaText}>{copy.cta}</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.surface} />
              </Pressable>
            </View>

            <View style={styles.categoryRow}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => category.onPress(navigation)}>
                  <LinearGradient colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.06)']} style={styles.categoryFill}>
                    <View style={styles.categoryIconWrap}>
                      <Ionicons name={category.icon} size={18} color={theme.colors.surface} />
                    </View>
                    <Text style={styles.categoryLabel}>{copy.categories[category.id]}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{copy.trending}</Text>
              <View style={styles.trendingGrid}>
                {trending.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.miniCard}
                    onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}>
                    <Text style={styles.miniCardTitle}>{item.name}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="star" size={13} color={theme.colors.secondary} />
                      <Text style={styles.metaText}>{item.rating.toFixed(1)} • {item.city}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {topPick ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{copy.topPicks}</Text>
                <Pressable
                  style={styles.featureCard}
                  onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: topPick.id })}>
                  <Text style={styles.featureTitle}>{topPick.name}</Text>
                  <Text style={styles.featureMeta}>
                    {topPick.cuisine} • {topPick.priceRange}
                  </Text>
                  <Text style={styles.featureDistance}>{topPick.distance} {copy.away}</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{copy.categories.restaurants}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.restaurantRow}>
                {nearbyVibesRestaurants.map((restaurant) => (
                  <RestaurantShowcaseCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fun Activities</Text>
              <View style={styles.funActivityBillboard}>
                <Animated.View
                  style={[
                    styles.funActivityRow,
                    {
                      transform: [{ translateX: billboardAnim }],
                    },
                  ]}>
                  {billboardItems.map((activity, index) => (
                    <View key={`${activity.id}-${index}`} style={styles.funActivityCard}>
                    <View
                      style={[
                        styles.funActivityIconWrap,
                        { backgroundColor: activity.backgroundColor },
                      ]}>
                      <Ionicons name={activity.icon} size={24} color={activity.accentColor} />
                    </View>
                    <Text style={styles.funActivityCity}>{activity.city}</Text>
                    <Text style={styles.funActivityTitle}>{activity.title}</Text>
                    <Text style={styles.funActivitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  ))}
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>

        <Pressable
          style={[
            styles.assistantLauncher,
            { bottom: Math.max(pageSpacing.bottomPadding + 12, 112) },
          ]}
          onPress={openChat}>
          {isAssistantPromptVisible ? (
            <Animated.Text
              style={[
                styles.assistantPrompt,
                {
                  opacity: assistantPromptAnim,
                  transform: [
                    {
                      translateX: assistantPromptAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                    {
                      scale: assistantPromptAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}>
              How can I help you discover Kosovo?
            </Animated.Text>
          ) : null}
          <View style={styles.assistantOrb}>
            <Ionicons name="sparkles-outline" size={24} color={theme.colors.surface} />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.025 }],
  },
  heroImageOverlay: {
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    minHeight: '100%',
  },
  heroCopy: {
    maxWidth: 360,
  },
  heroTitle: {
    color: theme.colors.heading,
    fontSize: 58,
    lineHeight: 56,
    fontWeight: '900',
    letterSpacing: -2.4,
  },
  heroAccent: {
    color: '#EDE7F9',
    opacity: 0.92,
    fontSize: 46,
  },
  heroSubtitle: {
    marginTop: 14,
    color: '#E3E5F0',
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 320,
  },
  ctaRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '900',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 40,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  categoryFill: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    color: theme.colors.surface,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 32,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    color: theme.colors.secondary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  trendingGrid: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  restaurantRow: {
    marginTop: 14,
    gap: 14,
    paddingRight: 24,
  },
  miniCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  miniCardTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  featureCard: {
    marginTop: 14,
  },
  featureTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  featureMeta: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 15,
  },
  featureDistance: {
    marginTop: 2,
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  funActivityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  funActivityBillboard: {
    height: 146,
    marginTop: 14,
    overflow: 'hidden',
  },
  funActivityCard: {
    width: FUN_ACTIVITY_CARD_WIDTH,
    height: 146,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  funActivityIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funActivityCity: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  funActivityTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  funActivitySubtitle: {
    color: '#E3E5F0',
    fontSize: 12,
    lineHeight: 17,
  },
  assistantLauncher: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 4,
  },
  assistantPrompt: {
    maxWidth: 154,
    color: theme.colors.surface,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'right',
    backgroundColor: 'rgba(7,8,16,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assistantOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...theme.shadow.floating,
  },
});
