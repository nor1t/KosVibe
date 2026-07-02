import { supabase } from '../lib/supabase';
import type { SupportedLanguage } from '../i18n/messages';
import type { CreateStoryInput, IStoriesRepository, StoryItem } from './types';

/**
 * Sprint 6 — Database-backed Stories Repository
 *
 * All story data comes from the database via Supabase.
 * User-created stories persist to the `stories` table.
 * Cache is updated after every write so the UI stays in sync.
 *
 * Sprint 15 — Realtime sync: all connected clients receive instant updates
 * when stories are created, updated, or soft-deleted. Screens subscribe via
 * onChange() to re-render without manual refresh.
 */

export type StoriesChangeListener = () => void;

const imageTemplates = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
];

// ─── helpers ────────────────────────────────────────────────────────────────

function computeReadTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function buildStory(row: Record<string, unknown>): StoryItem {
  const createdAt = row.created_at ? new Date(row.created_at as string) : null;
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    subtitle: row.subtitle as string,
    body: row.body as string,
    image: row.image_url as string,
    location: row.location as string,
    category: row.category as string,
    readTime: (row.read_time as string) ?? computeReadTime((row.body as string) ?? ''),
    postedAt: createdAt ? relativeTime(createdAt) : (row.posted_at as string) ?? 'Just now',
    likes: (row.likes_count as number) ?? 0,
    views: (row.views_count as number) ?? 0,
    isUserStory: (row.is_user_story as boolean) ?? false,
    imageUri: (row.image_url as string) ?? undefined,
  };
}

// ─── repository ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000;

export class StoriesRepository implements IStoriesRepository {
  private baseStoriesCache = new Map<SupportedLanguage, StoryItem[]>();
  private initialized = false;
  private listeners = new Set<StoriesChangeListener>();
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private pollingCount = 0;

  /** Register a callback invoked whenever the local stories cache changes. */
  onChange(listener: StoriesChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /** Start background polling for story changes. Multiple callers are deduplicated. */
  startPolling(): void {
    this.pollingCount++;
    if (this.pollingTimer) return;
    this.pollingTimer = setInterval(() => {
      void this.pollForChanges();
    }, POLL_INTERVAL_MS);
  }

  /** Stop background polling. Polling only stops when all callers have called stop. */
  stopPolling(): void {
    this.pollingCount = Math.max(0, this.pollingCount - 1);
    if (this.pollingCount > 0) return;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private async pollForChanges(): Promise<void> {
    try {
      for (const lang of ['en', 'sq'] as const) {
        const { data, error } = await supabase
          .from('stories')
          .select('*, story_likes(count)')
          .eq('language', lang)
          .eq('visibility', 'public')
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false });

        if (error || !data) continue;

        const newCache = data
          .filter((row) => !row.deleted_at)
          .map((row) => {
            const story = buildStory(row as Record<string, unknown>);
            // Use real like count from the join if available, fall back to stored count
            const likesFromJoin = (row as Record<string, unknown>).story_likes as unknown as { count: number }[] | null;
            if (likesFromJoin && likesFromJoin.length > 0) {
              story.likes = likesFromJoin[0].count;
            }
            return story;
          });

        const oldCache = this.baseStoriesCache.get(lang) ?? [];
        const newIds = new Set(newCache.map((s) => s.id));
        const oldIds = new Set(oldCache.map((s) => s.id));
        const changed = newIds.size !== oldIds.size
          || [...newIds].some((id) => !oldIds.has(id))
          || newCache.some((s, i) => oldCache[i]?.id !== s.id || oldCache[i]?.likes !== s.likes);

        if (changed) {
          this.baseStoriesCache.set(lang, newCache);
          this.notifyListeners();
        }
      }
    } catch {
      // Silently ignore polling errors
    }
  }

  async refresh(): Promise<void> {
    const { data: enStories, error: enError } = await supabase
      .from('stories')
      .select('*')
      .eq('language', 'en')
      .eq('visibility', 'public')
      .eq('moderation_status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!enError && enStories) {
      this.baseStoriesCache.set('en', enStories.map(buildStory));
    } else {
      console.error('Failed to load en stories', enError);
    }

    const { data: sqStories, error: sqError } = await supabase
      .from('stories')
      .select('*')
      .eq('language', 'sq')
      .eq('visibility', 'public')
      .eq('moderation_status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!sqError && sqStories) {
      this.baseStoriesCache.set('sq', sqStories.map(buildStory));
    } else {
      console.error('Failed to load sq stories', sqError);
    }

    this.initialized = true;
    this.notifyListeners();
  }

