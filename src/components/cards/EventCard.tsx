import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { EventFeature } from '../../data/mockData';
import { theme } from '../../theme';

type EventCardProps = {
  event: EventFeature;
  onPress?: () => void;
};

const icons: Record<EventFeature['category'], string> = {
  Restaurants: 'restaurant-outline',
  Hiking: 'leaf-outline',
  Party: 'sparkles-outline',
  Culture: 'book-outline',
  Study: 'school-outline',
};

export function EventCard({ event, onPress }: EventCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient colors={event.colors} style={styles.gradient}>
        <View style={styles.topRow}>
          <View style={styles.chip}>
            <Ionicons name={icons[event.category] as any} size={18} color={theme.colors.surface} />
            <Text style={styles.chipText}>{event.category}</Text>
          </View>
          <Text style={styles.dateText}>{event.date}</Text>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {event.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {event.venue}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text numberOfLines={3} style={styles.description}>
          {event.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.body,
    fontWeight: '700',
  },
  dateText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.caption,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.title,
    lineHeight: theme.typography.lineHeights.title,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.subtitle,
  },
  body: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  description: {
    color: theme.colors.mutedText,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
  },
});
