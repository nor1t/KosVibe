import type { Session, User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/src/lib/supabase';
import { normalizeImageUri } from '@/src/lib/image-uri';
import { storiesRepository } from '@/src/repositories/StoriesRepository';
import { eventsRepository } from '@/src/repositories/eventsRepository';

type SignInParams = { email: string; password: string };
type SignUpParams = { fullName: string; email: string; password: string; accountType: 'consumer' | 'business' };
type UpdateProfileParams = { fullName: string; bio: string | null; avatarUrl: string | null };
type AccountType = 'consumer' | 'business' | 'super_admin';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthReady: boolean;
  accountType: AccountType;
  signInWithPassword: (params: SignInParams) => Promise<Session | null>;
  signUpWithPassword: (params: SignUpParams) => Promise<Session | null>;
  updateProfile: (params: UpdateProfileParams) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const accountType: AccountType = (session?.user?.user_metadata?.account_type as AccountType) ?? 'consumer';

  useEffect(() => {
    if (Platform.OS === 'web') return;
    supabase.auth.startAutoRefresh();
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh(); });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => { try { const { data: { session: s } } = await supabase.auth.getSession(); if (mounted) setSession(s); } finally { if (mounted) setIsAuthReady(true); } })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setIsAuthReady(true); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const value: AuthContextValue = {
    session, user: session?.user ?? null, isAuthReady, accountType,
    async signInWithPassword({ email, password }) { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; return data.session; },
    async signUpWithPassword({ fullName, email, password, accountType: at }) { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, account_type: at } } }); if (error) throw error; return data.session; },
    async updateProfile({ fullName, bio, avatarUrl }) {
      const safeUrl = normalizeImageUri(avatarUrl);
      const existing = (session?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const { data, error } = await supabase.auth.updateUser({ data: { ...existing, full_name: fullName.trim(), bio: bio?.trim() || null, avatar_url: safeUrl } });
      if (error) throw error;
      setSession((prev) => prev ? { ...prev, user: { ...prev.user, user_metadata: data.user.user_metadata } } : prev);
      return data.user;
    },
    async signOut() { await supabase.auth.signOut(); storiesRepository.reset(); eventsRepository.reset(); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}