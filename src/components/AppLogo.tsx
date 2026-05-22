import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/src/theme';

type AppLogoProps = {
  compact?: boolean;
};

export function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.markWrap, compact ? styles.markWrapCompact : undefined]}>
        <LinearGradient colors={theme.gradients.sunset} style={[styles.mark, compact ? styles.markCompact : undefined]}>
          <Text style={[styles.markText, compact ? styles.markTextCompact : undefined]}>KV</Text>
        </LinearGradient>
      </View>
      {!compact ? (
        <View>
          <Text style={styles.wordmark}>KosVibe</Text>
          <Text style={styles.caption}>Kosovo lifestyle</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  markWrap: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrapCompact: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.xl,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCompact: {
    width: 42,
    height: 42,
    borderRadius: 18,
  },
  markText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  markTextCompact: {
    fontSize: 14,
  },
  wordmark: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  caption: {
    color: theme.colors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
});
