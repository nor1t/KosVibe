import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { NoticeBanner } from '@/src/components/NoticeBanner';
import { Screen } from '@/src/components/Screen';
import { StatusCard } from '@/src/components/StatusCard';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { RestaurantCard } from '@/src/features/restaurants/RestaurantCard';
import { getRestaurantDetailHref } from '@/src/features/restaurants/routes';
import { useRestaurantCatalog } from '@/src/features/restaurants/useRestaurantCatalog';
import { useI18n } from '@/src/i18n/I18nProvider';
import { theme } from '@/src/theme';

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { messages } = useI18n();
  const {
    restaurants,
    isLoading,
    errorMessage,
    mutationErrorMessage,
    pendingRestaurantIds,
    refresh,
    toggleSaved,
  } = useRestaurantCatalog({
    userId: user?.id,
    loadErrorMessage: messages.restaurants.loadError,
    mutationErrorMessage: messages.restaurants.mutationError,
  });

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      <Card variant="accent" style={styles.heroCard}>
        <AppText variant="eyebrow" color={theme.colors.surface}>
          KosVibe
        </AppText>
        <AppText variant="display" color={theme.colors.surface} style={styles.heroTitle}>
          Discover where Kosovo loves to eat.
        </AppText>
        <AppText variant="body" color={theme.colors.surfaceMuted}>
          A calm, mobile-first foundation for restaurant discovery, saved lists, and local search.
        </AppText>
      </Card>

      <View style={styles.sectionHeader}>
        <AppText variant="title">{messages.restaurants.discoverTitle}</AppText>
        <AppText variant="body" color={theme.colors.mutedText}>
          {messages.restaurants.discoverSubtitle}
        </AppText>
      </View>

      {mutationErrorMessage ? (
        <NoticeBanner message={mutationErrorMessage} variant="error" />
      ) : null}

      {isLoading ? (
        <StatusCard
          title={messages.restaurants.loadingTitle}
          message={messages.restaurants.loadingMessage}
          isLoading
        />
      ) : null}

      {!isLoading && errorMessage ? (
        <EmptyState
          title={messages.restaurants.discoverTitle}
          description={messages.restaurants.loadError}
          actionLabel={messages.common.retry}
          onActionPress={() => {
            void refresh();
          }}
        />
      ) : null}

      {!isLoading && !errorMessage && restaurants.length === 0 ? (
        <EmptyState
          title={messages.restaurants.discoverEmptyTitle}
          description={messages.restaurants.discoverEmptyDescription}
          actionLabel={messages.common.retry}
          onActionPress={() => {
            void refresh();
          }}
        />
      ) : null}

      {!isLoading && !errorMessage
        ? restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              saveLabel={messages.restaurants.saveAction}
              savedLabel={messages.restaurants.savedAction}
              featuredLabel={messages.restaurants.featuredBadge}
              ratingLabel={messages.restaurants.ratingLabel}
              onPress={(selectedRestaurant) => {
                router.push(getRestaurantDetailHref(selectedRestaurant.slug));
              }}
              isSavePending={pendingRestaurantIds.includes(restaurant.id)}
              onToggleSaved={(restaurantId, nextSaved) => {
                void toggleSaved(restaurantId, nextSaved);
              }}
            />
          ))
        : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  heroCard: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  heroTitle: {
    maxWidth: 280,
  },
  sectionHeader: {
    gap: theme.spacing.xs,
  },
});
