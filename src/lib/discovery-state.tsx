import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { placesRepository } from '../repositories/placesRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import type { DiscoveryLocation } from '../repositories/types';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

type DiscoveryContextValue = {
  locationOptions: DiscoveryLocation[];
  selectedLocationId: string;
  selectedLocation: DiscoveryLocation;
  setSelectedLocationId: (locationId: string) => void;
  selectedCategory: 'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study' | null;
  setSelectedCategory: (category: DiscoveryContextValue['selectedCategory']) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  chatMessages: ChatMessage[];
  isAssistantTyping: boolean;
  sendMessage: (message: string) => void;
};

const DiscoveryContext = createContext<DiscoveryContextValue | undefined>(undefined);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildAssistantReply(message: string, selectedLocation: DiscoveryLocation) {
  const normalized = message.trim().toLowerCase();
  const visibleRestaurants = restaurantsRepository
    .getAll()
    .filter((restaurant) => (selectedLocation.city ? restaurant.city === selectedLocation.city : true));
  const mentionedRestaurant = visibleRestaurants.find((restaurant) =>
    normalized.includes(restaurant.name.toLowerCase())
  );

  if (mentionedRestaurant) {
    return `${mentionedRestaurant.name} is one of the strongest restaurant picks around ${selectedLocation.label}. It has a ${mentionedRestaurant.rating.toFixed(1)} rating, serves ${mentionedRestaurant.cuisine.toLowerCase()}, and you can open its card to book or explore more.`;
  }

  if (normalized.includes('book') || normalized.includes('reservation') || normalized.includes('table')) {
    const bestMatch = visibleRestaurants[0] ?? restaurantsRepository.getAll()[0];
    return `If you want to book something quickly, start with ${bestMatch.name}. Open the restaurant card and tap "Book a Table" to choose your date and time.`;
  }

  if (normalized.includes('special') || normalized.includes('offer') || normalized.includes('deal')) {
    const special = visibleRestaurants[0]?.todaySpecial;
    return special
      ? `A standout food deal in ${selectedLocation.label} is ${special.name} for ${special.price}. You can also browse the app sections for more current offers.`
      : 'For deals and promotions, the restaurant and activity sections are the best place to explore right now.';
  }

  if (normalized.includes('monument') || normalized.includes('nature') || normalized.includes('culture')) {
    return 'For monuments and nature, start with the Monuments & Nature section. It is the best path for Prizren Fortress, Stone Bridge, Rugova, and other cultural or scenic stops.';
  }

  if (normalized.includes('market') || normalized.includes('craft') || normalized.includes('rural')) {
    return 'The Rural Market page is the best place for family sellers, traditional food and drink, handmade objects, instruments, and clothing rooted in local culture.';
  }

  if (normalized.includes('event') || normalized.includes('night') || normalized.includes('party')) {
    return 'For nightlife and community energy, check the Events section. It is the best route for finding what feels active, social, and current in Kosovo.';
  }

  if (normalized.includes('history') || normalized.includes('kosova history') || normalized.includes('past')) {
    return 'If you want context before exploring, open the History of Kosova page. It gives a compact overview of heritage, identity, and key historical moments.';
  }

  if (normalized.includes('near') || normalized.includes('nearby') || normalized.includes('location') || normalized.includes('map')) {
    const names = visibleRestaurants.slice(0, 3).map((restaurant) => restaurant.name).join(', ');
    return `Around ${selectedLocation.label}, I would start with ${names}. The Explore map is the best tool if you want to see what is nearby in a more visual way.`;
  }

  if (normalized.includes('pizza') || normalized.includes('italian')) {
    return 'Pizza Napoli is one of the easiest pizza picks in the app if you want something casual, familiar, and easy to share.';
  }

  if (normalized.includes('traditional') || normalized.includes('kosovo')) {
    return 'For a traditional Kosovo experience, I would point you first to local food, monuments, village markets, and the history page. Pishat Restaurant is one of the strongest traditional food picks in the current app.';
  }

  return `I can help you discover Kosovo through food, monuments, nature, markets, events, and history. Try asking something like "best traditional food", "show me monuments", "where can I buy local crafts", or "what should I see in ${selectedLocation.label}".`;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    text: 'Hi, I am your KosVibe AI guide. I can help you discover Kosovo through food, culture, nature, village markets, and local experiences.',
  },
];

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<DiscoveryContextValue['selectedCategory']>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [, forceUpdate] = useState(0);
  const pendingReplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationOptions = placesRepository.getDiscoveryLocations();

  const selectedLocation =
    locationOptions.find((location) => location.id === selectedLocationId) ?? locationOptions[0];

  useEffect(() => {
    void placesRepository.refresh().then(() => {
      forceUpdate((current) => current + 1);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (pendingReplyRef.current) {
        clearTimeout(pendingReplyRef.current);
      }
    };
  }, []);

  const sendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim();

      if (!trimmed) {
        return;
      }

      if (pendingReplyRef.current) {
        clearTimeout(pendingReplyRef.current);
      }

      setChatMessages((current) => [
        ...current,
        {
          id: createId('user'),
          role: 'user',
          text: trimmed,
        },
      ]);
      setIsAssistantTyping(true);

      const reply = buildAssistantReply(trimmed, selectedLocation);

      pendingReplyRef.current = setTimeout(() => {
        setChatMessages((current) => [
          ...current,
          {
            id: createId('assistant'),
            role: 'assistant',
            text: reply,
          },
        ]);
        setIsAssistantTyping(false);
      }, 850);
    },
    [selectedLocation]
  );

  const value = useMemo<DiscoveryContextValue>(
    () => ({
      locationOptions,
      selectedLocationId,
      selectedLocation,
      setSelectedLocationId,
      selectedCategory,
      setSelectedCategory: (category) => setSelectedCategory(category),
      searchQuery,
      setSearchQuery,
      isChatOpen,
      openChat: () => setIsChatOpen(true),
      closeChat: () => setIsChatOpen(false),
      chatMessages,
      isAssistantTyping,
      sendMessage,
    }),
    [
      chatMessages,
      isAssistantTyping,
      isChatOpen,
      searchQuery,
      selectedLocation,
      selectedLocationId,
      selectedCategory,
      locationOptions,
      sendMessage,
    ]
  );

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);

  if (!context) {
    throw new Error('useDiscovery must be used within DiscoveryProvider');
  }

  return context;
}
