import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useStories } from '../lib/stories-state';
import { theme } from '../theme';

type StoryDetailRoute = RouteProp<{ StoryDetail: { storyId: string } }, 'StoryDetail'>;

type StoryDetailScreenProps = {
  route: StoryDetailRoute;
};

export function StoryDetailScreen({ route }: StoryDetailScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].stories;
  const { getStoryById } = useStories();
  const story = getStoryById(route.params.storyId, language);

  if (!story) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>{copy.notFound}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ImageBackground source={{ uri: story.image }} style={styles.heroImage}>
        <LinearGradient
          colors={['rgba(7,8,16,0.08)', 'rgba(7,8,16,0.58)', 'rgba(7,8,16,0.96)']}
          style={styles.heroOverlay}>
          <View style={styles.heroSpacer} />
          <View>
            <Text style={styles.location}>{story.location}</Text>
            <Text style={styles.title}>{story.title}</Text>
            <Text style={styles.subtitle}>{story.subtitle}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.author}>{story.author}</Text>
              <Text style={styles.metaText}>{story.readTime}</Text>
              <Text style={styles.metaText}>{story.postedAt}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.storyBody}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.statText}>{story.likes} {copy.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.statText}>{story.views} {copy.views}</Text>
          </View>
        </View>

        <Text style={styles.bodyText}>{story.body}</Text>
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
    paddingBottom: PAGE_BOTTOM_PADDING,
    paddingTop: PAGE_TOP_PADDING,
  },
  heroImage: {
    height: 520,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING - 60,
    paddingBottom: 30,
  },
  heroSpacer: {
    height: 84,
  },
  location: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 12,
    color: '#E3E7F2',
    fontSize: 16,
    lineHeight: 24,
  },
  metaRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  author: {
    color: '#F9D08D',
    fontSize: 14,
    fontWeight: '800',
  },
  metaText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  storyBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statText: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '800',
  },
  bodyText: {
    color: theme.colors.mutedText,
    fontSize: 17,
    lineHeight: 28,
  },
  emptyScreen: {
    flex: 1,
    gap: theme.spacing.xl,
    padding: 20,
    paddingTop: PAGE_TOP_PADDING,
    backgroundColor: theme.colors.background,
  },
  emptyTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
});
