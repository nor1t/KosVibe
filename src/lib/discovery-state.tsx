import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { placesRepository } from '../repositories/placesRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import type { DiscoveryLocation } from '../repositories/types';
import { eventsRepository } from '../repositories/eventsRepository';
import { sendGroqMessage } from './groq-client';

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
    async (message: string) => {
      const trimmed = message.trim();

      if (!trimmed) {
        return;
      }

      if (pendingReplyRef.current) {
        clearTimeout(pendingReplyRef.current);
      }

      const updatedMessages: ChatMessage[] = [
        ...chatMessages,
        {
          id: createId('user'),
          role: 'user',
          text: trimmed,
        },
      ];
      setChatMessages(updatedMessages);
      setIsAssistantTyping(true);

      // Build conversation history for the AI
      const history = updatedMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.text,
      }));

      const context = {
        selectedLocation: selectedLocation.label,
        availableRestaurants: restaurantsRepository
          .getAll()
          .filter((r) => (selectedLocation.city ? r.city === selectedLocation.city : true))
          .map((r) => r.name),
        availableHighlights: eventsRepository.getKosovoHighlights().map((h) => h.title),
      };

      try {
        const reply = await sendGroqMessage(trimmed, history, context);

        setChatMessages((current) => [
          ...current,
          {
            id: createId('assistant'),
            role: 'assistant',
            text: reply,
          },
        ]);
      } catch {
        // Fallback if Groq fails
        setChatMessages((current) => [
          ...current,
          {
            id: createId('assistant'),
            role: 'assistant',
            text: `I'm having trouble connecting right now. Try asking about restaurants, monuments, nature spots, or local markets in ${selectedLocation.label}.`,
          },
        ]);
      } finally {
        setIsAssistantTyping(false);
      }
    },
    [chatMessages, selectedLocation]
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
