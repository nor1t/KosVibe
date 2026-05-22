import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { filterRestaurantsByDiscovery, restaurants } from '../data/mockData';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useDiscovery } from '../lib/discovery-state';
import { theme } from '../theme';

type ActivityDashboardScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const heroImage =
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80';

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
    icon: 'book-outline' as const,
    onPress: (navigation: NavigationProp<ParamListBase>) =>
      navigation.getParent()?.navigate('FavoritesTab'),
  },
];

export function ActivityDashboardScreen({ navigation }: ActivityDashboardScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].dashboard;
  const { selectedLocation, selectedLocationId } = useDiscovery();
  const visibleRestaurants = filterRestaurantsByDiscovery(restaurants, selectedLocationId, '');
  const trending = visibleRestaurants.slice(0, 2);
  const topPick = visibleRestaurants[2] ?? visibleRestaurants[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={{ uri: heroImage }} style={styles.background}>
        <LinearGradient colors={['rgba(7,8,16,0.18)', 'rgba(7,8,16,0.55)', 'rgba(7,8,16,0.92)']} style={styles.overlay}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.brand}>KosVibe</Text>
                <Text style={styles.countryCode}>XK</Text>
                <Text style={styles.location}>{selectedLocation.label}</Text>
              </View>

              <Pressable
                accessibilityLabel={copy.settingsLabel}
                style={styles.headerAction}
                onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings-outline" size={22} color={theme.colors.surface} />
              </Pressable>
            </View>

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
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  content: {
    minHeight: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 144,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 92,
  },
  brand: {
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  countryCode: {
    color: theme.colors.surface,
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  location: {
    color: theme.colors.secondary,
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
    textAlign: 'center',
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
});
