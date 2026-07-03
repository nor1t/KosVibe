import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { StickyAppHeader } from '../components/common/StickyAppHeader';
import { AdminApprovalScreen } from '../screens/AdminApprovalScreen';
import { BookTableScreen } from '../screens/BookTableScreen';
import { BusinessDashboardScreen } from '../screens/BusinessDashboardScreen';
import { BusinessRegistrationScreen } from '../screens/BusinessRegistrationScreen';
import { ClaimRestaurantScreen } from '../screens/ClaimRestaurantScreen';
import { EditRestaurantScreen } from '../screens/EditRestaurantScreen';
import { GalleryManagerScreen } from '../screens/GalleryManagerScreen';
import { MenuManagerScreen } from '../screens/MenuManagerScreen';
import { ReservationsManager } from '../screens/ReservationsManager';
import { RestaurantDetailsScreen } from '../screens/RestaurantDetailsScreen';
import { SpecialsManagerScreen } from '../screens/SpecialsManagerScreen';
import { theme } from '../theme';
import type { BusinessStackParamList } from './types';

const Stack = createNativeStackNavigator<BusinessStackParamList>();

const stackScreenOptions = ({ navigation }: { navigation: NavigationProp<ParamListBase> }) => ({
  headerShown: true,
  headerTransparent: true,
  headerShadowVisible: false,
  header: () => <StickyAppHeader navigation={navigation} />,
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
});

export function BusinessNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="BusinessDashboard" component={BusinessDashboardScreen} />
      <Stack.Screen name="BusinessRegistration" component={BusinessRegistrationScreen} />
      <Stack.Screen name="ClaimRestaurant" component={ClaimRestaurantScreen} />
      <Stack.Screen name="EditRestaurant" component={EditRestaurantScreen} />
      <Stack.Screen name="GalleryManager" component={GalleryManagerScreen} />
      <Stack.Screen name="MenuManager" component={MenuManagerScreen} />
      <Stack.Screen name="SpecialsManager" component={SpecialsManagerScreen} />
      <Stack.Screen name="ReservationsManager" component={ReservationsManager} />
      <Stack.Screen name="AdminApproval" component={AdminApprovalScreen} />
      {/* Shared presentation screens */}
      <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <Stack.Screen name="BookTable" component={BookTableScreen} />
    </Stack.Navigator>
  );
}