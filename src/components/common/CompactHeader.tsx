import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { AppLogo } from '../AppLogo';
import { HeaderMenu } from './HeaderMenu';

export function CompactHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <AppLogo compact />
        <View style={styles.titleWrap}>
          <Text style={styles.title}>KosVibe</Text>
          <Text style={styles.subtitle}>Smart travel</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Pressable style={styles.moon} accessibilityLabel="Toggle theme">
          <Ionicons name="moon-outline" size={18} color={theme.colors.surface} />
        </Pressable>
        <HeaderMenu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  titleWrap: {
    display: 'flex',
  },
  title: {
    color: theme.colors.surface,
    fontWeight: '800',
    fontSize: 14,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  moon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
