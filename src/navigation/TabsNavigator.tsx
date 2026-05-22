import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { ActivityDashboardScreen } from '../screens/ActivityDashboardScreen';
import { BookTableScreen } from '../screens/BookTableScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RestaurantDetailsScreen } from '../screens/RestaurantDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TavolinaScreen } from '../screens/TavolinaScreen';
import { theme } from '../theme';
import type {
    FavoritesStackParamList,
    HomeStackParamList,
    MapStackParamList,
    ProfileStackParamList,
    RootTabParamList,
    TavolinaStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();
const TavolinaStack = createNativeStackNavigator<TavolinaStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const stackScreenOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
};

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
    FavoritesTab: 'book-outline',
    ProfileTab: 'person-outline',
  };

  return <Ionicons name={iconByRoute[routeName]} size={size} color={color} />;
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={ActivityDashboardScreen} />
      <HomeStack.Screen name="Category" component={CategoryScreen} />
      <HomeStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <HomeStack.Screen name="BookTable" component={BookTableScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
    </HomeStack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={stackScreenOptions}>
      <MapStack.Screen name="MapMain" component={MapScreen} />
      <MapStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <MapStack.Screen name="BookTable" component={BookTableScreen} />
    </MapStack.Navigator>
  );
}

function TavolinaStackNavigator() {
  return (
    <TavolinaStack.Navigator screenOptions={stackScreenOptions}>
      <TavolinaStack.Screen name="TavolinaMain" component={TavolinaScreen} />
      <TavolinaStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <TavolinaStack.Screen name="BookTable" component={BookTableScreen} />
    </TavolinaStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={stackScreenOptions}>
      <FavoritesStack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <FavoritesStack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <FavoritesStack.Screen name="BookTable" component={BookTableScreen} />
    </FavoritesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        sceneStyle: styles.scene,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: theme.colors.surface,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <LinearGradient colors={['rgba(8,10,18,0.98)', 'rgba(13,13,26,0.98)']} style={StyleSheet.absoluteFill} />
        ),
        tabBarIcon: ({ color, size }) => (
          <TabIcon routeName={route.name as keyof RootTabParamList} color={color} size={size} />
        ),
      })}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ title: 'Explore' }} />
      <Tab.Screen name="TavolinaTab" component={TavolinaStackNavigator} options={{ title: 'Events' }} />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStackNavigator}
        options={{ title: 'Stories' }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    height: 82,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
