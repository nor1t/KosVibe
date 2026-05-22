import { Feather, Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { tavolinaInvites } from '../data/mockData';
import { theme } from '../theme';

type TavolinaScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const moods = ['Tonight', 'Culture', 'Food Crew'];

const creatorOptions = [
  {
    id: 'host-dinner',
    icon: 'restaurant-outline' as const,
    title: 'Host a dinner',
    subtitle: 'Invite your people to a high-energy local food night.',
    colors: ['#FF1F3D', '#C8102E'] as const,
  },
  {
    id: 'drop-event',
    icon: 'sparkles-outline' as const,
    title: 'Drop an event',
    subtitle: 'Create a vibe around music, culture, or a spontaneous meetup.',
    colors: ['#FFB300', '#FF8C00'] as const,
  },
];

export function TavolinaScreen({ navigation }: TavolinaScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KosVibe Events</Text>
        <Text style={styles.title}>Create the next big vibe.</Text>
        <Text style={styles.subtitle}>
          Start a cultural night, dinner plan, or city meetup and let the community join in.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
        {creatorOptions.map((option) => (
          <LinearGradient key={option.id} colors={option.colors} style={styles.optionCard}>
            <Ionicons name={option.icon} size={26} color={theme.colors.surface} />
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        {moods.map((mood, index) => (
          <Pressable key={mood} style={[styles.moodChip, index === 0 && styles.moodChipActive]}>
            <Text style={[styles.moodLabel, index === 0 && styles.moodLabelActive]}>{mood}</Text>
          </Pressable>
        ))}
      </View>

      <LinearGradient colors={['rgba(255,31,61,0.22)', 'rgba(255,179,0,0.08)']} style={styles.launchCard}>
        <Text style={styles.launchTitle}>Start a new event</Text>
        <Text style={styles.launchText}>
          Pick a restaurant, set the mood, and share it as a live community drop in seconds.
        </Text>
        <Pressable style={styles.launchButton}>
          <Feather name="plus" size={18} color={theme.colors.surface} />
          <Text style={styles.launchButtonText}>Create Event</Text>
        </Pressable>
      </LinearGradient>

      <Text style={styles.sectionHeading}>Community Drops</Text>
      <View style={styles.inviteList}>
        {tavolinaInvites.map((invite, index) => (
          <Pressable
            key={invite.id}
            style={styles.inviteCard}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: invite.restaurantId })}>
            <View style={styles.inviteRow}>
              <View style={[styles.inviteBadge, index % 2 === 0 ? styles.inviteRed : styles.inviteGold]}>
                <Ionicons
                  name={index % 2 === 0 ? 'flame-outline' : 'sparkles-outline'}
                  size={18}
                  color={theme.colors.surface}
                />
              </View>

              <View style={styles.inviteCopy}>
                <Text style={styles.inviteTitle}>{invite.restaurantName}</Text>
                <Text style={styles.inviteMeta}>
                  {invite.day} • {invite.time} • {invite.city}
                </Text>
              </View>
            </View>

            <Text style={styles.inviteDescription}>{invite.description}</Text>

            <View style={styles.tagRow}>
              {invite.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagLabel}>{tag}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
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
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 44,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.8,
    maxWidth: 280,
  },
  subtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  optionRow: {
    gap: 14,
    paddingRight: 20,
  },
  optionCard: {
    width: 250,
    borderRadius: 28,
    padding: 20,
  },
  optionTitle: {
    marginTop: 26,
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: '900',
  },
  optionSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 21,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  moodChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  moodChipActive: {
    backgroundColor: 'rgba(255,31,61,0.18)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  moodLabel: {
    color: theme.colors.mutedText,
    fontWeight: '700',
  },
  moodLabelActive: {
    color: theme.colors.heading,
  },
  launchCard: {
    marginTop: 22,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  launchTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  launchText: {
    marginTop: 8,
    color: '#E4D9DA',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 310,
  },
  launchButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,31,61,0.9)',
  },
  launchButtonText: {
    color: theme.colors.surface,
    fontWeight: '800',
  },
  sectionHeading: {
    marginTop: 28,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  inviteList: {
    marginTop: 16,
    gap: 14,
  },
  inviteCard: {
    padding: 18,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteRed: {
    backgroundColor: 'rgba(255,31,61,0.28)',
  },
  inviteGold: {
    backgroundColor: 'rgba(255,179,0,0.22)',
  },
  inviteCopy: {
    flex: 1,
  },
  inviteTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  inviteMeta: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 13,
  },
  inviteDescription: {
    marginTop: 14,
    color: '#DDE1EF',
    fontSize: 15,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tagLabel: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
