import { Feather, Ionicons } from '@expo/vector-icons';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

import type { TavolinaInvite } from '../../data/mockData';
import { theme } from '../../theme';
import { Pill } from '../common/Pill';
import { PrimaryButton } from '../common/PrimaryButton';

type TavolinaInviteCardProps = {
  invite: TavolinaInvite;
  onViewRestaurant?: () => void;
  onJoin?: () => void;
};

export function TavolinaInviteCard({
  invite,
  onViewRestaurant,
  onJoin,
}: TavolinaInviteCardProps) {
  return (
    <View style={styles.card}>
      <ImageBackground source={{ uri: invite.image }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroCopy}>
          <Text style={styles.restaurantName}>{invite.restaurantName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.locationText}>{invite.city}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.danger} />
            <Text style={styles.metaText}>{invite.day}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={24} color={theme.colors.danger} />
            <Text style={styles.metaText}>{invite.time}</Text>
          </View>
        </View>

        <View style={styles.creatorRow}>
          <Image source={{ uri: invite.creatorAvatar }} style={styles.avatar} />
          <Text style={styles.creatorText}>
            Created by <Text style={styles.creatorName}>{invite.creator}</Text>
          </Text>
        </View>

        <Text style={styles.description}>{invite.description}</Text>

        <View style={styles.tagsRow}>
          <Pill
            label={invite.tags[0]}
            icon={<Ionicons name="flame-outline" size={18} color={theme.colors.danger} />}
            tone="soft"
          />
          <Pill
            label={invite.tags[1]}
            icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.danger} />}
            tone="soft"
          />
          <Pill
            label={invite.spotsLabel}
            icon={<Feather name="users" size={16} color={theme.colors.danger} />}
            tone="warning"
          />
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonHalf}>
            <PrimaryButton label="View Profile" variant="outline" onPress={onViewRestaurant} />
          </View>
          <View style={styles.buttonHalf}>
            <PrimaryButton label="Join" onPress={onJoin} />
          </View>
        </View>
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
  },
  hero: {
    height: 210,
    justifyContent: 'flex-end',
    padding: theme.spacing.xl,
  },
  heroImage: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.32)',
  },
  heroCopy: {
    gap: theme.spacing.sm,
  },
  restaurantName: {
    color: theme.colors.surface,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  locationText: {
    color: theme.colors.surface,
    fontSize: 16,
  },
  body: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxxl,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  metaText: {
    fontSize: 16,
    color: theme.colors.heading,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.round,
  },
  creatorText: {
    fontSize: 16,
    color: theme.colors.heading,
  },
  creatorName: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.heading,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  buttonHalf: {
    flex: 1,
  },
});
