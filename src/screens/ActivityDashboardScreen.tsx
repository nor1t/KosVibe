import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantShowcaseCard } from '../components/common/RestaurantShowcaseCard';
import { usePageSpacing } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useDiscovery } from '../lib/discovery-state';
import { eventsRepository } from '../repositories/eventsRepository';
import { placesRepository } from '../repositories/placesRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import { searchRepository } from '../repositories/searchRepository';
import type { FunActivity, KosovoHighlight } from '../repositories/types';
import { theme } from '../theme';

type ActivityDashboardScreenProps = {
  navigation: NavigationProp<ParamListBase>;
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
  const activeHeroIndexRef = useRef(0);
  const isHeroTransitioningRef = useRef(false);
  const heroOpacityAnims = useRef(
    heroSlides.map((_, index) => new Animated.Value(index === 0 ? 1 : 0))
  ).current;
  const billboardAnim = useRef(new Animated.Value(0)).current;
  const assistantPromptAnim = useRef(new Animated.Value(1)).current;
  const [selectedActivity, setSelectedActivity] = useState<FunActivity | null>(null);
  const [isAssistantPromptVisible, setIsAssistantPromptVisible] = useState(true);
  const pageSpacing = usePageSpacing();
  const [kosovoHighlights, setKosovoHighlights] = useState<KosovoHighlight[]>([]);
  const [funActivities, setFunActivities] = useState<FunActivity[]>([]);
  const visibleRestaurants = useMemo(
    () => searchRepository.searchRestaurants(selectedLocationId, ''),
    [selectedLocationId]
  );
  const topPick = visibleRestaurants[2] ?? visibleRestaurants[0];
  const visibleFunActivities = useMemo(
    () =>
      selectedLocation.city
        ? funActivities.filter((activity) => activity.city === selectedLocation.city)
        : funActivities,
    [selectedLocation.city, funActivities]
  );
  const billboardDistance = visibleFunActivities.length * (FUN_ACTIVITY_CARD_WIDTH + FUN_ACTIVITY_GAP);
  const billboardItems = useMemo(
    () => [...visibleFunActivities, ...visibleFunActivities],
    [visibleFunActivities]
  );
  useEffect(() => {
    const interval = setInterval(() => {
      if (isHeroTransitioningRef.current) {
        return;
      }

      const currentIndex = activeHeroIndexRef.current;
      const nextIndex = (currentIndex + 1) % heroSlides.length;
      isHeroTransitioningRef.current = true;
      heroOpacityAnims[nextIndex].setValue(0);

      Animated.parallel([
        Animated.timing(heroOpacityAnims[currentIndex], {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heroOpacityAnims[nextIndex], {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          activeHeroIndexRef.current = nextIndex;
        }

        isHeroTransitioningRef.current = false;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [heroOpacityAnims]);

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
    void eventsRepository.refresh().then(() => {
      setKosovoHighlights(eventsRepository.getKosovoHighlights());
    });
    void placesRepository.refresh().then(() => {
      setFunActivities(placesRepository.getFunActivities());
    });
  }, []);

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
        {heroSlides.map((hero, index) => (
          <Animated.Image
            key={hero.id}
            source={hero.image}
            style={[styles.heroImage, { opacity: heroOpacityAnims[index] }]}
            resizeMode="cover"
            fadeDuration={0}
          />
        ))}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingRow}>
                {kosovoHighlights.slice(0, 3).map((item) => (
                  <View
                    key={item.id}
                    style={[styles.trendingCard, { borderColor: item.accentColor + '66' }]}>
                    <View style={[styles.trendingAccentBar, { backgroundColor: item.accentColor }]} />
                    <View style={styles.trendingCardContent}>
                      <Text style={styles.trendingCardTitle}>{item.title}</Text>
                      <Text style={styles.trendingCardDesc}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
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
                {restaurantsRepository.getNearbyVibes().map((restaurant) => (
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
                    <Pressable
                      key={`${activity.id}-${index}`}
                      style={styles.funActivityCard}
                      onPress={() => setSelectedActivity(activity)}>
                      <View
                        style={[
                          styles.funActivityIconWrap,
                          { backgroundColor: activity.backgroundColor },
                        ]}>
                        <Ionicons
                          name={activity.icon as keyof typeof Ionicons.glyphMap}
                          size={24}
                          color={activity.accentColor}
                        />
                      </View>
                      <Text style={styles.funActivityCity}>{activity.city}</Text>
                      <Text style={styles.funActivityTitle}>{activity.title}</Text>
                      <Text style={styles.funActivitySubtitle}>{activity.subtitle}</Text>
                    </Pressable>
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

        <Modal
          visible={selectedActivity !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedActivity(null)}>
          <Pressable style={styles.activityModalBackdrop} onPress={() => setSelectedActivity(null)}>
            {selectedActivity ? (
              <Pressable style={styles.activityModalCard} onPress={(event) => event.stopPropagation()}>
                <View
                  style={[
                    styles.activityModalIcon,
                    { backgroundColor: selectedActivity.backgroundColor },
                  ]}>
                  <Ionicons
                    name={selectedActivity.icon as keyof typeof Ionicons.glyphMap}
                    size={26}
                    color={selectedActivity.accentColor}
                  />
                </View>
                <Text style={styles.activityModalCity}>{selectedActivity.city}</Text>
                <Text style={styles.activityModalTitle}>{selectedActivity.title}</Text>
                <Text style={styles.activityModalSummary}>{selectedActivity.summary}</Text>
                <Pressable
                  style={styles.activityModalClose}
                  onPress={() => setSelectedActivity(null)}>
                  <Text style={styles.activityModalCloseText}>Close</Text>
                </Pressable>
              </Pressable>
            ) : null}
          </Pressable>
        </Modal>
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
  trendingRow: {
    marginTop: 14,
    gap: 12,
    paddingRight: 12,
  },
  trendingCard: {
    width: 260,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  trendingAccentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  trendingCardContent: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 8,
  },
  trendingCardTitle: {
    color: theme.colors.heading,
    fontSize: 15,
    fontWeight: '900',
  },
  trendingCardDesc: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
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
  activityModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    backgroundColor: 'rgba(7,8,16,0.72)',
  },
  activityModalCard: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: 'rgba(18,20,32,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  activityModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityModalCity: {
    marginTop: 16,
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  activityModalTitle: {
    marginTop: 6,
    color: theme.colors.heading,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  activityModalSummary: {
    marginTop: 10,
    color: '#E3E5F0',
    fontSize: 15,
    lineHeight: 23,
  },
  activityModalClose: {
    marginTop: 20,
    alignSelf: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
  },
  activityModalCloseText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '900',
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
