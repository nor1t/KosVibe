import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { AppLogo } from '../AppLogo';

export function Footer() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <AppLogo compact />
        <Text style={styles.copy}>© {new Date().getFullYear()} KosVibe</Text>
      </View>

      <View style={styles.right}>
        <Pressable style={styles.icon} accessibilityLabel="Home">
          <Ionicons name="home-outline" size={20} color={theme.colors.surface} />
        </Pressable>
        <Pressable style={styles.icon} accessibilityLabel="Map">
          <Ionicons name="map-outline" size={20} color={theme.colors.surface} />
        </Pressable>
        <Pressable style={styles.icon} accessibilityLabel="Favorites">
          <Ionicons name="heart-outline" size={20} color={theme.colors.surface} />
        </Pressable>
        <Pressable style={styles.icon} accessibilityLabel="Profile">
          <Ionicons name="person-outline" size={20} color={theme.colors.surface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  copy: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
