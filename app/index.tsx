import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { LoadingState } from '@/src/components/LoadingState';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useAppState } from '@/src/lib/app-state';

export default function AppEntry() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useAppState();
  const { session } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)');
        return;
      }

      if (!session) {
        router.replace('/(auth)/sign-in');
        return;
      }

      router.replace('/(tabs)');
    }, 650);

    return () => clearTimeout(timeout);
  }, [hasCompletedOnboarding, router, session]);

  return (
    <LoadingState
      title="KosVibe"
      message="Finding the best restaurants, coffee spots, and hidden gems across Kosovo."
    />
  );
}
