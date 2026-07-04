import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { StickyAppHeader } from '../components/common/StickyAppHeader';
import { AdminApprovalScreen } from '../screens/AdminApprovalScreen';
import { RestaurantDetailsScreen } from '../screens/RestaurantDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { theme } from '../theme';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();
const noHeaderOptions = { headerShown: false };

const stackScreenOptions = ({ navigation }: { navigation: NavigationProp<ParamListBase> }) => ({
  headerShown: true,
  headerTransparent: true,
  headerShadowVisible: false,
  header: () => <StickyAppHeader navigation={navigation} />,
  contentStyle: { backgroundColor: theme.colors.background },
});

export function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminDashboard" component={AdminApprovalScreen} />
      <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={noHeaderOptions} />
    </Stack.Navigator>
  );
}