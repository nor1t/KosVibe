import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { messages, type MessageCatalog, type SupportedLanguage } from '@/src/i18n/messages';

type I18nContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  messages: MessageCatalog;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const LANGUAGE_STORAGE_KEY = 'kosvibe.language';

function isSupportedLanguage(language: string | null): language is SupportedLanguage {
  return language === 'en' || language === 'sq';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    let isMounted = true;

    const restoreLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (isMounted && isSupportedLanguage(storedLanguage)) {
          setLanguage(storedLanguage);
        }
      } catch {
        // Keep the default language if device storage is unavailable.
      }
    };

    void restoreLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    setLanguage(nextLanguage);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: updateLanguage,
      messages: messages[language],
    }),
    [language, updateLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