  private async ensureReady(): Promise<void> {
    if (!this.initialized) await this.refresh();
  }

  // ─── reads ──────────────────────────────────────────────────────────────

  getStories(language: SupportedLanguage): StoryItem[] {
    return [...(this.baseStoriesCache.get(language) ?? [])];
  }

  async getStoriesAsync(language: SupportedLanguage): Promise<StoryItem[]> {
    await this.ensureReady();
    return this.getStories(language);
  }

  getStoryById(storyId: string, language: SupportedLanguage): StoryItem | undefined {
    return this.getStories(language).find((story) => story.id === storyId);
  }

  async getStoryByIdAsync(storyId: string, language: SupportedLanguage): Promise<StoryItem | undefined> {
    await this.ensureReady();
    return this.getStoryById(storyId, language);
  }

  // ─── writes ─────────────────────────────────────────────────────────────

  async createStory(input: CreateStoryInput): Promise<StoryItem> {
    const language: SupportedLanguage = (input.language === 'sq' ? 'sq' : 'en');
    const readTime = computeReadTime(input.body);

    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: input.title.trim(),
        author: input.authorName ?? input.authorId ?? 'Anonymous',
        subtitle: input.subtitle.trim(),
        body: input.body.trim(),
        image_url: input.image,
        location: input.location.trim(),
        category: input.category.trim(),
        read_time: readTime,
        language,
        is_user_story: true,
        visibility: 'public',
        moderation_status: 'approved',
        user_id: input.authorId ?? null,
        posted_at: null, // let created_at handle the real timestamp
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Failed to create story', error);
      throw error ?? new Error('Failed to create story');
    }

    const dbStory = buildStory(data);

    // Add to cache synchronously so the UI can read it immediately
    const cache = this.baseStoriesCache.get(language) ?? [];
    this.baseStoriesCache.set(language, [dbStory, ...cache]);

    return dbStory;
  }

  getImageTemplates(): string[] {
    return imageTemplates;
  }

  async likeStory(storyId: string, userId?: string): Promise<boolean> {
    const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;

    const { error } = await supabase.from('story_likes').insert({
      story_id: storyId,
      user_id: uid,
    });
    if (error) return false;

    // Update in-memory cache so the UI reflects the change immediately
    for (const [lang, stories] of this.baseStoriesCache) {
      const idx = stories.findIndex((s) => s.id === storyId);
      if (idx !== -1) {
        const updated = [...stories];
        updated[idx] = { ...updated[idx], likes: (updated[idx].likes ?? 0) + 1 };
        this.baseStoriesCache.set(lang, updated);
      }
    }

    return true;
  }

  async unlikeStory(storyId: string, userId?: string): Promise<boolean> {
    const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;

    const { error } = await supabase
      .from('story_likes')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', uid);
    if (error) return false;

    // Update in-memory cache so the UI reflects the change immediately
    for (const [lang, stories] of this.baseStoriesCache) {
      const idx = stories.findIndex((s) => s.id === storyId);
      if (idx !== -1) {
        const updated = [...stories];
        updated[idx] = { ...updated[idx], likes: Math.max(0, (updated[idx].likes ?? 0) - 1) };
        this.baseStoriesCache.set(lang, updated);
      }
    }

    return true;
  }

  async hasUserLikedStory(storyId: string, userId?: string): Promise<boolean> {
    const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;
    const { data, error } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', uid)
      .limit(1);
    return !error && (data?.length ?? 0) > 0;
  }

  async deleteStory(storyId: string): Promise<boolean> {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;
    const { error } = await supabase
      .from('stories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', storyId)
      .eq('user_id', uid);
    return !error;
  }

  async addComment(storyId: string, body: string, authorName?: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_comments')
      .insert({
        story_id: storyId,
        body,
        author_name: authorName || 'Community member',
      });
    return !error;
  }
}

export const storiesRepository = new StoriesRepository();
