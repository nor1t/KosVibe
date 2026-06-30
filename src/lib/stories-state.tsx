import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { SupportedLanguage } from '../i18n/messages';

export type StoryItem = {
  id: string;
  title: string;
  author: string;
  subtitle: string;
  body: string;
  image: string;
  location: string;
  category: string;
  readTime: string;
  postedAt: string;
  likes: number;
  views: number;
  isUserStory?: boolean;
  imageUri?: string;
};

type CreateStoryInput = {
  title: string;
  subtitle: string;
  body: string;
  location: string;
  category: string;
  image: string;
  postedAt?: string;
  imageUri?: string;
};

type StoriesContextValue = {
  createStory: (input: CreateStoryInput) => StoryItem;
  getStoryById: (storyId: string, language: SupportedLanguage) => StoryItem | undefined;
  getStories: (language: SupportedLanguage) => StoryItem[];
  imageTemplates: string[];
};

const STORIES_STORAGE_KEY = 'kosvibe.createdStories';
const StoriesContext = createContext<StoriesContextValue | undefined>(undefined);

const imageTemplates = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
];

const baseStories: Record<SupportedLanguage, StoryItem[]> = {
  en: [
    {
      id: 'story-1',
      title: 'Midnight in Prizren',
      author: '@streetvibes.xk',
      subtitle: 'A cinematic walk through river lights, food spots, and late-night chatter.',
      body:
        'Prizren changes after sunset. The bridge glows, the river gets louder, and every narrow street seems to point toward a warm table. This route starts at Shadervan, drifts toward old stone walls, then ends with late food and music near the square.',
      image: imageTemplates[0],
      location: 'Prizren',
      category: 'Night Walk',
      readTime: '3 min',
      postedAt: 'Tonight',
      likes: 248,
      views: 1900,
    },
    {
      id: 'story-2',
      title: 'Kosovo Coffee Trails',
      author: '@beansandbridges',
      subtitle: 'Warm cafes, gold-hour corners, and local stories behind every cup.',
      body:
        'The best Kosovo coffee days are slow: a morning espresso in Prishtina, a roadside macchiato before Peje, and a tiny table in Prizren as the light drops. This story collects the stops where the coffee is good and the room feels lived in.',
      image: imageTemplates[1],
      location: 'Prishtina, Peje, Prizren',
      category: 'Coffee',
      readTime: '4 min',
      postedAt: '2h ago',
      likes: 183,
      views: 1300,
    },
    {
      id: 'story-3',
      title: 'Icons After Rain',
      author: '@culturepulse',
      subtitle: 'How monuments, mist, and city sounds collide into one proud moodboard.',
      body:
        'Rain makes the stone brighter. The monuments feel quieter, the streets reflect every sign, and the city turns into a soft museum without walls. Save this for a cloudy afternoon when Kosovo feels especially cinematic.',
      image: imageTemplates[2],
      location: 'Kosovo',
      category: 'Culture',
      readTime: '5 min',
      postedAt: 'Yesterday',
      likes: 321,
      views: 2400,
    },
    {
      id: 'story-4',
      title: 'One Table, Six Friends',
      author: '@tabletalk.xk',
      subtitle: 'A dinner route built for sharing plates, dessert, and long conversations.',
      body:
        'Start with mezze, move into grilled plates, and leave room for cake. Kosovo dinners are at their best when the table is crowded and nobody is rushing. These are the places that turn dinner into the plan, not the stop before it.',
      image: imageTemplates[3],
      location: 'Prishtina',
      category: 'Food',
      readTime: '4 min',
      postedAt: '3 days ago',
      likes: 156,
      views: 980,
    },
  ],
  sq: [
    {
      id: 'story-1',
      title: 'Mesnate ne Prizren',
      author: '@streetvibes.xk',
      subtitle: 'Nje ecje kinematike mes dritave te lumit, ushqimit dhe bisedave te vona.',
      body:
        'Prizreni ndryshon pas perendimit. Ura ndricon, lumi degjohet me shume dhe cdo rruge e ngushte te con drejt nje tavoline te ngrohte. Rruga nis te Shadervani dhe perfundon me ushqim e muzike afer sheshit.',
      image: imageTemplates[0],
      location: 'Prizren',
      category: 'Ecje nate',
      readTime: '3 min',
      postedAt: 'Sonte',
      likes: 248,
      views: 1900,
    },
    {
      id: 'story-2',
      title: 'Shtigjet e kafes ne Kosove',
      author: '@beansandbridges',
      subtitle: 'Kafene te ngrohta, qoshe me drite te arte dhe histori lokale pas cdo filxhani.',
      body:
        'Ditet me te mira te kafes ne Kosove jane te ngadalta: espresso ne Prishtine, macchiato rruges per Peje dhe nje tavoline e vogel ne Prizren kur bie drita.',
      image: imageTemplates[1],
      location: 'Prishtine, Peje, Prizren',
      category: 'Kafe',
      readTime: '4 min',
      postedAt: '2h me pare',
      likes: 183,
      views: 1300,
    },
    {
      id: 'story-3',
      title: 'Ikonat pas shiut',
      author: '@culturepulse',
      subtitle: 'Monumente, mjegull dhe tinguj qyteti qe bashkohen ne nje atmosfere krenare.',
      body:
        'Shiu e ben gurin me te ndritshem. Monumentet duken me te qeta, rruget reflektojne dritat dhe qyteti kthehet ne nje muze te bute pa mure.',
      image: imageTemplates[2],
      location: 'Kosove',
      category: 'Kulture',
      readTime: '5 min',
      postedAt: 'Dje',
      likes: 321,
      views: 2400,
    },
    {
      id: 'story-4',
      title: 'Nje tavoline, gjashte shoke',
      author: '@tabletalk.xk',
      subtitle: 'Nje rruge darke per pjata te perbashketa, embelsire dhe biseda te gjata.',
      body:
        'Fillo me mezze, vazhdo me skare dhe ruaj vend per embelsire. Darkat ne Kosove jane me te mirat kur tavolina eshte plot dhe askush nuk ngutet.',
      image: imageTemplates[3],
      location: 'Prishtine',
      category: 'Ushqim',
      readTime: '4 min',
      postedAt: '3 dite me pare',
      likes: 156,
      views: 980,
    },
  ],
};

