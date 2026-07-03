import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from "../components/Screen";
import { useAuth } from "../features/auth/AuthProvider";
import { useI18n } from "../i18n/I18nProvider";
import { nativeCopy } from "../i18n/nativeCopy";
import { normalizeImageUri } from "../lib/image-uri";
import { eventsRepository } from "../repositories/eventsRepository";
import { storiesRepository } from "../repositories/StoriesRepository";
import { theme } from "../theme";

function getDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined,
  fallbackName: string,
) {
  if (fullName?.trim()) {
    return fullName.trim();
  }

  if (email?.trim()) {
    return email.split("@")[0];
  }

  return fallbackName;
}

type ActionItem = {
  key: string;
  icon: string;
  label: string;
  route: string;
};

type ProfileScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].profile;
  const { user } = useAuth();
  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const bio =
    typeof user?.user_metadata?.bio === "string"
      ? user.user_metadata.bio
      : copy.bio;
  const avatarUrl = normalizeImageUri(
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null,
  );
  const displayName = getDisplayName(fullName, user?.email, copy.fallbackName);
  const currentUserName =
    typeof user?.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : (user?.email?.split("@")[0] ?? "");
  const [userStoryCount, setUserStoryCount] = useState(0);
  const [joinedEventCount, setJoinedEventCount] = useState(0);
  const [hostedEventCount, setHostedEventCount] = useState(0);
  const stats = [
    { id: "joined", value: String(joinedEventCount), label: copy.stats.joined },
    { id: "stories", value: String(userStoryCount), label: copy.stats.stories },
    { id: "events", value: String(hostedEventCount), label: copy.stats.events },
  ];

  const loadProfileStats = useCallback(async () => {
    // Load user story count
    const allStories = storiesRepository.getStories("en");
    const userStories = allStories.filter(
      (s) => s.isUserStory && s.userId === user?.id,
    );
    setUserStoryCount(userStories.length);

    // Load joined & hosted event counts
    const joinedIds = await eventsRepository.getAttendedEventIds();
    setJoinedEventCount(joinedIds.length);

    const allEvents = eventsRepository.getTavolinaInvites();
    const hosted = allEvents.filter((e) => e.creatorId === user?.id);
    setHostedEventCount(hosted.length);
  }, [currentUserName]);

  // Sprint 15 — Realtime: subscribe to cache changes so stats update instantly
  // after join/leave on TavolinaScreen without requiring a manual refresh.
  useEffect(() => {
    // Ensure caches are fresh on mount
    void storiesRepository.refresh();
    void eventsRepository.refresh();

    eventsRepository.startPolling();
    const unsub = eventsRepository.onChange(() => {
      void loadProfileStats();
    });

    return () => {
      unsub();
      eventsRepository.stopPolling();
    };
  }, [loadProfileStats]);

  // Refetch stats whenever the Profile tab gains focus
  useFocusEffect(
    useCallback(() => {
      void loadProfileStats();
    }, [loadProfileStats]),
  );

  const openProfileEditor = () => {
    navigation.navigate("EditProfile" as never);
  };

  const actions: ActionItem[] = [
    {
      key: "favorites",
      icon: "heart-outline",
      label: copy.actions[0] ?? "Favorite restaurants",
      route: "FavoriteRestaurants",
    },
    {
      key: "my-reservations",
      icon: "calendar-outline",
      label: "My Reservations",
      route: "MyReservations",
    },
    {
      key: "monuments",
      icon: "sparkles-outline",
      label: copy.actions[1] ?? "Monument trail",
      route: "Settings",
    },
    {
      key: "settings",
      icon: "settings-outline",
      label: copy.actions[2] ?? "Settings",
      route: "Settings",
    },
  ];

  const openAction = (action: ActionItem) => {
    navigation.navigate(action.route as never);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["rgba(255,31,61,0.24)", "rgba(255,179,0,0.08)"]}
        style={styles.heroCard}
      >
        <Pressable style={styles.avatarWrap} onPress={openProfileEditor}>
          <LinearGradient
            colors={theme.gradients.sunset}
            style={styles.avatarRing}
          >
            <View style={styles.avatarCore}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={34}
                  color={theme.colors.surface}
                />
              )}
            </View>
          </LinearGradient>
        </Pressable>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        <Text style={styles.bio}>{bio}</Text>

        <Pressable style={styles.editButton} onPress={openProfileEditor}>
          <Ionicons
            name="create-outline"
            size={18}
            color={theme.colors.surface}
          />
          <Text style={styles.editButtonText}>{copy.editButton}</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>{copy.section}</Text>
      <View style={styles.actionList}>
        {actions.map((action, index) => (
          <Pressable
            key={action.key}
            style={styles.actionCard}
            onPress={() => openAction(action)}
          >
            <View
              style={[
                styles.actionIcon,
                index % 2 === 0
                  ? styles.actionIconRed
                  : styles.actionIconGold,
              ]}
            >
              <Ionicons
                name={action.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={theme.colors.surface}
              />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.mutedText}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.badgeCard}>
        <Text style={styles.badgeEyebrow}>{copy.badgeEyebrow}</Text>
        <Text style={styles.badgeTitle}>{copy.badgeTitle}</Text>
        <Text style={styles.badgeText}>{copy.badgeText}</Text>
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
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  heroCard: {
    marginTop: 25,
    padding: 24,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  avatarWrap: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#121522",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: "900",
  },
  email: {
    marginTop: 6,
    color: "#F7D7A2",
    fontSize: 14,
    fontWeight: "600",
  },
  bio: {
    marginTop: 12,
    color: "#E2E6F4",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 290,
  },
  editButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    minHeight: 48,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  editButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  statValue: {
    color: theme.colors.heading,
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 12,
    textAlign: "center",
  },
  sectionHeading: {
    marginTop: 28,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: "900",
  },
  actionList: {
    marginTop: 14,
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconRed: {
    backgroundColor: "rgba(255,31,61,0.3)",
  },
  actionIconGold: {
    backgroundColor: "rgba(255,179,0,0.22)",
  },
  actionLabel: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: "700",
  },
  badgeCard: {
    marginTop: 28,
    padding: 20,
    borderRadius: 28,
    backgroundColor: "rgba(255,179,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,179,0,0.18)",
  },
  badgeEyebrow: {
    color: "#F0C06B",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  badgeTitle: {
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: "900",
  },
  badgeText: {
    marginTop: 10,
    color: "#E9E3D2",
    fontSize: 15,
    lineHeight: 22,
  },
});