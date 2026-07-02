import { supabase } from '../lib/supabase';
import type { SupportedLanguage } from '../i18n/messages';
import type { CreateStoryInput, IStoriesRepository, StoryItem } from './types';

/**
 * Sprint 6 — Database-backed Stories Repository
 *
 * All story data comes from the database via Supabase.
 * User-created stories persist to the `stories` table.
 * Cache is updated after every write so the UI stays in sync.
 */

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

export class StoriesRepository implements IStoriesRepository {
  private baseStoriesCache = new Map<SupportedLanguage, StoryItem[]>();
  private initialized = false;

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
    return !error;
  }

  async unlikeStory(storyId: string, userId?: string): Promise<boolean> {
    const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;
    const { error } = await supabase
      .from('story_likes')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', uid);
    return !error;
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