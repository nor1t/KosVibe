import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StickyAppHeader } from '../components/common/StickyAppHeader';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { ActivityDashboardScreen } from '../screens/ActivityDashboardScreen';
import { BookTableScreen } from '../screens/BookTableScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { CreateStoryScreen } from '../screens/CreateStoryScreen';
import { ExchangeScreen } from '../screens/ExchangeScreen';
import { FavoriteRestaurantsScreen } from '../screens/FavoriteRestaurantsScreen';
import { StoriesScreen } from '../screens/FavoritesScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ImportantNumbersScreen } from '../screens/ImportantNumbersScreen';
import { MapScreen } from '../screens/MapScreen';
import { MarketScreen } from '../screens/MarketScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RestaurantDetailsScreen } from '../screens/RestaurantDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StoryDetailScreen } from '../screens/StoryDetailScreen';
import { StorySearchScreen } from '../screens/StorySearchScreen';
import { TavolinaScreen } from '../screens/TavolinaScreen';
import { theme } from '../theme';
import type {
    HomeStackParamList,
    MapStackParamList,
    ProfileStackParamList,
    RootTabParamList,
    StoriesStackParamList,
    TavolinaStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();
const TavolinaStack = createNativeStackNavigator<TavolinaStackParamList>();
const StoriesStack = createNativeStackNavigator<StoriesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const noHeaderOptions = { headerShown: false };

const stackScreenOptions = ({ navigation }: { navigation: NavigationProp<ParamListBase> }) => ({
  headerShown: true,
  headerTransparent: true,
  headerShadowVisible: false,
  header: () => <StickyAppHeader navigation={navigation} />,
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
});

type IconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  routeName,
  color,
  size,
}: {
  routeName: keyof RootTabParamList;
  color: string;
  size: number;
}) {
  if (routeName === 'TavolinaTab') {
    return <MaterialCommunityIcons name="plus-circle-outline" size={size + 2} color={color} />;
  }

  const iconByRoute: Record<Exclude<keyof RootTabParamList, 'TavolinaTab'>, IconName> = {
    HomeTab: 'home-outline',
    MapTab: 'search-outline',
    StoriesTab: 'book-outline',
    ProfileTab: 'person-outline',
  };

  return <Ionicons name={iconByRoute[routeName]} size={size} color={color} />;
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={ActivityDashboardScreen} />
      <HomeStack.Screen name="Market" component={MarketScreen} />
      <HomeStack.Screen name="Category" component={CategoryScreen} />
      <HomeStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <HomeStack.Screen name="BookTable" component={BookTableScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="ImportantNumbers" component={ImportantNumbersScreen} options={noHeaderOptions} />
      <HomeStack.Screen name="History" component={HistoryScreen} options={noHeaderOptions} />
      <HomeStack.Screen name="Help" component={HelpScreen} options={noHeaderOptions} />
      <HomeStack.Screen name="Exchange" component={ExchangeScreen} options={noHeaderOptions} />
    </HomeStack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={stackScreenOptions}>
      <MapStack.Screen name="MapMain" component={MapScreen} />
      <MapStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <MapStack.Screen name="BookTable" component={BookTableScreen} />
      <MapStack.Screen name="Settings" component={SettingsScreen} />
      <MapStack.Screen name="ImportantNumbers" component={ImportantNumbersScreen} options={noHeaderOptions} />
      <MapStack.Screen name="History" component={HistoryScreen} options={noHeaderOptions} />
      <MapStack.Screen name="Help" component={HelpScreen} options={noHeaderOptions} />
      <MapStack.Screen name="Exchange" component={ExchangeScreen} options={noHeaderOptions} />
    </MapStack.Navigator>
  );
}

function TavolinaStackNavigator() {
  return (
    <TavolinaStack.Navigator screenOptions={stackScreenOptions}>
      <TavolinaStack.Screen name="TavolinaMain" component={TavolinaScreen} />
      <TavolinaStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <TavolinaStack.Screen name="BookTable" component={BookTableScreen} />
      <TavolinaStack.Screen name="Settings" component={SettingsScreen} />
      <TavolinaStack.Screen name="ImportantNumbers" component={ImportantNumbersScreen} options={noHeaderOptions} />
      <TavolinaStack.Screen name="History" component={HistoryScreen} options={noHeaderOptions} />
      <TavolinaStack.Screen name="Help" component={HelpScreen} options={noHeaderOptions} />
      <TavolinaStack.Screen name="Exchange" component={ExchangeScreen} options={noHeaderOptions} />
    </TavolinaStack.Navigator>
  );
}

function StoriesStackNavigator() {
  return (
    <StoriesStack.Navigator screenOptions={stackScreenOptions}>
      <StoriesStack.Screen name="StoriesMain" component={StoriesScreen} />
      <StoriesStack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <StoriesStack.Screen name="StorySearch" component={StorySearchScreen} />
      <StoriesStack.Screen name="CreateStory" component={CreateStoryScreen} />
      <StoriesStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <StoriesStack.Screen name="BookTable" component={BookTableScreen} />
      <StoriesStack.Screen name="Settings" component={SettingsScreen} />
      <StoriesStack.Screen name="ImportantNumbers" component={ImportantNumbersScreen} options={noHeaderOptions} />
      <StoriesStack.Screen name="History" component={HistoryScreen} options={noHeaderOptions} />
      <StoriesStack.Screen name="Help" component={HelpScreen} options={noHeaderOptions} />
      <StoriesStack.Screen name="Exchange" component={ExchangeScreen} options={noHeaderOptions} />
    </StoriesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={ProfileEditScreen} />
      <ProfileStack.Screen name="FavoriteRestaurants" component={FavoriteRestaurantsScreen} />
      <ProfileStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="ImportantNumbers" component={ImportantNumbersScreen} options={noHeaderOptions} />
      <ProfileStack.Screen name="History" component={HistoryScreen} options={noHeaderOptions} />
      <ProfileStack.Screen name="Help" component={HelpScreen} options={noHeaderOptions} />
      <ProfileStack.Screen name="Exchange" component={ExchangeScreen} options={noHeaderOptions} />
    </ProfileStack.Navigator>
  );
}

export function TabsNavigator() {
  const { language } = useI18n();
  const copy = nativeCopy[language].tabs;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: 10 + Math.min(insets.bottom, 10),
            height: 82,
            paddingBottom: 12,
          },
        ],
        sceneStyle: styles.scene,
        tabBarActiveTintColor: theme.colors.surface,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarIcon: ({ color, size }) => (
          <TabIcon routeName={route.name as keyof RootTabParamList} color={color} size={size} />
        ),
      })}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: copy.home }} />
      <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ title: copy.explore }} />
      <Tab.Screen name="TavolinaTab" component={TavolinaStackNavigator} options={{ title: copy.events }} />
      <Tab.Screen name="StoriesTab" component={StoriesStackNavigator} options={{ title: copy.stories }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: copy.profile }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    paddingTop: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.26,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(10,14,25,0.72)',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
