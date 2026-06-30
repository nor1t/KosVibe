/* eslint-disable import/no-duplicates */
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/features/auth/AuthProvider';
import { I18nProvider } from './src/i18n/I18nProvider';
import { RestaurantCatalogProvider } from './src/lib/restaurant-catalog';
import { DiscoveryProvider } from './src/lib/discovery-state';
import { StoriesProvider } from './src/lib/stories-state';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <AuthProvider>
            <RestaurantCatalogProvider>
              <DiscoveryProvider>
                <StoriesProvider>
                  <StatusBar style="light" translucent backgroundColor="transparent" />
                  <AppNavigator />
                </StoriesProvider>
              </DiscoveryProvider>
            </RestaurantCatalogProvider>
          </AuthProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
