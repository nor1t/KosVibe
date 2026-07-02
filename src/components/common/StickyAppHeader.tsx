import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import { WeatherSettingsButton } from './WeatherSettingsButton';

type StickyAppHeaderProps = {
  navigation: NavigationProp<ParamListBase>;
};

const pageLabelMap: Record<string, string> = {
  HomeMain: 'Home',
  Market: 'Rural Market',
  Category: 'Restaurants',
  MapMain: 'Explore',
  TavolinaMain: 'Events',
  FavoritesMain: 'Rural Market',
  ProfileMain: 'Profile',
  EditProfile: 'Edit Profile',
  RestaurantDetails: 'Restaurant',
  BookTable: 'Booking',
  Settings: 'Settings',
  History: 'History',
  Help: 'Help',
  Exchange: 'Exchange',
};

export function StickyAppHeader({ navigation }: StickyAppHeaderProps) {
  const insets = useSafeAreaInsets();
  const state = navigation.getState();
  const currentRoute = state.routes[state.index ?? 0];
  const routeName = currentRoute?.name ?? 'HomeMain';
  const pageLabel = (() => {
    if (routeName === 'Category') {
      const category = (currentRoute?.params as { category?: string } | undefined)?.category;
      return category === 'Culture' ? 'Monuments' : 'Restaurants';
    }

    return pageLabelMap[routeName] ?? routeName.replace(/Main$/, '');
  })();

  return (
    <View style={[styles.shell, { paddingTop: insets.top + 10 }]}>
      <Pressable>
        <View style={styles.glassPanel}>
          <LinearGradient
            colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glassHighlight} />
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.brand}>KosVibe</Text>
            </View>

            <WeatherSettingsButton navigation={navigation} collapseInfoActions />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  glassPanel: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 26,
    pointerEvents: 'none',
  },
  row: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    color: theme.colors.heading,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  pageName: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
});
