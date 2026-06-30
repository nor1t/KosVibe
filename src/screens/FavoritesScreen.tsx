import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useStories, type StoryItem } from '../lib/stories-state';
import { theme } from '../theme';

type FavoritesScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

function StoryMeta({ story }: { story: StoryItem }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.storyAuthor}>{story.author}</Text>
      <View style={styles.metaDot} />
      <Text style={styles.metaText}>{story.readTime}</Text>
      <View style={styles.metaDot} />
      <Text style={styles.metaText}>{story.location}</Text>
    </View>
  );
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].stories;
  const { getStories } = useStories();
  const stories = getStories(language);
  const featuredStory = stories[0];
  const latestStories = stories.slice(1);

  const openStory = (storyId: string) => {
    navigation.navigate('StoryDetail', { storyId });
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <Pressable style={styles.heroCard} onPress={() => openStory(featuredStory.id)}>
          <ImageBackground source={{ uri: featuredStory.image }} style={styles.heroImage}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.featuredBadge}>
                <Ionicons name="sparkles-outline" size={14} color={theme.colors.surface} />
                <Text style={styles.featuredLabel}>{copy.featured}</Text>
              </View>
              <Text style={styles.heroTitle}>{featuredStory.title}</Text>
              <StoryMeta story={featuredStory} />
              <Text style={styles.heroSubtitle}>{featuredStory.subtitle}</Text>
              <View style={styles.openRow}>
                <Text style={styles.openLabel}>{copy.openStory}</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.surface} />
              </View>
            </View>
          </ImageBackground>
        </Pressable>

        <View style={styles.statsStrip}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{stories.length}</Text>
            <Text style={styles.statLabel}>{copy.latest}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>
              {Math.round(stories.reduce((total, story) => total + story.views, 0) / 100) / 10}k
            </Text>
            <Text style={styles.statLabel}>{copy.views}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>
              {stories.reduce((total, story) => total + story.likes, 0)}
            </Text>
            <Text style={styles.statLabel}>{copy.likes}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>{copy.latest}</Text>
        </View>

        <View style={styles.storyList}>
          {latestStories.map((story) => (
            <Pressable key={story.id} style={styles.storyCard} onPress={() => openStory(story.id)}>
              <ImageBackground source={{ uri: story.image }} style={styles.storyThumb}>
                <View style={styles.thumbOverlay} />
                <Text style={styles.thumbCategory}>{story.category}</Text>
              </ImageBackground>
              <View style={styles.storyCopy}>
                <View style={styles.storyTitleRow}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  {story.isUserStory ? (
                    <View style={styles.userBadge}>
                      <Text style={styles.userBadgeText}>{copy.yourStory}</Text>
                    </View>
                  ) : null}
                </View>
                <StoryMeta story={story} />
                <Text style={styles.storySubtitle}>{story.subtitle}</Text>
                <View style={styles.storyStatsRow}>
                  <Text style={styles.storyStat}>{story.likes} {copy.likes}</Text>
                  <Text style={styles.storyStat}>{story.views} {copy.views}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel={copy.ctaButton}
        style={styles.createFab}
        onPress={() => navigation.navigate('CreateStory')}>
        <Ionicons name="add" size={28} color={theme.colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 88,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: theme.colors.heading,
    fontSize: 42,
    lineHeight: 42,
    fontWeight: '900',
    width: '100%',
  },
  subtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 340,
  },
  createFab: {
    position: 'absolute',
    right: 20,
    bottom: 104,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
  },
  heroCard: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  heroImage: {
    height: 380,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,7,13,0.44)',
  },
  heroContent: {
    padding: 22,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,31,61,0.78)',
    marginBottom: 14,
  },
  featuredLabel: {
    color: theme.colors.surface,
    fontWeight: '800',
    fontSize: 12,
  },
  heroTitle: {
    color: theme.colors.heading,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroSubtitle: {
    marginTop: 10,
    color: '#E3E7F2',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 310,
  },
  openRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openLabel: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
  },
  storyAuthor: {
    color: '#F9D08D',
    fontSize: 13,
    fontWeight: '800',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  metaText: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  statsStrip: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  statBlock: {
    flex: 1,
    minHeight: 76,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: theme.colors.heading,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 2,
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  sectionHeading: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  storyList: {
    gap: 14,
  },
  storyCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  storyThumb: {
    width: 104,
    minHeight: 138,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 10,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,8,16,0.28)',
  },
  thumbCategory: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '900',
  },
  storyCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  storyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyTitle: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  userBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,31,61,0.18)',
  },
  userBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  storySubtitle: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
  storyStatsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  storyStat: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '700',
  },
});
