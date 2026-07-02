import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { useStories } from '../lib/stories-state';
import type { StoryItem } from '../repositories/types';
import { theme } from '../theme';

const RECENT_SEARCHES_KEY = 'kosvibe_recent_story_searches';
const MAX_RECENT_SEARCHES = 10;

// Simple in-memory store for recent searches (survives navigation within session)
const recentSearches: string[] = [];

function addRecentSearch(query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return;
  const idx = recentSearches.indexOf(trimmed);
  if (idx !== -1) recentSearches.splice(idx, 1);
  recentSearches.unshift(trimmed);
  if (recentSearches.length > MAX_RECENT_SEARCHES) recentSearches.pop();
}

type StorySearchScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export function StorySearchScreen({ navigation }: StorySearchScreenProps) {
  const { language } = useI18n();
  const { getStories } = useStories();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [stories, setStories] = useState<StoryItem[]>(() => getStories(language));

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Refresh stories from cache
  useEffect(() => {
    setStories(getStories(language));
  }, [getStories, language]);

  // Client-side search
  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const term = debouncedQuery;
    return stories.filter((s) => {
      return (
        s.title.toLowerCase().includes(term) ||
        s.location.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.subtitle.toLowerCase().includes(term) ||
        s.body.toLowerCase().includes(term) ||
        s.author.toLowerCase().includes(term)
      );
    });
  }, [stories, debouncedQuery]);

  const hasQuery = debouncedQuery.length > 0;

  const popularSearches = [
    'Prishtina', 'Prizren', 'Peja', 'Rugova',
    'Food', 'Coffee', 'Culture', 'Nature', 'Hiking', 'Road Trip',
  ];

  const browseCategories = [
    'Food', 'Coffee', 'Culture', 'Night Walk', 'Nature', 'Other',
  ];

  const handleSelectQuery = useCallback((term: string) => {
    setQuery(term);
    addRecentSearch(term);
  }, []);

  const handleSubmitSearch = useCallback(() => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setDebouncedQuery(query.trim().toLowerCase());
    }
  }, [query]);

  const openStory = useCallback((storyId: string) => {
    navigation.navigate('StoryDetail', { storyId });
  }, [navigation]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const handleClearRecent = useCallback((term: string) => {
    const idx = recentSearches.indexOf(term);
    if (idx !== -1) recentSearches.splice(idx, 1);
    // Force re-render
    setStories([...stories]);
  }, [stories]);

  return (
    <View style={styles.screen}>
      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={theme.colors.mutedText} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmitSearch}
            placeholder={
              language === 'sq'
                ? 'Kerko storje...'
                : 'Search stories...'
            }
            placeholderTextColor={theme.colors.subtle}
            autoFocus
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={theme.colors.mutedText} />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>
            {language === 'sq' ? 'Anulo' : 'Cancel'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Results ────────────────────────────────────────────────────── */}
        {hasQuery ? (
          <>
            {results.length > 0 ? (
              <>
                <Text style={styles.resultsCount}>
                  {results.length} {language === 'sq' ? 'storje te gjetura' : 'stories found'}
                </Text>
                <View style={styles.storyList}>
                  {results.map((story) => (
                    <Pressable
                      key={story.id}
                      style={styles.storyCard}
                      onPress={() => openStory(story.id)}>
                      <ImageBackground source={{ uri: story.image }} style={styles.storyThumb}>
                        <View style={styles.thumbOverlay} />
                        <Text style={styles.thumbCategory}>{story.category}</Text>
                      </ImageBackground>
                      <View style={styles.storyCopy}>
                        <View style={styles.storyTitleRow}>
                          <Text style={styles.storyTitle} numberOfLines={1}>
                            {highlightMatch(story.title, debouncedQuery)}
                          </Text>
                        </View>
                        <Text style={styles.storyLocation}>{story.location}</Text>
                        <Text style={styles.storySnippet} numberOfLines={2}>
                          {story.subtitle}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={48} color={theme.colors.mutedText} />
                <Text style={styles.emptyTitle}>
                  {language === 'sq'
                    ? `Nuk u gjet asnje storje per "${debouncedQuery}"`
                    : `No stories found for "${debouncedQuery}"`}
                </Text>
                <Text style={styles.emptyHint}>
                  {language === 'sq'
                    ? 'Provo nje fjale tjeter ose shfleto kategorite me poshte.'
                    : 'Try a different search term or browse categories below.'}
                </Text>
              </View>
            )}
          </>
        ) : (
          /* ── Initial / Empty State ────────────────────────────────────── */
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {language === 'sq' ? 'Kerkime te fundit' : 'Recent Searches'}
                </Text>
                <View style={styles.chipRow}>
                  {recentSearches.map((term) => (
                    <View key={term} style={styles.chipWrapper}>
                      <Pressable
                        style={styles.chip}
                        onPress={() => handleSelectQuery(term)}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.secondary} />
                        <Text style={styles.chipText}>{term}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.chipRemove}
                        onPress={() => handleClearRecent(term)}>
                        <Ionicons name="close" size={12} color={theme.colors.mutedText} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === 'sq' ? 'Te kerkuara shpesh' : 'Popular Searches'}
              </Text>
              <View style={styles.chipRow}>
                {popularSearches.map((term) => (
                  <Pressable
                    key={term}
                    style={styles.chip}
                    onPress={() => handleSelectQuery(term)}>
                    <Text style={styles.chipText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Browse by Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === 'sq' ? 'Shfleto sipas kategorise' : 'Browse by Category'}
              </Text>
              <View style={styles.chipRow}>
                {browseCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.chip, styles.categoryChip]}
                    onPress={() => handleSelectQuery(cat)}>
                    <Text style={[styles.chipText, styles.categoryChipText]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Wraps matching text in bold-ish spans. Simple client-side highlight. */
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <Text>
      {text.slice(0, idx)}
      <Text style={{ color: theme.colors.secondary, fontWeight: '900' }}>
        {text.slice(idx, idx + query.length)}
      </Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  // ── Search Bar ─────────────────────────────────────────────────────────
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING + 8,
    paddingBottom: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    color: theme.colors.secondary,
    fontSize: 15,
    fontWeight: '800',
  },
  // ── Sections ───────────────────────────────────────────────────────────
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: theme.colors.heading,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  chipRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChip: {
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderColor: 'rgba(255,179,0,0.2)',
  },
  categoryChipText: {
    color: '#F0C06B',
  },
  // ── Results ────────────────────────────────────────────────────────────
  resultsCount: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  storyList: {
    gap: 12,
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
    width: 96,
    minHeight: 130,
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
    fontSize: 10,
    fontWeight: '900',
  },
  storyCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  storyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyTitle: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 17,
    fontWeight: '900',
  },
  storyLocation: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  storySnippet: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  // ── Empty Results ──────────────────────────────────────────────────────
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyHint: {
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
});