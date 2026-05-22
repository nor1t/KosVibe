import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { discoveryLocations, restaurants, type DiscoveryLocation } from '../data/mockData';

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
  const visibleRestaurants = restaurants.filter((restaurant) =>
    selectedLocation.city ? restaurant.city === selectedLocation.city : true
  );
  const mentionedRestaurant = visibleRestaurants.find((restaurant) =>
    normalized.includes(restaurant.name.toLowerCase())
  );

  if (mentionedRestaurant) {
    return `${mentionedRestaurant.name} has a ${mentionedRestaurant.rating.toFixed(1)} rating, serves ${mentionedRestaurant.cuisine.toLowerCase()}, and is ${mentionedRestaurant.distance} away. Open its card to book a table or check the menu.`;
  }

  if (
    normalized.includes('book') ||
    normalized.includes('reservation') ||
    normalized.includes('table')
  ) {
    const bestMatch = visibleRestaurants[0] ?? restaurants[0];
    return `The fastest option right now is ${bestMatch.name}. Open it and tap "Book a Table" to pick a date and time.`;
  }

  if (
    normalized.includes('special') ||
    normalized.includes('offer') ||
    normalized.includes('deal')
  ) {
    const special = visibleRestaurants[0]?.todaySpecial;
    return special
      ? `Today's standout offer in ${selectedLocation.label} is ${special.name} for ${special.price}. You can also check the Active Offers section for more promotions.`
      : 'The Active Offers section is the best place to check current deals right now.';
  }

  if (
    normalized.includes('near') ||
    normalized.includes('nearby') ||
    normalized.includes('location') ||
    normalized.includes('map')
  ) {
    const names = visibleRestaurants.slice(0, 3).map((restaurant) => restaurant.name).join(', ');
    return `Around ${selectedLocation.label}, I'd start with ${names}. The Map tab will show all matching places on a live map.`;
  }

  if (normalized.includes('pizza') || normalized.includes('italian')) {
    return 'Pizza Napoli is the strongest pizza pick in the list. It is great if you want something casual and easy to share.';
  }

  if (normalized.includes('traditional') || normalized.includes('kosovo')) {
    return 'For traditional Kosovo food, Pishat Restaurant is the best match. Its Tave Kosi special is the highlight in the current design.';
  }

  return `I can help you find restaurants in ${selectedLocation.label}, compare specials, or guide you to booking. Try asking for something like "best traditional food", "show me pizza", or "help me book a table".`;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    text: 'Hi, I am your KosVibe guide. I can help you find restaurants, discover monuments, or plan your next vibe in Kosovo.',
  },
];

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState('prishtine');
  const [selectedCategory, setSelectedCategory] = useState<DiscoveryContextValue['selectedCategory']>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const pendingReplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLocation =
    discoveryLocations.find((location) => location.id === selectedLocationId) ?? discoveryLocations[0];

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
      locationOptions: discoveryLocations,
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
