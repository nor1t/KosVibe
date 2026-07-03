import type { Session, User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/src/lib/supabase';
import { normalizeImageUri } from '@/src/lib/image-uri';
import { storiesRepository } from '@/src/repositories/StoriesRepository';
import { eventsRepository } from '@/src/repositories/eventsRepository';

type SignInParams = {
  email: string;
  password: string;
};

type SignUpParams = {
  fullName: string;
  email: string;
  password: string;
  accountType: 'consumer' | 'business';
};

type UpdateProfileParams = {
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthReady: boolean;
  accountType: 'consumer' | 'business';
  signInWithPassword: (params: SignInParams) => Promise<Session | null>;
  signUpWithPassword: (params: SignUpParams) => Promise<Session | null>;
  updateProfile: (params: UpdateProfileParams) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const accountType: 'consumer' | 'business' =
    (session?.user?.user_metadata?.account_type as 'consumer' | 'business') ?? 'consumer';

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    supabase.auth.startAutoRefresh();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => appStateSubscription.remove();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(activeSession);
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isAuthReady,
    accountType,
    async signInWithPassword({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data.session;
    },
    async signUpWithPassword({ fullName, email, password, accountType: acctType }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: acctType,
          },
        },
      });

      if (error) {
        throw error;
      }

      return data.session;
    },
    async updateProfile({ fullName, bio, avatarUrl }) {
      const safeAvatarUrl = normalizeImageUri(avatarUrl);

      // Merge existing metadata to preserve account_type and any other fields
      const existingMeta = (session?.user?.user_metadata ?? {}) as Record<string, unknown>;

      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...existingMeta,
          full_name: fullName.trim(),
          bio: bio?.trim() || null,
          avatar_url: safeAvatarUrl,
        },
      });

      if (error) {
        throw error;
      }

      // Update local session so accountType stays in sync
      setSession((prev) => {
        if (!prev) return prev;
        return { ...prev, user: { ...prev.user, user_metadata: data.user.user_metadata } };
      });

      return data.user;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear all repository caches on logout to prevent data leakage
      storiesRepository.reset();
      eventsRepository.reset();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}