import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { SupportedLanguage } from '../i18n/messages';
import { storiesRepository } from '../repositories/StoriesRepository';
import type { CreateStoryInput, StoryItem } from '../repositories/types';

type StoriesContextValue = {
  createStory: (input: CreateStoryInput) => StoryItem;
  getStoryById: (storyId: string, language: SupportedLanguage) => StoryItem | undefined;
  getStories: (language: SupportedLanguage) => StoryItem[];
  imageTemplates: string[];
};

const StoriesContext = createContext<StoriesContextValue | undefined>(undefined);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    void storiesRepository.refresh().then(() => {
      forceUpdate((current) => current + 1);
    });
  }, []);

  const createStory = useCallback((input: CreateStoryInput) => {
    const nextStory = storiesRepository.createStory(input);
    forceUpdate((current) => current + 1);
    return nextStory;
  }, []);

  const getStories = useCallback((language: SupportedLanguage) => storiesRepository.getStories(language), []);

  const getStoryById = useCallback(
    (storyId: string, language: SupportedLanguage) => storiesRepository.getStoryById(storyId, language),
    []
  );

  return (
    <StoriesContext.Provider
      value={{
        createStory,
        getStoryById,
        getStories,
        imageTemplates: storiesRepository.getImageTemplates(),
      }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);

  if (!context) {
    throw new Error('useStories must be used within StoriesProvider');
  }

  return context;
}

export type { StoryItem };
