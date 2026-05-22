import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

type FavoritesScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const stories = [
  {
    id: 'story-1',
    title: 'Midnight in Prizren',
    author: '@streetvibes.xk',
    subtitle: 'A cinematic walk through river lights, food spots, and late-night chatter.',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'story-2',
    title: 'Kosovo Coffee Trails',
    author: '@beansandbridges',
    subtitle: 'Warm cafes, gold-hour corners, and local stories behind every cup.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'story-3',
    title: 'Icons After Rain',
    author: '@culturepulse',
    subtitle: 'How monuments, mist, and city sounds collide into one proud moodboard.',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  },
];

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Community Stories</Text>
        <Text style={styles.title}>What Kosovo feels like right now.</Text>
        <Text style={styles.subtitle}>
          Swipe through creator-led travel notes, restaurant drops, and local stories from the community.
        </Text>
      </View>

      <Pressable style={styles.heroCard}>
        <ImageBackground source={{ uri: stories[0].image }} style={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.liveBadge}>
              <Ionicons name="sparkles-outline" size={14} color={theme.colors.surface} />
              <Text style={styles.liveLabel}>Trending Story</Text>
            </View>
            <Text style={styles.heroTitle}>{stories[0].title}</Text>
            <Text style={styles.heroAuthor}>{stories[0].author}</Text>
            <Text style={styles.heroSubtitle}>{stories[0].subtitle}</Text>
          </View>
        </ImageBackground>
      </Pressable>

      <Text style={styles.sectionHeading}>Latest Drops</Text>
      <View style={styles.storyList}>
        {stories.slice(1).map((story, index) => (
          <Pressable key={story.id} style={styles.storyCard}>
            <ImageBackground source={{ uri: story.image }} style={styles.storyThumb} />
            <View style={styles.storyCopy}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyAuthor}>{story.author}</Text>
              <Text style={styles.storySubtitle}>{story.subtitle}</Text>
            </View>
            <View style={[styles.storyDot, index === 0 ? styles.storyDotGold : styles.storyDotRed]} />
          </Pressable>
        ))}
      </View>

      <View style={styles.ctaPanel}>
        <Text style={styles.ctaTitle}>Share your own vibe</Text>
        <Text style={styles.ctaText}>
          Post a story from your favorite restaurant, event, or hidden Kosovo corner and inspire the next route.
        </Text>
        <Pressable style={styles.ctaButton} onPress={() => navigation.getParent()?.navigate('TavolinaTab')}>
          <Text style={styles.ctaButtonText}>Create a Story</Text>
        </Pressable>
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
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    maxWidth: 300,
  },
  subtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 330,
  },
  heroCard: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  heroImage: {
    height: 360,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,7,13,0.42)',
  },
  heroContent: {
    padding: 22,
  },
  liveBadge: {
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
  liveLabel: {
    color: theme.colors.surface,
    fontWeight: '800',
    fontSize: 12,
  },
  heroTitle: {
    color: theme.colors.heading,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroAuthor: {
    marginTop: 8,
    color: '#F9D08D',
    fontSize: 14,
    fontWeight: '700',
  },
  heroSubtitle: {
    marginTop: 10,
    color: '#E3E7F2',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 290,
  },
  sectionHeading: {
    marginTop: 28,
    marginBottom: 14,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  storyList: {
    gap: 14,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  storyThumb: {
    width: 96,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
  },
  storyCopy: {
    flex: 1,
  },
  storyTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  storyAuthor: {
    marginTop: 6,
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  storySubtitle: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
  storyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  storyDotGold: {
    backgroundColor: theme.colors.secondary,
  },
  storyDotRed: {
    backgroundColor: theme.colors.primary,
  },
  ctaPanel: {
    marginTop: 28,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ctaTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  ctaText: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  ctaButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,179,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.3)',
  },
  ctaButtonText: {
    color: '#FFD787',
    fontWeight: '800',
  },
});
