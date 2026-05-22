import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../features/auth/AuthProvider';
import { theme } from '../theme';

type ProfileScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

function getDisplayName(fullName: string | null | undefined, email: string | null | undefined) {
  if (fullName?.trim()) {
    return fullName.trim();
  }

  if (email?.trim()) {
    return email.split('@')[0];
  }

  return 'KosVibe Member';
}

const stats = [
  { id: 'saved', value: '28', label: 'Saved spots' },
  { id: 'stories', value: '12', label: 'Stories' },
  { id: 'events', value: '05', label: 'Events hosted' },
];

const quickActions = ['Favorite restaurants', 'Hidden gems list', 'Monument trail', 'Settings'];

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user } = useAuth();
  const fullName =
    typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null;
  const displayName = getDisplayName(fullName, user?.email);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={22} color={theme.colors.surface} />
        </Pressable>
      </View>

      <LinearGradient colors={['rgba(255,31,61,0.24)', 'rgba(255,179,0,0.08)']} style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={theme.gradients.sunset} style={styles.avatarRing}>
            <View style={styles.avatarCore}>
              <Ionicons name="person" size={34} color={theme.colors.surface} />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email ?? 'member@kosvibe.app'}</Text>
        <Text style={styles.bio}>
          Curating restaurants, monuments, and city stories with a modern Kosovo state of mind.
        </Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>Your vibe</Text>
      <View style={styles.actionList}>
        {quickActions.map((action, index) => (
          <Pressable key={action} style={styles.actionCard}>
            <View style={[styles.actionIcon, index % 2 === 0 ? styles.actionIconRed : styles.actionIconGold]}>
              <Ionicons
                name={index === 0 ? 'heart-outline' : index === 1 ? 'sparkles-outline' : index === 2 ? 'business-outline' : 'settings-outline'}
                size={18}
                color={theme.colors.surface}
              />
            </View>
            <Text style={styles.actionLabel}>{action}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.mutedText} />
          </Pressable>
        ))}
      </View>

      <View style={styles.badgeCard}>
        <Text style={styles.badgeEyebrow}>KosVibe Badge</Text>
        <Text style={styles.badgeTitle}>Gold city curator</Text>
        <Text style={styles.badgeText}>
          You are one of the most active members in your circle this month. Keep posting and exploring.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.heading,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  settingsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: 20,
    padding: 24,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarWrap: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#121522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
  },
  email: {
    marginTop: 6,
    color: '#F7D7A2',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    marginTop: 12,
    color: '#E2E6F4',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 290,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.heading,
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeading: {
    marginTop: 28,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  actionList: {
    marginTop: 14,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconRed: {
    backgroundColor: 'rgba(255,31,61,0.3)',
  },
  actionIconGold: {
    backgroundColor: 'rgba(255,179,0,0.22)',
  },
  actionLabel: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeCard: {
    marginTop: 28,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,179,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.18)',
  },
  badgeEyebrow: {
    color: '#F0C06B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  badgeTitle: {
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  badgeText: {
    marginTop: 10,
    color: '#E9E3D2',
    fontSize: 15,
    lineHeight: 22,
  },
});