function createId() {
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [createdStories, setCreatedStories] = useState<StoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const restoreStories = async () => {
      try {
        const storedStories = await AsyncStorage.getItem(STORIES_STORAGE_KEY);

        if (isMounted && storedStories) {
          setCreatedStories(JSON.parse(storedStories) as StoryItem[]);
        }
      } catch {
        // Keep bundled stories if local storage is unavailable.
      }
    };

    void restoreStories();

    return () => {
      isMounted = false;
    };
  }, []);

  const createStory = useCallback((input: CreateStoryInput) => {
    const nextStory: StoryItem = {
      id: createId(),
      title: input.title.trim(),
      author: '@you',
      subtitle: input.subtitle.trim(),
      body: input.body.trim(),
      image: input.image,
      location: input.location.trim(),
      category: input.category.trim(),
      readTime: '2 min',
      postedAt: input.postedAt ?? 'Just now',
      likes: 0,
      views: 0,
      isUserStory: true,
      imageUri: input.imageUri,
    };

    setCreatedStories((current) => {
      const nextStories = [nextStory, ...current];
      void AsyncStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(nextStories)).catch(
        () => undefined
      );
      return nextStories;
    });

    return nextStory;
  }, []);

  const getStories = useCallback(
    (language: SupportedLanguage) => [...createdStories, ...baseStories[language]],
    [createdStories]
  );

  const getStoryById = useCallback(
    (storyId: string, language: SupportedLanguage) =>
      getStories(language).find((story) => story.id === storyId),
    [getStories]
  );

  const value = useMemo(
    () => ({
      createStory,
      getStoryById,
      getStories,
      imageTemplates,
    }),
    [createStory, getStoryById, getStories]
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export function useStories() {
  const context = useContext(StoriesContext);

  if (!context) {
    throw new Error('useStories must be used within StoriesProvider');
  }

  return context;
}
