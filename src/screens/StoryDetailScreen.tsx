import { Ionicons } from '@expo/vector-icons';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useAuth } from '../features/auth/AuthProvider';
import { useStories } from '../lib/stories-state';
import { storiesRepository } from '../repositories/StoriesRepository';
import { theme } from '../theme';

type StoryDetailRoute = RouteProp<{ StoryDetail: { storyId: string } }, 'StoryDetail'>;

type StoryDetailScreenProps = {
  route: StoryDetailRoute;
};

export function StoryDetailScreen({ route }: StoryDetailScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].stories;
  const { getStoryById, onStoriesChange } = useStories();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const currentUserName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user?.email?.split('@')[0] ?? '';
  const [story, setStory] = useState(() => getStoryById(route.params.storyId, language));
  const isOwnStory = story?.isUserStory && story.author === currentUserName;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.likes ?? 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Sprint 15 — Realtime: re-read story from cache whenever it changes
  useEffect(() => {
    return onStoriesChange(() => {
      const updated = getStoryById(route.params.storyId, language);
      setStory(updated);
      if (updated) {
        setLikeCount(updated.likes);
      }
    });
  }, [onStoriesChange, getStoryById, route.params.storyId, language]);

  useEffect(() => {
    if (!story) return;
    const checkLike = async () => {
      const liked = await storiesRepository.hasUserLikedStory(story.id);
      if (liked) setIsLiked(true);
    };
    void checkLike();
  }, [story?.id]);

  const toggleLike = async () => {
    if (!story || isLikeLoading) return;
    setIsLikeLoading(true);
    try {
      if (isLiked) {
        const ok = await storiesRepository.unlikeStory(story.id);
        if (ok) {
          setIsLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        const ok = await storiesRepository.likeStory(story.id);
        if (ok) {
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = () => {
    if (!story) return;
    Alert.alert('Delete story', 'Are you sure you want to delete this story?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await storiesRepository.deleteStory(story.id);
          if (ok) navigation.goBack();
        },
      },
    ]);
  };

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
          <Pressable
            style={[styles.statItem, isLiked && styles.statItemLiked]}
            onPress={toggleLike}
            disabled={isLikeLoading}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? '#FF1F3D' : theme.colors.secondary}
            />
            <Text style={[styles.statText, isLiked && styles.statTextLiked]}>
              {likeCount} {copy.likes}
            </Text>
          </Pressable>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.statText}>{story.views} {copy.views}</Text>
          </View>
        </View>

        {isOwnStory ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color="#FF4D4D" />
            <Text style={styles.deleteButtonText}>Delete story</Text>
          </Pressable>
        ) : null}

        <Text style={styles.bodyText}>{story.body}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: PAGE_BOTTOM_PADDING },
  heroImage: { height: 520 },
  heroOverlay: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 30 },
  heroSpacer: { height: 24 },
  location: { color: theme.colors.secondary, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  title: { marginTop: 10, color: theme.colors.heading, fontSize: 40, lineHeight: 42, fontWeight: '900' },
  subtitle: { marginTop: 12, color: '#E3E7F2', fontSize: 16, lineHeight: 24 },
  metaRow: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  author: { color: '#F9D08D', fontSize: 14, fontWeight: '800' },
  metaText: { color: theme.colors.mutedText, fontSize: 13, fontWeight: '700' },
  storyBody: { paddingHorizontal: 20, paddingTop: 24, gap: 22 },
  statsRow: { flexDirection: 'row', gap: 14 },
  statItem: {
    flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statItemLiked: { backgroundColor: 'rgba(255,31,61,0.15)', borderColor: 'rgba(255,31,61,0.3)' },
  statText: { color: theme.colors.heading, fontSize: 13, fontWeight: '800' },
  statTextLiked: { color: '#FF6B81' },
  bodyText: { color: theme.colors.mutedText, fontSize: 17, lineHeight: 28 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    backgroundColor: 'rgba(255,77,77,0.1)', borderWidth: 1, borderColor: 'rgba(255,77,77,0.25)',
  },
  deleteButtonText: { color: '#FF4D4D', fontSize: 13, fontWeight: '800' },
  emptyScreen: { flex: 1, gap: theme.spacing.xl, padding: 20, paddingTop: 60, backgroundColor: theme.colors.background },
  emptyTitle: { color: theme.colors.heading, fontSize: 24, fontWeight: '900' },
});