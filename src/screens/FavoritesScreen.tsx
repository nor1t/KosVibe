import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { storiesRepository } from '../repositories/StoriesRepository';
import { useStories } from '../lib/stories-state';
import type { StoryItem } from '../repositories/types';
import { theme } from '../theme';

type TabMode = 'community' | 'myStories';

type StoriesScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

function StoryMeta({ story }: { story: StoryItem }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.storyAuthor}>{story.author}</Text>
      <View style={styles.metaDot} />
      <Text style={styles.metaText}>{story.postedAt}</Text>
      <View style={styles.metaDot} />
      <Text style={styles.metaText}>{story.location}</Text>
    </View>
  );
}

export function StoriesScreen({ navigation }: StoriesScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].stories;
  const { getStories, onStoriesChange, startPolling, stopPolling } = useStories();
  const { user } = useAuth();
  const currentUserName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user?.email?.split('@')[0] ?? '';

  const [stories, setStories] = useState<StoryItem[]>(() => getStories(language));
  const [tab, setTab] = useState<TabMode>('community');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  // Sprint 15 — Background polling: auto-refresh stories every 3s
  useEffect(() => {
    startPolling();
    const unsub = onStoriesChange(() => {
      setStories(getStories(language));
    });
    return () => {
      unsub();
      stopPolling();
    };
  }, [onStoriesChange, getStories, language, startPolling, stopPolling]);

  useFocusEffect(
    useCallback(() => {
      setStories(getStories(language));
    }, [getStories, language])
  );

  // ── Derived data ──────────────────────────────────────────────────────────

  const myStories = useMemo(
    () => stories.filter((s) => s.isUserStory && s.userId === user?.id),
    [stories, user?.id]
  );

  // Community statistics
  const storiesPublished = stories.length;
  const activeCreators = new Set(stories.map((s) => s.author)).size;
  const now = new Date();
  const storiesToday = stories.filter((s) => {
    if (!s.createdAtISO) return false;
    const created = new Date(s.createdAtISO);
    return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  // Extract unique categories and locations for filter chips
  const allCategories = useMemo(() => {
    const cats = new Set(stories.map((s) => s.category).filter(Boolean));
    return Array.from(cats);
  }, [stories]);

  const allLocations = useMemo(() => {
    const locs = new Set(stories.map((s) => s.location).filter(Boolean));
    return Array.from(locs);
  }, [stories]);

  // Trending: top 5 stories by likes (excluding the featured hero)
  const trending = useMemo(() => {
    return stories.slice(1).sort((a, b) => b.likes - a.likes).slice(0, 5);
  }, [stories]);

  // Filtered latest stories
  const filteredLatest = useMemo(() => {
    let list = stories.slice(1);
    if (categoryFilter) {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (locationFilter) {
      list = list.filter((s) => s.location === locationFilter);
    }
    return list;
  }, [stories, categoryFilter, locationFilter]);

  // My Stories personal statistics
  const myLikesReceived = myStories.reduce((sum, s) => sum + s.likes, 0);
  const myViewsTotal = myStories.reduce((sum, s) => sum + s.views, 0);
  const myCommentsReceived = 0; // Placeholder until comments count is queryable

  const openStory = (storyId: string) => {
    navigation.navigate('StoryDetail', { storyId });
  };

  const handleDeleteStory = async (storyId: string) => {
    const ok = await storiesRepository.deleteStory(storyId);
    if (ok) {
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    }
  };

  // ── Empty state (global — no stories at all) ──────────────────────────────
  if (stories.length === 0) {
    const isEmptyTitle = language === 'sq' ? 'Ende pa tregime' : 'No stories yet';
    const isEmptyDescription =
      language === 'sq'
        ? 'Behu i pari qe ndan nje tregim per Kosoven. Prek butonin me poshte per te filluar.'
        : 'Be the first to share a story about Kosovo. Tap the button below to get started.';
    const isEmptyCta = language === 'sq' ? 'Krijo tregimin tend' : 'Create your story';

    return (
      <View style={styles.screen}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="book-outline" size={44} color={theme.colors.mutedText} />
          </View>
          <Text style={styles.emptyHeading}>{isEmptyTitle}</Text>
          <Text style={styles.emptyDescription}>{isEmptyDescription}</Text>
          <Pressable
            style={styles.emptyAction}
            onPress={() => navigation.navigate('CreateStory')}>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.surface} />
            <Text style={styles.emptyActionText}>{isEmptyCta}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Tab labels ────────────────────────────────────────────────────────────
  const communityLabel = language === 'sq' ? 'Komuniteti' : 'Community';
  const myStoriesLabel = language === 'sq' ? 'Storjet e mia' : 'My Stories';

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        {/* ── Segmented Control + Search ────────────────────────────────── */}
        <View style={styles.tabRow}>
          <View style={styles.segmentedControl}>
            <Pressable
              style={[styles.segment, tab === 'community' && styles.segmentActive]}
              onPress={() => setTab('community')}>
              <Text style={[styles.segmentLabel, tab === 'community' && styles.segmentLabelActive]}>
                {communityLabel}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segment, tab === 'myStories' && styles.segmentActive]}
              onPress={() => setTab('myStories')}>
              <Text style={[styles.segmentLabel, tab === 'myStories' && styles.segmentLabelActive]}>
                {myStoriesLabel}
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.searchIconButton}
            onPress={() => navigation.navigate('StorySearch')}>
            <Ionicons name="search-outline" size={22} color={theme.colors.mutedText} />
          </Pressable>
        </View>

        {/* ── Community Tab ──────────────────────────────────────────────── */}
        {tab === 'community' ? (
          <>
            {stories.length > 0 ? (
              <Pressable style={styles.heroCard} onPress={() => openStory(stories[0].id)}>
                <ImageBackground source={{ uri: stories[0].image }} style={styles.heroImage}>
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <View style={styles.featuredBadge}>
                      <Ionicons name="sparkles-outline" size={14} color={theme.colors.surface} />
                      <Text style={styles.featuredLabel}>{copy.featured}</Text>
                    </View>
                    <Text style={styles.heroTitle}>{stories[0].title}</Text>
                    <StoryMeta story={stories[0]} />
                    <Text style={styles.heroSubtitle}>{stories[0].subtitle}</Text>
                    <View style={styles.openRow}>
                      <Text style={styles.openLabel}>{copy.openStory}</Text>
                      <Ionicons name="arrow-forward" size={18} color={theme.colors.surface} />
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            ) : null}

            <View style={styles.statsStrip}>
              <View style={styles.communityStat}>
                <Text style={styles.statValue}>{storiesPublished}</Text>
                <Text style={styles.statLabel}>{copy.storiesPublished}</Text>
              </View>
              <View style={styles.communityStat}>
                <Text style={styles.statValue}>{activeCreators}</Text>
                <Text style={styles.statLabel}>{copy.activeCreators}</Text>
              </View>
              <View style={styles.communityStat}>
                <Text style={styles.statValue}>{storiesToday}</Text>
                <Text style={styles.statLabel}>{copy.storiesToday}</Text>
              </View>
            </View>

            {/* ── Category Filter Chips ────────────────────────────────── */}
            {allCategories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipRow}>
                <Pressable
                  style={[styles.filterChip, !categoryFilter && styles.filterChipActive]}
                  onPress={() => setCategoryFilter(null)}>
                  <Text style={[styles.filterChipText, !categoryFilter && styles.filterChipTextActive]}>
                    {language === 'sq' ? 'Te gjitha' : 'All'}
                  </Text>
                </Pressable>
                {allCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                    onPress={() => setCategoryFilter(categoryFilter === cat ? null : cat)}>
                    <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {/* ── Location Filter Chips ────────────────────────────────── */}
            {allLocations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipRow}>
                {allLocations.map((loc) => (
                  <Pressable
                    key={loc}
                    style={[styles.filterChip, styles.locationChip, locationFilter === loc && styles.locationChipActive]}
                    onPress={() => setLocationFilter(locationFilter === loc ? null : loc)}>
                    <Ionicons name="location-outline" size={13} color={locationFilter === loc ? theme.colors.surface : theme.colors.secondary} />
                    <Text style={[styles.filterChipText, locationFilter === loc && styles.filterChipTextActive]}>
                      {loc}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {/* ── Trending ─────────────────────────────────────────────── */}
            {trending.length > 0 && !categoryFilter && !locationFilter ? (
              <View style={styles.trendingSection}>
                <Text style={styles.trendingTitle}>
                  {language === 'sq' ? 'Ne trend' : 'Trending'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingRow}>
                  {trending.map((story) => (
                    <Pressable
                      key={story.id}
                      style={styles.trendingCard}
                      onPress={() => openStory(story.id)}>
                      <ImageBackground source={{ uri: story.image }} style={styles.trendingImage}>
                        <View style={styles.trendingOverlay} />
                        <View style={styles.trendingBadge}>
                          <Ionicons name="flame-outline" size={12} color={theme.colors.surface} />
                          <Text style={styles.trendingBadgeText}>
                            {language === 'sq' ? 'Ne trend' : 'Trending'}
                          </Text>
                        </View>
                      </ImageBackground>
                      <View style={styles.trendingBody}>
                        <Text style={styles.trendingCardTitle} numberOfLines={2}>
                          {story.title}
                        </Text>
                        <Text style={styles.trendingCardMeta}>
                          {story.likes} {copy.likes} · {story.location}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Active filter indicator */}
            {(categoryFilter || locationFilter) ? (
              <View style={styles.activeFilterBar}>
                <Ionicons name="funnel-outline" size={16} color={theme.colors.secondary} />
                <Text style={styles.activeFilterText}>
                  {language === 'sq' ? 'Filtruar: ' : 'Filtered: '}
                  {categoryFilter ? categoryFilter : ''}
                  {categoryFilter && locationFilter ? ' · ' : ''}
                  {locationFilter ? locationFilter : ''}
                </Text>
                <Pressable
                  style={styles.clearFilterButton}
                  onPress={() => { setCategoryFilter(null); setLocationFilter(null); }}>
                  <Text style={styles.clearFilterButtonText}>
                    {language === 'sq' ? 'Pastro' : 'Clear'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>
                {categoryFilter || locationFilter
                  ? (language === 'sq' ? 'Rezultatet' : 'Results')
                  : copy.latest}
              </Text>
            </View>

            {filteredLatest.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  {language === 'sq'
                    ? 'Nuk ka storje qe perputhen me filtrat e zgjedhur.'
                    : 'No stories match the selected filters.'}
                </Text>
              </View>
            ) : (
              <View style={styles.storyList}>
                {filteredLatest.map((story) => (
                <Pressable key={story.id} style={styles.storyCard} onPress={() => openStory(story.id)}>
                  <ImageBackground source={{ uri: story.image }} style={styles.storyThumb}>
                    <View style={styles.thumbOverlay} />
                    <Text style={styles.thumbCategory}>{story.category}</Text>
                  </ImageBackground>
                  <View style={styles.storyCopy}>
                    <View style={styles.storyTitleRow}>
                      <Text style={styles.storyTitle}>{story.title}</Text>
                      {story.isUserStory && story.userId === user?.id ? (
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
            )}
          </>
        ) : (
          /* ── My Stories Tab ──────────────────────────────────────────── */
          <>
            {/* Personal stats header */}
            <View style={styles.myStatsStrip}>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>{myStories.length}</Text>
                <Text style={styles.myStatLabel}>
                  {language === 'sq' ? 'Storje' : 'Stories'}
                </Text>
              </View>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>{myLikesReceived}</Text>
                <Text style={styles.myStatLabel}>
                  {language === 'sq' ? 'Pelqime' : 'Likes'}
                </Text>
              </View>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>{myViewsTotal}</Text>
                <Text style={styles.myStatLabel}>
                  {language === 'sq' ? 'Shikime' : 'Views'}
                </Text>
              </View>
              <View style={styles.myStat}>
                <Text style={styles.myStatValue}>{myCommentsReceived}</Text>
                <Text style={styles.myStatLabel}>
                  {language === 'sq' ? 'Komente' : 'Comments'}
                </Text>
              </View>
            </View>

            {myStories.length === 0 ? (
              <View style={styles.myStoriesEmpty}>
                <Ionicons name="create-outline" size={40} color={theme.colors.mutedText} />
                <Text style={styles.myStoriesEmptyTitle}>
                  {language === 'sq'
                    ? 'Nuk ke postuar ende asnje storje'
                    : 'You haven\'t posted any stories yet'}
                </Text>
                <Text style={styles.myStoriesEmptyText}>
                  {language === 'sq'
                    ? 'Storja jote e pare pret. Prek butonin me poshte per te filluar.'
                    : 'Your first story is waiting. Tap the button below to get started.'}
                </Text>
                <Pressable
                  style={styles.createFirstButton}
                  onPress={() => navigation.navigate('CreateStory')}>
                  <Ionicons name="add-circle-outline" size={18} color={theme.colors.surface} />
                  <Text style={styles.createFirstButtonText}>
                    {language === 'sq' ? 'Krijo storjen e pare' : 'Create your first story'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.storyList}>
                {myStories.map((story) => (
                  <Pressable key={story.id} style={styles.storyCard} onPress={() => openStory(story.id)}>
                    <ImageBackground source={{ uri: story.image }} style={styles.storyThumb}>
                      <View style={styles.thumbOverlay} />
                      <Text style={styles.thumbCategory}>{story.category}</Text>
                    </ImageBackground>
                    <View style={styles.storyCopy}>
                      <View style={styles.storyTitleRow}>
                        <Text style={styles.storyTitle}>{story.title}</Text>
                      </View>
                      <StoryMeta story={story} />
                      <Text style={styles.storySubtitle}>{story.subtitle}</Text>
                      <View style={styles.storyStatsRow}>
                        <Text style={styles.storyStat}>{story.likes} {copy.likes}</Text>
                        <Text style={styles.storyStat}>{story.views} {copy.views}</Text>
                      </View>
                      <View style={styles.myStoryActions}>
                        <Pressable
                          style={styles.deleteStoryButton}
                          onPress={() => handleDeleteStory(story.id)}>
                          <Ionicons name="trash-outline" size={14} color="#FF4D4D" />
                          <Text style={styles.deleteStoryButtonText}>
                            {language === 'sq' ? 'Fshij' : 'Delete'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
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
    paddingTop: PAGE_TOP_PADDING + 20,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  header: {
    marginBottom: 20,
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
  // ── Tab Row (Segmented Control + Search) ───────────────────────────────
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  segmentedControl: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  searchIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segment: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segmentActive: {
    backgroundColor: 'rgba(255,31,61,0.18)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  segmentLabel: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: '800',
  },
  segmentLabelActive: {
    color: theme.colors.heading,
  },
  // ── FAB ─────────────────────────────────────────────────────────────────
  createFab: {
    position: 'absolute',
    right: 20,
    bottom: Math.max(PAGE_BOTTOM_PADDING + 4, 100),
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
  },
  // ── Hero Card ───────────────────────────────────────────────────────────
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
  // ── Meta ────────────────────────────────────────────────────────────────
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
  // ── Community Stats ─────────────────────────────────────────────────────
  statsStrip: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  communityStat: {
    flex: 1,
    minHeight: 76,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  // ── My Stories Stats ────────────────────────────────────────────────────
  myStatsStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  myStat: {
    flex: 1,
    minHeight: 82,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(255,31,61,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,31,61,0.16)',
    alignItems: 'center',
  },
  myStatValue: {
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
  },
  myStatLabel: {
    marginTop: 3,
    color: theme.colors.mutedText,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // ── My Stories Empty ────────────────────────────────────────────────────
  myStoriesEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 14,
  },
  myStoriesEmptyTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  myStoriesEmptyText: {
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 260,
  },
  createFirstButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  createFirstButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  // ── Story Cards ─────────────────────────────────────────────────────────
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
  // ── My Story Actions ────────────────────────────────────────────────────
  myStoryActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  deleteStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,77,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.2)',
  },
  deleteStoryButtonText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: '800',
  },
  // ── Empty State (global) ────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
    gap: 16,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyHeading: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyDescription: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyAction: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  emptyActionText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  // ── Filter Chips ─────────────────────────────────────────────────────────
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,31,61,0.18)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  filterChipText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: theme.colors.heading,
  },
  locationChip: {
    backgroundColor: 'rgba(255,179,0,0.06)',
    borderColor: 'rgba(255,179,0,0.14)',
  },
  locationChipActive: {
    backgroundColor: 'rgba(255,179,0,0.18)',
    borderColor: 'rgba(255,179,0,0.34)',
  },
  // ── Active Filter Bar ──────────────────────────────────────────────────
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,179,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.16)',
  },
  activeFilterText: {
    flex: 1,
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  clearFilterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  clearFilterButtonText: {
    color: theme.colors.heading,
    fontSize: 12,
    fontWeight: '800',
  },
  // ── No Results ──────────────────────────────────────────────────────────
  noResults: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // ── Trending Section ────────────────────────────────────────────────────
  trendingSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  trendingTitle: {
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  trendingRow: {
    gap: 12,
    paddingRight: 8,
  },
  trendingCard: {
    width: 172,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  trendingImage: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
  },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,8,16,0.3)',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginLeft: 10,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,107,0,0.8)',
  },
  trendingBadgeText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  trendingBody: {
    padding: 12,
    gap: 4,
  },
  trendingCardTitle: {
    color: theme.colors.heading,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  trendingCardMeta: {
    color: theme.colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
  },
});
