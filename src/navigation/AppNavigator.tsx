import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChatAssistantModal } from '../components/common/ChatAssistantModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAuth } from '../features/auth/AuthProvider';
import { ScrollBehaviorProvider } from '../lib/scroll-behavior';
import { navigationTheme, theme } from '../theme';
import { AdminNavigator } from './AdminNavigator';
import { AuthNavigator } from './AuthNavigator';
import { BusinessNavigator } from './BusinessNavigator';
import { TabsNavigator } from './TabsNavigator';

export function AppNavigator() {
  const { isAuthReady, session, accountType } = useAuth();

  return (
    <ErrorBoundary>
      <ScrollBehaviorProvider>
        <NavigationContainer theme={navigationTheme}>
          {!isAuthReady ? (
            <View style={styles.loadingScreen}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading KosVibe...</Text>
            </View>
          ) : (
            <>
              {!session ? (
                <AuthNavigator />
              ) : accountType === 'super_admin' ? (
                <AdminNavigator />
              ) : accountType === 'business' ? (
                <BusinessNavigator />
              ) : (
                <TabsNavigator />
              )}
              {session ? <ChatAssistantModal /> : null}
            </>
          )}
        </NavigationContainer>
      </ScrollBehaviorProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.mutedText,
  },
});