import { supabase } from '../lib/supabase';
import type { SupportedLanguage } from '../i18n/messages';
import type { CreateStoryInput, IStoriesRepository, StoryItem } from './types';

/**
 * Sprint 6 — Database-backed Stories Repository
 *
 * All story data comes from the database via Supabase.
 * AsyncStorage has been removed. Base stories are seeded in DB.
 * User-created stories persist to the `stories` table.
 */

const imageTemplates = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
];

function buildStory(row: Record<string, unknown>): StoryItem {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    subtitle: row.subtitle as string,
    body: row.body as string,
    image: row.image_url as string,
    location: row.location as string,
    category: row.category as string,
    readTime: row.read_time as string,
    postedAt: row.posted_at as string,
    likes: (row.likes_count as number) ?? 0,
    views: (row.views_count as number) ?? 0,
    isUserStory: (row.is_user_story as boolean) ?? false,
    imageUri: (row.image_url as string) ?? undefined,
  };
}

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
    }

    this.initialized = true;
  }

  private async ensureReady(): Promise<void> {
    if (!this.initialized) {
      await this.refresh();
    }
  }

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

  createStory(input: CreateStoryInput): StoryItem {
    const tempId = `story-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = input.postedAt ?? 'Just now';

    const nextStory: StoryItem = {
      id: tempId,
      title: input.title.trim(),
      author: '@you',
      subtitle: input.subtitle.trim(),
      body: input.body.trim(),
      image: input.image,
      location: input.location.trim(),
      category: input.category.trim(),
      readTime: '2 min',
      postedAt: now,
      likes: 0,
      views: 0,
      isUserStory: true,
      imageUri: input.imageUri,
    };

    // Persist to DB in background
    void supabase
      .from('stories')
      .insert({
        title: nextStory.title,
        author: nextStory.author,
        subtitle: nextStory.subtitle,
        body: nextStory.body,
        image_url: nextStory.image,
        location: nextStory.location,
        category: nextStory.category,
        read_time: nextStory.readTime,
        posted_at: nextStory.postedAt,
        likes_count: nextStory.likes,
        views_count: nextStory.views,
        language: 'en',
        is_user_story: true,
        visibility: 'public',
        moderation_status: 'approved',
      })
      .then(({ data, error }) => {
        if (!error && data?.[0]) {
          // Update cache with real DB ID
          const dbStory = buildStory(data[0]);
          const enCache = this.baseStoriesCache.get('en') ?? [];
          this.baseStoriesCache.set('en', [dbStory, ...enCache]);
        }
      })
      .then(
        () => undefined,
        () => undefined
      );

    // Also add to cache immediately with temp ID
    const enCache = this.baseStoriesCache.get('en') ?? [];
    this.baseStoriesCache.set('en', [nextStory, ...enCache]);

    return nextStory;
  }

  getImageTemplates(): string[] {
    return imageTemplates;
  }

  async likeStory(storyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_likes')
      .insert({ story_id: storyId });

    return !error;
  }

  async unlikeStory(storyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_likes')
      .delete()
      .eq('story_id', storyId);

    return !error;
  }

  async addComment(storyId: string, body: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_comments')
      .insert({
        story_id: storyId,
        body,
        author_name: 'User',
      });

    return !error;
  }
}

export const storiesRepository = new StoriesRepository();