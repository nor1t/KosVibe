import { StyleSheet, Text, View } from 'react-native';

import type { KosovoHighlight } from '../../data/mockData';
import { theme } from '../../theme';

type InfoHighlightCardProps = {
  highlight: KosovoHighlight;
};

export function InfoHighlightCard({ highlight }: InfoHighlightCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: highlight.accentColor }]} />
      <View style={styles.copy}>
        <Text style={styles.title}>{highlight.title}</Text>
        <Text numberOfLines={4} style={styles.description}>
          {highlight.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.card,
    minWidth: 200,
    flex: 1,
  },
  accent: {
    height: 8,
    width: '100%',
  },
  copy: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.subtitle,
    lineHeight: theme.typography.lineHeights.subtitle,
    fontWeight: '800',
    color: theme.colors.heading,
  },
  description: {
    color: theme.colors.mutedText,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
  },
});
